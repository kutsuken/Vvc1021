import { ApiConfig, CharacterPersona, PresetItem, StickerItem, WorldBook, WorldBookItem, MemoryItem, CharacterChatSettings, UserProfile } from '../types/phone';
import { searchRelevantMemories, formatMemoriesForPrompt } from './memoryService';

// 第一步：去掉首尾空格、去掉结尾多余的斜杠 (手册 Part 4)
export function normalizeUrl(raw: string): string {
  return (raw || '').trim().replace(/\/+$/, '');
}

// 第二步：根据地址是否已经带 /v1，生成候选地址列表 (手册 Part 4)
export function getCandidates(rawUrl: string): string[] {
  const base = normalizeUrl(rawUrl);
  if (!base) return [];
  if (base.endsWith('/v1')) {
    return [base];
  }
  return [base, `${base}/v1`];
}

// 友好的报错提示：把错误翻译成人话 (手册 Part 4)
export function friendlyError(e: any): string {
  const msg = e?.message || String(e || '');
  if (msg.includes('Requests ending with a model turn') || msg.includes('model turn are not supported')) {
    return '请先向TA发送一句话，角色才能顺畅回复你哦~';
  }
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('CORS')) {
    return '网络连接异常，请检查网络或稍后再试';
  }
  if (msg.includes('401') || msg.includes('403') || msg.includes('Incorrect API key') || msg.includes('Unauthorized')) {
    return 'AI 密钥验证失败，请在设置中检查密钥配置';
  }
  if (msg.includes('429') || msg.includes('Rate limit') || msg.includes('quota')) {
    return 'AI 思考太频繁或额度受限，请稍等几秒再试~';
  }
  if (msg.includes('返回结果为空') || msg.includes('models not found') || msg.includes('404')) {
    return '未找到该模型，请在设置中确认模型名称';
  }
  // 如果是 JSON 字符串，尝试解析其中的 message
  try {
    const jsonMatch = msg.match(/\{.*?\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed?.error?.message) {
        return `提示: ${parsed.error.message.slice(0, 80)}`;
      }
    }
  } catch {
    // ignore
  }
  return `服务提示: ${msg.slice(0, 80)}`;
}

// 拉取模型列表 (带候选地址遍历与代理兜底)
export async function fetchModelList(rawUrl: string, key: string): Promise<string[]> {
  const candidates = getCandidates(rawUrl);
  let lastError: any = null;

  for (const base of candidates) {
    try {
      // 优先直接请求，若因浏览器 CORS 失败则通过安全代理重试
      let res: Response;
      try {
        res = await fetch(`${base}/models`, {
          headers: { Authorization: `Bearer ${key}` },
        });
      } catch (directErr) {
        // 尝试通过代理重试
        res = await fetch('/api/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: `${base}/models`,
            method: 'GET',
            headers: { Authorization: `Bearer ${key}` },
          }),
        });
      }

      if (!res.ok) {
        lastError = new Error(`HTTP ${res.status}`);
        continue;
      }

      const data = await res.json();
      const rawList = data.data || data.models || [];
      if (Array.isArray(rawList) && rawList.length > 0) {
        return rawList
          .map((item: any) => (typeof item === 'string' ? item : item.id || item.name))
          .filter(Boolean);
      }
      lastError = new Error('返回结果为空');
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError || new Error('拉取模型失败，请检查地址和密钥');
}

