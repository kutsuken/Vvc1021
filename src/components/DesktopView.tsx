import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, Check, Sparkles } from 'lucide-react';
import { ApiConfig, PageId } from '../types/phone';
import {
  PixelIconWarehouse,
  PixelIconQQ,
  PixelIconWorldBook,
  PixelIconPreset,
  PixelIconOffline,
  PixelIconMemory,
  PixelIconSettings,
  PixelIconContacts,
  PixelIconAppearance,
  PixelIconUser,
  PixelAppCard,
  PixelSparkle,
  PixelHeart,
  PixelBow,
  PixelBlackCat,
  PixelFish,
  PixelCloud,
  PixelDroplet,
  PixelBubble,
  PixelAquaRibbon,
  PixelStar,
  PixelFlower,
  PixelMoon,
  PixelWave,
  PixelAquaBunny,
} from './PixelAssets';
import jiraiWallpaperUrl from '../assets/images/jirai_pixel_wallpaper_1790861769109.jpg';
import mizuiroWallpaperUrl from '../assets/images/mizuiro_pixel_wallpaper_1791480632462.jpg';

export interface AppDefinition {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string; isAqua?: boolean }>;
  pageId: PageId;
}

// 桌面主屏网格应用 (仓库、QQ、世界书、预设)
export const SYSTEM_APPS: Record<string, AppDefinition> = {
  warehouse: {
    id: 'warehouse',
    name: '仓库',
    icon: PixelIconWarehouse,
    pageId: 'warehouse',
  },
  qq: {
    id: 'qq',
    name: 'QQ',
    icon: PixelIconQQ,
    pageId: 'qq',
  },
  worldbook: {
    id: 'worldbook',
    name: '世界书',
    icon: PixelIconWorldBook,
    pageId: 'worldbook',
  },
  preset: {
    id: 'preset',
    name: '预设',
    icon: PixelIconPreset,
    pageId: 'preset',
  },
  offline: {
    id: 'offline',
    name: '线下',
    icon: PixelIconOffline,
    pageId: 'offline',
  },
  memory: {
    id: 'memory',
    name: '记忆',
    icon: PixelIconMemory,
    pageId: 'memory',
  },
};

export const DEFAULT_APP_ORDER = ['warehouse', 'qq', 'worldbook', 'preset', 'offline', 'memory'];

// 今日心情预设列表
const MOOD_PRESETS = [
  '困困...但还要加油',
  '今日心动电波满格 ♡',
  '想吃草莓可丽饼 🍓',
  '有点叛逆但很想你 ✦',
  '风很温柔，今天也要开心',
  '小恶魔电量 100% ⚡',
];

// 水色主题专属治愈心情
const AQUA_MOOD_PRESETS = [
  '像浮云一样轻飘飘 ☁️',
  '小鱼吐着泡泡游过 🫧',
  '像素小兔电量满格 🐰',
  '天很蓝，今天会很顺利 ✦',
  '吹着微风看水波荡漾 〰️',
  '晶莹清透的一天 🐟',
];

interface DesktopViewProps {
  onOpenApp: (pageId: PageId, params?: any) => void;
  activeApi?: ApiConfig;
  unreadCount?: number;
  appOrder: string[];
  onSaveAppOrder: (newOrder: string[]) => void;
  onResetAppOrder: () => void;
  currentWallpaperUrl?: string;
  currentTheme?: string;
}

