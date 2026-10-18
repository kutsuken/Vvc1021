import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  Plus,
  Sparkles,
  Star,
  Clock,
  Layers,
  Users,
  Edit2,
  Trash2,
  Filter,
  X,
  ChevronDown,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import {
  ApiConfig,
  CharacterPersona,
  MemoryImportance,
  MemoryItem,
  MemoryLayer,
  MemorySource,
  MemoryType,
} from '../types/phone';
import {
  PixelBow,
  PixelIconMemory,
  PixelSparkle,
  PixelBunny,
} from './PixelAssets';
import { renderUniversalAvatar } from './AvatarPickerModal';
import { consolidateMemories, createMemoryItem } from '../utils/memoryService';

interface MemoryAppProps {
  memories: MemoryItem[];
  onSaveMemories: (newMemories: MemoryItem[]) => void;
  personas: CharacterPersona[];
  activeApi?: ApiConfig;
  onBack: () => void;
}

// 记忆来源中文映射与样式
const SOURCE_MAP: Record<MemorySource, { label: string; iconText: string; colorClass: string }> = {
  qq: { label: 'QQ 聊天', iconText: '🐧', colorClass: 'text-[#ff8ecb] border-[#ff8ecb]/40 bg-[#ff8ecb]/10' },
  moments: { label: '朋友圈动态', iconText: '🌸', colorClass: 'text-[#d88fbf] border-[#d88fbf]/40 bg-[#d88fbf]/10' },
  offline: { label: '线下事件', iconText: '☕', colorClass: 'text-amber-300 border-amber-300/40 bg-amber-300/10' },
  manual: { label: '用户手记', iconText: '📝', colorClass: 'text-emerald-300 border-emerald-300/40 bg-emerald-300/10' },
  system: { label: '系统记录', iconText: '⚡', colorClass: 'text-purple-300 border-purple-300/40 bg-purple-300/10' },
  other: { label: '其他来源', iconText: '✦', colorClass: 'text-slate-300 border-slate-300/40 bg-slate-300/10' },
};