// 统一发送对话请求 (手册 Part 4，支持 AbortSignal 暂停/中止与多预设融合调参)
export async function sendChat(
  config: ApiConfig,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  signal?: AbortSignal,
  presetOrPresets?: PresetItem | PresetItem[]
): Promise<string> {
  const activeList: PresetItem[] = Array.isArray(presetOrPresets)
    ? presetOrPresets.filter((p) => (p.isEnabled !== undefined ? p.isEnabled : p.isGlobalActive))
    : presetOrPresets
    ? [presetOrPresets]
    : [];

  // 计算温度与最大生成长度 (若有多个生效预设，取加权平均或上限)
  let finalTemp = config.temperature ?? 0.8;
  let finalMaxTokens: number | undefined;
  let finalTopP: number | undefined;

  if (activeList.length > 0) {
    const sumTemp = activeList.reduce((acc, p) => acc + (p.temperature ?? 0.85), 0);
    finalTemp = parseFloat((sumTemp / activeList.length).toFixed(2));
    const tokenLimits = activeList.map((p) => p.maxTokens).filter(Boolean) as number[];
    if (tokenLimits.length > 0) {
      finalMaxTokens = Math.max(...tokenLimits);
    }
    const topPList = activeList.map((p) => p.topP).filter(Boolean) as number[];
    if (topPList.length > 0) {
      finalTopP = topPList[0];
    }
  }

  // 如果是内置免配置 AI 服务或未配置自定义 key 时的内置项
  if (config.id === 'builtin_gemini' || config.provider === 'Gemini' && config.key === 'BUILTIN') {
    try {
      const res = await fetch('/api/built-in-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          temperature: finalTemp,
          maxTokens: finalMaxTokens,
        }),
        signal,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`内置服务异常 (${res.status}): ${errText.slice(0, 100)}`);
      }
      const data = await res.json();
      return data.choices?.[0]?.message?.content || data.text || '';
    } catch (e) {
      throw e;
    }
  }

  // 自定义外部 API 供应商
  const candidates = getCandidates(config.url);
  let lastError: any = null;

  for (const base of candidates) {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }
    try {
      let res: Response;
      const payload: Record<string, any> = {
        model: config.model || 'gpt-4o-mini',
        messages,
        temperature: finalTemp,
      };
      if (finalMaxTokens) payload.max_tokens = finalMaxTokens;
      if (finalTopP !== undefined) payload.top_p = finalTopP;

      try {
        // 先直接 fetch
        res = await fetch(`${base}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.key}`,
          },
          body: JSON.stringify(payload),
          signal,
        });
      } catch (directErr: any) {
        if (directErr?.name === 'AbortError' || signal?.aborted) {
          throw directErr;
        }
        // 遇到浏览器 CORS 时自动走代理转发
        res = await fetch('/api/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: `${base}/chat/completions`,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${config.key}`,
            },
            body: payload,
          }),
          signal,
        });
      }

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`API 错误 ${res.status}: ${errText.slice(0, 200)}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content ?? '';
      return content;
    } catch (e: any) {
      if (e?.name === 'AbortError' || signal?.aborted) {
        throw e;
      }
      lastError = e;
    }
  }

  throw lastError || new Error('对话请求发送失败');
}

// 筛选出对当前角色生效的预设清单 (支持多选启用或零个生效，严格区分全局与角色专属)
export function getActivePresetsForChar(
  allPresets: PresetItem[],
  charId: string
): PresetItem[] {
  if (!allPresets || allPresets.length === 0) return [];

  return allPresets.filter((p) => {
    // 1. 判断是否开启 (兼容 isEnabled 与旧版 isGlobalActive)
    const enabled = p.isEnabled !== undefined ? p.isEnabled : Boolean(p.isGlobalActive);
    if (!enabled) return false;

    // 2. 判断范围：全局预设直接对所有角色生效
    if (p.scope === 'global' || !p.scope) return true;

    // 3. 非全局(角色专属)：如果指定了绑定角色，必须包含当前角色；未指定则默认生效
    if (p.boundCharacterIds && p.boundCharacterIds.length > 0) {
      return p.boundCharacterIds.includes(charId);
    }
    return true;
  });
}

export interface ActiveWorldBookEntry {
  id?: string;
  bookName: string;
  name: string;
  content: string;
  priority: number;
}

// 取出某个角色实际生效的世界书词条列表 (支持整本世界书 + 词条结构，严格按全局与局部划分)
export function getActiveWorldBookEntries(
  char: CharacterPersona,
  allWorldBooks: WorldBookItem[],
  contextText?: string
): ActiveWorldBookEntry[] {
  if (!allWorldBooks || allWorldBooks.length === 0) return [];
  const results: ActiveWorldBookEntry[] = [];

  for (const book of allWorldBooks) {
    if (book.isEnabled === false) continue;

    // 仅分为全局和局部：
    // 全局：对所有角色默认通用生效
    // 局部：必须与当前角色绑定
    const isGlobal = book.scope === 'global';
    const isLocalBound =
      book.scope === 'local' &&
      ((book.boundCharacterIds && book.boundCharacterIds.includes(char.id)) ||
        (char.boundWorldBookIds && char.boundWorldBookIds.includes(book.id)) ||
        (!book.boundCharacterIds || book.boundCharacterIds.length === 0));

    if (!isGlobal && !isLocalBound) continue;

    // 若包含 entries 列表 (整本世界书模型)
    if (Array.isArray(book.entries)) {
      for (const entry of book.entries) {
        if (entry.isEnabled === false) continue;

        let finalPriority = entry.priority ?? 80;

        if (entry.activationType === 'keyword') {
          // 仅关键词触发：未命中则不装载
          if (!entry.triggerKeys || entry.triggerKeys.length === 0 || !contextText) continue;
          const lower = contextText.toLowerCase();
          const hit = entry.triggerKeys.some(
            (k) => k && k.trim() && lower.includes(k.trim().toLowerCase())
          );
          if (!hit) continue;
        } else if (entry.activationType === 'both') {
          // 常驻加关键词：始终生效装载！如果命中关键词则强化提升优先级
          if (contextText && entry.triggerKeys && entry.triggerKeys.length > 0) {
            const lower = contextText.toLowerCase();
            const hit = entry.triggerKeys.some(
              (k) => k && k.trim() && lower.includes(k.trim().toLowerCase())
            );
            if (hit) {
              finalPriority += 25; // 关键词命中加权强化
            }
          }
        }
        // activationType === 'always': 常驻开，直接生效

        results.push({
          id: entry.id,
          bookName: book.name,
          name: entry.name,
          content: entry.content,
          priority: finalPriority,
        });
      }
    } else if ((book as any).content) {
      // 兼容旧版扁平词条
      const flat = book as any;
      if (flat.activationType === 'keyword' && flat.triggerKeys && flat.triggerKeys.length > 0) {
        if (!contextText) continue;
        const lower = contextText.toLowerCase();
        const hit = flat.triggerKeys.some(
          (k: string) => k && k.trim() && lower.includes(k.trim().toLowerCase())
        );
        if (!hit) continue;
      }
      results.push({
        id: flat.id,
        bookName: flat.name,
        name: flat.name,
        content: flat.content,
        priority: flat.priority ?? 80,
      });
    }
  }

  return results.sort((a, b) => b.priority - a.priority);
}

// 兼容别名
export function getActiveWorldBooks(
  char: CharacterPersona,
  allWorldBooks: WorldBookItem[],
  contextText?: string
): any[] {
  return getActiveWorldBookEntries(char, allWorldBooks, contextText);
}

// 让 AI 认识当前表情库 (手册 Part 6)
export function buildStickerHint(stickers: StickerItem[]): string {
  if (!stickers || stickers.length === 0) {
    return '（当前没有可用表情包，请仅使用自然文字表达，不要输出 [表情:xxx] 标记）';
  }
  const names = stickers.map(s => s.name).join(' / ');
  return `如果想发表情，格式必须是严格的 [表情:名字]。
