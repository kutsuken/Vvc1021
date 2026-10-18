import React from 'react';
import { X, Check, Sliders, User, Eye, Sparkles, BookOpen, Layers, ShieldCheck, Zap, RotateCcw } from 'lucide-react';
import { OfflineConfig, NarrativePerson, NarrativePerspective } from '../types/offline';
import { CharacterPersona, PresetItem, WorldBookItem } from '../types/phone';
import { getActivePresetsForChar } from '../utils/aiService';

interface OfflineSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: OfflineConfig;
  onSaveConfig: (newConfig: OfflineConfig) => void;
  presets: PresetItem[];
  worldbooks: WorldBookItem[];
  char?: CharacterPersona;
  currentTheme?: string;
}

export const OfflineSettingsModal: React.FC<OfflineSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  presets,
  worldbooks,
  char,
  currentTheme = 'sky',
}) => {
  const isAqua = currentTheme === 'aqua_pixel';
  const [tempConfig, setTempConfig] = React.useState<OfflineConfig>(config);
  const [minWordsInput, setMinWordsInput] = React.useState<string>(String(config.minWords ?? 500));
  const [maxWordsInput, setMaxWordsInput] = React.useState<string>(String(config.maxWords ?? 800));

  React.useEffect(() => {
    if (isOpen) {
      setTempConfig(config);
      setMinWordsInput(String(config.minWords ?? 500));
      setMaxWordsInput(String(config.maxWords ?? 800));
    }
  }, [isOpen, config]);

  // 计算当前角色在线上生效的预设
  const onlinePresets = React.useMemo(() => {
    if (!char) return [];
    return getActivePresetsForChar(presets, char.id);
  }, [presets, char]);
  const onlinePresetIds = React.useMemo(() => onlinePresets.map((p) => p.id), [onlinePresets]);

  // 计算当前角色在线上绑定的世界书（或全局生效世界书）
  const onlineWorldBooks = React.useMemo(() => {
    if (!char) return [];
    return worldbooks.filter(
      (wb) =>
        wb.isEnabled !== false &&
        (wb.scope === 'global' ||
          wb.boundCharacterIds?.includes(char.id) ||
          char.boundWorldBookIds?.includes(wb.id))
    );
  }, [worldbooks, char]);
  const onlineWorldBookIds = React.useMemo(() => onlineWorldBooks.map((wb) => wb.id), [onlineWorldBooks]);

  if (!isOpen) return null;

  const handleSave = () => {
    const finalMin = minWordsInput === '' ? 0 : Math.max(0, parseInt(minWordsInput, 10) || 0);
    const parsedMax = maxWordsInput === '' ? 0 : Math.max(0, parseInt(maxWordsInput, 10) || 0);
    const finalMax = parsedMax < finalMin ? finalMin : parsedMax;

    onSaveConfig({
      ...tempConfig,
      minWords: finalMin,
      maxWords: finalMax,
    });
    onClose();
  };

  const resetToDefaultWords = () => {
    setMinWordsInput('500');
    setMaxWordsInput('800');
    setTempConfig((prev) => ({ ...prev, minWords: 500, maxWords: 800 }));
  };

  const narrativePersons: { value: NarrativePerson; label: string; desc: string }[] = [
    { value: 'third', label: '第三人称/名字', desc: '内置默认，角色以名字指代，小说体裁' },
    { value: 'first', label: '第一人称', desc: '以角色「我」自称叙事' },
    { value: 'second', label: '第二人称', desc: '以「你」叙事，强化玩家在场感' },
  ];

  const perspectives: { value: NarrativePerspective; label: string; desc: string }[] = [
    { value: 'omniscient', label: '全知视角', desc: '上帝全知，兼顾双方微表情与场景' },
    { value: 'user', label: '用户视角', desc: '以玩家为焦点感触与观察' },
    { value: 'character', label: 'ta的视角', desc: '以角色眼波与内心情绪为主' },
  ];

  const togglePreset = (id: string) => {
    const list = tempConfig.boundPresetIds || [];
    const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
    setTempConfig({ ...tempConfig, boundPresetIds: next });
  };

  const toggleWorldBook = (id: string) => {
    const list = tempConfig.boundWorldBookIds || [];
    const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
    setTempConfig({ ...tempConfig, boundWorldBookIds: next });
  };

  const selectAllOnlinePresets = () => {
    const merged = Array.from(new Set([...(tempConfig.boundPresetIds || []), ...onlinePresetIds]));
    setTempConfig({ ...tempConfig, boundPresetIds: merged });
  };

  const selectAllOnlineWorldBooks = () => {
    const merged = Array.from(new Set([...(tempConfig.boundWorldBookIds || []), ...onlineWorldBookIds]));
    setTempConfig({ ...tempConfig, boundWorldBookIds: merged });
  };

  return (
    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-50 flex flex-col justify-end animate-in fade-in select-none">
      <div
        className={`rounded-t-3xl border-t flex flex-col max-h-[92%] shadow-2xl transition-colors ${
          isAqua ? 'bg-white border-[#bae6fd]' : 'bg-[#1b1025] border-[#4b3670]'
        }`}
      >
        {/* 顶部标题栏 */}
        <div
          className={`p-4 border-b flex items-center justify-between shrink-0 transition-colors ${
            isAqua ? 'bg-[#f0f9ff]/90 border-[#bae6fd]' : 'bg-[#231432]/90 border-[#3b2a5a]'
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors ${
                isAqua
                  ? 'bg-[#e0f2fe] border-[#bae6fd] text-[#0284c7]'
                  : 'bg-[#2e173e] border-[#ff8ecb]/50 text-[#ff8ecb]'
              }`}
            >
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3
                className={`text-sm font-bold ${
                  isAqua ? 'text-[#0369a1]' : 'text-[#f7d6e8]'
                }`}
              >
                线下互动专属设置
              </h3>
              <p className={`text-[10px] ${isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]'}`}>
                字数控制 · 人称视角 · 行为开关 · 线上预设与世界书
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-full transition-colors ${
              isAqua
                ? 'text-[#0284c7] hover:bg-[#e0f2fe]'
                : 'text-[#b7a2d9] hover:text-white hover:bg-white/10'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 设置内容表单 (滚动区) */}
        <div
          className={`flex-1 overflow-y-auto p-4 space-y-5 text-xs ${
            isAqua ? 'text-[#0369a1]' : 'text-[#f7d6e8]'
          }`}
        >
          {/* 1. 字数范围设置 (已完全删除上方预设块，玩家可自由输入，可删至0，默认500~800) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span
                className={`font-bold flex items-center gap-1.5 ${
                  isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>单次生成字数范围</span>
              </span>
              <button
                type="button"
                onClick={resetToDefaultWords}
                className={`text-[10px] flex items-center gap-1 font-mono transition-colors ${
                  isAqua
                    ? 'text-[#0284c7]/70 hover:text-[#0284c7]'
                    : 'text-[#b7a2d9] hover:text-[#ff8ecb]'
                }`}
                title="恢复为默认500~800字"
              >
                <RotateCcw className="w-3 h-3" />
                <span>恢复默认 (500~800字)</span>
              </button>
            </div>

            {/* 精确微调输入 (支持自由删除修改，最小可删至0) */}
            <div className="flex items-center gap-2 pt-1">
              <div
                className={`flex-1 flex items-center gap-1.5 rounded-xl px-3 py-2 border transition-colors ${
                  isAqua
                    ? 'bg-[#f0f9ff] border-[#bae6fd] focus-within:border-[#0284c7]'
                    : 'bg-[#150d1e] border-[#3b2a5a] focus-within:border-[#ff8ecb]'
                }`}
              >
                <span className={`text-[10px] shrink-0 ${isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]'}`}>
                  最少
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={minWordsInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d]/g, '');
                    setMinWordsInput(val);
                    const num = val === '' ? 0 : parseInt(val, 10);
                    setTempConfig((prev) => ({ ...prev, minWords: num }));
                  }}
                  placeholder="0"
                  className={`w-full bg-transparent text-right font-mono text-sm focus:outline-none ${
                    isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'
                  }`}
                />
                <span className={`text-[10px] shrink-0 ${isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]'}`}>
                  字
                </span>
              </div>

              <span className={`font-mono px-1 ${isAqua ? 'text-[#0284c7]/60' : 'text-[#b7a2d9]'}`}>
                至
              </span>

              <div
                className={`flex-1 flex items-center gap-1.5 rounded-xl px-3 py-2 border transition-colors ${
                  isAqua
                    ? 'bg-[#f0f9ff] border-[#bae6fd] focus-within:border-[#0284c7]'
                    : 'bg-[#150d1e] border-[#3b2a5a] focus-within:border-[#ff8ecb]'
                }`}
              >
                <span className={`text-[10px] shrink-0 ${isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]'}`}>
                  最多
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={maxWordsInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d]/g, '');
                    setMaxWordsInput(val);
                    const num = val === '' ? 0 : parseInt(val, 10);
                    setTempConfig((prev) => ({ ...prev, maxWords: num }));
                  }}
                  placeholder="800"
                  className={`w-full bg-transparent text-right font-mono text-sm focus:outline-none ${
                    isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'
                  }`}
                />
                <span className={`text-[10px] shrink-0 ${isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]'}`}>
                  字
                </span>
              </div>
            </div>

            <div className={`text-[10px] leading-relaxed ${isAqua ? 'text-[#0284c7]/60' : 'text-[#b7a2d9]/70'}`}>
              * 默认推荐 500 ~ 800 字，玩家可随时自由改写上下限数字。
            </div>
          </div>

          {/* 2. 人称设定 */}
          <div className="space-y-2">
            <span
              className={`font-bold flex items-center gap-1.5 ${
                isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>人称设定</span>
            </span>
            <div className="grid grid-cols-3 gap-2">
              {narrativePersons.map((p) => {
                const isSelected = tempConfig.narrativePerson === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setTempConfig({ ...tempConfig, narrativePerson: p.value })}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? isAqua
                          ? 'bg-[#e0f2fe] border-[#0284c7] text-[#0369a1] font-bold shadow-sm'
                          : 'bg-[#37194a] border-[#ff8ecb] text-[#ff8ecb] font-bold shadow-sm'
                        : isAqua
                        ? 'bg-[#f0f9ff] border-[#bae6fd] text-[#0369a1] hover:border-[#38bdf8]'
                        : 'bg-[#150d1e] border-[#3b2a5a] text-[#b7a2d9] hover:border-[#ff8ecb]/40'
                    }`}
                  >
                    <div className="text-xs">{p.label}</div>
                    <div
                      className={`text-[9px] mt-0.5 line-clamp-1 ${
                        isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]/70'
                      }`}
                    >
                      {p.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. 视角设定 */}
          <div className="space-y-2">
            <span
              className={`font-bold flex items-center gap-1.5 ${
                isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>视角设定</span>
            </span>
            <div className="grid grid-cols-3 gap-2">
              {perspectives.map((p) => {
                const isSelected = tempConfig.perspective === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setTempConfig({ ...tempConfig, perspective: p.value })}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? isAqua
                          ? 'bg-[#e0f2fe] border-[#0284c7] text-[#0369a1] font-bold shadow-sm'
                          : 'bg-[#37194a] border-[#ff8ecb] text-[#ff8ecb] font-bold shadow-sm'
                        : isAqua
                        ? 'bg-[#f0f9ff] border-[#bae6fd] text-[#0369a1] hover:border-[#38bdf8]'
                        : 'bg-[#150d1e] border-[#3b2a5a] text-[#b7a2d9] hover:border-[#ff8ecb]/40'
                    }`}
                  >
                    <div className="text-xs">{p.label}</div>
                    <div
                      className={`text-[9px] mt-0.5 line-clamp-1 ${
                        isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]/70'
                      }`}
                    >
                      {p.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. 核心功能开关 */}
          <div className="space-y-2">
            <span
              className={`font-bold flex items-center gap-1.5 ${
                isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>核心互动准则开关</span>
            </span>
            <div
              className={`space-y-2 p-3 rounded-2xl border transition-colors ${
                isAqua
                  ? 'bg-[#f0f9ff] border-[#bae6fd]'
                  : 'bg-[#150d1e] border-[#3b2a5a]/70'
              }`}
            >
              {/* 开关 A: 可以扮演玩家 */}
              <label className="flex items-start justify-between gap-3 cursor-pointer select-none">
                <div className="space-y-0.5">
                  <div
                    className={`font-bold text-xs ${
                      isAqua ? 'text-[#0369a1]' : 'text-[#f7d6e8]'
                    }`}
                  >
                    允许 AI 扮演玩家
                  </div>
                  <div className={`text-[10px] ${isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]/70'}`}>
                    关闭时 AI 严格禁止替玩家发声或替玩家做决定；开启后允许推演玩家自然反应。
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={tempConfig.allowPlayUser}
                  onChange={(e) => setTempConfig({ ...tempConfig, allowPlayUser: e.target.checked })}
                  className={`mt-1 w-4 h-4 rounded ${isAqua ? 'accent-[#0284c7]' : 'accent-[#ff8ecb]'}`}
                />
              </label>

              <div className={`border-t ${isAqua ? 'border-[#bae6fd]/50' : 'border-[#3b2a5a]/40'}`} />

              {/* 开关 B: 防止转述 */}
              <label className="flex items-start justify-between gap-3 cursor-pointer select-none">
                <div className="space-y-0.5">
                  <div
                    className={`font-bold text-xs ${
                      isAqua ? 'text-[#0369a1]' : 'text-[#f7d6e8]'
                    }`}
                  >
                    防止转述与复述
                  </div>
                  <div className={`text-[10px] ${isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]/70'}`}>
                    开启后禁止重复复述玩家上句输入或前文设定，直接给出新的对话与小说推进。
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={tempConfig.preventParaphrase}
                  onChange={(e) =>
                    setTempConfig({ ...tempConfig, preventParaphrase: e.target.checked })
                  }
                  className={`mt-1 w-4 h-4 rounded ${isAqua ? 'accent-[#0284c7]' : 'accent-[#ff8ecb]'}`}
                />
              </label>

              <div className={`border-t ${isAqua ? 'border-[#bae6fd]/50' : 'border-[#3b2a5a]/40'}`} />

              {/* 开关 C: 细腻心理独白 */}
              <label className="flex items-start justify-between gap-3 cursor-pointer select-none">
                <div className="space-y-0.5">
                  <div
                    className={`font-bold text-xs ${
                      isAqua ? 'text-[#0369a1]' : 'text-[#f7d6e8]'
                    }`}
                  >
                    角色内心独白与心理描写
                  </div>
                  <div className={`text-[10px] ${isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]/70'}`}>
                    展现角色的内心潜台词与微妙情绪波动（类似思维链折叠展示）。
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={tempConfig.enablePsychology}
                  onChange={(e) =>
                    setTempConfig({ ...tempConfig, enablePsychology: e.target.checked })
                  }
                  className={`mt-1 w-4 h-4 rounded ${isAqua ? 'accent-[#0284c7]' : 'accent-[#ff8ecb]'}`}
                />
              </label>

              <div className={`border-t ${isAqua ? 'border-[#bae6fd]/50' : 'border-[#3b2a5a]/40'}`} />

              {/* 开关 D: 肢体微动作 */}
              <label className="flex items-start justify-between gap-3 cursor-pointer select-none">
                <div className="space-y-0.5">
                  <div
                    className={`font-bold text-xs ${
                      isAqua ? 'text-[#0369a1]' : 'text-[#f7d6e8]'
                    }`}
                  >
                    细腻神态与肢体动作描写
                  </div>
                  <div className={`text-[10px] ${isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]/70'}`}>
                    刻画眼神交汇、指尖微动、衣角触碰与距离感。
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={tempConfig.enableActionDetail}
                  onChange={(e) =>
                    setTempConfig({ ...tempConfig, enableActionDetail: e.target.checked })
                  }
                  className={`mt-1 w-4 h-4 rounded ${isAqua ? 'accent-[#0284c7]' : 'accent-[#ff8ecb]'}`}
                />
              </label>

              <div className={`border-t ${isAqua ? 'border-[#bae6fd]/50' : 'border-[#3b2a5a]/40'}`} />

              {/* 开关 E: 五感环境描写 */}
              <label className="flex items-start justify-between gap-3 cursor-pointer select-none">
                <div className="space-y-0.5">
                  <div
                    className={`font-bold text-xs ${
                      isAqua ? 'text-[#0369a1]' : 'text-[#f7d6e8]'
                    }`}
                  >
                    五感环境与现场氛围描写
                  </div>
                  <div className={`text-[10px] ${isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]/70'}`}>
                    增强温度、光影斑驳、环境音与气味细节。
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={tempConfig.enableEnvironmentSensory}
                  onChange={(e) =>
                    setTempConfig({ ...tempConfig, enableEnvironmentSensory: e.target.checked })
                  }
                  className={`mt-1 w-4 h-4 rounded ${isAqua ? 'accent-[#0284c7]' : 'accent-[#ff8ecb]'}`}
                />
              </label>
            </div>
          </div>

          {/* 5. 预设选择 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span
                className={`font-bold flex items-center gap-1.5 ${
                  isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>预设选择</span>
              </span>
              <div className="flex items-center gap-2">
                {onlinePresets.length > 0 && (
                  <button
                    type="button"
                    onClick={selectAllOnlinePresets}
                    className={`px-2 py-0.5 rounded-lg border text-[10px] flex items-center gap-1 transition-colors ${
                      isAqua
                        ? 'bg-[#e0f2fe] border-[#bae6fd] text-[#0284c7] hover:bg-[#bae6fd]'
                        : 'bg-[#2e173e] border-[#ff8ecb]/50 text-[#ff8ecb] hover:bg-[#3d1e52]'
                    }`}
                    title="一键将该角色在线上启用的预设全选勾入线下"
                  >
                    <Zap className="w-2.5 h-2.5" />
                    <span>选用线上预设 ({onlinePresets.length})</span>
                  </button>
                )}
                <span className={`text-[10px] ${isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]'}`}>
                  已选 {(tempConfig.boundPresetIds || []).length} 项
                </span>
              </div>
            </div>

            {presets.length === 0 ? (
              <div
                className={`p-3 rounded-xl border text-[11px] text-center ${
                  isAqua
                    ? 'bg-[#f0f9ff] border-[#bae6fd] text-[#0284c7]/60'
                    : 'bg-[#150d1e] border-[#3b2a5a]/50 text-[#b7a2d9]/60'
                }`}
              >
                预设列表暂无内容，可去预设APP中创建
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                {presets.map((preset) => {
                  const isChecked = (tempConfig.boundPresetIds || []).includes(preset.id);
                  const isOnline = onlinePresetIds.includes(preset.id);

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => togglePreset(preset.id)}
                      className={`p-2 rounded-xl border text-left text-[11px] flex items-center justify-between transition-all ${
                        isChecked
                          ? isAqua
                            ? 'bg-[#e0f2fe] border-[#0284c7] text-[#0369a1] font-bold shadow-sm'
                            : 'bg-[#37194a] border-[#ff8ecb] text-[#ff8ecb] font-bold shadow-sm'
                          : isAqua
                          ? 'bg-[#f0f9ff] border-[#bae6fd] text-[#0369a1] hover:border-[#38bdf8]'
                          : 'bg-[#150d1e] border-[#3b2a5a] text-[#b7a2d9] hover:border-[#ff8ecb]/40'
                      }`}
                    >
                      <div className="truncate flex-1 mr-1">
                        <div className="truncate flex items-center gap-1">
                          <span className="truncate">{preset.name}</span>
                        </div>
                        {isOnline && (
                          <span
                            className={`text-[8px] font-normal px-1 py-0.5 rounded ${
                              isAqua ? 'bg-[#0284c7]/15 text-[#0284c7]' : 'bg-[#ff8ecb]/20 text-[#ff8ecb]'
                            }`}
                          >
                            线上生效
                          </span>
                        )}
                      </div>
                      {isChecked && (
                        <Check
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 6. 世界书选择 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span
                className={`font-bold flex items-center gap-1.5 ${
                  isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>世界书选择</span>
              </span>
              <div className="flex items-center gap-2">
                {onlineWorldBooks.length > 0 && (
                  <button
                    type="button"
                    onClick={selectAllOnlineWorldBooks}
                    className={`px-2 py-0.5 rounded-lg border text-[10px] flex items-center gap-1 transition-colors ${
                      isAqua
                        ? 'bg-[#e0f2fe] border-[#bae6fd] text-[#0284c7] hover:bg-[#bae6fd]'
                        : 'bg-[#2e173e] border-[#ff8ecb]/50 text-[#ff8ecb] hover:bg-[#3d1e52]'
                    }`}
                    title="一键将该角色在线上绑定的世界书全选勾入线下"
                  >
                    <Zap className="w-2.5 h-2.5" />
                    <span>选用线上世界书 ({onlineWorldBooks.length})</span>
                  </button>
                )}
                <span className={`text-[10px] ${isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]'}`}>
                  已选 {(tempConfig.boundWorldBookIds || []).length} 本
                </span>
              </div>
            </div>

            {worldbooks.length === 0 ? (
              <div
                className={`p-3 rounded-xl border text-[11px] text-center ${
                  isAqua
                    ? 'bg-[#f0f9ff] border-[#bae6fd] text-[#0284c7]/60'
                    : 'bg-[#150d1e] border-[#3b2a5a]/50 text-[#b7a2d9]/60'
                }`}
              >
                世界书列表暂无内容，可去世界书APP中创建
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                {worldbooks.map((wb) => {
                  const isChecked = (tempConfig.boundWorldBookIds || []).includes(wb.id);
                  const isOnline = onlineWorldBookIds.includes(wb.id);

                  return (
                    <button
                      key={wb.id}
                      type="button"
                      onClick={() => toggleWorldBook(wb.id)}
                      className={`p-2 rounded-xl border text-left text-[11px] flex items-center justify-between transition-all ${
                        isChecked
                          ? isAqua
                            ? 'bg-[#e0f2fe] border-[#0284c7] text-[#0369a1] font-bold shadow-sm'
                            : 'bg-[#37194a] border-[#ff8ecb] text-[#ff8ecb] font-bold shadow-sm'
                          : isAqua
                          ? 'bg-[#f0f9ff] border-[#bae6fd] text-[#0369a1] hover:border-[#38bdf8]'
                          : 'bg-[#150d1e] border-[#3b2a5a] text-[#b7a2d9] hover:border-[#ff8ecb]/40'
                      }`}
                    >
                      <div className="truncate flex-1 mr-1">
                        <div className="truncate">{wb.name}</div>
                        {isOnline && (
                          <span
                            className={`text-[8px] font-normal px-1 py-0.5 rounded ${
                              isAqua ? 'bg-[#0284c7]/15 text-[#0284c7]' : 'bg-[#ff8ecb]/20 text-[#ff8ecb]'
                            }`}
                          >
                            {wb.scope === 'global' ? '全局生效' : '线上绑定'}
                          </span>
                        )}
                      </div>
                      {isChecked && (
                        <Check
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 底部按钮栏 */}
        <div
          className={`p-3 border-t flex items-center gap-2 shrink-0 transition-colors ${
            isAqua
              ? 'bg-[#f0f9ff] border-[#bae6fd]'
              : 'bg-[#1e1328] border-[#3b2a5a]'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 py-2.5 rounded-xl border font-bold text-xs jelly-btn transition-colors ${
              isAqua
                ? 'bg-white border-[#bae6fd] text-[#0284c7] hover:bg-[#e0f2fe]'
                : 'bg-[#281538] border-[#4b3670] text-[#b7a2d9] hover:text-white'
            }`}
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs jelly-btn shadow-md transition-opacity ${
              isAqua
                ? 'bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-white hover:opacity-90'
                : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120]'
            }`}
          >
            保存并应用设定
          </button>
        </div>
      </div>
    </div>
  );
};
