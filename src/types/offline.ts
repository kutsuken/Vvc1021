export type NarrativePerson = 'first' | 'second' | 'third';
export type NarrativePerspective = 'user' | 'character' | 'omniscient';

export interface OfflineConfig {
  // 字数范围控制 (每次生成回复字数)
  minWords: number; // 默认 500
  maxWords: number; // 默认 800

  // 人称设定: 第一人称 | 第二人称 | 第三人称
  narrativePerson: NarrativePerson;

  // 视角设定: 用户视角 | ta的视角 | 全知视角
  perspective: NarrativePerspective;

  // 核心功能开关
  allowPlayUser: boolean; // 是否允许AI扮演玩家 (关: 严禁代替玩家发言和做决定)
  preventParaphrase: boolean; // 防止转述 (禁止复述玩家刚说的话或已知设定)
  enablePsychology: boolean; // 细腻心理描写与独白
  enableActionDetail: boolean; // 细腻神态微表情与肢体动作
  enableEnvironmentSensory: boolean; // 五感环境与氛围描写

  // 额外塞入的预设与世界书
  boundPresetIds: string[]; // 额外挂载的预设 ID
  boundWorldBookIds: string[]; // 额外挂载的世界书 ID
  useOnlinePresets?: boolean; // 是否选用/同步线上生效的预设
  useOnlineWorldBooks?: boolean; // 是否选用/同步线上生效的世界书

  // ➕ 新增扩展配置
  enableBranchOptions?: boolean; // 走向选项 (开启后每次输出会自动生成三个选项)
  writingGuidance?: string; // 写作指导 (对本场的定制全局指导)
  participatingCharIds?: string[]; // 参与角色 ID 列表
  allowDynamicCharacters?: boolean; // 是否允许随着剧情发展自然而然加入其他角色
  enableCharacterVoice?: boolean; // 角色心声 (开启后随文折叠)
  themeStyle?: 'night' | 'parchment' | 'slate' | 'sakura'; // 美化界面：主题
  fontFamily?: 'serif' | 'sans' | 'kaiti'; // 美化界面：字体
  fontSize?: 'sm' | 'base' | 'lg'; // 美化界面：字号
}

export const DEFAULT_OFFLINE_CONFIG: OfflineConfig = {
  minWords: 500,
  maxWords: 800,
  narrativePerson: 'third',
  perspective: 'omniscient',
  allowPlayUser: false,
  preventParaphrase: true,
  enablePsychology: true,
  enableActionDetail: true,
  enableEnvironmentSensory: true,
  boundPresetIds: [],
  boundWorldBookIds: [],
  useOnlinePresets: false,
  useOnlineWorldBooks: false,
  enableBranchOptions: false,
  writingGuidance: '',
  participatingCharIds: [],
  allowDynamicCharacters: true,
  enableCharacterVoice: true,
  themeStyle: 'night',
  fontFamily: 'serif',
  fontSize: 'base',
};

export interface OfflineInviteInfo {
  time: string; // 邀约时间 (如: 周六下午15:00)
  location: string; // 邀约地点 (如: 猫咪咖啡厅靠窗座)
  activity: string; // 约定事项 (如: 一起品尝草莓大福并散步)
  note?: string; // 留言备注
  status: 'pending' | 'accepted' | 'rejected';
  characterResponse?: string; // 对方接受或拒绝的回复内容
  createdAt: number;
}

export interface OfflineStoryNode {
  id: string;
  name: string;
  messageId: string;
  createdAt: number;
  previewText: string;
}

export interface OfflineMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  thought?: string; // DeepSeek 风格内心独白/心绪微澜
  wordCount?: number;
  timestamp: number;
  isFavorite?: boolean; // 是否收藏
  isNode?: boolean; // 是否存为节点
  nodeName?: string; // 节点名称
  imageUrl?: string; // 场景生图插图
  branchOptions?: string[]; // 走向选项 (三个选项)
  versions?: string[]; // 存重roll前后的版本，最多保存5个
  currentVersionIndex?: number;
}

export interface OfflineRouteBranch {
  id: string; // 线路唯一标识
  name: string; // 线路名称 (例如: 主线剧情、分歧线 2 等)
  createdAt: number;
  forkMessageId?: string; // 从哪条消息另开的分支
  forkSnippet?: string; // 分支节点内容概览
  messages: OfflineMessage[]; // 该线路完整历史消息
}

export interface OfflineSession {
  id: string;
  characterId: string;
  mode: 'direct' | 'invite';
  inviteInfo?: OfflineInviteInfo;
  messages: OfflineMessage[];
  config: OfflineConfig;
  savedNodes?: OfflineStoryNode[];
  routes?: OfflineRouteBranch[]; // 多条故事线路分支
  activeRouteId?: string; // 当前激活的线路分支 ID
  createdAt: number;
  updatedAt: number;
}