表情名必须从下面这份清单里一字不差地选，绝不能自己编造不存在的名字；如果都不合适就不要发表情，用文字表达就好：
${names}`;
}

// 组装完整的 System Prompt (手册 Part 5 + Part 6 + 多预设/零预设灵活叠加 + 角色记忆中枢检索 + 聊天专属设置与权限)
export function buildSystemPrompt(
  char: CharacterPersona,
  allWorldBooks: WorldBookItem[],
  stickers: StickerItem[],
  presetOrPresets?: PresetItem | PresetItem[],
  recentContext?: string,
  memories?: MemoryItem[],
  chatSettings?: CharacterChatSettings,
  userProfile?: UserProfile
): string {
  // 合并额外启用的世界书
  let effectiveWorldBooks = allWorldBooks;
  if (chatSettings?.extraWorldBookIds && chatSettings.extraWorldBookIds.length > 0) {
    const extraSet = new Set(chatSettings.extraWorldBookIds);
    effectiveWorldBooks = allWorldBooks.map((wb) =>
      extraSet.has(wb.id) ? { ...wb, isEnabled: true } : wb
    );
  }

  const activeEntries = getActiveWorldBookEntries(char, effectiveWorldBooks, recentContext);
  const worldSection = activeEntries.length > 0
    ? `\n\n【世界设定与记忆守则，仅供你理解背景，必须遵守守则，不要复述或提及这是"设定"】\n` +
      activeEntries.map(e => `· [${e.bookName}] ${e.name}：${e.content}`).join('\n')
    : '';

  const stickerSection = `\n\n【表情包互动规范】\n` + buildStickerHint(stickers);

  // 检索并注入当前角色最相关的记忆（仅检索3~4条最相关的记忆，自然融入对话）
  let memorySection = '';
  if (memories && memories.length > 0) {
    const relevantMemories = searchRelevantMemories(recentContext || '', char.id, memories, 4);
    if (relevantMemories.length > 0) {
      memorySection = formatMemoriesForPrompt(relevantMemories);
    }
  }

  // 整理当前生效的预设集合 (支持 0 个或多个生效，支持单独绑定线上预设)
  let basePresetList = Array.isArray(presetOrPresets) ? presetOrPresets : presetOrPresets ? [presetOrPresets] : [];
  if (chatSettings?.boundOnlinePresetId) {
    const boundPreset = basePresetList.find((p) => p.id === chatSettings.boundOnlinePresetId);
    if (boundPreset) {
      boundPreset.isEnabled = true;
    }
  }

  const activePresets: PresetItem[] = basePresetList.filter(
    (p) =>
      (p.isEnabled !== undefined ? p.isEnabled : p.isGlobalActive) &&
      (p.scope === 'global' || p.boundCharacterIds?.includes(char.id) || p.id === chatSettings?.boundOnlinePresetId)
  );

  let presetSection = '';
  let formatGuide = '';
  let postPromptSection = '';

  if (activePresets.length > 0) {
    // 1. 拼接所有生效预设的 System Prompt
    const promptBlocks = activePresets
      .filter((p) => p.systemPrompt?.trim())
      .map((p) => {
        const sceneLabel = p.scene === 'offline' ? '线下现实' : '线上网络';
        const scopeLabel = p.scope === 'local' ? '角色专属' : '全局通用';
        return `◆ [${scopeLabel}·${sceneLabel}] ${p.name}：\n${p.systemPrompt.trim()}`;
      });

    if (promptBlocks.length > 0) {
      presetSection = `\n\n【当前生效的对话交互预设 (共 ${promptBlocks.length} 项生效)】\n` + promptBlocks.join('\n\n');
    }

    // 2. 汇集所有生效预设的格式规则
    const allowAction = activePresets.some((p) => p.formatRules?.allowAction);
    const allowThought = activePresets.some((p) => p.formatRules?.allowThought);
    const noImpersonation = activePresets.some((p) => p.formatRules?.noImpersonation);
    const multiBubble = activePresets.some((p) => p.formatRules?.chatBubbleStyle === 'multi');

    const guides: string[] = [];
    if (allowAction) guides.push('可以使用全角括号（...）描摹动作、神态或现场小动作');
    if (allowThought) guides.push('可以使用全角方括号【...】展现角色的内心活动或隐秘独白');
    if (noImpersonation) guides.push('严禁代替对方发言，严禁替对方代写台词或替对方做出决定');
    if (multiBubble) guides.push('像真实手机即时通讯一样，短句为主，鼓励分段连续输出');

    if (guides.length > 0) {
      formatGuide = `\n\n【输出格式与行为准则】\n` + guides.map((g, idx) => `${idx + 1}. ${g}`).join('\n');
    }

    // 3. 拼接所有生效预设的 Post Prompt
    const postBlocks = activePresets
      .filter((p) => p.postPrompt?.trim())
      .map((p) => `· ${p.name} 指令：${p.postPrompt?.trim()}`);

    if (postBlocks.length > 0) {
      postPromptSection = `\n\n【重要执行约束与防出戏法则】\n` + postBlocks.join('\n');
    }
  }

  // 4. 专属聊天设置与角色权限规则注入
  let customSettingsGuide = '';
  if (chatSettings) {
    const dynamicGuides: string[] = [];

    // 每轮输出气泡数控制
    if (chatSettings.customBubbleCountEnabled && chatSettings.customBubbleCount > 0) {
      dynamicGuides.push(`【单轮输出气泡数铁律】：本次回复必须严格切分成恰好 ${chatSettings.customBubbleCount} 个短消息气泡（使用连续空行分隔输出不同气泡），绝不多发或少发！`);
    }

    // 短气泡回复
    if (chatSettings.shortBubbleReply) {
      dynamicGuides.push('【短气泡即时通讯】：保持年轻人手打发QQ习惯，每条气泡10~25字左右的日常口语短句为主，短促即时，严禁长篇大论');
    }

    // 语音条发送能力
    if (chatSettings.voiceReplyMode && chatSettings.voiceReplyMode !== 'off') {
      const toneMap = {
        sweet: '软萌少女音',
        tsundere: '傲娇甜妹音',
        cool: '清冷御姐音',
        gentle: '温柔正太音',
        lively: '阳光少年音',
      };
      const toneLabel = toneMap[chatSettings.voiceTone] || '软萌甜妹音';
      dynamicGuides.push(`【发送语音条能力】：可以在适宜时刻发送语音消息，格式为 [语音: 语音文字]，音色风格：${toneLabel}`);
    }

    // 表情包频率控制
    if (chatSettings.stickerFrequency === 'off') {
      dynamicGuides.push('【表情包约束】：本轮严禁发送任何 [表情: xxx] 标签');
    } else if (chatSettings.stickerFrequency === 'high') {
      dynamicGuides.push('【表情包偏好】：积极高频发送配图表情包 [表情: xxx]');
    }

    // 颜文字与Emoji频率控制
    if (chatSettings.emojiFrequency === 'high') {
      dynamicGuides.push('【颜文字与Emoji偏好】：高频使用萌系颜文字如 (*/ω＼*)、(｡♥‿♥｡)、(｀・ω・´) 与生动emoji ✨🥺🍬');
    } else if (chatSettings.emojiFrequency === 'off' || chatSettings.emojiFrequency === 'low') {
      dynamicGuides.push('【颜文字与Emoji控制】：尽量少用或完全不使用颜文字与emoji符号');
    }

    // 头像感知权限
    if (chatSettings.allowSeeUserAvatar && userProfile?.avatar) {
      dynamicGuides.push(`【对方头像感知】：你完全能够看见对方使用的头像是「${userProfile.avatar}」，可在对话中适时夸赞、调侃或提起对方的头像`);
    }

    // 允许ai生图/发送照片
    if (chatSettings.allowAiImageGeneration) {
      dynamicGuides.push('【生图与照片分享】：在分享风景、自拍或生活细节时，可发送 [图片: 画面描述] 或 [自拍: 画面描述]');
    }

    // 表情包识图
    if (chatSettings.recognizeUserStickers) {
      dynamicGuides.push('【表情包识图能力】：对方发来表情包或图片时，请积极识别画面中的表情神态与情绪梗，做出趣味互动');
    }

    // 允许ta主动约你线下
    if (chatSettings.allowProactiveOfflineInvite) {
      dynamicGuides.push('【主动线下邀约能力】：聊到尽兴或想见面时，可向对方发起线下约会，格式：[线下邀约: 时间|地点|活动内容]');
    }

    // 允许ta主动打电话/发视频
    if (chatSettings.allowProactiveCall) {
      dynamicGuides.push('【主动通话能力】：在思念对方或想直接通话时，可向对方发起通话，格式：[拨打电话: 语音通话|邀约理由]');
    }

    // 允许ta自行完全下线
    if (chatSettings.allowSelfOffline) {
      dynamicGuides.push('【生活作息与自行下线】：如果深夜该睡觉、上课或有事断网，可告知对方后自主下线，格式：[状态切换: 离线|下线原因]');
    }

    if (dynamicGuides.length > 0) {
      customSettingsGuide = `\n\n【当前聊天的个性化配置与权限法则】\n` + dynamicGuides.map((g, idx) => `${idx + 1}. ${g}`).join('\n');
    }
  }

  const basePrompt = `你是手机通讯录里的角色「${char.name}」${char.remarks ? `（${char.remarks}）` : ''}。
