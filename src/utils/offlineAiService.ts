import { ApiConfig, CharacterPersona, PresetItem, UserProfile, WorldBookItem } from '../types/phone';
import { OfflineConfig, OfflineInviteInfo, OfflineMessage } from '../types/offline';
import { sendChat, getActivePresetsForChar } from './aiService';

/**
 * 组装线下互动专属 System Prompt
 * 深度集成：字数范围限制、人称设定、视角设定、防转述、防扮演玩家、额外世界书/预设、上下文继承
 */
export function buildOfflineSystemPrompt(
  char: CharacterPersona,
  config: OfflineConfig,
  mode: 'direct' | 'invite',
  inviteInfo?: OfflineInviteInfo,
  chatContextSummary?: string,
  userProfile?: UserProfile,
  allPresets: PresetItem[] = [],
  allWorldBooks: WorldBookItem[] = [],
  allPersonas: CharacterPersona[] = []
): string {
  const userName = userProfile?.username || userProfile?.nickname || userProfile?.name || '你';
  const charName = char.name;

  // 1. 基础角色人设
  let prompt = `【角色扮演与场景核心】\n你正在线下现实世界中与用户（${userName}）面对面相聚相伴互动。
你的身份是角色「${charName}」${char.remarks ? `（${char.remarks}）` : ''}。
你的角色人设与性格特征：
${char.personaPrompt.trim()}

【玩家角色信息】
玩家称呼/网名：${userName}
${userProfile?.identity ? `身份设定：${userProfile.identity}` : ''}
${userProfile?.bio ? `个性签名：${userProfile.bio}` : ''}
${userProfile?.gender ? `性别：${userProfile.gender}` : ''}
`;

  // 1.1 协同参与的其他角色
  if (config.participatingCharIds && config.participatingCharIds.length > 0) {
    const participating = allPersonas.filter((p) => config.participatingCharIds?.includes(p.id) && p.id !== char.id);
    if (participating.length > 0) {
      prompt += `\n【协同出场/共同参与角色（同台互动）】：\n`;
      participating.forEach((p) => {
        prompt += `· 角色「${p.name}」${p.remarks ? `（${p.remarks}）` : ''}：${p.personaPrompt.trim()}\n`;
      });
      prompt += `请将共同出场的角色自然融入现场情境、对话交流与互动神态中。\n`;
    }
  }

  if (config.allowDynamicCharacters) {
    prompt += `\n【动态角色融入】：允许在剧情合理需要时（如现场偶遇、敲门打招呼、共同好友出现等），让其他角色或路人自然登场推进小说情节。\n`;
  }

  // 1.2 定制写作指导
  if (config.writingGuidance && config.writingGuidance.trim()) {
    prompt += `\n【用户定制本场写作指导要求（全局最高执行准则）】：
${config.writingGuidance.trim()}
请在全篇描写中贯彻落实上述写作指导要求！\n`;
  }

  // 2. 线下相聚场景与前情上下文
  if (mode === 'invite' && inviteInfo) {
    prompt += `\n【线下相聚约定情境】
这是一次正式的线下约定相聚：
· 约定时间：${inviteInfo.time}
· 约定地点：${inviteInfo.location}
· 相聚活动：${inviteInfo.activity}
${inviteInfo.note ? `· 邀约备忘：${inviteInfo.note}` : ''}
当前双方已经如约来到了约定的现实地点，开始面对面的真实互动。\n`;
  } else {
    prompt += `\n【线下相聚情境：承接线上聊天上下文】
双方直接进入线下现实生活空间面对面。
${
  chatContextSummary
    ? `【承接的前置线上聊天记录】：\n${chatContextSummary}\n双方在线上刚刚聊过以上话题，现在自然过渡到了线下见面相处，情绪和共同回忆紧密相连。\n`
    : `双方结束了手机线上发消息，现在正在线下现实中面对面陪伴相聚。\n`
}`;
  }

  // 3. 篇幅字数控制
  prompt += `\n【篇幅与字数强制要求】
每次输出的正文字数请严格控制在 ${config.minWords} 字 到 ${config.maxWords} 字 之间。
内容应层次分明，情节与互动推进自然充实，不过分简略，也不无端冗长。\n`;

  // 4. 叙事体裁与人称设定 (默认内置小说体裁，角色用名字而非「我」，不要写出体裁标签)
  prompt += `\n【体裁与叙事核心铁律】
1. 【小说形式而非对话列表】：
输出必须是生动沉浸的文学小说形式，而不是简单的网聊对白或一问一答的对话形式。将动作神态、五感环境、心理波澜与对白自然融汇在小说篇章中；
2. 【角色全部使用名字指代，绝不用第一人称「我」】：
在所有的叙述、动作和旁白中，角色的指代必须使用各自的具体名字（例如「${charName}」和「${userName}」），绝不允许角色在叙述中使用第一人称「我」来指代自身；
3. 【严禁输出任何体裁标签或元说明】：
绝对不要在输出正文中写出诸如「【小说形式】」、「【第三人称】」、「【场景】」等任何说明性文字或元标签！直接优雅地输出小说正文剧情。\n`;

  // 人称与视角具体配置补充
  const personMap = {
    first: '第一人称（若非用户特殊要求，仍优先使用名字指代）',
    second: '第二人称（以「你」叙述玩家的所见所感）',
    third: `第三人称（以名字「${charName}」与「${userName}」指代进行小说叙述）`,
  };
  prompt += `【人称设定】：采用 ${personMap[config.narrativePerson] || personMap.third}。\n`;

  const perspectiveMap = {
    user: `用户视角（以玩家「${userName}」的所见、所闻、所感展开叙述）`,
    character: `ta的视角（以角色「${charName}」的感受、眼波流转与微妙心绪为主视角展开）`,
    omniscient: '全知视角（小说全局全知视角，兼顾双方的神态反差、微动作以及周围环境氛围）',
  };
  prompt += `【视角设定】：必须采用 ${perspectiveMap[config.perspective] || perspectiveMap.omniscient}。\n`;

  // 5. 核心开关规则约束
  prompt += `\n【核心行为守则与互动开关】\n`;
  if (!config.allowPlayUser) {
    prompt += `1. 【绝对禁止替玩家代打/发言】：严禁扮演玩家「${userName}」，严禁代替玩家说话、替玩家做选择或做出未明确的重大行动。玩家的反应全部由玩家在下一次输入中自主决定！\n`;
  } else {
    prompt += `1. 【适度互动推演】：在描写中可顺畅推演现场自然的日常互动与自然默契反应。\n`;
  }

  if (config.preventParaphrase) {
    prompt += `2. 【防止转述与复述】：严禁在回复开头或过程中复述、转述玩家上一句说的话，严禁重复已知设定，直接根据玩家的动作与话语做出新的神态、肢体反应或小说推进！\n`;
  }

  if (config.enablePsychology) {
    prompt += `3. 【细腻心理活动】：在描写中展现「${charName}」的心情起伏、羞涩或动摇等内心独白。你可以使用 <thought>角色的细腻内心想法与情绪波动</thought> 标签放置角色的内心真实念头，随后进行正常的动作与语言描写。\n`;
  }

  if (config.enableActionDetail) {
    prompt += `4. 【神态动作微描写】：强化对眼神交汇、指尖微动、身体重心倾斜、语调起伏、呼吸轻重的微动作刻画。\n`;
  }

  if (config.enableEnvironmentSensory) {
    prompt += `5. 【五感环境氛围】：结合现实环境中的光线斑驳、风声、杯沿温度、空气中的香气等真实五感描写。\n`;
  }

  // 6. 预设注入 (注入用户选择生效的预设)
  const selectedPresetIds = new Set(config.boundPresetIds || []);
  const effectivePresets = allPresets.filter((p) => selectedPresetIds.has(p.id));
  if (effectivePresets.length > 0) {
    prompt += `\n【当前生效的对话与交互预设 (共 ${effectivePresets.length} 项)】\n`;
    effectivePresets.forEach((p) => {
      if (p.systemPrompt) {
        prompt += `· [预设] ${p.name}：\n${p.systemPrompt.trim()}\n`;
      }
    });
  }

  // 7. 世界书注入 (注入用户选择生效的世界书)
  const selectedWorldBookIds = new Set(config.boundWorldBookIds || []);
  const effectiveWorldBooks = allWorldBooks.filter((wb) => selectedWorldBookIds.has(wb.id));
  if (effectiveWorldBooks.length > 0) {
    prompt += `\n【当前生效的现实环境与世界书规则 (共 ${effectiveWorldBooks.length} 本)】\n`;
    effectiveWorldBooks.forEach((wb) => {
      if (wb.entries && wb.entries.length > 0) {
        wb.entries.forEach((entry) => {
          if (entry.isEnabled !== false && entry.content) {
            prompt += `· [${wb.name}] ${entry.name}：${entry.content.trim()}\n`;
          }
        });
      }
    });
  }

  if (config.enableBranchOptions) {
    prompt += `\n【走向选项输出指示】：
在小说正文结尾最后，请严格使用 <options> 标签生成3个各具吸引力、能推动剧情发展的玩家行动分支选项（格式如下，不要在正文掺杂）：
<options>
1. 选项一描写或台词
2. 选项二描写或台词
3. 选项三描写或台词
</options>\n`;
  }

  prompt += `\n【输出风格】排版通透优雅，对白自然融入小说情境，旁白描写自然分段，生动真实，极富小说沉浸感。严禁输出任何与剧情无关的体裁说明文字。`;

  return prompt;
}

