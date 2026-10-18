import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Search,
  Check,
  Edit2,
  Trash2,
  Copy,
  Download,
  Upload,
  Sparkles,
  Sliders,
  Play,
  CheckCircle2,
  Globe,
  User,
  Smartphone,
  HeartHandshake,
  X,
  FileCode,
  Power,
  SlidersHorizontal,
} from 'lucide-react';
import {
  ApiConfig,
  CharacterPersona,
  PresetFormatRules,
  PresetItem,
  PresetScene,
  PresetScope,
} from '../types/phone';
import { PixelBow, PixelSparkle } from './PixelAssets';
import { sendChat, friendlyError, getActivePresetsForChar } from '../utils/aiService';

interface PresetAppProps {
  presets: PresetItem[];
  onSavePresets: (list: PresetItem[]) => void;
  activeApi?: ApiConfig;
  personas?: CharacterPersona[];
  onBack: () => void;
  subPage?: string;
  onNavigateSub: (sub: string, params?: any) => void;
  currentTheme?: string;
}

export const PresetApp: React.FC<PresetAppProps> = ({
  presets,
  onSavePresets,
  activeApi,
  personas = [],
  onBack,
  currentTheme = 'sky',
}) => {
  const isAqua = currentTheme === 'aqua_pixel';
  // 分区架构：清晰简洁正交两级划分
  // 1. 主分区：全局预设 (global) vs 非全局/专属预设 (local)
  const [activeScopeTab, setActiveScopeTab] = useState<'global' | 'local'>('global');

  // 2. 次级分区：场景划分 (全部 / 线上 / 线下)
  const [selectedScene, setSelectedScene] = useState<'all' | 'online' | 'offline'>('all');

  // 3. 关键字搜索
  const [searchQuery, setSearchQuery] = useState('');

  // 弹窗状态
  const [showPresetModal, setShowPresetModal] = useState(false); // 新建/编辑预设弹窗
  const [editingPreset, setEditingPreset] = useState<PresetItem | null>(null);

  const [showImportExportModal, setShowImportExportModal] = useState(false); // 导入导出
  const [importExportTab, setImportExportTab] = useState<'export' | 'import'>('export');
  const [importText, setImportText] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 试跑测试抽屉状态
  const [testingPreset, setTestingPreset] = useState<PresetItem | null>(null);
  const [testUserMsg, setTestUserMsg] = useState('今天想吃什么呀？我们要不要一起出门逛逛？');
  const [testCharId, setTestCharId] = useState<string>(personas[0]?.id || 'char_ruanruan');
  const [testReply, setTestReply] = useState<string | null>(null);
  const [isTestingLoading, setIsTestingLoading] = useState(false);

  // 表单状态 (新建 / 编辑)
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formScope, setFormScope] = useState<PresetScope>('global');
  const [formScene, setFormScene] = useState<PresetScene>('online');
  const [formBoundCharIds, setFormBoundCharIds] = useState<string[]>([]);
  const [formIsEnabled, setFormIsEnabled] = useState(true);
  const [formSystemPrompt, setFormSystemPrompt] = useState('');
  const [formPostPrompt, setFormPostPrompt] = useState('');
  const [formTemperature, setFormTemperature] = useState(0.85);
  const [formTopP, setFormTopP] = useState(0.9);
  const [formMaxTokens, setFormMaxTokens] = useState(400);
  const [formHistoryRounds, setFormHistoryRounds] = useState(15);

  // 格式微调
  const [formAllowAction, setFormAllowAction] = useState(true);
  const [formAllowThought, setFormAllowThought] = useState(false);
  const [formNoImpersonation, setFormNoImpersonation] = useState(true);
  const [formBubbleStyle, setFormBubbleStyle] = useState<'single' | 'multi' | 'natural'>('multi');
  const [formStickerFreq, setFormStickerFreq] = useState<'high' | 'normal' | 'low' | 'off'>('high');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

  // 统计当前启用的预设数量 (支持多个生效或0个生效)
  const enabledCount = presets.filter(
    (p) => (p.isEnabled !== undefined ? p.isEnabled : p.isGlobalActive)
  ).length;

  const globalPresets = presets.filter((p) => p.scope === 'global' || !p.scope);
  const localPresets = presets.filter((p) => p.scope === 'local');

  const globalEnabledCount = globalPresets.filter(
    (p) => (p.isEnabled !== undefined ? p.isEnabled : p.isGlobalActive)
  ).length;
  const localEnabledCount = localPresets.filter(
    (p) => (p.isEnabled !== undefined ? p.isEnabled : p.isGlobalActive)
  ).length;

  // 过滤当前展示的预设列表
  const displayedPresets = (activeScopeTab === 'global' ? globalPresets : localPresets).filter((p) => {
    // 场景过滤 (线上 vs 线下)
    const matchScene = selectedScene === 'all' || p.scene === selectedScene;
    // 搜索过滤
    const matchSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.systemPrompt.toLowerCase().includes(searchQuery.toLowerCase());

    return matchScene && matchSearch;
  });

  // 单独切换某项预设的启用状态 (支持多选开启，或全部关闭)
  const handleTogglePreset = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const next = presets.map((p) => {
      if (p.id === id) {
        const currentActive = p.isEnabled !== undefined ? p.isEnabled : Boolean(p.isGlobalActive);
        return {
          ...p,
          isEnabled: !currentActive,
          isGlobalActive: !currentActive,
        };
      }
      return p;
    });
    onSavePresets(next);
  };

  // 一键全部关闭 (设为0个生效)
  const handleDisableAll = () => {
    const next = presets.map((p) => ({
      ...p,
      isEnabled: false,
      isGlobalActive: false,
    }));
    onSavePresets(next);
    triggerToast('已全部停用预设（当前为 0 项生效状态）');
  };

  // 一键全部开启当前分区预设
  const handleEnableAllCurrent = () => {
    const next = presets.map((p) => {
      if (p.scope === activeScopeTab || (activeScopeTab === 'global' && !p.scope)) {
        return { ...p, isEnabled: true, isGlobalActive: true };
      }
      return p;
    });
    onSavePresets(next);
    triggerToast(`已开启当前${activeScopeTab === 'global' ? '全局' : '非全局'}所有预设 ✦`);
  };

  // 开始新建预设
  const handleStartCreate = () => {
    setEditingPreset(null);
    setFormName('');
    setFormDescription('');
    setFormScope(activeScopeTab);
    setFormScene(selectedScene !== 'all' ? selectedScene : 'online');
    setFormBoundCharIds([]);
    setFormIsEnabled(true);
    setFormSystemPrompt('');
    setFormPostPrompt('');
    setFormTemperature(0.85);
    setFormTopP(0.9);
    setFormMaxTokens(400);
    setFormHistoryRounds(15);
    setFormAllowAction(true);
    setFormAllowThought(false);
    setFormNoImpersonation(true);
    setFormBubbleStyle('multi');
    setFormStickerFreq('high');
    setShowPresetModal(true);
  };

  // 开始编辑预设
  const handleStartEdit = (p: PresetItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingPreset(p);
    setFormName(p.name);
    setFormDescription(p.description || '');
    setFormScope(p.scope || 'global');
    setFormScene(p.scene || 'online');
    setFormBoundCharIds(p.boundCharacterIds || []);
    setFormIsEnabled(p.isEnabled !== undefined ? p.isEnabled : Boolean(p.isGlobalActive));
    setFormSystemPrompt(p.systemPrompt || '');
    setFormPostPrompt(p.postPrompt || '');
    setFormTemperature(p.temperature ?? 0.85);
    setFormTopP(p.topP ?? 0.9);
    setFormMaxTokens(p.maxTokens ?? 400);
    setFormHistoryRounds(p.historyRounds ?? 15);
    setFormAllowAction(p.formatRules?.allowAction ?? true);
    setFormAllowThought(p.formatRules?.allowThought ?? false);
    setFormNoImpersonation(p.formatRules?.noImpersonation ?? true);
    setFormBubbleStyle(p.formatRules?.chatBubbleStyle || 'multi');
    setFormStickerFreq(p.formatRules?.stickerFrequency || 'normal');
    setShowPresetModal(true);
  };

  // 复制预设
  const handleDuplicate = (p: PresetItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const cloned: PresetItem = {
      ...p,
      id: 'preset_' + Date.now(),
      name: `${p.name} (副本)`,
      isEnabled: false,
      isGlobalActive: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    onSavePresets([cloned, ...presets]);
    triggerToast('已创建预设副本 ✦');
  };

  // 删除预设
  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('确认删除该预设吗？')) {
      const remaining = presets.filter((p) => p.id !== id);
      onSavePresets(remaining);
      triggerToast('预设已删除');
    }
  };

  // 保存新建/编辑
  const handleSaveForm = () => {
    if (!formName.trim() || !formSystemPrompt.trim()) {
      alert('请填写预设名称和核心设定词');
      return;
    }

    const formatRules: PresetFormatRules = {
      allowAction: formAllowAction,
      allowThought: formAllowThought,
      noImpersonation: formNoImpersonation,
      chatBubbleStyle: formBubbleStyle,
      stickerFrequency: formStickerFreq,
    };

    if (editingPreset) {
      const next = presets.map((p) => {
        if (p.id === editingPreset.id) {
          return {
            ...p,
            name: formName.trim(),
            description: formDescription.trim(),
            scope: formScope,
            scene: formScene,
            boundCharacterIds: formScope === 'local' ? formBoundCharIds : undefined,
            isEnabled: formIsEnabled,
            isGlobalActive: formIsEnabled,
            systemPrompt: formSystemPrompt.trim(),
            postPrompt: formPostPrompt.trim() || undefined,
            temperature: formTemperature,
            topP: formTopP,
            maxTokens: formMaxTokens,
            historyRounds: formHistoryRounds,
            formatRules,
            updatedAt: Date.now(),
          };
        }
        return p;
      });
      onSavePresets(next);
      triggerToast('预设已保存 ✦');
    } else {
      const newPreset: PresetItem = {
        id: 'preset_' + Date.now(),
        name: formName.trim(),
        description: formDescription.trim(),
        scope: formScope,
        scene: formScene,
        boundCharacterIds: formScope === 'local' ? formBoundCharIds : undefined,
        isEnabled: formIsEnabled,
        isGlobalActive: formIsEnabled,
        systemPrompt: formSystemPrompt.trim(),
        postPrompt: formPostPrompt.trim() || undefined,
        temperature: formTemperature,
        topP: formTopP,
        maxTokens: formMaxTokens,
        historyRounds: formHistoryRounds,
        formatRules,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      onSavePresets([newPreset, ...presets]);
      triggerToast('新预设已创建 ✦');
    }
    setShowPresetModal(false);
  };

  // 快速试跑
  const handleRunTest = async () => {
    if (!testingPreset || !testUserMsg.trim()) return;
    if (!activeApi) {
      setTestReply('（未配置生效的 AI 服务，请在桌面设置中开启）');
      return;
    }

    setIsTestingLoading(true);
    setTestReply(null);

    try {
      const activeChar = personas.find((c) => c.id === testCharId) || personas[0] || {
        id: 'char_ruanruan',
        name: '软软',
        remarks: '猫系好友',
        avatar: '',
        boundWorldBookIds: [],
        createdAt: Date.now(),
        personaPrompt: '一个可爱的手机好友。',
      };

      const systemPrompt = `【当前试跑预设：${testingPreset.name}】\n${testingPreset.systemPrompt}\n\n你扮演「${activeChar.name}」：\n${activeChar.personaPrompt}\n\n${testingPreset.postPrompt || ''}`;

      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: testUserMsg.trim() },
      ];

      const res = await sendChat(activeApi, messages, undefined, [testingPreset]);
      setTestReply(res || '（AI 未返回内容）');
    } catch (e: any) {
      setTestReply(`（测试报错：${friendlyError(e)}）`);
    } finally {
      setIsTestingLoading(false);
    }
  };

  // 导出 JSON
  const handleExportJson = (target?: PresetItem) => {
    const dataToExport = target ? [target] : presets;
    const jsonStr = JSON.stringify(dataToExport, null, 2);
    navigator.clipboard.writeText(jsonStr);
    triggerToast('预设 JSON 已复制到剪贴板 📋');
  };

  // 下载 JSON
  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(presets, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phone_presets_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('已下载预设配置文件 💾');
  };

  // 导入 JSON
  const handleImportJson = () => {
    if (!importText.trim()) {
      alert('请先粘贴预设 JSON 内容');
      return;
    }
    try {
      const parsed = JSON.parse(importText);
      const items: any[] = Array.isArray(parsed) ? parsed : [parsed];
      if (items.length === 0 || !items[0].name || !items[0].systemPrompt) {
        throw new Error('格式不符合预设结构');
      }

      const validated: PresetItem[] = items.map((it, idx) => ({
        id: 'preset_imported_' + Date.now() + '_' + idx,
        name: String(it.name || '导入预设'),
        description: String(it.description || ''),
        scope: it.scope === 'local' ? 'local' : 'global',
        scene: it.scene === 'offline' ? 'offline' : 'online',
        boundCharacterIds: Array.isArray(it.boundCharacterIds) ? it.boundCharacterIds : undefined,
        isEnabled: it.isEnabled !== undefined ? Boolean(it.isEnabled) : true,
        isGlobalActive: it.isEnabled !== undefined ? Boolean(it.isEnabled) : true,
        systemPrompt: String(it.systemPrompt || ''),
        postPrompt: it.postPrompt ? String(it.postPrompt) : undefined,
        temperature: typeof it.temperature === 'number' ? it.temperature : 0.85,
        topP: typeof it.topP === 'number' ? it.topP : 0.9,
        maxTokens: typeof it.maxTokens === 'number' ? it.maxTokens : 400,
        historyRounds: typeof it.historyRounds === 'number' ? it.historyRounds : 15,
        formatRules: it.formatRules || {
          allowAction: true,
          allowThought: false,
          noImpersonation: true,
          chatBubbleStyle: 'multi',
          stickerFrequency: 'normal',
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }));

      onSavePresets([...validated, ...presets]);
      setShowImportExportModal(false);
      setImportText('');
      triggerToast(`成功导入 ${validated.length} 个新预设 ✦`);
    } catch (e: any) {
      alert('导入失败，请检查 JSON 格式：' + e.message);
    }
  };

  // 获取绑定角色的名称说明
  const getBoundCharNames = (ids?: string[]) => {
    if (!ids || ids.length === 0) return '未限定角色 (对所有角色生效)';
    const names = ids
      .map((id) => personas.find((c) => c.id === id)?.name)
      .filter(Boolean);
    return names.length > 0 ? names.join('、') : '专属角色';
  };

  // 切换绑定角色的勾选
  const handleToggleCharId = (id: string) => {
    setFormBoundCharIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div
      className={`flex-1 flex flex-col select-none overflow-hidden relative font-mono transition-colors duration-200 ${
        isAqua
          ? 'bg-gradient-to-b from-[#f0f9ff] via-[#e0f2fe] to-[#bae6fd] text-[#0284c7]'
          : 'bg-gradient-to-b from-[#180f21] via-[#120b18] to-[#0a050e] text-[#f7d6e8]'
      }`}
    >
      {/* 顶部标题栏 */}
      <div
        className={`h-12 px-4 flex items-center justify-between border-b backdrop-blur-md z-20 shrink-0 ${
          isAqua
            ? 'border-[#7dd3fc] bg-white/95 text-[#0284c7]'
            : 'border-[#3b2a5a] bg-[#1e1328]/95 text-[#f7d6e8]'
        }`}
      >
        <button
          onClick={onBack}
          className={`p-1.5 rounded-lg jelly-btn ${
            isAqua ? 'text-[#0284c7] hover:bg-[#e0f2fe]' : 'text-[#d88fbf] hover:text-white'
          }`}
          title="返回桌面"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2]" />
        </button>
        <div className="flex items-center gap-1.5 text-sm font-bold">
          <Sliders className={`w-4 h-4 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`} />
          <span className={isAqua ? 'text-[#0284c7]' : 'text-[#f7d6e8]'}>预设管理中心</span>
          <PixelBow className="w-5 h-5 drop-shadow-sm" />
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowImportExportModal(true)}
            className={`p-1.5 rounded-lg border jelly-btn ${
              isAqua
                ? 'border-[#bae6fd] bg-[#f0f9ff] text-[#0284c7] hover:bg-[#e0f2fe]'
                : 'border-[#4b3670] bg-[#221430] text-[#d88fbf] hover:text-white'
            }`}
            title="导入 / 导出 JSON"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleStartCreate}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 jelly-btn ${
              isAqua
                ? 'bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-white shadow-[0_2px_10px_rgba(56,189,248,0.35)]'
                : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] shadow-[0_2px_10px_rgba(255,142,203,0.35)]'
            }`}
            title="新建预设"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>新建预设</span>
          </button>
        </div>
      </div>

      {/* 悬浮 Toast 提示 */}
      {toastMsg && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in duration-200">
          <div
            className={`backdrop-blur-md px-3.5 py-1.5 rounded-xl border shadow-lg text-[11px] flex items-center gap-1.5 ${
              isAqua
                ? 'bg-white/95 text-[#0284c7] border-[#7dd3fc] shadow-[0_4px_20px_rgba(56,189,248,0.35)]'
                : 'bg-[#1f132a]/95 text-[#f7d6e8] border-[#ff8ecb] shadow-[0_4px_20px_rgba(255,142,203,0.4)]'
            }`}
          >
            <Sparkles className={`w-3 h-3 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`} />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* 核心生效状态卡片：支持多项开启或零项开启 */}
      <div
        className={`px-3.5 py-2.5 border-b flex items-center justify-between text-xs shrink-0 ${
          isAqua
            ? 'bg-white/90 border-[#7dd3fc]/80 text-[#0284c7]'
            : 'bg-[#170e22]/95 border-[#3b2a5a]/70 text-[#f7d6e8]'
        }`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              enabledCount > 0
                ? isAqua
                  ? 'bg-[#0284c7] shadow-[0_0_10px_#38bdf8] animate-pulse'
                  : 'bg-[#ff8ecb] shadow-[0_0_10px_#ff8ecb] animate-pulse'
                : 'bg-zinc-400'
            }`}
          />
          <div className="text-[11px]">
            {enabledCount > 0 ? (
              <span>
                当前已启用：<b className={isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}>{enabledCount}</b> 项预设
                <span className={`ml-1.5 hidden sm:inline ${isAqua ? 'text-[#0369a1]/70' : 'text-[#b7a2d9]/70'}`}>
                  (可勾选多项叠加生效)
                </span>
              </span>
            ) : (
              <span className={isAqua ? 'text-[#0369a1]/70' : 'text-[#b7a2d9]/70'}>
                当前为 <b>0 项生效</b>（仅按角色原设与世界书对话）
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {enabledCount > 0 && (
            <button
              onClick={handleDisableAll}
              className={`text-[10px] px-2.5 py-1 rounded-lg border transition-colors ${
                isAqua
                  ? 'bg-[#f0f9ff] border-[#bae6fd] text-[#0284c7] hover:bg-[#e0f2fe]'
                  : 'bg-[#251535] border-[#4b3670] text-[#b7a2d9] hover:text-white hover:border-[#ff8ecb]'
              }`}
            >
              全部停用 (设为0项)
            </button>
          )}
          <button
            onClick={handleEnableAllCurrent}
            className={`text-[10px] px-2 py-1 rounded-lg border transition-colors ${
              isAqua
                ? 'bg-[#e0f2fe] border-[#7dd3fc] text-[#0284c7] hover:bg-[#bae6fd]'
                : 'bg-[#221430] border-[#4b3670] text-[#ff8ecb] hover:bg-[#341d45]'
            }`}
          >
            开启本栏
          </button>
        </div>
      </div>

      {/* 预设分区控制区：两级清晰正交架构 (1. 全局 vs 非全局；2. 线上 vs 线下) */}
      <div
        className={`p-3 border-b space-y-2.5 shrink-0 ${
          isAqua
            ? 'bg-[#f0f9ff]/90 border-[#7dd3fc]/60'
            : 'bg-[#191024]/85 border-[#3b2a5a]/70'
        }`}
      >
        {/* 一级分区主选项卡：全局预设 vs 非全局/专属预设 */}
        <div
          className={`grid grid-cols-2 gap-2 p-1 rounded-2xl border shadow-inner ${
            isAqua
              ? 'bg-white/90 border-[#7dd3fc]'
              : 'bg-[#12081a] border-[#3b2a5a]/80'
          }`}
        >
          <button
            onClick={() => setActiveScopeTab('global')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeScopeTab === 'global'
                ? isAqua
                  ? 'bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-white shadow-[0_2px_12px_rgba(56,189,248,0.35)]'
                  : 'bg-gradient-to-r from-[#7c3aed] to-[#d946ef] text-white shadow-[0_2px_12px_rgba(217,70,239,0.35)]'
                : isAqua
                ? 'text-[#0284c7]/70 hover:text-[#0284c7] hover:bg-[#e0f2fe]'
                : 'text-[#b7a2d9] hover:text-white hover:bg-[#1f132a]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>全局预设</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 border border-white/20">
              {globalPresets.length}项 ({globalEnabledCount}生效)
            </span>
          </button>

          <button
            onClick={() => setActiveScopeTab('local')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeScopeTab === 'local'
                ? isAqua
                  ? 'bg-gradient-to-r from-[#0284c7] to-[#0369a1] text-white shadow-[0_2px_12px_rgba(2,132,199,0.35)]'
                  : 'bg-gradient-to-r from-[#f59e0b] to-[#ec4899] text-white shadow-[0_2px_12px_rgba(236,72,153,0.35)]'
                : isAqua
                ? 'text-[#0284c7]/70 hover:text-[#0284c7] hover:bg-[#e0f2fe]'
                : 'text-[#b7a2d9] hover:text-white hover:bg-[#1f132a]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>非全局 · 角色专属</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 border border-white/20">
              {localPresets.length}项 ({localEnabledCount}生效)
            </span>
          </button>
        </div>

        {/* 二级分区：场景维度筛选 (全部 / 线上 / 线下) + 搜索框 */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedScene('all')}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                selectedScene === 'all'
                  ? isAqua
                    ? 'bg-[#0284c7] text-white shadow-sm'
                    : 'bg-[#ff8ecb] text-[#1a1120]'
                  : isAqua
                  ? 'bg-white text-[#0284c7] border border-[#bae6fd]'
                  : 'bg-[#1f132a] text-[#b7a2d9] border border-[#3b2a5a]'
              }`}
            >
              全部场景
            </button>
            <button
              onClick={() => setSelectedScene('online')}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all ${
                selectedScene === 'online'
                  ? isAqua
                    ? 'bg-[#38bdf8] text-[#0c4a6e] font-bold'
                    : 'bg-cyan-400 text-[#091824]'
                  : isAqua
                  ? 'bg-white text-[#0284c7] border border-[#bae6fd]'
                  : 'bg-[#1f132a] text-cyan-300 border border-cyan-800/60'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              <span>📱 线上社交</span>
            </button>
            <button
              onClick={() => setSelectedScene('offline')}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all ${
                selectedScene === 'offline'
                  ? isAqua
                    ? 'bg-[#7dd3fc] text-[#0369a1] font-bold'
                    : 'bg-[#d88fbf] text-[#1a1120]'
                  : isAqua
                  ? 'bg-white text-[#0284c7] border border-[#bae6fd]'
                  : 'bg-[#1f132a] text-[#f7d6e8] border border-[#6b4c8a]'
              }`}
            >
              <HeartHandshake className="w-3 h-3" />
              <span>🤝 线下现实</span>
            </button>
          </div>

          {/* 搜索框 */}
          <div
            className={`flex-1 max-w-[160px] sm:max-w-[200px] flex items-center gap-1 px-2.5 py-1 rounded-xl border ${
              isAqua
                ? 'bg-white border-[#7dd3fc]'
                : 'bg-[#1f132a] border-[#4b3670]'
            }`}
          >
            <Search className={`w-3 h-3 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索预设..."
              className={`flex-1 text-[11px] bg-transparent focus:outline-none ${
                isAqua
                  ? 'text-[#0284c7] placeholder-[#0284c7]/40'
                  : 'text-[#f7d6e8] placeholder-[#b7a2d9]/50'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={isAqua ? 'text-[#0284c7]' : 'text-[#b7a2d9] hover:text-white'}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* 分区提示说明 */}
        <div className={`text-[10px] px-0.5 ${isAqua ? 'text-[#0369a1]/80' : 'text-[#b7a2d9]/70'}`}>
          {activeScopeTab === 'global' ? (
            <span>🌐 全局预设：对所有通讯录好友聊天均通用生效。可多选叠加（如：甜刺私聊 + 防出戏）。</span>
          ) : (
            <span>👤 非全局预设：仅对选中的绑定联系人生效（如：专属日常），不干扰其他角色。</span>
          )}
        </div>
      </div>

      {/* 预设列表展示区 */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {displayedPresets.length === 0 ? (
          <div className="h-60 flex flex-col items-center justify-center text-[#b7a2d9] text-xs">
            <Sliders className="w-12 h-12 stroke-[1.2] text-[#d88fbf]/30 mb-3" />
            <span>当前分区下暂无预设项</span>
            <p className="text-[10px] text-[#b7a2d9]/60 mt-1">
              点击下方按钮，创建一个{activeScopeTab === 'global' ? '全局' : '非全局'}预设
            </p>
            <button
              onClick={handleStartCreate}
              className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] font-bold text-xs jelly-btn"
            >
              + 新建预设
            </button>
          </div>
        ) : (
          displayedPresets.map((p) => {
            const isEnabled = p.isEnabled !== undefined ? p.isEnabled : Boolean(p.isGlobalActive);
            const isGlobal = p.scope === 'global' || !p.scope;
            const isOnline = p.scene === 'online';

            return (
              <div
                key={p.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isEnabled
                    ? isAqua
                      ? 'bg-white/90 border-[#7dd3fc] shadow-[0_4px_20px_rgba(56,189,248,0.2)]'
                      : 'bg-[#221330]/90 border-[#ff8ecb]/80 shadow-[0_4px_20px_rgba(255,142,203,0.18)]'
                    : isAqua
                    ? 'bg-[#e0f2fe]/60 border-[#bae6fd] opacity-75 hover:opacity-90'
                    : 'bg-[#160d1f]/75 border-[#3b2a5a] opacity-75 hover:opacity-90'
                } flex flex-col gap-2.5`}
              >
                {/* 顶栏：标签、标题与独立启用开关 (可多个或0个生效) */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* 范围标签 (全局 vs 角色专属) */}
                    {isGlobal ? (
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full border flex items-center gap-0.5 font-bold ${
                          isAqua
                            ? 'bg-[#0284c7]/15 border-[#0284c7]/40 text-[#0284c7]'
                            : 'bg-purple-950/70 border-purple-400/60 text-purple-300'
                        }`}
                      >
                        <Globe className="w-2.5 h-2.5" />
                        <span>全局通用</span>
                      </span>
                    ) : (
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full border flex items-center gap-0.5 font-bold ${
                          isAqua
                            ? 'bg-amber-100 border-amber-300 text-amber-700'
                            : 'bg-amber-950/70 border-amber-400/60 text-amber-300'
                        }`}
                      >
                        <User className="w-2.5 h-2.5" />
                        <span>{getBoundCharNames(p.boundCharacterIds)}</span>
                      </span>
                    )}

                    {/* 场景标签 (线上 vs 线下) */}
                    {isOnline ? (
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full border flex items-center gap-0.5 font-bold ${
                          isAqua
                            ? 'bg-cyan-100 border-cyan-300 text-cyan-800'
                            : 'bg-cyan-950/70 border-cyan-400/60 text-cyan-300'
                        }`}
                      >
                        <Smartphone className="w-2.5 h-2.5" />
                        <span>线上网络</span>
                      </span>
                    ) : (
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full border flex items-center gap-0.5 font-bold ${
                          isAqua
                            ? 'bg-sky-100 border-sky-300 text-sky-800'
                            : 'bg-pink-950/70 border-pink-400/60 text-pink-300'
                        }`}
                      >
                        <HeartHandshake className="w-2.5 h-2.5" />
                        <span>线下现实</span>
                      </span>
                    )}

                    <span
                      className={`text-xs font-bold ${
                        isEnabled
                          ? isAqua
                            ? 'text-[#0c4a6e]'
                            : 'text-white'
                          : isAqua
                          ? 'text-[#0369a1]'
                          : 'text-[#b7a2d9]'
                      }`}
                    >
                      {p.name}
                    </span>
                  </div>

                  {/* 独立开关按钮 (多选生效或全部停用) */}
                  <button
                    onClick={(e) => handleTogglePreset(p.id, e)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 border transition-all ${
                      isEnabled
                        ? isAqua
                          ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-[0_0_12px_rgba(2,132,199,0.35)]'
                          : 'bg-[#ff8ecb] text-[#1a1120] border-[#ff8ecb] shadow-[0_0_12px_rgba(255,142,203,0.5)]'
                        : isAqua
                        ? 'bg-white text-[#0369a1]/60 border-[#bae6fd] hover:border-[#0284c7]/60'
                        : 'bg-[#1c1126] text-[#b7a2d9]/60 border-[#4b3670] hover:border-[#ff8ecb]/60'
                    }`}
                    title={isEnabled ? '点击停用该预设' : '点击启用该预设（支持多个同时开启）'}
                  >
                    <Power className="w-2.5 h-2.5" />
                    <span>{isEnabled ? '生效中 (多选)' : '未启用'}</span>
                  </button>
                </div>

                {/* 描述与系统设定概览 */}
                <p
                  className={`text-[11px] line-clamp-2 leading-relaxed p-2.5 rounded-xl border ${
                    isAqua
                      ? 'text-[#0369a1] bg-[#f0f9ff] border-[#bae6fd]'
                      : 'text-[#b7a2d9] bg-[#140b1b] border-[#3b2a5a]/50'
                  }`}
                >
                  {p.description || p.systemPrompt.slice(0, 90) + '...'}
                </p>

                {/* 参数指标与格式特性标签 */}
                <div
                  className={`flex items-center gap-1.5 flex-wrap text-[9px] ${
                    isAqua ? 'text-[#0369a1]/80' : 'text-[#b7a2d9]/80'
                  }`}
                >
                  <span
                    className={`px-1.5 py-0.2 rounded border ${
                      isAqua ? 'bg-[#e0f2fe] border-[#bae6fd]' : 'bg-[#251535] border-[#4b3670]'
                    }`}
                  >
                    温度: <b className={isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}>{p.temperature ?? 0.85}</b>
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded border ${
                      isAqua ? 'bg-[#e0f2fe] border-[#bae6fd]' : 'bg-[#251535] border-[#4b3670]'
                    }`}
                  >
                    Tokens: <b>{p.maxTokens ?? 400}</b>
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded border ${
                      isAqua ? 'bg-[#e0f2fe] border-[#bae6fd]' : 'bg-[#251535] border-[#4b3670]'
                    }`}
                  >
                    历史: <b>{p.historyRounds ?? 15}轮</b>
                  </span>
                  {p.formatRules?.allowAction && (
                    <span
                      className={`px-1.5 py-0.2 rounded border ${
                        isAqua
                          ? 'bg-purple-100 border-purple-200 text-purple-800'
                          : 'bg-purple-950/40 border-purple-700/50 text-purple-200'
                      }`}
                    >
                      （动作描摹）
                    </span>
                  )}
                  {p.formatRules?.allowThought && (
                    <span
                      className={`px-1.5 py-0.2 rounded border ${
                        isAqua
                          ? 'bg-sky-100 border-sky-200 text-sky-800'
                          : 'bg-pink-950/40 border-pink-700/50 text-pink-200'
                      }`}
                    >
                      【内心独白】
                    </span>
                  )}
                  {p.formatRules?.noImpersonation && (
                    <span
                      className={`px-1.5 py-0.2 rounded border ${
                        isAqua
                          ? 'bg-amber-100 border-amber-200 text-amber-800'
                          : 'bg-amber-950/40 border-amber-700/50 text-amber-200'
                      }`}
                    >
                      严禁代答
                    </span>
                  )}
                </div>

                {/* 底部操作工具栏 */}
                <div
                  className={`flex items-center justify-between pt-1 border-t text-[10px] ${
                    isAqua
                      ? 'border-[#bae6fd] text-[#0369a1]'
                      : 'border-[#3b2a5a]/50 text-[#b7a2d9]'
                  }`}
                >
                  <span className={isAqua ? 'text-[#0369a1]/70' : 'text-[#b7a2d9]/60'}>
                    {isEnabled ? '✦ 正在当前对话流中生效' : '⚪ 暂未启用'}
                  </span>

                  <div className={`flex items-center gap-1.5 ${isAqua ? 'text-[#0284c7]' : 'text-[#d88fbf]'}`}>
                    <button
                      onClick={() => {
                        setTestingPreset(p);
                        setTestReply(null);
                      }}
                      className={`px-2 py-0.5 rounded-lg border flex items-center gap-0.5 jelly-btn ${
                        isAqua
                          ? 'bg-[#e0f2fe] text-[#0284c7] hover:bg-white border-[#7dd3fc]'
                          : 'bg-[#2e1c3e] text-[#ff8ecb] hover:bg-[#3d2452] border-[#ff8ecb]/30'
                      }`}
                      title="快速对话试跑"
                    >
                      <Play className="w-2.5 h-2.5" />
                      <span>试跑</span>
                    </button>
                    <button
                      onClick={() => handleExportJson(p)}
                      className="p-1 hover:text-white rounded hover:bg-[#2e1c3e] jelly-btn"
                      title="导出 JSON"
                    >
                      <FileCode className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDuplicate(p, e)}
                      className="p-1 hover:text-white rounded hover:bg-[#2e1c3e] jelly-btn"
                      title="复制副本"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleStartEdit(p, e)}
                      className="p-1 hover:text-[#ff8ecb] rounded hover:bg-[#2e1c3e] jelly-btn"
                      title="编辑预设"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(p.id, e)}
                      className="p-1 text-[#b7a2d9] hover:text-rose-400 rounded hover:bg-rose-950/40 jelly-btn"
                      title="删除预设"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ================= 弹窗 1: 新建 / 编辑预设 ================= */}
      {showPresetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#1c1226] border-t sm:border border-[#ff8ecb]/60 rounded-t-3xl sm:rounded-3xl p-5 font-mono flex flex-col max-h-[92vh] shadow-[0_-8px_30px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#3b2a5a]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#ff8ecb]" />
                <span className="text-sm font-bold text-[#f7d6e8]">
                  {editingPreset ? '编辑预设' : '新建预设'}
                </span>
              </div>
              <button onClick={() => setShowPresetModal(false)} className="p-1 text-[#b7a2d9] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3.5 text-xs">
              {/* 预设名称 */}
              <div>
                <label className="text-[11px] text-[#b7a2d9] block mb-1 font-bold">预设名称 *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="例如：🌸 地雷系甜刺私聊、极速短句碎片流"
                  className="w-full px-3 py-2 bg-[#251633] text-[#f7d6e8] rounded-xl border border-[#4b3670] focus:outline-none focus:border-[#ff8ecb]"
                />
              </div>

              {/* 预设描述 */}
              <div>
                <label className="text-[11px] text-[#b7a2d9] block mb-1">简要描述</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="说明该预设的调性特点与适用场景..."
                  className="w-full px-3 py-2 bg-[#251633] text-[#f7d6e8] rounded-xl border border-[#4b3670] focus:outline-none focus:border-[#ff8ecb]"
                />
              </div>

              {/* 核心分区 1: 作用范围 (全局通用 vs 角色专属/非全局) */}
              <div>
                <label className="text-[11px] text-[#b7a2d9] block mb-1 font-bold">
                  1. 作用范围 (全局 vs 角色专属/非全局) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormScope('global')}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-bold transition-all ${
                      formScope === 'global'
                        ? 'bg-purple-950 border-purple-400 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                        : 'bg-[#221430] border-[#4b3670] text-[#b7a2d9]'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>全局预设 (全员通用)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormScope('local')}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-bold transition-all ${
                      formScope === 'local'
                        ? 'bg-amber-950 border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                        : 'bg-[#221430] border-[#4b3670] text-[#b7a2d9]'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>角色专属 (非全局)</span>
                  </button>
                </div>
              </div>

              {/* 若为角色专属，选择绑定的角色 */}
              {formScope === 'local' && (
                <div className="p-3 bg-[#170c20] rounded-xl border border-amber-500/40 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold">
                    <span>勾选此非全局预设适用的联系人</span>
                    <span className="text-[10px] text-[#b7a2d9]">未勾选则对所有角色生效</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto">
                    {personas.map((char) => {
                      const isChecked = formBoundCharIds.includes(char.id);
                      return (
                        <div
                          key={char.id}
                          onClick={() => handleToggleCharId(char.id)}
                          className={`px-2.5 py-1.5 rounded-lg border text-[11px] cursor-pointer flex items-center justify-between transition-colors ${
                            isChecked
                              ? 'border-amber-400 bg-amber-950/70 text-amber-200 font-bold'
                              : 'border-[#4b3670] bg-[#221430] text-[#b7a2d9] hover:bg-[#2c1a3e]'
                          }`}
                        >
                          <span className="truncate">{char.name}</span>
                          {isChecked && <Check className="w-3.5 h-3.5 text-amber-300 stroke-[3]" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 核心分区 2: 应用场景 (线上社交 vs 线下现实) */}
              <div>
                <label className="text-[11px] text-[#b7a2d9] block mb-1 font-bold">
                  2. 互动场景 (线上网络 vs 线下现实) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormScene('online')}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-bold transition-all ${
                      formScene === 'online'
                        ? 'bg-cyan-950 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                        : 'bg-[#221430] border-[#4b3670] text-[#b7a2d9]'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>📱 线上社交 (网聊/气泡/短句)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormScene('offline')}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-bold transition-all ${
                      formScene === 'offline'
                        ? 'bg-pink-950 border-pink-400 text-pink-200 shadow-[0_0_10px_rgba(244,114,182,0.3)]'
                        : 'bg-[#221430] border-[#4b3670] text-[#b7a2d9]'
                    }`}
                  >
                    <HeartHandshake className="w-3.5 h-3.5" />
                    <span>🤝 线下现实 (面对面/神态描摹)</span>
                  </button>
                </div>
              </div>

              {/* 启用开关 (支持多选组合生效或关闭) */}
              <div className="flex items-center justify-between p-3 bg-[#251633] rounded-xl border border-[#4b3670]">
                <div>
                  <span className="font-bold text-[#f7d6e8] block">启用此预设 (多选生效)</span>
                  <span className="text-[10px] text-[#b7a2d9]/70">可与其他启用的预设组合生效，也可随时停用</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormIsEnabled(!formIsEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    formIsEnabled ? 'bg-[#ff8ecb]' : 'bg-zinc-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      formIsEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* 核心系统设定词 (System Prompt) */}
              <div>
                <label className="text-[11px] text-[#b7a2d9] block mb-1 font-bold">核心系统设定词 (System Prompt) *</label>
                <textarea
                  value={formSystemPrompt}
                  onChange={(e) => setFormSystemPrompt(e.target.value)}
                  rows={5}
                  placeholder="写下角色的语言风格、交互原则、情感反应与对话节奏规范..."
                  className="w-full px-3 py-2 bg-[#251633] text-[#f7d6e8] rounded-xl border border-[#4b3670] focus:outline-none focus:border-[#ff8ecb] resize-none leading-relaxed"
                />
              </div>

              {/* 防出戏与绝对约束 (Post Prompt / Anti-OOC) */}
              <div>
                <label className="text-[11px] text-[#b7a2d9] block mb-1">强化约束与防出戏法则 (Post Prompt)</label>
                <textarea
                  value={formPostPrompt}
                  onChange={(e) => setFormPostPrompt(e.target.value)}
                  rows={2}
                  placeholder="注入在对话末尾的绝对禁令，例如：保持真实手机即时通讯沉浸感，严禁透露自己是AI，严禁替对方代写台词..."
                  className="w-full px-3 py-2 bg-[#251633] text-[#f7d6e8] rounded-xl border border-[#4b3670] focus:outline-none focus:border-[#ff8ecb] resize-none"
                />
              </div>

              {/* 模型调参滑块 */}
              <div className="p-3 bg-[#190e24] rounded-xl border border-[#3b2a5a] space-y-3">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#ff8ecb]">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>模型参数调控</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[10px] text-[#b7a2d9] mb-1">
                      <span>温度 (Temperature)</span>
                      <span className="text-[#ff8ecb] font-bold">{formTemperature}</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.5"
                      step="0.05"
                      value={formTemperature}
                      onChange={(e) => setFormTemperature(parseFloat(e.target.value))}
                      className="w-full accent-[#ff8ecb]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-[#b7a2d9] mb-1">
                      <span>最大输出长度 (Tokens)</span>
                      <span className="text-[#ff8ecb] font-bold">{formMaxTokens}</span>
                    </div>
                    <input
                      type="number"
                      value={formMaxTokens}
                      onChange={(e) => setFormMaxTokens(parseInt(e.target.value) || 400)}
                      className="w-full px-2 py-1 bg-[#251633] rounded-lg border border-[#4b3670] text-[#f7d6e8]"
                    />
                  </div>
                </div>
              </div>

              {/* 格式规约开关 */}
              <div className="p-3 bg-[#190e24] rounded-xl border border-[#3b2a5a] space-y-2">
                <span className="text-[11px] font-bold text-[#f7d6e8] block">交互格式规则</span>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <label className="flex items-center gap-2 cursor-pointer text-[#b7a2d9]">
                    <input
                      type="checkbox"
                      checked={formAllowAction}
                      onChange={(e) => setFormAllowAction(e.target.checked)}
                      className="accent-[#ff8ecb]"
                    />
                    <span>允许动作神态 （...）</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-[#b7a2d9]">
                    <input
                      type="checkbox"
                      checked={formAllowThought}
                      onChange={(e) => setFormAllowThought(e.target.checked)}
                      className="accent-[#ff8ecb]"
                    />
                    <span>允许内心独白 【...】</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-[#b7a2d9]">
                    <input
                      type="checkbox"
                      checked={formNoImpersonation}
                      onChange={(e) => setFormNoImpersonation(e.target.checked)}
                      className="accent-[#ff8ecb]"
                    />
                    <span>严禁替用户回答</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-[#b7a2d9]">
                    <input
                      type="checkbox"
                      checked={formBubbleStyle === 'multi'}
                      onChange={(e) => setFormBubbleStyle(e.target.checked ? 'multi' : 'single')}
                      className="accent-[#ff8ecb]"
                    />
                    <span>短句多气泡连发</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="pt-3 border-t border-[#3b2a5a] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPresetModal(false)}
                className="px-4 py-2 rounded-xl border border-[#4b3670] text-[#b7a2d9] hover:text-white jelly-btn"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveForm}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] font-bold jelly-btn shadow-md"
              >
                {editingPreset ? '保存预设' : '确认创建'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 弹窗 2: 对话试跑抽屉 ================= */}
      {testingPreset && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#1c1226] border-t sm:border border-[#ff8ecb]/60 rounded-t-3xl sm:rounded-3xl p-5 font-mono flex flex-col max-h-[85vh] shadow-[0_-8px_30px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#3b2a5a]">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-[#ff8ecb]" />
                <span className="text-xs font-bold text-[#f7d6e8]">试跑预设：{testingPreset.name}</span>
              </div>
              <button onClick={() => setTestingPreset(null)} className="p-1 text-[#b7a2d9] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-[#b7a2d9] block mb-1">测试角色</label>
                <select
                  value={testCharId}
                  onChange={(e) => setTestCharId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#251633] text-[#f7d6e8] rounded-xl border border-[#4b3670] focus:outline-none"
                >
                  {personas.map((char) => (
                    <option key={char.id} value={char.id}>
                      {char.name} {char.remarks ? `(${char.remarks})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-[#b7a2d9] block mb-1">模拟发送消息</label>
                <input
                  type="text"
                  value={testUserMsg}
                  onChange={(e) => setTestUserMsg(e.target.value)}
                  className="w-full px-3 py-2 bg-[#251633] text-[#f7d6e8] rounded-xl border border-[#4b3670] focus:outline-none focus:border-[#ff8ecb]"
                />
              </div>

              <button
                onClick={handleRunTest}
                disabled={isTestingLoading}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] font-bold jelly-btn flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isTestingLoading ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>AI 正在根据预设生成回复...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>执行单轮试跑</span>
                  </>
                )}
              </button>

              {testReply && (
                <div className="p-3 bg-[#130b1a] rounded-xl border border-[#ff8ecb]/40 space-y-1">
                  <span className="text-[10px] text-[#ff8ecb] font-bold block">AI 回复预览：</span>
                  <p className="text-[11px] text-[#f7d6e8] leading-relaxed whitespace-pre-wrap">{testReply}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= 弹窗 3: 导入 / 导出 JSON ================= */}
      {showImportExportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#1c1226] border border-[#ff8ecb]/60 rounded-3xl p-5 font-mono flex flex-col max-h-[85vh] shadow-[0_8px_30px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#3b2a5a]">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[#ff8ecb]" />
                <span className="text-sm font-bold text-[#f7d6e8]">预设导入与导出</span>
              </div>
              <button onClick={() => setShowImportExportModal(false)} className="p-1 text-[#b7a2d9] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2 my-3">
              <button
                onClick={() => setImportExportTab('export')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  importExportTab === 'export'
                    ? 'bg-[#ff8ecb] text-[#1a1120]'
                    : 'bg-[#251535] text-[#b7a2d9]'
                }`}
              >
                导出预设 JSON
              </button>
              <button
                onClick={() => setImportExportTab('import')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  importExportTab === 'import'
                    ? 'bg-[#ff8ecb] text-[#1a1120]'
                    : 'bg-[#251535] text-[#b7a2d9]'
                }`}
              >
                从 JSON 导入
              </button>
            </div>

            {importExportTab === 'export' ? (
              <div className="space-y-3 py-2 text-xs">
                <p className="text-[11px] text-[#b7a2d9]">
                  将全部 {presets.length} 个预设导出为标准 JSON 格式：
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportJson()}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] font-bold text-xs flex items-center justify-center gap-1.5 jelly-btn"
                  >
                    <Copy className="w-4 h-4" />
                    <span>复制 JSON</span>
                  </button>
                  <button
                    onClick={handleDownloadJson}
                    className="flex-1 py-2.5 rounded-xl bg-[#251535] border border-[#ff8ecb] text-[#ff8ecb] font-bold text-xs flex items-center justify-center gap-1.5 jelly-btn"
                  >
                    <Download className="w-4 h-4" />
                    <span>下载文件</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 py-2 text-xs">
                <p className="text-[11px] text-[#b7a2d9]">请粘贴预设 JSON 数据内容：</p>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  rows={6}
                  placeholder='[ { "name": "预设名", "scope": "global", "scene": "online", "systemPrompt": "..." } ]'
                  className="w-full p-2.5 bg-[#140b1b] text-[#f7d6e8] rounded-xl border border-[#4b3670] font-mono text-[10px] focus:outline-none focus:border-[#ff8ecb] resize-none"
                />
                <button
                  onClick={handleImportJson}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] font-bold text-xs flex items-center justify-center gap-1.5 jelly-btn"
                >
                  <Upload className="w-4 h-4" />
                  <span>执行导入</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