你的角色设定：
${char.personaPrompt}

【对话核心要求】
1. 请完全沉浸在该角色中，保持其独特的口吻、性格、语调与情感反应。
2. 你是在用手机即时通讯软件（类似QQ）与对方一对一聊天，语气自然生活化，像真实好友一样发消息，不要像生硬的AI问答助手。
3. 请记住上方世界设定的所有守则并严格遵照执行。`;

  return `${basePrompt}${memorySection}${presetSection}${formatGuide}${customSettingsGuide}${worldSection}${stickerSection}${postPromptSection}`;
}

// 解析 AI 输出并拆分成文字气泡与表情包图片、语音条等 (手册 Part 6 + 避雷兜底 + 聊天权限拓展)
export function parseReplyToMessages(
  rawText: string,
  stickerLib: StickerItem[],
  chatSettings?: CharacterChatSettings
): Array<{
  type: 'text' | 'sticker' | 'voice';
  content: string;
  sticker?: StickerItem;
  voiceText?: string;
  voiceDuration?: number;
  stickerUrl?: string;
  stickerName?: string;
}> {
  // 1. 如果开启了自定义气泡数，且文本包含段落或空行，先尝试按自然分段切割
  let chunks: string[] = [rawText];
  if (chatSettings?.customBubbleCountEnabled && chatSettings.customBubbleCount > 1) {
    const rawSplits = rawText
      .split(/\n{2,}|\r\n\r\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (rawSplits.length >= 2) {
      chunks = rawSplits;
    }
  }

  const parts: Array<{
    type: 'text' | 'sticker' | 'voice';
    content: string;
    sticker?: StickerItem;
    voiceText?: string;
    voiceDuration?: number;
    stickerUrl?: string;
    stickerName?: string;
  }> = [];

  for (const chunk of chunks) {
    // 检查语音条：[语音: ...]
    const voiceMatch = chunk.match(/\[语音[:：]\s*([^\]]+)\]/);
    if (voiceMatch) {
      const vText = voiceMatch[1].trim();
      const vDuration = Math.max(2, Math.min(18, Math.ceil(vText.length / 2.8)));
      parts.push({
        type: 'voice',
        content: `[语音 ${vDuration}"]`,
        voiceText: vText,
        voiceDuration: vDuration,
      });
      continue;
    }

    // 检查自拍/图片：[自拍: ...] 或 [图片: ...]
    const photoMatch = chunk.match(/\[(?:自拍|图片)[:：]\s*([^\]]+)\]/);
    if (photoMatch) {
      const photoDesc = photoMatch[1].trim();
      // 生成优雅的日系粉紫色调插图占位/生图
      const photoSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220" width="320" height="220">
          <defs>
            <linearGradient id="bgGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#2d163f"/>
              <stop offset="50%" stop-color="#4a1c58"/>
              <stop offset="100%" stop-color="#1a0c25"/>
            </linearGradient>
          </defs>
          <rect width="320" height="220" rx="16" fill="url(#bgGlow)"/>
          <circle cx="160" cy="90" r="46" fill="#ff8ecb" opacity="0.25"/>
          <circle cx="160" cy="85" r="28" fill="#ffd1dc" opacity="0.8"/>
          <path d="M110 180 Q160 135 210 180" fill="#ff8ecb" opacity="0.6"/>
          <text x="160" y="195" font-family="sans-serif" font-size="12" fill="#ffb6d9" font-weight="bold" text-anchor="middle">📷 拍摄与分享 · ${photoDesc.slice(0, 14)}</text>
        </svg>
      `.trim())}`;

      parts.push({
        type: 'sticker',
        content: `[图片]`,
        stickerName: photoDesc.slice(0, 12),
        stickerUrl: photoSvg,
      });
      continue;
    }

    // 检查表情包：[表情: ...]
    const regex = /\[表情[:：]\s*([^\]]+)\]/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(chunk)) !== null) {
      const before = chunk.slice(lastIndex, match.index).trim();
      if (before) {
        parts.push({ type: 'text', content: before });
      }

      const name = match[1].trim();
      const sticker = stickerLib.find(s => s.name === name);

      if (sticker) {
        parts.push({ type: 'sticker', content: match[0], sticker });
      } else {
        parts.push({ type: 'text', content: match[0] });
      }

      lastIndex = regex.lastIndex;
    }

    const rest = chunk.slice(lastIndex).trim();
    if (rest) {
      const cleanedRest = rest.replace(/\[表情[:：][^\]]*$/, '').trim();
      if (cleanedRest) {
        parts.push({ type: 'text', content: cleanedRest });
      }
    }
  }

  // 限制气泡上限 (若设置了限制)
  if (chatSettings?.customBubbleCountEnabled && chatSettings.customBubbleCount > 0 && parts.length > chatSettings.customBubbleCount) {
    return parts.slice(0, chatSettings.customBubbleCount);
  }

  return parts.length > 0 ? parts : [{ type: 'text', content: rawText }];
}

