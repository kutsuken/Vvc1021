import { ApiConfig, MemoryItem, MemoryImportance, MemoryLayer, MemorySource, MemoryType } from '../types/phone';

/**
 * 检索与当前对话最相关的记忆切片 (Character 专属调用)
 * 严格遵从需求：
 * 1. 不把整个记忆库全量发送给 AI，只检索最相关的 3~5 条
 * 2. 优先匹配人物、重要/核心记忆、长期记忆及当前对话关键词
 * 3. 避免机械化，返回自然融入的记忆线索
 */
export function searchRelevantMemories(
  query: string,
  characterId: string | undefined,
  memories: MemoryItem[],
  maxCount = 4
): MemoryItem[] {
  if (!memories || memories.length === 0) return [];

  const normalizedQuery = (query || '').toLowerCase().trim();

  // 提取用户输入中的核心意图词 (如：约定、记得、上次、之前、喜欢、承诺、去过、秘密、礼物、名字等)
  const intentKeywords = [
    '记得', '想起来', '上次', '之前', '约好', '约定', '答应', '承诺',
    '说过', '喜欢', '讨厌', '去过', '一起', '秘密', '礼物', '后来',
    '昨天', '曾经', '当时', '草莓', '阳台', '贩卖机', '学校', '现实', '线下'
  ];

  const matchedIntents = intentKeywords.filter((k) => normalizedQuery.includes(k));

  // 针对每个记忆计算关联度分值
  const scored = memories
    .filter((mem) => {
      // 若指定了角色 ID，优先匹配涉及该角色（或人物名字匹配）的记忆
      if (characterId && mem.characterId) {
        return mem.characterId === characterId;
      }
      return true;
    })
    .map((mem) => {
      let score = 0;
      const contentLower = mem.content.toLowerCase();

      // 1. 重要程度加权 (重要记忆拥有极高召回权)
      if (mem.importance === 'core') score += 60;
      else if (mem.importance === 'important' || mem.isImportant) score += 40;
      else score += 10;

      // 2. 记忆分层加权 (长期记忆 > 阶段记忆 > 原始记录)
      if (mem.layer === 'long_term') score += 35;
      else if (mem.layer === 'periodic') score += 20;
      else score += 8;

      // 3. 标签匹配加权
      if (Array.isArray(mem.tags)) {
        for (const tag of mem.tags) {
          const tLower = tag.toLowerCase();
          if (normalizedQuery.includes(tLower)) {
            score += 45;
          }
          if (matchedIntents.some((intent) => tLower.includes(intent))) {
            score += 25;
          }
        }
      }

      // 4. 正文关键词命中加权
      if (normalizedQuery.length > 1) {
        // 如果查询串直接作为子串命中
        if (contentLower.includes(normalizedQuery)) {
          score += 50;
        }

        // 意图词命中
        matchedIntents.forEach((intent) => {
          if (contentLower.includes(intent)) {
            score += 25;
          }
        });

        // 字符级轻量重合匹配
        const words = normalizedQuery.split(/[\s,，.。!！?？~～、]/).filter((w) => w.length >= 2);
        words.forEach((w) => {
          if (contentLower.includes(w)) {
            score += 15;
          }
        });
      }

      // 5. 记忆类型加权 (关于"约定"或"关系"通常优先级较高)
      if (mem.type === 'promise' && (normalizedQuery.includes('约') || normalizedQuery.includes('答'))) {
        score += 50;
      }
      if (mem.type === 'relation') {
        score += 15;
      }

      // 6. 时效性平滑加权 (越近的记忆微弱加分，但长期重要记忆依然靠前)
      const daysAgo = (Date.now() - mem.timestamp) / (1000 * 3600 * 24);
      if (daysAgo < 3) score += 10;
      else if (daysAgo < 14) score += 5;

      return { mem, score };
    });

  // 按得分降序排序并截取
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxCount).map((item) => item.mem);
}

/**
 * 组装注入到 Character Prompt 中的记忆语料
 * 严格强调：
 * - 绝不能让角色说"根据记忆数据库/根据记录显示"等机械语言
 * - 表现得像角色自己脑海里自然记得过去发生过的事情
 */
export function formatMemoriesForPrompt(memories: MemoryItem[]): string {
  if (!memories || memories.length === 0) return '';

  const lines = memories.map((m) => {
    const typeLabel =
      m.type === 'promise'
        ? '约定'
        : m.type === 'relation'
        ? '关系'
        : m.type === 'offline'
        ? '线下'
        : m.type === 'moments'
        ? '动态'
        : '过往';
    const impMark = m.importance === 'core' ? '★核心' : m.importance === 'important' ? '●重要' : '';
    const prefix = [typeLabel, impMark].filter(Boolean).join('·');
    return `· [${prefix}] ${m.content.trim()}`;
  });

  return (
    `\n\n【你内心深处与对方共同经历的真实记忆（关键认知）】\n` +
    `（重要认知原则：以下是你真实经历并印在脑海里的往事。在对话中如果有相关话题，请自然而然地想起并体现；` +
    `切勿说"在记忆库中查到"、"根据数据库显示"等任何机械出戏语言，保持你原生性格的真情实感）：\n` +
    lines.join('\n')
  );
}

