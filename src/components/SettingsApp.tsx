import React, { useState } from 'react';
import {
  ChevronRight,
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  Cpu,
  Database,
  RotateCcw,
  Sparkles,
  Download,
  Upload,
} from 'lucide-react';
import { ApiConfig, ProviderType } from '../types/phone';
import { fetchModelList, friendlyError, normalizeUrl, sendChat } from '../utils/aiService';
import {
  PixelSparkle,
  PixelHeart,
  PixelBow,
  PixelBlackCat,
} from './PixelAssets';

interface SettingsAppProps {
  configs: ApiConfig[];
  onSaveConfigs: (configs: ApiConfig[]) => void;
  onBack: () => void;
  subPage?: string;
  onNavigateSub: (sub: string, params?: any) => void;
  onResetAllData?: () => void;
  currentTheme?: string;
}

const PROVIDER_PRESETS: Record<ProviderType, { defaultUrl: string; defaultModel: string; hint: string }> = {
  OpenAI: {
    defaultUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    hint: '支持标准 OpenAI 格式，或填写任意兼容转发/中转站地址',
  },
  Gemini: {
    defaultUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    defaultModel: 'gemini-2.5-flash',
    hint: 'Google Gemini 官方 OpenAI 兼容端点',
  },
  DeepSeek: {
    defaultUrl: 'https://api.deepseek.com',
    defaultModel: 'deepseek-chat',
    hint: 'DeepSeek 官方 API 或聚合中转端点',
  },
  Claude: {
    defaultUrl: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-3-5-sonnet-20241022',
    hint: 'Anthropic Claude 或 OpenAI 格式中转代理端点',
  },
  OpenRouter: {
    defaultUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct',
    hint: 'OpenRouter 聚合平台，多模型通用统一入口',
  },
  Custom: {
    defaultUrl: 'https://api.your-endpoint.com/v1',
    defaultModel: 'gpt-3.5-turbo',
    hint: '自定义个人中转站或私有部署模型地址',
  },
};

