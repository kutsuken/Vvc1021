import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowLeft,
  Trash2,
  Sliders,
  Send,
  RotateCcw,
  Sparkles,
  Square,
  MoreHorizontal,
  Bookmark,
  GitBranch,
  Image as ImageIcon,
  Edit3,
  BookmarkCheck,
  PauseCircle,
  CheckCircle2,
  X,
  Check,
  Layers,
  Plus,
  Compass,
  PenTool,
  Users,
  Search,
  Download,
  Palette,
  Copy,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  ApiConfig,
  CharacterPersona,
  ChatMessage,
  PresetItem,
  UserProfile,
  WorldBookItem,
  MemoryItem,
} from '../types/phone';
import {
  DEFAULT_OFFLINE_CONFIG,
  OfflineConfig,
  OfflineInviteInfo,
  OfflineMessage,
  OfflineRouteBranch,
  OfflineSession,
  OfflineStoryNode,
} from '../types/offline';
import { loadStoredData, saveStoredData } from '../utils/storage';
import { OfflineSettingsModal } from './OfflineSettingsModal';
import { buildOfflineSystemPrompt, parseOfflineResponse } from '../utils/offlineAiService';
import { sendChat } from '../utils/aiService';
import { createRawMemoryFromOffline } from '../utils/memoryService';
import { generateNovelIllustration } from '../utils/novelIllustrationService';

interface OfflineAppProps {
  personas: CharacterPersona[];
  activeCharacterId?: string;
  onChangeActiveCharacter?: (id: string) => void;
  messages: ChatMessage[];
  worldbooks: WorldBookItem[];
  presets: PresetItem[];
  activeApi: ApiConfig | null;
  userProfile?: UserProfile;
  params?: Record<string, any>;
  onBack: () => void;
  onOpenQQ?: () => void;
  onSaveMemories?: React.Dispatch<React.SetStateAction<MemoryItem[]>>;
  offlineAwayCharIds?: string[];
  onUpdateOfflineAway?: React.Dispatch<React.SetStateAction<string[]>>;
  currentTheme?: string;
}

const STORAGE_KEY_SESSIONS = 'phone_offline_sessions_v2';
const STORAGE_KEY_CONFIG = 'phone_offline_config_v2';

