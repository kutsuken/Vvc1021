import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Users,
  Send,
  Plus,
  Smile,
  Mic,
  Sparkles,
  RefreshCw,
  Upload,
  Volume2,
  ChevronDown,
  Check,
  MessageSquare,
  Compass,
  Heart,
  MessageCircle,
  Search,
  Image as ImageIcon,
  Star,
  UserPlus,
  Sparkle,
  Phone,
  Video,
  MapPin,
  Folder,
  Mail,
  CreditCard,
  Gift,
  Link2,
  Gamepad2,
  Wrench,
  MoreHorizontal,
  Copy,
  Trash2,
  Edit3,
  Share2,
  Play,
  RotateCcw,
  Undo2,
  Quote,
  Bookmark,
  CheckSquare,
  Wand2,
  Clock,
  Pause,
  X,
  ThumbsUp,
  BookOpen,
  Menu,
  Eye,
  Camera,
  Sliders,
} from 'lucide-react';
import {
  ApiConfig,
  CharacterPersona,
  ChatMessage,
  QuotedMessageInfo,
  StickerItem,
  WorldBookItem,
  ChannelPost,
  QzoneFeed,
  UserProfile,
  PresetItem,
  MemoryItem,
  DEFAULT_CHARACTER_CHAT_SETTINGS,
  CharacterChatSettings,
} from '../types/phone';
import {
  buildSystemPrompt,
  parseReplyToMessages,
  sendChat,
  friendlyError,
  getActivePresetsForChar,
} from '../utils/aiService';
import {
  loadStoredData,
  saveStoredData,
  STORAGE_KEYS,
} from '../utils/storage';
import {
  PixelBow,
  PixelSparkle,
  PixelHeart,
  PixelBunny,
  PixelBlackCat,
  PixelLevelBadge,
  PixelIconContacts,
  PixelIconQQ,
  PixelIconOfflineDirect,
  PixelIconOfflineInvite,
} from './PixelAssets';
import { LineBunny, LineFish, LineBird, LineCup, LineCloudStar } from './LineArtDoodles';
import defaultQzoneCover from '../assets/images/user_profile_banner_1790869097641.jpg';
import defaultFaceLockImg from '../assets/images/user_facelock_card_1790869116896.jpg';
import { AvatarPickerModal, renderUniversalAvatar } from './AvatarPickerModal';
import { BannerPickerModal, getUniversalBannerStyle } from './BannerPickerModal';
import { ChatSettingsModal } from './ChatSettingsModal';

// 初始频道趣事帖子 (论坛板块)
export const INITIAL_CHANNEL_POSTS: ChannelPost[] = [
  {
    id: 'post_1',
    category: '趣事',
    title: '谁懂啊！学校后面的魔法自动贩卖机吐出了草莓限定药水！',
    content: '今天路过老教学楼后面的旧贩卖机，投了一枚硬币后屏幕闪了一下粉紫色的雪花，居然掉出了一瓶闪着微光的草莓气泡药水，喝下去感觉视野里的像素都变清晰了！有人遇到过同样的奇迹吗？',
    authorName: '软软',
    authorAvatar: 'cat',
    timestamp: Date.now() - 3600000 * 2,
    likes: 12,
    replies: [
      {
        id: 'rep_1',
        authorName: '小手机用户',
        authorAvatar: 'bunny',
        content: '真的假的？！下次带我一起去蹲点！',
        timestamp: Date.now() - 3600000,
      },
      {
        id: 'rep_2',
        authorName: '软软',
        authorAvatar: 'cat',
        content: '好呀好呀，我们今晚放学就去~',
        timestamp: Date.now() - 1800000,
      },
    ],
  },
  {
    id: 'post_2',
    category: '日常',
    title: '大家的小手机桌面一般都怎么摆放呀？',
    content: '最近换了暗夜暮紫的壁纸，把仓库、QQ和世界书排在第一行，感觉整洁多了。你们更喜欢哪种色调和摆法呢？',
    authorName: '星夜漫步者',
    authorAvatar: 'girl',
    timestamp: Date.now() - 3600000 * 6,
    likes: 8,
    replies: [
      {
        id: 'rep_3',
        authorName: '小手机用户',
        authorAvatar: 'bunny',
        content: '白紫简笔画也很治愈！还可以随时在外观里一键复位排列~',
        timestamp: Date.now() - 3600000 * 4,
      },
    ],
  },
  {
    id: 'post_3',
    category: '树洞',
    title: '深夜emo：如果世界是一本世界书，我们会是什么章节？',
    content: '偶尔看着小手机发呆，会想如果所有相遇都是被世界书设定好的，那心动的瞬间到底算不算真实呢？希望即使是代码织成的梦，我们也能永远记住这份温柔。',
    authorName: '雨夜小提琴',
    authorAvatar: 'cat',
    timestamp: Date.now() - 3600000 * 12,
    likes: 24,
    replies: [
      {
        id: 'rep_4',
        authorName: '软软',
        authorAvatar: 'cat',
        content: '即使是梦，现在的开心也是百分之百真实的呀 ♡',
        timestamp: Date.now() - 3600000 * 10,
      },
    ],
  },
];

// 初始 QQ 空间动态 (参照真实QQ空间布局)
export const INITIAL_QZONE_FEEDS: QzoneFeed[] = [
  {
    id: 'feed_1',
    authorId: 'char_ruanruan',
    authorName: '软软',
    authorAvatar: 'cat',
    deviceTag: '来自 魔法草莓机 · 1.5小时前',
    badgeDecoration: '🍓 ✨',
    vipTag: '💎',
    content: '今天去烘焙店吃了超大一颗草莓大福！外皮软软糯糯，里面的草莓汁水饱满🍓 甜度刚刚好~ 给小手机的主人留了一半哦，快来吃！',
    imageUrl: defaultFaceLockImg,
    timestamp: Date.now() - 3600000 * 1.5,
    likes: ['软软', '星野'],
    comments: [
      {
        id: 'c_1',
        authorName: '软软',
        authorAvatar: 'cat',
        content: '嘻嘻，摸摸头~ (ฅ´ω`ฅ)',
        timestamp: Date.now() - 1800000,
      },
    ],
  },
  {
    id: 'feed_2',
    authorId: 'user_self',
    authorName: '小手机用户',
    authorAvatar: 'bunny',
    deviceTag: '来自 小手机 · 3天前',
    badgeDecoration: '🌙 ✨',
    vipTag: '💎',
    content: '在小小的世界里，收集大大的喜欢。今晚月色真美，适合听一首8-bit轻音乐发呆~ ✨',
    timestamp: Date.now() - 3600000 * 72,
    likes: ['软软'],
    comments: [
      {
        id: 'c_3',
        authorName: '软软',
        authorAvatar: 'cat',
        content: '我也在看同一片星空呢 ♡',
        timestamp: Date.now() - 3600000 * 70,
      },
    ],
  },
];

// ➕ 号抽屉第 1 页工具 (直接进线下、邀约线下、语音通话、视频通话、位置、文件、红包、礼物)
export const PLUS_PAGE_1_ITEMS = [
  { id: 'direct_offline', name: '直接进线下', icon: PixelIconOfflineDirect },
  { id: 'invite_offline', name: '邀约线下', icon: PixelIconOfflineInvite },
  { id: 'call_voice', name: '语音通话', icon: Phone },
  { id: 'call_video', name: '视频通话', icon: Video },
  { id: 'location_1', name: '位置', icon: MapPin },
  { id: 'file_1', name: '文件', icon: Folder },
  { id: 'red_packet', name: '红包', icon: Mail },
  { id: 'gift', name: '礼物', icon: Gift },
];

// ➕ 号抽屉第 2 页工具 (更多设置、转账、链接、角色扮演、指导重修)
export const PLUS_PAGE_2_ITEMS = [
  { id: 'chat_settings', name: '更多设置', icon: Sliders },
  { id: 'transfer', name: '转账', icon: CreditCard },
  { id: 'link', name: '链接', icon: Link2 },
  { id: 'roleplay', name: '角色扮演', icon: Gamepad2 },
  { id: 'remake', name: '指导重修', icon: Wrench },
];

// 消息气泡长按弹出的菜单（完全参照截图：编辑、复制、转发、播放、重roll / 删除、撤回、引用、收藏、多选）
export const MSG_MENU_ROW_1 = [
  { id: 'edit', name: '编辑', icon: Edit3, action: 'edit' },
  { id: 'copy', name: '复制', icon: Copy, action: 'copy' },
  { id: 'forward', name: '转发', icon: Share2 },
  { id: 'play', name: '播放', icon: Play },
  { id: 'reroll', name: '重roll', icon: RotateCcw, action: 'reroll' },
];

export const MSG_MENU_ROW_2 = [
  { id: 'delete', name: '删除', icon: Trash2, action: 'delete', isDanger: true },
  { id: 'recall', name: '撤回', icon: Undo2, action: 'recall' },
  { id: 'quote', name: '引用', icon: Quote, action: 'quote' },
  { id: 'favorite', name: '收藏', icon: Bookmark },
  { id: 'multiselect', name: '多选', icon: CheckSquare },
];

interface QQAppProps {
  personas: CharacterPersona[];
  onSavePersonas?: (list: CharacterPersona[]) => void;
  activeCharacterId: string;
  onChangeActiveCharacter: (id: string) => void;
  worldbooks: WorldBookItem[];
  onSaveWorldbooks?: (list: WorldBookItem[]) => void;
  stickers: StickerItem[];
  onSaveStickers: (list: StickerItem[]) => void;
  messages: ChatMessage[];
  onSaveMessages: (list: ChatMessage[]) => void;
  activeApi: ApiConfig;
  onBack: () => void;
  onGoToPersonas: () => void;
  initialChatId?: string | null;
  userProfile?: UserProfile;
  onSaveProfile?: (profile: UserProfile) => void;
  presets?: PresetItem[];
  onSavePresets?: (list: PresetItem[]) => void;
  onOpenOffline?: (params?: Record<string, any>) => void;
  memories?: MemoryItem[];
  onSaveMemories?: (newMemories: MemoryItem[]) => void;
  offlineAwayCharIds?: string[];
  onUpdateOfflineAway?: React.Dispatch<React.SetStateAction<string[]>>;
  currentTheme?: string;
}

export interface ResponseConfig {
  mode: 'manual' | 'idle_timeout';
  idleSeconds: number;
  idlePrompt: string;
}