export const SettingsApp: React.FC<SettingsAppProps> = ({
  configs,
  onSaveConfigs,
  onBack,
  subPage = 'main',
  onNavigateSub,
  onResetAllData,
  currentTheme = 'sky',
}) => {
  const isAqua = currentTheme === 'aqua_pixel';
  // 当前正在编辑的配置草稿
  const [editingConfig, setEditingConfig] = useState<ApiConfig>(() => {
    return (
      configs.find((c) => c.isActive) ||
      configs[0] || {
        id: 'cfg_' + Date.now(),
        name: '新 AI 配置',
        provider: 'OpenAI' as ProviderType,
        url: PROVIDER_PRESETS.OpenAI.defaultUrl,
        key: '',
        model: PROVIDER_PRESETS.OpenAI.defaultModel,
        temperature: 0.8,
        isActive: false,
      }
    );
  });
  const [showKey, setShowKey] = useState(false);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [fetchedModels, setFetchedModels] = useState<string[]>([]);
  const [testingStatus, setTestingStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  const activeConfig = configs.find((c) => c.isActive) || configs[0];

  const handleStartEdit = (config?: ApiConfig) => {
    if (config) {
      setEditingConfig({ ...config });
    } else {
      const newConfig: ApiConfig = {
        id: 'cfg_' + Date.now(),
        name: '新 AI 配置',
        provider: 'OpenAI',
        url: PROVIDER_PRESETS.OpenAI.defaultUrl,
        key: '',
        model: PROVIDER_PRESETS.OpenAI.defaultModel,
        temperature: 0.8,
        isActive: false,
      };
      setEditingConfig(newConfig);
    }
    setFetchedModels([]);
    setTestingStatus({ loading: false });
    onNavigateSub('ai_edit');
  };

  const handleProviderChange = (p: ProviderType) => {
    const preset = PROVIDER_PRESETS[p];
    setEditingConfig({
      ...editingConfig,
      provider: p,
      url: preset.defaultUrl,
      model: preset.defaultModel,
    });
    setFetchedModels([]);
  };

  const handleFetchModels = async () => {
    if (!editingConfig.url) return;
    setIsFetchingModels(true);
    try {
      const list = await fetchModelList(editingConfig.url, editingConfig.key);
      if (list && list.length > 0) {
        setFetchedModels(list);
        if (!list.includes(editingConfig.model)) {
          setEditingConfig({ ...editingConfig, model: list[0] });
        }
      } else {
        alert('未能自动拉取到模型列表，请手动输入');
      }
    } catch (e: any) {
      alert(`获取失败：${friendlyError(e)}`);
    } finally {
      setIsFetchingModels(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingStatus({ loading: true });
    try {
      const reply = await sendChat(editingConfig, [
        { role: 'system', content: '你是一个友好的小助手。' },
        { role: 'user', content: '你好，请回复测试成功。' },
      ]);
      setTestingStatus({
        loading: false,
        success: true,
        message: `连接成功！响应片段: "${reply.slice(0, 30)}..."`,
      });
    } catch (e: any) {
      setTestingStatus({ loading: false, success: false, message: friendlyError(e) });
    }
  };

  const handleSaveConfig = () => {
    const cleanUrl = normalizeUrl(editingConfig.url);
    const updated = { ...editingConfig, url: cleanUrl };

    let newConfigs: ApiConfig[];
    const exists = configs.some((c) => c.id === updated.id);
    if (exists) {
      newConfigs = configs.map((c) => (c.id === updated.id ? updated : c));
    } else {
      if (configs.length === 1 && configs[0].id === 'builtin_gemini') {
        newConfigs = [{ ...updated, isActive: true }, { ...configs[0], isActive: false }];
      } else {
        newConfigs = [...configs, updated];
      }
    }
    onSaveConfigs(newConfigs);
    onBack();
  };

  const handleSetActive = (id: string) => {
    const updated = configs.map((c) => ({
      ...c,
      isActive: c.id === id,
    }));
    onSaveConfigs(updated);
  };

  const handleDeleteConfig = (id: string) => {
    if (configs.length <= 1) {
      alert('至少需要保留一份 API 配置');
      return;
    }
    const updated = configs.filter((c) => c.id !== id);
    if (!updated.some((c) => c.isActive)) {
      updated[0].isActive = true;
    }
    onSaveConfigs(updated);
    if (editingConfig?.id === id) {
      onBack();
    }
  };

  // 1. 设置首页
  if (subPage === 'main') {
    return (
      <div
        className={`flex-1 flex flex-col select-none relative overflow-hidden font-mono transition-colors duration-200 ${
          isAqua
            ? 'bg-gradient-to-b from-[#f0f9ff] via-[#e0f2fe] to-[#bae6fd] text-[#0369a1]'
            : 'bg-gradient-to-b from-[#180f21] via-[#120b18] to-[#0a050e] text-[#f7d6e8]'
        }`}
      >
        {/* 顶部导航 */}
        <div
          className={`h-12 px-4 flex items-center justify-between border-b backdrop-blur-md z-10 transition-colors ${
            isAqua
              ? 'border-[#7dd3fc]/60 bg-[#e0f2fe]/90 text-[#0369a1]'
              : 'border-[#3b2a5a]/70 bg-[#1e1328]/90 text-[#f7d6e8]'
          }`}
        >
          <button
            onClick={onBack}
            className={`p-1.5 jelly-btn ${
              isAqua ? 'text-[#0284c7] hover:text-[#0369a1]' : 'text-[#d88fbf] hover:text-white'
            }`}
          >
            <ArrowLeft className="w-5 h-5 stroke-[2]" />
          </button>
          <div className="flex items-center gap-1.5 font-mono text-sm font-bold tracking-wider">
            <PixelSparkle className={`w-3.5 h-3.5 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`} />
            <span className={isAqua ? 'text-[#0c4a6e]' : 'text-[#f7d6e8]'}>设置</span>
            <PixelSparkle className={`w-3.5 h-3.5 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`} />
          </div>
          <div className="w-5"></div>
        </div>

        {/* 核心两级菜单入口 */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          <div
            className={`text-[11px] font-mono px-1 tracking-wider uppercase flex items-center gap-1.5 ${
              isAqua ? 'text-[#0369a1]' : 'text-[#b7a2d9]'
            }`}
          >
            <span>✦ 系统偏好</span>
            <div className={`flex-1 h-[1px] ${isAqua ? 'bg-[#7dd3fc]/40' : 'bg-[#3b2a5a]/40'}`}></div>
          </div>

          <div
            className={`rounded-2xl border-2 shadow-[0_8px_24px_rgba(0,0,0,0.1)] overflow-hidden divide-y ${
              isAqua
                ? 'border-[#7dd3fc] bg-white/90 divide-[#e0f2fe]'
                : 'border-[#3b2a5a] bg-[#1d1226]/85 divide-[#3b2a5a]/50 shadow-[0_8px_24px_rgba(0,0,0,0.6)]'
            }`}
          >
            {/* AI 服务入口 */}
            <button
              onClick={() => onNavigateSub('ai_list')}
              className={`w-full px-4 py-3.5 flex items-center justify-between text-left transition-colors jelly-btn ${
                isAqua ? 'hover:bg-[#f0f9ff]' : 'hover:bg-[#2b1b38]/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-inner ${
                    isAqua
                      ? 'bg-[#e0f2fe] border-[#7dd3fc] text-[#0284c7]'
                      : 'bg-[#2e1d3d] border-[#d88fbf]/40 text-[#ff8ecb]'
                  }`}
                >
                  <Cpu className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <div className={`text-xs font-mono font-bold ${isAqua ? 'text-[#0c4a6e]' : 'text-[#f7d6e8]'}`}>
                    AI 服务
                  </div>
                  <div
                    className={`text-[10px] mt-0.5 font-mono truncate max-w-[190px] ${
                      isAqua ? 'text-[#0369a1]/80' : 'text-[#b7a2d9]'
                    }`}
                  >
                    当前：{activeConfig.name}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    isAqua
                      ? 'bg-[#e0f2fe] text-[#0284c7] border-[#7dd3fc]'
                      : 'bg-[#2f1b3d] text-[#ff8ecb] border-[#d88fbf]/50'
                  }`}
                >
                  {activeConfig.provider}
                </span>
                <ChevronRight className={`w-4 h-4 ${isAqua ? 'text-[#0284c7]' : 'text-[#d88fbf]'}`} />
              </div>
            </button>

            {/* 数据备份与恢复入口 */}
            <button
              onClick={() => onNavigateSub('other')}
              className={`w-full px-4 py-3.5 flex items-center justify-between text-left transition-colors jelly-btn ${
                isAqua ? 'hover:bg-[#f0f9ff]' : 'hover:bg-[#2b1b38]/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-inner ${
                    isAqua
                      ? 'bg-[#e0f2fe] border-[#7dd3fc] text-[#0284c7]'
                      : 'bg-[#2e1d3d] border-[#d88fbf]/40 text-[#ff8ecb]'
                  }`}
                >
                  <Database className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <div className={`text-xs font-mono font-bold ${isAqua ? 'text-[#0c4a6e]' : 'text-[#f7d6e8]'}`}>
                    系统数据与备份
                  </div>
                  <div className={`text-[10px] mt-0.5 font-mono ${isAqua ? 'text-[#0369a1]/80' : 'text-[#b7a2d9]'}`}>
                    数据导出备份、恢复与恢复出厂设置
                  </div>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 ${isAqua ? 'text-[#0284c7]' : 'text-[#d88fbf]'}`} />
            </button>
          </div>
        </div>

        {/* 底部右下角萌系小黑猫 */}
        <div className="p-4 flex justify-end pointer-events-none">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border shadow-md ${
              isAqua
                ? 'bg-white/80 border-[#7dd3fc] text-[#0284c7]'
                : 'bg-[#1f132b]/80 border-[#d88fbf]/40 text-[#b7a2d9]'
            }`}
          >
            <PixelBlackCat className="w-6 h-6" />
            <span className={`text-[10px] font-mono ${isAqua ? 'text-[#0284c7]' : 'text-[#b7a2d9]'}`}>
              小手机已就绪 ♡
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 2. AI 服务列表页
  if (subPage === 'ai_list') {
    return (
      <div
        className={`flex-1 flex flex-col select-none overflow-hidden font-mono transition-colors duration-200 ${
          isAqua
            ? 'bg-gradient-to-b from-[#f0f9ff] via-[#e0f2fe] to-[#bae6fd] text-[#0369a1]'
            : 'bg-gradient-to-b from-[#180f21] via-[#120b18] to-[#0a050e] text-[#f7d6e8]'
        }`}
      >
        <div
          className={`h-12 px-4 flex items-center justify-between border-b backdrop-blur-md transition-colors ${
            isAqua
              ? 'border-[#7dd3fc]/60 bg-[#e0f2fe]/90 text-[#0369a1]'
              : 'border-[#3b2a5a] bg-[#1e1328]/90 text-[#f7d6e8]'
          }`}
        >
          <button
            onClick={onBack}
            className={`p-1.5 jelly-btn ${
              isAqua ? 'text-[#0284c7] hover:text-[#0369a1]' : 'text-[#d88fbf] hover:text-white'
            }`}
          >
            <ArrowLeft className="w-5 h-5 stroke-[2]" />
          </button>
          <div className="flex items-center gap-1.5 font-mono text-sm font-bold">
            <PixelSparkle className={`w-3.5 h-3.5 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`} />
            <span className={isAqua ? 'text-[#0c4a6e]' : 'text-[#f7d6e8]'}>AI 服务列表</span>
          </div>
          <button
            onClick={() => handleStartEdit()}
            className={`text-xs font-mono font-medium px-2.5 py-1 rounded-xl shadow-sm jelly-btn ${
              isAqua
                ? 'bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] text-white'
                : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-white hover:opacity-90'
            }`}
          >
            ＋添加
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className={`text-[11px] font-mono leading-relaxed px-1 ${isAqua ? 'text-[#0369a1]/80' : 'text-[#b7a2d9]'}`}>
            小手机的聊天响应与角色润色均以此处选中的 API 为准。可保存多份中转站随时切换。
          </div>

          <div className="space-y-2.5">
            {configs.map((c) => (
              <div
                key={c.id}
                onClick={() => handleSetActive(c.id)}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  c.isActive
                    ? isAqua
                      ? 'bg-white border-[#0284c7] shadow-[0_4px_20px_rgba(2,132,199,0.25)]'
                      : 'bg-[#291838] border-[#ff8ecb] shadow-[0_4px_20px_rgba(255,142,203,0.25)]'
                    : isAqua
                    ? 'bg-white/70 border-[#bae6fd] hover:border-[#7dd3fc]'
                    : 'bg-[#1d1226]/80 border-[#3b2a5a] hover:border-[#d88fbf]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                      c.isActive
                        ? isAqua
                          ? 'border-[#0284c7] bg-[#0284c7] text-white'
                          : 'border-[#ff8ecb] bg-[#ff8ecb] text-[#1a1120]'
                        : isAqua
                        ? 'border-[#7dd3fc]'
                        : 'border-[#4b3670]'
                    }`}
                  >
                    {c.isActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono font-bold ${isAqua ? 'text-[#0c4a6e]' : 'text-[#f7d6e8]'}`}>
                        {c.name}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${
                          isAqua
                            ? 'text-[#0284c7] bg-[#e0f2fe] border-[#7dd3fc]'
                            : 'text-[#ff8ecb] bg-[#2a1738] border-[#d88fbf]/40'
                        }`}
                      >
                        {c.provider}
                      </span>
                    </div>
                    <div className={`text-[10px] mt-0.5 font-mono truncate max-w-[170px] ${isAqua ? 'text-[#0369a1]/80' : 'text-[#b7a2d9]'}`}>
                      {c.model} · {c.url.replace(/^https?:\/\//, '')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleStartEdit(c)}
                    className={`p-1.5 text-xs rounded-lg jelly-btn font-mono ${
                      isAqua
                        ? 'text-[#0284c7] hover:bg-[#e0f2fe]'
                        : 'text-[#d88fbf] hover:text-[#ff8ecb] hover:bg-[#341d45]'
                    }`}
                  >
                    编辑
                  </button>
                  {configs.length > 1 && (
                    <button
                      onClick={() => handleDeleteConfig(c.id)}
                      className={`p-1.5 rounded-lg jelly-btn ${
                        isAqua
                          ? 'text-[#0369a1] hover:text-rose-600 hover:bg-rose-50'
                          : 'text-[#b7a2d9] hover:text-rose-400 hover:bg-rose-950/40'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. AI 编辑详情页
  if (subPage === 'ai_edit') {
    const isBuiltin = editingConfig.id === 'builtin_gemini';

    return (
      <div
        className={`flex-1 flex flex-col select-none overflow-hidden font-mono transition-colors duration-200 ${
          isAqua
            ? 'bg-gradient-to-b from-[#f0f9ff] via-[#e0f2fe] to-[#bae6fd] text-[#0369a1]'
            : 'bg-gradient-to-b from-[#180f21] via-[#120b18] to-[#0a050e] text-[#f7d6e8]'
        }`}
      >
        {/* 顶部标题栏 */}
        <div
          className={`h-12 px-4 flex items-center justify-between border-b backdrop-blur-md transition-colors ${
            isAqua
              ? 'border-[#7dd3fc]/60 bg-[#e0f2fe]/90 text-[#0369a1]'
              : 'border-[#3b2a5a] bg-[#1e1328]/90 text-[#f7d6e8]'
          }`}
        >
          <button
            onClick={onBack}
            className={`p-1.5 jelly-btn ${
              isAqua ? 'text-[#0284c7] hover:text-[#0369a1]' : 'text-[#d88fbf] hover:text-white'
            }`}
          >
            <ArrowLeft className="w-5 h-5 stroke-[2]" />
          </button>
          <span className={`text-sm font-mono font-bold ${isAqua ? 'text-[#0c4a6e]' : 'text-[#f7d6e8]'}`}>
            编辑 AI 服务
          </span>
          <button
            onClick={handleSaveConfig}
            className={`text-xs font-mono font-bold px-3.5 py-1.5 rounded-xl jelly-btn shadow-md ${
              isAqua
                ? 'bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] text-white shadow-[0_2px_10px_rgba(2,132,199,0.35)]'
                : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] shadow-[0_2px_10px_rgba(255,142,203,0.35)] hover:opacity-90'
            }`}
          >
            保存
          </button>
        </div>

        {/* 表单滚动区 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 配置名称 */}
          <div>
            <label className={`block text-[11px] font-mono mb-1 ${isAqua ? 'text-[#0369a1]' : 'text-[#b7a2d9]'}`}>
              配置名称
            </label>
            <input
              type="text"
              value={editingConfig.name}
              onChange={(e) => setEditingConfig({ ...editingConfig, name: e.target.value })}
              className={`w-full px-3 py-2 text-xs rounded-xl border font-mono focus:outline-none ${
                isAqua
                  ? 'bg-white text-[#0c4a6e] border-[#7dd3fc] focus:border-[#0284c7]'
                  : 'bg-[#1f132a] text-[#f7d6e8] border-[#4b3670] focus:border-[#ff8ecb]'
              }`}
              placeholder="例如：主力中转站 / 备用号"
            />
          </div>

          {/* 1. 服务商 */}
          <div>
            <label className={`block text-[11px] font-mono mb-1 ${isAqua ? 'text-[#0369a1]' : 'text-[#b7a2d9]'}`}>
              服务商
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['OpenAI', 'Gemini', 'DeepSeek', 'Claude', 'OpenRouter', 'Custom'] as ProviderType[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleProviderChange(p)}
                  className={`py-1.5 px-2 text-[11px] rounded-xl border font-mono font-medium transition-all ${
                    editingConfig.provider === p
                      ? isAqua
                        ? 'bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] text-white border-[#0284c7] shadow-sm font-bold'
                        : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] border-[#ff8ecb] shadow-sm font-bold'
                      : isAqua
                      ? 'bg-white text-[#0369a1] border-[#bae6fd] hover:bg-[#e0f2fe]'
                      : 'bg-[#1f132a] text-[#b7a2d9] border-[#3b2a5a] hover:bg-[#2c1b3b]'
                  }`}
                >
                  {p === 'Custom' ? '自定义 API' : p}
                </button>
              ))}
            </div>
            <div className={`text-[10px] mt-1 font-mono px-0.5 ${isAqua ? 'text-[#0369a1]/70' : 'text-[#b7a2d9]/70'}`}>
              {PROVIDER_PRESETS[editingConfig.provider]?.hint}
            </div>
          </div>

          {/* 接口地址 */}
          <div>
            <label className={`block text-[11px] font-mono mb-1 ${isAqua ? 'text-[#0369a1]' : 'text-[#b7a2d9]'}`}>
              接口地址 (Base URL)
            </label>
            <input
              type="text"
              value={editingConfig.url}
              onChange={(e) => setEditingConfig({ ...editingConfig, url: e.target.value })}
              className={`w-full px-3 py-2 text-xs rounded-xl border font-mono focus:outline-none ${
                isAqua
                  ? 'bg-white text-[#0c4a6e] border-[#7dd3fc] focus:border-[#0284c7]'
                  : 'bg-[#1f132a] text-[#f7d6e8] border-[#4b3670] focus:border-[#ff8ecb]'
              }`}
              placeholder="https://..."
            />
          </div>

          {/* 2. API Key */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={`text-[11px] font-mono ${isAqua ? 'text-[#0369a1]' : 'text-[#b7a2d9]'}`}>
                API Key
              </label>
              {editingConfig.key && (
                <button
                  type="button"
                  onClick={() => setEditingConfig({ ...editingConfig, key: '' })}
                  className={`text-[10px] hover:underline font-mono ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`}
                >
                  清空
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={editingConfig.key}
                onChange={(e) => setEditingConfig({ ...editingConfig, key: e.target.value })}
                className={`w-full px-3 py-2 pr-9 text-xs rounded-xl border font-mono focus:outline-none ${
                  isAqua
                    ? 'bg-white text-[#0c4a6e] border-[#7dd3fc] focus:border-[#0284c7]'
                    : 'bg-[#1f132a] text-[#f7d6e8] border-[#4b3670] focus:border-[#ff8ecb]'
                }`}
                placeholder={isBuiltin ? '已内置系统授权' : 'sk-...'}
                disabled={isBuiltin}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className={`absolute right-2.5 top-2.5 ${isAqua ? 'text-[#0284c7]' : 'text-[#b7a2d9] hover:text-[#f7d6e8]'}`}
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* 3. 模型 ID */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={`text-[11px] font-mono ${isAqua ? 'text-[#0369a1]' : 'text-[#b7a2d9]'}`}>
                模型 ID
              </label>
              <button
                type="button"
                onClick={handleFetchModels}
                disabled={isFetchingModels || !editingConfig.url}
                className={`text-[10px] flex items-center gap-1 font-mono disabled:opacity-50 ${
                  isAqua ? 'text-[#0284c7] hover:text-[#0369a1]' : 'text-[#ff8ecb] hover:text-white'
                }`}
              >
                <RefreshCw className={`w-3 h-3 ${isFetchingModels ? 'animate-spin' : ''}`} />
                <span>自动拉取模型列表</span>
              </button>
            </div>

            {fetchedModels.length > 0 && (
              <select
                value={editingConfig.model}
                onChange={(e) => setEditingConfig({ ...editingConfig, model: e.target.value })}
                className={`w-full mb-1.5 px-3 py-2 text-xs rounded-xl border font-mono focus:outline-none ${
                  isAqua
                    ? 'bg-white text-[#0c4a6e] border-[#7dd3fc] focus:border-[#0284c7]'
                    : 'bg-[#1f132a] text-[#f7d6e8] border-[#4b3670] focus:border-[#ff8ecb]'
                }`}
              >
                {fetchedModels.map((m) => (
                  <option key={m} value={m} className={isAqua ? 'bg-white text-[#0c4a6e]' : 'bg-[#1f132a]'}>
                    {m}
                  </option>
                ))}
              </select>
            )}

            <input
              type="text"
              value={editingConfig.model}
              onChange={(e) => setEditingConfig({ ...editingConfig, model: e.target.value })}
              className={`w-full px-3 py-2 text-xs rounded-xl border font-mono focus:outline-none ${
                isAqua
                  ? 'bg-white text-[#0c4a6e] border-[#7dd3fc] focus:border-[#0284c7]'
                  : 'bg-[#1f132a] text-[#f7d6e8] border-[#4b3670] focus:border-[#ff8ecb]'
              }`}
              placeholder="手动填写模型 ID，如 gpt-4o-mini 或 deepseek-chat"
            />
          </div>

          {/* 温度调节 */}
          <div>
            <div className={`flex items-center justify-between text-[11px] font-mono mb-1 ${isAqua ? 'text-[#0369a1]' : 'text-[#b7a2d9]'}`}>
              <span>温度 (Temperature)</span>
              <span className={isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}>{editingConfig.temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.05"
              value={editingConfig.temperature}
              onChange={(e) =>
                setEditingConfig({ ...editingConfig, temperature: parseFloat(e.target.value) })
              }
              className={`w-full ${isAqua ? 'accent-[#0284c7]' : 'accent-[#ff8ecb]'}`}
            />
          </div>

          {/* 4. 测试连接 */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testingStatus.loading || !editingConfig.url}
              className={`w-full py-2.5 rounded-xl border text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors jelly-btn ${
                isAqua
                  ? 'border-[#7dd3fc] bg-white text-[#0284c7] hover:bg-[#e0f2fe]'
                  : 'border-[#ff8ecb]/60 bg-[#281838] hover:bg-[#341e4a] text-[#f7d6e8]'
              }`}
            >
              {testingStatus.loading && (
                <RefreshCw className={`w-3.5 h-3.5 animate-spin ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`} />
              )}
              <span>测试连接可用性</span>
            </button>

            {testingStatus.message && (
              <div
                className={`mt-2 p-3 rounded-xl text-xs font-mono border ${
                  testingStatus.success
                    ? isAqua
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-[#1b2b20] border-emerald-500/50 text-emerald-300'
                    : isAqua
                    ? 'bg-rose-50 border-rose-300 text-rose-800'
                    : 'bg-[#2b181e] border-rose-500/50 text-rose-300'
                }`}
              >
                {testingStatus.message}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 4. 系统数据与备份页
  return (
    <div
      className={`flex-1 flex flex-col select-none overflow-hidden font-mono transition-colors duration-200 ${
        isAqua
          ? 'bg-gradient-to-b from-[#f0f9ff] via-[#e0f2fe] to-[#bae6fd] text-[#0369a1]'
          : 'bg-gradient-to-b from-[#180f21] via-[#120b18] to-[#0a050e] text-[#f7d6e8]'
      }`}
    >
      <div
        className={`h-12 px-4 flex items-center justify-between border-b backdrop-blur-md transition-colors ${
          isAqua
            ? 'border-[#7dd3fc]/60 bg-[#e0f2fe]/90 text-[#0369a1]'
            : 'border-[#3b2a5a] bg-[#1e1328]/90 text-[#f7d6e8]'
        }`}
      >
        <button
          onClick={onBack}
          className={`p-1.5 jelly-btn ${
            isAqua ? 'text-[#0284c7] hover:text-[#0369a1]' : 'text-[#d88fbf] hover:text-white'
          }`}
        >
          <ArrowLeft className="w-5 h-5 stroke-[2]" />
        </button>
        <span className={`text-sm font-mono font-bold ${isAqua ? 'text-[#0c4a6e]' : 'text-[#f7d6e8]'}`}>
          系统数据与备份
        </span>
        <div className="w-5"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 数据备份与恢复 */}
        <div>
          <label className={`block text-[11px] font-mono mb-1.5 ${isAqua ? 'text-[#0369a1]' : 'text-[#b7a2d9]'}`}>
            ✦ 数据备份与恢复
          </label>
          <div
            className={`rounded-2xl border p-3.5 space-y-2 shadow-md ${
              isAqua
                ? 'bg-white/90 border-[#7dd3fc]'
                : 'bg-[#1d1226]/85 border-[#3b2a5a]'
            }`}
          >
            <div className={`text-[10px] font-mono ${isAqua ? 'text-[#0369a1]/80' : 'text-[#b7a2d9]'}`}>
              数据保存在本地浏览器中。可将手机全部通讯录、世界书、聊天记录与仓库网页导出为 JSON。
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  const dump = {
                    apis: localStorage.getItem('phone_api_configs_v1'),
                    worldbooks: localStorage.getItem('phone_worldbooks_v1'),
                    personas: localStorage.getItem('phone_personas_v1'),
                    webpages: localStorage.getItem('phone_webpages_v1'),
                    stickers: localStorage.getItem('phone_stickers_v1'),
                    messages: localStorage.getItem('phone_chat_messages_v1'),
                    profile: localStorage.getItem('phone_user_profile_v1'),
                    channelPosts: localStorage.getItem('phone_qq_channel_posts_v1'),
                    qzoneFeeds: localStorage.getItem('phone_qq_qzone_feeds_v1'),
                  };
                  const blob = new Blob([JSON.stringify(dump, null, 2)], {
                    type: 'application/json',
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `pixel_phone_backup_${Date.now()}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className={`py-1.5 px-3 rounded-xl text-xs font-mono border flex items-center gap-1 jelly-btn ${
                  isAqua
                    ? 'bg-[#e0f2fe] text-[#0284c7] hover:bg-white border-[#7dd3fc]'
                    : 'bg-[#2e1d3e] text-[#f7d6e8] hover:bg-[#3d2652] border-[#4b3670]'
                }`}
              >
                <Download className={`w-3.5 h-3.5 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`} />
                <span>导出备份</span>
              </button>

              <label
                className={`py-1.5 px-3 rounded-xl text-xs font-mono border flex items-center gap-1 cursor-pointer jelly-btn ${
                  isAqua
                    ? 'bg-[#e0f2fe] text-[#0284c7] hover:bg-white border-[#7dd3fc]'
                    : 'bg-[#2e1d3e] text-[#f7d6e8] hover:bg-[#3d2652] border-[#4b3670]'
                }`}
              >
                <Upload className={`w-3.5 h-3.5 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`} />
                <span>导入备份</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const parsed = JSON.parse(event.target?.result as string);
                        if (parsed.apis) localStorage.setItem('phone_api_configs_v1', parsed.apis);
                        if (parsed.worldbooks) localStorage.setItem('phone_worldbooks_v1', parsed.worldbooks);
                        if (parsed.personas) localStorage.setItem('phone_personas_v1', parsed.personas);
                        if (parsed.webpages) localStorage.setItem('phone_webpages_v1', parsed.webpages);
                        if (parsed.stickers) localStorage.setItem('phone_stickers_v1', parsed.stickers);
                        if (parsed.messages) localStorage.setItem('phone_chat_messages_v1', parsed.messages);
                        if (parsed.profile) localStorage.setItem('phone_user_profile_v1', parsed.profile);
                        if (parsed.channelPosts) localStorage.setItem('phone_qq_channel_posts_v1', parsed.channelPosts);
                        if (parsed.qzoneFeeds) localStorage.setItem('phone_qq_qzone_feeds_v1', parsed.qzoneFeeds);
                        alert('数据恢复成功，即将重新加载！');
                        window.location.reload();
                      } catch {
                        alert('备份文件格式不正确');
                      }
                    };
                    reader.readAsText(file);
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* 危险区 */}
        <div className="pt-2">
          <button
            onClick={() => {
              if (confirm('确认清空小手机的所有本地数据并恢复初始出厂设置吗？')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="w-full py-2.5 rounded-xl border border-rose-900/60 bg-rose-950/20 text-rose-300 hover:bg-rose-950/40 text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors jelly-btn"
          >
            <span>一键恢复出厂设置 (清空全部数据)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