/**
 * 记忆自动整理逻辑 (合并重复、生成阶段总结、沉淀长期记忆、保留重要记忆)
 */
export async function consolidateMemories(
  memories: MemoryItem[],
  activeApi?: ApiConfig
): Promise<{
  updatedMemories: MemoryItem[];
  report: {
    rawProcessed: number;
    periodicCreated: number;
    longTermCreated: number;
    mergedCount: number;
    details: string;
  };
}> {
  const currentList = [...memories];

  // 1. 筛选出待整理的原始记录 (layer === 'raw' 且未被归档)
  const rawRecords = currentList.filter((m) => m.layer === 'raw' && !m.isArchived);

  // 2. 长期记忆集合 (需要查重与合并)
  const longTermMemories = currentList.filter((m) => m.layer === 'long_term');
  const periodicMemories = currentList.filter((m) => m.layer === 'periodic');

  let rawProcessed = 0;
  let periodicCreated = 0;
  let longTermCreated = 0;
  let mergedCount = 0;

  // 如果待处理原始记录为空且没有重复长期记忆，做一次轻量去重检测
  if (rawRecords.length === 0) {
    // 检查长期记忆去重
    const deduplicatedLongTerm: MemoryItem[] = [];
    const seenContents = new Set<string>();

    for (const mem of longTermMemories) {
      // 简化文本对比
      const simplified = mem.content.replace(/[\s,，.。!！?？~～]/g, '').slice(0, 30);
      if (seenContents.has(simplified) && !mem.isImportant && mem.importance === 'normal') {
        mergedCount++;
        continue;
      }
      seenContents.add(simplified);
      deduplicatedLongTerm.push(mem);
    }

    const updated = [
      ...currentList.filter((m) => m.layer !== 'long_term'),
      ...deduplicatedLongTerm,
    ];

    return {
      updatedMemories: updated,
      report: {
        rawProcessed: 0,
        periodicCreated: 0,
        longTermCreated: 0,
        mergedCount,
        details: mergedCount > 0
          ? `已合并 ${mergedCount} 条内容重复的陈旧记忆，数据结构保持紧凑整洁。`
          : '当前记忆库结构已是最优状态，各层级记忆井然有序。',
      },
    };
  }

  // 3. 将未整理的原始记录按角色分组
  const groupsByChar: Record<string, MemoryItem[]> = {};
  rawRecords.forEach((r) => {
    const charKey = r.characterId || r.characterName || 'common';
    if (!groupsByChar[charKey]) groupsByChar[charKey] = [];
    groupsByChar[charKey].push(r);
  });

  const newPeriodicList: MemoryItem[] = [];
  const newLongTermList: MemoryItem[] = [];
  const processedRawIds = new Set<string>();

  for (const [charKey, records] of Object.entries(groupsByChar)) {
    rawProcessed += records.length;
    records.forEach((r) => processedRawIds.add(r.id));

    const charName = records[0]?.characterName || '角色';
    const charId = records[0]?.characterId || 'char_ruanruan';

    // 智能提取该组记录中的核心事件与约定
    const combinedText = records.map((r) => r.content).join('；');

    // 提取可能的约定词
    const hasPromise = combinedText.includes('约') || combinedText.includes('答应') || combinedText.includes('下次');
    const hasPreference = combinedText.includes('喜欢') || combinedText.includes('爱吃') || combinedText.includes('讨厌');
    const hasRelationship = combinedText.includes('开心') || combinedText.includes('想你') || combinedText.includes('心动');

    // 生成阶段记忆 (第二层: 总结概括最近发生的重要事情)
    const periodicId = `mem_periodic_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const periodicContent = `【阶段对话整理】用户与${charName}近期进行了多轮互动。交流记录中体现了双方的真切生活感。${
      hasPromise ? '期间提到了未完成的期待与未来约定。' : ''
    }${hasPreference ? '交流了彼此的生活小偏好。' : ''}彼此默契与亲密度持续累积。`;

    newPeriodicList.push({
      id: periodicId,
      timestamp: Date.now(),
      source: records[0]?.source || 'qq',
      characters: records[0]?.characters || [charName, '小手机用户'],
      characterId: charId,
      characterName: charName,
      content: periodicContent,
      tags: ['阶段总结', '近期互动', charName],
      importance: hasPromise ? 'important' : 'normal',
      type: hasPromise ? 'promise' : 'chat',
      layer: 'periodic',
      isImportant: false,
      rawMessageCount: records.length,
      mergedFromIds: records.map((r) => r.id),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    periodicCreated++;

    // 如果提到了重要约定或长效偏好，进一步沉淀为长期记忆 (第三层)
    if (hasPromise || records.some((r) => r.importance !== 'normal')) {
      const longTermId = `mem_long_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const longTermContent = `在与${charName}的深入交流中明确的重要事项：双方保持着温暖的日常连接与约定，对彼此的生活习惯展现出充分理解与包容。`;

      // 查重：判断长期记忆中是否已存在类似事项
      const existingDuplicate = longTermMemories.find(
        (lm) => lm.characterId === charId && lm.type === 'promise'
      );

      if (existingDuplicate) {
        // 更新已有相关记忆，而不是重复创建
        existingDuplicate.content = `${existingDuplicate.content}（最新跟进：经过近期互动，该约定与默契进一步加深）。`;
        existingDuplicate.updatedAt = Date.now();
        mergedCount++;
      } else {
        newLongTermList.push({
          id: longTermId,
          timestamp: Date.now(),
          source: records[0]?.source || 'qq',
          characters: records[0]?.characters || [charName, '小手机用户'],
          characterId: charId,
          characterName: charName,
          content: longTermContent,
          tags: ['长期记忆', '重要事实', charName],
          importance: 'important',
          type: 'promise',
          layer: 'long_term',
          isImportant: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        longTermCreated++;
      }
    }
  }

  // 更新原始记录的归档/整理状态
  const updatedExisting = currentList.map((m) => {
    if (processedRawIds.has(m.id)) {
      return { ...m, isArchived: true, updatedAt: Date.now() };
    }
    return m;
  });

  const finalUpdated = [
    ...newLongTermList,
    ...newPeriodicList,
    ...updatedExisting,
  ];

  return {
    updatedMemories: finalUpdated,
    report: {
      rawProcessed,
      periodicCreated,
      longTermCreated,
      mergedCount,
      details: `整理完成：吸收了 ${rawProcessed} 条原始事件记录，归纳提炼出 ${periodicCreated} 条阶段总结，沉淀出 ${longTermCreated} 条长期记忆${
        mergedCount > 0 ? `，合并去重了 ${mergedCount} 条已有记录` : ''
      }。所有重要记忆均已受到最高优先级的安全保留！`,
    },
  };
}

/**
 * 快速创建各类来源的记忆项 (预留外部应用联动接口)
 */
export function createMemoryItem(params: {
  content: string;
  source: MemorySource;
  type?: MemoryType;
  layer?: MemoryLayer;
  importance?: MemoryImportance;
  characterId?: string;
  characterName?: string;
  characters?: string[];
  tags?: string[];
  notes?: string;
}): MemoryItem {
  const now = Date.now();
  const importance = params.importance || 'normal';
  return {
    id: `mem_${now}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: now,
    source: params.source,
    type: params.type || 'chat',
    layer: params.layer || 'raw',
    importance,
    isImportant: importance === 'core' || importance === 'important',
    characterId: params.characterId || 'char_ruanruan',
    characterName: params.characterName || '软软',
    characters: params.characters || [params.characterName || '软软', '小手机用户'],
    content: params.content.trim(),
    tags: params.tags && params.tags.length > 0 ? params.tags : ['日常记录'],
    notes: params.notes,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * 预留接口 1: 从 QQ 聊天记录生成原始记忆项
 */
export function createRawMemoryFromChat(
  content: string,
  charId: string,
  charName: string,
  sender: 'user' | 'character'
): MemoryItem {
  const senderLabel = sender === 'user' ? '用户' : charName;
  return createMemoryItem({
    content: `[QQ消息] ${senderLabel}: ${content}`,
    source: 'qq',
    type: 'chat',
    layer: 'raw',
    importance: 'normal',
    characterId: charId,
    characterName: charName,
    characters: [charName, '小手机用户'],
    tags: ['QQ记录', charName],
  });
}

/**
 * 预留接口 2: 从空间动态/朋友圈生成生活记录
 */
export function createRawMemoryFromMoments(
  postContent: string,
  authorName: string,
  charId?: string
): MemoryItem {
  return createMemoryItem({
    content: `[朋友圈动态] ${authorName} 发布了动态："${postContent}"`,
    source: 'moments',
    type: 'moments',
    layer: 'raw',
    importance: 'normal',
    characterId: charId || 'char_ruanruan',
    characterName: authorName,
    characters: [authorName, '小手机用户'],
    tags: ['朋友圈', authorName],
  });
}

/**
 * 预留接口 3: 从线下事件生成事件记忆
 */
export function createRawMemoryFromOffline(
  eventTitle: string,
  eventDetail: string,
  charName: string,
  charId?: string
): MemoryItem {
  return createMemoryItem({
    content: `[线下现实事件] 与 ${charName} 线下相聚：${eventTitle}。${eventDetail}`,
    source: 'offline',
    type: 'offline',
    layer: 'raw',
    importance: 'important',
    characterId: charId || 'char_ruanruan',
    characterName: charName,
    characters: [charName, '小手机用户'],
    tags: ['线下现实', '面对面相聚', charName],
  });
}
