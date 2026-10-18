import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  Plus,
  BookOpen,
  Edit2,
  Trash2,
  Globe,
  User,
  Download,
  Upload,
  Copy,
  Sparkles,
  Key,
  Check,
  X,
  FileCode,
  Power,
  Layers,
  BookText,
  Lightbulb,
  Zap,
  Wand2,
} from 'lucide-react';
import { ApiConfig, CharacterPersona, WorldBook, WorldBookEntry, WorldBookItem } from '../types/phone';
import { PixelBow, PixelSparkle } from './PixelAssets';
import { PRESET_WORLDBOOK_TEMPLATES } from '../utils/storage';
import { polishWorldBookEntryWithAI, friendlyError } from '../utils/aiService';

interface WorldBookAppProps {
  worldbooks: WorldBookItem[];
  onSaveWorldbooks: (list: WorldBookItem[]) => void;
  activeApi?: ApiConfig;
  personas?: CharacterPersona[];
  onBack: () => void;
  subPage?: string;
  onNavigateSub?: (sub: string, params?: any) => void;
  currentTheme?: string;
}

export const WorldBookApp: React.FC<WorldBookAppProps> = ({
  worldbooks,
  onSaveWorldbooks,
  activeApi,
  personas = [],
  onBack,
  currentTheme = 'sky',
}) => {
  const isAqua = currentTheme === 'aqua_pixel';
  // 分类仅分为：全局 (global) 和 局部 (local)
  const [activeTab, setActiveTab] = useState<'global' | 'local'>('global');

  // 当前打开查看/管理词条的世界书 ID (null 表示在世界书列表主页)
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  // 搜索关键字
  const [searchQuery, setSearchQuery] = useState('');

  // 弹窗状态
  const [showBookModal, setShowBookModal] = useState(false); // 创建/编辑整本世界书弹窗
  const [editingBook, setEditingBook] = useState<WorldBook | null>(null);

  const [showEntryModal, setShowEntryModal] = useState(false); // 添加/编辑词条弹窗
  const [editingEntry, setEditingEntry] = useState<WorldBookEntry | null>(null);
  const [targetBookForEntry, setTargetBookForEntry] = useState<WorldBook | null>(null);

  const [showTemplateModal, setShowTemplateModal] = useState(false); // 灵感模板库
  const [showImportExportModal, setShowImportExportModal] = useState(false); // 导入导出
  const [importExportTab, setImportExportTab] = useState<'export' | 'import'>('export');
  const [importText, setImportText] = useState('');

  const [showTesterModal, setShowTesterModal] = useState(false); // 关键词触发模拟测试
  const [testSentence, setTestSentence] = useState('今天我们去逛街吃草莓可丽饼，顺便买个烤小鱼干！');

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 世界书表单状态
  const [bookFormName, setBookFormName] = useState('');
  const [bookFormDesc, setBookFormDesc] = useState('');
  const [bookFormScope, setBookFormScope] = useState<'global' | 'local'>('global');
  const [bookFormBoundCharIds, setBookFormBoundCharIds] = useState<string[]>([]);
  const [bookFormIsEnabled, setBookFormIsEnabled] = useState(true);

  // 词条表单状态 (支持：1. 常驻开; 2. 关键词触发; 3. 常驻+关键词 三种模式)
  const [entryFormName, setEntryFormName] = useState('');
  const [entryFormContent, setEntryFormContent] = useState('');
  const [entryFormActivationType, setEntryFormActivationType] = useState<'always' | 'keyword' | 'both'>('always');
  const [entryFormTriggerKeys, setEntryFormTriggerKeys] = useState('');
  const [entryFormPriority, setEntryFormPriority] = useState(80);
  const [entryFormIsEnabled, setEntryFormIsEnabled] = useState(true);
  const [entryFormComment, setEntryFormComment] = useState('');

  // AI 润色状态
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishPreview, setPolishPreview] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2200);
  };

  // 全局与局部世界书统计
  const globalBooks = worldbooks.filter((b) => b.scope === 'global');
  const localBooks = worldbooks.filter((b) => b.scope === 'local');

  const globalEntriesCount = globalBooks.reduce(
    (acc, b) => acc + (Array.isArray(b.entries) ? b.entries.length : 0),
    0
  );
  const localEntriesCount = localBooks.reduce(
    (acc, b) => acc + (Array.isArray(b.entries) ? b.entries.length : 0),
    0
  );

  // 当前分类下的世界书列表
  const currentBooks = (activeTab === 'global' ? globalBooks : localBooks).filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = b.name.toLowerCase().includes(q);
    const descMatch = (b.description || '').toLowerCase().includes(q);
    const entryMatch = b.entries?.some(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.content.toLowerCase().includes(q) ||
        e.triggerKeys?.some((k) => k.toLowerCase().includes(q))
    );
    return nameMatch || descMatch || entryMatch;
  });

  // 当前打开的世界书
  const currentSelectedBook = worldbooks.find((b) => b.id === selectedBookId) || null;

  // 获取绑定角色的名称说明
  const getBoundCharNames = (ids?: string[]) => {
    if (!ids || ids.length === 0) return '未限定（对所有角色生效）';
    const names = ids
      .map((id) => personas.find((c) => c.id === id)?.name)
      .filter(Boolean);
    return names.length > 0 ? names.join('、') : '专属角色';
  };

  // ===== 1. 整本世界书管理 =====

  // 打开创建世界书弹窗
  const handleOpenCreateBook = () => {
    setEditingBook(null);
    setBookFormName('');
    setBookFormDesc('');
    setBookFormScope(activeTab);
    setBookFormBoundCharIds([]);
    setBookFormIsEnabled(true);
    setShowBookModal(true);
  };

  // 打开编辑世界书弹窗
  const handleOpenEditBook = (book: WorldBook, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingBook(book);
    setBookFormName(book.name);
    setBookFormDesc(book.description || '');
    setBookFormScope(book.scope);
    setBookFormBoundCharIds(book.boundCharacterIds || []);
    setBookFormIsEnabled(book.isEnabled !== false);
    setShowBookModal(true);
  };

  // 保存世界书 (新建/编辑)
  const handleSaveBook = () => {
    if (!bookFormName.trim()) {
      alert('请填写世界书名称');
      return;
    }

    if (editingBook) {
      const next = worldbooks.map((b) => {
        if (b.id === editingBook.id) {
          return {
            ...b,
            name: bookFormName.trim(),
            description: bookFormDesc.trim() || undefined,
            scope: bookFormScope,
            boundCharacterIds: bookFormScope === 'local' ? bookFormBoundCharIds : undefined,
            isEnabled: bookFormIsEnabled,
          };
        }
        return b;
      });
      onSaveWorldbooks(next);
      triggerToast('世界书已更新 ✦');
    } else {
      const newBook: WorldBook = {
        id: 'wb_' + Date.now(),
        name: bookFormName.trim(),
        description: bookFormDesc.trim() || undefined,
        scope: bookFormScope,
        boundCharacterIds: bookFormScope === 'local' ? bookFormBoundCharIds : undefined,
        isEnabled: bookFormIsEnabled,
        entries: [],
        createdAt: Date.now(),
      };
      onSaveWorldbooks([newBook, ...worldbooks]);
      // 自动切入新建的书
      setSelectedBookId(newBook.id);
      triggerToast('新世界书已创建，现在可以添加词条啦 ✦');
    }
    setShowBookModal(false);
  };

  // 切换整本书的启用开关
  const handleToggleBookEnable = (bookId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const next = worldbooks.map((b) =>
      b.id === bookId ? { ...b, isEnabled: b.isEnabled === false ? true : false } : b
    );
    onSaveWorldbooks(next);
  };

  // 复制整本书
  const handleDuplicateBook = (book: WorldBook, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const cloned: WorldBook = {
      ...book,
      id: 'wb_' + Date.now(),
      name: `${book.name} (副本)`,
      entries: (book.entries || []).map((e, idx) => ({
        ...e,
        id: `entry_${Date.now()}_${idx}`,
      })),
      createdAt: Date.now(),
    };
    onSaveWorldbooks([cloned, ...worldbooks]);
    triggerToast('已创建整本世界书副本 ✦');
  };

  // 删除整本书
  const handleDeleteBook = (bookId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('确认删除整本世界书吗？其内部的所有词条也将一并被移除。')) {
      const next = worldbooks.filter((b) => b.id !== bookId);
      onSaveWorldbooks(next);
      if (selectedBookId === bookId) {
        setSelectedBookId(null);
      }
      triggerToast('世界书已删除');
    }
  };

  // ===== 2. 词条管理 (在世界书里面加词条) =====

  // 打开添加词条弹窗
  const handleOpenAddEntry = (book: WorldBook, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setTargetBookForEntry(book);
    setEditingEntry(null);
    setEntryFormName('');
    setEntryFormContent('');
    setEntryFormActivationType('always');
    setEntryFormTriggerKeys('');
    setEntryFormPriority(80);
    setEntryFormIsEnabled(true);
    setEntryFormComment('');
    setPolishPreview(null);
    setShowEntryModal(true);
  };

  // 打开编辑词条弹窗
  const handleOpenEditEntry = (book: WorldBook, entry: WorldBookEntry, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setTargetBookForEntry(book);
    setEditingEntry(entry);
    setEntryFormName(entry.name);
    setEntryFormContent(entry.content);
    setEntryFormActivationType(entry.activationType || 'always');
    setEntryFormTriggerKeys((entry.triggerKeys || []).join(' '));
    setEntryFormPriority(entry.priority ?? 80);
    setEntryFormIsEnabled(entry.isEnabled !== false);
    setEntryFormComment(entry.comment || '');
    setPolishPreview(null);
    setShowEntryModal(true);
  };

  // AI 辅助润色设定正文
  const handlePolishEntry = async () => {
    if (!activeApi) {
      alert('请先在桌面「设置」中开启或配置 AI 服务，才能使用 AI 润色功能。');
      return;
    }
    if (!entryFormName.trim() && !entryFormContent.trim()) {
      alert('请先填写词条标题或简要设定内容草稿。');
      return;
    }

    setIsPolishing(true);
    try {
      const polished = await polishWorldBookEntryWithAI(
        entryFormName.trim(),
        entryFormContent.trim(),
        activeApi,
        targetBookForEntry?.name
      );
      setPolishPreview(polished.trim());
    } catch (e: any) {
      alert('AI 润色失败：' + friendlyError(e));
    } finally {
      setIsPolishing(false);
    }
  };

  // 采纳润色内容替换
  const handleApplyPolish = () => {
    if (polishPreview) {
      setEntryFormContent(polishPreview);
      setPolishPreview(null);
      triggerToast('已采纳 AI 润色设定 ✦');
    }
  };

  // 保存词条 (新建/编辑)
  const handleSaveEntry = () => {
    if (!targetBookForEntry) return;
    if (!entryFormName.trim() || !entryFormContent.trim()) {
      alert('请填写词条标题和设定内容');
      return;
    }

    const rawKeys = entryFormTriggerKeys
      .split(/[,，\s]+/)
      .map((k) => k.trim())
      .filter(Boolean);

    const next = worldbooks.map((b) => {
      if (b.id === targetBookForEntry.id) {
        const currentEntries = Array.isArray(b.entries) ? [...b.entries] : [];

        if (editingEntry) {
          // 更新词条
          const updatedEntries = currentEntries.map((e) => {
            if (e.id === editingEntry.id) {
              return {
                ...e,
                name: entryFormName.trim(),
                content: entryFormContent.trim(),
                activationType: entryFormActivationType,
                triggerKeys:
                  entryFormActivationType === 'keyword' || entryFormActivationType === 'both'
                    ? rawKeys
                    : undefined,
                priority: entryFormPriority,
                isEnabled: entryFormIsEnabled,
                comment: entryFormComment.trim() || undefined,
              };
            }
            return e;
          });
          return { ...b, entries: updatedEntries };
        } else {
          // 新增词条
          const newEntry: WorldBookEntry = {
            id: 'entry_' + Date.now(),
            name: entryFormName.trim(),
            content: entryFormContent.trim(),
            activationType: entryFormActivationType,
            triggerKeys:
              entryFormActivationType === 'keyword' || entryFormActivationType === 'both'
                ? rawKeys
                : undefined,
            priority: entryFormPriority,
            isEnabled: entryFormIsEnabled,
            comment: entryFormComment.trim() || undefined,
            createdAt: Date.now(),
          };
          return { ...b, entries: [newEntry, ...currentEntries] };
        }
      }
      return b;
    });

    onSaveWorldbooks(next);
    setShowEntryModal(false);
    triggerToast(editingEntry ? '词条已更新 ✦' : '新词条已添加至世界书 ✦');
  };

  // 切换单个词条的启用开关
  const handleToggleEntryEnable = (bookId: string, entryId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const next = worldbooks.map((b) => {
      if (b.id === bookId) {
        const updated = (b.entries || []).map((e) =>
          e.id === entryId ? { ...e, isEnabled: e.isEnabled === false ? true : false } : e
        );
        return { ...b, entries: updated };
      }
      return b;
    });
    onSaveWorldbooks(next);
  };

  // 复制词条
  const handleDuplicateEntry = (bookId: string, entry: WorldBookEntry, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const next = worldbooks.map((b) => {
      if (b.id === bookId) {
        const cloned: WorldBookEntry = {
          ...entry,
          id: 'entry_' + Date.now(),
          name: `${entry.name} (副本)`,
          createdAt: Date.now(),
        };
        return { ...b, entries: [cloned, ...(b.entries || [])] };
      }
      return b;
    });
    onSaveWorldbooks(next);
    triggerToast('词条副本已创建 ✦');
  };

  // 删除词条
  const handleDeleteEntry = (bookId: string, entryId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('确认删除该词条吗？')) {
      const next = worldbooks.map((b) => {
        if (b.id === bookId) {
          return { ...b, entries: (b.entries || []).filter((e) => e.id !== entryId) };
        }
        return b;
      });
      onSaveWorldbooks(next);
      triggerToast('词条已删除');
    }
  };

  // ===== 3. 灵感模板库导入 =====
  const handleImportTemplate = (tpl: WorldBook) => {
    const isExisted = worldbooks.some((w) => w.name === tpl.name);
    const newBook: WorldBook = {
      ...tpl,
      id: 'wb_tpl_' + Date.now(),
      name: isExisted ? `${tpl.name} (导入)` : tpl.name,
      entries: (tpl.entries || []).map((e, idx) => ({
        ...e,
        id: `entry_tpl_${Date.now()}_${idx}`,
      })),
      createdAt: Date.now(),
    };

    onSaveWorldbooks([newBook, ...worldbooks]);
    setShowTemplateModal(false);
    setSelectedBookId(newBook.id);
    setActiveTab(newBook.scope);
    triggerToast(`已成功导入整本世界书《${newBook.name}》✦`);
  };

  // ===== 4. 导出与导入 JSON =====
  const handleExportJson = () => {
    const jsonStr = JSON.stringify(worldbooks, null, 2);
    navigator.clipboard.writeText(jsonStr);
    triggerToast('已复制全部世界书及词条配置 (JSON) 到剪贴板 📋');
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(worldbooks, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `worldbooks_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('已下载世界书 JSON 文件 💾');
  };

  const handleImportJson = () => {
    if (!importText.trim()) {
      alert('请先粘贴世界书 JSON 数据');
      return;
    }
    try {
      const parsed = JSON.parse(importText);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      if (items.length === 0) throw new Error('数据为空');

      const validated: WorldBook[] = items.map((it: any, idx: number) => ({
        id: 'wb_import_' + Date.now() + '_' + idx,
        name: String(it.name || '导入世界书'),
        description: it.description ? String(it.description) : undefined,
        scope: it.scope === 'local' ? 'local' : 'global',
        boundCharacterIds: Array.isArray(it.boundCharacterIds) ? it.boundCharacterIds : undefined,
        isEnabled: it.isEnabled !== false,
        entries: Array.isArray(it.entries)
          ? it.entries.map((e: any, eIdx: number) => ({
              id: `entry_imp_${Date.now()}_${idx}_${eIdx}`,
              name: String(e.name || '未命名词条'),
              content: String(e.content || ''),
              activationType:
                e.activationType === 'keyword' || e.activationType === 'both'
                  ? e.activationType
                  : 'always',
              triggerKeys: Array.isArray(e.triggerKeys) ? e.triggerKeys : [],
              priority: typeof e.priority === 'number' ? e.priority : 80,
              comment: e.comment ? String(e.comment) : undefined,
              isEnabled: e.isEnabled !== false,
              createdAt: Date.now(),
            }))
          : it.content
          ? [
              {
                id: `entry_imp_${Date.now()}_${idx}_0`,
                name: String(it.name || '设定内容'),
                content: String(it.content),
                activationType: 'always',
                triggerKeys: Array.isArray(it.triggerKeys) ? it.triggerKeys : [],
                priority: typeof it.priority === 'number' ? it.priority : 80,
                isEnabled: it.isEnabled !== false,
                createdAt: Date.now(),
              },
            ]
          : [],
        createdAt: Date.now(),
      }));

      onSaveWorldbooks([...validated, ...worldbooks]);
      setShowImportExportModal(false);
      setImportText('');
      triggerToast(`成功导入 ${validated.length} 本世界书 ✦`);
    } catch (e: any) {
      alert('导入失败，请检查 JSON 格式：' + e.message);
    }
  };

  // 切换角色勾选 (局部世界书绑定)
  const handleToggleCharId = (id: string) => {
    setBookFormBoundCharIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // ================= RENDER =================

  return (
    <div
      className={`flex-1 flex flex-col select-none overflow-hidden relative font-mono transition-colors duration-200 ${
        isAqua
          ? 'bg-gradient-to-b from-[#f0f9ff] via-[#e0f2fe] to-[#bae6fd] text-[#0369a1]'
          : 'bg-gradient-to-b from-[#180f21] via-[#120b18] to-[#0a050e] text-[#f7d6e8]'
      }`}
    >
      {/* 顶部标题导航栏 */}
      <div
        className={`h-12 px-4 flex items-center justify-between border-b backdrop-blur-md z-20 shrink-0 transition-colors ${
          isAqua
            ? 'bg-[#e0f2fe]/95 border-[#7dd3fc]/60 text-[#0369a1]'
            : 'bg-[#1e1328]/95 border-[#3b2a5a] text-[#f7d6e8]'
        }`}
      >
        <button
          onClick={() => {
            if (selectedBookId) {
              setSelectedBookId(null);
            } else {
              onBack();
            }
          }}
          className={`p-1.5 jelly-btn flex items-center gap-1 text-xs transition-colors ${
            isAqua ? 'text-[#0284c7] hover:text-[#0369a1]' : 'text-[#d88fbf] hover:text-white'
          }`}
          title={selectedBookId ? '返回世界书列表' : '返回桌面'}
        >
          <ArrowLeft className="w-5 h-5 stroke-[2]" />
          {selectedBookId && <span className="hidden sm:inline">世界书列表</span>}
        </button>

        <div className="flex items-center gap-1.5 text-sm font-bold">
          <BookOpen className={`w-4 h-4 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`} />
          <span className={isAqua ? 'text-[#0c4a6e]' : 'text-[#f7d6e8]'}>
            {selectedBookId && currentSelectedBook
              ? `《${currentSelectedBook.name}》`
              : '世界书 · 设定宝典'}
          </span>
          <PixelBow className="w-5 h-5 drop-shadow-sm" />
        </div>

        <div className="flex items-center gap-1.5">
          {!selectedBookId && (
            <>
              <button
                onClick={() => setShowTemplateModal(true)}
                className={`p-1.5 rounded-lg border jelly-btn ${
                  isAqua
                    ? 'border-[#7dd3fc] bg-[#e0f2fe] text-[#0284c7] hover:bg-white'
                    : 'border-[#4b3670] bg-[#221430] text-[#ff8ecb] hover:text-white'
                }`}
                title="精选世界书模板灵感库"
              >
                <Lightbulb className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowTesterModal(true)}
                className={`p-1.5 rounded-lg border jelly-btn ${
                  isAqua
                    ? 'border-[#7dd3fc] bg-[#e0f2fe] text-[#0284c7] hover:bg-white'
                    : 'border-[#4b3670] bg-[#221430] text-[#d88fbf] hover:text-white'
                }`}
                title="关键词触发测试器"
              >
                <Key className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowImportExportModal(true)}
                className={`p-1.5 rounded-lg border jelly-btn ${
                  isAqua
                    ? 'border-[#7dd3fc] bg-[#e0f2fe] text-[#0284c7] hover:bg-white'
                    : 'border-[#4b3670] bg-[#221430] text-[#d88fbf] hover:text-white'
                }`}
                title="导入 / 导出"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleOpenCreateBook}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 hover:opacity-90 jelly-btn ${
                  isAqua
                    ? 'bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] text-white shadow-[0_2px_10px_rgba(2,132,199,0.35)]'
                    : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] shadow-[0_2px_10px_rgba(255,142,203,0.35)]'
                }`}
                title="创建整本世界书"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>创建世界书</span>
              </button>
            </>
          )}

          {selectedBookId && currentSelectedBook && (
            <button
              onClick={() => handleOpenAddEntry(currentSelectedBook)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 hover:opacity-90 jelly-btn ${
                isAqua
                  ? 'bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] text-white shadow-[0_2px_10px_rgba(2,132,199,0.35)]'
                  : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] shadow-[0_2px_10px_rgba(255,142,203,0.35)]'
              }`}
              title="为此书添加词条"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>加词条</span>
            </button>
          )}
        </div>
      </div>

      {/* 悬浮 Toast 提示 */}
      {toastMsg && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in duration-200">
          <div
            className={`backdrop-blur-md px-3.5 py-1.5 rounded-xl border text-[11px] flex items-center gap-1.5 ${
              isAqua
                ? 'bg-white/95 border-[#38bdf8] shadow-[0_4px_20px_rgba(56,189,248,0.4)] text-[#0284c7]'
                : 'bg-[#1f132a]/95 border-[#ff8ecb] shadow-[0_4px_20px_rgba(255,142,203,0.4)] text-[#f7d6e8]'
            }`}
          >
            <Sparkles className={`w-3 h-3 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`} />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* ================= 视图 A: 世界书列表主视图 (仅分为全局和局部) ================= */}
      {!selectedBookId ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 纯净双主分类导航栏：只分为 全局 和 局部 */}
          <div
            className={`p-3 border-b shrink-0 space-y-2.5 ${
              isAqua
                ? 'bg-[#e0f2fe]/80 border-[#7dd3fc]/50'
                : 'bg-[#170e22]/90 border-[#3b2a5a]/70'
            }`}
          >
            {/* 分类 Tab 切块：全局 vs 局部 */}
            <div
              className={`grid grid-cols-2 gap-2 p-1 rounded-2xl border shadow-inner ${
                isAqua
                  ? 'bg-[#bae6fd]/50 border-[#7dd3fc]'
                  : 'bg-[#12081a] border-[#3b2a5a]/80'
              }`}
            >
              <button
                onClick={() => setActiveTab('global')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'global'
                    ? isAqua
                      ? 'bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] text-white shadow-[0_2px_12px_rgba(2,132,199,0.35)]'
                      : 'bg-gradient-to-r from-[#7c3aed] to-[#d946ef] text-white shadow-[0_2px_12px_rgba(217,70,239,0.35)]'
                    : isAqua
                    ? 'text-[#0369a1] hover:text-[#0c4a6e] hover:bg-white/50'
                    : 'text-[#b7a2d9] hover:text-white hover:bg-[#1f132a]'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>全局世界书</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full border ${
                    isAqua ? 'bg-black/10 border-black/10' : 'bg-black/30 border-white/20'
                  }`}
                >
                  {globalBooks.length}本 · {globalEntriesCount}条
                </span>
              </button>

              <button
                onClick={() => setActiveTab('local')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'local'
                    ? isAqua
                      ? 'bg-gradient-to-r from-[#0284c7] to-[#38bdf8] text-white shadow-[0_2px_12px_rgba(14,165,233,0.35)]'
                      : 'bg-gradient-to-r from-[#f59e0b] to-[#ec4899] text-white shadow-[0_2px_12px_rgba(236,72,153,0.35)]'
                    : isAqua
                    ? 'text-[#0369a1] hover:text-[#0c4a6e] hover:bg-white/50'
                    : 'text-[#b7a2d9] hover:text-white hover:bg-[#1f132a]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>局部世界书</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full border ${
                    isAqua ? 'bg-black/10 border-black/10' : 'bg-black/30 border-white/20'
                  }`}
                >
                  {localBooks.length}本 · {localEntriesCount}条
                </span>
              </button>
            </div>

            {/* 搜索与分类说明 */}
            <div className="flex items-center gap-2">
              <div
                className={`flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-inner ${
                  isAqua
                    ? 'bg-white border-[#7dd3fc]'
                    : 'bg-[#1f132a] border-[#4b3670]'
                }`}
              >
                <Search className={`w-3.5 h-3.5 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`搜索${activeTab === 'global' ? '全局' : '局部'}世界书或词条内容...`}
                  className={`flex-1 text-xs bg-transparent focus:outline-none ${
                    isAqua
                      ? 'text-[#0c4a6e] placeholder-[#0284c7]/50'
                      : 'text-[#f7d6e8] placeholder-[#b7a2d9]/50'
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className={isAqua ? 'text-[#0284c7] hover:text-[#0c4a6e]' : 'text-[#b7a2d9] hover:text-white'}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 状态说明横幅 */}
            <div
              className={`text-[10px] flex items-center justify-between px-1 ${
                isAqua ? 'text-[#0369a1]/80' : 'text-[#b7a2d9]/70'
              }`}
            >
              <span>
                {activeTab === 'global'
                  ? '🌐 全局世界书对所有通讯录角色通用生效。可在书内组织属于该分类的设定词条。'
                  : '👤 局部世界书仅对绑定的指定角色生效（如软软专属日记、猫咪习性）。'}
              </span>
            </div>
          </div>

          {/* 世界书列表区 */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {currentBooks.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-[#b7a2d9] text-xs">
                <BookOpen className="w-12 h-12 stroke-[1.2] text-[#d88fbf]/30 mb-3" />
                <span>当前分类下暂无世界书</span>
                <p className="text-[10px] text-[#b7a2d9]/60 mt-1">
                  创建整本世界书后，即可在里面添加具体的设定词条
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={handleOpenCreateBook}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] font-bold text-xs jelly-btn"
                  >
                    + 创建{activeTab === 'global' ? '全局' : '局部'}世界书
                  </button>
                  <button
                    onClick={() => setShowTemplateModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#251535] border border-[#4b3670] text-[#ff8ecb] text-xs font-bold jelly-btn"
                  >
                    浏览精选模板库
                  </button>
                </div>
              </div>
            ) : (
              currentBooks.map((book) => {
                const isEnabled = book.isEnabled !== false;
                const entriesCount = Array.isArray(book.entries) ? book.entries.length : 0;
                const activeEntriesCount = Array.isArray(book.entries)
                  ? book.entries.filter((e) => e.isEnabled !== false).length
                  : 0;

                return (
                    <div
                      key={book.id}
                      onClick={() => setSelectedBookId(book.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isEnabled
                          ? isAqua
                            ? 'bg-white/90 border-[#7dd3fc] shadow-[0_4px_20px_rgba(56,189,248,0.2)] hover:border-[#0284c7]'
                            : 'bg-[#221330]/90 border-[#ff8ecb]/70 shadow-[0_4px_20px_rgba(255,142,203,0.15)] hover:border-[#ff8ecb]'
                          : isAqua
                          ? 'bg-[#e0f2fe]/60 border-[#bae6fd] opacity-70 hover:opacity-90'
                          : 'bg-[#160d1f]/75 border-[#3b2a5a] opacity-70 hover:opacity-90'
                      } flex flex-col gap-2.5`}
                    >
                      {/* 顶栏：书名、类别徽标与整本书开关 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          {book.scope === 'global' ? (
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-full border flex items-center gap-1 font-bold ${
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
                              className={`text-[9px] px-2 py-0.5 rounded-full border flex items-center gap-1 font-bold ${
                                isAqua
                                  ? 'bg-amber-100 border-amber-300 text-amber-700'
                                  : 'bg-amber-950/70 border-amber-400/60 text-amber-300'
                              }`}
                            >
                              <User className="w-2.5 h-2.5" />
                              <span>{getBoundCharNames(book.boundCharacterIds)}</span>
                            </span>
                          )}

                          <span
                            className={`text-xs font-bold flex items-center gap-1 ${
                              isAqua ? 'text-[#0c4a6e]' : 'text-white'
                            }`}
                          >
                            <BookText className={`w-3.5 h-3.5 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`} />
                            <span>{book.name}</span>
                          </span>
                        </div>

                        {/* 开关：整本书启用/停用 */}
                        <button
                          onClick={(e) => handleToggleBookEnable(book.id, e)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border transition-all ${
                            isEnabled
                              ? isAqua
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-[0_0_10px_rgba(2,132,199,0.3)]'
                                : 'bg-[#ff8ecb] text-[#1a1120] border-[#ff8ecb] shadow-[0_0_10px_rgba(255,142,203,0.4)]'
                              : isAqua
                              ? 'bg-white text-[#0369a1]/60 border-[#bae6fd]'
                              : 'bg-[#1c1126] text-[#b7a2d9]/60 border-[#4b3670]'
                          }`}
                          title={isEnabled ? '点击停用整本书' : '点击启用整本书'}
                        >
                          <Power className="w-2.5 h-2.5" />
                          <span>{isEnabled ? '整书生效中' : '整书已停用'}</span>
                        </button>
                      </div>

                      {/* 简介描述 */}
                      {book.description && (
                        <p
                          className={`text-[11px] line-clamp-2 leading-relaxed p-2 rounded-xl border ${
                            isAqua
                              ? 'text-[#0369a1] bg-[#f0f9ff] border-[#bae6fd]'
                              : 'text-[#b7a2d9] bg-[#140b1b]/90 border-[#3b2a5a]/50'
                          }`}
                        >
                          {book.description}
                        </p>
                      )}

                      {/* 词条预览小格与操作组 */}
                      <div
                        className={`flex items-center justify-between pt-1 border-t text-[10px] ${
                          isAqua
                            ? 'border-[#bae6fd] text-[#0369a1]'
                            : 'border-[#3b2a5a]/50 text-[#b7a2d9]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex items-center gap-1 font-bold ${
                              isAqua ? 'text-[#0c4a6e]' : 'text-[#f7d6e8]'
                            }`}
                          >
                            <Layers className={`w-3 h-3 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`} />
                            <span>包含 {entriesCount} 个词条</span>
                          </span>
                          <span>·</span>
                          <span className={isAqua ? 'text-[#0369a1]/70' : 'text-[#b7a2d9]/70'}>
                            {activeEntriesCount} 条启用
                          </span>
                        </div>

                        {/* 操作按钮组 */}
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleOpenAddEntry(book, e)}
                            className={`px-2 py-0.5 rounded-lg border flex items-center gap-0.5 jelly-btn ${
                              isAqua
                                ? 'bg-[#e0f2fe] text-[#0284c7] hover:bg-white border-[#7dd3fc]'
                                : 'bg-[#2e1c3e] text-[#ff8ecb] hover:bg-[#3d2452] border-[#ff8ecb]/30'
                            }`}
                            title="为此书加词条"
                          >
                            <Plus className="w-2.5 h-2.5" />
                            <span>加词条</span>
                          </button>
                          <button
                            onClick={(e) => handleDuplicateBook(book, e)}
                            className={`p-1 rounded jelly-btn ${
                              isAqua ? 'hover:text-[#0c4a6e] hover:bg-[#e0f2fe]' : 'hover:text-white hover:bg-[#2e1c3e]'
                            }`}
                            title="复制整本书"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleOpenEditBook(book, e)}
                            className={`p-1 rounded jelly-btn ${
                              isAqua
                                ? 'hover:text-[#0284c7] hover:bg-[#e0f2fe]'
                                : 'hover:text-[#ff8ecb] hover:bg-[#2e1c3e]'
                            }`}
                            title="编辑世界书信息"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteBook(book.id, e)}
                            className={`p-1 rounded jelly-btn ${
                              isAqua
                                ? 'text-[#0369a1] hover:text-rose-600 hover:bg-rose-50'
                                : 'text-[#b7a2d9] hover:text-rose-400 hover:bg-rose-950/40'
                            }`}
                            title="删除世界书"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          <span className={`font-bold text-xs ml-1 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`}>
                            进入 &gt;
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* ================= 视图 B: 世界书内部词条管理视图 (在世界书里面加词条) ================= */
          currentSelectedBook && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* 书目元信息顶栏 */}
              <div
                className={`p-3 border-b shrink-0 space-y-2 ${
                  isAqua
                    ? 'bg-[#e0f2fe]/90 border-[#7dd3fc]/70'
                    : 'bg-[#190e24]/90 border-[#3b2a5a]/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {currentSelectedBook.scope === 'global' ? (
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                          isAqua
                            ? 'bg-[#0284c7]/15 border-[#0284c7]/40 text-[#0284c7]'
                            : 'bg-purple-950 border border-purple-400/60 text-purple-300'
                        }`}
                      >
                        🌐 全局世界书
                      </span>
                    ) : (
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                          isAqua
                            ? 'bg-amber-100 border-amber-300 text-amber-700'
                            : 'bg-amber-950 border border-amber-400/60 text-amber-300'
                        }`}
                      >
                        👤 局部: {getBoundCharNames(currentSelectedBook.boundCharacterIds)}
                      </span>
                    )}

                    <span className={`text-xs font-bold ${isAqua ? 'text-[#0c4a6e]' : 'text-white'}`}>
                      {currentSelectedBook.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenAddEntry(currentSelectedBook)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 jelly-btn shadow-md ${
                        isAqua
                          ? 'bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] text-white'
                          : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120]'
                      }`}
                    >
                      <Plus className="w-3 h-3 stroke-[3]" />
                      <span>添加词条</span>
                    </button>
                    <button
                      onClick={(e) => handleOpenEditBook(currentSelectedBook, e)}
                      className={`p-1.5 rounded-lg border jelly-btn ${
                        isAqua
                          ? 'border-[#7dd3fc] bg-white text-[#0369a1] hover:text-[#0c4a6e]'
                          : 'border-[#4b3670] bg-[#221430] text-[#b7a2d9] hover:text-white'
                      }`}
                      title="编辑书名与绑定"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {currentSelectedBook.description && (
                  <p className={`text-[11px] leading-relaxed ${isAqua ? 'text-[#0369a1]' : 'text-[#b7a2d9]'}`}>
                    {currentSelectedBook.description}
                  </p>
                )}

                {/* 词条统计指示 */}
                <div
                  className={`flex items-center justify-between text-[10px] pt-1 border-t ${
                    isAqua
                      ? 'text-[#0369a1]/80 border-[#7dd3fc]/40'
                      : 'text-[#b7a2d9]/70 border-[#3b2a5a]/40'
                  }`}
                >
                  <span>
                    当前共包含{' '}
                    <b className={isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}>
                      {currentSelectedBook.entries?.length || 0}
                    </b>{' '}
                    条设定词条
                  </span>
                  <span>支持常驻开、关键词触发、常驻+关键词三种机制</span>
                </div>
              </div>

              {/* 词条列表区 */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
                {(!currentSelectedBook.entries || currentSelectedBook.entries.length === 0) ? (
                  <div
                    className={`h-64 flex flex-col items-center justify-center text-xs ${
                      isAqua ? 'text-[#0369a1]' : 'text-[#b7a2d9]'
                    }`}
                  >
                    <Layers
                      className={`w-12 h-12 stroke-[1.2] mb-3 ${
                        isAqua ? 'text-[#0284c7]/40' : 'text-[#d88fbf]/30'
                      }`}
                    />
                    <span>这本书里还没有词条哦</span>
                    <p className={`text-[10px] mt-1 ${isAqua ? 'text-[#0369a1]/60' : 'text-[#b7a2d9]/60'}`}>
                      点击下方按钮，为此世界书添加概念、规则或生活小细节设定
                    </p>
                    <button
                      onClick={() => handleOpenAddEntry(currentSelectedBook)}
                      className={`mt-4 px-4 py-2 rounded-xl font-bold text-xs jelly-btn ${
                        isAqua
                          ? 'bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] text-white shadow-md'
                          : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120]'
                      }`}
                    >
                      + 添加第一条词条
                    </button>
                  </div>
                ) : (
                  currentSelectedBook.entries.map((entry) => {
                    const isEntryEnabled = entry.isEnabled !== false;
                    const isKeyword = entry.activationType === 'keyword';
                    const isBoth = entry.activationType === 'both';

                    return (
                      <div
                        key={entry.id}
                        className={`p-3 rounded-2xl border transition-all ${
                          isEntryEnabled
                            ? isAqua
                              ? 'bg-white/90 border-[#7dd3fc] shadow-[0_2px_12px_rgba(56,189,248,0.15)]'
                              : 'bg-[#221330]/90 border-[#ff8ecb]/60 shadow-[0_2px_12px_rgba(255,142,203,0.12)]'
                            : isAqua
                            ? 'bg-[#e0f2fe]/60 border-[#bae6fd] opacity-75'
                            : 'bg-[#150d1d]/75 border-[#3b2a5a] opacity-75'
                        } flex flex-col gap-2`}
                      >
                        {/* 顶栏：词条名、生效模式与词条开关 */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-wrap">
                            {isKeyword ? (
                              <span
                                className={`text-[9px] px-2 py-0.5 rounded-full border flex items-center gap-0.5 font-bold ${
                                  isAqua
                                    ? 'bg-cyan-100 border-cyan-300 text-cyan-800'
                                    : 'bg-cyan-950/80 border-cyan-400/60 text-cyan-300'
                                }`}
                              >
                                <Key className="w-2.5 h-2.5" />
                                <span>关键词触发</span>
                              </span>
                            ) : isBoth ? (
                              <span
                                className={`text-[9px] px-2 py-0.5 rounded-full border flex items-center gap-0.5 font-bold ${
                                  isAqua
                                    ? 'bg-purple-100 border-purple-300 text-purple-800'
                                    : 'bg-purple-950/80 border-purple-400/60 text-purple-200'
                                }`}
                              >
                                <Zap className="w-2.5 h-2.5 text-amber-500" />
                                <span>常驻+关键词</span>
                              </span>
                            ) : (
                              <span
                                className={`text-[9px] px-2 py-0.5 rounded-full border flex items-center gap-0.5 font-bold ${
                                  isAqua
                                    ? 'bg-sky-100 border-sky-300 text-sky-800'
                                    : 'bg-pink-950/80 border-pink-400/60 text-pink-300'
                                }`}
                              >
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>常驻开</span>
                              </span>
                            )}

                            <span className={`text-xs font-bold ${isAqua ? 'text-[#0c4a6e]' : 'text-white'}`}>
                              {entry.name}
                            </span>

                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded border ${
                                isAqua
                                  ? 'bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]'
                                  : 'bg-[#251535] text-[#b7a2d9]/70 border-[#4b3670]'
                              }`}
                            >
                              优: {entry.priority ?? 80}
                            </span>
                          </div>

                          {/* 开关：单个词条开关 */}
                          <button
                            onClick={(e) => handleToggleEntryEnable(currentSelectedBook.id, entry.id, e)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border transition-all ${
                              isEntryEnabled
                                ? isAqua
                                  ? 'bg-[#0284c7] text-white border-[#0284c7]'
                                  : 'bg-[#ff8ecb] text-[#1a1120] border-[#ff8ecb]'
                                : isAqua
                                ? 'bg-white text-[#0369a1]/60 border-[#bae6fd]'
                                : 'bg-[#1c1126] text-[#b7a2d9]/60 border-[#4b3670]'
                            }`}
                          >
                            <Power className="w-2.5 h-2.5" />
                            <span>{isEntryEnabled ? '已开启' : '已停用'}</span>
                          </button>
                        </div>

                        {/* 关键词标签列表 */}
                        {(isKeyword || isBoth) && entry.triggerKeys && entry.triggerKeys.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className={`text-[9px] ${isAqua ? 'text-[#0369a1]/80' : 'text-[#b7a2d9]/70'}`}>
                              触发词:
                            </span>
                            {entry.triggerKeys.map((k, kIdx) => (
                              <span
                                key={kIdx}
                                className={`text-[9px] px-1.5 py-0.2 rounded border ${
                                  isAqua
                                    ? 'bg-cyan-50 border-cyan-200 text-cyan-800'
                                    : 'bg-cyan-950/40 border-cyan-700/50 text-cyan-200'
                                }`}
                              >
                                {k}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* 词条正文内容 */}
                        <p
                          className={`text-[11px] leading-relaxed p-2.5 rounded-xl border whitespace-pre-wrap ${
                            isAqua
                              ? 'text-[#0c4a6e] bg-[#f0f9ff] border-[#bae6fd]'
                              : 'text-[#f7d6e8] bg-[#130b1a] border-[#3b2a5a]/50'
                          }`}
                        >
                          {entry.content}
                        </p>

                        {/* 备注与操作栏 */}
                        <div
                          className={`flex items-center justify-between pt-1 border-t text-[10px] ${
                            isAqua
                              ? 'border-[#bae6fd] text-[#0369a1]'
                              : 'border-[#3b2a5a]/50 text-[#b7a2d9]'
                          }`}
                        >
                          <span className={isAqua ? 'text-[#0369a1]/70' : 'text-[#b7a2d9]/60'}>
                            {entry.comment ? `注: ${entry.comment}` : `${entry.content.length} 字符`}
                          </span>

                          <div className={`flex items-center gap-1 ${isAqua ? 'text-[#0284c7]' : 'text-[#d88fbf]'}`}>
                            <button
                              onClick={(e) => handleDuplicateEntry(currentSelectedBook.id, entry, e)}
                              className={`p-1 rounded jelly-btn ${
                                isAqua ? 'hover:text-[#0c4a6e] hover:bg-[#e0f2fe]' : 'hover:text-white hover:bg-[#2e1c3e]'
                              }`}
                              title="复制词条"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => handleOpenEditEntry(currentSelectedBook, entry, e)}
                              className={`p-1 rounded jelly-btn ${
                                isAqua ? 'hover:text-[#0284c7] hover:bg-[#e0f2fe]' : 'hover:text-[#ff8ecb] hover:bg-[#2e1c3e]'
                              }`}
                              title="编辑词条"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteEntry(currentSelectedBook.id, entry.id, e)}
                              className={`p-1 rounded jelly-btn ${
                                isAqua
                                  ? 'text-[#0369a1] hover:text-rose-600 hover:bg-rose-50'
                                  : 'text-[#b7a2d9] hover:text-rose-400 hover:bg-rose-950/40'
                              }`}
                              title="删除词条"
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
            </div>
          )
        )
      }

      {/* ================= 弹窗 1: 创建 / 编辑整本世界书 ================= */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div
            className={`w-full max-w-sm rounded-3xl p-4 font-mono flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.5)] max-h-[85vh] border ${
              isAqua
                ? 'bg-[#f0f9ff] border-[#38bdf8] text-[#0369a1]'
                : 'bg-[#1c1226] border-[#ff8ecb]/60 text-[#f7d6e8]'
            }`}
          >
            <div className={`flex items-center justify-between pb-2.5 border-b ${isAqua ? 'border-[#bae6fd]' : 'border-[#3b2a5a]'}`}>
              <div className="flex items-center gap-2">
                <BookOpen className={`w-4 h-4 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`} />
                <span className={`text-xs font-bold ${isAqua ? 'text-[#0c4a6e]' : 'text-[#f7d6e8]'}`}>
                  {editingBook ? '编辑世界书信息' : '创建整本世界书'}
                </span>
              </div>
              <button
                onClick={() => setShowBookModal(false)}
                className={`p-1 ${isAqua ? 'text-[#0284c7] hover:text-[#0c4a6e]' : 'text-[#b7a2d9] hover:text-white'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2.5 space-y-3 text-xs">
              {/* 世界书名称 */}
              <div>
                <label className="text-[11px] text-[#b7a2d9] block mb-1 font-bold">世界书名称 *</label>
                <input
                  type="text"
                  value={bookFormName}
                  onChange={(e) => setBookFormName(e.target.value)}
                  placeholder="例如：《小手机治愈世界基本法》"
                  className="w-full px-2.5 py-1.5 bg-[#251633] text-[#f7d6e8] rounded-xl border border-[#4b3670] focus:outline-none focus:border-[#ff8ecb]"
                />
              </div>

              {/* 世界书简介 */}
              <div>
                <label className="text-[11px] text-[#b7a2d9] block mb-1">世界书简介 / 设定概要</label>
                <textarea
                  value={bookFormDesc}
                  onChange={(e) => setBookFormDesc(e.target.value)}
                  rows={2}
                  placeholder="概括本书所收录的世界观或习惯守则..."
                  className="w-full px-2.5 py-1.5 bg-[#251633] text-[#f7d6e8] rounded-xl border border-[#4b3670] focus:outline-none focus:border-[#ff8ecb] resize-none leading-relaxed"
                />
              </div>

              {/* 分类范围：全局通用 vs 局部专属 (单行极简切换，不分三行) */}
              <div>
                <label className="text-[11px] text-[#b7a2d9] block mb-1 font-bold">分类范围 (全局 vs 局部) *</label>
                <div className="grid grid-cols-2 gap-2 bg-[#12081a] p-1 rounded-xl border border-[#3b2a5a]">
                  <button
                    type="button"
                    onClick={() => setBookFormScope('global')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      bookFormScope === 'global'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-[#b7a2d9] hover:text-white'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>🌐 全局通用</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookFormScope('local')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      bookFormScope === 'local'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-[#b7a2d9] hover:text-white'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>👤 局部专属</span>
                  </button>
                </div>
                <p className="text-[9px] text-[#b7a2d9]/70 mt-1 px-0.5">
                  {bookFormScope === 'global'
                    ? '全局通用：所有角色对话时均会自动生效'
                    : '局部专属：仅对下方绑定的专属角色生效'}
                </p>
              </div>

              {/* 若为局部世界书，选择绑定角色 */}
              {bookFormScope === 'local' && (
                <div className="p-2.5 bg-[#170c20] rounded-xl border border-amber-500/40 space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between text-[10px] text-amber-300 font-bold">
                    <span>绑定专属角色</span>
                    <span className="text-[9px] text-[#b7a2d9]">勾选生效</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 max-h-28 overflow-y-auto">
                    {personas.map((char) => {
                      const isChecked = bookFormBoundCharIds.includes(char.id);
                      return (
                        <div
                          key={char.id}
                          onClick={() => handleToggleCharId(char.id)}
                          className={`px-2 py-1 rounded-lg border text-[10px] cursor-pointer flex items-center justify-between transition-colors ${
                            isChecked
                              ? 'border-amber-400 bg-amber-950/70 text-amber-200 font-bold'
                              : 'border-[#4b3670] bg-[#221430] text-[#b7a2d9] hover:bg-[#2c1a3e]'
                          }`}
                        >
                          <span className="truncate">{char.name}</span>
                          {isChecked && <Check className="w-3 h-3 text-amber-300 stroke-[3]" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 启用开关 */}
              <div className="flex items-center justify-between p-2.5 bg-[#251633] rounded-xl border border-[#4b3670]">
                <div>
                  <span className="font-bold text-[#f7d6e8] block text-[11px]">整本书启用</span>
                  <span className="text-[9px] text-[#b7a2d9]/70">关闭后本书所有词条均不装载</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBookFormIsEnabled(!bookFormIsEnabled)}
                  className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                    bookFormIsEnabled ? 'bg-[#ff8ecb]' : 'bg-zinc-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      bookFormIsEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="pt-2.5 border-t border-[#3b2a5a] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBookModal(false)}
                className="px-3 py-1.5 rounded-xl border border-[#4b3670] text-[#b7a2d9] hover:text-white text-xs jelly-btn"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveBook}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] font-bold text-xs jelly-btn shadow-md"
              >
                {editingBook ? '保存修改' : '确认创建'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 弹窗 2: 添加 / 编辑词条 (支持三种激活机制 + AI 润色) ================= */}
      {showEntryModal && targetBookForEntry && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#1c1226] border-t sm:border border-[#ff8ecb]/60 rounded-t-3xl sm:rounded-3xl p-5 font-mono flex flex-col max-h-[92vh] shadow-[0_-8px_30px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#3b2a5a]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#ff8ecb]" />
                <div>
                  <span className="text-sm font-bold text-[#f7d6e8]">
                    {editingEntry ? '编辑词条' : '添加新词条'}
                  </span>
                  <span className="text-[10px] text-[#b7a2d9] block">
                    收录于《{targetBookForEntry.name}》
                  </span>
                </div>
              </div>
              <button onClick={() => setShowEntryModal(false)} className="p-1 text-[#b7a2d9] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3.5 text-xs">
              {/* 词条标题 */}
              <div>
                <label className="text-[11px] text-[#b7a2d9] block mb-1 font-bold">词条概念 / 标题 *</label>
                <input
                  type="text"
                  value={entryFormName}
                  onChange={(e) => setEntryFormName(e.target.value)}
                  placeholder="例如：小鱼干偏好、草莓可丽饼、月见草魔法刻印"
                  className="w-full px-3 py-2 bg-[#251633] text-[#f7d6e8] rounded-xl border border-[#4b3670] focus:outline-none focus:border-[#ff8ecb]"
                />
              </div>

              {/* 三种生效激活方式：常驻开 / 关键词触发 / 常驻+关键词 */}
              <div>
                <label className="text-[11px] text-[#b7a2d9] block mb-1 font-bold">
                  生效激活方式 (三种可选) *
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-[#12081a] p-1 rounded-xl border border-[#3b2a5a]">
                  <button
                    type="button"
                    onClick={() => setEntryFormActivationType('always')}
                    className={`py-1.5 px-1 rounded-lg text-[10px] font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                      entryFormActivationType === 'always'
                        ? 'bg-pink-950 border border-pink-400 text-pink-200 shadow-[0_0_8px_rgba(244,114,182,0.3)]'
                        : 'text-[#b7a2d9] hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-[#ff8ecb]" />
                    <span>🌸 常驻开</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEntryFormActivationType('keyword')}
                    className={`py-1.5 px-1 rounded-lg text-[10px] font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                      entryFormActivationType === 'keyword'
                        ? 'bg-cyan-950 border border-cyan-400 text-cyan-200 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                        : 'text-[#b7a2d9] hover:text-white'
                    }`}
                  >
                    <Key className="w-3 h-3 text-cyan-300" />
                    <span>🔑 关键词触发</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEntryFormActivationType('both')}
                    className={`py-1.5 px-1 rounded-lg text-[10px] font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                      entryFormActivationType === 'both'
                        ? 'bg-purple-950 border border-purple-400 text-purple-200 shadow-[0_0_8px_rgba(168,85,247,0.3)]'
                        : 'text-[#b7a2d9] hover:text-white'
                    }`}
                  >
                    <Zap className="w-3 h-3 text-amber-300" />
                    <span>⚡ 常驻+关键词</span>
                  </button>
                </div>
                <p className="text-[9px] text-[#b7a2d9]/70 mt-1">
                  {entryFormActivationType === 'always' && '🌸 常驻开：每轮对话均会装载此设定'}
                  {entryFormActivationType === 'keyword' && '🔑 关键词触发：仅在对方或历史中提及触发词时动态装载'}
                  {entryFormActivationType === 'both' && '⚡ 常驻+关键词：始终常驻生效，且命中触发词时强化提升优先级'}
                </p>
              </div>

              {/* 若为关键词触发或常驻+关键词，输入触发关键词 */}
              {(entryFormActivationType === 'keyword' || entryFormActivationType === 'both') && (
                <div className="p-3 bg-[#171b26] rounded-xl border border-cyan-600/40 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-[11px] text-cyan-300 font-bold">
                    <span>触发关键词 (空格或逗号分隔)</span>
                    <span className="text-[10px] text-[#b7a2d9]">对话中提及这些词即生效/强化</span>
                  </div>
                  <input
                    type="text"
                    value={entryFormTriggerKeys}
                    onChange={(e) => setEntryFormTriggerKeys(e.target.value)}
                    placeholder="例如：小鱼干 烤鱼 零食 投喂"
                    className="w-full px-3 py-1.5 bg-[#121924] text-cyan-200 rounded-lg border border-cyan-700/60 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              )}

              {/* 设定正文内容 + AI 润色按钮 */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] text-[#b7a2d9] font-bold">词条设定内容 *</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#b7a2d9]/60">
                      {entryFormContent.length} 字符 · 约 {Math.round(entryFormContent.length * 0.7)} tokens
                    </span>

                    {/* AI 润色按钮 */}
                    <button
                      type="button"
                      onClick={handlePolishEntry}
                      disabled={isPolishing}
                      className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-purple-700 to-pink-600 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm hover:opacity-90 disabled:opacity-50 jelly-btn"
                    >
                      {isPolishing ? (
                        <>
                          <Sparkles className="w-2.5 h-2.5 animate-spin text-[#ff8ecb]" />
                          <span>AI 润色中...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-2.5 h-2.5 text-[#ff8ecb]" />
                          <span>✨ AI 润色</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <textarea
                  value={entryFormContent}
                  onChange={(e) => setEntryFormContent(e.target.value)}
                  rows={5}
                  placeholder="详细写下该词条所代表的世界观守则、角色习惯、小秘密或背景知识...也可以点击右上角「AI 润色」一键优化丰满！"
                  className="w-full px-3 py-2 bg-[#251633] text-[#f7d6e8] rounded-xl border border-[#4b3670] focus:outline-none focus:border-[#ff8ecb] resize-none leading-relaxed"
                />

                {/* AI 润色预览确认抽屉 */}
                {polishPreview && (
                  <div className="mt-2 p-3 bg-[#1b0d26] rounded-xl border border-[#ff8ecb]/70 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#ff8ecb] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#ff8ecb]" />
                        <span>AI 润色效果预览：</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPolishPreview(null)}
                          className="px-2 py-0.5 text-[10px] text-[#b7a2d9] hover:text-white"
                        >
                          放弃
                        </button>
                        <button
                          type="button"
                          onClick={handleApplyPolish}
                          className="px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] font-bold text-[10px] flex items-center gap-0.5 jelly-btn shadow-sm"
                        >
                          <Check className="w-3 h-3" />
                          <span>采纳替换</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#f7d6e8] leading-relaxed bg-[#13091c] p-2 rounded-lg border border-[#3b2a5a] whitespace-pre-wrap">
                      {polishPreview}
                    </p>
                  </div>
                )}
              </div>

              {/* 优先级与备注 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#b7a2d9] block mb-1">优先级 (1~100)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={entryFormPriority}
                    onChange={(e) => setEntryFormPriority(Number(e.target.value) || 80)}
                    className="w-full px-3 py-1.5 bg-[#251633] text-[#f7d6e8] rounded-xl border border-[#4b3670] focus:outline-none focus:border-[#ff8ecb]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#b7a2d9] block mb-1">备注说明 (可选)</label>
                  <input
                    type="text"
                    value={entryFormComment}
                    onChange={(e) => setEntryFormComment(e.target.value)}
                    placeholder="备忘用，不注入提示词"
                    className="w-full px-3 py-1.5 bg-[#251633] text-[#f7d6e8] rounded-xl border border-[#4b3670] focus:outline-none focus:border-[#ff8ecb]"
                  />
                </div>
              </div>

              {/* 词条单独启用开关 */}
              <div className="flex items-center justify-between p-3 bg-[#251633] rounded-xl border border-[#4b3670]">
                <div>
                  <span className="font-bold text-[#f7d6e8] block">词条启用状态</span>
                  <span className="text-[10px] text-[#b7a2d9]/70">单独关闭该词条，不影响整本书其他词条</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEntryFormIsEnabled(!entryFormIsEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    entryFormIsEnabled ? 'bg-[#ff8ecb]' : 'bg-zinc-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      entryFormIsEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="pt-3 border-t border-[#3b2a5a] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEntryModal(false)}
                className="px-4 py-2 rounded-xl border border-[#4b3670] text-[#b7a2d9] hover:text-white jelly-btn"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveEntry}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] font-bold jelly-btn shadow-md"
              >
                {editingEntry ? '保存词条' : '添加到世界书'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 弹窗 3: 灵感世界书模板库 (一键整本导入) ================= */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#1c1226] border border-[#ff8ecb]/60 rounded-3xl p-5 font-mono flex flex-col max-h-[85vh] shadow-[0_8px_30px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#3b2a5a]">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-[#ff8ecb]" />
                <span className="text-sm font-bold text-[#f7d6e8]">精选世界书模板灵感库</span>
              </div>
              <button onClick={() => setShowTemplateModal(false)} className="p-1 text-[#b7a2d9] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-[#b7a2d9] py-2">
              点击即可一键将预打包好的整本世界书（包含全部词条设定）导入到您的世界书宝典中：
            </p>

            <div className="flex-1 overflow-y-auto space-y-3 py-1 pr-1">
              {PRESET_WORLDBOOK_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-3.5 bg-[#251535] rounded-2xl border border-[#4b3670] hover:border-[#ff8ecb] transition-all flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{tpl.name}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-950 border border-purple-400 text-purple-300">
                        {tpl.scope === 'global' ? '全局通用' : '局部专属'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleImportTemplate(tpl)}
                      className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] text-xs font-bold jelly-btn"
                    >
                      + 一键导入
                    </button>
                  </div>

                  <p className="text-[11px] text-[#b7a2d9] leading-relaxed">
                    {tpl.description}
                  </p>

                  <div className="flex items-center gap-2 text-[10px] text-[#ff8ecb]">
                    <Layers className="w-3 h-3" />
                    <span>内含 {tpl.entries?.length || 0} 个预构词条：</span>
                    <span className="text-[#b7a2d9]">
                      {tpl.entries?.map((e) => e.name).join('、')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= 弹窗 4: 关键词触发测试器 ================= */}
      {showTesterModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#1c1226] border border-[#ff8ecb]/60 rounded-3xl p-5 font-mono flex flex-col max-h-[85vh] shadow-[0_8px_30px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#3b2a5a]">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-cyan-300" />
                <span className="text-sm font-bold text-[#f7d6e8]">关键词触发模拟测试器</span>
              </div>
              <button onClick={() => setShowTesterModal(false)} className="p-1 text-[#b7a2d9] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-[#b7a2d9] block mb-1">测试输入文本</label>
                <textarea
                  value={testSentence}
                  onChange={(e) => setTestSentence(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-[#251633] text-[#f7d6e8] rounded-xl border border-[#4b3670] focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              {/* 命中分析 */}
              <div>
                <span className="text-[11px] text-[#b7a2d9] block mb-1 font-bold">
                  触发词命中检测结果：
                </span>

                <div className="max-h-56 overflow-y-auto space-y-2 p-2 bg-[#12081a] rounded-xl border border-[#3b2a5a]">
                  {worldbooks.flatMap((book) =>
                    (book.entries || [])
                      .filter((entry) => {
                        if (entry.isEnabled === false || book.isEnabled === false) return false;
                        if ((entry.activationType === 'keyword' || entry.activationType === 'both') && entry.triggerKeys) {
                          const lower = testSentence.toLowerCase();
                          return entry.triggerKeys.some(
                            (k) => k && lower.includes(k.toLowerCase())
                          );
                        }
                        return false;
                      })
                      .map((hitEntry) => (
                        <div
                          key={hitEntry.id}
                          className="p-2 rounded-lg bg-[#1e1328] border border-cyan-500/50 flex flex-col gap-1 text-[11px]"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-cyan-300">
                              《{book.name}》· {hitEntry.name}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-200">
                              {hitEntry.activationType === 'both' ? '常驻+关键词命中(+25)' : '关键词命中'}
                            </span>
                          </div>
                          <p className="text-[#b7a2d9] line-clamp-1">{hitEntry.content}</p>
                        </div>
                      ))
                  )}

                  {worldbooks.every((b) =>
                    (b.entries || []).every((e) => {
                      if ((e.activationType !== 'keyword' && e.activationType !== 'both') || !e.triggerKeys) return true;
                      return !e.triggerKeys.some((k) =>
                        testSentence.toLowerCase().includes(k.toLowerCase())
                      );
                    })
                  ) && (
                    <div className="p-4 text-center text-[#b7a2d9]/60 text-[11px]">
                      当前句子未命中任何触发词，仅装载常驻生效词条
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#3b2a5a] flex justify-end">
              <button
                onClick={() => setShowTesterModal(false)}
                className="px-4 py-1.5 rounded-xl bg-[#251535] border border-[#4b3670] text-[#f7d6e8] text-xs jelly-btn"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 弹窗 5: 导入 / 导出 JSON ================= */}
      {showImportExportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#1c1226] border border-[#ff8ecb]/60 rounded-3xl p-5 font-mono flex flex-col max-h-[85vh] shadow-[0_8px_30px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#3b2a5a]">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[#ff8ecb]" />
                <span className="text-sm font-bold text-[#f7d6e8]">世界书配置导入与导出</span>
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
                导出整本配置
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
                  将全部 {worldbooks.length} 本世界书及其词条备份为标准 JSON 格式：
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportJson}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] font-bold text-xs flex items-center justify-center gap-1.5 jelly-btn"
                  >
                    <Copy className="w-4 h-4" />
                    <span>复制 JSON 到剪贴板</span>
                  </button>
                  <button
                    onClick={handleDownloadJson}
                    className="flex-1 py-2.5 rounded-xl bg-[#251535] border border-[#ff8ecb] text-[#ff8ecb] font-bold text-xs flex items-center justify-center gap-1.5 jelly-btn"
                  >
                    <Download className="w-4 h-4" />
                    <span>下载 JSON 文件</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 py-2 text-xs">
                <p className="text-[11px] text-[#b7a2d9]">请粘贴世界书 JSON 数据内容：</p>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  rows={6}
                  placeholder='[ { "name": "世界书", "scope": "global", "entries": [...] } ]'
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
