export type ProviderType = 'OpenAI' | 'Gemini' | 'Claude' | 'DeepSeek' | 'OpenRouter' | 'Custom';

export interface ApiConfig {
  id: string;
  name: string;
  provider: ProviderType;
  url: string;
  key: string;
  model: string;
  temperature: number;
  isActive: boolean;
}

export interface WebpageApp {
  id: string;
  name: string;
  url: string;
  iconType: 'url' | 'base64' | 'default';
  iconData?: string;
  createdAt: number;
}

export interface WorldBookEntry {
  id: string;
  name: string; // 词条标题 / 概念名
  content: string; // 词条设定正文
  isEnabled?: boolean; // 词条启停开关
  activationType?: 'always' | 'keyword' | 'both'; // 1. 常驻开; 2. 关键词触发; 3. 常驻+关键词
  triggerKeys?: string[]; // 触发关键词列表
  priority?: number; // 优先级 1~100
  comment?: string; // 备忘注释
  createdAt: number;
}

export interface WorldBook {
  id: string;
  name: string; // 整本世界书名称 (如《小手机治愈世界基本法》、《软软的秘密日记》)
  description?: string; // 世界书简介 / 背景概要
  scope: 'global' | 'local'; // 仅分为：全局 (所有角色通用) vs 局部 (角色专属)
  boundCharacterIds?: string[]; // 局部世界书绑定的专属角色 ID
  isEnabled?: boolean; // 整本书启用开关
  entries: WorldBookEntry[]; // 该世界书所包含的词条清单
  createdAt: number;
  // 兼容旧字段
  content?: string;
  folder?: string;
  tags?: string[];
  activationType?: 'always' | 'keyword';
  triggerKeys?: string[];
  priority?: number;
}

// 兼容别名
export type WorldBookItem = WorldBook;

export type PresetCategory = 'dialogue' | 'rule' | 'format' | 'novel' | 'jailbreak' | 'custom';
export type PresetScope = 'global' | 'local'; // 全局通用 vs 非全局(角色专属)
export type PresetScene = 'online' | 'offline'; // 线上(手机聊天/网络社交) vs 线下(现实面对面/具象生活描写)

export interface PresetFormatRules {
  allowThought: boolean; // 允许内心独白 【...】
  allowAction: boolean; // 允许动作神态描摹 （...）
  chatBubbleStyle: 'single' | 'multi' | 'natural'; // 气泡切分模式
  noImpersonation: boolean; // 严禁替用户回答
  stickerFrequency: 'high' | 'normal' | 'low' | 'off'; // 表情包触发偏好
}

export interface PresetItem {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean; // 是否启用：支持勾选开启多个预设，或全部关闭为0个
  scope: PresetScope; // 全局 (所有角色默认生效) vs 非全局 (仅对指定专属角色生效)
  scene: PresetScene; // 线上 (聊天/短句/网聊气泡) vs 线下 (现实面对面/动作神态/小说实态)
  boundCharacterIds?: string[]; // 仅在 scope='local' (非全局) 时生效的角色绑定清单
  category?: PresetCategory; // 辅助类别
  isGlobalActive?: boolean; // 兼容旧字段
  systemPrompt: string; // 核心系统设定提示词
  postPrompt?: string; // 强化约束 / Jailbreak / 结尾防出戏
  temperature: number; // 0.1 ~ 2.0
  topP?: number; // 0.1 ~ 1.0
  frequencyPenalty?: number; // -2.0 ~ 2.0
  presencePenalty?: number; // -2.0 ~ 2.0
  maxTokens?: number; // 最大生成长度
  historyRounds?: number; // 附带聊天轮数
  formatRules?: PresetFormatRules;
  createdAt: number;
  updatedAt: number;
}

export interface CharacterPersona {
  id: string;
  name: string;
  remarks: string;
  avatar: string; // base64 or preset identifier
  personaPrompt: string;
  boundWorldBookIds: string[];
  createdAt: number;
  chatSettings?: CharacterChatSettings;
}

export interface StickerItem {
  id: string;
  name: string;
  url: string; // base64
  isGlobal: boolean;
}

