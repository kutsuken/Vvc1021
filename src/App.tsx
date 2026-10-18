/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ApiConfig,
  CharacterPersona,
  ChatMessage,
  NavState,
  PageId,
  StickerItem,
  WebpageApp,
  WorldBookItem,
  PresetItem,
  MemoryItem,
  UserProfile,
} from './types/phone';
import {
  INITIAL_API_CONFIGS,
  INITIAL_MESSAGES,
  INITIAL_PERSONAS,
  INITIAL_WEBPAGE_APPS,
  INITIAL_WORLDBOOKS,
  INITIAL_PRESETS,
  INITIAL_MEMORIES,
  PRESET_STICKERS,
  STORAGE_KEYS,
  loadStoredData,
  saveStoredData,
  normalizeWorldBooks,
} from './utils/storage';
import { PhoneStatusBar } from './components/PhoneStatusBar';
import { DesktopView, DEFAULT_APP_ORDER } from './components/DesktopView';
import { SettingsApp } from './components/SettingsApp';
import { WarehouseApp } from './components/WarehouseApp';
import { PersonasApp } from './components/PersonasApp';
import { QQApp } from './components/QQApp';
import { WorldBookApp } from './components/WorldBookApp';
import { PresetApp } from './components/PresetApp';
import { OfflineApp } from './components/OfflineApp';
import { MemoryApp } from './components/MemoryApp';
import { MiniBrowserModal } from './components/MiniBrowserModal';
import { AppearanceApp, PRESET_WALLPAPERS } from './components/AppearanceApp';
import { UserApp, DEFAULT_USER_PROFILE } from './components/UserApp';
import {
  PixelSparkle,
  PixelHeart,
  PixelBow,
  PixelBlackCat,
  PixelCloud,
  PixelFish,
  PixelAquaRibbon,
  PixelStar,
} from './components/PixelAssets';