export const OfflineApp: React.FC<OfflineAppProps> = ({
  personas,
  activeCharacterId,
  messages,
  worldbooks,
  presets,
  activeApi,
  userProfile,
  params,
  onBack,
  onSaveMemories,
  onUpdateOfflineAway,
  currentTheme = 'sky',
}) => {
  const isAqua = currentTheme === 'aqua_pixel';
  // 当前选择的角色
  const [selectedCharId, setSelectedCharId] = useState<string>(() => {
    return (
      params?.characterId ||
      activeCharacterId ||
      personas[0]?.id ||
      'char_ruanruan'
    );
  });

  const currentChar = useMemo(() => {
    return (
      personas.find((p) => p.id === selectedCharId) ||
      personas[0] || {
        id: 'char_default',
        name: '好友',
        remarks: '线下伙伴',
        avatar: 'bunny',
        personaPrompt: '温柔体贴的伙伴。',
        boundWorldBookIds: [],
        createdAt: Date.now(),
      }
    );
  }, [personas, selectedCharId]);

  // 全局配置持久化
  const [config, setConfig] = useState<OfflineConfig>(() => {
    return loadStoredData<OfflineConfig>(STORAGE_KEY_CONFIG, DEFAULT_OFFLINE_CONFIG);
  });

  // 会话存储映射 (每个角色的会话持久化)
  const [sessionsMap, setSessionsMap] = useState<Record<string, OfflineSession>>(() => {
    return loadStoredData<Record<string, OfflineSession>>(STORAGE_KEY_SESSIONS, {});
  });

  // 当前会话
  const currentSession: OfflineSession = useMemo(() => {
    const raw = sessionsMap[selectedCharId];
    if (raw) {
      if (!raw.routes || raw.routes.length === 0) {
        const defaultRoute: OfflineRouteBranch = {
          id: raw.activeRouteId || 'route_main',
          name: '主线剧情（初始路线）',
          createdAt: raw.createdAt || Date.now(),
          messages: raw.messages || [],
        };
        return {
          ...raw,
          routes: [defaultRoute],
          activeRouteId: defaultRoute.id,
        };
      }
      return raw;
    }
    const defaultRoute: OfflineRouteBranch = {
      id: 'route_main',
      name: '主线剧情（初始路线）',
      createdAt: Date.now(),
      messages: [],
    };
    return {
      id: `off_sess_${selectedCharId}`,
      characterId: selectedCharId,
      mode: (params?.mode as any) || 'direct',
      inviteInfo: params?.inviteInfo,
      messages: [],
      config,
      savedNodes: [],
      routes: [defaultRoute],
      activeRouteId: 'route_main',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }, [sessionsMap, selectedCharId, params, config]);

  // 当前有效剧情线路列表与当前激活线路
  const currentRoutes = useMemo(() => {
    return currentSession.routes && currentSession.routes.length > 0
      ? currentSession.routes
      : [
          {
            id: 'route_main',
            name: '主线剧情（初始路线）',
            createdAt: currentSession.createdAt || Date.now(),
            messages: currentSession.messages,
          },
        ];
  }, [currentSession.routes, currentSession.createdAt, currentSession.messages]);

  const activeRoute = useMemo(() => {
    const curId = currentSession.activeRouteId || 'route_main';
    return currentRoutes.find((r) => r.id === curId) || currentRoutes[0];
  }, [currentRoutes, currentSession.activeRouteId]);

  // 弹窗与操作状态
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // ➕ 拓展工具栏状态与各大专属弹窗
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [isVersionsModalOpen, setIsVersionsModalOpen] = useState(false);
  const [isGuidanceModalOpen, setIsGuidanceModalOpen] = useState(false);
  const [isParticipatingModalOpen, setIsParticipatingModalOpen] = useState(false);
  const [isNodesModalOpen, setIsNodesModalOpen] = useState(false);
  const [nodesModalTab, setNodesModalTab] = useState<'routes' | 'nodes'>('routes');
  const [renamingRouteId, setRenamingRouteId] = useState<string | null>(null);
  const [newRouteNameInput, setNewRouteNameInput] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAppearanceModalOpen, setIsAppearanceModalOpen] = useState(false);

  // 更多菜单与文本编辑
  const [openMoreMsgId, setOpenMoreMsgId] = useState<string | null>(null);
  const [guidingMsgId, setGuidingMsgId] = useState<string | null>(null);
  const [guidePrompt, setGuidePrompt] = useState('');
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // 搜索关键字
  const [searchQuery, setSearchQuery] = useState('');

  // 临时编辑全局写作指导
  const [tempGuidance, setTempGuidance] = useState(config.writingGuidance || '');

  // 输入与生成状态
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingLabel, setGeneratingLabel] = useState<string>('正在描写互动...');
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [expandedThoughtIds, setExpandedThoughtIds] = useState<Record<string, boolean>>({});

  const abortControllerRef = useRef<AbortController | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // 初始化响应外部参数
  useEffect(() => {
    if (params?.characterId && params.characterId !== selectedCharId) {
      setSelectedCharId(params.characterId);
    }
  }, [params, selectedCharId]);

  // 滚动到底部
  const scrollToBottom = (smooth = true) => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession.messages.length, isGenerating]);

  // 保存当前会话到持久化
  const updateCurrentSession = (updater: (prev: OfflineSession) => OfflineSession) => {
    setSessionsMap((prevMap) => {
      const existing = prevMap[selectedCharId] || currentSession;
      const updated = updater(existing);

      // 同步更新当前活跃线路中的完整消息
      const curActiveId = updated.activeRouteId || 'route_main';
      const existingRoutes = (updated.routes && updated.routes.length > 0)
        ? updated.routes
        : [{ id: 'route_main', name: '主线剧情（初始路线）', createdAt: updated.createdAt || Date.now(), messages: updated.messages }];

      const syncedRoutes = existingRoutes.map((r) =>
        r.id === curActiveId ? { ...r, messages: updated.messages } : r
      );

      const nextSession: OfflineSession = {
        ...updated,
        routes: syncedRoutes,
        activeRouteId: curActiveId,
      };

      const nextMap = { ...prevMap, [selectedCharId]: nextSession };
      saveStoredData(STORAGE_KEY_SESSIONS, nextMap);
      return nextMap;
    });
  };

  // 保存配置
  const handleSaveConfig = (newConfig: OfflineConfig) => {
    setConfig(newConfig);
    saveStoredData(STORAGE_KEY_CONFIG, newConfig);
    updateCurrentSession((prev) => ({ ...prev, config: newConfig }));
    showToast('线下小说设置已保存');
  };

  const showToast = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 2400);
  };

  // 提取当前角色线上聊天最近上下文
  const chatContextSummary = useMemo(() => {
    const charMsgs = messages.filter((m) => m.characterId === selectedCharId);
    if (charMsgs.length === 0) return '';
    const recent = charMsgs.slice(-10);
    return recent
      .map((m) => `${m.sender === 'user' ? '玩家' : currentChar.name}: ${m.content}`)
      .join('\n');
  }, [messages, selectedCharId, currentChar.name]);

  // =========================================================
  // 发送用户输入并生成小说后续段落
  // =========================================================
  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend ?? inputText).trim();
    if (!content || isGenerating) return;

    if (!activeApi) {
      showToast('未检测到可用的 AI 服务，请先在设置中激活 AI');
      return;
    }

    const userMsg: OfflineMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
      wordCount: content.replace(/\s+/g, '').length,
    };

    // 🌟 需求 2: 每次生成新段落，清理之前所有段落的走向选项，让之前的选项消失，不留在记录里
    const cleanedPrev = currentSession.messages.map((m) =>
      m.branchOptions ? { ...m, branchOptions: undefined } : m
    );

    const nextMessages = [...cleanedPrev, userMsg];
    updateCurrentSession((prev) => ({
      ...prev,
      messages: nextMessages,
      updatedAt: Date.now(),
    }));

    setInputText('');
    setIsGenerating(true);
    setGeneratingLabel(`${currentChar.name} 正在描写小说剧情...`);

    const abortCtrl = new AbortController();
    abortControllerRef.current = abortCtrl;

    try {
      const systemPrompt = buildOfflineSystemPrompt(
        currentChar,
        config,
        currentSession.mode,
        currentSession.inviteInfo,
        chatContextSummary,
        userProfile,
        presets,
        worldbooks,
        personas
      );

      const apiMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...nextMessages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ];

      const rawResponse = await sendChat(activeApi, apiMessages, abortCtrl.signal);
      const parsed = parseOfflineResponse(rawResponse);

      const assistantMsg: OfflineMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: parsed.content,
        thought: parsed.thought,
        wordCount: parsed.wordCount,
        branchOptions: config.enableBranchOptions ? parsed.branchOptions : undefined,
        versions: [parsed.content],
        currentVersionIndex: 0,
        timestamp: Date.now(),
      };

      updateCurrentSession((prev) => ({
        ...prev,
        messages: [...nextMessages, assistantMsg],
        updatedAt: Date.now(),
      }));

      // 若有记忆保存接口，联动生成一条线下记忆记录
      if (onSaveMemories && nextMessages.length === 2) {
        const memTitle =
          currentSession.mode === 'invite' && currentSession.inviteInfo
            ? `在${currentSession.inviteInfo.location}见面相聚`
            : `面对面现实互动`;
        const memoryItem = createRawMemoryFromOffline(
          memTitle,
          parsed.content.slice(0, 80),
          currentChar.name,
          currentChar.id
        );
        onSaveMemories((prev) => [memoryItem, ...prev]);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        showToast('已停止生成');
      } else {
        console.error(err);
        showToast(`生成异常: ${err.message || '网络或API异常'}`);
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  // 🌟 需求 2: 点击选项生成新段落，同时立即让历史选项消失，不要留在记录里
  const handleSelectBranchOption = async (sourceMsgId: string, optionContent: string) => {
    if (isGenerating) return;
    setInputText('');
    // 立即移除当前及之前所有历史消息中的 branchOptions
    updateCurrentSession((prev) => ({
      ...prev,
      messages: prev.messages.map((m) =>
        m.branchOptions ? { ...m, branchOptions: undefined } : m
      ),
      updatedAt: Date.now(),
    }));
    await handleSendMessage(optionContent);
  };

  // 🌟 需求 1: 用户消息重roll功能 (重新生成后续小说剧情)
  const handleUserReroll = (userMsgId: string) => {
    if (isGenerating) return;
    const targetIdx = currentSession.messages.findIndex((m) => m.id === userMsgId);
    if (targetIdx === -1) return;

    // 检查此用户发言后是否有 assistant 消息
    const nextMsg = currentSession.messages[targetIdx + 1];
    if (nextMsg && nextMsg.role === 'assistant') {
      handleReroll(nextMsg.id);
    } else {
      handleRegenerateAfterUserMsg(targetIdx);
    }
  };

  const handleRegenerateAfterUserMsg = async (userMsgIdx: number) => {
    if (isGenerating || !activeApi) return;
    // 截取到当前用户消息，并清理历史所有走向选项
    const historyUpToUser = currentSession.messages
      .slice(0, userMsgIdx + 1)
      .map((m) => (m.branchOptions ? { ...m, branchOptions: undefined } : m));

    setIsGenerating(true);
    setGeneratingLabel(`${currentChar.name} 正在重新描写小说剧情...`);

    const abortCtrl = new AbortController();
    abortControllerRef.current = abortCtrl;

    try {
      const systemPrompt = buildOfflineSystemPrompt(
        currentChar,
        config,
        currentSession.mode,
        currentSession.inviteInfo,
        chatContextSummary,
        userProfile,
        presets,
        worldbooks,
        personas
      );

      const apiMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...historyUpToUser.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ];

      const rawResponse = await sendChat(activeApi, apiMessages, abortCtrl.signal);
      const parsed = parseOfflineResponse(rawResponse);

      const assistantMsg: OfflineMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: parsed.content,
        thought: parsed.thought,
        wordCount: parsed.wordCount,
        branchOptions: config.enableBranchOptions ? parsed.branchOptions : undefined,
        versions: [parsed.content],
        currentVersionIndex: 0,
        timestamp: Date.now(),
      };

      updateCurrentSession((prev) => ({
        ...prev,
        messages: [...historyUpToUser, assistantMsg],
        updatedAt: Date.now(),
      }));
      showToast('已重新生成小说段落！');
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        showToast(`重roll失败: ${err.message || '请检查API'}`);
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  // =========================================================
  // 功能 4 & ➕: 重roll (并保留版本历史，最多5个)
  // =========================================================
  const handleReroll = async (msgId: string) => {
    if (isGenerating) return;
    const targetIdx = currentSession.messages.findIndex((m) => m.id === msgId);
    if (targetIdx === -1) return;

    const historyBefore = currentSession.messages.slice(0, targetIdx);
    if (historyBefore.length === 0) return;

    setIsGenerating(true);
    setGeneratingLabel(`${currentChar.name} 正在重新推演构思...`);
    setOpenMoreMsgId(null);
    setGuidingMsgId(null);

    const abortCtrl = new AbortController();
    abortControllerRef.current = abortCtrl;

    try {
      const systemPrompt = buildOfflineSystemPrompt(
        currentChar,
        config,
        currentSession.mode,
        currentSession.inviteInfo,
        chatContextSummary,
        userProfile,
        presets,
        worldbooks,
        personas
      );

      const apiMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...historyBefore.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ];

      const rawResponse = await sendChat(activeApi!, apiMessages, abortCtrl.signal);
      const parsed = parseOfflineResponse(rawResponse);

      const oldMsg = currentSession.messages[targetIdx];
      const oldVersions = oldMsg.versions && oldMsg.versions.length > 0 ? oldMsg.versions : [oldMsg.content];
      const updatedVersions = [...oldVersions, parsed.content].slice(-5); // 最多保存5个版本

      const updatedMsg: OfflineMessage = {
        ...oldMsg,
        content: parsed.content,
        thought: parsed.thought,
        wordCount: parsed.wordCount,
        branchOptions: parsed.branchOptions,
        versions: updatedVersions,
        currentVersionIndex: updatedVersions.length - 1,
        timestamp: Date.now(),
      };

      const newMessages = [...currentSession.messages];
      newMessages[targetIdx] = updatedMsg;

      updateCurrentSession((prev) => ({
        ...prev,
        messages: newMessages,
        updatedAt: Date.now(),
      }));

      showToast(`已重roll生成新版本（第 ${updatedVersions.length} 版）`);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        showToast(`重roll失败: ${err.message || '请检查API'}`);
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  // ➕ 重roll上一轮 (快捷操作)
  const handleRerollLastRound = () => {
    setIsPlusMenuOpen(false);
    const lastAssistant = [...currentSession.messages].reverse().find((m) => m.role === 'assistant');
    if (lastAssistant) {
      handleReroll(lastAssistant.id);
    } else {
      showToast('当前暂无可重roll的轮次');
    }
  };

  // =========================================================
  // 功能 4: 指导重写
  // =========================================================
  const handleExecuteGuidedRewrite = async (msgId: string, guidance: string) => {
    if (isGenerating || !guidance.trim()) return;
    const targetIdx = currentSession.messages.findIndex((m) => m.id === msgId);
    if (targetIdx === -1) return;

    const historyBefore = currentSession.messages.slice(0, targetIdx);
    if (historyBefore.length === 0) return;

    setIsGenerating(true);
    setGeneratingLabel('正在按照指导重写小说段落...');
    setGuidingMsgId(null);
    setOpenMoreMsgId(null);

    const abortCtrl = new AbortController();
    abortControllerRef.current = abortCtrl;

    try {
      let systemPrompt = buildOfflineSystemPrompt(
        currentChar,
        config,
        currentSession.mode,
        currentSession.inviteInfo,
        chatContextSummary,
        userProfile,
        presets,
        worldbooks,
        personas
      );

      systemPrompt += `\n\n【用户指导重写核心指令（最高优先级执行）】：
请重写刚才的小说段落，并严格贯彻以下要求：
“${guidance.trim()}”
要求：保持第三人称小说文学体裁、人物神态动作描写与字数控制要求。`;

      const apiMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...historyBefore.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ];

      const rawResponse = await sendChat(activeApi!, apiMessages, abortCtrl.signal);
      const parsed = parseOfflineResponse(rawResponse);

      const oldMsg = currentSession.messages[targetIdx];
      const oldVersions = oldMsg.versions && oldMsg.versions.length > 0 ? oldMsg.versions : [oldMsg.content];
      const updatedVersions = [...oldVersions, parsed.content].slice(-5);

      const updatedMsg: OfflineMessage = {
        ...oldMsg,
        content: parsed.content,
        thought: parsed.thought,
        wordCount: parsed.wordCount,
        branchOptions: parsed.branchOptions,
        versions: updatedVersions,
        currentVersionIndex: updatedVersions.length - 1,
        timestamp: Date.now(),
      };

      const newMessages = [...currentSession.messages];
      newMessages[targetIdx] = updatedMsg;

      updateCurrentSession((prev) => ({
        ...prev,
        messages: newMessages,
        updatedAt: Date.now(),
      }));

      showToast('已按照指导要求完成重写！');
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        showToast(`指导重写失败: ${err.message || '请检查API'}`);
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  // =========================================================
  // 功能 5: 更多菜单中的各项操作
  // =========================================================
  // 1. 续写本层
  const handleContinueLayer = async (msgId: string) => {
    if (isGenerating) return;
    const targetIdx = currentSession.messages.findIndex((m) => m.id === msgId);
    if (targetIdx === -1) return;

    setIsGenerating(true);
    setGeneratingLabel('正在续写本层内容...');
    setOpenMoreMsgId(null);

    const abortCtrl = new AbortController();
    abortControllerRef.current = abortCtrl;

    try {
      const messagesUpTo = currentSession.messages.slice(0, targetIdx + 1);
      let systemPrompt = buildOfflineSystemPrompt(
        currentChar,
        config,
        currentSession.mode,
        currentSession.inviteInfo,
        chatContextSummary,
        userProfile,
        presets,
        worldbooks,
        personas
      );

      systemPrompt += `\n\n【续写本层任务指示】：
请承接上一段小说的文意与情节，继续深入续写这层内容。不要重复上文，直接紧接着刚才的情景往下推演，描写接下来的互动动作、神态氛围与微小细节，字数约200~400字。`;

      const apiMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...messagesUpTo.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user' as const, content: '（请紧接着上一句继续写下去）' },
      ];

      const rawResponse = await sendChat(activeApi!, apiMessages, abortCtrl.signal);
      const parsed = parseOfflineResponse(rawResponse);

      const targetMsg = currentSession.messages[targetIdx];
      const appendedContent = `${targetMsg.content}\n\n${parsed.content.trim()}`;
      const updatedMsg: OfflineMessage = {
        ...targetMsg,
        content: appendedContent,
        wordCount: appendedContent.replace(/\s+/g, '').length,
      };

      const newMessages = [...currentSession.messages];
      newMessages[targetIdx] = updatedMsg;

      updateCurrentSession((prev) => ({
        ...prev,
        messages: newMessages,
        updatedAt: Date.now(),
      }));

      showToast('已完成本层续写拓展！');
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        showToast(`续写失败: ${err.message || '请检查API'}`);
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  // 2. 存为节点
  const handleSaveNode = (msgId: string) => {
    const targetIdx = currentSession.messages.findIndex((m) => m.id === msgId);
    if (targetIdx === -1) return;
    const targetMsg = currentSession.messages[targetIdx];

    const existingNodes = currentSession.savedNodes || [];
    const nodeName = `节点 ${existingNodes.length + 1} · ${currentChar.name}`;

    const newNode: OfflineStoryNode = {
      id: `node_${Date.now()}`,
      name: nodeName,
      messageId: msgId,
      createdAt: Date.now(),
      previewText: targetMsg.content.slice(0, 45),
    };

    const newMessages = currentSession.messages.map((m) =>
      m.id === msgId ? { ...m, isNode: true, nodeName } : m
    );

    updateCurrentSession((prev) => ({
      ...prev,
      messages: newMessages,
      savedNodes: [newNode, ...(prev.savedNodes || [])],
      updatedAt: Date.now(),
    }));

    setOpenMoreMsgId(null);
    showToast(`已存为故事节点：「${nodeName}」！`);
  };

  // 3. 从这里另开线路 (多了一条线，保留原线完整历史，可在工具箱的路线与节点切换版本)
  const handleBranchFromHere = (msgId: string) => {
    const targetIdx = currentSession.messages.findIndex((m) => m.id === msgId);
    if (targetIdx === -1) return;

    const targetMsg = currentSession.messages[targetIdx];
    const branchedMessages = currentSession.messages.slice(0, targetIdx + 1);

    const curActiveId = currentSession.activeRouteId || 'route_main';
    const existingRoutes = (currentSession.routes && currentSession.routes.length > 0)
      ? currentSession.routes
      : [
          {
            id: 'route_main',
            name: '主线剧情（初始路线）',
            createdAt: currentSession.createdAt || Date.now(),
            messages: currentSession.messages,
          },
        ];

    // 保存当前原线路的消息
    const updatedRoutes = existingRoutes.map((r) =>
      r.id === curActiveId ? { ...r, messages: currentSession.messages } : r
    );

    // 创建全新独立分歧线路
    const newRouteId = `route_${Date.now()}`;
    const branchNumber = updatedRoutes.length + 1;
    const newRouteName = `分歧线 ${branchNumber}（第${targetIdx + 1}楼另开）`;

    const newRoute: OfflineRouteBranch = {
      id: newRouteId,
      name: newRouteName,
      createdAt: Date.now(),
      forkMessageId: msgId,
      forkSnippet: targetMsg.content.slice(0, 36) + (targetMsg.content.length > 36 ? '...' : ''),
      messages: branchedMessages,
    };

    updateCurrentSession((prev) => ({
      ...prev,
      messages: branchedMessages,
      routes: [...updatedRoutes, newRoute],
      activeRouteId: newRouteId,
      updatedAt: Date.now(),
    }));

    setOpenMoreMsgId(null);
    showToast(`已成功另开全新线路：「${newRouteName}」！原线路已完好保留，可在工具箱切换。`);
  };

  // 🌟 需求 3: 切换线路版本
  const handleSwitchRoute = (targetRouteId: string) => {
    const existingRoutes = currentSession.routes || [];
    const targetRoute = existingRoutes.find((r) => r.id === targetRouteId);
    if (!targetRoute) {
      showToast('未找到该线路版本');
      return;
    }
    if (targetRoute.id === currentSession.activeRouteId) {
      showToast('当前已处于该线路版本');
      return;
    }

    const curActiveId = currentSession.activeRouteId || 'route_main';
    const updatedRoutes = existingRoutes.map((r) =>
      r.id === curActiveId ? { ...r, messages: currentSession.messages } : r
    );

    updateCurrentSession((prev) => ({
      ...prev,
      messages: targetRoute.messages,
      routes: updatedRoutes,
      activeRouteId: targetRoute.id,
      updatedAt: Date.now(),
    }));

    setIsNodesModalOpen(false);
    showToast(`已切换至线路版本：「${targetRoute.name}」`);
  };

  // 删除某条分歧线路
  const handleDeleteRoute = (routeId: string) => {
    const existingRoutes = currentSession.routes || [];
    if (existingRoutes.length <= 1) {
      showToast('至少保留一条剧情线路');
      return;
    }
    const filtered = existingRoutes.filter((r) => r.id !== routeId);
    let nextActiveId = currentSession.activeRouteId;
    let nextMessages = currentSession.messages;

    if (currentSession.activeRouteId === routeId) {
      const fallback = filtered[0];
      nextActiveId = fallback.id;
      nextMessages = fallback.messages;
    }

    updateCurrentSession((prev) => ({
      ...prev,
      routes: filtered,
      activeRouteId: nextActiveId,
      messages: nextMessages,
      updatedAt: Date.now(),
    }));
    showToast('已删除该分歧线路');
  };

  // 重命名线路
  const handleRenameRoute = (routeId: string, newName: string) => {
    if (!newName.trim()) return;
    const existingRoutes = currentSession.routes || [];
    const updatedRoutes = existingRoutes.map((r) =>
      r.id === routeId ? { ...r, name: newName.trim() } : r
    );
    updateCurrentSession((prev) => ({
      ...prev,
      routes: updatedRoutes,
      updatedAt: Date.now(),
    }));
    setRenamingRouteId(null);
    showToast('线路名称已更新');
  };

  // 从当前对话进度新建一条平行路线
  const handleCreateNewBranch = () => {
    const curActiveId = currentSession.activeRouteId || 'route_main';
    const existingRoutes = (currentSession.routes && currentSession.routes.length > 0)
      ? currentSession.routes
      : [
          {
            id: 'route_main',
            name: '主线剧情（初始路线）',
            createdAt: currentSession.createdAt || Date.now(),
            messages: currentSession.messages,
          },
        ];

    const updatedRoutes = existingRoutes.map((r) =>
      r.id === curActiveId ? { ...r, messages: currentSession.messages } : r
    );

    const newRouteId = `route_${Date.now()}`;
    const branchNumber = updatedRoutes.length + 1;
    const newRouteName = `分歧线 ${branchNumber}（平行分支）`;

    const newRoute: OfflineRouteBranch = {
      id: newRouteId,
      name: newRouteName,
      createdAt: Date.now(),
      messages: [...currentSession.messages],
    };

    updateCurrentSession((prev) => ({
      ...prev,
      routes: [...updatedRoutes, newRoute],
      activeRouteId: newRouteId,
      updatedAt: Date.now(),
    }));

    showToast(`已开辟全新平行线路：「${newRouteName}」！`);
  };

  // 4. 收藏
  const handleToggleFavorite = (msgId: string) => {
    const targetIdx = currentSession.messages.findIndex((m) => m.id === msgId);
    if (targetIdx === -1) return;

    const isFav = !currentSession.messages[targetIdx].isFavorite;
    const newMessages = currentSession.messages.map((m) =>
      m.id === msgId ? { ...m, isFavorite: isFav } : m
    );

    updateCurrentSession((prev) => ({
      ...prev,
      messages: newMessages,
      updatedAt: Date.now(),
    }));

    setOpenMoreMsgId(null);
    showToast(isFav ? '已将该段小说加入高光收藏 ★' : '已取消收藏');
  };

  // 5. 生图
  const handleGenerateImageForMsg = (msgId: string) => {
    const targetIdx = currentSession.messages.findIndex((m) => m.id === msgId);
    if (targetIdx === -1) return;
    const targetMsg = currentSession.messages[targetIdx];

    const illustration = generateNovelIllustration(targetMsg.content, currentChar.name);

    const newMessages = currentSession.messages.map((m) =>
      m.id === msgId ? { ...m, imageUrl: illustration.url } : m
    );

    updateCurrentSession((prev) => ({
      ...prev,
      messages: newMessages,
      updatedAt: Date.now(),
    }));

    setOpenMoreMsgId(null);
    showToast(`已生成场景唯美插图：${illustration.title}`);
  };

  // 6. 编辑 (支持修改角色消息与用户自己发的消息)
  const handleOpenEdit = (msgId: string) => {
    const targetMsg = currentSession.messages.find((m) => m.id === msgId);
    if (!targetMsg) return;
    setEditingMsgId(msgId);
    setEditText(targetMsg.content);
    setOpenMoreMsgId(null);
  };

  const handleSaveEdit = () => {
    if (!editingMsgId) return;
    const newContent = editText.trim();
    if (!newContent) {
      showToast('内容不能为空');
      return;
    }

    const newMessages = currentSession.messages.map((m) =>
      m.id === editingMsgId
        ? {
            ...m,
            content: newContent,
            wordCount: newContent.replace(/\s+/g, '').length,
          }
        : m
    );

    updateCurrentSession((prev) => ({
      ...prev,
      messages: newMessages,
      updatedAt: Date.now(),
    }));

    setEditingMsgId(null);
    showToast('修改已保存');
  };

  // 7. 删除 (支持删除角色消息与用户自己发的消息)
  const handleDeleteMsg = (msgId: string) => {
    const targetMsg = currentSession.messages.find((m) => m.id === msgId);
    const newMessages = currentSession.messages.filter((m) => m.id !== msgId);
    updateCurrentSession((prev) => ({
      ...prev,
      messages: newMessages,
      updatedAt: Date.now(),
    }));

    setOpenMoreMsgId(null);
    showToast(targetMsg?.role === 'user' ? '已删除该条我的消息' : '已删除该段内容');
  };

  // =========================================================
  // ➕ 拓展工具栏各功能执行逻辑
  // =========================================================

  // 本轮版本切换
  const latestAssistantMsg = useMemo(() => {
    return [...currentSession.messages].reverse().find((m) => m.role === 'assistant');
  }, [currentSession.messages]);

  const handleSwitchVersion = (versionIdx: number) => {
    if (!latestAssistantMsg || !latestAssistantMsg.versions) return;
    const targetVersionContent = latestAssistantMsg.versions[versionIdx];
    if (!targetVersionContent) return;

    const newMessages = currentSession.messages.map((m) =>
      m.id === latestAssistantMsg.id
        ? {
            ...m,
            content: targetVersionContent,
            wordCount: targetVersionContent.replace(/\s+/g, '').length,
            currentVersionIndex: versionIdx,
          }
        : m
    );

    updateCurrentSession((prev) => ({
      ...prev,
      messages: newMessages,
      updatedAt: Date.now(),
    }));

    showToast(`已更换为版本 #${versionIdx + 1}`);
  };

  // 路线与节点跳转 / 新分支
  const handleRevertToNode = (node: OfflineStoryNode) => {
    const targetIdx = currentSession.messages.findIndex((m) => m.id === node.messageId);
    if (targetIdx === -1) {
      showToast('未找到该节点对应的消息位置');
      return;
    }
    const sliced = currentSession.messages.slice(0, targetIdx + 1);
    updateCurrentSession((prev) => ({
      ...prev,
      messages: sliced,
      updatedAt: Date.now(),
    }));
    setIsNodesModalOpen(false);
    showToast(`已回溯至节点：「${node.name}」`);
  };

  const handleDeleteNode = (nodeId: string) => {
    const filteredNodes = (currentSession.savedNodes || []).filter((n) => n.id !== nodeId);
    updateCurrentSession((prev) => ({
      ...prev,
      savedNodes: filteredNodes,
      updatedAt: Date.now(),
    }));
    showToast('已删除该故事节点');
  };

  // 搜索楼层结果
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return currentSession.messages
      .map((m, index) => ({
        index: index + 1,
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
        matchIdx: m.content.toLowerCase().indexOf(q),
      }))
      .filter((m) => m.matchIdx !== -1);
  }, [currentSession.messages, searchQuery]);

  // 导出全文
  const fullNovelText = useMemo(() => {
    return currentSession.messages
      .map((m, idx) => {
        if (m.role === 'user') {
          return `【玩家】：\n${m.content}`;
        }
        return `【${currentChar.name}】：\n${m.content}`;
      })
      .join('\n\n');
  }, [currentSession.messages, currentChar.name]);

  const handleDownloadTxt = () => {
    const blob = new Blob([fullNovelText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentChar.name}_线下小说_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('已导出 TXT 小说文件');
  };

  const handleDownloadMarkdown = () => {
    const mdContent = `# 与 ${currentChar.name} 的线下小说相聚\n\n${fullNovelText}`;
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentChar.name}_线下小说_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('已导出 Markdown 小说文件');
  };

  // 样式美化变量
  const themeClass = useMemo(() => {
    switch (config.themeStyle) {
      case 'parchment':
        return 'bg-[#1b1510] text-[#f7eedc]';
      case 'slate':
        return 'bg-[#0f141d] text-[#e2e8f0]';
      case 'sakura':
        return 'bg-[#1a0c18] text-[#fce7f3]';
      case 'night':
      default:
        return isAqua
          ? 'bg-gradient-to-b from-[#f0f9ff] via-[#e0f2fe] to-[#bae6fd] text-[#0369a1]'
          : 'bg-gradient-to-b from-[#140b1d] via-[#100817] to-[#09040d] text-[#f7d6e8]';
    }
  }, [config.themeStyle, isAqua]);

  const fontClass = useMemo(() => {
    switch (config.fontFamily) {
      case 'sans':
        return 'font-sans';
      case 'kaiti':
        return 'font-serif tracking-widest';
      case 'serif':
      default:
        return 'font-serif';
    }
  }, [config.fontFamily]);

  const fontSizeClass = useMemo(() => {
    switch (config.fontSize) {
      case 'sm':
        return 'text-[13.5px] sm:text-[14px] leading-[1.9]';
      case 'lg':
        return 'text-[16px] sm:text-[17px] leading-[2.1]';
      case 'base':
      default:
        return 'text-[14.5px] sm:text-[15.5px] leading-[2.05]';
    }
  }, [config.fontSize]);

  // 功能 1: 删除这次线下记录 (全清空)
  const handleConfirmDeleteAllRecord = () => {
    updateCurrentSession((prev) => ({
      ...prev,
      messages: [],
      savedNodes: [],
      updatedAt: Date.now(),
    }));
    setIsDeleteConfirmOpen(false);
    showToast('已清空删除本次线下记录');
  };

  // 退出线下处理机制
  const handleTempLeave = () => {
    if (onUpdateOfflineAway) {
      onUpdateOfflineAway((prev) => Array.from(new Set([...prev, currentChar.id])));
    }
    setIsExitModalOpen(false);
    showToast(`已暂离线下，${currentChar.name}在线上将保持静默等待`);
    setTimeout(() => {
      onBack();
    }, 350);
  };

  // 🌟 需求 1: 删除并离开此次线下（不保存此次线下）
  const handleDeleteAndExit = () => {
    if (onUpdateOfflineAway) {
      onUpdateOfflineAway((prev) => prev.filter((id) => id !== currentChar.id));
    }
    updateCurrentSession((prev) => ({
      ...prev,
      messages: [],
      savedNodes: [],
      routes: [],
      activeRouteId: undefined,
      updatedAt: Date.now(),
    }));
    setIsExitModalOpen(false);
    showToast('已删除并离开此次线下（未保存记录）');
    setTimeout(() => {
      onBack();
    }, 350);
  };

  const handleEndAndSave = () => {
    if (currentSession.messages.length > 0) {
      const location =
        currentSession.mode === 'invite' && currentSession.inviteInfo
          ? currentSession.inviteInfo.location
          : '现实空间';

      const keySnippets = currentSession.messages
        .slice(-8)
        .map((m) => `${m.role === 'user' ? '用户' : currentChar.name}: ${m.content.slice(0, 45)}`)
        .join('；');

      const eventTitle =
        currentSession.mode === 'invite' && currentSession.inviteInfo
          ? `在${location}赴约相聚`
          : `面对面现实相聚`;

      const eventDetail = `双方在线下（${location}）进行了深度面对面相伴。核心交流纪要：${keySnippets}`;

      const memoryItem = createRawMemoryFromOffline(
        eventTitle,
        eventDetail,
        currentChar.name,
        currentChar.id
      );
      memoryItem.importance = 'important';
      memoryItem.isImportant = true;
      memoryItem.tags = ['线下现实', '面对面相聚', currentChar.name, '线下回忆', location];

      if (onSaveMemories) {
        onSaveMemories((prev) => [memoryItem, ...prev]);
      }
    }

    if (onUpdateOfflineAway) {
      onUpdateOfflineAway((prev) => prev.filter((id) => id !== currentChar.id));
    }

    updateCurrentSession((prev) => ({
      ...prev,
      messages: [],
      savedNodes: [],
      updatedAt: Date.now(),
    }));

    setIsExitModalOpen(false);
    showToast(`线下相聚已保存并记入${currentChar.name}的记忆库！`);
    setTimeout(() => {
      onBack();
    }, 450);
  };

  return (
    <div className={`flex-1 flex flex-col ${themeClass} select-none overflow-hidden relative`}>
      {/* 
        顶部横行：返回、删除这次线下记录、更多
      */}
      <div
        className={`h-12 px-3 flex items-center justify-between border-b backdrop-blur-md z-20 shrink-0 shadow-md transition-colors ${
          isAqua
            ? 'border-[#bae6fd] bg-white/80 text-[#0369a1]'
            : 'border-white/10 bg-black/40 text-white'
        }`}
      >
        {/* 左侧：返回 */}
        <button
          onClick={() => setIsExitModalOpen(true)}
          className={`p-1.5 jelly-btn flex items-center gap-1 text-xs font-mono transition-colors ${
            isAqua ? 'text-[#0284c7] hover:text-[#0369a1]' : 'text-[#d88fbf] hover:text-white'
          }`}
          title="返回"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2]" />
          <span>返回</span>
        </button>

        {/* 中间：角色名与当前线路版本展示 (点击快速切换路线分支版本) */}
        <button
          onClick={() => {
            setNodesModalTab('routes');
            setIsNodesModalOpen(true);
          }}
          className={`flex flex-col items-center px-2 py-0.5 rounded-xl transition-colors cursor-pointer group ${
            isAqua ? 'hover:bg-[#e0f2fe]/60' : 'hover:bg-white/5'
          }`}
          title="点击查看与切换路线版本"
        >
          <div
            className={`text-xs font-bold flex items-center gap-1 ${
              isAqua ? 'text-[#0369a1]' : 'text-white'
            }`}
          >
            <span>{currentChar.name}</span>
            <span className={`text-[10px] ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`}>
              · 线下小说
            </span>
          </div>
          {(() => {
            const routes = currentSession.routes || [];
            const activeRoute = routes.find(
              (r) => r.id === (currentSession.activeRouteId || 'route_main')
            );
            const routeName = activeRoute ? activeRoute.name : '主线剧情';
            return (
              <div
                className={`text-[10px] flex items-center gap-1 font-sans ${
                  isAqua
                    ? 'text-emerald-600 group-hover:text-emerald-700'
                    : 'text-emerald-400 group-hover:text-emerald-300'
                }`}
              >
                <GitBranch className="w-2.5 h-2.5" />
                <span className="truncate max-w-[130px] font-medium">{routeName}</span>
                {routes.length > 1 && (
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded-full border ${
                      isAqua
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                        : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                    }`}
                  >
                    {routes.length}条线
                  </span>
                )}
              </div>
            );
          })()}
        </button>

        {/* 右侧：删除这次线下记录 与 更多 */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsDeleteConfirmOpen(true)}
            disabled={currentSession.messages.length === 0}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 transition-colors disabled:opacity-30 ${
              isAqua
                ? 'bg-[#e0f2fe] border border-rose-300 text-rose-600 hover:bg-rose-50'
                : 'bg-[#241334] border border-rose-500/40 text-rose-300 hover:text-rose-200 hover:bg-rose-950/40'
            }`}
            title="删除这次线下记录"
          >
            <Trash2 className="w-3.5 h-3.5 stroke-[1.8]" />
            <span>删除这次线下记录</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 jelly-btn shadow-md transition-all ${
              isAqua
                ? 'bg-gradient-to-r from-[#e0f2fe] to-[#bae6fd] border border-[#7dd3fc] text-[#0284c7] hover:border-[#0284c7]'
                : 'bg-gradient-to-r from-[#2f1940] to-[#221230] border border-[#ff8ecb]/60 text-[#ff8ecb] hover:border-[#ff8ecb]'
            }`}
            title="更多"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>更多</span>
          </button>
        </div>
      </div>

      {/* 提示 Toast */}
      {errorToast && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-full bg-black/90 border border-[#ff8ecb] text-white text-xs font-mono shadow-2xl flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2 pointer-events-none">
          <Sparkles className="w-3 h-3 text-[#ff8ecb]" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* 
        小说主阅读流：无对话框，从上到下排版
      */}
      <div
        ref={chatScrollRef}
        className="flex-1 overflow-y-auto px-5 sm:px-10 py-6 space-y-6 scroll-smooth"
        onClick={() => {
          if (openMoreMsgId) setOpenMoreMsgId(null);
          if (isPlusMenuOpen) setIsPlusMenuOpen(false);
        }}
      >
        {currentSession.messages.length === 0 ? (
          <div className="h-full flex items-center justify-center opacity-0 pointer-events-none" />
        ) : (
          currentSession.messages.map((msg, idx) => {
            const isUser = msg.role === 'user';

            if (isUser) {
              // 需求 1: 线下里，user的话放在右边，加入编辑和重roll功能
              return (
                <div
                  key={msg.id}
                  id={`msg-${msg.id}`}
                  className="my-5 flex flex-col items-end group relative"
                >
                  <div className="max-w-[85%] sm:max-w-[78%] flex flex-col items-end space-y-1">
                    {/* 用户对白/发言气泡 (右侧展示，沉浸优雅质感) */}
                    <div
                      className={`px-4 py-2.5 rounded-2xl rounded-tr-sm font-serif text-[14px] sm:text-[15px] leading-relaxed tracking-wide break-words text-left transition-all ${
                        isAqua
                          ? 'bg-white/95 hover:bg-white border border-[#7dd3fc] shadow-[0_4px_16px_rgba(56,189,248,0.12)] text-[#0369a1]'
                          : 'bg-[#38184d]/90 hover:bg-[#441d5d] border border-[#ff8ecb]/40 shadow-lg text-[#ffeaf7]'
                      }`}
                    >
                      <div className={`whitespace-pre-wrap ${isAqua ? 'selection:bg-[#38bdf8]/30' : 'selection:bg-[#ff8ecb]/30'}`}>
                        {msg.content}
                      </div>
                    </div>

                    {/* 操作工具栏：编辑、重roll、删除 */}
                    <div className="flex items-center gap-1.5 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity font-sans text-xs pt-0.5">
                      <button
                        onClick={() => handleOpenEdit(msg.id)}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-colors shadow-sm ${
                          isAqua
                            ? 'bg-[#e0f2fe] hover:bg-[#38bdf8] hover:text-white border border-[#7dd3fc] text-[#0284c7]'
                            : 'bg-[#251238] hover:bg-[#ff8ecb] hover:text-[#1a0f24] border border-[#ff8ecb]/30 text-[#ffb8dc]'
                        }`}
                        title="编辑我发送的这段内容"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>编辑</span>
                      </button>

                      <button
                        onClick={() => handleUserReroll(msg.id)}
                        disabled={isGenerating}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-colors shadow-sm disabled:opacity-40 ${
                          isAqua
                            ? 'bg-[#e0f2fe] hover:bg-[#38bdf8] hover:text-white border border-[#7dd3fc] text-[#0284c7]'
                            : 'bg-[#251238] hover:bg-[#ff8ecb] hover:text-[#1a0f24] border border-[#ff8ecb]/30 text-[#ffb8dc]'
                        }`}
                        title="重roll：让对方重新针对本句推演小说后续"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>重roll</span>
                      </button>

                      <button
                        onClick={() => handleDeleteMsg(msg.id)}
                        className={`p-1 rounded-lg transition-colors ${
                          isAqua
                            ? 'hover:bg-rose-100 text-rose-500 hover:text-rose-700'
                            : 'hover:bg-rose-950/60 text-rose-300/70 hover:text-rose-200'
                        }`}
                        title="删除本句"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            /* 角色文学小说正文段落 */
            const isThoughtOpen = expandedThoughtIds[msg.id];
            const isGuidingThis = guidingMsgId === msg.id;
            const isMoreOpenThis = openMoreMsgId === msg.id;

            return (
              <div key={msg.id} id={`msg-${msg.id}`} className={`my-6 space-y-3 ${fontClass}`}>
                {/* 场景生图插画 */}
                {msg.imageUrl && (
                  <div className="my-4 flex flex-col items-center">
                    <div
                      className={`relative rounded-2xl overflow-hidden border shadow-xl max-w-lg w-full ${
                        isAqua
                          ? 'border-[#bae6fd] bg-white'
                          : 'border-[#ff8ecb]/30 bg-[#1e102d] shadow-2xl'
                      }`}
                    >
                      <img
                        src={msg.imageUrl}
                        alt="场景插画"
                        className="w-full h-auto object-cover max-h-72"
                      />
                      <div
                        className={`px-3 py-1.5 text-[11px] flex items-center justify-between border-t font-sans ${
                          isAqua
                            ? 'bg-[#f0f9ff] text-[#0369a1] border-[#bae6fd]'
                            : 'bg-[#170b22]/90 text-[#ffc6e5] border-white/5'
                        }`}
                      >
                        <span>📖 场景插画 · 「{currentChar.name}」</span>
                        <button
                          onClick={() => handleGenerateImageForMsg(msg.id)}
                          className={
                            isAqua
                              ? 'text-[#0284c7] hover:text-[#0369a1] text-[10px]'
                              : 'text-[#b7a2d9] hover:text-[#ff8ecb] text-[10px]'
                          }
                        >
                          重新生图
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 角色心声 (开启后随文折叠) */}
                {config.enableCharacterVoice !== false && msg.thought && (
                  <div className="my-1.5 font-sans text-xs">
                    <button
                      onClick={() =>
                        setExpandedThoughtIds((prev) => ({
                          ...prev,
                          [msg.id]: !prev[msg.id],
                        }))
                      }
                      className={`flex items-center gap-1 text-[11px] py-0.5 ${
                        isAqua
                          ? 'text-[#0284c7]/80 hover:text-[#0369a1]'
                          : 'text-[#d88fbf]/80 hover:text-[#ff8ecb]'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>
                        {isThoughtOpen
                          ? '收起角色心声'
                          : `查看「${currentChar.name}」心声独白`}
                      </span>
                    </button>
                    {isThoughtOpen && (
                      <div
                        className={`mt-1 pl-3 border-l-2 italic text-xs leading-relaxed py-1 font-sans ${
                          isAqua
                            ? 'border-[#38bdf8] text-[#0284c7]'
                            : 'border-[#ff8ecb]/40 text-[#cbb1dc]'
                        }`}
                      >
                        {msg.thought}
                      </div>
                    )}
                  </div>
                )}

                {/* 小说正文分段 */}
                <div className="space-y-3">
                  {msg.content
                    .split('\n')
                    .filter((p) => p.trim().length > 0)
                    .map((paragraph, pIdx) => (
                      <p
                        key={pIdx}
                        className={`indent-6 sm:indent-7 ${fontSizeClass} tracking-wide break-words ${
                          isAqua ? 'selection:bg-[#7dd3fc]/30' : 'selection:bg-[#ff8ecb]/30'
                        }`}
                      >
                        {paragraph.trim()}
                      </p>
                    ))}
                </div>

                {/* 走向选项 (开启后每次输出会自动生成三个选项，且仅在最新一条段落显示；采纳后历史选项立即隐藏) */}
                {msg.branchOptions &&
                  msg.branchOptions.length > 0 &&
                  idx === currentSession.messages.length - 1 && (
                  <div
                    className={`mt-3.5 pt-2.5 border-t space-y-2 font-sans animate-in fade-in ${
                      isAqua ? 'border-[#bae6fd]' : 'border-white/10'
                    }`}
                  >
                    <div
                      className={`text-[11px] font-bold flex items-center justify-between ${
                        isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5" />
                        <span>剧情走向选项（点击直接推演新段落）：</span>
                      </div>
                      <span
                        className={`text-[10px] font-normal ${
                          isAqua ? 'text-[#0284c7]/60' : 'text-[#b7a2d9]/60'
                        }`}
                      >
                        选择后历史选项将自动隐藏
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {msg.branchOptions.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          onClick={() => handleSelectBranchOption(msg.id, opt)}
                          className={`group/opt p-2.5 rounded-xl text-left transition-all shadow-sm flex flex-col justify-between gap-1.5 cursor-pointer border ${
                            isAqua
                              ? 'bg-white/95 hover:bg-white border-[#bae6fd] hover:border-[#38bdf8] shadow-[0_2px_8px_rgba(56,189,248,0.12)] hover:shadow-[0_4px_14px_rgba(56,189,248,0.25)]'
                              : 'bg-[#231238]/90 hover:bg-[#381a54] border-[#ff8ecb]/35 hover:border-[#ff8ecb] shadow-md'
                          }`}
                        >
                          <div className="flex items-start gap-1.5">
                            <span
                              className={`font-bold text-[11px] shrink-0 mt-0.5 ${
                                isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'
                              }`}
                            >
                              #{oIdx + 1}
                            </span>
                            <span
                              className={`line-clamp-3 leading-relaxed text-xs transition-colors ${
                                isAqua
                                  ? 'text-[#0369a1] group-hover/opt:text-[#0284c7]'
                                  : 'text-[#f5dce9] group-hover/opt:text-white'
                              }`}
                            >
                              {opt}
                            </span>
                          </div>
                          <div
                            className={`flex items-center justify-between pt-1 border-t text-[10px] ${
                              isAqua
                                ? 'border-[#e0f2fe] text-[#0284c7]'
                                : 'border-white/5 text-[#ff8ecb]'
                            }`}
                          >
                            <span className="flex items-center gap-1 font-medium">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>点击采纳并生成</span>
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setInputText(opt);
                                showToast('已填入输入框，可编辑后发送');
                              }}
                              className={`px-1.5 py-0.5 rounded transition-colors ${
                                isAqua
                                  ? 'bg-[#e0f2fe] hover:bg-[#bae6fd] text-[#0369a1] font-medium'
                                  : 'bg-white/10 hover:bg-white/20 text-[#d8b4e2] hover:text-white'
                              }`}
                              title="填入输入框微调"
                            >
                              微调
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 左下角：更多、重roll、指导重写 */}
                <div className="flex items-center gap-2 mt-3 pt-1 font-sans text-xs relative flex-wrap">
                  {/* 更多标签 */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMoreMsgId(isMoreOpenThis ? null : msg.id);
                      }}
                      className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-colors text-[11px] font-medium shadow-sm ${
                        isAqua
                          ? 'bg-white/90 hover:bg-[#e0f2fe] border-[#7dd3fc] text-[#0284c7] hover:text-[#0369a1]'
                          : 'bg-[#251438] hover:bg-[#361c4e] border-[#ff8ecb]/40 text-[#ff8ecb] hover:text-white'
                      }`}
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                      <span>更多</span>
                    </button>

                    {/* 更多子菜单 */}
                    {isMoreOpenThis && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className={`absolute left-0 bottom-8 mb-1 w-44 rounded-2xl shadow-2xl py-1.5 z-40 space-y-0.5 animate-in fade-in zoom-in-95 backdrop-blur-md border ${
                          isAqua
                            ? 'bg-white border-[#7dd3fc] text-[#0369a1]'
                            : 'bg-[#1e112c] border-[#ff8ecb]/50 text-[#f7d6e8]'
                        }`}
                      >
                        <button
                          onClick={() => handleContinueLayer(msg.id)}
                          disabled={isGenerating}
                          className={`w-full px-3 py-1.5 flex items-center gap-2 text-left text-xs transition-colors disabled:opacity-40 ${
                            isAqua
                              ? 'text-[#0369a1] hover:bg-[#f0f9ff] hover:text-[#0284c7]'
                              : 'text-[#f7d6e8] hover:bg-[#341b4b] hover:text-[#ff8ecb]'
                          }`}
                        >
                          <Sparkles className={`w-3.5 h-3.5 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`} />
                          <span>续写本层</span>
                        </button>

                        <button
                          onClick={() => handleSaveNode(msg.id)}
                          className={`w-full px-3 py-1.5 flex items-center gap-2 text-left text-xs transition-colors ${
                            isAqua
                              ? 'text-[#0369a1] hover:bg-[#f0f9ff] hover:text-[#0284c7]'
                              : 'text-[#f7d6e8] hover:bg-[#341b4b] hover:text-[#ff8ecb]'
                          }`}
                        >
                          <Layers className="w-3.5 h-3.5 text-purple-400" />
                          <span>存为节点</span>
                        </button>

                        <button
                          onClick={() => handleBranchFromHere(msg.id)}
                          className={`w-full px-3 py-1.5 flex items-center gap-2 text-left text-xs transition-colors ${
                            isAqua
                              ? 'text-[#0369a1] hover:bg-[#f0f9ff] hover:text-[#0284c7]'
                              : 'text-[#f7d6e8] hover:bg-[#341b4b] hover:text-[#ff8ecb]'
                          }`}
                        >
                          <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
                          <span>从这里另开线路</span>
                        </button>

                        <button
                          onClick={() => handleToggleFavorite(msg.id)}
                          className={`w-full px-3 py-1.5 flex items-center gap-2 text-left text-xs transition-colors ${
                            isAqua
                              ? 'text-[#0369a1] hover:bg-[#f0f9ff] hover:text-[#0284c7]'
                              : 'text-[#f7d6e8] hover:bg-[#341b4b] hover:text-[#ff8ecb]'
                          }`}
                        >
                          {msg.isFavorite ? (
                            <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                          )}
                          <span>{msg.isFavorite ? '已收藏 (点击取消)' : '收藏'}</span>
                        </button>

                        <button
                          onClick={() => handleGenerateImageForMsg(msg.id)}
                          className={`w-full px-3 py-1.5 flex items-center gap-2 text-left text-xs transition-colors ${
                            isAqua
                              ? 'text-[#0369a1] hover:bg-[#f0f9ff] hover:text-[#0284c7]'
                              : 'text-[#f7d6e8] hover:bg-[#341b4b] hover:text-[#ff8ecb]'
                          }`}
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
                          <span>生图</span>
                        </button>

                        <button
                          onClick={() => handleOpenEdit(msg.id)}
                          className={`w-full px-3 py-1.5 flex items-center gap-2 text-left text-xs transition-colors ${
                            isAqua
                              ? 'text-[#0369a1] hover:bg-[#f0f9ff] hover:text-[#0284c7]'
                              : 'text-[#f7d6e8] hover:bg-[#341b4b] hover:text-[#ff8ecb]'
                          }`}
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                          <span>编辑</span>
                        </button>

                        <div className={`my-1 border-t ${isAqua ? 'border-sky-100' : 'border-white/10'}`} />

                        <button
                          onClick={() => handleDeleteMsg(msg.id)}
                          className={`w-full px-3 py-1.5 flex items-center gap-2 text-left text-xs transition-colors ${
                            isAqua
                              ? 'text-rose-600 hover:bg-rose-50'
                              : 'text-rose-300 hover:bg-rose-950/40 hover:text-rose-200'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          <span>删除</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 重roll */}
                  <button
                    onClick={() => handleReroll(msg.id)}
                    disabled={isGenerating}
                    className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-colors text-[11px] disabled:opacity-40 ${
                      isAqua
                        ? 'bg-white/90 hover:bg-[#e0f2fe] border-[#7dd3fc] text-[#0284c7] hover:text-[#0369a1]'
                        : 'bg-[#1f102c] hover:bg-[#2e1742] border-[#4b3670] text-[#d8b4e2] hover:text-[#ff8ecb]'
                    }`}
                    title="重新生成这一段小说内容"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>重roll</span>
                  </button>

                  {/* 指导重写 */}
                  <button
                    onClick={() => {
                      setGuidingMsgId(isGuidingThis ? null : msg.id);
                      setGuidePrompt('');
                    }}
                    disabled={isGenerating}
                    className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-colors text-[11px] disabled:opacity-40 ${
                      isAqua
                        ? 'bg-white/90 hover:bg-[#e0f2fe] border-[#7dd3fc] text-[#0284c7] hover:text-[#0369a1]'
                        : 'bg-[#1f102c] hover:bg-[#2e1742] border-[#4b3670] text-[#d8b4e2] hover:text-[#ff8ecb]'
                    }`}
                    title="输入指令要求，让AI按照你的指导重写"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`} />
                    <span>指导重写</span>
                  </button>

                  {/* 版本数指示 */}
                  {msg.versions && msg.versions.length > 1 && (
                    <button
                      onClick={() => setIsVersionsModalOpen(true)}
                      className="px-2 py-0.5 rounded-full bg-[#3b1d54] text-[#ff8ecb] text-[10px] font-mono hover:bg-[#4a266b] transition-colors"
                      title="查看本轮保存的版本"
                    >
                      版本 {(msg.currentVersionIndex ?? (msg.versions.length - 1)) + 1}/{msg.versions.length}
                    </button>
                  )}

                  {msg.isFavorite && (
                    <span className="text-[10px] text-amber-300 font-bold flex items-center gap-0.5 ml-1">
                      ★ 已收藏
                    </span>
                  )}
                  {msg.isNode && (
                    <span className="text-[10px] text-purple-300 font-bold flex items-center gap-0.5 ml-1">
                      🏷️ {msg.nodeName || '故事节点'}
                    </span>
                  )}
                </div>

                {/* 指导重写展开输入栏 */}
                {isGuidingThis && (
                  <div
                    className={`mt-2.5 p-3 rounded-2xl border shadow-xl space-y-2 font-sans animate-in fade-in zoom-in-95 ${
                      isAqua
                        ? 'bg-white border-[#7dd3fc]'
                        : 'bg-[#211132] border-[#ff8ecb]/50'
                    }`}
                  >
                    <div className="text-[11px] font-bold flex items-center justify-between">
                      <span className={`flex items-center gap-1 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`}>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>指导重写本段小说</span>
                      </span>
                      <button
                        onClick={() => setGuidingMsgId(null)}
                        className={`p-0.5 ${isAqua ? 'text-[#0284c7] hover:text-[#0369a1]' : 'text-[#b7a2d9] hover:text-white'}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={guidePrompt}
                      onChange={(e) => setGuidePrompt(e.target.value)}
                      placeholder="输入修改要求（例如：增加肢体接触、心理描写更细腻、语气更害羞一点、重点描写周围的夕阳等）..."
                      className={`w-full rounded-xl p-2.5 text-xs focus:outline-none resize-none leading-relaxed border transition-colors ${
                        isAqua
                          ? 'bg-[#f0f9ff] border-[#bae6fd] focus:border-[#0284c7] text-[#0369a1] placeholder:text-[#0284c7]/40'
                          : 'bg-[#12081c] border-[#4b3670] focus:border-[#ff8ecb] text-[#f7d6e8] placeholder:text-[#b7a2d9]/40'
                      }`}
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setGuidingMsgId(null)}
                        className={`px-2.5 py-1 rounded-lg text-xs ${
                          isAqua ? 'text-[#0284c7] hover:text-[#0369a1]' : 'text-[#b7a2d9] hover:text-white'
                        }`}
                      >
                        取消
                      </button>
                      <button
                        onClick={() => handleExecuteGuidedRewrite(msg.id, guidePrompt)}
                        disabled={!guidePrompt.trim() || isGenerating}
                        className={`px-3.5 py-1 rounded-lg font-bold text-xs disabled:opacity-40 shadow-sm jelly-btn ${
                          isAqua
                            ? 'bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-white'
                            : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a0f24]'
                        }`}
                      >
                        开始重写
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* 生成中状态动效 */}
        {isGenerating && (
          <div className="py-4 font-serif space-y-2 animate-pulse">
            <div className={`text-xs flex items-center gap-2 font-sans ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`}>
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>{generatingLabel}</span>
            </div>
            <div className={`h-3 w-4/5 rounded-full ${isAqua ? 'bg-[#bae6fd]' : 'bg-[#2f1c46]'}`} />
            <div className={`h-3 w-3/5 rounded-full ${isAqua ? 'bg-[#e0f2fe]' : 'bg-[#251538]'}`} />
          </div>
        )}
      </div>

      {/* 
        需求 2: 在线下聊天框的左边加一个➕
      */}
      <div
        className={`p-3 border-t flex items-end gap-2 shrink-0 relative transition-colors ${
          isAqua ? 'bg-white/80 border-[#bae6fd]' : 'bg-black/40 border-white/10'
        }`}
      >
        {/* ➕ 拓展工具箱按钮 */}
        <div className="relative">
          <button
            onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-all jelly-btn shadow-md ${
              isAqua
                ? isPlusMenuOpen
                  ? 'bg-[#0284c7] text-white border-[#0284c7]'
                  : 'bg-[#e0f2fe] border-[#7dd3fc] text-[#0284c7] hover:bg-[#bae6fd]'
                : isPlusMenuOpen
                ? 'bg-[#ff8ecb] text-[#1a0f24] border-[#ff8ecb]'
                : 'bg-[#221235] border-[#4b3670] text-[#ff8ecb] hover:bg-[#301948]'
            }`}
            title="线下功能工具箱"
          >
            <Plus className="w-5 h-5 stroke-[2.2]" />
          </button>

          {/* ➕ 展开的功能菜单列表 */}
          {isPlusMenuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className={`absolute left-0 bottom-14 w-64 rounded-3xl shadow-2xl p-2.5 z-40 space-y-1 animate-in fade-in zoom-in-95 backdrop-blur-md border ${
                isAqua
                  ? 'bg-white border-[#7dd3fc] text-[#0369a1]'
                  : 'bg-[#1e102c] border-[#ff8ecb]/50 text-[#f7d6e8]'
              }`}
            >
              <div
                className={`text-[11px] font-bold px-2 py-1 border-b flex items-center justify-between ${
                  isAqua ? 'text-[#0284c7] border-sky-100' : 'text-[#ff8ecb] border-white/10'
                }`}
              >
                <span>线下交互工具箱</span>
                <span className={`text-[10px] ${isAqua ? 'text-[#0284c7]/60' : 'text-[#b7a2d9]/60'}`}>10大辅助功能</span>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-1 pr-0.5 pt-1 text-xs">
                {/* 1. 走向选项 (开关) */}
                <button
                  onClick={() => {
                    handleSaveConfig({
                      ...config,
                      enableBranchOptions: !config.enableBranchOptions,
                    });
                    showToast(
                      !config.enableBranchOptions
                        ? '已开启走向选项（每次输出将生成3个选项）'
                        : '已关闭走向选项'
                    );
                  }}
                  className={`w-full p-2 rounded-xl flex items-center justify-between text-left transition-colors ${
                    isAqua ? 'hover:bg-[#f0f9ff]' : 'hover:bg-[#32174a]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-emerald-500" />
                    <div>
                      <div className={`font-bold ${isAqua ? 'text-[#0369a1]' : 'text-[#f7d6e8]'}`}>走向选项</div>
                      <div className={`text-[10px] ${isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]'}`}>自动生成3个走向选项</div>
                    </div>
                  </div>
                  <div
                    className={`w-8 h-4 rounded-full p-0.5 transition-colors ${
                      config.enableBranchOptions
                        ? isAqua ? 'bg-[#0284c7]' : 'bg-[#ff8ecb]'
                        : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full bg-white transition-transform ${
                        config.enableBranchOptions ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </button>

                {/* 2. 重roll上一轮 */}
                <button
                  onClick={handleRerollLastRound}
                  className={`w-full p-2 rounded-xl flex items-center gap-2 text-left transition-colors ${
                    isAqua ? 'hover:bg-[#f0f9ff]' : 'hover:bg-[#32174a]'
                  }`}
                >
                  <RotateCcw className="w-4 h-4 text-cyan-500" />
                  <div>
                    <div className={`font-bold ${isAqua ? 'text-[#0369a1]' : 'text-[#f7d6e8]'}`}>重roll上一轮</div>
                    <div className={`text-[10px] ${isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]'}`}>重新生成上一轮小说回复</div>
                  </div>
                </button>

                {/* 3. 本轮版本 */}
                <button
                  onClick={() => {
                    setIsPlusMenuOpen(false);
                    setIsVersionsModalOpen(true);
                  }}
                  className={`w-full p-2 rounded-xl flex items-center gap-2 text-left transition-colors ${
                    isAqua ? 'hover:bg-[#f0f9ff]' : 'hover:bg-[#32174a]'
                  }`}
                >
                  <Layers className="w-4 h-4 text-purple-500" />
                  <div>
                    <div className={`font-bold ${isAqua ? 'text-[#0369a1]' : 'text-[#f7d6e8]'}`}>本轮版本</div>
                    <div className={`text-[10px] ${isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]'}`}>存重roll前后版本(最多5个)</div>
                  </div>
                </button>

                {/* 4. 写作指导 */}
                <button
                  onClick={() => {
                    setIsPlusMenuOpen(false);
                    setTempGuidance(config.writingGuidance || '');
                    setIsGuidanceModalOpen(true);
                  }}
                  className={`w-full p-2 rounded-xl flex items-center gap-2 text-left transition-colors ${
                    isAqua ? 'hover:bg-[#f0f9ff]' : 'hover:bg-[#32174a]'
                  }`}
                >
                  <PenTool className="w-4 h-4 text-amber-500" />
                  <div>
                    <div className={`font-bold ${isAqua ? 'text-[#0369a1]' : 'text-[#f7d6e8]'}`}>写作指导</div>
                    <div className={`text-[10px] ${isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]'}`}>填写对本场的写作指导</div>
                  </div>
                </button>

                {/* 5. 参与角色 */}
                <button
                  onClick={() => {
                    setIsPlusMenuOpen(false);
                    setIsParticipatingModalOpen(true);
                  }}
                  className={`w-full p-2 rounded-xl flex items-center gap-2 text-left transition-colors ${
                    isAqua ? 'hover:bg-[#f0f9ff]' : 'hover:bg-[#32174a]'
                  }`}
                >
                  <Users className="w-4 h-4 text-pink-500" />
                  <div>
                    <div className={`font-bold ${isAqua ? 'text-[#0369a1]' : 'text-[#f7d6e8]'}`}>参与角色</div>
                    <div className={`text-[10px] ${isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]'}`}>加入其他char/自然引入</div>
                  </div>
                </button>

                {/* 6. 角色心声 (开关) */}
                <button
                  onClick={() => {
                    const nextVal = config.enableCharacterVoice === false ? true : false;
                    handleSaveConfig({
                      ...config,
                      enableCharacterVoice: nextVal,
                    });
                    showToast(nextVal ? '已开启角色心声（随文折叠）' : '已关闭角色心声');
                  }}
                  className={`w-full p-2 rounded-xl flex items-center justify-between text-left transition-colors ${
                    isAqua ? 'hover:bg-[#f0f9ff]' : 'hover:bg-[#32174a]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <div>
                      <div className={`font-bold ${isAqua ? 'text-[#0369a1]' : 'text-[#f7d6e8]'}`}>角色心声</div>
                      <div className={`text-[10px] ${isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]'}`}>开启后随文折叠独白</div>
                    </div>
                  </div>
                  <div
                    className={`w-8 h-4 rounded-full p-0.5 transition-colors ${
                      config.enableCharacterVoice !== false
                        ? isAqua ? 'bg-[#0284c7]' : 'bg-[#ff8ecb]'
                        : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full bg-white transition-transform ${
                        config.enableCharacterVoice !== false ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </button>

                {/* 7. 路线与节点 */}
                <button
                  onClick={() => {
                    setIsPlusMenuOpen(false);
                    setIsNodesModalOpen(true);
                  }}
                  className={`w-full p-2 rounded-xl flex items-center gap-2 text-left transition-colors ${
                    isAqua ? 'hover:bg-[#f0f9ff]' : 'hover:bg-[#32174a]'
                  }`}
                >
                  <GitBranch className="w-4 h-4 text-emerald-500" />
                  <div>
                    <div className={`font-bold ${isAqua ? 'text-[#0369a1]' : 'text-[#f7d6e8]'}`}>路线与节点</div>
                    <div className={`text-[10px] ${isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]'}`}>查看存档节点/线路分歧</div>
                  </div>
                </button>

                {/* 8. 搜索楼层 */}
                <button
                  onClick={() => {
                    setIsPlusMenuOpen(false);
                    setIsSearchModalOpen(true);
                  }}
                  className={`w-full p-2 rounded-xl flex items-center gap-2 text-left transition-colors ${
                    isAqua ? 'hover:bg-[#f0f9ff]' : 'hover:bg-[#32174a]'
                  }`}
                >
                  <Search className="w-4 h-4 text-blue-500" />
                  <div>
                    <div className={`font-bold ${isAqua ? 'text-[#0369a1]' : 'text-[#f7d6e8]'}`}>搜索楼层</div>
                    <div className={`text-[10px] ${isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]'}`}>快速检索对白与剧情</div>
                  </div>
                </button>

                {/* 9. 导出全文 */}
                <button
                  onClick={() => {
                    setIsPlusMenuOpen(false);
                    setIsExportModalOpen(true);
                  }}
                  className={`w-full p-2 rounded-xl flex items-center gap-2 text-left transition-colors ${
                    isAqua ? 'hover:bg-[#f0f9ff]' : 'hover:bg-[#32174a]'
                  }`}
                >
                  <Download className="w-4 h-4 text-violet-500" />
                  <div>
                    <div className={`font-bold ${isAqua ? 'text-[#0369a1]' : 'text-[#f7d6e8]'}`}>导出全文</div>
                    <div className={`text-[10px] ${isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]'}`}>导出TXT/Markdown或复制</div>
                  </div>
                </button>

                {/* 10. 美化界面 */}
                <button
                  onClick={() => {
                    setIsPlusMenuOpen(false);
                    setIsAppearanceModalOpen(true);
                  }}
                  className={`w-full p-2 rounded-xl flex items-center gap-2 text-left transition-colors ${
                    isAqua ? 'hover:bg-[#f0f9ff]' : 'hover:bg-[#32174a]'
                  }`}
                >
                  <Palette className="w-4 h-4 text-rose-500" />
                  <div>
                    <div className={`font-bold ${isAqua ? 'text-[#0369a1]' : 'text-[#f7d6e8]'}`}>美化界面</div>
                    <div className={`text-[10px] ${isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]'}`}>纸张主题、字体与排版字号</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 输入框本体 */}
        <div
          className={`flex-1 rounded-2xl p-2.5 flex flex-col gap-1 transition-all border ${
            isAqua
              ? 'bg-white/90 border-[#7dd3fc] focus-within:border-[#0284c7]'
              : 'bg-black/40 border-white/20 focus-within:border-[#ff8ecb]'
          }`}
        >
          <textarea
            rows={2}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={`写下你的动作神态或台词...（例如：拉开椅子坐下，微笑着看向${currentChar.name}）`}
            className={`w-full bg-transparent text-xs focus:outline-none resize-none leading-relaxed font-serif ${
              isAqua
                ? 'text-[#0369a1] placeholder:text-[#0284c7]/40'
                : 'text-white placeholder:text-white/40'
            }`}
          />
          <div
            className={`flex items-center justify-between text-[10px] font-mono pt-0.5 font-sans ${
              isAqua ? 'text-[#0284c7]/60' : 'text-white/50'
            }`}
          >
            <span>Shift+Enter换行 · Enter发送</span>
            <span>{inputText.length} 字</span>
          </div>
        </div>

        {/* 发送 / 停止按钮 */}
        {isGenerating ? (
          <button
            onClick={() => abortControllerRef.current?.abort()}
            className="w-11 h-11 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md jelly-btn"
            title="停止生成"
          >
            <Square className="w-4 h-4 fill-white" />
          </button>
        ) : (
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
            className={`w-11 h-11 rounded-2xl font-bold flex items-center justify-center shrink-0 shadow-md jelly-btn disabled:opacity-40 transition-all ${
              isAqua
                ? 'bg-gradient-to-r from-[#38bdf8] to-[#0284c7] hover:from-[#0284c7] hover:to-[#0369a1] text-white shadow-[0_2px_10px_rgba(56,189,248,0.35)]'
                : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] hover:from-[#e09cc9] hover:to-[#ffa6d7] text-[#1a0f24]'
            }`}
            title="发送互动"
          >
            <Send className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 弹窗 1: 本轮版本管理 */}
      {isVersionsModalOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in select-none">
          <div
            className={`w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-3 animate-in zoom-in-95 border ${
              isAqua ? 'bg-white border-[#bae6fd]' : 'bg-[#1f112c] border-[#ff8ecb]/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3
                className={`text-sm font-bold flex items-center gap-1.5 ${
                  isAqua ? 'text-[#0369a1]' : 'text-white'
                }`}
              >
                <Layers className={`w-4 h-4 ${isAqua ? 'text-[#0284c7]' : 'text-purple-400'}`} />
                <span>本轮版本管理 (存重roll前后版本)</span>
              </h3>
              <button
                onClick={() => setIsVersionsModalOpen(false)}
                className={`p-1 transition-colors ${
                  isAqua ? 'text-[#0284c7] hover:text-[#0369a1]' : 'text-[#b7a2d9] hover:text-white'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p
              className={`text-xs leading-relaxed ${
                isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]'
              }`}
            >
              每次重roll都会自动归档旧版，最多保留5个版本，可随时一键切换：
            </p>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {!latestAssistantMsg?.versions || latestAssistantMsg.versions.length <= 1 ? (
                <div
                  className={`p-4 text-center text-xs rounded-2xl ${
                    isAqua ? 'text-[#0284c7]/60 bg-[#f0f9ff]' : 'text-[#b7a2d9]/70 bg-white/5'
                  }`}
                >
                  当前最新轮次仅有 1 个版本。点击「重roll」后将在此自动保留前后的版本供你更换。
                </div>
              ) : (
                latestAssistantMsg.versions.map((verText, vIdx) => {
                  const isCurrent =
                    latestAssistantMsg.currentVersionIndex === vIdx ||
                    (latestAssistantMsg.currentVersionIndex === undefined &&
                      vIdx === latestAssistantMsg.versions!.length - 1);

                  return (
                    <div
                      key={vIdx}
                      className={`p-3 rounded-2xl border transition-all space-y-2 ${
                        isCurrent
                          ? isAqua
                            ? 'bg-[#e0f2fe] border-[#0284c7] text-[#0369a1]'
                            : 'bg-[#3b1d52] border-[#ff8ecb] text-white'
                          : isAqua
                          ? 'bg-[#f0f9ff] border-[#bae6fd] text-[#0369a1]'
                          : 'bg-white/5 border-white/10 text-[#f7d6e8]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span
                          className={`font-bold ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`}
                        >
                          版本 #{vIdx + 1} ({verText.replace(/\s+/g, '').length} 字)
                        </span>
                        {isCurrent ? (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isAqua
                                ? 'bg-[#0284c7]/15 text-[#0284c7]'
                                : 'bg-[#ff8ecb]/20 text-[#ff8ecb]'
                            }`}
                          >
                            当前展示中
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSwitchVersion(vIdx)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                              isAqua
                                ? 'bg-white hover:bg-[#bae6fd] border border-[#7dd3fc] text-[#0284c7]'
                                : 'bg-[#2a1438] hover:bg-[#ff8ecb] hover:text-[#1a0f24] border border-[#ff8ecb]/40 text-[#ff8ecb]'
                            }`}
                          >
                            更换为此版本
                          </button>
                        )}
                      </div>
                      <p
                        className={`text-xs font-serif line-clamp-3 leading-relaxed ${
                          isAqua ? 'text-[#0369a1]/80' : 'text-[#d8b4e2]/90'
                        }`}
                      >
                        {verText}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 弹窗 2: 写作指导 */}
      {isGuidanceModalOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in select-none">
          <div
            className={`w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-3 animate-in zoom-in-95 border ${
              isAqua ? 'bg-white border-[#bae6fd]' : 'bg-[#1f112c] border-[#ff8ecb]/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3
                className={`text-sm font-bold flex items-center gap-1.5 ${
                  isAqua ? 'text-[#0369a1]' : 'text-white'
                }`}
              >
                <PenTool className="w-4 h-4 text-amber-500" />
                <span>本场写作指导</span>
              </h3>
              <button
                onClick={() => setIsGuidanceModalOpen(false)}
                className={`p-1 transition-colors ${
                  isAqua ? 'text-[#0284c7] hover:text-[#0369a1]' : 'text-[#b7a2d9] hover:text-white'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p
              className={`text-xs leading-relaxed ${
                isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]'
              }`}
            >
              填写对本场线下小说的全局描写指导（如偏向文学感、多描写神态微表情、放慢节奏、语气更温柔害羞等）：
            </p>
            <textarea
              rows={4}
              value={tempGuidance}
              onChange={(e) => setTempGuidance(e.target.value)}
              placeholder="例如：多侧重眼神交汇与呼吸微动作，对白含蓄，多渲染窗外光晕与周围香气..."
              className={`w-full rounded-2xl p-3 text-xs focus:outline-none resize-none leading-relaxed border transition-colors ${
                isAqua
                  ? 'bg-[#f0f9ff] border-[#bae6fd] focus:border-[#0284c7] text-[#0369a1] placeholder:text-[#0284c7]/40'
                  : 'bg-[#12081a] border-[#4b3670] focus:border-[#ff8ecb] text-[#f7d6e8]'
              }`}
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setIsGuidanceModalOpen(false)}
                className={`px-3 py-1.5 rounded-xl border text-xs transition-colors ${
                  isAqua
                    ? 'border-[#bae6fd] text-[#0284c7] hover:bg-[#f0f9ff]'
                    : 'border-white/10 text-[#b7a2d9] hover:text-white'
                }`}
              >
                取消
              </button>
              <button
                onClick={() => {
                  handleSaveConfig({
                    ...config,
                    writingGuidance: tempGuidance.trim(),
                  });
                  setIsGuidanceModalOpen(false);
                  showToast('已更新本场写作指导');
                }}
                className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-opacity ${
                  isAqua
                    ? 'bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-white shadow-md'
                    : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a0f24]'
                }`}
              >
                保存指导
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 弹窗 3: 参与角色 */}
      {isParticipatingModalOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in select-none">
          <div
            className={`w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-3 animate-in zoom-in-95 border ${
              isAqua ? 'bg-white border-[#bae6fd]' : 'bg-[#1f112c] border-[#ff8ecb]/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3
                className={`text-sm font-bold flex items-center gap-1.5 ${
                  isAqua ? 'text-[#0369a1]' : 'text-white'
                }`}
              >
                <Users className={`w-4 h-4 ${isAqua ? 'text-[#0284c7]' : 'text-pink-400'}`} />
                <span>参与角色管理</span>
              </h3>
              <button
                onClick={() => setIsParticipatingModalOpen(false)}
                className={`p-1 transition-colors ${
                  isAqua ? 'text-[#0284c7] hover:text-[#0369a1]' : 'text-[#b7a2d9] hover:text-white'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p
              className={`text-xs leading-relaxed ${
                isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]'
              }`}
            >
              核心主角为「{currentChar.name}」。你可以挑选其他通讯录角色加入线下相聚，也可以允许随剧情自然引入新角色：
            </p>

            {/* 动态角色开关 */}
            <div
              className={`p-3 rounded-2xl border flex items-center justify-between transition-colors ${
                isAqua ? 'bg-[#f0f9ff] border-[#bae6fd]' : 'bg-white/5 border-white/10'
              }`}
            >
              <div>
                <div className={`text-xs font-bold ${isAqua ? 'text-[#0369a1]' : 'text-white'}`}>
                  随着剧情发展自然而然加入char
                </div>
                <div className={`text-[10px] ${isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]'}`}>
                  允许剧情在需要时合理引入偶遇或登场角色
                </div>
              </div>
              <button
                onClick={() => {
                  handleSaveConfig({
                    ...config,
                    allowDynamicCharacters: !config.allowDynamicCharacters,
                  });
                }}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                  config.allowDynamicCharacters
                    ? isAqua
                      ? 'bg-[#0284c7]'
                      : 'bg-[#ff8ecb]'
                    : isAqua
                    ? 'bg-slate-200'
                    : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    config.allowDynamicCharacters ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 多选参与角色列表 */}
            <div
              className={`text-xs font-bold pt-1 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`}
            >
              通讯录共聚角色多选：
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {personas
                .filter((p) => p.id !== currentChar.id)
                .map((p) => {
                  const isChecked = config.participatingCharIds?.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        const curList = config.participatingCharIds || [];
                        const nextList = isChecked
                          ? curList.filter((id) => id !== p.id)
                          : [...curList, p.id];
                        handleSaveConfig({
                          ...config,
                          participatingCharIds: nextList,
                        });
                      }}
                      className={`p-2.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-colors ${
                        isChecked
                          ? isAqua
                            ? 'bg-[#e0f2fe] border-[#0284c7] text-[#0369a1]'
                            : 'bg-[#35194a] border-[#ff8ecb] text-white'
                          : isAqua
                          ? 'bg-[#f0f9ff] border-[#bae6fd] text-[#0369a1] hover:bg-[#e0f2fe]'
                          : 'bg-white/5 border-white/10 text-[#b7a2d9] hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">{p.name}</span>
                        {p.remarks && <span className="text-[10px] opacity-70">({p.remarks})</span>}
                      </div>
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                          isChecked
                            ? isAqua
                              ? 'bg-[#0284c7] border-[#0284c7]'
                              : 'bg-[#ff8ecb] border-[#ff8ecb]'
                            : isAqua
                            ? 'border-[#bae6fd]'
                            : 'border-white/30'
                        }`}
                      >
                        {isChecked && (
                          <Check
                            className={`w-3 h-3 stroke-[3] ${
                              isAqua ? 'text-white' : 'text-[#1a0f24]'
                            }`}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsParticipatingModalOpen(false)}
                className={`px-4 py-1.5 rounded-xl font-bold text-xs shadow-md transition-opacity ${
                  isAqua
                    ? 'bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-white'
                    : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a0f24]'
                }`}
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 弹窗 4: 路线与节点 (与更多里的存为节点/从这里另开线路呼应，可自由切换版本) */}
      {isNodesModalOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in select-none">
          <div
            className={`w-full max-w-lg rounded-3xl p-5 shadow-2xl space-y-3.5 animate-in zoom-in-95 border ${
              isAqua ? 'bg-white border-[#bae6fd]' : 'bg-[#1f112c] border-[#ff8ecb]/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-emerald-500" />
                <h3 className={`text-sm font-bold ${isAqua ? 'text-[#0369a1]' : 'text-white'}`}>
                  路线分支与故事节点
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsNodesModalOpen(false);
                  setRenamingRouteId(null);
                }}
                className={`p-1 transition-colors ${
                  isAqua ? 'text-[#0284c7] hover:text-[#0369a1]' : 'text-[#b7a2d9] hover:text-white'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 顶部分页 Tab: 路线分歧版本 vs 故事节点 */}
            <div
              className={`grid grid-cols-2 p-1 rounded-2xl border text-xs font-bold ${
                isAqua ? 'bg-[#f0f9ff] border-[#bae6fd]' : 'bg-black/40 border-white/10'
              }`}
            >
              <button
                onClick={() => setNodesModalTab('routes')}
                className={`py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  nodesModalTab === 'routes'
                    ? isAqua
                      ? 'bg-white text-[#0284c7] shadow-sm'
                      : 'bg-[#3b1c54] text-[#ff8ecb] shadow-sm'
                    : isAqua
                    ? 'text-[#0284c7]/60 hover:text-[#0284c7]'
                    : 'text-[#b7a2d9] hover:text-white'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5 text-emerald-500" />
                <span>
                  剧情线路版本 (
                  {(currentSession.routes && currentSession.routes.length > 0
                    ? currentSession.routes
                    : [1]
                  ).length}
                  )
                </span>
              </button>
              <button
                onClick={() => setNodesModalTab('nodes')}
                className={`py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  nodesModalTab === 'nodes'
                    ? isAqua
                      ? 'bg-white text-[#0284c7] shadow-sm'
                      : 'bg-[#3b1c54] text-[#ff8ecb] shadow-sm'
                    : isAqua
                    ? 'text-[#0284c7]/60 hover:text-[#0284c7]'
                    : 'text-[#b7a2d9] hover:text-white'
                }`}
              >
                <Layers className={`w-3.5 h-3.5 ${isAqua ? 'text-[#0284c7]' : 'text-purple-400'}`} />
                <span>故事存档节点 ({(currentSession.savedNodes || []).length})</span>
              </button>
            </div>

            {/* TAB 1: 故事线路与分歧版本 */}
            {nodesModalTab === 'routes' && (
              <div className="space-y-3">
                <p
                  className={`text-[11px] leading-relaxed ${
                    isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]'
                  }`}
                >
                  💡 从正文段落「更多」中点击「从这里另开线路」会新增一条分歧剧情线，原路线完整保留。点击下方按钮即可随时切换不同版本继续推演！
                </p>

                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {(() => {
                    const existingRoutes =
                      currentSession.routes && currentSession.routes.length > 0
                        ? currentSession.routes
                        : [
                            {
                              id: 'route_main',
                              name: '主线剧情（初始路线）',
                              createdAt: currentSession.createdAt || Date.now(),
                              messages: currentSession.messages,
                            },
                          ];
                    const activeRouteId = currentSession.activeRouteId || 'route_main';

                    return existingRoutes.map((route, rIdx) => {
                      const isActive = route.id === activeRouteId;
                      const isRenaming = renamingRouteId === route.id;

                      return (
                        <div
                          key={route.id}
                          className={`p-3 rounded-2xl border transition-all ${
                            isActive
                              ? 'bg-emerald-500/10 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.18)]'
                              : isAqua
                              ? 'bg-[#f0f9ff] border-[#bae6fd] hover:border-[#38bdf8]'
                              : 'bg-white/5 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            {isRenaming ? (
                              <div className="flex items-center gap-1.5 flex-1">
                                <input
                                  type="text"
                                  value={newRouteNameInput}
                                  onChange={(e) => setNewRouteNameInput(e.target.value)}
                                  className={`flex-1 border border-emerald-400 rounded-lg px-2 py-1 text-xs focus:outline-none ${
                                    isAqua ? 'bg-white text-[#0369a1]' : 'bg-black/60 text-white'
                                  }`}
                                  placeholder="输入线路名称..."
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleRenameRoute(route.id, newRouteNameInput)}
                                  className="px-2 py-1 rounded-lg bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-400"
                                >
                                  保存
                                </button>
                                <button
                                  onClick={() => setRenamingRouteId(null)}
                                  className={`px-2 py-1 rounded-lg text-xs ${
                                    isAqua
                                      ? 'bg-slate-100 text-[#0284c7] hover:bg-slate-200'
                                      : 'bg-white/10 text-white hover:bg-white/20'
                                  }`}
                                >
                                  取消
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                                <span
                                  className={`font-bold text-xs truncate ${
                                    isActive
                                      ? 'text-emerald-600'
                                      : isAqua
                                      ? 'text-[#0369a1]'
                                      : 'text-white'
                                  }`}
                                >
                                  {route.name}
                                </span>
                                {isActive && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-600 font-bold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    当前生效版本
                                  </span>
                                )}
                                <button
                                  onClick={() => {
                                    setRenamingRouteId(route.id);
                                    setNewRouteNameInput(route.name);
                                  }}
                                  className={`text-[10px] flex items-center gap-0.5 ml-1 ${
                                    isAqua
                                      ? 'text-[#0284c7]/60 hover:text-[#0284c7]'
                                      : 'text-[#b7a2d9]/60 hover:text-[#ff8ecb]'
                                  }`}
                                  title="重命名该线路"
                                >
                                  <Edit3 className="w-2.5 h-2.5" />
                                  <span>重命名</span>
                                </button>
                              </div>
                            )}

                            <span
                              className={`text-[10px] font-mono shrink-0 ${
                                isAqua ? 'text-[#0284c7]/50' : 'text-[#b7a2d9]/50'
                              }`}
                            >
                              {new Date(route.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          {/* 线路分歧概览 */}
                          <div
                            className={`mt-1.5 text-[11px] space-y-0.5 ${
                              isAqua ? 'text-[#0284c7]/80' : 'text-[#b7a2d9]'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px]">
                              <span
                                className={isAqua ? 'text-[#0284c7] font-medium' : 'text-[#ff8ecb]/90'}
                              >
                                该线路包含 {route.messages?.length || 0} 段剧情内容
                              </span>
                              {route.forkMessageId && (
                                <span
                                  className={`font-mono ${
                                    isAqua ? 'text-[#0284c7]/60' : 'text-[#b7a2d9]/60'
                                  }`}
                                >
                                  #{rIdx + 1} 号分支
                                </span>
                              )}
                            </div>
                            {route.forkSnippet && (
                              <p
                                className={`text-[10px] font-serif line-clamp-1 italic ${
                                  isAqua ? 'text-[#0369a1]/70' : 'text-[#d8b4e2]/80'
                                }`}
                              >
                                📌 分歧起点："{route.forkSnippet}"
                              </p>
                            )}
                          </div>

                          {/* 线路操作按钮 */}
                          <div
                            className={`flex items-center justify-end gap-2 pt-2 mt-1.5 border-t ${
                              isAqua ? 'border-[#bae6fd]/50' : 'border-white/5'
                            }`}
                          >
                            {existingRoutes.length > 1 && (
                              <button
                                onClick={() => handleDeleteRoute(route.id)}
                                className="text-rose-500 hover:text-rose-600 text-[10px] px-1 py-0.5"
                                title="删除此分歧线路"
                              >
                                删除线路
                              </button>
                            )}
                            {isActive ? (
                              <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 px-2 py-1">
                                <Check className="w-3.5 h-3.5" />
                                <span>当前正在推演此线</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleSwitchRoute(route.id)}
                                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95"
                              >
                                <GitBranch className="w-3.5 h-3.5" />
                                <span>切换至此版本</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                <div
                  className={`flex items-center justify-between pt-2 border-t ${
                    isAqua ? 'border-[#bae6fd]' : 'border-white/10'
                  }`}
                >
                  <button
                    onClick={handleCreateNewBranch}
                    className={`text-xs hover:underline flex items-center gap-1 font-medium ${
                      isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>从当前进度新建平行分歧线</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsNodesModalOpen(false);
                      setRenamingRouteId(null);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl border text-xs transition-colors ${
                      isAqua
                        ? 'border-[#bae6fd] text-[#0284c7] hover:bg-[#f0f9ff]'
                        : 'border-white/10 text-[#b7a2d9] hover:text-white'
                    }`}
                  >
                    关闭
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: 故事节点存档 */}
            {nodesModalTab === 'nodes' && (
              <div className="space-y-3">
                <p
                  className={`text-[11px] leading-relaxed ${
                    isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]'
                  }`}
                >
                  在任意段落「更多」中点击「存为节点」即可存档。可随时回溯跳转到指定节点重写未来：
                </p>

                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {!currentSession.savedNodes || currentSession.savedNodes.length === 0 ? (
                    <div
                      className={`p-4 text-center text-xs rounded-2xl ${
                        isAqua ? 'text-[#0284c7]/60 bg-[#f0f9ff]' : 'text-[#b7a2d9]/70 bg-white/5'
                      }`}
                    >
                      暂未保存故事节点。在段落左下角「更多」中点击「存为节点」即可随时存档。
                    </div>
                  ) : (
                    currentSession.savedNodes.map((node) => (
                      <div
                        key={node.id}
                        className={`p-3 rounded-2xl border space-y-1.5 text-xs ${
                          isAqua
                            ? 'bg-[#f0f9ff] border-[#bae6fd]'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-bold ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`}
                          >
                            {node.name}
                          </span>
                          <span
                            className={`text-[10px] font-mono ${
                              isAqua ? 'text-[#0284c7]/60' : 'text-[#b7a2d9]/60'
                            }`}
                          >
                            {new Date(node.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p
                          className={`text-[11px] font-serif line-clamp-2 leading-relaxed ${
                            isAqua ? 'text-[#0369a1]/80' : 'text-[#d8b4e2]'
                          }`}
                        >
                          {node.previewText}
                        </p>
                        <div
                          className={`flex items-center justify-end gap-2 pt-1 border-t ${
                            isAqua ? 'border-[#bae6fd]/50' : 'border-white/5'
                          }`}
                        >
                          <button
                            onClick={() => handleDeleteNode(node.id)}
                            className="text-rose-500 hover:text-rose-600 text-[10px]"
                          >
                            删除节点
                          </button>
                          <button
                            onClick={() => handleRevertToNode(node)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                              isAqua
                                ? 'bg-[#e0f2fe] hover:bg-[#bae6fd] text-[#0284c7]'
                                : 'bg-[#381a4e] hover:bg-[#ff8ecb] hover:text-[#1a0f24] text-[#ff8ecb]'
                            }`}
                          >
                            回溯至此节点
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div
                  className={`flex items-center justify-between pt-2 border-t ${
                    isAqua ? 'border-[#bae6fd]' : 'border-white/10'
                  }`}
                >
                  <button
                    onClick={() => {
                      const lastMsg = currentSession.messages[currentSession.messages.length - 1];
                      if (lastMsg) {
                        handleSaveNode(lastMsg.id);
                      } else {
                        showToast('暂无剧情内容可存为节点');
                      }
                    }}
                    className={`text-xs hover:underline flex items-center gap-1 font-medium ${
                      isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>将当前最新进度存为节点</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsNodesModalOpen(false);
                      setRenamingRouteId(null);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl border text-xs transition-colors ${
                      isAqua
                        ? 'border-[#bae6fd] text-[#0284c7] hover:bg-[#f0f9ff]'
                        : 'border-white/10 text-[#b7a2d9] hover:text-white'
                    }`}
                  >
                    关闭
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 弹窗 5: 搜索楼层 */}
      {isSearchModalOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in select-none">
          <div
            className={`w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-3 animate-in zoom-in-95 border ${
              isAqua ? 'bg-white border-[#bae6fd]' : 'bg-[#1f112c] border-[#ff8ecb]/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3
                className={`text-sm font-bold flex items-center gap-1.5 ${
                  isAqua ? 'text-[#0369a1]' : 'text-white'
                }`}
              >
                <Search className={`w-4 h-4 ${isAqua ? 'text-[#0284c7]' : 'text-blue-400'}`} />
                <span>搜索楼层与段落</span>
              </h3>
              <button
                onClick={() => setIsSearchModalOpen(false)}
                className={`p-1 transition-colors ${
                  isAqua ? 'text-[#0284c7] hover:text-[#0369a1]' : 'text-[#b7a2d9] hover:text-white'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="输入关键字搜索对话、动作或描写..."
                className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none border transition-colors ${
                  isAqua
                    ? 'bg-[#f0f9ff] border-[#bae6fd] focus:border-[#0284c7] text-[#0369a1] placeholder:text-[#0284c7]/40'
                    : 'bg-[#12081a] border-[#4b3670] focus:border-[#ff8ecb] text-[#f7d6e8] placeholder:text-[#b7a2d9]/40'
                }`}
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {!searchQuery.trim() ? (
                <div
                  className={`p-4 text-center text-xs ${
                    isAqua ? 'text-[#0284c7]/60' : 'text-[#b7a2d9]/60'
                  }`}
                >
                  输入关键词检索小说历史楼层
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-rose-500">未找到匹配的楼层内容</div>
              ) : (
                searchResults.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => {
                      setIsSearchModalOpen(false);
                      const el = document.getElementById(`msg-${res.id}`);
                      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className={`p-2.5 rounded-xl cursor-pointer transition-colors space-y-1 border ${
                      isAqua
                        ? 'bg-[#f0f9ff] hover:bg-[#e0f2fe] border-[#bae6fd]'
                        : 'bg-white/5 hover:bg-[#34184c] border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span
                        className={`font-bold ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`}
                      >
                        #{res.index} {res.role === 'user' ? '玩家输入' : currentChar.name}
                      </span>
                      <span
                        className={`text-[10px] ${
                          isAqua ? 'text-[#0284c7]/50' : 'text-[#b7a2d9]/50'
                        }`}
                      >
                        点击直达定位
                      </span>
                    </div>
                    <p
                      className={`text-xs font-serif line-clamp-2 leading-relaxed ${
                        isAqua ? 'text-[#0369a1]/85' : 'text-[#d8b4e2]'
                      }`}
                    >
                      {res.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 弹窗 6: 导出全文 */}
      {isExportModalOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in select-none">
          <div
            className={`w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-3 animate-in zoom-in-95 border ${
              isAqua ? 'bg-white border-[#bae6fd]' : 'bg-[#1f112c] border-[#ff8ecb]/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3
                className={`text-sm font-bold flex items-center gap-1.5 ${
                  isAqua ? 'text-[#0369a1]' : 'text-white'
                }`}
              >
                <Download className={`w-4 h-4 ${isAqua ? 'text-[#0284c7]' : 'text-violet-400'}`} />
                <span>导出全文小说</span>
              </h3>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className={`p-1 transition-colors ${
                  isAqua ? 'text-[#0284c7] hover:text-[#0369a1]' : 'text-[#b7a2d9] hover:text-white'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div
              className={`flex items-center justify-between text-xs p-2 rounded-xl border ${
                isAqua
                  ? 'bg-[#f0f9ff] border-[#bae6fd] text-[#0284c7]'
                  : 'bg-white/5 border-transparent text-[#b7a2d9]'
              }`}
            >
              <span>总字数: {fullNovelText.replace(/\s+/g, '').length} 字</span>
              <span>总段落: {currentSession.messages.length} 轮次</span>
            </div>

            <textarea
              readOnly
              rows={8}
              value={fullNovelText}
              className={`w-full rounded-xl p-3 text-xs focus:outline-none resize-none font-serif leading-relaxed border ${
                isAqua
                  ? 'bg-[#f0f9ff] border-[#bae6fd] text-[#0369a1]'
                  : 'bg-[#12081a] border-[#4b3670] text-[#f7d6e8]'
              }`}
            />

            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(fullNovelText);
                  showToast('已复制全文到剪贴板！');
                }}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition-colors ${
                  isAqua
                    ? 'bg-[#e0f2fe] hover:bg-[#bae6fd] text-[#0284c7] border-[#7dd3fc]'
                    : 'bg-[#2b143c] hover:bg-[#381a4e] text-[#ff8ecb] border-[#ff8ecb]/40'
                }`}
              >
                <Copy className="w-3.5 h-3.5" />
                <span>复制全文</span>
              </button>
              <button
                onClick={handleDownloadTxt}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition-colors ${
                  isAqua
                    ? 'bg-[#e0f2fe] hover:bg-[#bae6fd] text-[#0284c7] border-[#7dd3fc]'
                    : 'bg-[#2b143c] hover:bg-[#381a4e] text-[#ff8ecb] border-[#ff8ecb]/40'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>导出 TXT</span>
              </button>
              <button
                onClick={handleDownloadMarkdown}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition-colors ${
                  isAqua
                    ? 'bg-[#e0f2fe] hover:bg-[#bae6fd] text-[#0284c7] border-[#7dd3fc]'
                    : 'bg-[#2b143c] hover:bg-[#381a4e] text-[#ff8ecb] border-[#ff8ecb]/40'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>导出 MD</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 弹窗 7: 美化界面 */}
      {isAppearanceModalOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in select-none">
          <div
            className={`w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 border ${
              isAqua ? 'bg-white border-[#bae6fd]' : 'bg-[#1f112c] border-[#ff8ecb]/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3
                className={`text-sm font-bold flex items-center gap-1.5 ${
                  isAqua ? 'text-[#0369a1]' : 'text-white'
                }`}
              >
                <Palette className={`w-4 h-4 ${isAqua ? 'text-[#0284c7]' : 'text-rose-400'}`} />
                <span>美化小说阅读界面</span>
              </h3>
              <button
                onClick={() => setIsAppearanceModalOpen(false)}
                className={`p-1 transition-colors ${
                  isAqua ? 'text-[#0284c7] hover:text-[#0369a1]' : 'text-[#b7a2d9] hover:text-white'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 纸张主题 */}
            <div className="space-y-1.5 text-xs">
              <span className={`font-bold ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`}>
                纸张色调主题：
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'night', label: '深邃夜幕', desc: '默认暗黑微粉' },
                  { key: 'parchment', label: '羊皮纸墨香', desc: '暖棕复古纸张' },
                  { key: 'slate', label: '灰烬冷月', desc: '冷调青灰石板' },
                  { key: 'sakura', label: '樱落粉雾', desc: '暗夜紫红花瓣' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleSaveConfig({ ...config, themeStyle: item.key as any })}
                    className={`p-2.5 rounded-2xl border text-left transition-colors ${
                      (config.themeStyle || 'night') === item.key
                        ? isAqua
                          ? 'bg-[#e0f2fe] border-[#0284c7] text-[#0369a1]'
                          : 'bg-[#3b1d52] border-[#ff8ecb] text-white'
                        : isAqua
                        ? 'bg-[#f0f9ff] border-[#bae6fd] text-[#0369a1] hover:bg-[#e0f2fe]'
                        : 'bg-white/5 border-white/10 text-[#b7a2d9] hover:bg-white/10'
                    }`}
                  >
                    <div className="font-bold text-xs">{item.label}</div>
                    <div className={`text-[10px] ${isAqua ? 'text-[#0284c7]/60' : 'opacity-70'}`}>
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 字体风格 */}
            <div className="space-y-1.5 text-xs">
              <span className={`font-bold ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`}>
                正文字体风格：
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'serif', label: '宋体文学' },
                  { key: 'kaiti', label: '仿宋行书' },
                  { key: 'sans', label: '黑体无衬线' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleSaveConfig({ ...config, fontFamily: item.key as any })}
                    className={`p-2 rounded-xl border text-center transition-colors text-xs ${
                      (config.fontFamily || 'serif') === item.key
                        ? isAqua
                          ? 'bg-[#e0f2fe] border-[#0284c7] text-[#0369a1] font-bold'
                          : 'bg-[#3b1d52] border-[#ff8ecb] text-white font-bold'
                        : isAqua
                        ? 'bg-[#f0f9ff] border-[#bae6fd] text-[#0369a1]'
                        : 'bg-white/5 border-white/10 text-[#b7a2d9]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 字号大小 */}
            <div className="space-y-1.5 text-xs">
              <span className={`font-bold ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`}>
                阅读正文字号：
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'sm', label: '小号 (14px)' },
                  { key: 'base', label: '适中 (15px)' },
                  { key: 'lg', label: '大号 (17px)' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleSaveConfig({ ...config, fontSize: item.key as any })}
                    className={`p-2 rounded-xl border text-center transition-colors text-xs ${
                      (config.fontSize || 'base') === item.key
                        ? isAqua
                          ? 'bg-[#e0f2fe] border-[#0284c7] text-[#0369a1] font-bold'
                          : 'bg-[#3b1d52] border-[#ff8ecb] text-white font-bold'
                        : isAqua
                        ? 'bg-[#f0f9ff] border-[#bae6fd] text-[#0369a1]'
                        : 'bg-white/5 border-white/10 text-[#b7a2d9]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsAppearanceModalOpen(false)}
                className={`px-4 py-1.5 rounded-xl font-bold text-xs shadow-md transition-opacity ${
                  isAqua
                    ? 'bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-white'
                    : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a0f24]'
                }`}
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 弹窗: 编辑消息段落 (支持角色段落与玩家自己的消息) */}
      {editingMsgId && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in select-none">
          <div
            className={`w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-3 animate-in zoom-in-95 border ${
              isAqua ? 'bg-white border-[#bae6fd]' : 'bg-[#1f112c] border-[#ff8ecb]/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3
                className={`text-sm font-bold flex items-center gap-1.5 ${
                  isAqua ? 'text-[#0369a1]' : 'text-white'
                }`}
              >
                <Edit3 className={`w-4 h-4 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`} />
                <span>编辑文字内容</span>
              </h3>
              <button
                onClick={() => setEditingMsgId(null)}
                className={`p-1 transition-colors ${
                  isAqua ? 'text-[#0284c7] hover:text-[#0369a1]' : 'text-[#b7a2d9] hover:text-white'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              rows={8}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className={`w-full rounded-2xl p-3 text-xs sm:text-[13px] focus:outline-none resize-none font-serif leading-relaxed border transition-colors ${
                isAqua
                  ? 'bg-[#f0f9ff] border-[#bae6fd] focus:border-[#0284c7] text-[#0369a1]'
                  : 'bg-[#12081a] border-[#4b3670] focus:border-[#ff8ecb] text-[#f7d6e8]'
              }`}
            />
            <div
              className={`flex items-center justify-between text-xs font-mono ${
                isAqua ? 'text-[#0284c7]/60' : 'text-[#b7a2d9]/60'
              }`}
            >
              <span>{editText.length} 字</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingMsgId(null)}
                  className={`px-3 py-1.5 rounded-xl border text-xs transition-colors ${
                    isAqua
                      ? 'border-[#bae6fd] text-[#0284c7] hover:bg-[#f0f9ff]'
                      : 'border-white/10 text-[#b7a2d9] hover:text-white'
                  }`}
                >
                  取消
                </button>
                {(() => {
                  const targetMsg = currentSession.messages.find((m) => m.id === editingMsgId);
                  const isUserMsg = targetMsg?.role === 'user';
                  return (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors border ${
                          isAqua
                            ? 'bg-[#e0f2fe] hover:bg-[#bae6fd] text-[#0284c7] border-[#7dd3fc]'
                            : 'bg-white/10 hover:bg-white/20 text-[#f7d6e8] border-transparent'
                        }`}
                      >
                        保存修改
                      </button>
                      {isUserMsg && (
                        <button
                          onClick={() => {
                            const curId = editingMsgId;
                            handleSaveEdit();
                            if (curId) {
                              setTimeout(() => {
                                handleUserReroll(curId);
                              }, 60);
                            }
                          }}
                          disabled={isGenerating}
                          className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all disabled:opacity-40 flex items-center gap-1 shadow-md ${
                            isAqua
                              ? 'bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-white hover:opacity-95'
                              : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] hover:opacity-95 text-[#1a0f24]'
                          }`}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>保存并重新推演</span>
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 弹窗: 删除这次线下记录确认 */}
      {isDeleteConfirmOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in select-none">
          <div
            className={`w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 text-center border ${
              isAqua ? 'bg-white border-rose-300' : 'bg-[#1e102a] border-rose-500/50'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center mx-auto ${
                isAqua
                  ? 'bg-rose-50 border-rose-300 text-rose-500'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              }`}
            >
              <Trash2 className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div className="space-y-1.5">
              <h3 className={`text-sm font-bold ${isAqua ? 'text-slate-800' : 'text-white'}`}>
                删除这次线下记录
              </h3>
              <p
                className={`text-xs leading-relaxed ${
                  isAqua ? 'text-slate-600' : 'text-[#b7a2d9]'
                }`}
              >
                确定清空删除本次与「{currentChar.name}」的面对面线下记录吗？清除后内容不可恢复。
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-colors ${
                  isAqua
                    ? 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    : 'border-white/10 text-[#b7a2d9] hover:text-white'
                }`}
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAllRecord}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-md"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 弹窗: 退出线下确认 (暂离此次线下 / 结束并保存此次线下 / 取消) */}
      {isExitModalOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in select-none">
          <div
            className={`w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 border ${
              isAqua
                ? 'bg-white border-[#bae6fd]'
                : 'bg-gradient-to-b from-[#241334] to-[#160c20] border-[#ff8ecb]/60'
            }`}
          >
            <div className="text-center space-y-1.5">
              <h3 className={`text-sm font-bold ${isAqua ? 'text-[#0369a1]' : 'text-white'}`}>
                离开与「{currentChar.name}」的线下空间
              </h3>
              <p
                className={`text-[11px] leading-relaxed ${
                  isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]'
                }`}
              >
                请选择本次现实相聚的处理方式：
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleTempLeave}
                className={`w-full p-3 rounded-2xl border text-left transition-all group jelly-btn ${
                  isAqua
                    ? 'bg-[#f0f9ff] hover:bg-[#e0f2fe] border-[#bae6fd] hover:border-[#38bdf8]'
                    : 'bg-[#1d102a] hover:bg-[#2b173e] border-[#4b3670] hover:border-[#ff8ecb]/60'
                }`}
              >
                <div
                  className={`flex items-center justify-between text-xs font-bold ${
                    isAqua
                      ? 'text-[#0369a1] group-hover:text-[#0284c7]'
                      : 'text-[#f7d6e8] group-hover:text-[#ff8ecb]'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <PauseCircle className={`w-4 h-4 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`} />
                    <span>暂离此次线下</span>
                  </span>
                  <span
                    className={`text-[10px] font-mono ${
                      isAqua ? 'text-[#0284c7] font-semibold' : 'text-[#ff8ecb] opacity-80'
                    }`}
                  >
                    保留进度
                  </span>
                </div>
                <div
                  className={`text-[10px] mt-1 leading-relaxed pl-5 ${
                    isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]/80'
                  }`}
                >
                  保持当前线下场景。在暂离途中，该角色
                  <span className={`font-bold ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`}>
                    不会在线上主动发信息
                  </span>
                  打扰。
                </div>
              </button>

              <button
                type="button"
                onClick={handleEndAndSave}
                className={`w-full p-3 rounded-2xl border text-left transition-all group jelly-btn shadow-md ${
                  isAqua
                    ? 'bg-gradient-to-r from-[#e0f2fe] to-[#bae6fd] hover:from-[#bae6fd] hover:to-[#7dd3fc] border-[#38bdf8]'
                    : 'bg-gradient-to-r from-[#321748] to-[#251037] hover:from-[#401d5c] hover:to-[#2e1445] border-[#ff8ecb]'
                }`}
              >
                <div
                  className={`flex items-center justify-between text-xs font-bold ${
                    isAqua
                      ? 'text-[#0369a1] group-hover:text-[#0c4a6e]'
                      : 'text-white group-hover:text-[#ff8ecb]'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className={`w-4 h-4 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`} />
                    <span>结束并保存此次线下</span>
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isAqua ? 'bg-[#0284c7]/15 text-[#0284c7]' : 'bg-[#ff8ecb]/20 text-[#ff8ecb]'
                    }`}
                  >
                    计入记忆
                  </span>
                </div>
                <div
                  className={`text-[10px] mt-1 leading-relaxed pl-5 ${
                    isAqua ? 'text-[#0369a1]/80' : 'text-[#f7d6e8]/90'
                  }`}
                >
                  结束本次相聚并
                  <span className={`font-bold ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`}>
                    计入记忆
                  </span>
                  ，方便下次在QQ聊天或相见时角色依然记得。
                </div>
              </button>

              {/* 🌟 需求 1: 删除并离开此次线下（不保存此次线下） */}
              <button
                type="button"
                onClick={handleDeleteAndExit}
                className={`w-full p-3 rounded-2xl border text-left transition-all group jelly-btn shadow-md ${
                  isAqua
                    ? 'bg-rose-50 hover:bg-rose-100/80 border-rose-300'
                    : 'bg-[#28111e]/90 hover:bg-[#381628] border-rose-500/50 hover:border-rose-400'
                }`}
              >
                <div
                  className={`flex items-center justify-between text-xs font-bold ${
                    isAqua ? 'text-rose-700' : 'text-rose-300 group-hover:text-rose-200'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    <span>删除并离开此次线下</span>
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isAqua
                        ? 'bg-rose-100 border border-rose-300 text-rose-600'
                        : 'bg-rose-950/80 border border-rose-500/40 text-rose-300'
                    }`}
                  >
                    不保存
                  </span>
                </div>
                <div
                  className={`text-[10px] mt-1 leading-relaxed pl-5 ${
                    isAqua ? 'text-rose-600/80' : 'text-rose-200/70'
                  }`}
                >
                  彻底放弃并删除本次记录，
                  <span className={`font-bold ${isAqua ? 'text-rose-700' : 'text-rose-300'}`}>
                    不保存也不计入记忆
                  </span>
                  ，直接返回。
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsExitModalOpen(false)}
                className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-colors text-center ${
                  isAqua
                    ? 'border-[#bae6fd] text-[#0284c7] hover:bg-[#f0f9ff]'
                    : 'border-white/10 text-[#b7a2d9] hover:text-white'
                }`}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 弹窗: 更多设置 */}
      <OfflineSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        presets={presets}
        worldbooks={worldbooks}
        char={currentChar}
        currentTheme={currentTheme}
      />
    </div>
  );
};
