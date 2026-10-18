import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Search,
  Plus,
  Globe,
  Upload,
  Sparkles,
  ExternalLink,
  Edit2,
  Trash2,
  X,
  MoreHorizontal,
} from 'lucide-react';
import { WebpageApp } from '../types/phone';
import {
  PixelBow,
  PixelSparkle,
  PixelHeart,
  PixelIconMemo,
  PixelIconWeather,
  PixelIconQuote,
} from './PixelAssets';

interface WarehouseAppProps {
  webpages: WebpageApp[];
  onSaveWebpages: (list: WebpageApp[]) => void;
  onBack: () => void;
  onOpenWeb: (web: WebpageApp) => void;
  subPage?: string;
  onNavigateSub: (sub: string, params?: any) => void;
  currentTheme?: string;
}

export const WarehouseApp: React.FC<WarehouseAppProps> = ({
  webpages,
  onSaveWebpages,
  onBack,
  onOpenWeb,
  subPage = 'list',
  onNavigateSub,
  currentTheme = 'sky',
}) => {
  const isAqua = currentTheme === 'aqua_pixel';
  const [searchKeyword, setSearchKeyword] = useState('');
  const [editingItem, setEditingItem] = useState<WebpageApp | null>(null);

  // 操作菜单状态
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // 表单状态
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formIconData, setFormIconData] = useState<string | undefined>(undefined);
  const [formIconType, setFormIconType] = useState<'url' | 'base64' | 'default'>('default');
  const [isFetchingFavicon, setIsFetchingFavicon] = useState(false);

  const filteredWebpages = webpages.filter((w) =>
    w.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    w.url.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const handleStartAdd = () => {
    setEditingItem(null);
    setFormName('');
    setFormUrl('');
    setFormIconData(undefined);
    setFormIconType('default');
    onNavigateSub('add');
  };

  const handleStartEdit = (item: WebpageApp) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormUrl(item.url);
    setFormIconData(item.iconData);
    setFormIconType(item.iconType);
    setActiveMenuId(null);
    onNavigateSub('edit');
  };

  const handleDelete = (id: string) => {
    if (confirm('确认删除此网页应用？')) {
      onSaveWebpages(webpages.filter((w) => w.id !== id));
      setActiveMenuId(null);
    }
  };

  const handleFetchFavicon = () => {
    if (!formUrl.trim()) {
      alert('请先输入网址');
      return;
    }
    setIsFetchingFavicon(true);
    let target = formUrl.trim();
    if (!/^https?:\/\//i.test(target)) {
      target = 'https://' + target;
    }
    try {
      const parsed = new URL(target);
      const iconUrl = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`;
      setFormIconData(iconUrl);
      setFormIconType('url');
    } catch {
      alert('请输入合法的网址');
    } finally {
      setIsFetchingFavicon(false);
    }
  };

  const handleUploadIcon = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 128;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          }
        } else {
          if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, w, h);
        const compressedBase64 = canvas.toDataURL('image/png', 0.85);
        setFormIconData(compressedBase64);
        setFormIconType('base64');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveForm = () => {
    if (!formName.trim() || !formUrl.trim()) {
      alert('请填写名称和网址');
      return;
    }

    let normalizedUrl = formUrl.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    if (editingItem) {
      const next = webpages.map((w) =>
        w.id === editingItem.id
          ? {
              ...w,
              name: formName.trim(),
              url: normalizedUrl,
              iconData: formIconData,
              iconType: formIconType,
            }
          : w
      );
      onSaveWebpages(next);
    } else {
      const newItem: WebpageApp = {
        id: 'web_' + Date.now(),
        name: formName.trim(),
        url: normalizedUrl,
        iconData: formIconData,
        iconType: formIconType,
        createdAt: Date.now(),
      };
      onSaveWebpages([newItem, ...webpages]);
    }
    onBack();
  };

  // 1. 列表主视图 (参考图样式：顶栏蝴蝶结 + 搜索框 + 卡片列表 + 更多菜单)
  if (subPage === 'list') {
    return (
      <div
        className={`flex-1 flex flex-col select-none overflow-hidden relative font-mono transition-colors duration-200 ${
          isAqua
            ? 'bg-gradient-to-b from-[#f0f9ff] via-[#e0f2fe] to-[#bae6fd] text-[#0369a1]'
            : 'bg-gradient-to-b from-[#180f21] via-[#120b18] to-[#0a050e] text-[#f7d6e8]'
        }`}
        onClick={() => setActiveMenuId(null)}
      >
        {/* 顶部标题栏 (中央粉色/蓝色蝴蝶结装饰) */}
        <div
          className={`h-12 px-4 flex items-center justify-between border-b backdrop-blur-md z-20 transition-colors ${
            isAqua
              ? 'border-[#bae6fd] bg-white/80 text-[#0369a1]'
              : 'border-[#3b2a5a] bg-[#1e1328]/90 text-[#f7d6e8]'
          }`}
        >
          <button
            onClick={onBack}
            className={`p-1.5 jelly-btn transition-colors ${
              isAqua ? 'text-[#0284c7] hover:text-[#0369a1]' : 'text-[#d88fbf] hover:text-white'
            }`}
          >
            <ArrowLeft className="w-5 h-5 stroke-[2]" />
          </button>
          <div
            className={`flex items-center gap-1.5 font-mono text-sm font-bold ${
              isAqua ? 'text-[#0369a1]' : 'text-[#f7d6e8]'
            }`}
          >
            <span>仓库</span>
            <PixelBow className="w-5 h-5 drop-shadow-sm" />
          </div>
          <button
            onClick={handleStartAdd}
            className={`w-7 h-7 rounded-xl flex items-center justify-center jelly-btn transition-all ${
              isAqua
                ? 'bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-white shadow-[0_2px_10px_rgba(56,189,248,0.35)] hover:opacity-90'
                : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] shadow-[0_2px_10px_rgba(255,142,203,0.35)] hover:opacity-90'
            }`}
          >
            <Plus className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* 顶部搜索框 */}
        <div
          className={`p-3 border-b transition-colors ${
            isAqua ? 'bg-[#e0f2fe]/60 border-[#bae6fd]/60' : 'bg-[#191024]/70 border-[#3b2a5a]/60'
          }`}
        >
          <div
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border shadow-inner transition-colors ${
              isAqua
                ? 'bg-white/90 border-[#7dd3fc]'
                : 'bg-[#1f132a] border-[#4b3670]'
            }`}
          >
            <Search className={`w-3.5 h-3.5 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`} />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索仓库中的网页应用..."
              className={`flex-1 text-xs bg-transparent focus:outline-none font-mono ${
                isAqua
                  ? 'text-[#0369a1] placeholder-[#0284c7]/40'
                  : 'text-[#f7d6e8] placeholder-[#b7a2d9]/50'
              }`}
            />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword('')}
                className={isAqua ? 'text-[#0284c7] hover:text-[#0369a1]' : 'text-[#b7a2d9] hover:text-white'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 网页应用列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredWebpages.length === 0 ? (
            <div
              className={`h-48 flex flex-col items-center justify-center text-xs font-mono ${
                isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]'
              }`}
            >
              <Globe
                className={`w-8 h-8 stroke-[1.4] mb-2 ${
                  isAqua ? 'text-[#38bdf8]/60' : 'text-[#d88fbf]/40'
                }`}
              />
              <span>暂无网页应用，点击右上角 ＋ 添加</span>
            </div>
          ) : (
            filteredWebpages.map((item) => (
              <div
                key={item.id}
                onClick={() => onOpenWeb(item)}
                className={`w-full p-3 rounded-2xl border cursor-pointer flex items-center justify-between group transition-all relative ${
                  isAqua
                    ? 'bg-white/85 border-[#bae6fd] hover:border-[#38bdf8] shadow-[0_4px_16px_rgba(56,189,248,0.12)]'
                    : 'bg-[#1e1329]/85 border-[#3b2a5a] hover:border-[#ff8ecb]/80 shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center p-1.5 shrink-0 overflow-hidden shadow-inner ${
                      isAqua
                        ? 'bg-gradient-to-b from-[#e0f2fe] to-[#bae6fd] border-[#7dd3fc]'
                        : 'bg-gradient-to-b from-[#2e1d3d] to-[#150d1e] border-[#d88fbf]/50'
                    }`}
                  >
                    {item.iconData ? (
                      <img
                        src={item.iconData}
                        alt={item.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Globe className={`w-5 h-5 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`} />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <div
                      className={`text-xs font-mono font-bold truncate flex items-center gap-1.5 ${
                        isAqua ? 'text-[#0369a1]' : 'text-[#f7d6e8]'
                      }`}
                    >
                      <span>{item.name}</span>
                    </div>
                    <div
                      className={`text-[10px] mt-0.5 font-mono truncate max-w-[190px] ${
                        isAqua ? 'text-[#0284c7]/80' : 'text-[#b7a2d9]'
                      }`}
                    >
                      {item.url}
                    </div>
                  </div>
                </div>

                {/* 更多菜单按钮 (···) */}
                <div
                  className="relative"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuId(activeMenuId === item.id ? null : item.id);
                  }}
                >
                  <button
                    className={`p-2 rounded-xl transition-colors jelly-btn ${
                      isAqua
                        ? 'text-[#0284c7] hover:text-[#0369a1] hover:bg-[#e0f2fe]'
                        : 'text-[#d88fbf] hover:text-[#ff8ecb] hover:bg-[#2e1c3e]'
                    }`}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {/* 弹出气泡操作菜单 */}
                  {activeMenuId === item.id && (
                    <div
                      className={`absolute right-0 top-8 z-30 w-32 rounded-xl border-2 py-1 text-xs font-mono animate-in fade-in duration-100 ${
                        isAqua
                          ? 'bg-white border-[#38bdf8] shadow-[0_8px_24px_rgba(56,189,248,0.25)]'
                          : 'bg-[#261638] border-[#d88fbf] shadow-[0_8px_24px_rgba(0,0,0,0.8)]'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setActiveMenuId(null);
                          onOpenWeb(item);
                        }}
                        className={`w-full px-3 py-2 text-left flex items-center gap-1.5 ${
                          isAqua
                            ? 'text-[#0369a1] hover:bg-[#f0f9ff]'
                            : 'text-[#f7d6e8] hover:bg-[#382152]'
                        }`}
                      >
                        <ExternalLink className={`w-3.5 h-3.5 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`} />
                        <span>打开应用</span>
                      </button>
                      <button
                        onClick={() => handleStartEdit(item)}
                        className={`w-full px-3 py-2 text-left flex items-center gap-1.5 ${
                          isAqua
                            ? 'text-[#0369a1] hover:bg-[#f0f9ff]'
                            : 'text-[#f7d6e8] hover:bg-[#382152]'
                        }`}
                      >
                        <Edit2 className={`w-3.5 h-3.5 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`} />
                        <span>编辑配置</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className={`w-full px-3 py-2 text-left flex items-center gap-1.5 ${
                          isAqua
                            ? 'text-rose-600 hover:bg-rose-50'
                            : 'text-rose-300 hover:bg-rose-950/40'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>删除应用</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 底部居中点缀小蝴蝶结 */}
        <div className="py-2 flex justify-center pointer-events-none opacity-60">
          <PixelBow className="w-5 h-5" />
        </div>
      </div>
    );
  }

  // 2. 添加 / 编辑网页视图
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
            ? 'border-[#bae6fd] bg-white/80 text-[#0369a1]'
            : 'border-[#3b2a5a] bg-[#1e1328]/90 text-[#f7d6e8]'
        }`}
      >
        <button
          onClick={onBack}
          className={`p-1.5 jelly-btn transition-colors ${
            isAqua ? 'text-[#0284c7] hover:text-[#0369a1]' : 'text-[#d88fbf] hover:text-white'
          }`}
        >
          <ArrowLeft className="w-5 h-5 stroke-[2]" />
        </button>
        <span
          className={`text-sm font-mono font-bold ${
            isAqua ? 'text-[#0369a1]' : 'text-[#f7d6e8]'
          }`}
        >
          {editingItem ? '编辑网页应用' : '添加网页应用'}
        </span>
        <button
          onClick={handleSaveForm}
          className={`text-xs font-mono font-bold px-3.5 py-1.5 rounded-xl jelly-btn transition-all ${
            isAqua
              ? 'bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-white shadow-[0_2px_10px_rgba(56,189,248,0.35)] hover:opacity-90'
              : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] shadow-[0_2px_10px_rgba(255,142,203,0.35)] hover:opacity-90'
          }`}
        >
          保存
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 名称 */}
        <div>
          <label
            className={`block text-[11px] font-mono mb-1 ${
              isAqua ? 'text-[#0284c7]' : 'text-[#b7a2d9]'
            }`}
          >
            应用名称
          </label>
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="例如：治愈便签 / 小红书 / B站"
            className={`w-full px-3 py-2 text-xs rounded-xl border font-mono focus:outline-none transition-colors ${
              isAqua
                ? 'bg-white/90 text-[#0369a1] border-[#7dd3fc] focus:border-[#0284c7] placeholder-[#0284c7]/40'
                : 'bg-[#1f132a] text-[#f7d6e8] border-[#4b3670] focus:border-[#ff8ecb] placeholder-[#b7a2d9]/50'
            }`}
          />
        </div>

        {/* 网址 */}
        <div>
          <label
            className={`block text-[11px] font-mono mb-1 ${
              isAqua ? 'text-[#0284c7]' : 'text-[#b7a2d9]'
            }`}
          >
            网页地址 (URL)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              placeholder="https://..."
              className={`flex-1 px-3 py-2 text-xs rounded-xl border font-mono focus:outline-none transition-colors ${
                isAqua
                  ? 'bg-white/90 text-[#0369a1] border-[#7dd3fc] focus:border-[#0284c7] placeholder-[#0284c7]/40'
                  : 'bg-[#1f132a] text-[#f7d6e8] border-[#4b3670] focus:border-[#ff8ecb] placeholder-[#b7a2d9]/50'
              }`}
            />
            <button
              type="button"
              onClick={handleFetchFavicon}
              disabled={isFetchingFavicon || !formUrl.trim()}
              className={`px-3 py-2 text-xs rounded-xl border flex items-center gap-1 font-mono disabled:opacity-40 jelly-btn transition-colors ${
                isAqua
                  ? 'bg-[#e0f2fe] text-[#0284c7] border-[#7dd3fc] hover:bg-[#bae6fd]'
                  : 'bg-[#2e1d3e] text-[#ff8ecb] border-[#d88fbf]/50 hover:bg-[#3d2652]'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>自动图标</span>
            </button>
          </div>
        </div>

        {/* 图标自定义 */}
        <div>
          <label
            className={`block text-[11px] font-mono mb-1.5 ${
              isAqua ? 'text-[#0284c7]' : 'text-[#b7a2d9]'
            }`}
          >
            应用图标
          </label>
          <div
            className={`flex items-center gap-4 p-3 rounded-2xl border transition-colors ${
              isAqua
                ? 'bg-white/80 border-[#bae6fd]'
                : 'bg-[#1d1226]/80 border-[#3b2a5a]'
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center p-2 shadow-inner overflow-hidden ${
                isAqua
                  ? 'bg-gradient-to-b from-[#e0f2fe] to-[#bae6fd] border-[#38bdf8]'
                  : 'bg-gradient-to-b from-[#2e1d3d] to-[#150d1e] border-[#d88fbf]'
              }`}
            >
              {formIconData ? (
                <img src={formIconData} alt="预览" className="w-full h-full object-contain" />
              ) : (
                <Globe className={`w-6 h-6 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`} />
              )}
            </div>

            <div className="flex-1 space-y-1.5">
              <label
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono cursor-pointer jelly-btn transition-colors ${
                  isAqua
                    ? 'bg-[#e0f2fe] text-[#0369a1] hover:bg-[#bae6fd] border-[#7dd3fc]'
                    : 'bg-[#2e1d3e] text-[#f7d6e8] hover:bg-[#3d2652] border-[#4b3670]'
                }`}
              >
                <Upload className={`w-3.5 h-3.5 ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`} />
                <span>上传本地图片</span>
                <input type="file" accept="image/*" onChange={handleUploadIcon} className="hidden" />
              </label>
              {formIconData && (
                <button
                  type="button"
                  onClick={() => {
                    setFormIconData(undefined);
                    setFormIconType('default');
                  }}
                  className={`block text-[11px] font-mono hover:underline ${
                    isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'
                  }`}
                >
                  恢复默认图标
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