export type MessageType = 'text' | 'sticker' | 'voice' | 'system';

export interface QuotedMessageInfo {
  id: string;
  senderName: string;
  content: string;
}

export interface ChatMessage {
  id: string;
  characterId: string;
  sender: 'user' | 'character' | 'system';
  type: MessageType;
  content: string;
  stickerUrl?: string;
  stickerName?: string;
  voiceDuration?: number;
  voiceText?: string;
  timestamp: number;
  quote?: QuotedMessageInfo;
  isRecalled?: boolean;
}

export interface ChannelReply {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  timestamp: number;
}

export interface ChannelPost {
  id: string;
  category: '趣事' | '日常' | '树洞' | '安利' | '讨论';
  title: string;
  content: string;
  authorName: string;
  authorAvatar: string;
  timestamp: number;
  likes: number;
  replies: ChannelReply[];
}

export interface QzoneComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  timestamp: number;
}

export interface QzoneFeed {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  imageUrl?: string;
  timestamp: number;
  likes: string[];
  comments: QzoneComment[];
  deviceTag?: string;
  badgeDecoration?: string;
  vipTag?: string;
}

export type PageId =
  | 'desktop'
  | 'settings'
  | 'settings_ai'
  | 'settings_ai_edit'
  | 'settings_other'
  | 'warehouse'
  | 'warehouse_add'
  | 'warehouse_edit'
  | 'personas'
  | 'personas_create'
  | 'personas_edit'
  | 'qq'
  | 'qq_chat'
  | 'worldbook'
  | 'worldbook_create'
  | 'worldbook_edit'
  | 'preset'
  | 'preset_create'
  | 'preset_edit'
  | 'appearance'
  | 'offline'
  | 'memory'
  | 'memory_detail'
  | 'memory_create'
  | 'user'
  | 'user_edit';

// 记忆来源
export type MemorySource = 'qq' | 'moments' | 'offline' | 'manual' | 'system' | 'other';

// 记忆类型 (聊天、朋友圈、线下、关系、约定、生活事件、其他)
export type MemoryType = 'chat' | 'moments' | 'offline' | 'relation' | 'promise' | 'event' | 'other';

// 重要程度 (普通、重要、核心)
export type MemoryImportance = 'normal' | 'important' | 'core';

// 记忆层级 (第一层: 原始记录, 第二层: 阶段记忆, 第三层: 长期记忆)
export type MemoryLayer = 'raw' | 'periodic' | 'long_term';

// 记忆核心数据模型
export interface MemoryItem {
  id: string; // 唯一标识
  timestamp: number; // 发生时间 (用于按时间排序与展示)
  source: MemorySource; // 记忆来源 (qq | moments | offline | manual | system | other)
  characters: string[]; // 涉及人物列表 (如 ['软软', '小手机用户'])
  characterId?: string; // 主关联角色 ID (如 'char_ruanruan')
  characterName?: string; // 主关联角色名 (如 '软软')
  content: string; // 记忆正文描述
  tags: string[]; // 检索标签 (如 ['约定', '草莓药水', '教学楼'])
  importance: MemoryImportance; // 重要程度 ('normal' | 'important' | 'core')
  type: MemoryType; // 记忆类型 ('chat' | 'moments' | 'offline' | 'relation' | 'promise' | 'event' | 'other')
  layer: MemoryLayer; // 记忆分层 ('raw' 原始记录 | 'periodic' 阶段总结 | 'long_term' 长期记忆)
  isImportant?: boolean; // 是否已标记为重要记忆 (拥有最高保留权，整理时不自动删除)
  createdAt: number; // 创建时间戳
  updatedAt: number; // 最后更新时间戳
  rawMessageCount?: number; // 阶段总结所涵盖的消息/事件计数
  mergedFromIds?: string[]; // 合并前置记忆的 ID 列表 (用于追溯去重)
  isArchived?: boolean; // 是否已归档
  notes?: string; // 用户手动补充备忘
}

