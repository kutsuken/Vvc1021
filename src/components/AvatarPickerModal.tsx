import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Upload,
  Check,
  Image as ImageIcon,
  Heart,
  Palette,
  Camera,
  Trash2,
  RefreshCw,
  Link2,
} from 'lucide-react';
import {
  PixelBunny,
  PixelBlackCat,
  PixelHeart,
  PixelBow,
  PixelSparkle,
  PixelIconContacts,
  PixelIconQQ,
} from './PixelAssets';
import { LineFish, LineBird, LineCup, LineCloudStar } from './LineArtDoodles';
import doodleImg from '../assets/images/white_purple_doodle_1790865833998.jpg';
import jellyfishImg from '../assets/images/jellyfish_jirai_girl_1790865819888.jpg';

// 12 款精心设计的地雷系 / 像素少女风预设头像
export interface AvatarPreset {
  id: string;
  name: string;
  type: 'component' | 'image' | 'svg';
  component?: React.ReactNode;
  imageUrl?: string;
  svgData?: React.ReactNode;
  bgGradient: string;
}

export const PRESET_AVATARS: AvatarPreset[] = [
  {
    id: 'preset_bunny_bow',
    name: '缎带甜心兔',
    type: 'component',
    component: <PixelBunny className="w-10 h-10" />,
    bgGradient: 'from-[#3a2050] to-[#1c0f2a]',
  },
  {
    id: 'preset_cat_dark',
    name: '极夜小黑猫',
    type: 'component',
    component: <PixelBlackCat className="w-10 h-10" />,
    bgGradient: 'from-[#231535] to-[#140b1e]',
  },
  {
    id: 'preset_heart_pixel',
    name: '像素跳动心',
    type: 'component',
    component: <PixelHeart className="w-9 h-9" color="#ff8ecb" />,
    bgGradient: 'from-[#421d3f] to-[#1d0e23]',
  },
  {
    id: 'preset_bow_pink',
    name: '蕾丝蝴蝶结',
    type: 'component',
    component: <PixelBow className="w-9 h-9" />,
    bgGradient: 'from-[#381c47] to-[#170c22]',
  },
  {
    id: 'preset_doodle_white',
    name: '白紫简笔画',
    type: 'image',
    imageUrl: doodleImg,
    bgGradient: 'from-[#2d1b3e] to-[#140b1c]',
  },
  {
    id: 'preset_jellyfish_girl',
    name: '水母地雷妹',
    type: 'image',
    imageUrl: jellyfishImg,
    bgGradient: 'from-[#3d2050] to-[#1d0f28]',
  },
  {
    id: 'preset_contacts_girl',
    name: '赛博双马尾',
    type: 'component',
    component: <PixelIconContacts className="w-10 h-10" />,
    bgGradient: 'from-[#321c45] to-[#160d21]',
  },
  {
    id: 'preset_broken_heart',
    name: '地雷碎心翅',
    type: 'svg',
    bgGradient: 'from-[#451e3b] to-[#1a0b18]',
    svgData: (
      <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ff4d79" />
        <path d="M11 5l2 5-3 3 3 5" stroke="#180e22" strokeWidth="2" strokeLinecap="round" />
        <circle cx="6" cy="7" r="1.5" fill="#ffffff" />
      </svg>
    ),
  },
  {
    id: 'preset_sparkle_star',
    name: '星芒治愈心',
    type: 'svg',
    bgGradient: 'from-[#3a2558] to-[#180e28]',
    svgData: (
      <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none">
        <rect x="4" y="4" width="16" height="16" rx="4" fill="#2d1744" stroke="#ff8ecb" strokeWidth="1.5" />
        <path d="M12 6v12M6 12h12" stroke="#ff8ecb" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="2.5" fill="#ffffff" />
        <circle cx="8" cy="8" r="1" fill="#ffe082" />
        <circle cx="16" cy="16" r="1" fill="#ffe082" />
      </svg>
    ),
  },
  {
    id: 'preset_dark_bunny_cross',
    name: '暗黑十字兔',
    type: 'svg',
    bgGradient: 'from-[#221330] to-[#0f0717]',
    svgData: (
      <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none">
        <circle cx="12" cy="14" r="7" fill="#1f112b" stroke="#d88fbf" strokeWidth="1.5" />
        <path d="M8 8V3h3v5M13 8V3h3v5" fill="#1f112b" stroke="#d88fbf" strokeWidth="1.5" />
        <circle cx="9.5" cy="13.5" r="1.5" fill="#ff4d79" />
        <circle cx="14.5" cy="13.5" r="1.5" fill="#ff4d79" />
        <path d="M12 9v4M10 11h4" stroke="#d88fbf" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'preset_diamond_heart',
    name: '发光钻心兔',
    type: 'svg',
    bgGradient: 'from-[#3d1d4d] to-[#190c23]',
    svgData: (
      <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none">
        <path d="M12 2l3 6 6 1-4.5 4.5 1 6.5L12 17l-5.5 3 1-6.5L3 9l6-1z" fill="#ff8ecb" opacity="0.85" />
        <circle cx="12" cy="12" r="3" fill="#ffffff" />
      </svg>
    ),
  },
  {
    id: 'preset_cyber_bunny',
    name: '赛博电波兔',
    type: 'svg',
    bgGradient: 'from-[#241a45] to-[#110b24]',
    svgData: (
      <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none">
        <rect x="3" y="5" width="18" height="14" rx="4" fill="#1d1238" stroke="#80ffdb" strokeWidth="1.5" />
        <path d="M7 2v3M17 2v3" stroke="#80ffdb" strokeWidth="2" strokeLinecap="round" />
        <circle cx="8" cy="12" r="1.5" fill="#80ffdb" />
        <circle cx="16" cy="12" r="1.5" fill="#80ffdb" />
        <path d="M11 14h2" stroke="#ff8ecb" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

// 纯色 / 渐变色色板
export const SOLID_AVATAR_COLORS = [
  { id: 'solid_1', name: '暗夜暮黑', value: '#130a1c', text: '#ff8ecb' },
  { id: 'solid_2', name: '极夜紫黑', value: '#241438', text: '#f7d6e8' },
  { id: 'solid_3', name: '深莓粉紫', value: '#58245f', text: '#ffffff' },
  { id: 'solid_4', name: '地雷甜粉', value: '#ff8ecb', text: '#1a1120' },
  { id: 'solid_5', name: '薰衣草粉', value: '#d88fbf', text: '#1a1120' },
  { id: 'solid_6', name: '奶霜浅白', value: '#fcedf5', text: '#2e1d3e' },
  { id: 'solid_7', name: '赛博薄荷', value: '#80ffdb', text: '#120b18' },
  { id: 'solid_8', name: '暗夜星河', value: '#1a1120', text: '#d88fbf' },
  { id: 'grad_1', name: '暮夜流光', value: 'linear-gradient(135deg, #2b1442 0%, #4a1d4e 100%)', text: '#ffffff' },
  { id: 'grad_2', name: '粉樱幻霞', value: 'linear-gradient(135deg, #d88fbf 0%, #ff8ecb 100%)', text: '#1a1120' },
  { id: 'grad_3', name: '霓虹极夜', value: 'linear-gradient(135deg, #1f1138 0%, #00b4d8 100%)', text: '#ffffff' },
  { id: 'grad_4', name: '暗黑玫瑰', value: 'linear-gradient(135deg, #160a1e 0%, #7209b7 100%)', text: '#ff8ecb' },
];

/**
 * 全局通用的头像渲染函数，支持 Base64、URL、所有预设、纯色与旧版快捷标识符
 */
export const renderUniversalAvatar = (avatarVal: string | undefined, sizeClass = 'w-6 h-6'): React.ReactNode => {
  if (!avatarVal) {
    return <PixelBunny className={sizeClass} />;
  }

  // 1. 本地 Base64 或网络图片 URL
  if (avatarVal.startsWith('data:image') || avatarVal.startsWith('http://') || avatarVal.startsWith('https://') || avatarVal.startsWith('/')) {
    return (
      <img
        src={avatarVal}
        alt="头像"
        className="w-full h-full object-cover"
        onError={(e) => {
          // 图片失效回退为萌兔
          (e.currentTarget as HTMLElement).style.display = 'none';
        }}
      />
    );
  }

  // 2. 匹配预设头像
  const foundPreset = PRESET_AVATARS.find((p) => p.id === avatarVal);
  if (foundPreset) {
    if (foundPreset.type === 'image' && foundPreset.imageUrl) {
      return <img src={foundPreset.imageUrl} alt={foundPreset.name} className="w-full h-full object-cover" />;
    }
    if (foundPreset.type === 'svg' && foundPreset.svgData) {
      return foundPreset.svgData;
    }
    return foundPreset.component;
  }

  // 3. 匹配纯色 / 渐变
  const foundSolid = SOLID_AVATAR_COLORS.find((s) => s.id === avatarVal);
  if (foundSolid) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ background: foundSolid.value }}>
        <PixelHeart className="w-5 h-5" color={foundSolid.text} />
      </div>
    );
  }

  // 4. 经典标识符映射
  const classicMap: Record<string, any> = {
    cat: PixelBlackCat,
    girl: PixelIconContacts,
    qq: PixelIconQQ,
    bow: PixelBow,
    heart: PixelHeart,
    sparkle: PixelSparkle,
    bunny: PixelBunny,
    fish: LineFish,
    bird: LineBird,
    cup: LineCup,
    star: LineCloudStar,
  };

  const Comp = classicMap[avatarVal] || PixelBunny;
  return <Comp className={sizeClass} />;
};