export const QQApp: React.FC<QQAppProps> = ({
  personas,
  onSavePersonas,
  activeCharacterId,
  onChangeActiveCharacter,
  worldbooks,
  onSaveWorldbooks,
  stickers,
  onSaveStickers,
  messages,
  onSaveMessages,
  activeApi,
  onBack,
  onGoToPersonas,
  initialChatId,
  userProfile,
  onSaveProfile,
  presets,
  onSavePresets,
  onOpenOffline,
  memories,
  onSaveMemories,
  offlineAwayCharIds,
  onUpdateOfflineAway,
  currentTheme = 'sky',
}) => {
  const isAqua = currentTheme === 'aqua_pixel';
  // 核心视窗模式: 'tabs' (QQ四个板块主界面) | 'chat' (具体角色聊天界面)
  const [currentView, setCurrentView] = useState<'tabs' | 'chat'>(
    initialChatId ? 'chat' : 'tabs'
  );

  // 四个主板块：'messages' (消息) | 'channels' (频道) | 'contacts' (联系人) | 'zone' (动态/QQ空间)
  const [activeTab, setActiveTab] = useState<'messages' | 'channels' | 'contacts' | 'zone'>('messages');

  // 频道帖子状态持久化
  const [channelPosts, setChannelPosts] = useState<ChannelPost[]>(() =>
    loadStoredData(STORAGE_KEYS.CHANNEL_POSTS, INITIAL_CHANNEL_POSTS)
  );
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [isPostingModalOpen, setIsPostingModalOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<'趣事' | '日常' | '树洞' | '安利' | '讨论'>('趣事');
  const [activeViewingPost, setActiveViewingPost] = useState<ChannelPost | null>(null);
  const [channelReplyInput, setChannelReplyInput] = useState('');
  const [isAiGeneratingPost, setIsAiGeneratingPost] = useState(false);

  // 动态 (QQ空间) 状态持久化
  const [qzoneFeeds, setQzoneFeeds] = useState<QzoneFeed[]>(() =>
    loadStoredData(STORAGE_KEYS.QZONE_FEEDS, INITIAL_QZONE_FEEDS)
  );
  const [isPublishingFeedModal, setIsPublishingFeedModal] = useState(false);
  const [feedInputText, setFeedInputText] = useState('');
  const [feedAttachedImg, setFeedAttachedImg] = useState<string | null>(null);
  const [feedCommentInputs, setFeedCommentInputs] = useState<Record<string, string>>({});
  const [isGeneratingFeed, setIsGeneratingFeed] = useState(false);

  // 搜索关键词
  const [searchKeyword, setSearchKeyword] = useState('');

  // 聊天对话核心状态
  const [inputText, setInputText] = useState('');
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [showStickerDrawer, setShowStickerDrawer] = useState(false);
  const [showPlusDrawer, setShowPlusDrawer] = useState(false);
  const [plusDrawerPage, setPlusDrawerPage] = useState<1 | 2>(1);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [toolToast, setToolToast] = useState<string | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [selectedMsgForMenu, setSelectedMsgForMenu] = useState<ChatMessage | null>(null);
  const [longPressFeedbackId, setLongPressFeedbackId] = useState<string | null>(null);
  const longPressTimerRef = useRef<any>(null);
  const [showContactDrawer, setShowContactDrawer] = useState(false);
  const [voiceInputText, setVoiceInputText] = useState('');
  const [voiceDuration, setVoiceDuration] = useState(4);
  const [expandedVoiceMsgIds, setExpandedVoiceMsgIds] = useState<Record<string, boolean>>({});
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 响应模式状态（短按响应 vs 无输入等待自动回复）
  const [responseConfig, setResponseConfig] = useState<ResponseConfig>(() =>
    loadStoredData('qq_response_config_v1', {
      mode: 'manual',
      idleSeconds: 10,
      idlePrompt: '（见对方久未回复，主动挑起话题或关切询问）',
    })
  );
  const [showResponseConfigModal, setShowResponseConfigModal] = useState(false);
  const [tempResponseMode, setTempResponseMode] = useState<'manual' | 'idle_timeout'>('manual');
  const [tempIdleSecondsInput, setTempIdleSecondsInput] = useState('10');
  const [tempIdlePrompt, setTempIdlePrompt] = useState('（见对方久未回复，主动挑起话题或关切询问）');
  const lastActivityTimeRef = useRef<number>(Date.now());
  const responsePressTimerRef = useRef<any>(null);
  const isResponseLongPressedRef = useRef(false);

  // 聊天专属设置与角色权限弹窗状态
  const [isChatSettingsOpen, setIsChatSettingsOpen] = useState(false);

  // 动态评论回复与大图全貌预览状态
  const [replyingToComment, setReplyingToComment] = useState<{
    feedId: string;
    commentId: string;
    authorName: string;
  } | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // 控制 AI 正在生成内容的取消中止器
  const abortControllerRef = useRef<AbortController | null>(null);

  // 关键：维持最新 messagesRef，确保无论 AI 是否在生成中，用户均可自由发送且绝不丢失用户消息
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // 记录等待自动回复的目标消息ID，避免删除历史消息时意外重新触发回复
  const pendingAutoReplyMsgIdRef = useRef<string | null>(null);

  // 底部重roll按钮旋转状态
  const [isBottomRerolling, setIsBottomRerolling] = useState(false);

  // 引用回复状态
  const [quotedMsg, setQuotedMsg] = useState<QuotedMessageInfo | null>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // 编辑消息内容弹窗状态
  const [editingMsg, setEditingMsg] = useState<ChatMessage | null>(null);
  const [editingContent, setEditingContent] = useState('');

  // 通讯录角色 (char) 更换头像状态
  const [charForAvatarModal, setCharForAvatarModal] = useState<CharacterPersona | null>(null);

  // QQ 空间专属背景横幅状态 (与用户App背景横幅独立不同步)
  const [qzoneBanner, setQzoneBanner] = useState<string>(() =>
    loadStoredData('qq_qzone_cover_banner_v2', 'banner_qzone_starry')
  );
  const [isQzoneBannerPickerOpen, setIsQzoneBannerPickerOpen] = useState(false);

  useEffect(() => {
    saveStoredData('qq_response_config_v1', responseConfig);
  }, [responseConfig]);

  // 持久化频道和空间动态
  useEffect(() => {
    saveStoredData(STORAGE_KEYS.CHANNEL_POSTS, channelPosts);
  }, [channelPosts]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.QZONE_FEEDS, qzoneFeeds);
  }, [qzoneFeeds]);

  // 当前激活的角色
  const activeChar =
    personas.find((p) => p.id === activeCharacterId) ||
    personas[0] || {
      id: 'char_default',
      name: '软软',
      remarks: '好友',
      avatar: 'cat',
      personaPrompt: '一个温暖的朋友',
      boundWorldBookIds: [],
      createdAt: Date.now(),
    };

  // 当前角色的聊天专属设置
  const activeCharSettings: CharacterChatSettings = useMemo(() => {
    return activeChar.chatSettings || DEFAULT_CHARACTER_CHAT_SETTINGS;
  }, [activeChar.chatSettings]);

  const handleSaveChatSettings = (newSettings: CharacterChatSettings) => {
    const updated = personas.map((p) =>
      p.id === activeChar.id ? { ...p, chatSettings: newSettings } : p
    );
    if (onSavePersonas) {
      onSavePersonas(updated);
    }
  };

  const handleWakeUpCharacter = () => {
    const updatedSettings: CharacterChatSettings = {
      ...(activeChar.chatSettings || DEFAULT_CHARACTER_CHAT_SETTINGS),
      isCurrentlyOffline: false,
    };
    handleSaveChatSettings(updatedSettings);
    const wakeMsg: ChatMessage = {
      id: 'msg_wake_' + Date.now(),
      characterId: activeChar.id,
      sender: 'character',
      type: 'text',
      content: `（揉了揉眼睛）呜……你敲我啦？我醒过来啦，现在有空陪你聊天啦！✨`,
      timestamp: Date.now(),
    };
    onSaveMessages([...messages, wakeMsg]);
  };

  const charMessages = messages.filter((m) => m.characterId === activeChar.id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (currentView === 'chat') {
      scrollToBottom();
    }
  }, [charMessages.length, isAiResponding, currentView]);

  // 同步用户在 user 设置中的网名 (优先使用 username 网名，若无则使用 nickname 或 name)
  const currentUserName = useMemo(() => {
    return (
      userProfile?.username?.trim() ||
      userProfile?.nickname?.trim() ||
      userProfile?.name?.trim() ||
      '小手机用户'
    );
  }, [userProfile?.username, userProfile?.nickname, userProfile?.name]);

  // 头像渲染逻辑 (接入全局通用头像系统)
  const renderAvatar = (avatarVal: string, sizeClass = 'w-6 h-6') => {
    return renderUniversalAvatar(avatarVal, sizeClass);
  };

  // 格式化时间 (常规相对时间)
  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) {
      const d = new Date(ts);
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }
    return `${Math.floor(diff / 86400000)}天前`;
  };

  // QQ 空间说说左下角时间精准格式化 (解决几天前发的说说左下角错误显示为“今天”的 Bug)
  const formatQzoneExactTime = (ts: number) => {
    if (!ts || isNaN(ts)) return '刚刚';
    const postDate = new Date(ts);
    const now = new Date();

    const postYear = postDate.getFullYear();
    const postMonth = postDate.getMonth();
    const postDay = postDate.getDate();

    const nowYear = now.getFullYear();
    const nowMonth = now.getMonth();
    const nowDay = now.getDate();

    const hoursStr = String(postDate.getHours()).padStart(2, '0');
    const minutesStr = String(postDate.getMinutes()).padStart(2, '0');
    const timeStr = `${hoursStr}:${minutesStr}`;

    // 今天
    if (postYear === nowYear && postMonth === nowMonth && postDay === nowDay) {
      return `今天 ${timeStr}`;
    }

    // 昨天
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (
      postYear === yesterday.getFullYear() &&
      postMonth === yesterday.getMonth() &&
      postDay === yesterday.getDate()
    ) {
      return `昨天 ${timeStr}`;
    }

    // 前天
    const dayBeforeYesterday = new Date(now);
    dayBeforeYesterday.setDate(now.getDate() - 2);
    if (
      postYear === dayBeforeYesterday.getFullYear() &&
      postMonth === dayBeforeYesterday.getMonth() &&
      postDay === dayBeforeYesterday.getDate()
    ) {
      return `前天 ${timeStr}`;
    }

    // 3天前 ~ 7天前 (明确显示 N天前 时:分，如 "3天前 14:20"，绝不再错误显示为今日)
    const diffDays = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 3 && diffDays <= 7) {
      return `${diffDays}天前 ${timeStr}`;
    }

    // 同一年
    if (postYear === nowYear) {
      return `${postMonth + 1}月${postDay}日 ${timeStr}`;
    }

    // 跨年
    return `${postYear}年${postMonth + 1}月${postDay}日 ${timeStr}`;
  };

  // 设备与动态发布相对时间
  const getFeedDeviceAndRelativeTime = (feed: QzoneFeed) => {
    let deviceName = '来自 小手机';
    if (feed.deviceTag) {
      deviceName = feed.deviceTag.split('·')[0].trim();
    }
    return `${deviceName} · ${formatTime(feed.timestamp)}`;
  };

  // 空间动态展示过滤器：
  // 1. 本人的动态 (user_self / user / 匹配当前用户名 / 匹配用户ID) 始终显示
  // 2. 只有当前通讯录中存在的好友动态才显示 (删除的好友或不在通讯录的好友动态不显示)
  const displayedFeeds = useMemo(() => {
    return qzoneFeeds.filter((feed) => {
      const isUserSelf =
        feed.authorId === 'user_self' ||
        feed.authorId === 'user' ||
        (userProfile?.id && feed.authorId === userProfile.id) ||
        feed.authorName === currentUserName ||
        feed.authorName === '小手机用户' ||
        feed.authorName === '苇苇草';
      if (isUserSelf) return true;

      const isExistingContact = personas.some(
        (p) => p.id === feed.authorId || p.name === feed.authorName
      );
      return isExistingContact;
    });
  }, [qzoneFeeds, personas, currentUserName, userProfile?.id]);

  // 删除某条空间动态
  const handleDeleteFeed = (feedId: string) => {
    setQzoneFeeds((prev) => prev.filter((f) => f.id !== feedId));
    setToolToast('说说已删除');
    setTimeout(() => setToolToast(null), 1500);
  };

  // 格式化聊天气泡上方隔了很久的日期时间提示 (月日期 + 具体时分，例如：10月5日 14:30)
  const formatChatDividerTime = (ts: number) => {
    const date = new Date(ts);
    const now = new Date();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    if (date.getFullYear() !== now.getFullYear()) {
      return `${date.getFullYear()}年${month}月${day}日 ${timeStr}`;
    }
    return `${month}月${day}日 ${timeStr}`;
  };

  // 消息气泡右下角固定时分时间 (例如 14:30)
  const formatBubbleExactTime = (ts: number) => {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  // =========================================================
  // 1. 聊天功能模块
  // =========================================================
  const handleOpenChat = (charId: string) => {
    onChangeActiveCharacter(charId);
    setCurrentView('chat');
  };

  const handlePauseResponse = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsAiResponding(false);
    pendingAutoReplyMsgIdRef.current = null;
    setToolToast('已暂停角色生成');
    setTimeout(() => setToolToast(null), 1800);
  };

  const handleSendUserMessage = () => {
    // 角色生成消息期间，用户不可以连续发消息，按消息键自动暂停char正在生成的内容
    if (isAiResponding) {
      handlePauseResponse();
      return;
    }

    const text = inputText.trim();
    if (!text) return;
    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      characterId: activeChar.id,
      sender: 'user',
      type: 'text',
      content: text,
      timestamp: Date.now(),
      quote: quotedMsg ? { ...quotedMsg } : undefined,
    };
    pendingAutoReplyMsgIdRef.current = newMsg.id;
    lastActivityTimeRef.current = Date.now();
    onSaveMessages([...messagesRef.current, newMsg]);
    setInputText('');
    setQuotedMsg(null);
  };

  // AI 核心对话生成执行器
  const handleTriggerResponseInternal = async (
    sourceMessages: ChatMessage[],
    overridePrompt?: string
  ) => {
    abortControllerRef.current?.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setIsAiResponding(true);

    try {
      const charSettings = activeCharSettings;

      // 如果角色当前处于完全下线休息中
      if (charSettings.isCurrentlyOffline) {
        setIsAiResponding(false);
        abortControllerRef.current = null;
        pendingAutoReplyMsgIdRef.current = null;
        const sleepMsg: ChatMessage = {
          id: 'msg_offline_' + Date.now(),
          characterId: activeChar.id,
          sender: 'character',
          type: 'text',
          content: `（对方目前处于离线休息中 🌙：${charSettings.offlineReason || '正在睡觉/忙碌中'}。你可以点击右上角「更多」设置唤醒 ta）`,
          timestamp: Date.now(),
        };
        onSaveMessages([...sourceMessages, sleepMsg]);
        return;
      }

      // 计算生效预设：如果单独绑定了线上预设，将其加入
      let activePresets = getActivePresetsForChar(presets || [], activeChar.id);
      if (charSettings.boundOnlinePresetId) {
        const boundPreset = (presets || []).find((p) => p.id === charSettings.boundOnlinePresetId);
        if (boundPreset && !activePresets.some((p) => p.id === boundPreset.id)) {
          activePresets = [boundPreset, ...activePresets];
        }
      }

      const historyLimit = activePresets.length > 0
        ? Math.max(...activePresets.map((p) => p.historyRounds || 15))
        : 15;

      const relevantHistory = sourceMessages
        .filter((m) => m.characterId === activeChar.id)
        .slice(-historyLimit);

      const recentContext = relevantHistory.map((m) => m.content).join(' ');

      const systemPrompt = buildSystemPrompt(
        activeChar,
        worldbooks,
        stickers,
        activePresets,
        recentContext,
        memories,
        charSettings,
        userProfile
      );

      const conversationPayload: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
        { role: 'system', content: systemPrompt },
        ...relevantHistory.map((m) => {
          let text = m.content;
          if (m.quote) {
            text = `「回复 ${m.quote.senderName}：“${m.quote.content}”」\n${m.content}`;
          }
          return {
            role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
            content: text,
          };
        }),
      ];

      // 防止 API 报错 400: Requests ending with a model turn are not supported
      const lastPayloadMsg = conversationPayload[conversationPayload.length - 1];
      if (!lastPayloadMsg || lastPayloadMsg.role === 'assistant' || lastPayloadMsg.role === 'system') {
        conversationPayload.push({ role: 'user', content: overridePrompt || '（请继续回复我）' });
      } else if (overridePrompt) {
        conversationPayload.push({ role: 'user', content: overridePrompt });
      }

      // 如果启用了自选对话模型
      const effectiveApi = (charSettings.customModelEnabled && charSettings.customModel?.trim())
        ? { ...activeApi, model: charSettings.customModel.trim() }
        : activeApi;

      const rawReply = await sendChat(
        effectiveApi,
        conversationPayload,
        abortController.signal,
        activePresets
      );

      // 真人感回复：模拟轻微手打延迟
      if (charSettings.realisticResponseTiming) {
        const typingDelay = Math.min(1000, Math.max(300, rawReply.length * 20));
        await new Promise((r) => setTimeout(r, typingDelay));
      }

      const parsedParts = parseReplyToMessages(rawReply, stickers, charSettings);
      const newAiMessages: ChatMessage[] = parsedParts.map((p, idx) => ({
        id: 'msg_ai_' + Date.now() + '_' + idx,
        characterId: activeChar.id,
        sender: 'character',
        type: p.type,
        content: p.content,
        stickerName: p.sticker?.name,
        stickerUrl: p.sticker?.url,
        timestamp: Date.now() + idx * 50,
      }));

      // 追加在 sourceMessages 基础上
      onSaveMessages([...sourceMessages, ...newAiMessages]);
    } catch (e: any) {
      if (e?.name === 'AbortError' || abortController.signal.aborted) {
        // 用户暂停了生成，静默返回，不打印错误气泡
        return;
      }
      const errMsg: ChatMessage = {
        id: 'msg_err_' + Date.now(),
        characterId: activeChar.id,
        sender: 'character',
        type: 'text',
        content: `（${friendlyError(e)}）`,
        timestamp: Date.now(),
      };
      onSaveMessages([...sourceMessages, errMsg]);
    } finally {
      setIsAiResponding(false);
      abortControllerRef.current = null;
      pendingAutoReplyMsgIdRef.current = null;
    }
  };

  const handleTriggerResponse = async (overridePrompt?: string) => {
    if (isAiResponding) return;

    // 清空挂起的自动回复标志
    pendingAutoReplyMsgIdRef.current = null;

    let baseMessages = [...messagesRef.current];
    if (inputText.trim()) {
      const userMsg: ChatMessage = {
        id: 'msg_' + Date.now(),
        characterId: activeChar.id,
        sender: 'user',
        type: 'text',
        content: inputText.trim(),
        timestamp: Date.now(),
      };
      baseMessages = [...baseMessages, userMsg];
      onSaveMessages(baseMessages);
      setInputText('');
    }

    await handleTriggerResponseInternal(baseMessages, overridePrompt);
  };

  // 1. 发送消息下面的重roll：按一下旋转起来，重新把ai生成刚刚（上一次）输出的所有东西重新生成
  const handleBottomReroll = async () => {
    if (isAiResponding) {
      handlePauseResponse();
    }

    const currentMsgs = messagesRef.current;
    const charMsgs = currentMsgs.filter((m) => m.characterId === activeChar.id);

    if (charMsgs.length === 0) {
      setToolToast('当前还没有聊天记录可以重roll哦~');
      setTimeout(() => setToolToast(null), 2000);
      return;
    }

    // 寻找末尾的 AI 发言（支持多条连续 AI 消息一次性清掉重新生成）
    let lastUserIndexInChar = -1;
    for (let i = charMsgs.length - 1; i >= 0; i--) {
      if (charMsgs[i].sender === 'user') {
        lastUserIndexInChar = i;
        break;
      }
    }

    let trimmedMsgs: ChatMessage[];
    if (lastUserIndexInChar !== -1) {
      // 找到最后一条用户发言，保留该发言及其之前的内容，剪切掉其后所有 AI 输出
      const lastUserMsg = charMsgs[lastUserIndexInChar];
      trimmedMsgs = currentMsgs.filter(
        (m) => m.characterId !== activeChar.id || m.timestamp <= lastUserMsg.timestamp
      );
    } else {
      // 如果前面没有用户发言，全部是 AI 消息，则剔除最后一条 AI 消息
      const lastAiMsg = charMsgs[charMsgs.length - 1];
      trimmedMsgs = currentMsgs.filter((m) => m.id !== lastAiMsg.id);
    }

    pendingAutoReplyMsgIdRef.current = null;
    onSaveMessages(trimmedMsgs);

    setIsBottomRerolling(true);
    try {
      await handleTriggerResponseInternal(trimmedMsgs);
    } finally {
      setIsBottomRerolling(false);
    }
  };

  // 2. 点击气泡里面的重roll：让这句话以后所有的记录全部重roll
  const handleBubbleReroll = async (targetMsg: ChatMessage) => {
    setSelectedMsgForMenu(null);
    if (isAiResponding) {
      handlePauseResponse();
    }

    const currentMsgs = messagesRef.current;
    let trimmedMsgs: ChatMessage[];

    if (targetMsg.sender === 'user') {
      // 用户消息：保留此用户消息（含），清除这句话以后所有的记录
      trimmedMsgs = currentMsgs.filter(
        (m) => m.characterId !== activeChar.id || m.timestamp <= targetMsg.timestamp
      );
    } else {
      // AI 消息：清除此 AI 消息（含）及以后所有的记录，对上一个发言重新重roll回复
      trimmedMsgs = currentMsgs.filter(
        (m) => m.characterId !== activeChar.id || m.timestamp < targetMsg.timestamp
      );
    }

    pendingAutoReplyMsgIdRef.current = null;
    onSaveMessages(trimmedMsgs);

    setIsBottomRerolling(true);
    setToolToast('已重置此后的记录，正在重新生成...');
    setTimeout(() => setToolToast(null), 1800);

    try {
      await handleTriggerResponseInternal(trimmedMsgs);
    } finally {
      setIsBottomRerolling(false);
    }
  };

  // 严格遵循无输入等待秒数后自动回复（且删除消息绝不意外触发上轮回复）
  useEffect(() => {
    if (currentView !== 'chat' || responseConfig.mode !== 'idle_timeout') {
      return;
    }

    const interval = setInterval(() => {
      if (isAiResponding) return;

      // 在暂离线下途中，角色不会在线上主动发信息
      if (offlineAwayCharIds && offlineAwayCharIds.includes(activeChar.id)) {
        return;
      }

      // 必须有用户主动发送的新消息挂起，才允许自动倒计时回复
      if (!pendingAutoReplyMsgIdRef.current) return;

      const relevant = messagesRef.current.filter((m) => m.characterId === activeChar.id);
      if (relevant.length === 0) return;

      const lastMsg = relevant[relevant.length - 1];
      // 必须是刚发的那条用户消息还在末尾，且匹配挂起 ID
      if (lastMsg.sender === 'user' && lastMsg.id === pendingAutoReplyMsgIdRef.current) {
        const lastActionTime = Math.max(lastActivityTimeRef.current, lastMsg.timestamp);
        const elapsed = Math.floor((Date.now() - lastActionTime) / 1000);

        if (elapsed >= responseConfig.idleSeconds) {
          pendingAutoReplyMsgIdRef.current = null;
          lastActivityTimeRef.current = Date.now();
          handleTriggerResponse(responseConfig.idlePrompt);
        }
      } else {
        // 如果末尾已经不是那条消息，或者已被处理，清空挂起，不作无谓触发
        pendingAutoReplyMsgIdRef.current = null;
      }
    }, 500);

    return () => clearInterval(interval);
  }, [currentView, responseConfig, isAiResponding, activeChar.id]);

  // 打开响应模式配置弹窗
  const handleOpenResponseConfigModal = () => {
    setTempResponseMode(responseConfig.mode);
    setTempIdleSecondsInput(String(responseConfig.idleSeconds ?? 8));
    setTempIdlePrompt(responseConfig.idlePrompt || '');
    setShowResponseConfigModal(true);
  };

  // 响应按钮长按与短按识别
  const handleResponsePressStart = () => {
    isResponseLongPressedRef.current = false;
    if (responsePressTimerRef.current) clearTimeout(responsePressTimerRef.current);
    responsePressTimerRef.current = setTimeout(() => {
      isResponseLongPressedRef.current = true;
      handleOpenResponseConfigModal();
    }, 450);
  };

  const handleResponsePressEnd = () => {
    if (responsePressTimerRef.current) {
      clearTimeout(responsePressTimerRef.current);
      responsePressTimerRef.current = null;
    }
  };

  const handleResponseClick = () => {
    if (isResponseLongPressedRef.current) {
      isResponseLongPressedRef.current = false;
      return;
    }

    if (responseConfig.mode === 'manual') {
      // 短按保持按一下就响应
      handleTriggerResponse();
    } else {
      // 选择无输入等待，短按就会没反应，要长按才能调整
      // （无反应，并提示长按可调）
      setToolToast('当前为无输入等待模式，长按可调整设置');
      setTimeout(() => setToolToast(null), 2000);
    }
  };

  const handleSendVoice = () => {
    if (!voiceInputText.trim()) {
      alert('请输入模拟语音说话的内容');
      return;
    }
    const newMsg: ChatMessage = {
      id: 'msg_voice_' + Date.now(),
      characterId: activeChar.id,
      sender: 'user',
      type: 'voice',
      content: `[语音 ${voiceDuration}秒]`,
      voiceDuration,
      voiceText: voiceInputText.trim(),
      timestamp: Date.now(),
    };
    pendingAutoReplyMsgIdRef.current = newMsg.id;
    lastActivityTimeRef.current = Date.now();
    onSaveMessages([...messagesRef.current, newMsg]);
    setVoiceInputText('');
    setShowVoiceModal(false);
  };

  const handleSendSticker = (st: StickerItem) => {
    const newMsg: ChatMessage = {
      id: 'msg_st_' + Date.now(),
      characterId: activeChar.id,
      sender: 'user',
      type: 'sticker',
      content: `[表情:${st.name}]`,
      stickerName: st.name,
      stickerUrl: st.url,
      timestamp: Date.now(),
    };
    pendingAutoReplyMsgIdRef.current = newMsg.id;
    lastActivityTimeRef.current = Date.now();
    onSaveMessages([...messagesRef.current, newMsg]);
    setShowStickerDrawer(false);
  };

  const handleSendImageMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      const newMsg: ChatMessage = {
        id: 'msg_img_' + Date.now(),
        characterId: activeChar.id,
        sender: 'user',
        type: 'sticker',
        content: '[图片]',
        stickerName: '图片',
        stickerUrl: base64Url,
        timestamp: Date.now(),
      };
      pendingAutoReplyMsgIdRef.current = newMsg.id;
      lastActivityTimeRef.current = Date.now();
      onSaveMessages([...messagesRef.current, newMsg]);
    };
    reader.readAsDataURL(file);
  };

  const handleToolClick = (toolName: string) => {
    if (toolName === '更多' || toolName === '更多设置' || toolName === '聊天设置' || toolName === '设置') {
      setShowPlusDrawer(false);
      setIsChatSettingsOpen(true);
      return;
    }
    if (toolName === '直接进线下') {
      if (onOpenOffline) {
        setToolToast('正在直接进入线下现实空间（承接当前聊天上下文）...');
        setTimeout(() => {
          setToolToast(null);
          onOpenOffline({ characterId: activeChar.id, mode: 'direct' });
        }, 400);
      } else {
        setToolToast('已联动线下APP：直接进线下');
        setTimeout(() => setToolToast(null), 1500);
      }
    } else if (toolName === '邀约线下') {
      if (onOpenOffline) {
        setToolToast('正在向「' + activeChar.name + '」发起线下邀约...');
        setTimeout(() => {
          setToolToast(null);
          onOpenOffline({ characterId: activeChar.id, mode: 'invite' });
        }, 400);
      } else {
        setToolToast('已联动线下APP：发起线下邀约');
        setTimeout(() => setToolToast(null), 1500);
      }
    } else {
      setToolToast(`「${toolName}」功能筹备中，敬请期待~`);
      setTimeout(() => setToolToast(null), 2200);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (touchStartX === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (diff < -28) {
      // 向左滑手指 -> 翻到第 2 页
      setPlusDrawerPage(2);
    } else if (diff > 28) {
      // 向右滑手指 -> 翻回第 1 页
      setPlusDrawerPage(1);
    }
    setTouchStartX(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTouchStartX(e.clientX);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (touchStartX === null) return;
    const diff = e.clientX - touchStartX;
    if (diff < -28) {
      setPlusDrawerPage(2);
    } else if (diff > 28) {
      setPlusDrawerPage(1);
    }
    setTouchStartX(null);
  };

  // 气泡长按逻辑
  const handleMessageTouchStart = (msg: ChatMessage) => {
    setLongPressFeedbackId(msg.id);
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      setSelectedMsgForMenu(msg);
      setLongPressFeedbackId(null);
    }, 420);
  };

  const handleMessageTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setLongPressFeedbackId(null);
  };

  // 复制功能
  const handleCopyMessage = (msg: ChatMessage) => {
    const textToCopy = msg.type === 'voice' ? (msg.voiceText || msg.content) : msg.content;
    navigator.clipboard?.writeText(textToCopy).catch(() => {});
    setToolToast('已复制到剪贴板 ♡');
    setTimeout(() => setToolToast(null), 2000);
    setSelectedMsgForMenu(null);
  };

  // 1. 编辑功能：可以修改char的发送内容（以及用户发言）
  const handleOpenEditMessage = (msg: ChatMessage) => {
    setSelectedMsgForMenu(null);
    setEditingMsg(msg);
    setEditingContent(msg.type === 'voice' ? (msg.voiceText || msg.content) : msg.content);
  };

  const handleSaveEditedMessage = () => {
    if (!editingMsg) return;
    const newContent = editingContent.trim();
    if (!newContent) {
      alert('消息内容不能为空');
      return;
    }
    const updated = messagesRef.current.map((m) => {
      if (m.id !== editingMsg.id) return m;
      if (m.type === 'voice') {
        return { ...m, voiceText: newContent, content: `[语音 ${m.voiceDuration || 3}秒]` };
      }
      return { ...m, content: newContent };
    });
    onSaveMessages(updated);
    setEditingMsg(null);
    setToolToast('已修改消息内容 ♡');
    setTimeout(() => setToolToast(null), 1800);
  };

  // 2. 撤回功能：把这条删了，在聊天框显示[char]撤回了一条消息
  const handleRecallMessage = (msg: ChatMessage) => {
    setSelectedMsgForMenu(null);
    const recalledName =
      msg.sender === 'user' ? '你' : (activeChar.remarks || activeChar.name || 'char');
    const recallMsg: ChatMessage = {
      id: 'msg_recall_' + Date.now(),
      characterId: activeChar.id,
      sender: 'system',
      type: 'system',
      content: `${recalledName} 撤回了一条消息`,
      timestamp: msg.timestamp,
    };
    const updated = messagesRef.current.map((m) => (m.id === msg.id ? recallMsg : m));
    pendingAutoReplyMsgIdRef.current = null;
    onSaveMessages(updated);
    setToolToast('已撤回消息');
    setTimeout(() => setToolToast(null), 1800);
  };

  // 3. 引用功能：让user引用回复这句话编辑回复内容
  const handleQuoteMessage = (msg: ChatMessage) => {
    setSelectedMsgForMenu(null);
    const senderName =
      msg.sender === 'user' ? (currentUserName || '我') : (activeChar.remarks || activeChar.name);
    const preview =
      msg.type === 'voice'
        ? (msg.voiceText || '[语音]')
        : msg.type === 'sticker'
        ? `[表情:${msg.stickerName || '图片'}]`
        : msg.content;
    setQuotedMsg({
      id: msg.id,
      senderName,
      content: preview,
    });
    setTimeout(() => {
      chatInputRef.current?.focus();
    }, 50);
  };

  // 删除功能
  const handleDeleteMessage = (msgId: string) => {
    // 关键：删除消息时立即清空自动回复挂起状态，绝不自动接着上轮回复！
    pendingAutoReplyMsgIdRef.current = null;
    onSaveMessages(messagesRef.current.filter((m) => m.id !== msgId));
    setToolToast('已删除消息');
    setTimeout(() => setToolToast(null), 2000);
    setSelectedMsgForMenu(null);
  };

  const handleBatchImportStickers = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: StickerItem[] = [];
    let pendingCount = files.length;

    Array.from(files).forEach((file) => {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').trim() || '表情';

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        newItems.push({
          id: 'st_custom_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          name: cleanName,
          url: base64Url,
          isGlobal: true,
        });
        pendingCount--;
        if (pendingCount === 0) {
          onSaveStickers([...stickers, ...newItems]);
          alert(`成功导入 ${newItems.length} 个表情包并自动提取命名！`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleToggleVoicePlay = (msg: ChatMessage) => {
    setPlayingVoiceId(msg.id);
    setExpandedVoiceMsgIds((prev) => ({
      ...prev,
      [msg.id]: !prev[msg.id],
    }));

    setTimeout(() => {
      setPlayingVoiceId((curr) => (curr === msg.id ? null : curr));
    }, (msg.voiceDuration || 3) * 1000);
  };

  // =========================================================
  // 2. 频道 (论坛分板块 + 用户可生成/发帖)
  // =========================================================
  const categories = ['全部', '趣事', '日常', '树洞', '安利', '讨论'] as const;

  const filteredChannelPosts = channelPosts.filter((post) => {
    if (activeCategory !== '全部' && post.category !== activeCategory) return false;
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      return post.title.toLowerCase().includes(kw) || post.content.toLowerCase().includes(kw);
    }
    return true;
  });

  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      alert('请填写完整的标题和帖子内容');
      return;
    }
    const newPost: ChannelPost = {
      id: 'post_' + Date.now(),
      category: newPostCategory,
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      authorName: '小手机用户',
      authorAvatar: 'bunny',
      timestamp: Date.now(),
      likes: 1,
      replies: [],
    };
    setChannelPosts([newPost, ...channelPosts]);
    setNewPostTitle('');
    setNewPostContent('');
    setIsPostingModalOpen(false);
  };

  const handleLikePost = (postId: string) => {
    setChannelPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p))
    );
    if (activeViewingPost && activeViewingPost.id === postId) {
      setActiveViewingPost((curr) => (curr ? { ...curr, likes: curr.likes + 1 } : null));
    }
  };

  const handleAddChannelReply = (postId: string) => {
    if (!channelReplyInput.trim()) return;
    const reply = {
      id: 'rep_' + Date.now(),
      authorName: '小手机用户',
      authorAvatar: 'bunny',
      content: channelReplyInput.trim(),
      timestamp: Date.now(),
    };
    setChannelPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, replies: [...p.replies, reply] } : p))
    );
    if (activeViewingPost && activeViewingPost.id === postId) {
      setActiveViewingPost((curr) => (curr ? { ...curr, replies: [...curr.replies, reply] } : null));
    }
    setChannelReplyInput('');
  };

  // AI 智能生成论坛趣事 (用户生成功能)
  const handleAiGenerateChannelPost = async () => {
    setIsAiGeneratingPost(true);
    try {
      let title = '';
      let content = '';
      let category: '趣事' | '日常' | '树洞' | '安利' | '讨论' = '趣事';
      let replies = [];

      if (activeApi && activeApi.key) {
        const prompt = `请生成一条日系地雷系/亚文化小手机论坛的趣味帖子。
返回纯JSON格式，包含字段：
{
  "category": "趣事" | "日常" | "树洞" | "安利" | "讨论",
  "title": "帖子标题（有趣，带点傲娇、可爱或奇思妙想）",
  "content": "帖子正文",
  "reply1": "角色1的逗趣回复",
  "reply2": "角色2的逗趣回复"
}`;
        try {
          const resText = await sendChat(activeApi, [{ role: 'user', content: prompt }]);
          const cleanJson = resText.replace(/```json|```/g, '').trim();
          const parsed = JSON.parse(cleanJson);
          category = parsed.category || '趣事';
          title = parsed.title;
          content = parsed.content;
          if (parsed.reply1) {
            replies.push({
              id: 'rep_' + Date.now() + '_1',
              authorName: personas[0]?.name || '软软',
              authorAvatar: personas[0]?.avatar || 'cat',
              content: parsed.reply1,
              timestamp: Date.now() - 60000 * 5,
            });
          }
          if (parsed.reply2) {
            replies.push({
              id: 'rep_' + Date.now() + '_2',
              authorName: '星夜漫步者',
              authorAvatar: 'girl',
              content: parsed.reply2,
              timestamp: Date.now() - 60000 * 2,
            });
          }
        } catch {
          // fallback to creative local templates
        }
      }

      if (!title) {
        const templates = [
          {
            cat: '趣事' as const,
            title: '重金悬赏：是谁在我桌面的世界书里夹了一朵发光的干花？',
            content: '今天打开世界书准备复习咒语，一翻开居然掉出一瓣浅粉色的水晶樱花瓣，散发着草莓软糖的香气！难道手机里真的住着微型花妖吗？',
            r1: '（心虚地移开视线）不是我放的，真的不是哦！',
            r2: '破案了，看某只软软猫猫的耳朵都在抖呢~',
          },
          {
            cat: '讨论' as const,
            title: '深夜思考：如果能给小手机装一个任意门插件，你最想连到哪里？',
            content: '不仅能连到仓库的迷你网页，还能直接通往异世界的旧书店，或者深夜两点半依旧亮着暖灯的关东煮小摊。你们想连到哪呢？',
            r1: '想连到主人房间的床头！这样随时可以蹦出来要抱抱~',
            r2: '连到永不打烊的草莓奶昔店，全天无限续杯！',
          },
          {
            cat: '安利' as const,
            title: '救命！这款白紫简笔画壁纸配地雷系暗黑女孩头像也太搭了吧！',
            content: '在外观里试着把壁纸切换成第二款，然后戴上水母头少女的发卡，整个手机界面瞬间变成复古电子宠物的优雅高级感，强烈安利大家试试！',
            r1: '我也换上了！超级耐看而且字迹好清晰~',
            r2: '这就去外观App里一键体验！',
          },
        ];
        const chosen = templates[Math.floor(Math.random() * templates.length)];
        category = chosen.cat;
        title = chosen.title;
        content = chosen.content;
        replies = [
          {
            id: 'rep_' + Date.now() + '_1',
            authorName: personas[0]?.name || '软软',
            authorAvatar: personas[0]?.avatar || 'cat',
            content: chosen.r1,
            timestamp: Date.now() - 60000 * 5,
          },
          {
            id: 'rep_' + Date.now() + '_2',
            authorName: '小手机用户',
            authorAvatar: 'bunny',
            content: chosen.r2,
            timestamp: Date.now() - 60000 * 2,
          },
        ];
      }

      const generatedPost: ChannelPost = {
        id: 'post_ai_' + Date.now(),
        category,
        title,
        content,
        authorName: personas[Math.floor(Math.random() * personas.length)]?.name || '软软',
        authorAvatar: personas[Math.floor(Math.random() * personas.length)]?.avatar || 'cat',
        timestamp: Date.now(),
        likes: Math.floor(Math.random() * 20) + 5,
        replies,
      };

      setChannelPosts([generatedPost, ...channelPosts]);
    } finally {
      setIsAiGeneratingPost(false);
    }
  };

  // =========================================================
  // 3. 动态 (QQ 空间朋友圈)
  // =========================================================
  const handlePublishFeed = () => {
    if (!feedInputText.trim() && !feedAttachedImg) {
      setToolToast('请输入说说文字或添加图片');
      setTimeout(() => setToolToast(null), 1500);
      return;
    }
    const newFeed: QzoneFeed = {
      id: 'feed_' + Date.now(),
      authorId: 'user_self',
      authorName: currentUserName,
      authorAvatar: userProfile?.avatar || 'bunny',
      deviceTag: '来自 小手机',
      badgeDecoration: '🌸 ✨',
      vipTag: '💎',
      content: feedInputText.trim(),
      imageUrl: feedAttachedImg || undefined,
      timestamp: Date.now(),
      likes: [currentUserName],
      comments: [],
    };
    setQzoneFeeds([newFeed, ...qzoneFeeds]);
    setFeedInputText('');
    setFeedAttachedImg(null);
    setIsPublishingFeedModal(false);
  };

  const handleLikeFeed = (feedId: string) => {
    setQzoneFeeds((prev) =>
      prev.map((f) => {
        if (f.id !== feedId) return f;
        const isLiked = f.likes.some(
          (n) => n === currentUserName || n === '苇苇草' || n === '小手机用户'
        );
        const nextLikes = isLiked
          ? f.likes.filter(
              (n) => n !== currentUserName && n !== '苇苇草' && n !== '小手机用户'
            )
          : [...f.likes.filter((n) => n !== '苇苇草' && n !== '小手机用户'), currentUserName];
        return { ...f, likes: nextLikes };
      })
    );
  };

  const handleAddFeedComment = (feedId: string) => {
    const rawText = feedCommentInputs[feedId]?.trim();
    if (!rawText) return;

    let content = rawText;
    if (replyingToComment && replyingToComment.feedId === feedId) {
      if (!content.startsWith('回复 @')) {
        content = `回复 @${replyingToComment.authorName}: ${rawText}`;
      }
    }

    const newComment = {
      id: 'cmt_' + Date.now(),
      authorName: currentUserName,
      authorAvatar: userProfile?.avatar || 'bunny',
      content,
      timestamp: Date.now(),
    };
    setQzoneFeeds((prev) =>
      prev.map((f) => (f.id === feedId ? { ...f, comments: [...f.comments, newComment] } : f))
    );
    setFeedCommentInputs((prev) => ({ ...prev, [feedId]: '' }));
    setReplyingToComment(null);
  };

  // 召唤角色发布 QQ 空间新动态
  const handleGenerateCharFeed = () => {
    if (personas.length === 0) {
      setToolToast('通讯录暂无好友，请先在通讯录添加好友哦~');
      setTimeout(() => setToolToast(null), 2000);
      return;
    }
    setIsGeneratingFeed(true);
    const char = personas[Math.floor(Math.random() * personas.length)];

    const feedTemplates = [
      '刚刚在窗台上抓到了一缕粉红色的晚霞，偷偷装进了心形玻璃瓶里。今晚想早点睡，祝大家都做草莓味的美梦呀 ♡',
      '今天的心情是：好想吃草莓芭菲！但是魔法药水店老板说只有集齐三颗星星才能兑换，谁借我一颗星星嘛 (´・ω・`)',
      '下雨天最适合听着窗外的雨声看世界书啦。新学了一个让对话框冒小爱心的咒语，等下发给最在乎的人看~',
      '出门散步偶遇一只很傲娇的黑猫，蹲在墙角看了我半天，最后蹭了我一下就跑掉了！好治愈 ✨',
    ];

    const newFeed: QzoneFeed = {
      id: 'feed_ai_' + Date.now(),
      authorId: char.id,
      authorName: char.name,
      authorAvatar: char.avatar,
      content: feedTemplates[Math.floor(Math.random() * feedTemplates.length)],
      timestamp: Date.now(),
      likes: [currentUserName],
      comments: [
        {
          id: 'c_' + Date.now(),
          authorName: currentUserName,
          authorAvatar: userProfile?.avatar || 'bunny',
          content: '我也看见了！给你点赞~ ❤️',
          timestamp: Date.now(),
        },
      ],
    };

    setTimeout(() => {
      setQzoneFeeds([newFeed, ...qzoneFeeds]);
      setIsGeneratingFeed(false);
    }, 600);
  };

  // =========================================================
  // 视窗分支 A：聊天窗口 (具体角色的聊天室)
  // =========================================================
  if (currentView === 'chat') {
    return (
      <div
        className={`flex-1 flex flex-col select-none overflow-hidden relative w-full max-w-full font-mono transition-colors duration-200 ${
          isAqua
            ? 'bg-gradient-to-b from-[#f0f9ff] via-[#e0f2fe] to-[#bae6fd] text-[#0284c7]'
            : 'bg-gradient-to-b from-[#180f21] via-[#120b18] to-[#0a050e] text-[#f7d6e8]'
        }`}
      >
        {/* 顶部 QQ 风格聊天导航栏 */}
        <div
          className={`h-12 px-3 flex items-center justify-between border-b backdrop-blur-md z-20 shrink-0 w-full max-w-full ${
            isAqua
              ? 'border-[#7dd3fc] bg-white/95 text-[#0284c7]'
              : 'border-[#3b2a5a] bg-[#1e1328]/95 text-[#f7d6e8]'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setCurrentView('tabs')}
              className={`p-1.5 jelly-btn flex items-center gap-0.5 text-xs font-mono shrink-0 ${
                isAqua ? 'text-[#0284c7] hover:text-[#0369a1]' : 'text-[#d88fbf] hover:text-white'
              }`}
            >
              <ArrowLeft className="w-5 h-5 stroke-[2]" />
              <span className="hidden sm:inline">消息</span>
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-8 h-8 rounded-xl border flex items-center justify-center overflow-hidden shadow-inner shrink-0 ${
                  isAqua
                    ? 'bg-[#e0f2fe] border-[#7dd3fc]'
                    : 'bg-gradient-to-b from-[#2e1d3d] to-[#150d1e] border-[#d88fbf]/60'
                }`}
              >
                {renderAvatar(activeChar.avatar)}
              </div>
              <div className="min-w-0">
                <div
                  className={`text-xs font-mono font-bold flex items-center gap-1.5 truncate ${
                    isAqua ? 'text-[#0284c7]' : 'text-[#f7d6e8]'
                  }`}
                >
                  <span className="truncate">{activeChar.name}</span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full animate-pulse shrink-0 ${
                      isAqua ? 'bg-[#0284c7]' : 'bg-[#ff8ecb]'
                    }`}
                  ></span>
                </div>
                <div
                  className={`text-[9px] font-mono truncate flex items-center gap-1 ${
                    isAqua ? 'text-[#0369a1]/80' : 'text-[#b7a2d9]'
                  }`}
                >
                  {offlineAwayCharIds && offlineAwayCharIds.includes(activeChar.id) ? (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenOffline) onOpenOffline({ characterId: activeChar.id });
                      }}
                      className={`px-1.5 py-0.2 rounded border cursor-pointer transition-colors ${
                        isAqua
                          ? 'text-[#0284c7] bg-[#bae6fd]/40 border-[#7dd3fc] hover:bg-[#bae6fd]/60'
                          : 'text-[#ff8ecb] bg-[#ff8ecb]/15 border-[#ff8ecb]/30 hover:bg-[#ff8ecb]/25'
                      }`}
                      title="点击返回该角色的线下相聚空间"
                    >
                      线下暂离中 · 线上静默
                    </span>
                  ) : (
                    <span>{activeChar.remarks || '在线'}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 右上角：更多图标 */}
          <button
            onClick={() => handleToolClick('更多')}
            className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors jelly-btn shrink-0 ${
              isAqua
                ? 'bg-[#e0f2fe] hover:bg-[#bae6fd] text-[#0284c7] border-[#7dd3fc]'
                : 'bg-[#2e1d3e] hover:bg-[#3d2652] text-[#ff8ecb] border-[#d88fbf]/50'
            }`}
            title="更多"
          >
            <MoreHorizontal className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* 聊天消息流 */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3.5 w-full max-w-full">
          {charMessages.length === 0 ? (
            <div
              className={`h-44 flex flex-col items-center justify-center text-xs font-mono text-center px-4 ${
                isAqua ? 'text-[#0369a1]/70' : 'text-[#b7a2d9]'
              }`}
            >
              <PixelBunny className="w-12 h-12 mb-2" />
              <span>与「{activeChar.name}」开启第一句对话吧~</span>
              <span className={`text-[10px] mt-1 ${isAqua ? 'text-[#0284c7] font-bold' : 'text-[#ff8ecb]'}`}>
                发送后点击左下角的【响应】按钮，角色就会立刻回复你！
              </span>
            </div>
          ) : (
            charMessages.map((msg, index) => {
              const prevMsg = index > 0 ? charMessages[index - 1] : null;
              const isDifferentDay = prevMsg
                ? new Date(msg.timestamp).toDateString() !== new Date(prevMsg.timestamp).toDateString()
                : false;
              // 相隔超过 5 分钟 (300,000ms)、跨日或第一条消息时，在气泡上方显示居中月日期时间指示条
              const isLongGap = prevMsg ? Math.abs(msg.timestamp - prevMsg.timestamp) >= 5 * 60 * 1000 : false;
              const showTimeDivider = index === 0 || isDifferentDay || isLongGap;

              // 撤回消息系统提示条
              if (msg.type === 'system' || msg.isRecalled) {
                return (
                  <React.Fragment key={msg.id}>
                    {showTimeDivider && (
                      <div className="flex justify-center my-2.5 w-full select-none">
                        <div
                          className={`px-3 py-0.5 rounded-full border text-[10px] font-mono shadow-sm flex items-center gap-1.5 ${
                            isAqua
                              ? 'bg-white/90 border-[#7dd3fc] text-[#0284c7]'
                              : 'bg-[#180e22]/90 border-[#3b2a5a]/70 text-[#b7a2d9]/80'
                          }`}
                        >
                          <Clock className={`w-3 h-3 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]/70'}`} />
                          <span>{formatChatDividerTime(msg.timestamp)}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-center my-1.5 w-full">
                      <div
                        className={`px-3.5 py-1 rounded-full border text-[10px] font-mono select-none shadow-sm flex items-center gap-1.5 ${
                          isAqua
                            ? 'bg-white/95 border-[#7dd3fc] text-[#0284c7]'
                            : 'bg-[#1e1328]/90 border-[#3b2a5a] text-[#b7a2d9]'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isAqua ? 'bg-[#0284c7]' : 'bg-[#ff8ecb]/60'}`}></span>
                        <span>{msg.content}</span>
                      </div>
                    </div>
                  </React.Fragment>
                );
              }

              const isUser = msg.sender === 'user';
              const isVoiceExpanded = !!expandedVoiceMsgIds[msg.id];
              const isPlaying = playingVoiceId === msg.id;
              const isBeingPressed = longPressFeedbackId === msg.id;

              return (
                <React.Fragment key={msg.id}>
                  {/* 隔了很久才回复或首条消息时，在气泡上方居中展示月日期与时间 (例如: 10月5日 14:30) */}
                  {showTimeDivider && (
                    <div className="flex justify-center my-2.5 w-full select-none">
                      <div
                        className={`px-3 py-0.5 rounded-full border text-[10px] font-mono shadow-sm flex items-center gap-1.5 ${
                          isAqua
                            ? 'bg-white/90 border-[#7dd3fc] text-[#0284c7]'
                            : 'bg-[#180e22]/90 border-[#3b2a5a]/70 text-[#b7a2d9]/85'
                        }`}
                      >
                        <Clock className={`w-3 h-3 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]/70'}`} />
                        <span>{formatChatDividerTime(msg.timestamp)}</span>
                      </div>
                    </div>
                  )}

                  <div
                    className={`flex items-start gap-2.5 w-full max-w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* 角色头像 */}
                    {!isUser && (
                      <div
                        className={`w-8 h-8 rounded-xl border flex items-center justify-center overflow-hidden shrink-0 shadow-sm mt-0.5 ${
                          isAqua
                            ? 'bg-[#e0f2fe] border-[#7dd3fc]'
                            : 'bg-gradient-to-b from-[#2e1d3d] to-[#150d1e] border-[#d88fbf]/50'
                        }`}
                      >
                        {renderAvatar(activeChar.avatar)}
                      </div>
                    )}

                    {/* 用户头像 (用户发送的消息在右侧展示用户个人头像) */}
                    {isUser && (
                      <div
                        className={`w-8 h-8 rounded-xl border flex items-center justify-center overflow-hidden shrink-0 shadow-sm mt-0.5 ${
                          isAqua
                            ? 'bg-[#e0f2fe] border-[#0284c7]'
                            : 'bg-gradient-to-b from-[#2e1d3d] to-[#150d1e] border-[#ff8ecb]/60'
                        }`}
                      >
                        {renderAvatar(userProfile?.avatar || 'bunny')}
                      </div>
                    )}

                    <div
                      className={`max-w-[78%] min-w-0 flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                      onTouchStart={() => handleMessageTouchStart(msg)}
                      onTouchEnd={handleMessageTouchEnd}
                      onTouchCancel={handleMessageTouchEnd}
                      onMouseDown={() => handleMessageTouchStart(msg)}
                      onMouseUp={handleMessageTouchEnd}
                      onMouseLeave={handleMessageTouchEnd}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setSelectedMsgForMenu(msg);
                      }}
                    >
                      {/* 文字气泡 */}
                      {msg.type === 'text' && (
                        <div
                          className={`p-2.5 px-3.5 rounded-2xl text-xs font-mono leading-relaxed shadow-md break-all break-words [overflow-wrap:anywhere] transition-all cursor-pointer ${
                            isBeingPressed
                              ? isAqua
                                ? 'scale-[0.96] ring-2 ring-[#0284c7] shadow-[0_0_14px_rgba(2,132,199,0.5)]'
                                : 'scale-[0.96] ring-2 ring-[#ff8ecb] shadow-[0_0_14px_rgba(255,142,203,0.5)]'
                              : ''
                          } ${
                            isUser
                              ? isAqua
                                ? 'bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-white font-bold rounded-tr-xs shadow-[0_2px_12px_rgba(56,189,248,0.35)]'
                                : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] font-bold rounded-tr-xs shadow-[0_2px_12px_rgba(255,142,203,0.35)]'
                              : isAqua
                              ? 'bg-white text-[#0f172a] border border-[#7dd3fc] rounded-tl-xs shadow-sm'
                              : 'bg-[#231535] text-[#f7d6e8] border border-[#d88fbf]/35 rounded-tl-xs'
                          }`}
                        >
                          {/* 引用回复卡片 */}
                          {msg.quote && (
                            <div
                              className={`mb-2 p-1.5 px-2 rounded-xl text-[10px] font-mono select-none border-l-2 ${
                                isUser
                                  ? isAqua
                                    ? 'bg-black/10 border-white text-white'
                                    : 'bg-black/15 border-[#1a1120] text-[#1a1120]'
                                  : isAqua
                                  ? 'bg-[#f0f9ff] border-[#0284c7] text-[#0369a1]'
                                  : 'bg-black/35 border-[#ff8ecb] text-[#f7d6e8]/85'
                              }`}
                            >
                              <div className="font-bold text-[10px]">{msg.quote.senderName}</div>
                              <div className="truncate text-[10px] opacity-90 mt-0.5">{msg.quote.content}</div>
                            </div>
                          )}
                          {msg.content}
                        </div>
                      )}

                      {/* 表情包图片 */}
                      {msg.type === 'sticker' && (
                        <div
                          className={`w-24 h-24 rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.6)] p-2 border jelly-icon transition-all cursor-pointer ${
                            isAqua ? 'bg-white border-[#7dd3fc]' : 'bg-[#231535] border-[#d88fbf]/50'
                          } ${
                            isBeingPressed
                              ? isAqua
                                ? 'scale-[0.96] ring-2 ring-[#0284c7] shadow-[0_0_14px_rgba(2,132,199,0.5)]'
                                : 'scale-[0.96] ring-2 ring-[#ff8ecb] shadow-[0_0_14px_rgba(255,142,203,0.5)]'
                              : ''
                          }`}
                        >
                          {msg.stickerUrl ? (
                            <img
                              src={msg.stickerUrl}
                              alt={msg.stickerName || '表情'}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div
                              className={`w-full h-full flex items-center justify-center text-xs font-mono ${
                                isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'
                              }`}
                            >
                              {msg.stickerName}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 语音条 */}
                      {msg.type === 'voice' && (
                        <div
                          className={`flex flex-col gap-1 transition-all cursor-pointer ${
                            isBeingPressed
                              ? isAqua
                                ? 'scale-[0.96] ring-2 ring-[#0284c7] rounded-2xl'
                                : 'scale-[0.96] ring-2 ring-[#ff8ecb] rounded-2xl'
                              : ''
                          }`}
                        >
                          <button
                            onClick={() => handleToggleVoicePlay(msg)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-mono border transition-all ${
                              isUser
                                ? isAqua
                                  ? 'bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-white font-bold border-transparent rounded-tr-xs'
                                  : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] font-bold border-transparent rounded-tr-xs'
                                : isAqua
                                ? 'bg-white text-[#0284c7] border-[#7dd3fc] rounded-tl-xs'
                                : 'bg-[#231535] text-[#f7d6e8] border-[#d88fbf]/40 rounded-tl-xs'
                            }`}
                          >
                            <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-bounce text-white' : ''}`} />
                            <span>{msg.voiceDuration || 3}''</span>
                            <span className="text-[10px] opacity-75">点击收听</span>
                          </button>
                          {isVoiceExpanded && msg.voiceText && (
                            <div
                              className={`p-2 rounded-xl border text-[11px] font-mono leading-tight ${
                                isAqua
                                  ? 'bg-white border-[#7dd3fc] text-[#0369a1]'
                                  : 'bg-[#160d20] border-[#3b2a5a] text-[#b7a2d9]'
                              }`}
                            >
                              语音转文字: {msg.voiceText}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 气泡右下角时间指示 */}
                      <span
                        className={`text-[9px] mt-1 font-mono select-none ${
                          isAqua ? 'text-[#0369a1]/60' : 'text-[#b7a2d9]/50'
                        }`}
                        title={formatTime(msg.timestamp)}
                      >
                        {formatBubbleExactTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          )}

          {isAiResponding && (
            <div
              className={`flex items-center gap-2 text-xs font-mono animate-pulse ${
                isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl border flex items-center justify-center ${
                  isAqua ? 'bg-[#e0f2fe] border-[#7dd3fc]' : 'bg-[#2e1d3d] border-[#d88fbf]'
                }`}
              >
                {renderAvatar(activeChar.avatar)}
              </div>
              <div
                className={`p-2.5 px-3 rounded-2xl rounded-tl-xs flex items-center gap-1.5 border ${
                  isAqua
                    ? 'bg-white text-[#0284c7] border-[#7dd3fc]'
                    : 'bg-[#231535] border-[#d88fbf]/40'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>正在组织语言打字中...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 3. 底部 QQ 输入框栏目 (完全参照真实手机QQ截图布局) */}
        <div
          className={`border-t flex flex-col z-20 ${
            isAqua
              ? 'bg-white/95 border-[#7dd3fc]'
              : 'bg-[#1a1120] border-[#3b2a5a]'
          }`}
        >
          {/* 引用回复预览条 */}
          {quotedMsg && (
            <div
              className={`mx-2.5 mt-2 px-3 py-1.5 rounded-xl border flex items-center justify-between text-xs shadow-md animate-in slide-in-from-bottom-2 duration-150 ${
                isAqua
                  ? 'bg-[#f0f9ff] border-[#7dd3fc] text-[#0284c7]'
                  : 'bg-[#231535] border-[#ff8ecb]/50 text-[#b7a2d9]'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Quote className={`w-3.5 h-3.5 shrink-0 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`} />
                <span
                  className={`text-[11px] font-bold shrink-0 ${
                    isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'
                  }`}
                >
                  引用 {quotedMsg.senderName}:
                </span>
                <span className={`text-[11px] truncate ${isAqua ? 'text-[#0369a1]' : 'text-[#f7d6e8]'}`}>
                  {quotedMsg.content}
                </span>
              </div>
              <button
                onClick={() => setQuotedMsg(null)}
                className={`p-1 transition-colors shrink-0 ml-2 ${
                  isAqua ? 'text-[#0284c7] hover:text-[#0369a1]' : 'text-[#b7a2d9] hover:text-[#ff8ecb]'
                }`}
                title="取消引用"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 输入框主行 */}
          <div className="p-2.5 pb-1.5 flex items-center gap-2">
            {/* 响应按钮 */}
            <button
              onTouchStart={handleResponsePressStart}
              onTouchEnd={handleResponsePressEnd}
              onTouchCancel={handleResponsePressEnd}
              onMouseDown={handleResponsePressStart}
              onMouseUp={handleResponsePressEnd}
              onMouseLeave={handleResponsePressEnd}
              onClick={handleResponseClick}
              onContextMenu={(e) => {
                e.preventDefault();
                handleOpenResponseConfigModal();
              }}
              disabled={isAiResponding}
              className={`p-2.5 rounded-2xl text-xs font-mono font-bold flex items-center justify-center shrink-0 transition-all select-none ${
                isAiResponding
                  ? isAqua
                    ? 'bg-[#e0f2fe] text-[#0284c7]/50 border border-[#bae6fd] opacity-60'
                    : 'bg-[#241535] text-[#b7a2d9] border border-[#3b2a5a] opacity-60'
                  : responseConfig.mode === 'idle_timeout'
                  ? isAqua
                    ? 'bg-[#e0f2fe] text-[#0284c7] border border-[#0284c7] shadow-[0_0_10px_rgba(2,132,199,0.3)]'
                    : 'bg-[#261537] text-[#ff8ecb] border border-[#ff8ecb]/80 shadow-[0_0_10px_rgba(255,142,203,0.3)]'
                  : isAqua
                  ? 'bg-[#f0f9ff] text-[#0284c7] border border-[#7dd3fc] hover:bg-[#e0f2fe] jelly-btn shadow-sm'
                  : 'bg-[#2e1d3e] text-[#ff8ecb] border border-[#d88fbf]/60 hover:bg-[#3d2652] jelly-btn shadow-sm'
              }`}
              title={
                responseConfig.mode === 'manual'
                  ? '短按立即响应，长按切换模式'
                  : `无输入等待模式（${responseConfig.idleSeconds}秒），长按切换模式`
              }
            >
              <Sparkles className={`w-4 h-4 ${isAiResponding ? 'animate-spin' : ''}`} />
            </button>

            {/* 输入框主容器 */}
            <div
              className={`flex-1 flex items-center rounded-2xl border px-3.5 py-2 transition-colors shadow-inner ${
                isAqua
                  ? 'bg-[#f0f9ff] border-[#bae6fd] focus-within:border-[#0284c7]'
                  : 'bg-[#231535] border-[#4b3670] focus-within:border-[#ff8ecb]'
              }`}
            >
              <input
                ref={chatInputRef}
                type="text"
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  lastActivityTimeRef.current = Date.now();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendUserMessage();
                  }
                }}
                placeholder={quotedMsg ? `回复 ${quotedMsg.senderName}...` : '发送消息...'}
                className={`w-full bg-transparent text-xs focus:outline-none font-mono ${
                  isAqua
                    ? 'text-[#0284c7] placeholder-[#0284c7]/40'
                    : 'text-[#f7d6e8] placeholder-[#b7a2d9]/40'
                }`}
              />
            </div>

            {/* 消息按键 (发送/暂停) */}
            {isAiResponding ? (
              <button
                type="button"
                onClick={handlePauseResponse}
                className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-md bg-gradient-to-r from-[#ff4d79] to-[#ff758c] text-white flex items-center gap-1 shadow-[0_2px_12px_rgba(255,77,121,0.4)] jelly-btn active:scale-95 cursor-pointer animate-pulse"
                title="暂停角色生成"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>暂停</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSendUserMessage}
                disabled={!inputText.trim()}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-md active:scale-95 ${
                  inputText.trim()
                    ? isAqua
                      ? 'bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-white shadow-[0_2px_10px_rgba(56,189,248,0.35)] jelly-btn cursor-pointer'
                      : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] shadow-[0_2px_10px_rgba(255,142,203,0.35)] jelly-btn cursor-pointer'
                    : isAqua
                    ? 'bg-[#e0f2fe] text-[#0284c7]/40 cursor-not-allowed'
                    : 'bg-[#2a1738] text-[#b7a2d9]/40 cursor-not-allowed'
                }`}
              >
                发送
              </button>
            )}
          </div>

          {/* 底部图标工具条 */}
          <div
            className={`px-3 py-1.5 flex items-center justify-between ${
              isAqua ? 'text-[#0284c7]' : 'text-[#b7a2d9]'
            }`}
          >
            {/* 1. 模拟语音按钮 */}
            <button
              onClick={() => setShowVoiceModal(true)}
              className={`p-1.5 transition-colors jelly-btn ${
                isAqua ? 'hover:text-[#0369a1]' : 'hover:text-[#ff8ecb]'
              }`}
              title="模拟语音条"
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* 2. 发送图片相册 */}
            <label
              className={`p-1.5 transition-colors jelly-btn cursor-pointer ${
                isAqua ? 'hover:text-[#0369a1]' : 'hover:text-[#ff8ecb]'
              }`}
              title="发送图片"
            >
              <ImageIcon className="w-5 h-5" />
              <input
                type="file"
                accept="image/*"
                onChange={handleSendImageMessage}
                className="hidden"
              />
            </label>

            {/* 3. 精灵 */}
            <button
              onClick={() => handleToolClick('精灵')}
              className={`p-1.5 transition-colors jelly-btn ${
                isAqua ? 'hover:text-[#0369a1]' : 'hover:text-[#ff8ecb]'
              }`}
              title="精灵"
            >
              <Wand2 className="w-5 h-5 stroke-[1.8]" />
            </button>

            {/* 4. 重roll */}
            <button
              type="button"
              onClick={handleBottomReroll}
              className={`p-1.5 transition-colors jelly-btn ${
                isAqua ? 'hover:text-[#0369a1]' : 'hover:text-[#ff8ecb]'
              }`}
              title="重roll（重新生成上一次的回复）"
            >
              <RotateCcw
                className={`w-5 h-5 stroke-[1.8] transition-transform ${
                  isBottomRerolling
                    ? isAqua
                      ? 'animate-spin text-[#0284c7]'
                      : 'animate-spin text-[#ff8ecb]'
                    : ''
                }`}
              />
            </button>

            {/* 5. 表情包按钮 */}
            <button
              onClick={() => {
                setShowPlusDrawer(false);
                setShowStickerDrawer(!showStickerDrawer);
              }}
              className={`p-1.5 transition-colors jelly-btn ${
                showStickerDrawer
                  ? isAqua
                    ? 'text-[#0284c7]'
                    : 'text-[#ff8ecb]'
                  : isAqua
                  ? 'hover:text-[#0369a1]'
                  : 'hover:text-[#ff8ecb]'
              }`}
              title="表情包"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* 6. ➕ 号工具箱 */}
            <button
              onClick={() => {
                setShowStickerDrawer(false);
                setShowPlusDrawer(!showPlusDrawer);
              }}
              className={`p-1.5 transition-colors jelly-btn ${
                showPlusDrawer
                  ? isAqua
                    ? 'text-[#0284c7]'
                    : 'text-[#ff8ecb]'
                  : isAqua
                  ? 'hover:text-[#0369a1]'
                  : 'hover:text-[#ff8ecb]'
              }`}
              title="更多工具"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* 纯表情包抽屉 */}
          {showStickerDrawer && (
            <div
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              className={`p-3 border-t space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150 ${
                isAqua
                  ? 'bg-white/95 border-[#7dd3fc]'
                  : 'bg-[#150d1e] border-[#3b2a5a]'
              }`}
            >
              <div
                className={`flex items-center justify-between border-b pb-1.5 ${
                  isAqua ? 'border-[#bae6fd]' : 'border-[#3b2a5a]'
                }`}
              >
                <span
                  className={`text-xs font-mono font-bold flex items-center gap-1 ${
                    isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'
                  }`}
                >
                  <Smile className="w-3.5 h-3.5" />
                  <span>表情包 ({stickers.length})</span>
                </span>
                <label
                  className={`text-[10px] flex items-center gap-1 cursor-pointer hover:underline ${
                    isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>导入自定义表情</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleBatchImportStickers}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="max-h-48 overflow-y-auto grid grid-cols-4 gap-2.5 p-1">
                {stickers.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => handleSendSticker(st)}
                    className={`p-1.5 rounded-2xl border flex flex-col items-center gap-1 group jelly-btn ${
                      isAqua
                        ? 'bg-[#f0f9ff] border-[#bae6fd] hover:border-[#0284c7]'
                        : 'bg-[#231535] border-[#3b2a5a] hover:border-[#ff8ecb]'
                    }`}
                  >
                    <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
                      <img src={st.url} alt={st.name} className="w-full h-full object-contain" />
                    </div>
                    <span
                      className={`text-[10px] truncate w-full text-center ${
                        isAqua
                          ? 'text-[#0369a1] group-hover:text-[#0284c7]'
                          : 'text-[#b7a2d9] group-hover:text-[#ff8ecb]'
                      }`}
                    >
                      {st.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ➕ 号 2 页工具箱抽屉 */}
          {showPlusDrawer && (
            <div
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              className={`p-4 border-t space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-150 select-none ${
                isAqua
                  ? 'bg-white/95 border-[#7dd3fc]'
                  : 'bg-[#150d1e] border-[#3b2a5a]'
              }`}
            >
              {/* 工具网格 (2行4列) */}
              <div
                className="grid grid-cols-4 gap-y-4 gap-x-2 touch-pan-x cursor-grab active:cursor-grabbing"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
              >
                {(plusDrawerPage === 1 ? PLUS_PAGE_1_ITEMS : PLUS_PAGE_2_ITEMS).map((item) => {
                  const Icon = item.icon;
                  const isOfflineFeature = item.id === 'direct_offline' || item.id === 'invite_offline';
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleToolClick(item.name)}
                      className="flex flex-col items-center gap-1.5 group jelly-btn relative"
                    >
                      <div
                        className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all shadow-sm relative ${
                          isOfflineFeature
                            ? isAqua
                              ? 'bg-gradient-to-b from-[#e0f2fe] to-[#bae6fd] border-[#0284c7] text-[#0284c7] group-hover:shadow-[0_0_14px_rgba(56,189,248,0.4)]'
                              : 'bg-gradient-to-b from-[#2e193e] to-[#1c0f27] border-[#ff8ecb]/80 text-[#ff8ecb] group-hover:border-[#ff8ecb] group-hover:shadow-[0_0_14px_rgba(255,142,203,0.4)]'
                            : isAqua
                            ? 'bg-[#f0f9ff] border-[#bae6fd] text-[#0284c7] group-hover:border-[#0284c7]'
                            : 'bg-[#231535] border-[#4b3670] text-[#d88fbf] group-hover:border-[#ff8ecb] group-hover:text-[#ff8ecb]'
                        }`}
                      >
                        <Icon className="w-6 h-6 stroke-[1.8]" />
                        {isOfflineFeature && (
                          <span
                            className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 animate-pulse ${
                              isAqua ? 'bg-[#0284c7] ring-white' : 'bg-[#ff8ecb] ring-[#150d1e]'
                            }`}
                            title="已与线下APP联动同步"
                          />
                        )}
                      </div>
                      <span
                        className={`text-[11px] font-mono tracking-tight ${
                          isOfflineFeature
                            ? isAqua
                              ? 'text-[#0284c7] font-bold'
                              : 'text-[#ff8ecb] font-bold'
                            : isAqua
                            ? 'text-[#0369a1] group-hover:text-[#0284c7]'
                            : 'text-[#b7a2d9] group-hover:text-[#f7d6e8]'
                        }`}
                      >
                        {item.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* 翻页指示圆点 (● ○) */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  onClick={() => setPlusDrawerPage(1)}
                  className={`h-2 rounded-full transition-all ${
                    plusDrawerPage === 1
                      ? isAqua
                        ? 'w-5 bg-[#0284c7]'
                        : 'w-5 bg-[#ff8ecb]'
                      : isAqua
                      ? 'w-2 bg-[#bae6fd] hover:bg-[#7dd3fc]'
                      : 'w-2 bg-[#4b3670] hover:bg-[#b7a2d9]'
                  }`}
                  title="第 1 页"
                />
                <button
                  onClick={() => setPlusDrawerPage(2)}
                  className={`h-2 rounded-full transition-all ${
                    plusDrawerPage === 2 ? 'w-5 bg-[#ff8ecb]' : 'w-2 bg-[#4b3670] hover:bg-[#b7a2d9]'
                  }`}
                  title="第 2 页"
                />
              </div>
            </div>
          )}
        </div>

        {/* 模拟语音弹窗 */}
        {showVoiceModal && (
          <div className="absolute inset-0 bg-black/70 z-50 flex flex-col justify-end animate-in fade-in">
            <div className="bg-[#1e1328] rounded-t-3xl border-t border-[#4b3670] p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#3b2a5a] pb-2">
                <span className="text-xs font-mono font-bold text-[#f7d6e8] flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-[#ff8ecb]" />
                  <span>模拟录制发送语音</span>
                </span>
                <button
                  onClick={() => setShowVoiceModal(false)}
                  className="text-xs text-[#b7a2d9] hover:text-white"
                >
                  关闭
                </button>
              </div>

              <input
                type="text"
                value={voiceInputText}
                onChange={(e) => setVoiceInputText(e.target.value)}
                placeholder="输入语音说出的话..."
                className="w-full px-3 py-2 text-xs bg-[#150d1e] text-[#f7d6e8] rounded-xl border border-[#4b3670] focus:outline-none focus:border-[#ff8ecb] font-mono"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-[#b7a2d9] font-mono">
                  <span>模拟时长:</span>
                  <select
                    value={voiceDuration}
                    onChange={(e) => setVoiceDuration(Number(e.target.value))}
                    className="bg-[#231535] text-[#f7d6e8] px-2 py-1 rounded-lg border border-[#4b3670]"
                  >
                    <option value={2}>2秒</option>
                    <option value={4}>4秒</option>
                    <option value={6}>6秒</option>
                    <option value={10}>10秒</option>
                  </select>
                </div>

                <button
                  onClick={handleSendVoice}
                  className="px-4 py-1.5 bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] text-xs font-mono font-bold rounded-xl jelly-btn shadow-sm"
                >
                  发送语音条
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 点击工具提示气泡 */}
        {toolToast && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-full bg-[#2a1738]/95 border border-[#ff8ecb] text-xs font-mono font-bold text-[#ff8ecb] shadow-lg animate-in fade-in duration-150">
            {toolToast}
          </div>
        )}

        {/* 气泡长按弹出的双排上下文菜单 (完全参照截图：编辑/复制/转发/播放/重roll / 删除加粗标红/撤回/引用/收藏/多选) */}
        {selectedMsgForMenu && (
          <div
            onClick={() => setSelectedMsgForMenu(null)}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-100"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-[300px] bg-[#22172e] border border-[#5a4470] rounded-2xl shadow-[0_12px_44px_rgba(0,0,0,0.85)] p-2.5 space-y-2 select-none animate-in zoom-in-95 duration-150"
            >
              {/* 第一排: 编辑，复制，转发，播放，重roll */}
              <div className="grid grid-cols-5 gap-1 pb-2 border-b border-[#3b2a5a]/70">
                {MSG_MENU_ROW_1.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.action === 'copy') {
                          handleCopyMessage(selectedMsgForMenu);
                        } else if (item.action === 'edit') {
                          handleOpenEditMessage(selectedMsgForMenu);
                        } else if (item.action === 'reroll') {
                          handleBubbleReroll(selectedMsgForMenu);
                        } else {
                          handleToolClick(item.name);
                          setSelectedMsgForMenu(null);
                        }
                      }}
                      className="flex flex-col items-center gap-1.5 py-1.5 rounded-xl hover:bg-[#342444] transition-colors text-[#f7d6e8] hover:text-[#ff8ecb] jelly-btn"
                    >
                      <Icon className="w-5 h-5 stroke-[1.8]" />
                      <span className="text-[11px] font-mono tracking-tight text-[#b7a2d9]">
                        {item.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* 第二排: 删除，撤回，引用，收藏，多选 (删除加粗标红) */}
              <div className="grid grid-cols-5 gap-1 pt-0.5">
                {MSG_MENU_ROW_2.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.action === 'delete') {
                          handleDeleteMessage(selectedMsgForMenu.id);
                        } else if (item.action === 'recall') {
                          handleRecallMessage(selectedMsgForMenu);
                        } else if (item.action === 'quote') {
                          handleQuoteMessage(selectedMsgForMenu);
                        } else {
                          handleToolClick(item.name);
                          setSelectedMsgForMenu(null);
                        }
                      }}
                      className={`flex flex-col items-center gap-1.5 py-1.5 rounded-xl hover:bg-[#342444] transition-colors jelly-btn ${
                        item.isDanger
                          ? 'text-red-400 font-bold hover:text-red-300'
                          : 'text-[#f7d6e8] hover:text-[#ff8ecb]'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${item.isDanger ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                      <span
                        className={`text-[11px] font-mono tracking-tight ${
                          item.isDanger ? 'text-red-400 font-bold' : 'text-[#b7a2d9]'
                        }`}
                      >
                        {item.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 编辑消息内容弹窗 (支持修改角色或自己的发言内容) */}
        {editingMsg && (
          <div
            onClick={() => setEditingMsg(null)}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-[#1c1224] border border-[#ff8ecb]/60 rounded-3xl p-4 shadow-[0_16px_50px_rgba(0,0,0,0.9)] space-y-3 animate-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between border-b border-[#3b2a5a] pb-2.5">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#ff8ecb]" />
                  <span className="text-xs font-bold font-mono text-[#f7d6e8]">
                    编辑{editingMsg.sender === 'character' ? `「${activeChar.name}」` : '我的'}发言
                  </span>
                </div>
                <button
                  onClick={() => setEditingMsg(null)}
                  className="p-1 text-[#b7a2d9] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] text-[#b7a2d9]">修改后的文本内容：</div>
                <textarea
                  rows={4}
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  placeholder="请输入修改后的消息内容..."
                  className="w-full bg-[#120b18] border border-[#4b3670] rounded-xl p-2.5 text-xs text-[#f7d6e8] focus:outline-none focus:border-[#ff8ecb] resize-none font-mono"
                  autoFocus
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#3b2a5a]">
                <button
                  onClick={() => setEditingMsg(null)}
                  className="px-3.5 py-1.5 rounded-xl text-xs text-[#b7a2d9] hover:text-white font-mono"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveEditedMessage}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] text-xs font-bold font-mono jelly-btn shadow-md active:scale-95 cursor-pointer"
                >
                  保存修改
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 长按响应弹出的模式选择弹窗 (短按响应 / 无输入等待) */}
        {showResponseConfigModal && (
          <div
            onClick={() => setShowResponseConfigModal(false)}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-[2px] p-4 animate-in fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs bg-[#1f142b] border border-[#5a4470] rounded-3xl p-5 shadow-[0_16px_50px_rgba(0,0,0,0.85)] space-y-4 text-xs font-mono text-[#f7d6e8] select-none animate-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between border-b border-[#3b2a5a] pb-2.5">
                <span className="font-bold text-sm text-[#ff8ecb] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>响应模式设置</span>
                </span>
                <button
                  onClick={() => setShowResponseConfigModal(false)}
                  className="text-[#b7a2d9] hover:text-white text-xs"
                >
                  关闭
                </button>
              </div>

              <div className="space-y-3">
                {/* 选项 1: （短按响应） */}
                <div
                  onClick={() => setTempResponseMode('manual')}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    tempResponseMode === 'manual'
                      ? 'bg-[#2e1d3e] border-[#ff8ecb] shadow-[0_0_12px_rgba(255,142,203,0.25)]'
                      : 'bg-[#150d1e] border-[#3b2a5a] hover:border-[#d88fbf]/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="respMode"
                      checked={tempResponseMode === 'manual'}
                      onChange={() => setTempResponseMode('manual')}
                      className="accent-[#ff8ecb] w-4 h-4 cursor-pointer"
                    />
                    <div className="font-bold text-xs text-[#f7d6e8]">（短按响应）</div>
                  </div>
                  <div className="text-[10px] text-[#b7a2d9]/70 mt-1 pl-6">
                    保持默认：按一下「响应」即刻触发角色回复
                  </div>
                </div>

                {/* 选项 2: （无输入等待） */}
                <div
                  onClick={() => setTempResponseMode('idle_timeout')}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    tempResponseMode === 'idle_timeout'
                      ? 'bg-[#2e1d3e] border-[#ff8ecb] shadow-[0_0_12px_rgba(255,142,203,0.25)]'
                      : 'bg-[#150d1e] border-[#3b2a5a] hover:border-[#d88fbf]/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="respMode"
                      checked={tempResponseMode === 'idle_timeout'}
                      onChange={() => setTempResponseMode('idle_timeout')}
                      className="accent-[#ff8ecb] w-4 h-4 cursor-pointer"
                    />
                    <div className="font-bold text-xs text-[#f7d6e8]">（无输入等待）</div>
                  </div>

                  <div className="mt-2.5 pl-6 space-y-2 text-[11px] text-[#b7a2d9]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span>无输入等待（</span>
                      <input
                        type="number"
                        min={0}
                        max={120}
                        value={tempIdleSecondsInput}
                        onChange={(e) => setTempIdleSecondsInput(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="0"
                        className="w-12 px-1.5 py-0.5 text-center bg-[#150d1e] text-[#ff8ecb] font-bold border border-[#4b3670] rounded-lg focus:outline-none focus:border-[#ff8ecb]"
                      />
                      <span>）秒回复</span>
                      <span className="text-[10px] text-[#ff8ecb]/90 font-mono">（若为0则默认8秒）</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span>【</span>
                      <input
                        type="text"
                        placeholder="选填动作或引导语，可留空"
                        value={tempIdlePrompt}
                        onChange={(e) => setTempIdlePrompt(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 px-2 py-1 bg-[#150d1e] text-xs text-[#f7d6e8] border border-[#4b3670] rounded-lg focus:outline-none focus:border-[#ff8ecb]"
                      />
                      <span>】</span>
                    </div>

                    <div className="text-[10px] text-[#ff8ecb]/80 leading-tight">
                      * 选择无输入等待后，短按将无反应，严格倒计时后自动回复，长按可重新调整。
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#3b2a5a]">
                <button
                  onClick={() => setShowResponseConfigModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-[#b7a2d9] hover:text-white"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    const parsedNum = parseInt(tempIdleSecondsInput, 10);
                    // 如果删到0或为空，保存时自动设为默认8秒
                    const finalSeconds = (!parsedNum || parsedNum <= 0) ? 8 : parsedNum;

                    const newCfg: ResponseConfig = {
                      mode: tempResponseMode,
                      idleSeconds: finalSeconds,
                      idlePrompt: tempIdlePrompt.trim(),
                    };
                    setResponseConfig(newCfg);
                    saveStoredData('qq_response_config_v1', newCfg);
                    setShowResponseConfigModal(false);
                    setToolToast(
                      tempResponseMode === 'manual'
                        ? '已切换为：短按响应'
                        : `已切换为：无输入等待（${finalSeconds}秒后自动回复）`
                    );
                    setTimeout(() => setToolToast(null), 2500);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] text-xs font-bold jelly-btn shadow-sm"
                >
                  保存生效
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 角色切换抽屉遮罩 */}
        {showContactDrawer && (
          <div className="absolute inset-0 bg-black/60 z-30 flex flex-col justify-end animate-in fade-in">
            <div className="bg-[#1e1328] rounded-t-3xl border-t border-[#4b3670] p-4 max-h-[70%] flex flex-col space-y-3">
              <div className="flex items-center justify-between border-b border-[#3b2a5a] pb-2">
                <span className="text-xs font-mono font-bold text-[#f7d6e8]">切换聊天好友</span>
                <button
                  onClick={() => setShowContactDrawer(false)}
                  className="text-xs text-[#b7a2d9] hover:text-white"
                >
                  关闭
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2">
                {personas.map((p) => {
                  const isCur = p.id === activeChar.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        onChangeActiveCharacter(p.id);
                        setShowContactDrawer(false);
                      }}
                      className={`w-full p-2.5 rounded-2xl flex items-center justify-between border transition-all ${
                        isCur
                          ? 'bg-[#2e1d3e] border-[#ff8ecb] text-[#f7d6e8]'
                          : 'bg-[#150d1e] border-[#3b2a5a] text-[#b7a2d9] hover:border-[#d88fbf]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#241635] flex items-center justify-center overflow-hidden">
                          {renderAvatar(p.avatar)}
                        </div>
                        <div className="text-left font-mono">
                          <div className="text-xs font-bold">{p.name}</div>
                          <div className="text-[10px] text-[#b7a2d9]/70">{p.remarks || '无备注'}</div>
                        </div>
                      </div>
                      {isCur && <Check className="w-4 h-4 text-[#ff8ecb]" />}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  setShowContactDrawer(false);
                  onGoToPersonas();
                }}
                className="w-full py-2 rounded-xl bg-[#251535] border border-[#d88fbf]/50 text-xs font-mono text-[#ff8ecb] flex items-center justify-center gap-1.5 jelly-btn"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新建 / 编辑人设</span>
              </button>
            </div>
          </div>
        )}

        {/* 聊天设置与角色权限弹窗 */}
        <ChatSettingsModal
          isOpen={isChatSettingsOpen}
          onClose={() => setIsChatSettingsOpen(false)}
          char={activeChar}
          settings={activeCharSettings}
          onSaveSettings={handleSaveChatSettings}
          worldbooks={worldbooks}
          onSaveWorldbooks={onSaveWorldbooks}
          presets={presets || []}
          onSavePresets={onSavePresets}
          stickers={stickers}
          onSaveStickers={onSaveStickers}
          activeApi={activeApi}
          userProfile={userProfile}
          onWakeUpCharacter={handleWakeUpCharacter}
        />
      </div>
    );
  }

  // =========================================================
  // 视窗分支 B：QQ 四大板块主界面 (消息、频道、联系人、动态)
  // =========================================================
  return (
    <div
      className={`flex-1 flex flex-col select-none overflow-hidden relative font-mono w-full max-w-full transition-colors duration-200 ${
        isAqua
          ? 'bg-gradient-to-b from-[#f0f9ff] via-[#e0f2fe] to-[#bae6fd] text-[#0284c7]'
          : 'bg-gradient-to-b from-[#180f21] via-[#120b18] to-[#0a050e] text-[#f7d6e8]'
      }`}
    >
      {/* 顶部主标题栏 (动态板块有自己的沉浸式封面顶栏，此处仅其他3个板块展示) */}
      {activeTab !== 'zone' && (
        <div
          className={`h-12 px-3 flex items-center justify-between border-b backdrop-blur-md z-20 shrink-0 w-full max-w-full ${
            isAqua
              ? 'border-[#7dd3fc] bg-white/95 text-[#0284c7]'
              : 'border-[#3b2a5a] bg-[#1e1328]/95 text-[#f7d6e8]'
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className={`p-1.5 jelly-btn ${
                isAqua ? 'text-[#0284c7] hover:text-[#0369a1]' : 'text-[#d88fbf] hover:text-white'
              }`}
              title="返回手机桌面"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2]" />
            </button>

            {/* 用户自己的头像 (展示用户App设置的头像，自动同步) */}
            <div
              className={`relative w-8 h-8 rounded-full border overflow-hidden shrink-0 shadow-sm ${
                isAqua ? 'border-[#0284c7] bg-[#e0f2fe]' : 'border-[#ff8ecb]/70 bg-[#231535]'
              }`}
              title={`当前账号：${currentUserName}`}
            >
              <div className="w-full h-full flex items-center justify-center">
                {renderAvatar(userProfile?.avatar || 'bunny', 'w-5 h-5')}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <PixelIconQQ className="w-5 h-5" isAqua={isAqua} />
              <span className={`font-bold text-sm ${isAqua ? 'text-[#0284c7]' : 'text-[#f7d6e8]'}`}>
                {activeTab === 'messages' && '消息'}
                {activeTab === 'channels' && '频道 · 趣事论坛'}
                {activeTab === 'contacts' && '联系人'}
              </span>
            </div>
          </div>

          {/* 右侧动作按钮 */}
          <div className="flex items-center gap-2">
            {activeTab === 'channels' && (
              <button
                onClick={() => setIsPostingModalOpen(true)}
                className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 jelly-btn shadow-sm ${
                  isAqua
                    ? 'bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-white shadow-[0_2px_8px_rgba(56,189,248,0.3)]'
                    : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120]'
                }`}
              >
                <Plus className="w-3 h-3 stroke-[3]" />
                <span>发帖</span>
              </button>
            )}

            {activeTab === 'contacts' && (
              <button
                onClick={onGoToPersonas}
                className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 jelly-btn shadow-sm ${
                  isAqua
                    ? 'bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-white shadow-[0_2px_8px_rgba(56,189,248,0.3)]'
                    : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120]'
                }`}
              >
                <UserPlus className="w-3 h-3 stroke-[2.5]" />
                <span>新建</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 板块主体展示区 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden w-full max-w-full">
        {/* =========================================
            板块 1: 消息 (一行一行最近在聊的对象)
            ========================================= */}
        {activeTab === 'messages' && (
          <div className="p-3 space-y-3">
            {/* 搜索栏 */}
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-2xl border ${
                isAqua
                  ? 'bg-white border-[#7dd3fc] text-[#0284c7] focus-within:border-[#0284c7]'
                  : 'bg-[#170e22] border-[#3b2a5a] text-[#f7d6e8] focus-within:border-[#ff8ecb]'
              }`}
            >
              <Search className={`w-3.5 h-3.5 ${isAqua ? 'text-[#0284c7]' : 'text-[#b7a2d9]'}`} />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索聊天记录 / 好友..."
                className={`w-full bg-transparent text-xs focus:outline-none ${
                  isAqua
                    ? 'text-[#0284c7] placeholder-[#0284c7]/40'
                    : 'text-[#f7d6e8] placeholder-[#b7a2d9]/40'
                }`}
              />
            </div>

            {/* 对话列表 (一行一行) */}
            <div className="space-y-1.5">
              {personas
                .filter((p) => {
                  if (!searchKeyword.trim()) return true;
                  const kw = searchKeyword.toLowerCase();
                  return (
                    p.name.toLowerCase().includes(kw) ||
                    (p.remarks && p.remarks.toLowerCase().includes(kw))
                  );
                })
                .map((persona) => {
                  // 找到与该角色的最后一条消息
                  const charMsgs = messages.filter((m) => m.characterId === persona.id);
                  const lastMsg = charMsgs[charMsgs.length - 1];

                  let lastContent = '点击开启陪伴聊天~';
                  if (lastMsg) {
                    if (lastMsg.type === 'text') lastContent = lastMsg.content;
                    else if (lastMsg.type === 'sticker') lastContent = `[表情: ${lastMsg.stickerName || '表情包'}]`;
                    else if (lastMsg.type === 'voice') lastContent = `[语音 ${lastMsg.voiceDuration || 3}秒]`;
                  }

                  const lastTime = lastMsg ? formatTime(lastMsg.timestamp) : '新好友';

                  return (
                    <button
                      key={persona.id}
                      onClick={() => handleOpenChat(persona.id)}
                      className={`w-full p-2.5 rounded-2xl border flex items-center gap-3 transition-all jelly-btn text-left group ${
                        isAqua
                          ? 'bg-white/90 hover:bg-[#e0f2fe]/70 border-[#bae6fd] hover:border-[#0284c7]'
                          : 'bg-[#1b1025]/85 hover:bg-[#251535] border-[#3b2a5a]/70 hover:border-[#d88fbf]'
                      }`}
                    >
                      {/* 头像 + 在线绿点 */}
                      <div
                        className={`relative w-11 h-11 rounded-2xl border flex items-center justify-center overflow-hidden shrink-0 shadow-sm ${
                          isAqua
                            ? 'bg-[#e0f2fe] border-[#7dd3fc]'
                            : 'bg-[#231535] border-[#d88fbf]/60'
                        }`}
                      >
                        {renderAvatar(persona.avatar, 'w-7 h-7')}
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white"></span>
                      </div>

                      {/* 中间信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold truncate ${
                              isAqua
                                ? 'text-[#0284c7] group-hover:text-[#0369a1]'
                                : 'text-[#f7d6e8] group-hover:text-[#ff8ecb]'
                            }`}
                          >
                            {persona.name}
                          </span>
                          <span
                            className={`text-[10px] shrink-0 ml-2 ${
                              isAqua ? 'text-[#0369a1]/60' : 'text-[#b7a2d9]/60'
                            }`}
                          >
                            {lastTime}
                          </span>
                        </div>
                        <div
                          className={`text-[11px] truncate mt-0.5 ${
                            isAqua ? 'text-[#0369a1]/80' : 'text-[#b7a2d9]'
                          }`}
                        >
                          {lastContent}
                        </div>
                      </div>
                    </button>
                  );
                })}

              {personas.length === 0 && (
                <div
                  className={`py-12 flex flex-col items-center justify-center text-xs gap-2 ${
                    isAqua ? 'text-[#0369a1]/70' : 'text-[#b7a2d9]'
                  }`}
                >
                  <PixelBunny className="w-10 h-10 opacity-70" />
                  <span>通讯录还是空的哦</span>
                  <button
                    onClick={onGoToPersonas}
                    className={`px-3 py-1 rounded-full border text-xs jelly-btn ${
                      isAqua
                        ? 'bg-[#e0f2fe] text-[#0284c7] border-[#7dd3fc]'
                        : 'bg-[#2e1d3e] text-[#ff8ecb] border-[#d88fbf]/50'
                    }`}
                  >
                    去创建第一个好友角色
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================
            板块 2: 频道 (趣事论坛分板块，user可以生成)
            ========================================= */}
        {activeTab === 'channels' && (
          <div className="p-3 space-y-3">
            {/* 分板块选择标签 */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all ${
                    activeCategory === cat
                      ? isAqua
                        ? 'bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-white shadow-[0_2px_8px_rgba(56,189,248,0.3)]'
                        : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] shadow-[0_2px_8px_rgba(255,142,203,0.3)]'
                      : isAqua
                      ? 'bg-white text-[#0284c7] border border-[#bae6fd] hover:border-[#0284c7]'
                      : 'bg-[#1e1328] text-[#b7a2d9] border border-[#3b2a5a] hover:text-[#ff8ecb]'
                  }`}
                >
                  #{cat}
                </button>
              ))}
            </div>

            {/* AI 生成趣事 + 手动发帖快速操作条 */}
            <div
              className={`p-3 rounded-2xl border flex items-center justify-between shadow-sm ${
                isAqua
                  ? 'bg-gradient-to-r from-[#f0f9ff] to-[#e0f2fe] border-[#7dd3fc] text-[#0284c7]'
                  : 'bg-gradient-to-r from-[#241535] to-[#1a1024] border-[#4b3670]'
              }`}
            >
              <div className="space-y-0.5">
                <div
                  className={`text-xs font-bold flex items-center gap-1 ${
                    isAqua ? 'text-[#0284c7]' : 'text-[#f7d6e8]'
                  }`}
                >
                  <Sparkle className={`w-3.5 h-3.5 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`} />
                  <span>小手机奇妙趣事圈</span>
                </div>
                <div className={`text-[10px] ${isAqua ? 'text-[#0369a1]/80' : 'text-[#b7a2d9]/70'}`}>
                  像真实论坛一样分享趣事，支持AI一键生成~
                </div>
              </div>

              <button
                onClick={handleAiGenerateChannelPost}
                disabled={isAiGeneratingPost}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-md hover:opacity-95 disabled:opacity-50 flex items-center gap-1 jelly-btn shrink-0 ${
                  isAqua
                    ? 'bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-white shadow-[0_2px_8px_rgba(56,189,248,0.3)]'
                    : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120]'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAiGeneratingPost ? 'animate-spin' : ''}`} />
                <span>{isAiGeneratingPost ? '生成中...' : '✦ AI 生成趣事'}</span>
              </button>
            </div>

            {/* 帖子列表 */}
            <div className="space-y-2.5">
              {filteredChannelPosts.map((post) => (
                <div
                  key={post.id}
                  className={`p-3.5 rounded-2xl border transition-all space-y-2 shadow-sm ${
                    isAqua
                      ? 'bg-white/90 border-[#7dd3fc] hover:border-[#0284c7]'
                      : 'bg-[#1b1025]/85 border-[#3b2a5a] hover:border-[#d88fbf]/60'
                  }`}
                >
                  {/* 头部：分类标签与作者 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center overflow-hidden border ${
                          isAqua ? 'bg-[#e0f2fe] border-[#7dd3fc]' : 'bg-[#231535] border-[#5a3e75]'
                        }`}
                      >
                        {renderAvatar(post.authorAvatar, 'w-4 h-4')}
                      </div>
                      <span className={`text-xs font-bold ${isAqua ? 'text-[#0284c7]' : 'text-[#f7d6e8]'}`}>
                        {post.authorName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${
                          isAqua
                            ? 'bg-[#e0f2fe] border-[#7dd3fc] text-[#0284c7]'
                            : 'bg-[#2a1738] border-[#ff8ecb]/40 text-[#ff8ecb]'
                        }`}
                      >
                        #{post.category}
                      </span>
                      <span className={`text-[10px] ${isAqua ? 'text-[#0369a1]/60' : 'text-[#b7a2d9]/60'}`}>
                        {formatTime(post.timestamp)}
                      </span>
                    </div>
                  </div>

                  {/* 标题与正文 */}
                  <div
                    onClick={() => setActiveViewingPost(post)}
                    className="cursor-pointer space-y-1 group"
                  >
                    <div
                      className={`text-xs font-bold transition-colors line-clamp-1 ${
                        isAqua ? 'text-[#0284c7] group-hover:text-[#0369a1]' : 'text-[#f7d6e8] group-hover:text-[#ff8ecb]'
                      }`}
                    >
                      {post.title}
                    </div>
                    <div
                      className={`text-[11px] leading-relaxed line-clamp-2 ${
                        isAqua ? 'text-[#0369a1]/85' : 'text-[#b7a2d9]'
                      }`}
                    >
                      {post.content}
                    </div>
                  </div>

                  {/* 互动动作条：点赞 & 评论 */}
                  <div
                    className={`flex items-center justify-between border-t pt-2 text-[11px] ${
                      isAqua ? 'border-[#bae6fd] text-[#0369a1]' : 'border-[#3b2a5a]/60 text-[#b7a2d9]'
                    }`}
                  >
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center gap-1 jelly-btn ${
                        isAqua ? 'hover:text-[#0284c7]' : 'hover:text-[#ff8ecb]'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`} />
                      <span>{post.likes} 赞</span>
                    </button>

                    <button
                      onClick={() => setActiveViewingPost(post)}
                      className={`flex items-center gap-1 jelly-btn ${
                        isAqua ? 'hover:text-[#0284c7]' : 'hover:text-[#ff8ecb]'
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{post.replies.length} 回复</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================
            板块 3: 联系人 (创建过的角色)
            ========================================= */}
        {activeTab === 'contacts' && (
          <div className="p-3 space-y-3">
            {/* 顶栏操作项 */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onGoToPersonas}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all jelly-btn text-left ${
                  isAqua
                    ? 'bg-white/90 border-[#7dd3fc] hover:border-[#0284c7]'
                    : 'bg-[#1b1025] border-[#3b2a5a] hover:border-[#ff8ecb]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isAqua
                      ? 'bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-white'
                      : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120]'
                  }`}
                >
                  <UserPlus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className={`text-xs font-bold ${isAqua ? 'text-[#0284c7]' : 'text-[#f7d6e8]'}`}>新建角色</div>
                  <div className={`text-[9px] ${isAqua ? 'text-[#0369a1]/70' : 'text-[#b7a2d9]'}`}>打造专属人设</div>
                </div>
              </button>

              <button
                onClick={() => {
                  if (personas[0]) handleOpenChat(personas[0].id);
                }}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all jelly-btn text-left ${
                  isAqua
                    ? 'bg-white/90 border-[#7dd3fc] hover:border-[#0284c7]'
                    : 'bg-[#1b1025] border-[#3b2a5a] hover:border-[#ff8ecb]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                    isAqua
                      ? 'bg-[#e0f2fe] border-[#7dd3fc] text-[#0284c7]'
                      : 'bg-[#2e1d3e] border-[#d88fbf] text-[#ff8ecb]'
                  }`}
                >
                  <PixelHeart className="w-5 h-5" />
                </div>
                <div>
                  <div className={`text-xs font-bold ${isAqua ? 'text-[#0284c7]' : 'text-[#f7d6e8]'}`}>特别关心</div>
                  <div className={`text-[9px] ${isAqua ? 'text-[#0369a1]/70' : 'text-[#b7a2d9]'}`}>{personas[0]?.name || '暂无'}</div>
                </div>
              </button>
            </div>

            {/* 我的好友总览 */}
            <div className="space-y-1.5">
              <div className={`text-[10px] px-1 font-bold ${isAqua ? 'text-[#0369a1]' : 'text-[#b7a2d9]'}`}>
                我的好友 ({personas.length})
              </div>

              {personas.map((persona) => (
                <div
                  key={persona.id}
                  className={`p-2.5 rounded-2xl border flex items-center justify-between transition-all group/card ${
                    isAqua
                      ? 'bg-white/90 border-[#bae6fd] hover:border-[#0284c7]'
                      : 'bg-[#1b1025]/85 border-[#3b2a5a]/70 hover:border-[#d88fbf]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* 角色头像 */}
                    <button
                      type="button"
                      onClick={() => setCharForAvatarModal(persona)}
                      className={`relative w-11 h-11 rounded-2xl border flex items-center justify-center overflow-hidden shrink-0 shadow-sm group cursor-pointer jelly-btn ${
                        isAqua ? 'bg-[#e0f2fe] border-[#7dd3fc]' : 'bg-[#231535] border-[#d88fbf]/60'
                      }`}
                      title={`点击更换「${persona.name}」的头像`}
                    >
                      {renderAvatar(persona.avatar, 'w-7 h-7')}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera className={`w-3.5 h-3.5 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`} />
                      </div>
                    </button>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold ${isAqua ? 'text-[#0284c7]' : 'text-[#f7d6e8]'}`}>
                          {persona.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCharForAvatarModal(persona)}
                          className={`text-[10px] flex items-center gap-0.5 hover:underline ${
                            isAqua ? 'text-[#0284c7]/80 hover:text-[#0284c7]' : 'text-[#ff8ecb]/80 hover:text-[#ff8ecb]'
                          }`}
                          title="更换此角色的头像"
                        >
                          <Camera className="w-2.5 h-2.5" />
                          <span>换头像</span>
                        </button>
                      </div>
                      <div className={`text-[10px] truncate max-w-[130px] ${isAqua ? 'text-[#0369a1]/80' : 'text-[#b7a2d9]'}`}>
                        {persona.remarks || persona.personaPrompt.slice(0, 20) || '无额外设定'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenChat(persona.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm hover:opacity-90 jelly-btn ${
                      isAqua
                        ? 'bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-white shadow-[0_2px_8px_rgba(56,189,248,0.3)]'
                        : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120]'
                    }`}
                  >
                    发消息
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================
            板块 4: 动态 (QQ 空间朋友圈 - 精简自然布局)
            ========================================= */}
        {activeTab === 'zone' && (
          <div className="space-y-3 pb-8 w-full max-w-full">
            {/* 1. 空间封面 (独立于用户App横幅，点击或右上角按钮更换) */}
            <div
              onClick={() => setIsQzoneBannerPickerOpen(true)}
              style={getUniversalBannerStyle(qzoneBanner)}
              className="relative h-44 sm:h-52 w-full overflow-hidden bg-[#180f21] group transition-all cursor-pointer shadow-md"
              title="点击上传 / 更换QQ空间背景横幅"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[#221038]/50 via-transparent to-[#180f21]"></div>

              {/* 顶部通栏覆盖导航 (左上角返回消息，右上角换背景、发说说与召唤) */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-0 left-0 right-0 h-12 px-3 flex items-center justify-between z-20"
              >
                <button
                  onClick={() => setActiveTab('messages')}
                  className="w-8 h-8 rounded-full bg-black/45 hover:bg-black/65 text-white flex items-center justify-center backdrop-blur-md transition-all jelly-btn shadow-md"
                  title="返回消息列表"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                </button>

                <div className="flex items-center gap-2">
                  {/* 更换背景 / 横幅系统专属按钮 (与用户App横幅独立不同步) */}
                  <button
                    onClick={() => setIsQzoneBannerPickerOpen(true)}
                    className="px-2.5 py-1 rounded-full bg-black/50 hover:bg-black/75 text-[#f7d6e8] hover:text-[#ff8ecb] text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-md border border-white/20 transition-all jelly-btn shadow-md"
                    title="上传或更换QQ空间背景 / 横幅 (与用户中心独立不同步)"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#ff8ecb]" />
                    <span>换背景</span>
                  </button>

                  <button
                    onClick={() => setIsPublishingFeedModal(true)}
                    className="w-8 h-8 rounded-full bg-black/45 hover:bg-black/65 text-white flex items-center justify-center backdrop-blur-md transition-all jelly-btn shadow-md"
                    title="发说说"
                  >
                    <MessageSquare className="w-4 h-4 stroke-[2]" />
                  </button>
                  <button
                    onClick={handleGenerateCharFeed}
                    disabled={isGeneratingFeed}
                    className="w-8 h-8 rounded-full bg-black/45 hover:bg-black/65 text-[#ff8ecb] flex items-center justify-center backdrop-blur-md transition-all jelly-btn shadow-md"
                    title="AI 召唤好友发动态"
                  >
                    <Sparkles className={`w-4 h-4 ${isGeneratingFeed ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* 悬停/常态下更换背景角标 */}
              <div className="absolute bottom-2 right-3 z-10 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-[10px] text-white/80 flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                <Camera className="w-3 h-3 text-[#ff8ecb]" />
                <span>点击更换空间背景</span>
              </div>
            </div>

            {/* 2. 空间主人头像与黄钻9标识 (显示用户在个人中心设置的头像与网名，严格自动同步) */}
            <div className="px-4 -mt-10 relative z-10 flex items-end gap-3.5">
              {/* 大圆形头像 (展示个人中心设置的头像) */}
              <div
                className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full p-[2.5px] bg-[#180f21] shadow-2xl shrink-0"
                title={`空间主人：${currentUserName}`}
              >
                <div className="w-full h-full rounded-full border-2 border-white/85 bg-[#251535] overflow-hidden flex items-center justify-center shadow-inner">
                  {renderAvatar(userProfile?.avatar || 'bunny', 'w-11 h-11')}
                </div>
              </div>

              {/* 空间主人网名与黄钻9标签 (与 user 个人中心设置的网名实时双向同步) */}
              <div className="flex-1 min-w-0 pb-1">
                {/* 网名 + 黄钻9 */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base sm:text-lg font-bold text-white drop-shadow truncate">
                    {currentUserName}
                  </span>
                  {/* QQ空间黄钻9专属标识 */}
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-[#1a1120] shadow-[0_1px_6px_rgba(251,191,36,0.6)] flex items-center gap-0.5 tracking-tight border border-amber-200/70 select-none">
                    <span>💎</span>
                    <span>黄钻9</span>
                  </span>
                </div>

                {/* 个性签名 */}
                <div className="text-[11px] text-[#b7a2d9]/80 truncate max-w-xs mt-1 font-mono">
                  {userProfile?.bio ? userProfile.bio : <span className="opacity-50 italic">未设置个性签名</span>}
                </div>
              </div>
            </div>

            {/* 3. 五大功能图标导航栏 (改小体积，去掉图标周围多余的框，纯粹通透排布) */}
            <div className="mx-3 mt-1 py-2 px-1 grid grid-cols-5 gap-1 text-center border-b border-[#3b2a5a]/50">
              {/* 1. 说说 */}
              <button
                onClick={() => setIsPublishingFeedModal(true)}
                className="flex flex-col items-center gap-1 py-1 text-[#f7d6e8] hover:text-[#ff8ecb] transition-colors jelly-btn group"
              >
                <MessageCircle className="w-5 h-5 stroke-[1.8] text-[#f7d6e8] group-hover:text-[#ff8ecb] transition-colors" />
                <span className="text-[11px] font-mono text-[#b7a2d9] group-hover:text-[#ff8ecb]">说说</span>
              </button>

              {/* 2. 日志 */}
              <button
                onClick={() => {
                  setToolToast('正在翻阅世界书回忆录~');
                  setTimeout(() => setToolToast(null), 1800);
                }}
                className="flex flex-col items-center gap-1 py-1 text-[#f7d6e8] hover:text-[#ff8ecb] transition-colors jelly-btn group"
              >
                <BookOpen className="w-5 h-5 stroke-[1.8] text-[#f7d6e8] group-hover:text-[#ff8ecb] transition-colors" />
                <span className="text-[11px] font-mono text-[#b7a2d9] group-hover:text-[#ff8ecb]">日志</span>
              </button>

              {/* 3. 相册 */}
              <button
                onClick={() => {
                  setToolToast('相册功能已同步本地图片');
                  setTimeout(() => setToolToast(null), 1800);
                }}
                className="flex flex-col items-center gap-1 py-1 text-[#f7d6e8] hover:text-[#ff8ecb] transition-colors jelly-btn group"
              >
                <ImageIcon className="w-5 h-5 stroke-[1.8] text-[#f7d6e8] group-hover:text-[#ff8ecb] transition-colors" />
                <span className="text-[11px] font-mono text-[#b7a2d9] group-hover:text-[#ff8ecb]">相册</span>
              </button>

              {/* 4. 留言 */}
              <button
                onClick={() => {
                  setToolToast('主人专属留言板已开放 ♡');
                  setTimeout(() => setToolToast(null), 1800);
                }}
                className="flex flex-col items-center gap-1 py-1 text-[#f7d6e8] hover:text-[#ff8ecb] transition-colors jelly-btn group"
              >
                <MessageSquare className="w-5 h-5 stroke-[1.8] text-[#f7d6e8] group-hover:text-[#ff8ecb] transition-colors" />
                <span className="text-[11px] font-mono text-[#b7a2d9] group-hover:text-[#ff8ecb]">留言</span>
              </button>

              {/* 5. 更多 */}
              <button
                onClick={handleGenerateCharFeed}
                disabled={isGeneratingFeed}
                className="flex flex-col items-center gap-1 py-1 text-[#f7d6e8] hover:text-[#ff8ecb] transition-colors jelly-btn group"
              >
                <Menu className="w-5 h-5 stroke-[1.8] text-[#f7d6e8] group-hover:text-[#ff8ecb] transition-colors" />
                <span className="text-[11px] font-mono text-[#b7a2d9] group-hover:text-[#ff8ecb]">更多</span>
              </button>
            </div>

            {/* 4. 动态说说卡片流 (严格过滤：删除的好友动态不显示，通讯录没有的好友动态不显示) */}
            <div className="px-3 space-y-3 pt-1">
              {displayedFeeds.length === 0 ? (
                <div className="py-12 px-4 rounded-2xl bg-[#1b1025]/60 border border-[#3b2a5a]/50 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#2a1738] border border-[#ff8ecb]/30 flex items-center justify-center text-xl">
                    🌸
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-[#f7d6e8]">暂无好友动态</div>
                    <div className="text-xs text-[#b7a2d9]/70 max-w-xs mx-auto">
                      通讯录好友动态会在此展示。你也可以发布新说说或召唤好友动态 ♡
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      onClick={() => setIsPublishingFeedModal(true)}
                      className="px-3.5 py-1.5 rounded-full bg-[#ff8ecb] text-[#1a0f24] font-bold text-xs jelly-btn hover:opacity-90 shadow-sm"
                    >
                      发说说
                    </button>
                    {personas.length > 0 && (
                      <button
                        onClick={handleGenerateCharFeed}
                        disabled={isGeneratingFeed}
                        className="px-3.5 py-1.5 rounded-full bg-[#2a1738] border border-[#ff8ecb]/50 text-[#ff8ecb] font-bold text-xs jelly-btn hover:bg-[#341b47]"
                      >
                        {isGeneratingFeed ? '召唤中...' : '召唤动态'}
                      </button>
                    )}
                  </div>
                </div>
              ) : displayedFeeds.map((feed) => {
                  const isUserSelf =
                    feed.authorId === 'user_self' ||
                    feed.authorId === 'user' ||
                    (userProfile?.id && feed.authorId === userProfile.id) ||
                    feed.authorName === currentUserName ||
                    feed.authorName === '小手机用户' ||
                    feed.authorName === '苇苇草';

                  const matchedContact = personas.find(
                    (p) => p.id === feed.authorId || p.name === feed.authorName
                  );

                  const displayAuthorName = isUserSelf
                    ? currentUserName
                    : matchedContact?.name || feed.authorName;

                  const displayAuthorAvatar = isUserSelf
                    ? userProfile?.avatar || feed.authorAvatar || 'bunny'
                    : matchedContact?.avatar || feed.authorAvatar;

                  const isLikedByMe = feed.likes.some(
                    (name) => name === currentUserName || name === '苇苇草' || name === '小手机用户'
                  );

                  const displayLikes = feed.likes.map((name) =>
                    name === '苇苇草' || name === '小手机用户' ? currentUserName : name
                  );

                  return (
                    <div
                      key={feed.id}
                      className="p-3.5 rounded-2xl bg-[#1b1025]/90 border border-[#3b2a5a]/70 space-y-3 shadow-md hover:border-[#ff8ecb]/35 transition-all"
                    >
                      {/* 发帖人信息 (参考截图：圆形头像 + 萌系边框 + 红色/粉色加粗昵称 + 💎/🎀等VIP标签 + 设备与时间) */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          {/* 圆形头像配萌系边框 */}
                          <div className="relative w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-[#ff8ecb] via-[#d88fbf] to-[#9b5de5] shadow-sm shrink-0">
                            <div className="w-full h-full rounded-full bg-[#231535] flex items-center justify-center overflow-hidden">
                              {renderAvatar(displayAuthorAvatar, 'w-7 h-7')}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs sm:text-sm font-bold text-[#ff8ecb]">
                                {displayAuthorName}
                              </span>
                              {feed.vipTag && (
                                <span className="text-[11px]">{feed.vipTag}</span>
                              )}
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#ff8ecb]/15 text-[#ff8ecb] border border-[#ff8ecb]/30 font-mono">
                                {isUserSelf ? '本人' : '好友'}
                              </span>
                            </div>
                            <div className="text-[10px] text-[#b7a2d9]/60 font-mono mt-0.5">
                              {getFeedDeviceAndRelativeTime(feed)}
                            </div>
                          </div>
                        </div>

                        {/* 右侧萌系装饰物 + 删除按钮 */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs select-none">{feed.badgeDecoration || '☁️ 🎀'}</span>
                          <button
                            onClick={() => handleDeleteFeed(feed.id)}
                            className="p-1 text-[#b7a2d9]/50 hover:text-rose-400 transition-colors"
                            title="删除该条动态"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[1.8]" />
                          </button>
                        </div>
                      </div>

                      {/* 说说正文 */}
                      <p className="text-xs sm:text-[13px] text-[#f7d6e8] leading-relaxed break-words whitespace-pre-wrap">
                        {feed.content}
                      </p>

                      {/* 附加图片展示 (点击可以放大查看全貌) */}
                      {feed.imageUrl && (
                        <div
                          onClick={() => setPreviewImageUrl(feed.imageUrl!)}
                          className="rounded-xl overflow-hidden border border-[#3b2a5a] max-h-56 bg-[#140b1c] shadow-inner cursor-zoom-in relative group"
                          title="点击放大查看全貌"
                        >
                          <img
                            src={feed.imageUrl}
                            alt="说说插图"
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          />
                          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-sm text-[10px] text-white/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 select-none">
                            <span>点击放大</span>
                          </div>
                        </div>
                      )}

                      {/* 底部时间戳与操作按钮 (精准格式化：几天前发送的说说绝对不显示为“今天”) */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-[#b7a2d9]/60 font-mono">
                          {formatQzoneExactTime(feed.timestamp)}
                        </span>

                        <div className="flex items-center gap-3">
                          {/* 点赞按钮 (ThumbsUp 仿照截图) */}
                          <button
                            onClick={() => handleLikeFeed(feed.id)}
                            className={`flex items-center gap-1 text-xs transition-all jelly-btn ${
                              isLikedByMe ? 'text-[#ff8ecb] font-bold' : 'text-[#b7a2d9] hover:text-[#ff8ecb]'
                            }`}
                            title="点赞"
                          >
                            <ThumbsUp className={`w-4 h-4 ${isLikedByMe ? 'fill-[#ff8ecb] text-[#ff8ecb] animate-bounce' : 'stroke-[1.8]'}`} />
                          </button>

                          {/* 评论按钮 */}
                          <button
                            onClick={() => {
                              const inputElem = document.getElementById(`feed-input-${feed.id}`);
                              inputElem?.focus();
                            }}
                            className="flex items-center gap-1 text-xs text-[#b7a2d9] hover:text-[#ff8ecb] transition-colors jelly-btn"
                            title="评论"
                          >
                            <MessageSquare className="w-4 h-4 stroke-[1.8]" />
                          </button>

                          {/* 转发按钮 */}
                          <button
                            onClick={() => {
                              setToolToast('已转发说说到我的空间~');
                              setTimeout(() => setToolToast(null), 1500);
                            }}
                            className="flex items-center gap-1 text-xs text-[#b7a2d9] hover:text-[#ff8ecb] transition-colors jelly-btn"
                            title="转发"
                          >
                            <Share2 className="w-4 h-4 stroke-[1.8]" />
                          </button>
                        </div>
                      </div>

                      {/* 点赞列表栏 (同步当前网名，支持多人赞展示) */}
                      {displayLikes.length > 0 && (
                        <div className="flex items-center gap-1.5 text-[11px] text-[#b7a2d9] px-2.5 py-1.5 rounded-xl bg-[#150d1e] border border-[#3b2a5a]/50">
                          <ThumbsUp className="w-3.5 h-3.5 text-[#ff8ecb] fill-[#ff8ecb] shrink-0" />
                          <span className="truncate">
                            <span className="text-[#ff8ecb] font-medium">{displayLikes.join('、')}</span> 等 {displayLikes.length} 人赞了
                          </span>
                        </div>
                      )}

                      {/* 评论列表 (点击任意评论即可回复该条评论) */}
                      {feed.comments.length > 0 && (
                        <div className="space-y-1.5 px-2.5 py-2 rounded-xl bg-[#150d1e]/80 border border-[#3b2a5a]/40">
                          {feed.comments.map((cmt) => {
                            const isCmtUser =
                              cmt.authorName === '苇苇草' ||
                              cmt.authorName === '小手机用户' ||
                              cmt.authorName === currentUserName;
                            const cmtAuthor = isCmtUser ? currentUserName : cmt.authorName;

                            return (
                              <div
                                key={cmt.id}
                                onClick={() => {
                                  setReplyingToComment({
                                    feedId: feed.id,
                                    commentId: cmt.id,
                                    authorName: cmtAuthor,
                                  });
                                  const inputElem = document.getElementById(`feed-input-${feed.id}`);
                                  inputElem?.focus();
                                }}
                                className="text-[11px] leading-snug p-1 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group flex items-start justify-between gap-2"
                                title={`点击回复 @${cmtAuthor}`}
                              >
                                <div className="flex-1">
                                  <span className="font-bold text-[#ff8ecb] hover:underline">
                                    {cmtAuthor}:
                                  </span>
                                  <span className="text-[#f7d6e8] ml-1">{cmt.content}</span>
                                </div>
                                <span className="text-[10px] text-[#b7a2d9]/40 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                  回复
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                    {/* 发送评论输入框 (支持快捷回复指定评论) */}
                    <div className="flex flex-col gap-1 pt-0.5">
                      {replyingToComment && replyingToComment.feedId === feed.id && (
                        <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-[#231535] border border-[#ff8ecb]/40 text-[10px] text-[#ff8ecb] animate-in slide-in-from-bottom-1 duration-150">
                          <span>正在回复 @{replyingToComment.authorName}</span>
                          <button
                            type="button"
                            onClick={() => setReplyingToComment(null)}
                            className="text-[#b7a2d9] hover:text-white p-0.5"
                            title="取消回复"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <input
                          id={`feed-input-${feed.id}`}
                          type="text"
                          value={feedCommentInputs[feed.id] || ''}
                          onChange={(e) =>
                            setFeedCommentInputs({ ...feedCommentInputs, [feed.id]: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddFeedComment(feed.id);
                          }}
                          placeholder={
                            replyingToComment && replyingToComment.feedId === feed.id
                              ? `回复 @${replyingToComment.authorName}...`
                              : '评论一句说说吧...'
                          }
                          className="flex-1 px-3 py-1.5 text-xs bg-[#150d1e] text-[#f7d6e8] rounded-xl border border-[#3b2a5a] focus:outline-none focus:border-[#ff8ecb] font-mono"
                        />
                        <button
                          onClick={() => handleAddFeedComment(feed.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#2e1d3e] text-[11px] font-bold text-[#ff8ecb] hover:bg-[#3d2652] jelly-btn shadow-sm"
                        >
                          发送
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* =========================================
          底部四大主板块切换栏 (像真正的QQ一样)
          ========================================= */}
      <div
        className={`h-14 px-4 border-t flex items-center justify-around z-20 shrink-0 ${
          isAqua
            ? 'bg-white/95 border-[#7dd3fc]'
            : 'bg-[#1e1328]/95 border-[#3b2a5a]'
        }`}
      >
        {/* 1. 消息 */}
        <button
          onClick={() => setActiveTab('messages')}
          className={`flex flex-col items-center gap-0.5 relative jelly-btn ${
            activeTab === 'messages'
              ? isAqua
                ? 'text-[#0284c7] font-bold'
                : 'text-[#ff8ecb] font-bold'
              : isAqua
              ? 'text-[#0369a1]/70 hover:text-[#0284c7]'
              : 'text-[#b7a2d9]'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px]">消息</span>
          {activeTab === 'messages' && (
            <span
              className={`w-1.5 h-1.5 rounded-full absolute -top-1 right-2 ${
                isAqua ? 'bg-[#0284c7]' : 'bg-[#ff8ecb]'
              }`}
            ></span>
          )}
        </button>

        {/* 2. 频道 */}
        <button
          onClick={() => setActiveTab('channels')}
          className={`flex flex-col items-center gap-0.5 relative jelly-btn ${
            activeTab === 'channels'
              ? isAqua
                ? 'text-[#0284c7] font-bold'
                : 'text-[#ff8ecb] font-bold'
              : isAqua
              ? 'text-[#0369a1]/70 hover:text-[#0284c7]'
              : 'text-[#b7a2d9]'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px]">频道</span>
          {activeTab === 'channels' && (
            <span
              className={`w-1.5 h-1.5 rounded-full absolute -top-1 right-2 ${
                isAqua ? 'bg-[#0284c7]' : 'bg-[#ff8ecb]'
              }`}
            ></span>
          )}
        </button>

        {/* 3. 联系人 */}
        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex flex-col items-center gap-0.5 relative jelly-btn ${
            activeTab === 'contacts'
              ? isAqua
                ? 'text-[#0284c7] font-bold'
                : 'text-[#ff8ecb] font-bold'
              : isAqua
              ? 'text-[#0369a1]/70 hover:text-[#0284c7]'
              : 'text-[#b7a2d9]'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px]">联系人</span>
          {activeTab === 'contacts' && (
            <span
              className={`w-1.5 h-1.5 rounded-full absolute -top-1 right-2 ${
                isAqua ? 'bg-[#0284c7]' : 'bg-[#ff8ecb]'
              }`}
            ></span>
          )}
        </button>

        {/* 4. 动态 */}
        <button
          onClick={() => setActiveTab('zone')}
          className={`flex flex-col items-center gap-0.5 relative jelly-btn ${
            activeTab === 'zone'
              ? isAqua
                ? 'text-[#0284c7] font-bold'
                : 'text-[#ff8ecb] font-bold'
              : isAqua
              ? 'text-[#0369a1]/70 hover:text-[#0284c7]'
              : 'text-[#b7a2d9]'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px]">动态</span>
          {activeTab === 'zone' && (
            <span
              className={`w-1.5 h-1.5 rounded-full absolute -top-1 right-2 ${
                isAqua ? 'bg-[#0284c7]' : 'bg-[#ff8ecb]'
              }`}
            ></span>
          )}
        </button>
      </div>

      {/* =========================================
          弹窗 A: 论坛发帖弹窗 (用户可以生成/发帖)
          ========================================= */}
      {isPostingModalOpen && (
        <div className="absolute inset-0 bg-black/70 z-40 flex flex-col justify-end animate-in fade-in">
          <div className="bg-[#1e1328] rounded-t-3xl border-t border-[#4b3670] p-4 max-h-[85%] flex flex-col space-y-3">
            <div className="flex items-center justify-between border-b border-[#3b2a5a] pb-2">
              <span className="text-xs font-bold text-[#f7d6e8]">发布频道新帖</span>
              <button
                onClick={() => setIsPostingModalOpen(false)}
                className="text-xs text-[#b7a2d9] hover:text-white"
              >
                取消
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-[#b7a2d9] block mb-1">选择分板块</label>
                <div className="flex items-center gap-1.5">
                  {(['趣事', '日常', '树洞', '安利', '讨论'] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewPostCategory(c)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        newPostCategory === c
                          ? 'bg-[#ff8ecb] text-[#1a1120]'
                          : 'bg-[#251535] text-[#b7a2d9] border border-[#3b2a5a]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#b7a2d9] block mb-1">帖子标题</label>
                <input
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="起一个吸引人的标题吧..."
                  className="w-full px-3 py-2 text-xs bg-[#150d1e] text-[#f7d6e8] rounded-xl border border-[#4b3670] focus:outline-none focus:border-[#ff8ecb]"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#b7a2d9] block mb-1">帖子内容</label>
                <textarea
                  rows={4}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="详细分享你的趣事或见闻..."
                  className="w-full px-3 py-2 text-xs bg-[#150d1e] text-[#f7d6e8] rounded-xl border border-[#4b3670] focus:outline-none focus:border-[#ff8ecb] leading-relaxed"
                ></textarea>
              </div>

              <button
                onClick={handleCreatePost}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] text-xs font-bold shadow-md hover:opacity-95 jelly-btn"
              >
                立即发布
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          弹窗 B: 帖子详情与回复弹窗
          ========================================= */}
      {activeViewingPost && (
        <div className="absolute inset-0 bg-black/75 z-40 flex flex-col justify-end animate-in fade-in">
          <div className="bg-[#1e1328] rounded-t-3xl border-t border-[#4b3670] p-4 max-h-[88%] flex flex-col space-y-3">
            <div className="flex items-center justify-between border-b border-[#3b2a5a] pb-2">
              <span className="text-xs font-bold text-[#f7d6e8]">帖子详情</span>
              <button
                onClick={() => setActiveViewingPost(null)}
                className="text-xs text-[#b7a2d9] hover:text-white"
              >
                关闭
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <div>
                <span className="px-2 py-0.5 rounded-full bg-[#2a1738] border border-[#ff8ecb]/40 text-[9px] font-bold text-[#ff8ecb]">
                  #{activeViewingPost.category}
                </span>
                <h3 className="text-sm font-bold text-[#f7d6e8] mt-1">{activeViewingPost.title}</h3>
                <div className="text-[10px] text-[#b7a2d9]/60 mt-0.5">
                  {activeViewingPost.authorName} · {formatTime(activeViewingPost.timestamp)}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#150d1e] text-xs text-[#f7d6e8] leading-relaxed border border-[#3b2a5a]">
                {activeViewingPost.content}
              </div>

              {/* 回复列表 */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#b7a2d9]">
                  全部回复 ({activeViewingPost.replies.length})
                </div>

                {activeViewingPost.replies.map((rep) => (
                  <div key={rep.id} className="p-2.5 rounded-xl bg-[#160d20] border border-[#3b2a5a]/60 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-[#ff8ecb]">{rep.authorName}</span>
                      <span className="text-[#b7a2d9]/50">{formatTime(rep.timestamp)}</span>
                    </div>
                    <div className="text-xs text-[#f7d6e8]">{rep.content}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 回复输入条 */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#3b2a5a]">
              <input
                type="text"
                value={channelReplyInput}
                onChange={(e) => setChannelReplyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddChannelReply(activeViewingPost.id);
                }}
                placeholder="参与讨论回复楼主..."
                className="flex-1 px-3 py-2 text-xs bg-[#150d1e] text-[#f7d6e8] rounded-xl border border-[#4b3670] focus:outline-none focus:border-[#ff8ecb]"
              />
              <button
                onClick={() => handleAddChannelReply(activeViewingPost.id)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] text-xs font-bold jelly-btn"
              >
                回复
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          弹窗 C: 发布空间说说弹窗
          ========================================= */}
      {isPublishingFeedModal && (
        <div className="absolute inset-0 bg-black/70 z-40 flex flex-col justify-end animate-in fade-in">
          <div className="bg-[#1e1328] rounded-t-3xl border-t border-[#4b3670] p-4 max-h-[85%] flex flex-col space-y-3">
            <div className="flex items-center justify-between border-b border-[#3b2a5a] pb-2">
              <span className="text-xs font-bold text-[#f7d6e8]">发布 QQ 空间说说</span>
              <button
                onClick={() => setIsPublishingFeedModal(false)}
                className="text-xs text-[#b7a2d9] hover:text-white"
              >
                取消
              </button>
            </div>

            <textarea
              rows={4}
              value={feedInputText}
              onChange={(e) => setFeedInputText(e.target.value)}
              placeholder="分享你此刻的心情、奇思妙想或今日碎片..."
              className="w-full px-3 py-2 text-xs bg-[#150d1e] text-[#f7d6e8] rounded-xl border border-[#4b3670] focus:outline-none focus:border-[#ff8ecb] leading-relaxed"
            ></textarea>

            {/* 附加图片预览与上传 */}
            <div className="flex items-center gap-3">
              <label className="px-3 py-1.5 rounded-xl bg-[#2e1d3e] text-xs font-bold text-[#ff8ecb] border border-[#d88fbf]/50 hover:bg-[#3d2652] cursor-pointer flex items-center gap-1.5 jelly-btn">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{feedAttachedImg ? '更换配图' : '添加配图'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const r = new FileReader();
                    r.onload = (evt) => setFeedAttachedImg(evt.target?.result as string);
                    r.readAsDataURL(file);
                  }}
                  className="hidden"
                />
              </label>

              {feedAttachedImg && (
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#ff8ecb] relative">
                  <img src={feedAttachedImg} alt="预览" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setFeedAttachedImg(null)}
                    className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handlePublishFeed}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] text-xs font-bold shadow-md hover:opacity-95 jelly-btn"
            >
              发表说说
            </button>
          </div>
        </div>
      )}

      {/* =========================================
          弹窗 D: 说说配图全屏大图预览 Lightbox
          ========================================= */}
      {previewImageUrl && (
        <div
          onClick={() => setPreviewImageUrl(null)}
          className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-150 cursor-zoom-out select-none"
        >
          <button
            onClick={() => setPreviewImageUrl(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all z-10 jelly-btn"
            title="关闭大图"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
          <img
            src={previewImageUrl}
            alt="放大查看"
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[88vh] object-contain rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] animate-in zoom-in-95 duration-200"
          />
        </div>
      )}
      {/* =========================================
          弹窗 E: 通讯录角色 (char) 头像上传与选择系统
          ========================================= */}
      {charForAvatarModal && (
        <AvatarPickerModal
          currentAvatar={charForAvatarModal.avatar || 'cat'}
          isOpen={!!charForAvatarModal}
          onClose={() => setCharForAvatarModal(null)}
          onSelectAvatar={(newAvatar) => {
            if (charForAvatarModal && onSavePersonas) {
              const updated = personas.map((p) =>
                p.id === charForAvatarModal.id ? { ...p, avatar: newAvatar } : p
              );
              onSavePersonas(updated);
              setToolToast(`「${charForAvatarModal.name}」的头像已更新 ♡`);
              setTimeout(() => setToolToast(null), 2000);
            }
          }}
          title={`更换「${charForAvatarModal.name}」的头像`}
        />
      )}

      {/* =========================================
          弹窗 F: QQ空间专属背景/横幅上传与选择系统 (与用户App背景横幅独立不同步)
          ========================================= */}
      <BannerPickerModal
        currentBanner={qzoneBanner}
        isOpen={isQzoneBannerPickerOpen}
        onClose={() => setIsQzoneBannerPickerOpen(false)}
        onSelectBanner={(newBanner) => {
          setQzoneBanner(newBanner);
          saveStoredData('qq_qzone_cover_banner_v2', newBanner);
          setToolToast('QQ空间背景横幅已更新生效 ♡');
          setTimeout(() => setToolToast(null), 2000);
        }}
        title="上传 / 更换QQ空间背景横幅"
      />
    </div>
  );
};