export interface UserProfile {
  id: string; // ID: 123456 (可修改)
  username: string; // 网名: 小手机用户 (主页优先显示)
  name: string; // 姓名
  nickname: string; // 昵称
  identity: string; // 身份 (由职业修改而来)
  bio: string; // 个性签名
  gender: string; // 性别 (与性取向分开)
  sexualOrientation: string; // 性取向
  birthday: string; // 生日
  region: string; // 地区
  weather: string; // 天气 (支持自动检测或手动修改)
  realRegion: string; // 现实映射地区
  hobbies: string; // 我的爱好
  persona: string; // 人设
  appearanceText: string; // 外貌
  avatar: string; // 头像
  banner: string; // 顶部横幅背景
  faceLockImage?: string; // 锁脸图
  status: string; // 状态
  level: string; // 等级
}

export interface NavState {
  page: PageId;
  params?: Record<string, any>;
}

// =========================================================
// 聊天专属设置与角色权限
// =========================================================
export interface CharacterChatSettings {
  // 一，聊天设置
  // 1. 气泡与模型
  customBubbleCountEnabled: boolean; // 是否开启自定义每轮输出气泡数
  customBubbleCount: number; // 自定义气泡数 (1~10，未开启由AI发挥)
  customModelEnabled: boolean; // 是否开启自选对话模型
  customModel: string; // 自选模型名称 (留空跟随默认)
  shortBubbleReply: boolean; // 短气泡回复 (短句即时通讯)
  voiceReplyMode: 'off' | 'random' | 'audio_card' | 'always'; // 更改发语音模式
  voiceTone: 'sweet' | 'tsundere' | 'cool' | 'gentle' | 'lively'; // 发语音音色风格

  // 2. 表情包与颜文字
  stickerFrequency: 'high' | 'normal' | 'low' | 'off'; // 表情包发送频率
  emojiFrequency: 'high' | 'normal' | 'low' | 'off'; // 正文颜文字/emoji频率
  allowPostStickerInQzone: boolean; // 允许ta在动态发表情包

  // 3. 世界书与预设
  extraWorldBookIds: string[]; // 世界书额外启用
  boundOnlinePresetId: string; // 单独绑定线上预设

  // 二，角色权限
  // 1. 感知与多媒体
  allowAiImageGeneration: boolean; // 允许ai生图
  recognizeUserStickers: boolean; // 表情包识图
  allowSeeUserAvatar: boolean; // 让ta看见我的头像
  allowProactiveOfflineInvite: boolean; // 允许ta主动约你线下
  allowProactiveCall: boolean; // 允许ta主动打电话/发视频
  callProactiveSpeaking: boolean; // 通话中ta主动说话
  callSpeakingInterval: number; // 通话中主动说话间隔 (秒: 5, 10, 15, 20)
  allowProactiveHangup: boolean; // 允许ta主动挂断

  // 2. 拟真与作息
  realisticResponseTiming: boolean; // 真人感回复 (打字延迟与拟真输入状态)
  allowProactiveMessaging: boolean; // 允许ta主动找你 (挂机主动发消息)
  allowSelfOffline: boolean; // 允许ta自行完全下线 (作息拟真下线)
  isCurrentlyOffline?: boolean; // 角色当前是否处于完全下线中
  offlineReason?: string; // 离线状态说明 (如: 睡觉中、上课中)
}

export const DEFAULT_CHARACTER_CHAT_SETTINGS: CharacterChatSettings = {
  // 聊天设置
  customBubbleCountEnabled: false,
  customBubbleCount: 3,
  customModelEnabled: false,
  customModel: '',
  shortBubbleReply: true,
  voiceReplyMode: 'random',
  voiceTone: 'sweet',
  stickerFrequency: 'normal',
  emojiFrequency: 'normal',
  allowPostStickerInQzone: true,
  extraWorldBookIds: [],
  boundOnlinePresetId: '',

  // 角色权限
  allowAiImageGeneration: true,
  recognizeUserStickers: true,
  allowSeeUserAvatar: true,
  allowProactiveOfflineInvite: true,
  allowProactiveCall: true,
  callProactiveSpeaking: true,
  callSpeakingInterval: 10,
  allowProactiveHangup: true,
  realisticResponseTiming: true,
  allowProactiveMessaging: true,
  allowSelfOffline: true,
  isCurrentlyOffline: false,
  offlineReason: '',
};