interface AvatarPickerModalProps {
  currentAvatar: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectAvatar: (avatarVal: string) => void;
  title?: string;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  currentAvatar,
  isOpen,
  onClose,
  onSelectAvatar,
  title = '头像上传与选择系统',
}) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'solid' | 'custom'>('custom');
  const [selectedAvatarVal, setSelectedAvatarVal] = useState<string>(currentAvatar || 'bunny');
  const [customInputUrl, setCustomInputUrl] = useState<string>('');
  const [previewCustomImg, setPreviewCustomImg] = useState<string | null>(
    currentAvatar?.startsWith('data:image') || currentAvatar?.startsWith('http') ? currentAvatar : null
  );
  const [uploadFeedback, setUploadFeedback] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 存储最近上传过的自定义头像
  const [recentAvatars, setRecentAvatars] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('recent_custom_avatars_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (isOpen) {
      setSelectedAvatarVal(currentAvatar || 'bunny');
      if (currentAvatar?.startsWith('data:image') || currentAvatar?.startsWith('http')) {
        setPreviewCustomImg(currentAvatar);
        setActiveTab('custom');
      }
    }
  }, [isOpen, currentAvatar]);

  if (!isOpen) return null;

  // 使用 Canvas 自动进行中心正方形裁剪与压缩，保证任何形状照片不变形、体积小
  const processAndCompressImage = (imageFile: File) => {
    setUploadFeedback('正在优化图片尺寸...');
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const targetSize = 240; // 240x240 超清正方形，体积约 20-40KB
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 计算居中正方形裁剪区域
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, targetSize, targetSize);

        // 优先使用 webp，不支持则使用 jpeg
        let base64 = canvas.toDataURL('image/jpeg', 0.88);
        setPreviewCustomImg(base64);
        setSelectedAvatarVal(base64);
        setUploadFeedback(`✓ 图片已裁剪并压缩完毕 (${Math.round((base64.length * 3) / 4 / 1024)} KB)`);

        // 保存到最近记录
        setRecentAvatars((prev) => {
          const filtered = prev.filter((a) => a !== base64);
          const next = [base64, ...filtered].slice(0, 6);
          try {
            localStorage.setItem('recent_custom_avatars_v2', JSON.stringify(next));
          } catch {}
          return next;
        });
      };
      img.onerror = () => {
        setUploadFeedback('⚠️ 图片解析失败，请尝试其他图片');
      };
      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(imageFile);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndCompressImage(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processAndCompressImage(file);
    }
  };

  const handleApplyUrl = () => {
    const url = customInputUrl.trim();
    if (!url) return;
    setPreviewCustomImg(url);
    setSelectedAvatarVal(url);
    setUploadFeedback('✓ 已连接网络图片');

    setRecentAvatars((prev) => {
      const filtered = prev.filter((a) => a !== url);
      const next = [url, ...filtered].slice(0, 6);
      try {
        localStorage.setItem('recent_custom_avatars_v2', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleConfirm = () => {
    onSelectAvatar(selectedAvatarVal);
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
            <span>精选推荐</span>
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

        {/* 标签 1: 自定义上传系统 (支持本地图片智能居中裁剪、网络URL输入、双形态预览) */}
        {activeTab === 'custom' && (
          <div className="space-y-3.5 py-1">
            {/* 头像双形态实时预览 (大圆环与微圆角) */}
            <div className="flex items-center justify-center gap-6 py-1">
              {/* 圆形 (空间/QQ通用) */}
              <div className="flex flex-col items-center gap-1">
                <div className="relative w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-[#ff8ecb] via-[#d88fbf] to-[#9b5de5] shadow-[0_0_16px_rgba(255,142,203,0.4)]">
                  <div className="w-full h-full rounded-full bg-[#231535] overflow-hidden flex items-center justify-center">
                    {previewCustomImg ? (
                      <img src={previewCustomImg} alt="预览" className="w-full h-full object-cover" />
                    ) : (
                      renderUniversalAvatar(selectedAvatarVal, 'w-10 h-10')
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#ff8ecb] text-[#180d22] shadow">
                    <Camera className="w-3 h-3" />
                  </div>
                </div>
                <span className="text-[10px] text-[#b7a2d9]/80">空间大圆预览</span>
              </div>

              {/* 圆角正方形 (对话气泡/个人主页) */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-18 h-18 rounded-2xl p-[2px] bg-[#3b2a5a] border border-[#ff8ecb]/50 shadow-md">
                  <div className="w-full h-full rounded-2xl bg-[#231535] overflow-hidden flex items-center justify-center">
                    {previewCustomImg ? (
                      <img src={previewCustomImg} alt="预览" className="w-full h-full object-cover" />
                    ) : (
                      renderUniversalAvatar(selectedAvatarVal, 'w-9 h-9')
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-[#b7a2d9]/80">消息方圆预览</span>
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
                点击选择相册照片 或 拖拽至此处
              </div>
              <div className="text-[10px] text-[#b7a2d9]/60 text-center">
                支持 JPG / PNG / GIF / WebP，自动居中适配为正方形
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
                placeholder="或输入网络图片 URL..."
                className="w-full bg-transparent text-xs text-[#f7d6e8] focus:outline-none font-mono"
              />
              <button
                onClick={handleApplyUrl}
                className="px-2.5 py-1 rounded-lg bg-[#2e1d3e] text-[10px] font-bold text-[#ff8ecb] hover:bg-[#3d2652] shrink-0 jelly-btn"
              >
                预览
              </button>
            </div>

            {/* 最近使用过的自定义头像 */}
            {recentAvatars.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] text-[#b7a2d9] flex items-center justify-between">
                  <span>最近上传过：</span>
                  <button
                    onClick={() => {
                      setRecentAvatars([]);
                      try {
                        localStorage.removeItem('recent_custom_avatars_v2');
                      } catch {}
                    }}
                    className="text-[#b7a2d9]/50 hover:text-red-400"
                    title="清空历史"
                  >
                    清空
                  </button>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {recentAvatars.map((av, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedAvatarVal(av);
                        setPreviewCustomImg(av);
                        setUploadFeedback('✓ 已选定历史头像');
                      }}
                      className="w-9 h-9 rounded-xl overflow-hidden border border-[#4b3670] hover:border-[#ff8ecb] shrink-0 relative jelly-btn"
                    >
                      <img src={av} alt="历史头像" className="w-full h-full object-cover" />
                      {selectedAvatarVal === av && (
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

        {/* 标签 2: 推荐预设头像网格 */}
        {activeTab === 'preset' && (
          <div className="grid grid-cols-4 gap-2.5 max-h-64 overflow-y-auto p-1 scrollbar-none">
            {PRESET_AVATARS.map((preset) => {
              const isSelected = selectedAvatarVal === preset.id;

              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedAvatarVal(preset.id);
                    setPreviewCustomImg(null);
                  }}
                  className={`aspect-square rounded-2xl p-1 bg-gradient-to-b ${preset.bgGradient} border relative transition-all flex flex-col items-center justify-center group overflow-hidden jelly-btn ${
                    isSelected
                      ? 'border-[#ff8ecb] ring-2 ring-[#ff8ecb] shadow-[0_0_14px_rgba(255,142,203,0.6)] scale-[1.03]'
                      : 'border-[#4a2e66] hover:border-[#d88fbf]'
                  }`}
                  title={preset.name}
                >
                  <div className="w-full h-full rounded-xl overflow-hidden flex items-center justify-center">
                    {preset.type === 'image' && preset.imageUrl ? (
                      <img src={preset.imageUrl} alt={preset.name} className="w-full h-full object-cover" />
                    ) : preset.type === 'svg' && preset.svgData ? (
                      preset.svgData
                    ) : (
                      preset.component
                    )}
                  </div>

                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#ff8ecb] text-[#1a1120] flex items-center justify-center shadow-md">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}

                  <span className="sr-only">{preset.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* 标签 3: 纯色 / 渐变色头像 */}
        {activeTab === 'solid' && (
          <div className="grid grid-cols-4 gap-2.5 max-h-64 overflow-y-auto p-1 scrollbar-none">
            {SOLID_AVATAR_COLORS.map((col) => {
              const isSelected = selectedAvatarVal === col.id;

              return (
                <button
                  key={col.id}
                  onClick={() => {
                    setSelectedAvatarVal(col.id);
                    setPreviewCustomImg(null);
                  }}
                  style={{ background: col.value }}
                  className={`aspect-square rounded-2xl border relative transition-all flex flex-col items-center justify-center p-1 overflow-hidden jelly-btn ${
                    isSelected
                      ? 'border-[#ff8ecb] ring-2 ring-[#ff8ecb] shadow-[0_0_14px_rgba(255,142,203,0.6)] scale-[1.03]'
                      : 'border-[#4a2e66] hover:border-[#d88fbf]'
                  }`}
                  title={col.name}
                >
                  <PixelHeart className="w-6 h-6 opacity-85" color={col.text} />
                  <span className="text-[9px] font-bold mt-0.5 truncate max-w-full px-1" style={{ color: col.text }}>
                    {col.name}
                  </span>

                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#ff8ecb] text-[#1a1120] flex items-center justify-center shadow-md">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
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
            <span>保存并应用头像</span>
          </button>

          <div className="w-6 h-6 flex items-center justify-center">
            <PixelBunny className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