// AI 辅助角色人设润色
export async function polishPersonaWithAI(
  draft: string,
  charName: string,
  config: ApiConfig
): Promise<string> {
  const prompt = `你是一位顶级的治愈系角色设定润色大师。
请将用户给出的简短角色设定草稿润色丰富为一份鲜活、丰满、极具沉浸感的角色人设（约 150-280 字）。
包含：性格特质、说话口癖/常用语气词、对你的微妙态度、偶尔露出的反差小习惯。
要求：文笔细腻治愈、有生活感，直接输出润色后的设定正文，不要附带任何开场白、总结语或多余解释。

角色名字：${charName || '小角色'}
原设定草稿：
${draft}`;

  return await sendChat(config, [
    { role: 'system', content: '你是角色设定润色专家，请直接输出润色后的正文。' },
    { role: 'user', content: prompt },
  ]);
}

// AI 辅助世界书词条设定润色
export async function polishWorldBookEntryWithAI(
  entryName: string,
  draftContent: string,
  config: ApiConfig,
  bookName?: string
): Promise<string> {
  const prompt = `你是一位顶级的二次元世界观架构师与小说设定润色专家。
请将给出的世界书词条草稿，润色丰富为一段生动、具体、有氛围感且逻辑清晰的设定正文（约 120-220 字）。
词条概念：${entryName || '未命名概念'}
所属世界书：${bookName || '设定集'}
原设定草稿：
${draftContent || '（暂无草稿，请根据词条概念自由发挥契合手机治愈系世界观的细腻设定）'}

润色要求：
1. 增加生动具体的细节（比如动作反应、触觉/味觉细节、生活习性、禁忌或小秘密）；
2. 保持生活化、情感共鸣与沉浸感，严禁空洞生硬的说明书腔；
3. 直接输出润色后的设定正文内容，不要附带任何开场白、问候语或解释。`;

  return await sendChat(config, [
    { role: 'system', content: '你是世界书设定润色大师，请直接输出润色后的设定正文。' },
    { role: 'user', content: prompt },
  ]);
}