/**
 * 解析带有 <thought> 与 <options> 的模型输出
 */
export function parseOfflineResponse(rawText: string): {
  content: string;
  thought?: string;
  wordCount: number;
  branchOptions?: string[];
} {
  let thought: string | undefined;
  let branchOptions: string[] | undefined;
  let content = rawText;

  // 1. 提取走向选项
  const optionsMatch = content.match(/<options>([\s\S]*?)<\/options>/i);
  if (optionsMatch) {
    const rawOpts = optionsMatch[1].trim();
    content = content.replace(/<options>[\s\S]*?<\/options>/gi, '').trim();
    const parsedList = rawOpts
      .split('\n')
      .map((line) => line.replace(/^[\d+.)、\-*#\s]+/, '').trim())
      .filter((line) => line.length > 0);
    if (parsedList.length > 0) {
      branchOptions = parsedList.slice(0, 3);
    }
  }

  // 2. 提取心声独白
  const thoughtMatch = content.match(/<thought>([\s\S]*?)<\/thought>/i);
  if (thoughtMatch) {
    thought = thoughtMatch[1].trim();
    content = content.replace(/<thought>[\s\S]*?<\/thought>/gi, '').trim();
  }

  // 去除多余代码块包裹
  content = content.replace(/^```markdown\s*/i, '').replace(/```\s*$/i, '').trim();

  // 严禁输出与小说无关的标签/元说明（例如模型误输出的【小说形式】等）
  content = content.replace(/^【(?:小说形式|小说体裁|小说模式|小说风格|第三人称|全知视角|场景设定|线下互动)】\s*/gim, '').trim();
  content = content.replace(/^\[(?:小说形式|小说体裁|小说模式|第三人称)\]\s*/gim, '').trim();

  // 统计中文字数与词数
  const wordCount = content.replace(/\s+/g, '').length;

  return { content, thought, wordCount, branchOptions };
}

/**
 * 生成角色的邀约答复 (接受或拒绝判定)
 */
export async function generateOfflineInviteResponse(
  char: CharacterPersona,
  inviteInfo: Omit<OfflineInviteInfo, 'status' | 'characterResponse' | 'createdAt'>,
  userProfile?: UserProfile,
  apiConfig?: ApiConfig | null
): Promise<{ accepted: boolean; response: string }> {
  const userName = userProfile?.username || userProfile?.nickname || userProfile?.name || '你';

  const systemPrompt = `你是角色「${char.name}」${char.remarks ? `（${char.remarks}）` : ''}。
你的角色设定：
${char.personaPrompt}

现在用户（${userName}）向你发起了一次线下相聚的邀约：
· 邀约时间：${inviteInfo.time}
· 邀约地点：${inviteInfo.location}
· 相聚活动：${inviteInfo.activity}
${inviteInfo.note ? `· 附加留言：${inviteInfo.note}` : ''}

【你的任务】
请完全按照你的角色性格特征、好感与态度，决定【接受】还是【拒绝】这次邀约，并写出一段生动的角色的真实口吻答复。
除非该邀约极为荒谬或严重违背你的核心底线，正常情况下应给予积极配合的回复（可以是傲娇答应、欣喜答应、害羞答应等符合你性格的口吻）。

请严格按照以下 JSON 格式输出，不要输出任何其他内容：
{
  "accepted": true,
  "response": "角色回复的话语（保留角色独特的语气词与微表情神态）"
}`;

  if (!apiConfig || !apiConfig.isActive) {
    // 离线兜底拟真回复
    const defaultAccepts = [
      `（眼睛微微亮了一下，随后故作镇定地轻咳一声）……既然你都特意邀请我了，那、那我就勉为其难答应好啦！${inviteInfo.time}在${inviteInfo.location}，记得不准迟到哦！`,
      `哇！${inviteInfo.activity}吗？好想去！${inviteInfo.time}我一定准时在${inviteInfo.location}等你，不见不散呀 ♡`,
      `（微微弯起眼角）好呀，我也正想找个时间和你面对面坐坐呢。${inviteInfo.time}，我们在${inviteInfo.location}见。`,
    ];
    return {
      accepted: true,
      response: defaultAccepts[Math.floor(Math.random() * defaultAccepts.length)],
    };
  }

  try {
    const raw = await sendChat(
      apiConfig,
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `我向你发起了线下邀约，请回应我。` },
      ],
      undefined
    );

    // 尝试解析 JSON
    const jsonMatch = raw.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        accepted: Boolean(parsed.accepted),
        response: String(parsed.response || '好呀，我们线下见！'),
      };
    }

    // 若不是严格 JSON，根据词义判断
    const isAccepted = !raw.includes('拒绝') && !raw.includes('不去') && !raw.includes('抱歉');
    return {
      accepted: isAccepted,
      response: raw.replace(/```json/g, '').replace(/```/g, '').trim(),
    };
  } catch (err) {
    console.warn('AI 邀约回应请求异常，采用角色贴合兜底：', err);
    return {
      accepted: true,
      response: `（眨了眨眼，收下邀约）好的呀！${inviteInfo.time}，我们在${inviteInfo.location}见~ 记得穿暖和一点！`,
    };
  }
}
