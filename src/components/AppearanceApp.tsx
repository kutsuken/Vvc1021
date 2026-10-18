import React, { useState } from 'react';
import {
  ArrowLeft,
  X,
  Check,
  Upload,
  RotateCcw,
  Sparkles,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import { PixelBow, PixelSparkle, PixelHeart } from './PixelAssets';
import jiraiWallpaperUrl from '../assets/images/jirai_pixel_wallpaper_1790861769109.jpg';
import whitePurpleDoodleUrl from '../assets/images/white_purple_doodle_1790865833998.jpg';
import jellyfishGirlUrl from '../assets/images/jellyfish_jirai_girl_1790865819888.jpg';
import mizuiroWallpaperUrl from '../assets/images/mizuiro_pixel_wallpaper_1791480632462.jpg';

export interface WallpaperPreset {
  id: string;
  name: string;
  subtitle: string;
  url: string;
}

export const PRESET_WALLPAPERS: WallpaperPreset[] = [
  {
    id: 'mizuiro_sky',
    name: '水色云隙',
    subtitle: '蓝白水色像素 · 浮云小兔小鱼 (全新)',
    url: mizuiroWallpaperUrl,
  },
  {
    id: 'dark_purple',
    name: '暗夜暮紫',
    subtitle: '暮紫像素夜空 · 古堡剪影',
    url: jiraiWallpaperUrl,
  },
  {
    id: 'white_purple_doodle',
    name: '白紫简笔画',
    subtitle: '白紫色极简线条 · 治愈星猫',
    url: whitePurpleDoodleUrl,
  },
  {
    id: 'jellyfish_girl',
    name: '水母头少女',
    subtitle: '紫色水母头 · 渐变紫瞳地雷系',
    url: jellyfishGirlUrl,
  },
];

interface AppearanceAppProps {
  onBack: () => void;
  currentWallpaperId: string;
  onChangeWallpaper: (id: string, customUrl?: string) => void;
  customWallpapers: string[];
  onAddCustomWallpaper: (url: string) => void;
  onDeleteCustomWallpaper?: (url: string) => void;
  onResetAppOrder: () => void;
  currentTheme: string;
  onChangeTheme: (theme: string) => void;
}

export const AppearanceApp: React.FC<AppearanceAppProps> = ({
  onBack,
  currentWallpaperId,
  onChangeWallpaper,
  customWallpapers,
  onAddCustomWallpaper,
  onDeleteCustomWallpaper,
  onResetAppOrder,
  currentTheme,
  onChangeTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'wallpaper' | 'icon' | 'theme'>('wallpaper');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleUploadWallpaper = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      onAddCustomWallpaper(base64Url);
      onChangeWallpaper(`custom_${Date.now()}`, base64Url);
    };
    reader.readAsDataURL(file);
  };

  const isAqua = currentTheme === 'aqua_pixel';

  const handleResetOrder = () => {
    onResetAppOrder();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2000);
  };

  return (
    <div
      className={`flex-1 flex flex-col select-none overflow-hidden relative font-mono transition-colors duration-200 ${
        isAqua
          ? 'bg-gradient-to-b from-[#f0f9ff] via-[#e0f2fe] to-[#bae6fd] text-[#0284c7]'
          : 'bg-gradient-to-b from-[#180f21] via-[#120b18] to-[#0a050e] text-[#f7d6e8]'
      }`}
    >
      {/* 顶部标题栏 (依照参考图中的「美化」面板设计) */}
      <div
        className={`h-12 px-4 flex items-center justify-between border-b backdrop-blur-md z-20 ${
          isAqua
            ? 'border-[#7dd3fc] bg-white/95 text-[#0284c7]'
            : 'border-[#3b2a5a] bg-[#1e1328]/95 text-[#f7d6e8]'
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-lg border flex items-center justify-center ${
              isAqua
                ? 'bg-[#e0f2fe] border-[#7dd3fc] text-[#0284c7]'
                : 'bg-[#2e1d3e] border-[#d88fbf]/50 text-[#ff8ecb]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span
            className={`text-sm font-bold tracking-wider ${
              isAqua ? 'text-[#0284c7]' : 'text-[#f7d6e8]'
            }`}
          >
            美化 · 外观与全套主题
          </span>
        </div>

        <button
          onClick={onBack}
          className={`p-1.5 rounded-lg transition-colors jelly-btn ${
            isAqua
              ? 'text-[#0284c7] hover:bg-[#e0f2fe]'
              : 'text-[#d88fbf] hover:text-white hover:bg-[#2c1a3b]'
          }`}
        >
          <X className="w-5 h-5 stroke-[2]" />
        </button>
      </div>

      {/* 顶部三段切换选项卡 (依照参考图中的「壁纸 | 图标 | 主题」) */}
      <div
        className={`p-3 border-b ${
          isAqua
            ? 'bg-[#f0f9ff]/90 border-[#7dd3fc]/60'
            : 'bg-[#191024]/80 border-[#3b2a5a]/60'
        }`}
      >
        <div
          className={`grid grid-cols-3 gap-1.5 p-1 rounded-xl border ${
            isAqua
              ? 'bg-white/90 border-[#7dd3fc]'
              : 'bg-[#150d1e] border-[#3b2a5a]'
          }`}
        >
          <button
            onClick={() => setActiveTab('wallpaper')}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'wallpaper'
                ? isAqua
                  ? 'bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-white shadow-[0_2px_8px_rgba(56,189,248,0.35)]'
                  : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] shadow-[0_2px_8px_rgba(255,142,203,0.35)]'
                : isAqua
                ? 'text-[#0284c7]/70 hover:text-[#0284c7] hover:bg-[#e0f2fe]'
                : 'text-[#b7a2d9] hover:text-white hover:bg-[#221535]'
            }`}
          >
            壁纸
          </button>
          <button
            onClick={() => setActiveTab('icon')}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'icon'
                ? isAqua
                  ? 'bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-white shadow-[0_2px_8px_rgba(56,189,248,0.35)]'
                  : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] shadow-[0_2px_8px_rgba(255,142,203,0.35)]'
                : isAqua
                ? 'text-[#0284c7]/70 hover:text-[#0284c7] hover:bg-[#e0f2fe]'
                : 'text-[#b7a2d9] hover:text-white hover:bg-[#221535]'
            }`}
          >
            图标
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'theme'
                ? isAqua
                  ? 'bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-white shadow-[0_2px_8px_rgba(56,189,248,0.35)]'
                  : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] shadow-[0_2px_8px_rgba(255,142,203,0.35)]'
                : isAqua
                ? 'text-[#0284c7]/70 hover:text-[#0284c7] hover:bg-[#e0f2fe]'
                : 'text-[#b7a2d9] hover:text-white hover:bg-[#221535]'
            }`}
          >
            主题
          </button>
        </div>
      </div>

      {/* 内容滚动展示区 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: 壁纸切换区 */}
        {activeTab === 'wallpaper' && (
          <div className="space-y-4">
            <div
              className={`flex items-center justify-between text-xs px-0.5 ${
                isAqua ? 'text-[#0369a1]' : 'text-[#b7a2d9]'
              }`}
            >
              <span>点击直接设为当前桌面壁纸：</span>
              <span className={`text-[10px] ${isAqua ? 'text-[#0284c7] font-bold' : 'text-[#ff8ecb]'}`}>
                即点即生效 ✦
              </span>
            </div>

            {/* 3 列壁纸网格 */}
            <div className="grid grid-cols-3 gap-3">
              {PRESET_WALLPAPERS.map((wp) => {
                const isSelected = currentWallpaperId === wp.id;
                return (
                  <div
                    key={wp.id}
                    onClick={() => onChangeWallpaper(wp.id, wp.url)}
                    className="flex flex-col gap-1.5 cursor-pointer group select-none"
                  >
                    <div
                      className={`relative aspect-[9/16] rounded-2xl overflow-hidden border-2 transition-all shadow-md ${
                        isSelected
                          ? isAqua
                            ? 'border-[#0284c7] shadow-[0_0_16px_rgba(56,189,248,0.5)] scale-[1.02]'
                            : 'border-[#ff8ecb] shadow-[0_0_16px_rgba(255,142,203,0.45)] scale-[1.02]'
                          : isAqua
                          ? 'border-[#bae6fd] group-hover:border-[#38bdf8] opacity-90 group-hover:opacity-100'
                          : 'border-[#3b2a5a] group-hover:border-[#d88fbf] opacity-85 group-hover:opacity-100'
                      }`}
                    >
                      <img
                        src={wp.url}
                        alt={wp.name}
                        className="w-full h-full object-cover object-center"
                      />

                      {/* 选中高亮徽章 */}
                      {isSelected && (
                        <div
                          className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow-md ${
                            isAqua
                              ? 'bg-[#0284c7] text-white'
                              : 'bg-[#ff8ecb] text-[#1a1120]'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-[11px] font-bold truncate ${
                          isSelected
                            ? isAqua
                              ? 'text-[#0284c7]'
                              : 'text-[#ff8ecb]'
                            : isAqua
                            ? 'text-[#0369a1]'
                            : 'text-[#f7d6e8]'
                        }`}
                      >
                        {wp.name}
                      </div>
                      <div
                        className={`text-[9px] truncate ${
                          isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9] opacity-75'
                        }`}
                      >
                        {wp.subtitle}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* 用户自定义上传壁纸展示 */}
              {customWallpapers.map((customUrl, index) => {
                const customId = `custom_${index}`;
                const isSelected = currentWallpaperId === customId;
                return (
                  <div
                    key={customId}
                    onClick={() => onChangeWallpaper(customId, customUrl)}
                    className="flex flex-col gap-1.5 cursor-pointer group relative"
                  >
                    <div
                      className={`relative aspect-[9/16] rounded-2xl overflow-hidden border-2 transition-all shadow-md ${
                        isSelected
                          ? isAqua
                            ? 'border-[#0284c7] shadow-[0_0_16px_rgba(56,189,248,0.5)] scale-[1.02]'
                            : 'border-[#ff8ecb] shadow-[0_0_16px_rgba(255,142,203,0.45)] scale-[1.02]'
                          : isAqua
                          ? 'border-[#bae6fd] group-hover:border-[#38bdf8]'
                          : 'border-[#3b2a5a] group-hover:border-[#d88fbf]'
                      }`}
                    >
                      <img
                        src={customUrl}
                        alt="自定义"
                        className="w-full h-full object-cover object-center"
                      />
                      {isSelected && (
                        <div
                          className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow-md ${
                            isAqua
                              ? 'bg-[#0284c7] text-white'
                              : 'bg-[#ff8ecb] text-[#1a1120]'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                      {onDeleteCustomWallpaper && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCustomWallpaper(customUrl);
                          }}
                          className="absolute bottom-1 right-1 p-1 bg-black/60 rounded-md text-rose-300 hover:text-white"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div
                      className={`text-center text-[11px] font-bold truncate ${
                        isAqua ? 'text-[#0284c7]' : 'text-[#f7d6e8]'
                      }`}
                    >
                      自定义壁纸 {index + 1}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 底部「✦ 上传图片」胶囊按钮 */}
            <div className="pt-2 flex justify-center">
              <label
                className={`w-full max-w-[260px] py-2.5 px-4 rounded-full border-2 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer jelly-btn ${
                  isAqua
                    ? 'border-[#38bdf8] bg-white text-[#0284c7] shadow-[0_4px_16px_rgba(56,189,248,0.25)] hover:bg-[#f0f9ff]'
                    : 'border-[#d88fbf] bg-gradient-to-r from-[#241535] to-[#1c1126] hover:from-[#351c4a] hover:to-[#281838] text-[#ff8ecb] shadow-[0_4px_16px_rgba(216,143,191,0.25)]'
                }`}
              >
                <span>✦ 上传图片</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadWallpaper}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* TAB 2: 图标复位区 */}
        {activeTab === 'icon' && (
          <div className="space-y-4">
            <div
              className={`rounded-2xl border p-4 space-y-3 shadow-md ${
                isAqua
                  ? 'bg-white/90 border-[#7dd3fc] text-[#0284c7]'
                  : 'bg-[#1e1329]/85 border-[#3b2a5a] text-[#f7d6e8]'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
                    isAqua
                      ? 'bg-[#e0f2fe] border-[#7dd3fc] text-[#0284c7]'
                      : 'bg-[#2e1d3e] border-[#d88fbf]/50 text-[#ff8ecb]'
                  }`}
                >
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <div className={`text-xs font-bold ${isAqua ? 'text-[#0284c7]' : 'text-[#f7d6e8]'}`}>
                    桌面图标排列复位
                  </div>
                  <div className={`text-[10px] mt-0.5 ${isAqua ? 'text-[#0369a1]/80' : 'text-[#b7a2d9]'}`}>
                    一键还原为系统默认主屏顺序（仓库、QQ、世界书、预设、线下、记忆）
                  </div>
                </div>
              </div>

              <div
                className={`text-[11px] leading-relaxed p-3 rounded-xl border ${
                  isAqua
                    ? 'bg-[#f0f9ff] text-[#0369a1] border-[#bae6fd]'
                    : 'bg-[#160c20] text-[#b7a2d9] border-[#3b2a5a]/60'
                }`}
              >
                长按拖拽整理桌面后，若想回归默认布局，可随时点击下方按钮进行一键复位。
              </div>

              <button
                onClick={handleResetOrder}
                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 jelly-btn ${
                  isAqua
                    ? 'bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-white shadow-[0_2px_12px_rgba(56,189,248,0.35)]'
                    : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] shadow-[0_2px_12px_rgba(255,142,203,0.35)]'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{resetSuccess ? '已成功复位！' : '一键还原桌面图标排列'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: 全套主题选择区 */}
        {activeTab === 'theme' && (
          <div className="space-y-3">
            <div
              className={`text-xs px-0.5 flex items-center justify-between ${
                isAqua ? 'text-[#0369a1]' : 'text-[#b7a2d9]'
              }`}
            >
              <span>选择全套主题系统 (整套联动更换)：</span>
              <span className={`text-[10px] font-bold ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`}>
                整套风格同步 ✦
              </span>
            </div>

            <div
              className={`text-[11px] p-2.5 rounded-xl border leading-relaxed ${
                isAqua
                  ? 'bg-white/80 border-[#bae6fd] text-[#0369a1]'
                  : 'bg-[#1a1120]/70 border-[#3b2a5a]/70 text-[#b7a2d9]'
              }`}
            >
              💡 <strong>什么是整套主题：</strong>
              包含专属壁纸、全套10款定制像素图标色彩、桌面微组件卡片、状态栏点阵、玻璃底座Dock与外围背景氛围。
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {[
                {
                  id: 'aqua_pixel',
                  name: '蓝白水色 (Mizuiro Kawaii ✦ 全新整套)',
                  color: '#7dd3fc',
                  desc: '日系清新像素风 · 天空水蓝、冰蓝、奶白透明掌机UI与小鱼小兔',
                },
                {
                  id: 'sky',
                  name: '暗夜暮紫 (Jirai Dark ✦ 经典整套)',
                  color: '#1a1120',
                  desc: '深邃夜幕与粉紫色高光 · 地雷系少女与星芒夜幕',
                },
                {
                  id: 'sage',
                  name: '极夜黑紫 (Noir Obsidian ✦ 冷冽整套)',
                  color: '#140d1b',
                  desc: '冷冽纯粹黑紫基调 · 亚文化深黑微光与极简朋克',
                },
                {
                  id: 'lavender',
                  name: '薰衣草莓 (Sweet Berry ✦ 甜系整套)',
                  color: '#251538',
                  desc: '微甜薰衣草与草莓奶昔粉白融合 · 柔和浆果系氛围',
                },
              ].map((t) => {
                const isSelected = currentTheme === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => onChangeTheme(t.id)}
                    className={`p-3.5 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? isAqua
                          ? 'border-[#0284c7] bg-white shadow-[0_0_16px_rgba(56,189,248,0.35)]'
                          : 'border-[#ff8ecb] bg-[#2d1b3e] shadow-[0_0_16px_rgba(255,142,203,0.3)]'
                        : isAqua
                        ? 'border-[#bae6fd] bg-white/70 hover:bg-white'
                        : 'border-[#3b2a5a] bg-[#1d1226]/80 hover:bg-[#251535]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-inner ${
                          isAqua ? 'border-[#38bdf8]/60' : 'border-[#ff8ecb]/50'
                        }`}
                        style={{ backgroundColor: t.color }}
                      >
                        {isSelected && (
                          <Check
                            className={`w-4 h-4 stroke-[3] ${
                              t.id === 'aqua_pixel' ? 'text-[#0284c7]' : 'text-[#ff8ecb]'
                            }`}
                          />
                        )}
                      </div>
                      <div>
                        <div
                          className={`text-xs font-bold ${
                            isSelected
                              ? isAqua
                                ? 'text-[#0284c7]'
                                : 'text-[#ff8ecb]'
                              : isAqua
                              ? 'text-[#0369a1]'
                              : 'text-[#f7d6e8]'
                          }`}
                        >
                          {t.name}
                        </div>
                        <div
                          className={`text-[10px] mt-0.5 ${
                            isAqua ? 'text-[#0284c7]/80' : 'text-[#b7a2d9]'
                          }`}
                        >
                          {t.desc}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                          isAqua
                            ? 'text-[#0284c7] bg-[#e0f2fe] border-[#7dd3fc]'
                            : 'text-[#ff8ecb] bg-[#3a224c] border-[#ff8ecb]/40'
                        }`}
                      >
                        当前整套使用
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