export default function App() {
  // 1. 数据状态与持久化初始化
  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>(() =>
    loadStoredData(STORAGE_KEYS.APIS, INITIAL_API_CONFIGS)
  );
  const [worldbooks, setWorldbooks] = useState<WorldBookItem[]>(() => {
    const loaded = loadStoredData<WorldBookItem[]>(STORAGE_KEYS.WORLDBOOKS, []);
    if (loaded && loaded.length > 0) {
      return normalizeWorldBooks(loaded);
    }
    return INITIAL_WORLDBOOKS;
  });
  const [personas, setPersonas] = useState<CharacterPersona[]>(() =>
    loadStoredData(STORAGE_KEYS.PERSONAS, INITIAL_PERSONAS)
  );
  const [webpages, setWebpages] = useState<WebpageApp[]>(() =>
    loadStoredData(STORAGE_KEYS.WEBPAGES, INITIAL_WEBPAGE_APPS)
  );
  const [stickers, setStickers] = useState<StickerItem[]>(() => {
    const loaded = loadStoredData<StickerItem[]>(STORAGE_KEYS.STICKERS, PRESET_STICKERS);
    // 若存有旧版简单线条表情包，平滑更新为地雷系软萌萌兔新表情包
    if (!loaded || loaded.some((s) => s.id === 'st_happy')) {
      saveStoredData(STORAGE_KEYS.STICKERS, PRESET_STICKERS);
      return PRESET_STICKERS;
    }
    return loaded;
  });
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    loadStoredData(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES)
  );
  const [presets, setPresets] = useState<PresetItem[]>(() => {
    const loaded = loadStoredData<PresetItem[]>(STORAGE_KEYS.PRESETS, []);
    if (loaded && loaded.length > 0) {
      return loaded;
    }
    return INITIAL_PRESETS;
  });
  const [memories, setMemories] = useState<MemoryItem[]>(() => {
    const loaded = loadStoredData<MemoryItem[]>(STORAGE_KEYS.MEMORIES, []);
    // 用户测试要求：把记忆内容全部删掉
    if (loaded && loaded.some((m) => m.id.startsWith('mem_promise_1') || m.id.startsWith('mem_relation_1'))) {
      saveStoredData(STORAGE_KEYS.MEMORIES, []);
      return [];
    }
    return loaded || [];
  });

  // 桌面 App 顺序 (支持长按拖动整理与持久化存储，自动确保预设、线下与记忆软件呈现在桌面上)
  const [appOrder, setAppOrder] = useState<string[]>(() => {
    const saved = loadStoredData<string[]>('phone_desktop_app_order_v1', DEFAULT_APP_ORDER);
    const needMigrate = !saved || !saved.includes('preset') || !saved.includes('offline') || !saved.includes('memory');
    if (needMigrate) {
      const merged = Array.from(new Set([...(saved || []), 'preset', 'offline', 'memory']));
      saveStoredData('phone_desktop_app_order_v1', merged);
      return merged;
    }
    return saved;
  });

  // 主题色系 (水色像素、暗夜暮紫、极夜黑紫、薰衣草莓)
  const [theme, setTheme] = useState<'sky' | 'sage' | 'lavender' | 'aqua_pixel'>(() =>
    loadStoredData('phone_theme_tint', 'aqua_pixel')
  );

  // 壁纸与外观持久化状态 (水色云隙、暗夜暮紫、白紫简笔画、水母头少女)
  const [wallpaperId, setWallpaperId] = useState<string>(() =>
    loadStoredData('phone_wallpaper_id_v2', 'mizuiro_sky')
  );
  const [wallpaperUrl, setWallpaperUrl] = useState<string>(() => {
    const saved = loadStoredData('phone_wallpaper_url_v2', '');
    if (saved) return saved;
    return PRESET_WALLPAPERS[0].url;
  });
  const [customWallpapers, setCustomWallpapers] = useState<string[]>(() =>
    loadStoredData('phone_custom_wallpapers_v2', [])
  );

  const handleChangeWallpaper = (id: string, customUrl?: string) => {
    setWallpaperId(id);
    saveStoredData('phone_wallpaper_id_v2', id);
    if (customUrl) {
      setWallpaperUrl(customUrl);
      saveStoredData('phone_wallpaper_url_v2', customUrl);
    } else {
      const found = PRESET_WALLPAPERS.find((p) => p.id === id);
      if (found) {
        setWallpaperUrl(found.url);
        saveStoredData('phone_wallpaper_url_v2', found.url);
      }
    }
  };

  // 完整切换主题系统：不仅改变全局色调氛围，还自动联动设置该主题的专属壁纸，保证整套主题统一！
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as any);
    saveStoredData('phone_theme_tint', newTheme);
    if (newTheme === 'aqua_pixel') {
      handleChangeWallpaper('mizuiro_sky');
    } else if (newTheme === 'sky') {
      handleChangeWallpaper('dark_purple');
    } else if (newTheme === 'sage') {
      handleChangeWallpaper('white_purple_doodle');
    } else if (newTheme === 'lavender') {
      handleChangeWallpaper('jellyfish_girl');
    }
  };

  const handleAddCustomWallpaper = (url: string) => {
    const next = [url, ...customWallpapers];
    setCustomWallpapers(next);
    saveStoredData('phone_custom_wallpapers_v2', next);
  };

  const handleDeleteCustomWallpaper = (url: string) => {
    const next = customWallpapers.filter((u) => u !== url);
    setCustomWallpapers(next);
    saveStoredData('phone_custom_wallpapers_v2', next);
  };

  // 当前 QQ 激活的联系人 ID
  const [activeCharacterId, setActiveCharacterId] = useState<string>(() => {
    return personas[0]?.id || 'char_ruanruan';
  });

  const handleSavePersonas = (newPersonas: CharacterPersona[]) => {
    setPersonas(newPersonas);
    saveStoredData(STORAGE_KEYS.PERSONAS, newPersonas);
    // 若当前选中的角色已被删除，平滑切换到第一位联系人或空
    if (!newPersonas.some((p) => p.id === activeCharacterId)) {
      setActiveCharacterId(newPersonas[0]?.id || '');
    }
  };

  // 用户个人中心档案状态 (支持持久化存储与备份，用户要求清空user的内容设定)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = loadStoredData<UserProfile>('phone_user_profile_v1', DEFAULT_USER_PROFILE);
    const clearedKey = 'phone_user_cleared_v1';
    if (!localStorage.getItem(clearedKey) || (saved && (saved.name === '小手机用户' || saved.nickname === '软糖兔兔' || saved.identity === '赛博漫游者'))) {
      localStorage.setItem(clearedKey, 'true');
      saveStoredData('phone_user_profile_v1', DEFAULT_USER_PROFILE);
      return DEFAULT_USER_PROFILE;
    }
    return saved || DEFAULT_USER_PROFILE;
  });

  const handleSaveProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    saveStoredData('phone_user_profile_v1', newProfile);
  };

  // 迷你网页弹窗查看
  const [viewingWebModal, setViewingWebModal] = useState<WebpageApp | null>(null);

  // 2. 严格按进入层级构建的导航栈 (严格遵循实际内部页面，支持右滑返回，刷新保持当前页面)
  const [navStack, setNavStack] = useState<NavState[]>(() => {
    const saved = loadStoredData<NavState[]>(STORAGE_KEYS.NAV_STACK, [{ page: 'desktop' }]);
    if (!Array.isArray(saved) || saved.length === 0) return [{ page: 'desktop' }];
    // 去除可能存在的环路或重复页面
    const clean: NavState[] = [];
    const seen = new Set<string>();
    for (const item of saved) {
      if (!item || !item.page) continue;
      if (seen.has(item.page)) continue;
      seen.add(item.page);
      clean.push(item);
    }
    return clean.length > 0 ? clean : [{ page: 'desktop' }];
  });

  // 暂离线下的角色列表 (暂离期间线上保持静默，不主动发信息)
  const [offlineAwayCharIds, setOfflineAwayCharIds] = useState<string[]>(() => {
    return loadStoredData<string[]>('phone_offline_away_characters_v1', []);
  });

  useEffect(() => {
    saveStoredData('phone_offline_away_characters_v1', offlineAwayCharIds);
  }, [offlineAwayCharIds]);

  // 持久化各状态变更
  useEffect(() => {
    saveStoredData(STORAGE_KEYS.APIS, apiConfigs);
  }, [apiConfigs]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.WORLDBOOKS, worldbooks);
  }, [worldbooks]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.PRESETS, presets);
  }, [presets]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.MEMORIES, memories);
  }, [memories]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.PERSONAS, personas);
  }, [personas]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.WEBPAGES, webpages);
  }, [webpages]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.STICKERS, stickers);
  }, [stickers]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.MESSAGES, messages);
  }, [messages]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.NAV_STACK, navStack);
  }, [navStack]);

  useEffect(() => {
    saveStoredData('phone_desktop_app_order_v1', appOrder);
  }, [appOrder]);

  useEffect(() => {
    saveStoredData('phone_theme_tint', theme);
  }, [theme]);

  // 获取当前顶层页面
  const currentPageState = navStack[navStack.length - 1] || { page: 'desktop' };

  // 压栈进入新页面 (防止同名页面无意义连续重复压栈)
  const pushPage = (page: PageId, params?: Record<string, any>) => {
    setNavStack((prev) => {
      if (prev.length > 0 && prev[prev.length - 1].page === page) {
        return prev;
      }
      return [...prev, { page, params }];
    });
  };

  // 出栈返回上级页面 (右滑或返回按钮调用，桌面为底)
  const popPage = () => {
    setNavStack((prev) => {
      if (prev.length <= 1) return [{ page: 'desktop' }];
      return prev.slice(0, prev.length - 1);
    });
  };

  // 手势支持：支持屏幕边缘向内侧滑返回（特别是手机右侧边缘向左滑，符合习惯且不干扰内部组件）
  const touchStartRef = useRef<{ x: number; y: number; side: 'left' | 'right' } | null>(null);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const rawX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const rawY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const targetEl = e.currentTarget as HTMLElement;
    const rect = targetEl?.getBoundingClientRect?.();
    const containerWidth = rect ? rect.width : (typeof window !== 'undefined' ? window.innerWidth : 430);
    const relativeX = rect ? rawX - rect.left : rawX;

    // 触点在屏幕最右侧边缘 (<= 42px) 或最左侧边缘 (<= 42px)
    if (relativeX >= containerWidth - 42) {
      touchStartRef.current = { x: rawX, y: rawY, side: 'right' };
    } else if (relativeX <= 42) {
      touchStartRef.current = { x: rawX, y: rawY, side: 'left' };
    } else {
      touchStartRef.current = null;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (!touchStartRef.current) return;
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;

    const deltaX = clientX - touchStartRef.current.x;
    const deltaY = clientY - touchStartRef.current.y;
    const side = touchStartRef.current.side;
    touchStartRef.current = null;

    // 水平手势判定 (水平移动距离 > 50px 且明显大于垂直移动)
    if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      // 触点在最右侧边缘，向左滑入返回上一级
      if (side === 'right' && deltaX < -50) {
        popPage();
      }
      // 触点在最左侧边缘，向右滑入返回上一级
      else if (side === 'left' && deltaX > 50) {
        popPage();
      }
    }
  };

  const activeApi = apiConfigs.find((c) => c.isActive) || apiConfigs[0];

  // 主题色系背景
  const themeBackgrounds = {
    aqua_pixel: 'bg-gradient-to-b from-[#e0f2fe] via-[#f0f9ff] to-[#bae6fd]',
    sky: 'bg-gradient-to-b from-[#1a1120] via-[#241733] to-[#120b18]',
    sage: 'bg-gradient-to-b from-[#140d1b] via-[#22162e] to-[#0c0612]',
    lavender: 'bg-gradient-to-b from-[#251538] via-[#351c4a] to-[#160c22]',
  };

  return (
    <div
      className={`w-full h-screen h-[100dvh] flex items-center justify-center select-none relative overflow-hidden font-sans p-0 transition-colors duration-300 ${
        theme === 'aqua_pixel'
          ? 'bg-gradient-to-br from-[#cbe8fa] via-[#e2f1fc] to-[#b9e0f7] text-[#0284c7]'
          : 'bg-[#0d0714] text-[#f7d6e8]'
      }`}
    >
      {/* 电脑端超宽视窗外围主题专属装饰 */}
      {theme === 'aqua_pixel' ? (
        <>
          <div className="fixed top-8 left-12 text-[#38bdf8]/50 hidden xl:block pointer-events-none animate-pixel-sparkle">
            <PixelCloud className="w-12 h-8" />
          </div>
          <div className="fixed bottom-12 left-16 text-[#0284c7]/40 hidden xl:block pointer-events-none animate-bounce">
            <PixelFish className="w-12 h-8" />
          </div>
          <div className="fixed top-12 right-16 text-[#38bdf8]/50 hidden xl:block pointer-events-none">
            <PixelAquaRibbon className="w-12 h-12" />
          </div>
          <div className="fixed bottom-16 right-14 text-[#38bdf8]/50 hidden xl:block pointer-events-none animate-pixel-sparkle">
            <PixelStar className="w-10 h-10" />
          </div>
        </>
      ) : (
        <>
          <div className="fixed top-8 left-12 text-[#ff8ecb]/30 hidden xl:block pointer-events-none animate-pixel-sparkle">
            <PixelSparkle className="w-10 h-10" />
          </div>
          <div className="fixed bottom-12 left-16 text-[#d88fbf]/30 hidden xl:block pointer-events-none">
            <PixelBlackCat className="w-12 h-12" />
          </div>
          <div className="fixed top-12 right-16 text-[#ff8ecb]/30 hidden xl:block pointer-events-none">
            <PixelBow className="w-10 h-10" />
          </div>
          <div className="fixed bottom-16 right-14 text-[#ff8ecb]/30 hidden xl:block pointer-events-none animate-pixel-sparkle">
            <PixelHeart className="w-10 h-10" />
          </div>
        </>
      )}

      {/* 手机界面容器 (手机模式下100%全屏无边框，如真正原生系统桌面) */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        className={`w-full h-full max-w-md flex flex-col relative overflow-hidden select-none border-0 shadow-none transition-all duration-300 ${
          theme === 'aqua_pixel'
            ? 'md:shadow-[0_0_60px_rgba(56,189,248,0.35)]'
            : 'md:shadow-[0_0_60px_rgba(216,143,191,0.2)]'
        } ${themeBackgrounds[theme] || themeBackgrounds.sky}`}
      >
        {/* 手机顶部状态栏 */}
        <PhoneStatusBar theme={theme} />

        {/* 手机页面内容展示区 (带有很短的过渡动画) */}
        <div className="flex-1 flex flex-col overflow-hidden relative animate-in fade-in duration-150">
          {/* 1. 桌面 */}
          {currentPageState.page === 'desktop' && (
            <DesktopView
              onOpenApp={(pageId, params) => {
                pushPage(pageId, params);
              }}
              activeApi={activeApi}
              appOrder={appOrder}
              onSaveAppOrder={setAppOrder}
              onResetAppOrder={() => setAppOrder(DEFAULT_APP_ORDER)}
              currentWallpaperUrl={wallpaperUrl}
              currentTheme={theme}
            />
          )}

          {/* 2. 设置应用 (二级主菜单：AI 服务 ＞ / 数据备份 ＞) */}
          {(currentPageState.page === 'settings' ||
            currentPageState.page === 'settings_ai' ||
            currentPageState.page === 'settings_ai_edit' ||
            currentPageState.page === 'settings_other') && (
            <SettingsApp
              configs={apiConfigs}
              onSaveConfigs={setApiConfigs}
              onBack={popPage}
              currentTheme={theme}
              subPage={
                currentPageState.page === 'settings_ai'
                  ? 'ai_list'
                  : currentPageState.page === 'settings_ai_edit'
                  ? 'ai_edit'
                  : currentPageState.page === 'settings_other'
                  ? 'other'
                  : 'main'
              }
              onNavigateSub={(sub) => {
                if (sub === 'ai_list') pushPage('settings_ai');
                else if (sub === 'ai_edit') pushPage('settings_ai_edit');
                else if (sub === 'other') pushPage('settings_other');
                else popPage();
              }}
            />
          )}

          {/* 3. 仓库应用 (搜索框 + ＋，添加网页，长按编辑/换图标/删除) */}
          {(currentPageState.page === 'warehouse' ||
            currentPageState.page === 'warehouse_add' ||
            currentPageState.page === 'warehouse_edit') && (
            <WarehouseApp
              webpages={webpages}
              onSaveWebpages={setWebpages}
              onBack={popPage}
              currentTheme={theme}
              onOpenWeb={(web) => setViewingWebModal(web)}
              subPage={
                currentPageState.page === 'warehouse_add'
                  ? 'add'
                  : currentPageState.page === 'warehouse_edit'
                  ? 'edit'
                  : 'list'
              }
              onNavigateSub={(sub) => {
                if (sub === 'add') pushPage('warehouse_add');
                else if (sub === 'edit') pushPage('warehouse_edit');
                else popPage();
              }}
            />
          )}

          {/* 4. 角色人设应用 (创建人设：头像、姓名、备注、角色设定、AI辅助润色、世界书绑定) */}
          {(currentPageState.page === 'personas' ||
            currentPageState.page === 'personas_create' ||
            currentPageState.page === 'personas_edit') && (
            <PersonasApp
              personas={personas}
              worldbooks={worldbooks}
              activeApi={activeApi}
              onSavePersonas={handleSavePersonas}
              onBack={popPage}
              currentTheme={theme}
              onStartChatWithPersona={(char) => {
                setActiveCharacterId(char.id);
                pushPage('qq_chat');
              }}
              subPage={
                currentPageState.page === 'personas_create'
                  ? 'create'
                  : currentPageState.page === 'personas_edit'
                  ? 'edit'
                  : 'list'
              }
              onNavigateSub={(sub) => {
                if (sub === 'create') pushPage('personas_create');
                else if (sub === 'edit') pushPage('personas_edit');
                else popPage();
              }}
            />
          )}

          {/* 5. QQ 应用 (四大板块：消息、频道、联系人、动态) */}
          {(currentPageState.page === 'qq' || currentPageState.page === 'qq_chat') && (
            <QQApp
              personas={personas}
              onSavePersonas={handleSavePersonas}
              activeCharacterId={activeCharacterId}
              onChangeActiveCharacter={setActiveCharacterId}
              worldbooks={worldbooks}
              onSaveWorldbooks={setWorldbooks}
              presets={presets}
              onSavePresets={setPresets}
              stickers={stickers}
              onSaveStickers={setStickers}
              messages={messages}
              onSaveMessages={setMessages}
              activeApi={activeApi}
              onBack={popPage}
              onGoToPersonas={() => pushPage('personas')}
              initialChatId={currentPageState.page === 'qq_chat' ? activeCharacterId : undefined}
              userProfile={userProfile}
              onSaveProfile={handleSaveProfile}
              onOpenOffline={(params) => pushPage('offline', params)}
              memories={memories}
              onSaveMemories={setMemories}
              offlineAwayCharIds={offlineAwayCharIds}
              onUpdateOfflineAway={setOfflineAwayCharIds}
              currentTheme={theme}
            />
          )}

          {/* 6. 世界书应用 (可分组、常驻/关键词动态触发、灵感模板库、命中测试) */}
          {(currentPageState.page === 'worldbook' ||
            currentPageState.page === 'worldbook_create' ||
            currentPageState.page === 'worldbook_edit') && (
            <WorldBookApp
              worldbooks={worldbooks}
              onSaveWorldbooks={setWorldbooks}
              activeApi={activeApi}
              personas={personas}
              onBack={popPage}
              currentTheme={theme}
              subPage={
                currentPageState.page === 'worldbook_create'
                  ? 'create'
                  : currentPageState.page === 'worldbook_edit'
                  ? 'edit'
                  : 'list'
              }
              onNavigateSub={(sub) => {
                if (sub === 'create') pushPage('worldbook_create');
                else if (sub === 'edit') pushPage('worldbook_edit');
                else popPage();
              }}
            />
          )}

          {/* 7. 预设软件应用 (系统提示词预设、模型参数调优、格式规约、防出戏破限) */}
          {(currentPageState.page === 'preset' ||
            currentPageState.page === 'preset_create' ||
            currentPageState.page === 'preset_edit') && (
            <PresetApp
              presets={presets}
              onSavePresets={setPresets}
              activeApi={activeApi}
              personas={personas}
              onBack={popPage}
              currentTheme={theme}
              subPage={
                currentPageState.page === 'preset_create'
                  ? 'create'
                  : currentPageState.page === 'preset_edit'
                  ? 'edit'
                  : 'list'
              }
              onNavigateSub={(sub) => {
                if (sub === 'create') pushPage('preset_create');
                else if (sub === 'edit') pushPage('preset_edit');
                else popPage();
              }}
            />
          )}

          {/* 6. 美化 · 外观应用 (包含三款指定壁纸、自定义上传、桌面图标复位与主题基调) */}
          {currentPageState.page === 'appearance' && (
            <AppearanceApp
              onBack={popPage}
              currentWallpaperId={wallpaperId}
              onChangeWallpaper={handleChangeWallpaper}
              customWallpapers={customWallpapers}
              onAddCustomWallpaper={handleAddCustomWallpaper}
              onDeleteCustomWallpaper={handleDeleteCustomWallpaper}
              onResetAppOrder={() => setAppOrder(DEFAULT_APP_ORDER)}
              currentTheme={theme}
              onChangeTheme={handleThemeChange}
            />
          )}

          {/* 7.5 线下现实互动空间应用 (直接进入 / 邀约进入 / GPT与DeepSeek式沉浸交互) */}
          {currentPageState.page === 'offline' && (
            <OfflineApp
              personas={personas}
              activeCharacterId={activeCharacterId}
              onChangeActiveCharacter={setActiveCharacterId}
              messages={messages}
              worldbooks={worldbooks}
              presets={presets}
              activeApi={activeApi}
              userProfile={userProfile}
              params={currentPageState.params}
              onBack={popPage}
              currentTheme={theme}
              onOpenQQ={() => pushPage('qq')}
              onSaveMemories={setMemories}
              offlineAwayCharIds={offlineAwayCharIds}
              onUpdateOfflineAway={setOfflineAwayCharIds}
            />
          )}

          {/* 7.6 角色记忆中枢应用 (三层记忆体系: 原始记录、阶段总结、长期沉淀、召回检索) */}
          {(currentPageState.page === 'memory' ||
            currentPageState.page === 'memory_detail' ||
            currentPageState.page === 'memory_create') && (
            <MemoryApp
              memories={memories}
              onSaveMemories={setMemories}
              personas={personas}
              activeApi={activeApi}
              onBack={popPage}
            />
          )}

          {/* 7. 用户个人主页与资料编辑应用 */}
          {(currentPageState.page === 'user' || currentPageState.page === 'user_edit') && (
            <UserApp
              profile={userProfile}
              onSaveProfile={handleSaveProfile}
              onBack={popPage}
              subPage={currentPageState.page === 'user_edit' ? 'edit' : 'view'}
              onNavigateSub={(sub) => {
                if (sub === 'edit') pushPage('user_edit');
                else popPage();
              }}
            />
          )}

          {/* 仓库网页内嵌迷你浏览器弹窗 */}
          {viewingWebModal && (
            <MiniBrowserModal
              webApp={viewingWebModal}
              onClose={() => setViewingWebModal(null)}
            />
          )}
        </div>

        {/* 手机底部的 Home Indicator 呼吸条 */}
        <div className="w-full h-5 flex items-center justify-center shrink-0 z-30 pointer-events-none">
          <div className="w-28 h-1 rounded-full bg-slate-400/40"></div>
        </div>
      </div>
    </div>
  );
}