export const DesktopView: React.FC<DesktopViewProps> = ({
  onOpenApp,
  activeApi,
  unreadCount = 0,
  appOrder,
  onSaveAppOrder,
  onResetAppOrder,
  currentWallpaperUrl,
  currentTheme = 'sky',
}) => {
  const isAqua = currentTheme === 'aqua_pixel';
  const currentDate = new Date();
  const dateStr = `${currentDate.getMonth() + 1}月${currentDate.getDate()}日`;
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekStr = weekDays[currentDate.getDay()];
  const effectiveMoods = isAqua ? AQUA_MOOD_PRESETS : MOOD_PRESETS;

  // 今日心情状态 (点击可切换不同打气语)
  const [moodIndex, setMoodIndex] = useState(0);

  // 编辑 / 整理模式状态
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [draggingAppId, setDraggingAppId] = useState<string | null>(null);
  const [dragPointerPos, setDragPointerPos] = useState<{ x: number; y: number } | null>(null);

  // 预留功能轻提示 Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMsg(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMsg(null);
    }, 2200);
  };

  // 过滤出当前属于桌面网格的有效 App (排除 Dock 的设置和通讯录)
  const currentDesktopAppOrder = appOrder.filter((id) => SYSTEM_APPS[id]);
  const activeDesktopOrder =
    currentDesktopAppOrder.length > 0 ? currentDesktopAppOrder : DEFAULT_APP_ORDER;

  // 长按定时器与手势记录
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const justFinishedDragRef = useRef(false);

  // 每个 App Slot 的元素引用，用于计算拖拽时的重排位置
  const slotRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // 清除长按定时器
  const clearLongPressTimer = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // 全局移动监听 (捕获拖动位置并计算实时重新排序)
  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
      if (!draggingAppId) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

      setDragPointerPos({ x: clientX, y: clientY });
      isDraggingRef.current = true;

      // 实时计算当前悬停的 App 位置
      let targetIndex = -1;
      let minDistance = Infinity;

      activeDesktopOrder.forEach((appId, index) => {
        const el = slotRefs.current.get(appId);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dist = Math.hypot(clientX - centerX, clientY - centerY);

        if (dist < minDistance && dist < rect.width * 1.1) {
          minDistance = dist;
          targetIndex = index;
        }
      });

      if (targetIndex !== -1) {
        const currentIndex = activeDesktopOrder.indexOf(draggingAppId);
        if (currentIndex !== -1 && currentIndex !== targetIndex) {
          const newOrder = [...activeDesktopOrder];
          newOrder.splice(currentIndex, 1);
          newOrder.splice(targetIndex, 0, draggingAppId);
          onSaveAppOrder(newOrder);
        }
      }
    };

    const handleGlobalUp = () => {
      clearLongPressTimer();
      if (draggingAppId) {
        setDraggingAppId(null);
        setDragPointerPos(null);
        justFinishedDragRef.current = true;
        setTimeout(() => {
          justFinishedDragRef.current = false;
          isDraggingRef.current = false;
        }, 150);
      }
    };

    if (draggingAppId) {
      window.addEventListener('mousemove', handleGlobalMove);
      window.addEventListener('touchmove', handleGlobalMove, { passive: false });
      window.addEventListener('mouseup', handleGlobalUp);
      window.addEventListener('touchend', handleGlobalUp);
      window.addEventListener('touchcancel', handleGlobalUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('touchmove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('touchend', handleGlobalUp);
      window.removeEventListener('touchcancel', handleGlobalUp);
    };
  }, [draggingAppId, activeDesktopOrder, onSaveAppOrder]);

  // 按下 App 图标事件
  const handleAppPointerDown = (
    appId: string,
    e: React.MouseEvent | React.TouchEvent
  ) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    touchStartPosRef.current = { x: clientX, y: clientY };
    clearLongPressTimer();

    if (isEditingMode) {
      setDraggingAppId(appId);
      setDragPointerPos({ x: clientX, y: clientY });
      isDraggingRef.current = true;
      if (navigator.vibrate) navigator.vibrate(30);
    } else {
      longPressTimerRef.current = setTimeout(() => {
        setIsEditingMode(true);
        setDraggingAppId(appId);
        setDragPointerPos({ x: clientX, y: clientY });
        isDraggingRef.current = true;
        if (navigator.vibrate) navigator.vibrate(50);
      }, 500);
    }
  };

  const handleAppPointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!touchStartPosRef.current || isEditingMode || draggingAppId) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const dist = Math.hypot(
      clientX - touchStartPosRef.current.x,
      clientY - touchStartPosRef.current.y
    );
    if (dist > 10) {
      clearLongPressTimer();
    }
  };

  const handleAppClick = (app: AppDefinition) => {
    if (justFinishedDragRef.current || isDraggingRef.current) return;
    if (isEditingMode) return;
    onOpenApp(app.pageId);
  };

  const handleDesktopBackgroundClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.desktop-app-slot')) return;
    if ((e.target as HTMLElement).closest('.desktop-dock-bar')) return;
    if (isEditingMode && !draggingAppId) {
      setIsEditingMode(false);
    }
  };

  const draggingAppDef = draggingAppId ? SYSTEM_APPS[draggingAppId] : null;

  return (
    <div
      onClick={handleDesktopBackgroundClick}
      className="flex-1 flex flex-col justify-between p-4 pt-2 pb-3 relative overflow-hidden select-none"
      style={{
        backgroundImage: isAqua
          ? `radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.45) 0%, rgba(186, 230, 253, 0.55) 60%, rgba(125, 211, 252, 0.65) 100%), url(${currentWallpaperUrl || mizuiroWallpaperUrl})`
          : `radial-gradient(circle at 50% 25%, rgba(59, 42, 90, 0.45) 0%, rgba(20, 13, 27, 0.85) 75%), url(${currentWallpaperUrl || jiraiWallpaperUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* 像素装饰浮动点缀 */}
      {isAqua ? (
        <>
          <div className="absolute top-10 right-7 pointer-events-none drop-shadow-sm">
            <PixelAquaRibbon className="w-5 h-5" />
          </div>
          <div className="absolute top-24 left-3 pointer-events-none drop-shadow-sm opacity-90 animate-pulse">
            <PixelCloud className="w-8 h-5" />
          </div>
          <div className="absolute top-48 right-3 pointer-events-none drop-shadow-sm opacity-90 animate-bounce">
            <PixelFish className="w-6 h-4" />
          </div>
          <div className="absolute bottom-44 left-3 flex items-center gap-1 pointer-events-none drop-shadow-sm">
            <PixelDroplet className="w-3.5 h-3.5" />
            <PixelBubble className="w-3 h-3 opacity-80" />
          </div>
          <div className="absolute bottom-36 right-4 text-[#38bdf8] pointer-events-none animate-pixel-sparkle">
            <PixelStar className="w-3.5 h-3.5" />
          </div>
        </>
      ) : (
        <>
          <div className="absolute top-10 right-8 text-[#ff8ecb]/60 pointer-events-none animate-pixel-sparkle">
            <PixelSparkle className="w-4 h-4" />
          </div>
          <div className="absolute top-36 left-4 text-[#d88fbf]/50 pointer-events-none animate-pixel-sparkle">
            <PixelSparkle className="w-3 h-3" />
          </div>
          <div className="absolute bottom-40 right-6 text-[#ff8ecb]/40 pointer-events-none">
            <PixelHeart className="w-3.5 h-3.5" color="#d88fbf" />
          </div>
        </>
      )}

      {/* 顶部心情微组件 / 编辑模式操作栏 */}
      {isEditingMode ? (
        <div
          className={`mt-1 mb-5 px-3 py-2.5 rounded-2xl backdrop-blur-md border-2 flex items-center justify-between animate-in fade-in duration-200 z-20 ${
            isAqua
              ? 'bg-white/90 border-[#7dd3fc] shadow-[0_6px_24px_rgba(56,189,248,0.25)] text-[#0284c7]'
              : 'bg-[#1e1329]/95 border-[#d88fbf] shadow-[0_6px_24px_rgba(216,143,191,0.35)] text-[#f7d6e8]'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full animate-ping ${
                isAqua ? 'bg-[#38bdf8]' : 'bg-[#ff8ecb]'
              }`}
            ></span>
            <span>拖动图标即可整理桌面</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onResetAppOrder();
              }}
              className={`text-[10px] px-2 py-1 rounded-lg border flex items-center gap-1 jelly-btn ${
                isAqua
                  ? 'border-[#bae6fd] bg-[#f0f9ff] text-[#0284c7] hover:bg-[#e0f2fe]'
                  : 'border-[#6b4c8a] bg-[#2d1c3d] text-[#f7d6e8] hover:text-white'
              }`}
            >
              <RotateCcw className="w-3 h-3" />
              <span>还原</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingMode(false);
              }}
              className={`text-xs font-medium px-3 py-1 rounded-xl flex items-center gap-1 jelly-btn font-mono ${
                isAqua
                  ? 'bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-white shadow-[0_2px_10px_rgba(56,189,248,0.4)]'
                  : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-white shadow-[0_2px_10px_rgba(255,142,203,0.4)]'
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>完成</span>
            </button>
          </div>
        </div>
      ) : (
        /* 参考图中标志性的「今日心情」微组件 (可点击切换打气心语) */
        <div
          onClick={() => setMoodIndex((prev) => (prev + 1) % effectiveMoods.length)}
          className={`mt-1 mb-5 px-3.5 py-2.5 rounded-2xl backdrop-blur-xl border transition-colors cursor-pointer group relative ${
            isAqua
              ? 'bg-white/85 border-[#7dd3fc] shadow-[0_4px_20px_rgba(56,189,248,0.22)] hover:border-[#38bdf8]'
              : 'bg-[#1c1226]/85 border-[#d88fbf]/50 shadow-[0_4px_20px_rgba(0,0,0,0.6),0_0_12px_rgba(216,143,191,0.18)] hover:border-[#ff8ecb]'
          }`}
        >
          {/* 微型右上角像素装饰 */}
          <div className="absolute -top-2.5 right-3 flex items-center gap-1">
            {isAqua ? (
              <>
                <PixelAquaRibbon className="w-4 h-4 drop-shadow-sm" />
                <PixelFish className="w-4 h-4 drop-shadow-sm" />
              </>
            ) : (
              <>
                <PixelBow className="w-4 h-4 drop-shadow-sm" />
                <PixelBlackCat className="w-5 h-5 drop-shadow-sm" />
              </>
            )}
          </div>

          <div
            className={`flex items-center justify-between text-[10px] font-mono tracking-wider ${
              isAqua ? 'text-[#0369a1]' : 'text-[#d88fbf]'
            }`}
          >
            <div className="flex items-center gap-1 font-bold">
              <span>今日心情</span>
              <span className={`text-[9px] ${isAqua ? 'text-[#0284c7]/70' : 'text-[#b7a2d9]'}`}>
                ({dateStr} · {weekStr})
              </span>
            </div>
            <span
              className={`text-[9px] transition-colors ${
                isAqua
                  ? 'text-[#0284c7]/80 group-hover:text-[#0369a1]'
                  : 'text-[#b7a2d9]/80 group-hover:text-[#ff8ecb]'
              }`}
            >
              换一句 ↻
            </span>
          </div>

          <div className="mt-1 flex items-center gap-2">
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                isAqua ? 'bg-[#e0f2fe]' : 'bg-[#ff8ecb]/20'
              }`}
            >
              <span className="text-[10px]">{isAqua ? '🐟' : '🐾'}</span>
            </div>
            <span
              className={`text-xs font-medium tracking-wide font-mono truncate ${
                isAqua ? 'text-[#0284c7] font-bold' : 'text-[#f7d6e8]'
              }`}
            >
              {effectiveMoods[moodIndex]}
            </span>
          </div>
        </div>
      )}

      {/* 主屏应用网格 (全套精致日系像素风图标，支持长按整理拖曳) */}
      <div className="grid grid-cols-4 gap-y-6 gap-x-2 px-1 relative">
        {activeDesktopOrder.map((appId, index) => {
          const app = SYSTEM_APPS[appId];
          if (!app) return null;
          const IconComp = app.icon;
          const isCurrentDragging = draggingAppId === appId;
          const jiggleClass = isEditingMode
            ? index % 2 === 0
              ? 'icon-jiggle-even'
              : 'icon-jiggle-odd'
            : '';

          return (
            <div
              key={app.id}
              ref={(el) => {
                if (el) slotRefs.current.set(app.id, el);
                else slotRefs.current.delete(app.id);
              }}
              onMouseDown={(e) => handleAppPointerDown(app.id, e)}
              onMouseMove={handleAppPointerMove}
              onMouseUp={clearLongPressTimer}
              onTouchStart={(e) => handleAppPointerDown(app.id, e)}
              onTouchMove={handleAppPointerMove}
              onTouchEnd={clearLongPressTimer}
              onClick={() => handleAppClick(app)}
              className={`desktop-app-slot flex flex-col items-center gap-1.5 group focus:outline-none transition-all duration-150 select-none cursor-pointer ${
                isCurrentDragging ? 'opacity-25 scale-90' : 'opacity-100'
              }`}
            >
              <PixelAppCard
                active={isCurrentDragging}
                jiggleClass={jiggleClass}
                badge={app.id === 'qq' ? unreadCount : 0}
                isAqua={isAqua}
              >
                <IconComp className="w-7 h-7" isAqua={isAqua} />
              </PixelAppCard>
              <span
                className={`text-[11px] font-mono tracking-wider ${
                  isAqua
                    ? 'text-[#0284c7] font-bold drop-shadow-[0_1px_3px_rgba(255,255,255,0.95)]'
                    : 'text-[#f7d6e8] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]'
                }`}
              >
                {app.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* 拖动跟随预览小图标 */}
      {draggingAppDef && dragPointerPos && (
        <div
          className="fixed pointer-events-none z-50 flex flex-col items-center gap-1.5 transition-transform"
          style={{
            left: dragPointerPos.x - 28,
            top: dragPointerPos.y - 28,
          }}
        >
          <PixelAppCard
            active
            isAqua={isAqua}
            className={`scale-110 ${isAqua ? 'shadow-[0_0_20px_#38bdf8]' : 'shadow-[0_0_20px_#ff8ecb]'}`}
          >
            {React.createElement(draggingAppDef.icon, { className: 'w-7 h-7', isAqua })}
          </PixelAppCard>
          <span
            className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-md border shadow-md ${
              isAqua
                ? 'bg-white/95 text-[#0284c7] border-[#7dd3fc]'
                : 'bg-[#1a1120]/95 text-[#f7d6e8] border-[#d88fbf]'
            }`}
          >
            {draggingAppDef.name}
          </span>
        </div>
      )}

      {/* 预留功能轻提示 Toast */}
      {toastMsg && (
        <div className="fixed top-12 left-5 right-5 z-50 flex justify-center pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200">
          <div
            className={`px-4 py-2.5 rounded-2xl border-2 text-xs font-mono font-medium flex items-center gap-2 ${
              isAqua
                ? 'bg-white/95 backdrop-blur-md border-[#7dd3fc] text-[#0284c7] shadow-[0_8px_30px_rgba(56,189,248,0.35)]'
                : 'bg-[#1e1329]/95 backdrop-blur-md border-[#d88fbf] text-[#f7d6e8] shadow-[0_8px_30px_rgba(216,143,191,0.45)]'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 shrink-0 ${isAqua ? 'text-[#38bdf8]' : 'text-[#ff8ecb]'}`} />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* 底部 Dock 栏：日系像素掌机半透明底座 + 像素装饰 + 4大核心入口 (设置、通讯录、外观、用户) */}
      <div className="desktop-dock-bar mt-auto pt-2 z-20">
        <div
          className="w-full h-[78px] rounded-[26px] grid grid-cols-4 items-center px-1 py-1 relative"
          style={
            isAqua
              ? {
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(224, 242, 254, 0.96) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '2px solid rgba(125, 211, 252, 0.95)',
                  boxShadow: '0 8px 32px rgba(56, 189, 248, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
                }
              : {
                  background: 'linear-gradient(180deg, rgba(34, 20, 48, 0.88) 0%, rgba(18, 11, 25, 0.95) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '2px solid rgba(216, 143, 191, 0.45)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                }
          }
        >
          {/* Dock 栏中央微型蝴蝶结装饰 */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none drop-shadow-md">
            {isAqua ? <PixelAquaRibbon className="w-5 h-5" /> : <PixelBow className="w-5 h-5" />}
          </div>

          {/* 1. 设置 */}
          <button
            onClick={() => onOpenApp('settings')}
            className="flex flex-col items-center gap-1 group focus:outline-none jelly-icon"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm ${
                isAqua
                  ? 'bg-gradient-to-b from-[#ffffff] to-[#e0f2fe] border border-[#7dd3fc] text-[#0284c7] group-hover:border-[#38bdf8]'
                  : 'bg-gradient-to-b from-[#2a1a3a] to-[#150d1e] border border-[#d88fbf]/50 text-[#ff8ecb] group-hover:border-[#ff8ecb]'
              }`}
            >
              <PixelIconSettings className="w-6 h-6" isAqua={isAqua} />
            </div>
            <span
              className={`text-[10px] font-mono tracking-wider ${
                isAqua ? 'text-[#0284c7] font-bold' : 'text-[#f7d6e8]'
              }`}
            >
              设置
            </span>
          </button>

          {/* 2. 通讯录 */}
          <button
            onClick={() => onOpenApp('personas')}
            className="flex flex-col items-center gap-1 group focus:outline-none jelly-icon"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm ${
                isAqua
                  ? 'bg-gradient-to-b from-[#ffffff] to-[#e0f2fe] border border-[#7dd3fc] text-[#0284c7] group-hover:border-[#38bdf8]'
                  : 'bg-gradient-to-b from-[#2a1a3a] to-[#150d1e] border border-[#d88fbf]/50 text-[#ff8ecb] group-hover:border-[#ff8ecb]'
              }`}
            >
              <PixelIconContacts className="w-6 h-6" isAqua={isAqua} />
            </div>
            <span
              className={`text-[10px] font-mono tracking-wider ${
                isAqua ? 'text-[#0284c7] font-bold' : 'text-[#f7d6e8]'
              }`}
            >
              通讯录
            </span>
          </button>

          {/* 3. 外观 */}
          <button
            onClick={() => onOpenApp('appearance')}
            className="flex flex-col items-center gap-1 group focus:outline-none jelly-icon"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm ${
                isAqua
                  ? 'bg-gradient-to-b from-[#ffffff] to-[#e0f2fe] border border-[#7dd3fc] text-[#0284c7] group-hover:border-[#38bdf8]'
                  : 'bg-gradient-to-b from-[#2a1a3a] to-[#150d1e] border border-[#d88fbf]/50 text-[#ff8ecb] group-hover:border-[#ff8ecb]'
              }`}
            >
              <PixelIconAppearance className="w-6 h-6" isAqua={isAqua} />
            </div>
            <span
              className={`text-[10px] font-mono tracking-wider ${
                isAqua ? 'text-[#0284c7] font-bold' : 'text-[#f7d6e8]'
              }`}
            >
              外观
            </span>
          </button>

          {/* 4. 用户 */}
          <button
            onClick={() => onOpenApp('user')}
            className="flex flex-col items-center gap-1 group focus:outline-none jelly-icon"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm ${
                isAqua
                  ? 'bg-gradient-to-b from-[#ffffff] to-[#e0f2fe] border border-[#7dd3fc] text-[#0284c7] group-hover:border-[#38bdf8]'
                  : 'bg-gradient-to-b from-[#2a1a3a] to-[#150d1e] border border-[#d88fbf]/50 text-[#ff8ecb] group-hover:border-[#ff8ecb]'
              }`}
            >
              <PixelIconUser className="w-6 h-6" isAqua={isAqua} />
            </div>
            <span
              className={`text-[10px] font-mono tracking-wider ${
                isAqua ? 'text-[#0284c7] font-bold' : 'text-[#f7d6e8]'
              }`}
            >
              用户
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
