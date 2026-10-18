import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Upload,
  Check,
  Image as ImageIcon,
  Sliders,
  Palette,
  Link2,
} from 'lucide-react';
import defaultBannerUrl from '../assets/images/user_profile_banner_1790869097641.jpg';
import jiraiPixelWallpaper from '../assets/images/jirai_pixel_wallpaper_1790861769109.jpg';
import jellyfishImg from '../assets/images/jellyfish_jirai_girl_1790865819888.jpg';

export interface BannerPreset {
  id: string;
  name: string;
  type: 'image' | 'gradient';
  imageUrl?: string;
  gradientStyle?: string;
  badge?: string;
}

export const PRESET_BANNERS: BannerPreset[] = [
  {
    id: 'banner_twilight_castle',
    name: '暮光城堡星夜',
    type: 'image',
    imageUrl: defaultBannerUrl,
    badge: '🏰 城堡',
  },
  {
    id: 'banner_qzone_starry',
    name: '极夜紫星空漫游',
    type: 'gradient',
    gradientStyle: 'radial-gradient(ellipse at 50% 20%, #3e1b5f 0%, #201035 55%, #130a1c 100%)',
    badge: '🌌 星空',
  },
  {
    id: 'banner_jirai_pixel',
    name: '暗黑地雷森林兔',
    type: 'image',
    imageUrl: jiraiPixelWallpaper,
    badge: '🌲 森林',
  },
  {
    id: 'banner_jellyfish',
    name: '水母幻紫少女',
    type: 'image',
    imageUrl: jellyfishImg,
    badge: '🌸 少女',
  },
  {
    id: 'banner_sunset_clouds',
    name: '紫粉梦幻云霞',
    type: 'gradient',
    gradientStyle: 'linear-gradient(135deg, #2b1055 0%, #7597de 50%, #ff8ecb 100%)',
    badge: '☁️ 云海',
  },
  {
    id: 'banner_checkerboard',
    name: '紫白棋盘甜心',
    type: 'gradient',
    gradientStyle:
      'repeating-conic-gradient(#2d163d 0% 25%, #46225f 0% 50%) 50% / 24px 24px',
    badge: '🏁 棋盘',
  },
  {
    id: 'banner_cosmic_ribbon',
    name: '星空蝴蝶结星云',
    type: 'gradient',
    gradientStyle: 'radial-gradient(ellipse at top, #ff8ecb 0%, #3a1c54 60%, #160a22 100%)',
    badge: '🎀 蝴蝶结',
  },
  {
    id: 'banner_night_garden',
    name: '深夜灌木花庭',
    type: 'gradient',
    gradientStyle: 'linear-gradient(180deg, #1b0e2b 0%, #2f1745 50%, #12091c 100%)',
    badge: '🌙 花庭',
  },
  {
    id: 'banner_dark_lace',
    name: '黑粉蕾丝暗语',
    type: 'gradient',
    gradientStyle: 'linear-gradient(45deg, #160a1e 25%, #2a1138 50%, #441755 75%, #ff8ecb 100%)',
    badge: '🖤 蕾丝',
  },
  {
    id: 'banner_cyber_galaxy',
    name: '流光幻紫银河',
    type: 'gradient',
    gradientStyle: 'linear-gradient(120deg, #12091f 0%, #5b1d75 50%, #80ffdb 100%)',
    badge: '🌌 银河',
  },
];

export const SOLID_BANNER_GRADIENTS = [
  { id: 'sb_1', name: '暗夜暮紫', style: 'linear-gradient(to right, #1b0f24, #2a1438)' },
  { id: 'sb_2', name: '极夜纯黑', style: '#0d0713' },
  { id: 'sb_3', name: '地雷甜粉', style: 'linear-gradient(to right, #ff8ecb, #d88fbf)' },
  { id: 'sb_4', name: '薰衣草露', style: 'linear-gradient(to right, #4a2862, #844c9b)' },
  { id: 'sb_5', name: '赛博霓虹', style: 'linear-gradient(to right, #1f143a, #0077b6, #80ffdb)' },
  { id: 'sb_6', name: '午夜玫瑰', style: 'linear-gradient(to right, #38040e, #250902, #38040e)' },
];

/**
 * 全局通用的背景横幅样式获取器
 */