// 记忆类型中文映射
const TYPE_MAP: Record<MemoryType, { label: string; badgeClass: string }> = {
  promise: { label: '重要约定', badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-400/50' },
  relation: { label: '关系羁绊', badgeClass: 'bg-pink-500/20 text-pink-300 border-pink-400/50' },
  chat: { label: '聊天对话', badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/50' },
  offline: { label: '线下经历', badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-400/50' },
  moments: { label: '空间动态', badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-400/50' },
  event: { label: '生活事件', badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50' },
  other: { label: '其他记录', badgeClass: 'bg-slate-500/20 text-slate-300 border-slate-400/50' },
};

// 记忆层级说明
const LAYER_MAP: Record<MemoryLayer, { label: string; fullTitle: string; badgeClass: string; desc: string }> = {
  long_term: {
    label: '长期记忆',
    fullTitle: '第三层 · 长期记忆 (终身保留/防出戏)',
    badgeClass: 'bg-gradient-to-r from-[#d88fbf]/30 to-[#ff8ecb]/30 text-[#ff8ecb] border-[#ff8ecb]/60 font-bold',
    desc: '从多次阶段总结和重大经历中沉淀的核心事实、承诺与偏好。',
  },
  periodic: {
    label: '阶段记忆',
    fullTitle: '第二层 · 阶段总结 (定期概括)',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-400/50',
    desc: '每隔一定聊天条数自动或手动概括提炼的近期经历概要。',
  },
  raw: {
    label: '原始记录',
    fullTitle: '第一层 · 原始记录 (未加工数据)',
    badgeClass: 'bg-slate-500/20 text-slate-300 border-slate-400/40',
    desc: '原始聊天记录与事件切片，供后续自动整理阶段归纳。',
  },
};

export const MemoryApp: React.FC<MemoryAppProps> = ({
  memories,
  onSaveMemories,
  personas,
  activeApi,
  onBack,
}) => {
  // 核心导航状态：当前选中的角色 ID。未选中时展示【角色选择页】(符合参考截图2列网格设计)
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);

  // 角色搜索关键字 (在角色选择页搜索角色)
  const [charSearchQuery, setCharSearchQuery] = useState('');

  // 角色内板块主筛选选项卡: 'recent' | 'long_term' | 'important' | 'all'
  const [activeTab, setActiveTab] = useState<'recent' | 'long_term' | 'important' | 'all'>('recent');

  // 记忆内容搜索关键字
  const [searchQuery, setSearchQuery] = useState('');

  // 展开的高级筛选抽屉
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedLayerFilter, setSelectedLayerFilter] = useState<string>('all');

  // 详情弹窗
  const [viewingMemory, setViewingMemory] = useState<MemoryItem | null>(null);

  // 添加 / 编辑弹窗
  const [editingMemory, setEditingMemory] = useState<MemoryItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // 新建/编辑表单临时状态
  const [formContent, setFormContent] = useState('');
  const [formSource, setFormSource] = useState<MemorySource>('manual');
  const [formType, setFormType] = useState<MemoryType>('promise');
  const [formLayer, setFormLayer] = useState<MemoryLayer>('long_term');
  const [formImportance, setFormImportance] = useState<MemoryImportance>('important');
  const [formCharId, setFormCharId] = useState<string>(selectedCharId || personas[0]?.id || 'char_ruanruan');
  const [formTagsStr, setFormTagsStr] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // 整理记忆运行状态与结果报告弹窗
  const [isConsolidating, setIsConsolidating] = useState(false);
  const [consolidationReport, setConsolidationReport] = useState<string | null>(null);

  // 轻量提示 Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

  // 当前选中的角色对象
  const activeCharacter = useMemo(() => {
    if (!selectedCharId) return null;
    return personas.find((p) => p.id === selectedCharId) || null;
  }, [selectedCharId, personas]);

  // 统计每个角色的记忆条数 (对应截图中的 "389 条记忆", "256 条记忆")
  const characterMemoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    personas.forEach((p) => {
      counts[p.id] = 0;
    });
    memories.forEach((m) => {
      if (m.characterId && counts[m.characterId] !== undefined) {
        counts[m.characterId]++;
      } else if (m.characters && m.characters.length > 0) {
        const found = personas.find((p) => m.characters.includes(p.name));
        if (found) counts[found.id] = (counts[found.id] || 0) + 1;
      }
    });
    return counts;
  }, [personas, memories]);

  // 角色列表过滤
  const filteredPersonas = useMemo(() => {
    if (!charSearchQuery.trim()) return personas;
    const q = charSearchQuery.toLowerCase().trim();
    return personas.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.remarks && p.remarks.toLowerCase().includes(q))
    );
  }, [personas, charSearchQuery]);

  // 当前选中角色的专属统计数据
  const charStats = useMemo(() => {
    if (!selectedCharId) {
      return { todayCount: 0, pendingCount: 0, longTermCount: 0, importantCount: 0 };
    }
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const charMems = memories.filter(
      (m) =>
        m.characterId === selectedCharId ||
        (activeCharacter && m.characters?.includes(activeCharacter.name))
    );

    const todayCount = charMems.filter((m) => m.timestamp >= todayStart.getTime()).length;
    const pendingCount = charMems.filter((m) => m.layer === 'raw' && !m.isArchived).length;
    const longTermCount = charMems.filter((m) => m.layer === 'long_term').length;
    const importantCount = charMems.filter((m) => m.isImportant || m.importance !== 'normal').length;

    return {
      todayCount,
      pendingCount,
      longTermCount,
      importantCount,
    };
  }, [memories, selectedCharId, activeCharacter]);

  // 当前角色过滤后的记忆清单
  const filteredMemories = useMemo(() => {
    if (!selectedCharId) return [];

    return memories
      .filter((mem) => {
        // 0. 必须属于当前角色
        const belongsToChar =
          mem.characterId === selectedCharId ||
          (activeCharacter && mem.characters?.includes(activeCharacter.name));
        if (!belongsToChar) return false;

        // 1. 顶层 Tab 过滤
        if (activeTab === 'long_term') {
          if (mem.layer !== 'long_term') return false;
        } else if (activeTab === 'important') {
          if (!mem.isImportant && mem.importance === 'normal') return false;
        } else if (activeTab === 'recent') {
          // 最近排序
        }

        // 2. 搜索框关键词过滤
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const contentMatch = mem.content.toLowerCase().includes(q);
          const tagsMatch = mem.tags?.some((t) => t.toLowerCase().includes(q));
          const typeMatch = TYPE_MAP[mem.type]?.label.includes(q);
          const sourceMatch = SOURCE_MAP[mem.source]?.label.includes(q);
          if (!contentMatch && !tagsMatch && !typeMatch && !sourceMatch) {
            return false;
          }
        }

        // 3. 高级筛选 - 来源
        if (selectedSourceFilter !== 'all') {
          if (mem.source !== selectedSourceFilter) return false;
        }

        // 4. 高级筛选 - 类型
        if (selectedTypeFilter !== 'all') {
          if (mem.type !== selectedTypeFilter) return false;
        }

        // 5. 高级筛选 - 层级
        if (selectedLayerFilter !== 'all') {
          if (mem.layer !== selectedLayerFilter) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (activeTab === 'important') {
          const aWeight = a.importance === 'core' ? 3 : a.importance === 'important' ? 2 : 1;
          const bWeight = b.importance === 'core' ? 3 : b.importance === 'important' ? 2 : 1;
          if (aWeight !== bWeight) return bWeight - aWeight;
        }
        return b.timestamp - a.timestamp;
      });
  }, [
    memories,
    selectedCharId,
    activeCharacter,
    activeTab,
    searchQuery,
    selectedSourceFilter,
    selectedTypeFilter,
    selectedLayerFilter,
  ]);

  // 格式化时间
  const formatDateTime = (ts: number) => {
    const d = new Date(ts);
    const m = d.getMonth() + 1;
    const date = d.getDate();
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${m}月${date}日 ${h}:${min}`;
  };

  // 切换重要状态
  const handleToggleImportant = (mem: MemoryItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextImportance: MemoryImportance =
      mem.importance === 'core' ? 'normal' : mem.importance === 'important' ? 'core' : 'important';
    const nextIsImportant = nextImportance !== 'normal';

    const updated = memories.map((m) => {
      if (m.id === mem.id) {
        return {
          ...m,
          importance: nextImportance,
          isImportant: nextIsImportant,
          updatedAt: Date.now(),
        };
      }
      return m;
    });

    onSaveMemories(updated);
    if (viewingMemory && viewingMemory.id === mem.id) {
      setViewingMemory({
        ...viewingMemory,
        importance: nextImportance,
        isImportant: nextIsImportant,
        updatedAt: Date.now(),
      });
    }
    triggerToast(nextIsImportant ? `已将记忆标记为【${nextImportance === 'core' ? '核心' : '重要'}】` : '已恢复为普通级别');
  };

  // 删除单条记忆
  const handleDeleteMemory = (memId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = memories.find((m) => m.id === memId);
    if (target?.isImportant || target?.importance === 'core') {
      if (!confirm('这是一条被标记为【重要/核心】的记忆，确定要彻底删除它吗？删除后AI将不再能回忆起该事项。')) {
        return;
      }
    } else {
      if (!confirm('确定删除该条记忆吗？')) return;
    }

    const next = memories.filter((m) => m.id !== memId);
    onSaveMemories(next);
    if (viewingMemory && viewingMemory.id === memId) {
      setViewingMemory(null);
    }
    triggerToast('记忆记录已删除');
  };

  // 清空记忆 (测试专用功能)
  const handleClearAllMemories = () => {
    if (!confirm('【清空记忆确认】确定要清空全部记忆数据吗？方便进行从零开始的纯净测试。')) return;
    onSaveMemories([]);
    setViewingMemory(null);
    triggerToast('已全部清空记忆，随时可以开始全新测试！');
  };

  // 打开创建新记忆弹窗 (预选当前角色)
  const handleOpenCreateModal = () => {
    setFormContent('');
    setFormSource('manual');
    setFormType('promise');
    setFormLayer('long_term');
    setFormImportance('important');
    setFormCharId(selectedCharId || personas[0]?.id || 'char_ruanruan');
    setFormTagsStr('约定, 共同经历');
    setFormNotes('');
    setIsAddingNew(true);
    setEditingMemory(null);
  };

  // 打开编辑弹窗
  const handleOpenEditModal = (mem: MemoryItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingMemory(mem);
    setIsAddingNew(false);
    setFormContent(mem.content);
    setFormSource(mem.source);
    setFormType(mem.type);
    setFormLayer(mem.layer);
    setFormImportance(mem.importance);
    setFormCharId(mem.characterId || selectedCharId || personas[0]?.id || 'char_ruanruan');
    setFormTagsStr((mem.tags || []).join(', '));
    setFormNotes(mem.notes || '');
  };

  // 保存新建 / 编辑
  const handleSaveForm = () => {
    if (!formContent.trim()) {
      triggerToast('记忆内容不能为空哦');
      return;
    }

    const charObj = personas.find((p) => p.id === formCharId);
    const charName = charObj?.name || '软软';
    const parsedTags = formTagsStr
      .split(/[,，\s]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const isImportant = formImportance === 'core' || formImportance === 'important';

    if (editingMemory) {
      const updated = memories.map((m) => {
        if (m.id === editingMemory.id) {
          return {
            ...m,
            content: formContent.trim(),
            source: formSource,
            type: formType,
            layer: formLayer,
            importance: formImportance,
            isImportant,
            characterId: formCharId,
            characterName: charName,
            characters: [charName, '小手机用户'],
            tags: parsedTags.length > 0 ? parsedTags : ['未分类标签'],
            notes: formNotes.trim() || undefined,
            updatedAt: Date.now(),
          };
        }
        return m;
      });

      onSaveMemories(updated);
      setEditingMemory(null);
      if (viewingMemory && viewingMemory.id === editingMemory.id) {
        setViewingMemory({
          ...viewingMemory,
          content: formContent.trim(),
          source: formSource,
          type: formType,
          layer: formLayer,
          importance: formImportance,
          isImportant,
          characterId: formCharId,
          characterName: charName,
          tags: parsedTags,
          notes: formNotes.trim() || undefined,
          updatedAt: Date.now(),
        });
      }
      triggerToast('记忆已成功更新');
    } else {
      const newItem = createMemoryItem({
        content: formContent.trim(),
        source: formSource,
        type: formType,
        layer: formLayer,
        importance: formImportance,
        characterId: formCharId,
        characterName: charName,
        characters: [charName, '小手机用户'],
        tags: parsedTags.length > 0 ? parsedTags : ['手动手记'],
        notes: formNotes.trim() || undefined,
      });

      onSaveMemories([newItem, ...memories]);
      setIsAddingNew(false);
      triggerToast('新记忆已存入记忆中枢');
    }
  };

  // 触发记忆自动整理
  const handleTriggerConsolidation = async () => {
    setIsConsolidating(true);
    try {
      const res = await consolidateMemories(memories, activeApi);
      onSaveMemories(res.updatedMemories);
      setConsolidationReport(res.report.details);
    } catch (e: any) {
      triggerToast(e?.message || '整理记忆失败，请稍后再试');
    } finally {
      setIsConsolidating(false);
    }
  };

  // ==========================================
  // 视图一：角色选择列表页 (完全参照用户提供的2列网格设计)
  // ==========================================
  if (!selectedCharId) {
    return (
      <div className="flex-1 flex flex-col bg-gradient-to-b from-[#180d22] via-[#140b1c] to-[#0d0713] text-[#f7d6e8] select-none overflow-hidden font-mono">
        {/* 顶部标题栏 */}
        <div className="h-13 px-3.5 flex items-center justify-between border-b border-[#3b2a5a] bg-[#1e1328]/95 backdrop-blur-md z-20 shrink-0">
          <button
            onClick={onBack}
            className="p-1.5 text-[#d88fbf] hover:text-white jelly-btn flex items-center gap-1 text-xs"
            title="返回手机桌面"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            <span className="hidden sm:inline">桌面</span>
          </button>

          <div className="flex items-center gap-1.5 text-sm font-bold text-[#f7d6e8]">
            <div className="w-6 h-6 rounded-lg bg-[#2e173e] border border-[#ff8ecb]/60 flex items-center justify-center shadow-sm">
              <PixelIconMemory className="w-4 h-4" />
            </div>
            <span>记忆中枢 · 角色列表</span>
            <PixelBow className="w-4 h-4 drop-shadow-sm" />
          </div>

          {/* 右侧清空与添加快捷按钮 */}
          <div className="flex items-center gap-1.5">
            {memories.length > 0 && (
              <button
                onClick={handleClearAllMemories}
                className="p-1.5 rounded-xl bg-[#261536] border border-red-500/40 text-red-300 hover:text-red-200 text-xs flex items-center gap-1 jelly-btn"
                title="清空全部记忆 (测试专用)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="text-[10px]">清空</span>
              </button>
            )}
            <button
              onClick={handleOpenCreateModal}
              className="p-1.5 rounded-xl bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] font-bold jelly-btn shadow-sm"
              title="记录新记忆"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* 角色选择列表主体 */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 space-y-3.5">
          {/* 搜索框 */}
          <div className="h-9 rounded-2xl bg-[#1b1025] border border-[#3b2a5a] px-3 flex items-center gap-2 shadow-inner focus-within:border-[#ff8ecb] transition-all">
            <Search className="w-3.5 h-3.5 text-[#b7a2d9]" />
            <input
              type="text"
              value={charSearchQuery}
              onChange={(e) => setCharSearchQuery(e.target.value)}
              placeholder="搜索角色名称、备注..."
              className="flex-1 bg-transparent text-xs text-[#f7d6e8] placeholder-[#b7a2d9]/50 focus:outline-none"
            />
            {charSearchQuery && (
              <button onClick={() => setCharSearchQuery('')} className="text-[#b7a2d9] hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 提示条 */}
          <div className="px-3 py-2 rounded-2xl bg-[#221330]/80 border border-[#4b3670]/60 flex items-center justify-between text-xs text-[#b7a2d9]">
            <div className="flex items-center gap-1.5 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-[#ff8ecb]" />
              <span>请选择想要查看与管理记忆的角色：</span>
            </div>
            <span className="text-[10px] text-[#ff8ecb] font-mono">共 {personas.length} 位角色</span>
          </div>

          {/* 2列角色网格 (精准参照用户截图视觉布局) */}
          <div className="grid grid-cols-2 gap-3.5">
            {filteredPersonas.map((char) => {
              const memCount = characterMemoryCounts[char.id] || 0;
              return (
                <div
                  key={char.id}
                  onClick={() => setSelectedCharId(char.id)}
                  className="rounded-3xl bg-[#1e1329]/95 border-2 border-[#3b2a5a] hover:border-[#ff8ecb] hover:shadow-[0_4px_24px_rgba(255,142,203,0.25)] transition-all cursor-pointer p-4 flex flex-col items-center justify-center text-center group jelly-icon relative select-none"
                >
                  {/* 大圆形头像 (如截图中圆润头像居中显示) */}
                  <div className="w-16 h-16 rounded-full bg-[#2a1738] border-2 border-[#ff8ecb]/60 group-hover:border-[#ff8ecb] group-hover:scale-105 transition-all overflow-hidden flex items-center justify-center shadow-md mb-2 relative">
                    {renderUniversalAvatar(char.avatar, 'w-16 h-16')}
                    {memCount > 0 && (
                      <div className="absolute top-0 right-0 w-3 h-3 rounded-full bg-[#ff8ecb] ring-2 ring-[#1e1329]" />
                    )}
                  </div>

                  {/* 角色名字 (加粗显眼) */}
                  <h4 className="text-sm font-bold text-white group-hover:text-[#ff8ecb] transition-colors truncate max-w-[120px]">
                    {char.name}
                  </h4>

                  {/* 备注标签 */}
                  <p className="text-[10px] text-[#b7a2d9]/60 truncate max-w-[120px] mb-2 font-mono">
                    {char.remarks || '陪伴角色'}
                  </p>

                  {/* 记忆条数指示 (如截图中：389 条记忆 / 0 条记忆) */}
                  <div className="px-3 py-1 rounded-full bg-[#291738] border border-[#ff8ecb]/40 text-[#ff8ecb] text-xs font-mono font-medium shadow-sm group-hover:border-[#ff8ecb] group-hover:bg-[#341d47] transition-all">
                    {memCount} 条记忆
                  </div>
                </div>
              );
            })}
          </div>

          {/* 如果暂无记忆时的友好提示 */}
          {memories.length === 0 && (
            <div className="p-4 rounded-2xl bg-[#1a0f24]/90 border border-dashed border-[#4b3670] text-center space-y-1 mt-2">
              <span className="text-xs text-[#ff8ecb] font-bold">✨ 记忆库已清空，准备就绪！</span>
              <p className="text-[10px] text-[#b7a2d9]/70 leading-relaxed font-sans">
                点击上方任意角色卡片，即可进入该角色的专属记忆管理中枢，开始创建与测试全新的三层记忆。
              </p>
            </div>
          )}
        </div>

        {/* 底部轻提示 Toast */}
        {toastMsg && (
          <div className="fixed bottom-10 left-6 right-6 z-50 flex justify-center pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="bg-[#1e1329]/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#ff8ecb] shadow-[0_4px_24px_rgba(255,142,203,0.4)] text-xs text-[#f7d6e8] font-mono flex items-center gap-1.5">
              <PixelSparkle className="w-3.5 h-3.5 text-[#ff8ecb]" />
              <span>{toastMsg}</span>
            </div>
          </div>
        )}

        {/* 新增记忆弹窗 */}
        {isAddingNew && (
          <div
            onClick={() => setIsAddingNew(false)}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl bg-[#1e1329] border-2 border-[#ff8ecb]/80 shadow-[0_8px_32px_rgba(255,142,203,0.35)] p-4 flex flex-col gap-3 text-[#f7d6e8] max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#3b2a5a]">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <PixelIconMemory className="w-4 h-4" />
                  <span>记录新记忆</span>
                </h3>
                <button onClick={() => setIsAddingNew(false)} className="p-1 rounded-full text-[#b7a2d9] hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 关联人物 */}
              <div className="space-y-1">
                <label className="text-[11px] text-[#b7a2d9] font-bold">涉及角色人物：</label>
                <select
                  value={formCharId}
                  onChange={(e) => setFormCharId(e.target.value)}
                  className="w-full p-2 rounded-xl bg-[#150d1e] border border-[#3b2a5a] text-xs text-[#f7d6e8] focus:border-[#ff8ecb] focus:outline-none"
                >
                  {personas.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#1e1329] text-white">
                      {p.name} {p.remarks ? `(${p.remarks})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* 记忆分层与重要程度 */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] text-[#b7a2d9] font-bold">记忆分层：</label>
                  <select
                    value={formLayer}
                    onChange={(e) => setFormLayer(e.target.value as MemoryLayer)}
                    className="w-full p-2 rounded-xl bg-[#150d1e] border border-[#3b2a5a] text-xs text-[#f7d6e8] focus:border-[#ff8ecb] focus:outline-none"
                  >
                    <option value="long_term" className="bg-[#1e1329]">第三层 · 长期记忆</option>
                    <option value="periodic" className="bg-[#1e1329]">第二层 · 阶段总结</option>
                    <option value="raw" className="bg-[#1e1329]">第一层 · 原始记录</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-[#b7a2d9] font-bold">重要程度：</label>
                  <select
                    value={formImportance}
                    onChange={(e) => setFormImportance(e.target.value as MemoryImportance)}
                    className="w-full p-2 rounded-xl bg-[#150d1e] border border-[#3b2a5a] text-xs text-[#f7d6e8] focus:border-[#ff8ecb] focus:outline-none"
                  >
                    <option value="core" className="bg-[#1e1329]">核心 (最高优先级)</option>
                    <option value="important" className="bg-[#1e1329]">重要 (安全保留)</option>
                    <option value="normal" className="bg-[#1e1329]">普通</option>
                  </select>
                </div>
              </div>

              {/* 记忆正文 */}
              <div className="space-y-1">
                <label className="text-[11px] text-[#b7a2d9] font-bold">记忆正文内容：</label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="输入一段经历或约定，供角色自然回忆..."
                  rows={4}
                  className="w-full p-2.5 rounded-2xl bg-[#150d1e] border border-[#3b2a5a] text-xs text-[#f7d6e8] placeholder-[#b7a2d9]/40 focus:border-[#ff8ecb] focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* 标签 */}
              <div className="space-y-1">
                <label className="text-[11px] text-[#b7a2d9] font-bold">标签 (逗号分隔)：</label>
                <input
                  type="text"
                  value={formTagsStr}
                  onChange={(e) => setFormTagsStr(e.target.value)}
                  placeholder="约定, 贩卖机, 草莓药水"
                  className="w-full p-2 rounded-xl bg-[#150d1e] border border-[#3b2a5a] text-xs text-[#f7d6e8] focus:border-[#ff8ecb] focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-[#3b2a5a] flex items-center justify-end gap-2">
                <button onClick={() => setIsAddingNew(false)} className="px-4 py-2 rounded-xl bg-[#261536] border border-[#4b3670] text-xs text-[#b7a2d9]">
                  取消
                </button>
                <button onClick={handleSaveForm} className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] font-bold text-xs jelly-btn">
                  保存记忆
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 视图二：具体角色的记忆中枢管理页
  // ==========================================
  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-[#180d22] via-[#140b1c] to-[#0d0713] text-[#f7d6e8] select-none overflow-hidden font-mono">
      {/* 顶部标题栏：带返回角色选择页 */}
      <div className="h-13 px-3.5 flex items-center justify-between border-b border-[#3b2a5a] bg-[#1e1328]/95 backdrop-blur-md z-20 shrink-0">
        <button
          onClick={() => setSelectedCharId(null)}
          className="p-1.5 text-[#d88fbf] hover:text-white jelly-btn flex items-center gap-1 text-xs"
          title="返回角色选择列表"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[11px]">角色</span>
        </button>

        {/* 角色名称与头像展示 */}
        <div className="flex items-center gap-1.5 text-sm font-bold text-[#f7d6e8] max-w-[190px] truncate">
          <div className="w-6 h-6 rounded-full overflow-hidden border border-[#ff8ecb] shrink-0">
            {activeCharacter && renderUniversalAvatar(activeCharacter.avatar, 'w-6 h-6')}
          </div>
          <span className="truncate">{activeCharacter?.name || '角色'} 的记忆</span>
          <PixelBow className="w-4 h-4 drop-shadow-sm shrink-0" />
        </div>

        {/* 顶部右侧快捷按钮 */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleTriggerConsolidation}
            disabled={isConsolidating}
            className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-[#d88fbf]/30 to-[#ff8ecb]/30 hover:from-[#d88fbf]/40 hover:to-[#ff8ecb]/40 border border-[#ff8ecb]/60 text-xs font-bold text-[#ff8ecb] flex items-center gap-1 jelly-btn shadow-sm"
            title="立即执行记忆整理与去重归纳"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isConsolidating ? 'animate-spin' : ''}`} />
            <span>{isConsolidating ? '整理中' : '整理'}</span>
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="p-1.5 rounded-xl bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] font-bold jelly-btn shadow-sm"
            title="为该角色添加新记忆"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* 滚动内容区 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 space-y-3.5">
        {/* 1. 该角色的记忆统计看板 */}
        <div className="grid grid-cols-4 gap-2">
          {/* 今日新增 */}
          <div className="p-2.5 rounded-2xl bg-[#221330]/90 border border-[#4b3670]/70 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
            <span className="text-[10px] text-[#b7a2d9]/80 font-medium">今日新增</span>
            <span className="text-base font-bold text-white mt-0.5">{charStats.todayCount}</span>
            <div className="absolute top-1 right-1 opacity-20">
              <Clock className="w-3.5 h-3.5 text-[#ff8ecb]" />
            </div>
          </div>

          {/* 待整理 */}
          <div
            onClick={handleTriggerConsolidation}
            className="p-2.5 rounded-2xl bg-[#221330]/90 border border-[#4b3670]/70 hover:border-[#ff8ecb]/50 cursor-pointer flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden group transition-all"
            title="点击立即整理"
          >
            <span className="text-[10px] text-amber-300 font-medium">待整理</span>
            <span className="text-base font-bold text-amber-300 mt-0.5">{charStats.pendingCount}</span>
          </div>

          {/* 长期记忆 */}
          <div
            onClick={() => setActiveTab('long_term')}
            className={`p-2.5 rounded-2xl border cursor-pointer flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden transition-all ${
              activeTab === 'long_term'
                ? 'bg-[#2d173c] border-[#ff8ecb] ring-1 ring-[#ff8ecb]'
                : 'bg-[#221330]/90 border-[#4b3670]/70 hover:border-[#ff8ecb]/50'
            }`}
          >
            <span className="text-[10px] text-[#ff8ecb] font-medium">长期记忆</span>
            <span className="text-base font-bold text-[#ff8ecb] mt-0.5">{charStats.longTermCount}</span>
            <div className="absolute top-1 right-1 opacity-30">
              <Layers className="w-3.5 h-3.5 text-[#ff8ecb]" />
            </div>
          </div>

          {/* 重要记忆 */}
          <div
            onClick={() => setActiveTab('important')}
            className={`p-2.5 rounded-2xl border cursor-pointer flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden transition-all ${
              activeTab === 'important'
                ? 'bg-[#2d173c] border-rose-400 ring-1 ring-rose-400'
                : 'bg-[#221330]/90 border-[#4b3670]/70 hover:border-rose-400/50'
            }`}
          >
            <span className="text-[10px] text-rose-300 font-medium">重要记忆</span>
            <span className="text-base font-bold text-rose-300 mt-0.5">{charStats.importantCount}</span>
            <div className="absolute top-1 right-1 opacity-30">
              <Star className="w-3.5 h-3.5 text-rose-300 fill-rose-300/30" />
            </div>
          </div>
        </div>

        {/* 2. 搜索框与高级筛选按钮 */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-9 rounded-2xl bg-[#1b1025] border border-[#3b2a5a] px-3 flex items-center gap-2 shadow-inner focus-within:border-[#ff8ecb] transition-all">
            <Search className="w-3.5 h-3.5 text-[#b7a2d9]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`在 ${activeCharacter?.name || ''} 的记忆中搜索...`}
              className="flex-1 bg-transparent text-xs text-[#f7d6e8] placeholder-[#b7a2d9]/50 focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-[#b7a2d9] hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
            className={`h-9 px-3 rounded-2xl border text-xs font-mono flex items-center gap-1.5 transition-all jelly-btn ${
              showAdvancedFilter ||
              selectedSourceFilter !== 'all' ||
              selectedTypeFilter !== 'all' ||
              selectedLayerFilter !== 'all'
                ? 'bg-[#2d173c] border-[#ff8ecb] text-[#ff8ecb]'
                : 'bg-[#1b1025] border-[#3b2a5a] text-[#b7a2d9]'
            }`}
            title="高级分类筛选"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>筛选</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showAdvancedFilter ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* 高级筛选抽屉面板 */}
        {showAdvancedFilter && (
          <div className="p-3 rounded-2xl bg-[#1d1127] border border-[#ff8ecb]/40 space-y-2.5 animate-in fade-in duration-150">
            {/* 记忆层级筛选 */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#b7a2d9] shrink-0 text-[11px] w-14">记忆分层:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setSelectedLayerFilter('all')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] border transition-all ${
                    selectedLayerFilter === 'all'
                      ? 'bg-[#ff8ecb] text-[#1a1120] font-bold border-[#ff8ecb]'
                      : 'bg-[#261536] text-[#b7a2d9] border-[#4b3670]'
                  }`}
                >
                  全部
                </button>
                {(['long_term', 'periodic', 'raw'] as MemoryLayer[]).map((layer) => (
                  <button
                    key={layer}
                    onClick={() => setSelectedLayerFilter(layer)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] border transition-all ${
                      selectedLayerFilter === layer
                        ? 'bg-[#ff8ecb] text-[#1a1120] font-bold border-[#ff8ecb]'
                        : 'bg-[#261536] text-[#b7a2d9] border-[#4b3670]'
                    }`}
                  >
                    {LAYER_MAP[layer].label}
                  </button>
                ))}
              </div>
            </div>

            {/* 来源筛选 */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#b7a2d9] shrink-0 text-[11px] w-14">数据来源:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setSelectedSourceFilter('all')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] border transition-all ${
                    selectedSourceFilter === 'all'
                      ? 'bg-[#ff8ecb] text-[#1a1120] font-bold border-[#ff8ecb]'
                      : 'bg-[#261536] text-[#b7a2d9] border-[#4b3670]'
                  }`}
                >
                  全部
                </button>
                {(['qq', 'moments', 'offline', 'manual'] as MemorySource[]).map((src) => (
                  <button
                    key={src}
                    onClick={() => setSelectedSourceFilter(src)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] border transition-all ${
                      selectedSourceFilter === src
                        ? 'bg-[#ff8ecb] text-[#1a1120] font-bold border-[#ff8ecb]'
                        : 'bg-[#261536] text-[#b7a2d9] border-[#4b3670]'
                    }`}
                  >
                    {SOURCE_MAP[src].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                onClick={() => {
                  setSelectedSourceFilter('all');
                  setSelectedTypeFilter('all');
                  setSelectedLayerFilter('all');
                }}
                className="text-[10px] text-[#ff8ecb] hover:underline"
              >
                重置筛选
              </button>
            </div>
          </div>
        )}

        {/* 3. 选项卡: [最近记忆] [长期记忆] [重要记忆] [全部记录] */}
        <div className="flex items-center p-1 rounded-2xl bg-[#1b1025] border border-[#3b2a5a] text-xs font-mono">
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex-1 py-1.5 rounded-xl transition-all font-bold ${
              activeTab === 'recent'
                ? 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] shadow-sm'
                : 'text-[#b7a2d9] hover:text-[#f7d6e8]'
            }`}
          >
            最近记忆
          </button>
          <button
            onClick={() => setActiveTab('long_term')}
            className={`flex-1 py-1.5 rounded-xl transition-all font-bold ${
              activeTab === 'long_term'
                ? 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] shadow-sm'
                : 'text-[#b7a2d9] hover:text-[#f7d6e8]'
            }`}
          >
            长期记忆
          </button>
          <button
            onClick={() => setActiveTab('important')}
            className={`flex-1 py-1.5 rounded-xl transition-all font-bold ${
              activeTab === 'important'
                ? 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] shadow-sm'
                : 'text-[#b7a2d9] hover:text-[#f7d6e8]'
            }`}
          >
            重要记忆
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-1.5 rounded-xl transition-all font-bold ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] shadow-sm'
                : 'text-[#b7a2d9] hover:text-[#f7d6e8]'
            }`}
          >
            全部记录
          </button>
        </div>

        {/* 4. 记忆卡片列表 */}
        <div className="space-y-3">
          {filteredMemories.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-[#b7a2d9]">
              <PixelBunny className="w-12 h-12 mb-2 opacity-70" />
              <p className="text-xs font-bold text-[#f7d6e8]">「{activeCharacter?.name}」暂无相关记忆记录</p>
              <p className="text-[11px] text-[#b7a2d9]/60 mt-1 max-w-xs font-sans">
                记忆内容当前为空，已为您准备好纯净的测试环境。点击下方按钮即可手动记录测试，或在 QQ 对话时自动累积。
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="mt-3.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] font-bold text-xs jelly-btn shadow-md"
              >
                为「{activeCharacter?.name}」添加第一条记忆
              </button>
            </div>
          ) : (
            filteredMemories.map((mem) => {
              const sourceInfo = SOURCE_MAP[mem.source] || SOURCE_MAP.other;
              const typeInfo = TYPE_MAP[mem.type] || TYPE_MAP.other;
              const layerInfo = LAYER_MAP[mem.layer] || LAYER_MAP.raw;
              const isCoreOrImportant = mem.importance === 'core' || mem.importance === 'important' || mem.isImportant;

              return (
                <div
                  key={mem.id}
                  onClick={() => setViewingMemory(mem)}
                  className={`p-3.5 rounded-3xl border transition-all cursor-pointer relative group ${
                    isCoreOrImportant
                      ? 'bg-[#231435]/95 border-[#ff8ecb]/60 shadow-[0_4px_20px_rgba(255,142,203,0.15)] hover:border-[#ff8ecb]'
                      : 'bg-[#1b1025]/90 border-[#3b2a5a] hover:border-[#ff8ecb]/40'
                  }`}
                >
                  {/* 顶栏元信息 */}
                  <div className="flex items-center justify-between gap-1.5 pb-2 border-b border-[#3b2a5a]/60">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] border ${layerInfo.badgeClass}`}>
                        {layerInfo.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] border flex items-center gap-1 ${sourceInfo.colorClass}`}>
                        <span>{sourceInfo.iconText}</span>
                        <span>{sourceInfo.label}</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] border ${typeInfo.badgeClass}`}>
                        {typeInfo.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleToggleImportant(mem, e)}
                        className={`p-1 rounded-lg transition-transform jelly-btn ${
                          isCoreOrImportant ? 'text-rose-400 hover:scale-110' : 'text-[#b7a2d9]/40 hover:text-rose-400'
                        }`}
                        title={isCoreOrImportant ? '取消重要标记' : '标记为重要记忆'}
                      >
                        <Star className={`w-4 h-4 ${isCoreOrImportant ? 'fill-rose-400 stroke-rose-400' : ''}`} />
                      </button>
                      <span className="text-[10px] text-[#b7a2d9]/60 font-mono">
                        {formatDateTime(mem.timestamp)}
                      </span>
                    </div>
                  </div>

                  {/* 中间正文 */}
                  <div className="py-2.5">
                    <p className="text-xs text-[#f7d6e8] leading-relaxed break-words font-sans">
                      {mem.content}
                    </p>
                  </div>

                  {/* 底栏: 涉及人物、标签与快捷按钮 */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#3b2a5a]/40 text-[10px] text-[#b7a2d9]">
                    <div className="flex items-center gap-1.5 truncate">
                      <div className="flex items-center gap-1 bg-[#150d1e] px-2 py-0.5 rounded-lg border border-[#4b3670]/50 shrink-0">
                        <Users className="w-3 h-3 text-[#ff8ecb]" />
                        <span className="text-[#f7d6e8] font-bold truncate max-w-[80px]">
                          {mem.characterName || (mem.characters && mem.characters[0]) || activeCharacter?.name || '软软'}
                        </span>
                      </div>

                      {mem.tags && mem.tags.length > 0 && (
                        <div className="flex items-center gap-1 truncate">
                          {mem.tags.slice(0, 2).map((t, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded-md bg-[#251636] text-[#b7a2d9] border border-[#4b3670]/40 text-[9px] truncate"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => handleOpenEditModal(mem, e)}
                        className="p-1 text-[#b7a2d9] hover:text-[#ff8ecb] jelly-btn"
                        title="编辑"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteMemory(mem.id, e)}
                        className="p-1 text-[#b7a2d9] hover:text-red-400 jelly-btn"
                        title="删除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 5. 记忆详情弹窗 */}
      {viewingMemory && (
        <div
          onClick={() => setViewingMemory(null)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-[#1e1329] border-2 border-[#ff8ecb]/70 shadow-[0_8px_32px_rgba(255,142,203,0.35)] p-4 flex flex-col gap-3.5 text-[#f7d6e8] max-h-[88vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#3b2a5a]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#2e173e] border border-[#ff8ecb] flex items-center justify-center text-[#ff8ecb]">
                  <PixelIconMemory className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1">
                    <span>记忆详情档案</span>
                    <PixelSparkle className="w-3.5 h-3.5 text-[#ff8ecb]" />
                  </h3>
                  <span className="text-[10px] text-[#b7a2d9] font-mono">
                    ID: {viewingMemory.id.slice(0, 14)}...
                  </span>
                </div>
              </div>
              <button onClick={() => setViewingMemory(null)} className="p-1.5 rounded-full hover:bg-white/10 text-[#b7a2d9] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-[#170c20] border border-[#3b2a5a] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#b7a2d9] text-[11px]">记忆分层：</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] border ${LAYER_MAP[viewingMemory.layer].badgeClass}`}>
                  {LAYER_MAP[viewingMemory.layer].label}
                </span>
              </div>
              <p className="text-[10px] text-[#b7a2d9]/70 leading-relaxed font-sans">
                {LAYER_MAP[viewingMemory.layer].desc}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#150d1e] border border-[#3b2a5a]/70 space-y-0.5">
                <span className="text-[10px] text-[#b7a2d9]">数据来源</span>
                <div className="font-bold text-[#f7d6e8] flex items-center gap-1">
                  <span>{SOURCE_MAP[viewingMemory.source]?.iconText}</span>
                  <span>{SOURCE_MAP[viewingMemory.source]?.label}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#150d1e] border border-[#3b2a5a]/70 space-y-0.5">
                <span className="text-[10px] text-[#b7a2d9]">记忆类型</span>
                <div className="font-bold text-[#ff8ecb]">
                  {TYPE_MAP[viewingMemory.type]?.label}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#150d1e] border border-[#3b2a5a]/70 space-y-0.5">
                <span className="text-[10px] text-[#b7a2d9]">重要程度</span>
                <div className="font-bold text-rose-300 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-rose-300" />
                  <span>
                    {viewingMemory.importance === 'core'
                      ? '核心记忆'
                      : viewingMemory.importance === 'important'
                      ? '重要记忆'
                      : '普通记忆'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#150d1e] border border-[#3b2a5a]/70 space-y-0.5">
                <span className="text-[10px] text-[#b7a2d9]">发生时间</span>
                <div className="font-bold text-[#f7d6e8] text-[11px]">
                  {formatDateTime(viewingMemory.timestamp)}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-[#b7a2d9] font-bold">记忆正文内容：</span>
              <div className="p-3 rounded-2xl bg-[#140a1c] border border-[#ff8ecb]/30 text-xs text-[#f7d6e8] leading-relaxed break-words font-sans">
                {viewingMemory.content}
              </div>
            </div>

            {viewingMemory.tags && viewingMemory.tags.length > 0 && (
              <div className="space-y-1">
                <span className="text-[11px] text-[#b7a2d9] font-bold">检索标签：</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {viewingMemory.tags.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-lg bg-[#251535] border border-[#4b3670] text-[#ff8ecb] text-[10px]">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-[#3b2a5a] grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  const target = viewingMemory;
                  setViewingMemory(null);
                  handleOpenEditModal(target);
                }}
                className="py-2 rounded-xl bg-[#261536] border border-[#4b3670] text-xs font-bold text-[#f7d6e8] hover:border-[#ff8ecb] flex items-center justify-center gap-1 jelly-btn"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#ff8ecb]" />
                <span>编辑</span>
              </button>

              <button
                onClick={() => handleToggleImportant(viewingMemory)}
                className={`py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 jelly-btn ${
                  viewingMemory.isImportant || viewingMemory.importance !== 'normal'
                    ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                    : 'bg-[#261536] border-[#4b3670] text-[#b7a2d9] hover:text-rose-300'
                }`}
              >
                <Star className="w-3.5 h-3.5" />
                <span>{viewingMemory.isImportant || viewingMemory.importance !== 'normal' ? '已标记重要' : '标记重要'}</span>
              </button>

              <button
                onClick={() => handleDeleteMemory(viewingMemory.id)}
                className="py-2 rounded-xl bg-red-500/10 border border-red-500/40 text-xs font-bold text-red-400 hover:bg-red-500/20 flex items-center justify-center gap-1 jelly-btn"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>删除</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. 编辑/新增记忆弹窗 */}
      {(isAddingNew || editingMemory) && (
        <div
          onClick={() => {
            setIsAddingNew(false);
            setEditingMemory(null);
          }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-[#1e1329] border-2 border-[#ff8ecb]/80 shadow-[0_8px_32px_rgba(255,142,203,0.35)] p-4 flex flex-col gap-3 text-[#f7d6e8] max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#3b2a5a]">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <PixelIconMemory className="w-4 h-4" />
                <span>{editingMemory ? '编辑记忆内容' : `记录关于「${activeCharacter?.name}」的新记忆`}</span>
              </h3>
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingMemory(null);
                }}
                className="p-1 rounded-full text-[#b7a2d9] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 记忆分层与重要程度 */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] text-[#b7a2d9] font-bold">记忆分层：</label>
                <select
                  value={formLayer}
                  onChange={(e) => setFormLayer(e.target.value as MemoryLayer)}
                  className="w-full p-2 rounded-xl bg-[#150d1e] border border-[#3b2a5a] text-xs text-[#f7d6e8] focus:border-[#ff8ecb] focus:outline-none"
                >
                  <option value="long_term" className="bg-[#1e1329]">第三层 · 长期记忆</option>
                  <option value="periodic" className="bg-[#1e1329]">第二层 · 阶段总结</option>
                  <option value="raw" className="bg-[#1e1329]">第一层 · 原始记录</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-[#b7a2d9] font-bold">重要程度：</label>
                <select
                  value={formImportance}
                  onChange={(e) => setFormImportance(e.target.value as MemoryImportance)}
                  className="w-full p-2 rounded-xl bg-[#150d1e] border border-[#3b2a5a] text-xs text-[#f7d6e8] focus:border-[#ff8ecb] focus:outline-none"
                >
                  <option value="core" className="bg-[#1e1329]">核心 (最高优先级)</option>
                  <option value="important" className="bg-[#1e1329]">重要 (安全保留)</option>
                  <option value="normal" className="bg-[#1e1329]">普通</option>
                </select>
              </div>
            </div>

            {/* 记忆类型与来源 */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] text-[#b7a2d9] font-bold">记忆类型：</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as MemoryType)}
                  className="w-full p-2 rounded-xl bg-[#150d1e] border border-[#3b2a5a] text-xs text-[#f7d6e8] focus:border-[#ff8ecb] focus:outline-none"
                >
                  <option value="promise" className="bg-[#1e1329]">重要约定</option>
                  <option value="relation" className="bg-[#1e1329]">关系羁绊</option>
                  <option value="chat" className="bg-[#1e1329]">聊天对话</option>
                  <option value="offline" className="bg-[#1e1329]">线下经历</option>
                  <option value="moments" className="bg-[#1e1329]">空间动态</option>
                  <option value="event" className="bg-[#1e1329]">生活事件</option>
                  <option value="other" className="bg-[#1e1329]">其他记录</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-[#b7a2d9] font-bold">数据来源：</label>
                <select
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value as MemorySource)}
                  className="w-full p-2 rounded-xl bg-[#150d1e] border border-[#3b2a5a] text-xs text-[#f7d6e8] focus:border-[#ff8ecb] focus:outline-none"
                >
                  <option value="manual" className="bg-[#1e1329]">用户手记</option>
                  <option value="qq" className="bg-[#1e1329]">QQ 聊天</option>
                  <option value="moments" className="bg-[#1e1329]">朋友圈动态</option>
                  <option value="offline" className="bg-[#1e1329]">线下事件</option>
                  <option value="system" className="bg-[#1e1329]">系统记录</option>
                  <option value="other" className="bg-[#1e1329]">其他</option>
                </select>
              </div>
            </div>

            {/* 记忆正文 */}
            <div className="space-y-1">
              <label className="text-[11px] text-[#b7a2d9] font-bold">
                记忆内容描述：
              </label>
              <textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="例如：约定了放学后一起去自动贩卖机喝限定草莓气泡水..."
                rows={4}
                className="w-full p-2.5 rounded-2xl bg-[#150d1e] border border-[#3b2a5a] text-xs text-[#f7d6e8] placeholder-[#b7a2d9]/40 focus:border-[#ff8ecb] focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* 检索标签 */}
            <div className="space-y-1">
              <label className="text-[11px] text-[#b7a2d9] font-bold">标签 (逗号分隔)：</label>
              <input
                type="text"
                value={formTagsStr}
                onChange={(e) => setFormTagsStr(e.target.value)}
                placeholder="约定, 贩卖机, 草莓药水"
                className="w-full p-2 rounded-xl bg-[#150d1e] border border-[#3b2a5a] text-xs text-[#f7d6e8] focus:border-[#ff8ecb] focus:outline-none"
              />
            </div>

            <div className="pt-2 border-t border-[#3b2a5a] flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingMemory(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#261536] border border-[#4b3670] text-xs text-[#b7a2d9] hover:text-white"
              >
                取消
              </button>
              <button
                onClick={handleSaveForm}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] font-bold text-xs jelly-btn shadow-md"
              >
                保存记忆
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. 记忆整理报告弹窗 */}
      {consolidationReport && (
        <div
          onClick={() => setConsolidationReport(null)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-[#1e1329] border-2 border-[#ff8ecb] shadow-[0_8px_32px_rgba(255,142,203,0.35)] p-5 flex flex-col items-center gap-3.5 text-center text-[#f7d6e8]"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white flex items-center justify-center gap-1.5">
                <span>记忆中枢整理完成</span>
                <PixelSparkle className="w-4 h-4 text-[#ff8ecb]" />
              </h3>
              <p className="text-[11px] text-[#b7a2d9] mt-1 leading-relaxed">
                三层记忆架构已自动归纳，重复事项已去重合并。
              </p>
            </div>

            <div className="w-full p-3 rounded-2xl bg-[#150d1e] border border-[#3b2a5a] text-xs text-left leading-relaxed text-[#f7d6e8]/90">
              {consolidationReport}
            </div>

            <button
              onClick={() => setConsolidationReport(null)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] font-bold text-xs jelly-btn shadow-md"
            >
              我知道了
            </button>
          </div>
        </div>
      )}

      {/* 底部轻提示 Toast */}
      {toastMsg && (
        <div className="fixed bottom-10 left-6 right-6 z-50 flex justify-center pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="bg-[#1e1329]/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#ff8ecb] shadow-[0_4px_24px_rgba(255,142,203,0.4)] text-xs text-[#f7d6e8] font-mono flex items-center gap-1.5">
            <PixelSparkle className="w-3.5 h-3.5 text-[#ff8ecb]" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}
    </div>
  );
};