export const getUniversalBannerStyle = (bannerVal: string | undefined): React.CSSProperties => {
  if (!bannerVal || bannerVal === 'default') {
    return {
      backgroundImage: `url(${defaultBannerUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }

  // 1. 本地 Base64 或网络图片 URL
  if (bannerVal.startsWith('data:image') || bannerVal.startsWith('http://') || bannerVal.startsWith('https://') || bannerVal.startsWith('/')) {
    return {
      backgroundImage: `url(${bannerVal})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }

  // 2. 匹配预设
  const foundPreset = PRESET_BANNERS.find((p) => p.id === bannerVal);
  if (foundPreset) {
    if (foundPreset.type === 'image' && foundPreset.imageUrl) {
      return {
        backgroundImage: `url(${foundPreset.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    if (foundPreset.gradientStyle) {
      return { background: foundPreset.gradientStyle };
    }
  }

  // 3. 匹配纯色 / 渐变
  const foundSolid = SOLID_BANNER_GRADIENTS.find((s) => s.id === bannerVal);
  if (foundSolid) {
    return { background: foundSolid.style };
  }

  return {
    backgroundImage: `url(${defaultBannerUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };
};

interface BannerPickerModalProps {
  currentBanner: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectBanner: (bannerVal: string) => void;
  title?: string;
}

export const BannerPickerModal: React.FC<BannerPickerModalProps> = ({
  currentBanner,
  isOpen,
  onClose,
  onSelectBanner,
  title = '背景 / 横幅上传与选择系统',
}) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'solid' | 'custom'>('custom');
  const [selectedBannerVal, setSelectedBannerVal] = useState<string>(currentBanner || 'default');
  const [customInputUrl, setCustomInputUrl] = useState<string>('');
  const [previewCustomImg, setPreviewCustomImg] = useState<string | null>(
    currentBanner?.startsWith('data:image') || currentBanner?.startsWith('http')
      ? currentBanner
      : null
  );
  const [uploadFeedback, setUploadFeedback] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 存储最近上传过的横幅
  const [recentBanners, setRecentBanners] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('recent_custom_banners_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (isOpen) {
      setSelectedBannerVal(currentBanner || 'default');
      if (currentBanner?.startsWith('data:image') || currentBanner?.startsWith('http')) {
        setPreviewCustomImg(currentBanner);
        setActiveTab('custom');
      }
    }
  }, [isOpen, currentBanner]);

  if (!isOpen) return null;

  // 使用 Canvas 自动对横幅压缩与缩放，宽度最大 960px，高保真同时体积控制在 ~80KB，彻底杜绝 localStorage 爆满
  const processAndCompressBanner = (file: File) => {
    setUploadFeedback('正在优化横幅画质...');
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 960;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, width, height);

        const base64 = canvas.toDataURL('image/jpeg', 0.85);
        setPreviewCustomImg(base64);
        setSelectedBannerVal(base64);
        setUploadFeedback(`✓ 横幅画质已优化完成 (${Math.round((base64.length * 3) / 4 / 1024)} KB)`);

        setRecentBanners((prev) => {
          const filtered = prev.filter((b) => b !== base64);
          const next = [base64, ...filtered].slice(0, 6);
          try {
            localStorage.setItem('recent_custom_banners_v2', JSON.stringify(next));
          } catch {}
          return next;
        });
      };
      img.onerror = () => {
        setUploadFeedback('⚠️ 图片无法读取，请尝试其他图片');
      };
      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndCompressBanner(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processAndCompressBanner(file);
    }
  };

  const handleApplyUrl = () => {
    const url = customInputUrl.trim();
    if (!url) return;
    setPreviewCustomImg(url);
    setSelectedBannerVal(url);
    setUploadFeedback('✓ 已连接网络背景图片');

    setRecentBanners((prev) => {
      const filtered = prev.filter((b) => b !== url);
      const next = [url, ...filtered].slice(0, 6);
      try {
        localStorage.setItem('recent_custom_banners_v2', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleConfirm = () => {
    onSelectBanner(selectedBannerVal);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm sm:max-w-md bg-[#180d22] border-2 border-[#ff8ecb]/80 rounded-3xl shadow-[0_0_40px_rgba(255,142,203,0.35)] overflow-hidden flex flex-col p-4 space-y-3.5 animate-in zoom-in-95 duration-150 select-none font-mono"
      >
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between border-b border-[#3b2a5a] pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-sm">💖</span>
            <span className="font-bold text-sm text-[#f7d6e8] tracking-wide">{title}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#ff8ecb]/80">✦</span>
            <button
              onClick={onClose}
              className="p-1 text-[#b7a2d9] hover:text-white transition-colors jelly-btn"
              title="关闭"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* 分段标签切换条 (自定义上传 / 推荐预设 / 纯色渐变) */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 py-1">
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-3 sm:px-4 py-1 rounded-full text-xs font-bold transition-all jelly-btn flex items-center gap-1 ${
              activeTab === 'custom'
                ? 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] shadow-[0_0_12px_rgba(255,142,203,0.5)]'
                : 'text-[#b7a2d9] hover:text-[#ff8ecb]'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>自定义上传</span>
          </button>
          <button
            onClick={() => setActiveTab('preset')}
            className={`px-3 sm:px-4 py-1 rounded-full text-xs font-bold transition-all jelly-btn flex items-center gap-1 ${
              activeTab === 'preset'
                ? 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] shadow-[0_0_12px_rgba(255,142,203,0.5)]'
                : 'text-[#b7a2d9] hover:text-[#ff8ecb]'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>精选横幅</span>
          </button>
          <button
            onClick={() => setActiveTab('solid')}
            className={`px-3 sm:px-4 py-1 rounded-full text-xs font-bold transition-all jelly-btn flex items-center gap-1 ${
              activeTab === 'solid'
                ? 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] shadow-[0_0_12px_rgba(255,142,203,0.5)]'
                : 'text-[#b7a2d9] hover:text-[#ff8ecb]'
            }`}
          >
            <Palette className="w-3 h-3" />
            <span>纯色渐变</span>
          </button>
        </div>

        {/* 标签 1: 自定义上传系统 (支持本地图片智能压缩、网络URL输入、宽幅大预览) */}
        {activeTab === 'custom' && (
          <div className="space-y-3.5 py-1">
            {/* 横幅大尺寸宽屏预览区 */}
            <div className="relative aspect-[16/7] w-full rounded-2xl border-2 border-[#ff8ecb] overflow-hidden bg-[#231535] shadow-[0_0_18px_rgba(255,142,203,0.35)] flex items-center justify-center">
              {previewCustomImg ? (
                <img
                  src={previewCustomImg}
                  alt="横幅预览"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  style={getUniversalBannerStyle(selectedBannerVal)}
                  className="w-full h-full"
                ></div>
              )}

              {/* 空间暗色通透浮层效果提示 */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none"></div>
              <div className="absolute bottom-2 left-3 text-[10px] text-white/90 drop-shadow font-bold">
                空间封面实时显示效果
              </div>
            </div>

            {/* 本地上传拖拽/点击区域 */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-3.5 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                isDragging
                  ? 'border-[#ff8ecb] bg-[#ff8ecb]/15 scale-[1.01]'
                  : 'border-[#4b3670] hover:border-[#ff8ecb] bg-[#140b1c]/80 hover:bg-[#1b0f24]'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[#ff8ecb]/20 text-[#ff8ecb] flex items-center justify-center">
                <Upload className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="text-xs font-bold text-[#f7d6e8] text-center">
                点击选择相册横幅 或 拖拽至此处
              </div>
              <div className="text-[10px] text-[#b7a2d9]/60 text-center">
                支持各类相机大图，系统将自动智能压缩适配横幅比例
              </div>
            </div>

            {/* 状态反馈提示 */}
            {uploadFeedback && (
              <div className="text-[10px] text-center text-[#80ffdb] font-mono animate-in fade-in">
                {uploadFeedback}
              </div>
            )}

            {/* 网络图片 URL 输入框 */}
            <div className="flex items-center gap-1.5 bg-[#120b18] px-3 py-1.5 rounded-xl border border-[#4b3670] focus-within:border-[#ff8ecb]">
              <Link2 className="w-3.5 h-3.5 text-[#b7a2d9] shrink-0" />
              <input
                type="text"
                value={customInputUrl}
                onChange={(e) => setCustomInputUrl(e.target.value)}
                placeholder="或输入网络背景图片 URL..."
                className="w-full bg-transparent text-xs text-[#f7d6e8] focus:outline-none font-mono"
              />
              <button
                onClick={handleApplyUrl}
                className="px-2.5 py-1 rounded-lg bg-[#2e1d3e] text-[10px] font-bold text-[#ff8ecb] hover:bg-[#3d2652] shrink-0 jelly-btn"
              >
                预览
              </button>
            </div>

            {/* 最近上传过的自定义横幅 */}
            {recentBanners.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] text-[#b7a2d9] flex items-center justify-between">
                  <span>最近上传过：</span>
                  <button
                    onClick={() => {
                      setRecentBanners([]);
                      try {
                        localStorage.removeItem('recent_custom_banners_v2');
                      } catch {}
                    }}
                    className="text-[#b7a2d9]/50 hover:text-red-400"
                    title="清空历史"
                  >
                    清空
                  </button>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {recentBanners.map((bn, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedBannerVal(bn);
                        setPreviewCustomImg(bn);
                        setUploadFeedback('✓ 已选定历史横幅');
                      }}
                      className="w-16 h-10 rounded-xl overflow-hidden border border-[#4b3670] hover:border-[#ff8ecb] shrink-0 relative jelly-btn"
                    >
                      <img src={bn} alt="历史横幅" className="w-full h-full object-cover" />
                      {selectedBannerVal === bn && (
                        <div className="absolute inset-0 bg-[#ff8ecb]/30 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 隐藏的本地文件输入 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {/* 标签 2: 推荐横幅网格 */}
        {activeTab === 'preset' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-1 scrollbar-none">
            {PRESET_BANNERS.map((preset) => {
              const isSelected = selectedBannerVal === preset.id;

              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedBannerVal(preset.id);
                    setPreviewCustomImg(null);
                  }}
                  className={`aspect-[16/10] rounded-xl relative transition-all overflow-hidden border jelly-btn flex flex-col justify-end p-1.5 group ${
                    isSelected
                      ? 'border-[#ff8ecb] ring-2 ring-[#ff8ecb] shadow-[0_0_14px_rgba(255,142,203,0.6)] scale-[1.02]'
                      : 'border-[#4a2e66] hover:border-[#d88fbf]'
                  }`}
                  title={preset.name}
                >
                  {/* 背景渲染 */}
                  {preset.type === 'image' && preset.imageUrl ? (
                    <img
                      src={preset.imageUrl}
                      alt={preset.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 w-full h-full"
                      style={{ background: preset.gradientStyle }}
                    ></div>
                  )}

                  {/* 暗色浮层 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                  {/* 选中粉红对勾 */}
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#ff8ecb] text-[#1a1120] flex items-center justify-center shadow-md z-10">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}

                  {/* 标签文字 */}
                  <span className="relative z-10 text-[9px] font-bold text-white drop-shadow truncate">
                    {preset.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* 标签 3: 纯色 / 渐变横幅 */}
        {activeTab === 'solid' && (
          <div className="grid grid-cols-2 gap-2.5 max-h-64 overflow-y-auto p-1 scrollbar-none">
            {SOLID_BANNER_GRADIENTS.map((item) => {
              const isSelected = selectedBannerVal === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedBannerVal(item.id);
                    setPreviewCustomImg(null);
                  }}
                  style={{ background: item.style }}
                  className={`aspect-[16/8] rounded-xl border relative transition-all p-2 flex items-end overflow-hidden jelly-btn ${
                    isSelected
                      ? 'border-[#ff8ecb] ring-2 ring-[#ff8ecb] shadow-[0_0_14px_rgba(255,142,203,0.6)] scale-[1.02]'
                      : 'border-[#4a2e66] hover:border-[#d88fbf]'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#ff8ecb] text-[#1a1120] flex items-center justify-center shadow-md">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                  <span className="text-[10px] font-bold text-white drop-shadow">
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* 底部动作条 */}
        <div className="pt-2 border-t border-[#3b2a5a] flex items-center justify-between">
          <span className="text-xs text-[#ff8ecb]">🪄</span>

          <button
            onClick={handleConfirm}
            className="flex-1 mx-2 py-2 rounded-full bg-gradient-to-r from-[#d88fbf] via-[#ff8ecb] to-[#d88fbf] text-[#1a1120] hover:brightness-105 text-xs font-bold shadow-[0_0_16px_rgba(255,142,203,0.45)] flex items-center justify-center gap-1.5 jelly-btn cursor-pointer transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#1a1120]" />
            <span>保存并应用横幅背景</span>
          </button>

          <div className="w-6 h-6 flex items-center justify-center text-[#ff8ecb]">
            <Sliders className="w-4 h-4 stroke-[2]" />
          </div>
        </div>
      </div>
    </div>
  );
};
