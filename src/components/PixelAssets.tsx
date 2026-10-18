import React from 'react';

// ==========================================
// 🎨 日系地雷系 / 像素少女风 精致像素资产库
// 色系：#1a1120 (极夜黑紫), #3b2a5a (暮紫), #d88fbf (地雷粉),
// #f7d6e8 (奶霜粉白), #ff8ecb (亮粉), #b7a2d9 (雾紫), #ffffff
// ==========================================

// 1. 像素十字星 (Sparkle ✦)
export const PixelSparkle: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-4 h-4',
  color = '#d88fbf',
}) => (
  <svg
    viewBox="0 0 16 16"
    fill="currentColor"
    className={className}
    style={{ color, shapeRendering: 'crispEdges' }}
  >
    <rect x="7" y="0" width="2" height="16" />
    <rect x="0" y="7" width="16" height="2" />
    <rect x="5" y="5" width="6" height="6" />
    <rect x="6" y="2" width="4" height="12" />
    <rect x="2" y="6" width="12" height="4" />
    <rect x="7" y="7" width="2" height="2" fill="#ffffff" />
  </svg>
);

// 2. 像素爱心 (Heart ♥)
export const PixelHeart: React.FC<{ className?: string; color?: string; fillCenter?: boolean }> = ({
  className = 'w-4 h-4',
  color = '#ff8ecb',
  fillCenter = true,
}) => (
  <svg
    viewBox="0 0 16 16"
    className={className}
    style={{ shapeRendering: 'crispEdges' }}
  >
    {/* 外边框 */}
    <path
      d="M3 1h3v2H3V1zm7 0h3v2h-3V1zM1 3h2v4H1V3zm13 0h2v4h-2V3zm-1 4h2v2h-2V7zM2 7H0v2h2V7zm1 2H1v2h2V9zm10 0h2v2h-2V9zm-2 2h2v2h-2v-2zM4 11H2v2h2v-2zm2 2H4v2h2v-2zm4 0h2v2h-2v-2zm-3 2h2v1H7v-1z"
      fill="#1a1120"
    />
    {/* 内部填充 */}
    {fillCenter && (
      <path
        d="M3 3h3v4H3V3zm7 0h3v4h-3V3zM2 4h12v4H2V4zm1 3h10v2H3V7zm1 2h8v2H4V9zm2 2h4v2H6v-2zm1 2h2v1H7v-1z"
        fill={color}
      />
    )}
    {/* 高光 */}
    <rect x="3" y="3" width="2" height="2" fill="#ffffff" />
  </svg>
);

// 3. 像素蝴蝶结 (Pink Ribbon / Bow 🎀)
export const PixelBow: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" className={className} style={{ shapeRendering: 'crispEdges' }}>
    {/* 边框 */}
    <path
      d="M2 7h4v2H2V7zm16 0h4v2h-4V7zM1 9h2v6H1V9zm21 0h2v6h-2V9zM3 15h3v2H3v-2zm15 0h3v2h-3v-2zm-6-5h4v4h-4v-4z"
      fill="#1a1120"
    />
    {/* 左翼填充 */}
    <rect x="3" y="9" width="7" height="6" fill="#d88fbf" />
    <rect x="4" y="8" width="5" height="1" fill="#f7d6e8" />
    <rect x="4" y="10" width="3" height="2" fill="#ffffff" />
    {/* 右翼填充 */}
    <rect x="14" y="9" width="7" height="6" fill="#d88fbf" />
    <rect x="15" y="8" width="5" height="1" fill="#f7d6e8" />
    <rect x="17" y="10" width="3" height="2" fill="#ffffff" />
    {/* 结心 */}
    <rect x="10" y="10" width="4" height="4" fill="#ff8ecb" />
    <rect x="11" y="11" width="2" height="2" fill="#ffffff" />
    {/* 飘带 */}
    <path d="M8 16h2v4H8v-4zm6 0h2v4h-2v-4z" fill="#6b4c8a" />
    <path d="M6 19h2v3H6v-3zm10 0h2v3h-2v-3z" fill="#d88fbf" />
  </svg>
);

// 4. 像素小黑猫 (Black Cat 🐾)
export const PixelBlackCat: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 24 24" className={className} style={{ shapeRendering: 'crispEdges' }}>
    {/* 猫耳外轮廓 */}
    <rect x="4" y="3" width="4" height="4" fill="#1a1120" />
    <rect x="16" y="3" width="4" height="4" fill="#1a1120" />
    {/* 耳内粉色 */}
    <rect x="5" y="4" width="2" height="2" fill="#ff8ecb" />
    <rect x="17" y="4" width="2" height="2" fill="#ff8ecb" />
    {/* 头部黑毛 */}
    <rect x="3" y="6" width="18" height="10" fill="#22162e" />
    <rect x="2" y="7" width="20" height="8" fill="#1a1120" />
    {/* 脸蛋高光微紫 */}
    <rect x="4" y="7" width="2" height="2" fill="#3b2a5a" />
    {/* 萌圆大眼睛 (明亮琥珀金/黄粉) */}
    <rect x="6" y="9" width="3" height="3" fill="#ffe082" />
    <rect x="7" y="9" width="1" height="3" fill="#1a1120" />
    <rect x="6" y="9" width="1" height="1" fill="#ffffff" />
    <rect x="15" y="9" width="3" height="3" fill="#ffe082" />
    <rect x="16" y="9" width="1" height="3" fill="#1a1120" />
    <rect x="15" y="9" width="1" height="1" fill="#ffffff" />
    {/* 鼻子与粉嫩腮红 */}
    <rect x="11" y="12" width="2" height="1" fill="#ff8ecb" />
    <rect x="4" y="12" width="2" height="1" fill="#d88fbf" />
    <rect x="18" y="12" width="2" height="1" fill="#d88fbf" />
    {/* 身体与脖子粉蝴蝶结 */}
    <rect x="5" y="16" width="14" height="6" fill="#1a1120" />
    <rect x="10" y="15" width="4" height="2" fill="#ff8ecb" />
    <rect x="9" y="15" width="1" height="2" fill="#f7d6e8" />
    <rect x="14" y="15" width="1" height="2" fill="#f7d6e8" />
    {/* 小爪子 */}
    <rect x="7" y="21" width="3" height="2" fill="#3b2a5a" />
    <rect x="14" y="21" width="3" height="2" fill="#3b2a5a" />
  </svg>
);

// ==========================================
// 📱 App 专属像素图标 (根据参考图标准打造)
// ==========================================

// 1. 设置：像素机械齿轮 (Gear)
export const PixelIconSettings: React.FC<{ className?: string; isAqua?: boolean }> = ({
  className = 'w-7 h-7',
  isAqua = false,
}) => (
  <svg viewBox="0 0 28 28" className={className} style={{ shapeRendering: 'crispEdges' }}>
    {/* 齿轮外围凸起点 (齿) */}
    <rect x="12" y="1" width="4" height="4" fill={isAqua ? '#38bdf8' : '#d88fbf'} />
    <rect x="12" y="23" width="4" height="4" fill={isAqua ? '#38bdf8' : '#d88fbf'} />
    <rect x="1" y="12" width="4" height="4" fill={isAqua ? '#38bdf8' : '#d88fbf'} />
    <rect x="23" y="12" width="4" height="4" fill={isAqua ? '#38bdf8' : '#d88fbf'} />
    <rect x="4" y="4" width="4" height="4" fill={isAqua ? '#7dd3fc' : '#f7d6e8'} />
    <rect x="20" y="4" width="4" height="4" fill={isAqua ? '#7dd3fc' : '#f7d6e8'} />
    <rect x="4" y="20" width="4" height="4" fill={isAqua ? '#7dd3fc' : '#f7d6e8'} />
    <rect x="20" y="20" width="4" height="4" fill={isAqua ? '#7dd3fc' : '#f7d6e8'} />
    {/* 主轮体外圈 */}
    <rect x="5" y="5" width="18" height="18" fill={isAqua ? '#0284c7' : '#3b2a5a'} />
    <rect x="6" y="6" width="16" height="16" fill={isAqua ? '#7dd3fc' : '#d88fbf'} />
    {/* 齿轮内圈槽 */}
    <rect x="9" y="9" width="10" height="10" fill={isAqua ? '#e0f2fe' : '#1a1120'} />
    {/* 中心轴 */}
    <rect x="12" y="12" width="4" height="4" fill={isAqua ? '#0284c7' : '#f7d6e8'} />
    <rect x="13" y="13" width="2" height="2" fill="#ffffff" />
  </svg>
);

// 2. 仓库：像素复古宝箱 / 整理匣 (Warehouse Treasure Chest)
export const PixelIconWarehouse: React.FC<{ className?: string; isAqua?: boolean }> = ({
  className = 'w-7 h-7',
  isAqua = false,
}) => (
  <svg viewBox="0 0 28 28" className={className} style={{ shapeRendering: 'crispEdges' }}>
    {/* 箱盖弧顶 */}
    <rect x="4" y="6" width="20" height="7" fill={isAqua ? '#0284c7' : '#6b4c8a'} />
    <rect x="5" y="7" width="18" height="5" fill={isAqua ? '#7dd3fc' : '#b7a2d9'} />
    <rect x="6" y="8" width="16" height="2" fill={isAqua ? '#bae6fd' : '#f7d6e8'} />
    {/* 箱身 */}
    <rect x="4" y="13" width="20" height="11" fill={isAqua ? '#0369a1' : '#3b2a5a'} />
    <rect x="5" y="14" width="18" height="9" fill={isAqua ? '#e0f2fe' : '#22162e'} />
    {/* 金属包角与铆钉 */}
    <rect x="4" y="6" width="3" height="18" fill={isAqua ? '#38bdf8' : '#d88fbf'} />
    <rect x="21" y="6" width="3" height="18" fill={isAqua ? '#38bdf8' : '#d88fbf'} />
    <rect x="5" y="8" width="1" height="2" fill="#ffffff" />
    <rect x="22" y="8" width="1" height="2" fill="#ffffff" />
    {/* 锁扣心形徽记 */}
    <rect x="12" y="12" width="4" height="5" fill={isAqua ? '#0284c7' : '#ff8ecb'} />
    <rect x="13" y="13" width="2" height="2" fill="#ffffff" />
    <rect x="13" y="15" width="2" height="1" fill={isAqua ? '#0369a1' : '#1a1120'} />
  </svg>
);

// 3. 通讯录：像素双马尾少女萌头 (Personas / Contacts Anime Girl)
export const PixelIconContacts: React.FC<{ className?: string; isAqua?: boolean }> = ({
  className = 'w-7 h-7',
  isAqua = false,
}) => (
  <svg viewBox="0 0 28 28" className={className} style={{ shapeRendering: 'crispEdges' }}>
    {/* 双马尾发束 */}
    <rect x="1" y="8" width="4" height="12" fill={isAqua ? '#0284c7' : '#6b4c8a'} />
    <rect x="2" y="10" width="2" height="8" fill={isAqua ? '#7dd3fc' : '#b7a2d9'} />
    <rect x="23" y="8" width="4" height="12" fill={isAqua ? '#0284c7' : '#6b4c8a'} />
    <rect x="24" y="10" width="2" height="8" fill={isAqua ? '#7dd3fc' : '#b7a2d9'} />
    {/* 发饰蝴蝶结 */}
    <rect x="4" y="7" width="3" height="3" fill={isAqua ? '#38bdf8' : '#ff8ecb'} />
    <rect x="21" y="7" width="3" height="3" fill={isAqua ? '#38bdf8' : '#ff8ecb'} />
    {/* 头发主体 */}
    <rect x="5" y="4" width="18" height="8" fill={isAqua ? '#0284c7' : '#3b2a5a'} />
    <rect x="6" y="5" width="16" height="5" fill={isAqua ? '#38bdf8' : '#6b4c8a'} />
    <rect x="8" y="5" width="6" height="2" fill={isAqua ? '#bae6fd' : '#f7d6e8'} />
    {/* 脸部 */}
    <rect x="6" y="9" width="16" height="11" fill={isAqua ? '#ffffff' : '#fff0f5'} />
    {/* 齐刘海 */}
    <rect x="6" y="9" width="3" height="3" fill={isAqua ? '#0284c7' : '#3b2a5a'} />
    <rect x="11" y="9" width="2" height="3" fill={isAqua ? '#0284c7' : '#3b2a5a'} />
    <rect x="15" y="9" width="2" height="3" fill={isAqua ? '#0284c7' : '#3b2a5a'} />
    <rect x="19" y="9" width="3" height="3" fill={isAqua ? '#0284c7' : '#3b2a5a'} />
    {/* 萌系大眼睛 */}
    <rect x="8" y="13" width="3" height="4" fill={isAqua ? '#0369a1' : '#6b4c8a'} />
    <rect x="8" y="13" width="1" height="2" fill="#ffffff" />
    <rect x="17" y="13" width="3" height="4" fill={isAqua ? '#0369a1' : '#6b4c8a'} />
    <rect x="17" y="13" width="1" height="2" fill="#ffffff" />
    {/* 软萌腮红 */}
    <rect x="7" y="17" width="3" height="1" fill={isAqua ? '#bae6fd' : '#ff8ecb'} />
    <rect x="18" y="17" width="3" height="1" fill={isAqua ? '#bae6fd' : '#ff8ecb'} />
    <rect x="13" y="17" width="2" height="1" fill={isAqua ? '#38bdf8' : '#ff8ecb'} />
  </svg>
);

// 4. QQ：像素圆滚滚企鹅 / 胖萌宠 (QQ Cute Pixel Penguin)
export const PixelIconQQ: React.FC<{ className?: string; isAqua?: boolean }> = ({
  className = 'w-7 h-7',
  isAqua = false,
}) => (
  <svg viewBox="0 0 28 28" className={className} style={{ shapeRendering: 'crispEdges' }}>
    {/* 身体外形 */}
    <rect x="6" y="4" width="16" height="18" fill={isAqua ? '#0369a1' : '#1a1120'} />
    <rect x="5" y="6" width="18" height="14" fill={isAqua ? '#0369a1' : '#1a1120'} />
    {/* 亮面高光毛色 */}
    <rect x="7" y="5" width="14" height="4" fill={isAqua ? '#38bdf8' : '#3b2a5a'} />
    {/* 白色大肚皮 */}
    <rect x="8" y="10" width="12" height="11" fill="#ffffff" />
    <rect x="9" y="9" width="10" height="2" fill="#ffffff" />
    {/* 围巾 */}
    <rect x="6" y="9" width="16" height="2" fill={isAqua ? '#38bdf8' : '#ff8ecb'} />
    <rect x="17" y="11" width="3" height="4" fill={isAqua ? '#38bdf8' : '#ff8ecb'} />
    <rect x="17" y="14" width="3" height="1" fill={isAqua ? '#bae6fd' : '#ff8ecb'} />
    {/* 眼睛 */}
    <rect x="9" y="6" width="2" height="3" fill="#ffffff" />
    <rect x="10" y="7" width="1" height="2" fill={isAqua ? '#0369a1' : '#1a1120'} />
    <rect x="17" y="6" width="2" height="3" fill="#ffffff" />
    <rect x="17" y="7" width="1" height="2" fill={isAqua ? '#0369a1' : '#1a1120'} />
    {/* 黄色小嘴 */}
    <rect x="12" y="8" width="4" height="2" fill="#ffca28" />
    {/* 脚丫 */}
    <rect x="8" y="22" width="4" height="2" fill="#ffca28" />
    <rect x="16" y="22" width="4" height="2" fill="#ffca28" />
  </svg>
);

// 5. 世界书：像素魔法守则书 (WorldBook Spellbook)
export const PixelIconWorldBook: React.FC<{ className?: string; isAqua?: boolean }> = ({
  className = 'w-7 h-7',
  isAqua = false,
}) => (
  <svg viewBox="0 0 28 28" className={className} style={{ shapeRendering: 'crispEdges' }}>
    {/* 书本体外框 */}
    <rect x="4" y="4" width="20" height="20" fill={isAqua ? '#0284c7' : '#1a1120'} />
    {/* 封面皮质 */}
    <rect x="5" y="5" width="18" height="18" fill={isAqua ? '#38bdf8' : '#3b2a5a'} />
    <rect x="6" y="6" width="16" height="16" fill={isAqua ? '#7dd3fc' : '#493066'} />
    {/* 书脊装饰条 */}
    <rect x="5" y="5" width="4" height="18" fill={isAqua ? '#0369a1' : '#22162e'} />
    <rect x="6" y="7" width="2" height="2" fill={isAqua ? '#bae6fd' : '#d88fbf'} />
    <rect x="6" y="13" width="2" height="2" fill={isAqua ? '#bae6fd' : '#d88fbf'} />
    <rect x="6" y="19" width="2" height="2" fill={isAqua ? '#bae6fd' : '#d88fbf'} />
    {/* 封面发光心形/星芒印记 */}
    <rect x="13" y="11" width="2" height="2" fill={isAqua ? '#0284c7' : '#ff8ecb'} />
    <rect x="17" y="11" width="2" height="2" fill={isAqua ? '#0284c7' : '#ff8ecb'} />
    <rect x="12" y="12" width="8" height="3" fill={isAqua ? '#0284c7' : '#ff8ecb'} />
    <rect x="13" y="15" width="6" height="2" fill={isAqua ? '#0284c7' : '#ff8ecb'} />
    <rect x="14" y="17" width="4" height="1" fill={isAqua ? '#0284c7' : '#ff8ecb'} />
    <rect x="15" y="18" width="2" height="1" fill={isAqua ? '#0284c7' : '#ff8ecb'} />
    <rect x="13" y="12" width="1" height="1" fill="#ffffff" />
    {/* 侧面纸张 */}
    <rect x="22" y="6" width="1" height="16" fill={isAqua ? '#ffffff' : '#f7d6e8'} />
  </svg>
);

// 5.5 预设：像素魔法滑块与调参心 (Preset Sliders & Magic Wand)
export const PixelIconPreset: React.FC<{ className?: string; isAqua?: boolean }> = ({
  className = 'w-7 h-7',
  isAqua = false,
}) => (
  <svg viewBox="0 0 28 28" className={className} style={{ shapeRendering: 'crispEdges' }}>
    {/* 芯片/预设底板 */}
    <rect x="4" y="4" width="20" height="20" fill={isAqua ? '#0369a1' : '#1a1120'} />
    <rect x="5" y="5" width="18" height="18" fill={isAqua ? '#e0f2fe' : '#2d1c3e'} />
    <rect x="6" y="6" width="16" height="16" fill={isAqua ? '#bae6fd' : '#3b2450'} />
    {/* 滑轨 1 (顶部) */}
    <rect x="8" y="9" width="12" height="2" fill={isAqua ? '#0284c7' : '#1a1120'} />
    <rect x="8" y="9" width="5" height="2" fill={isAqua ? '#38bdf8' : '#d88fbf'} />
    {/* 滑块 1 */}
    <rect x="13" y="8" width="3" height="4" fill={isAqua ? '#0284c7' : '#ff8ecb'} />
    <rect x="14" y="9" width="1" height="2" fill="#ffffff" />
    {/* 滑轨 2 (中部) */}
    <rect x="8" y="14" width="12" height="2" fill={isAqua ? '#0284c7' : '#1a1120'} />
    <rect x="8" y="14" width="8" height="2" fill={isAqua ? '#38bdf8' : '#d88fbf'} />
    {/* 滑块 2 */}
    <rect x="16" y="13" width="3" height="4" fill={isAqua ? '#0284c7' : '#ff8ecb'} />
    <rect x="17" y="14" width="1" height="2" fill="#ffffff" />
    {/* 滑轨 3 (底部) */}
    <rect x="8" y="19" width="12" height="2" fill={isAqua ? '#0284c7' : '#1a1120'} />
    <rect x="8" y="19" width="3" height="2" fill={isAqua ? '#38bdf8' : '#d88fbf'} />
    {/* 滑块 3 */}
    <rect x="10" y="18" width="3" height="4" fill={isAqua ? '#0284c7' : '#ff8ecb'} />
    <rect x="11" y="19" width="1" height="2" fill="#ffffff" />
    {/* 右上角魔法星芒 */}
    <rect x="20" y="4" width="2" height="2" fill="#ffffff" />
    <rect x="21" y="3" width="1" height="4" fill={isAqua ? '#0284c7' : '#ff8ecb'} />
    <rect x="19" y="4" width="4" height="1" fill={isAqua ? '#0284c7' : '#ff8ecb'} />
  </svg>
);

// 5.6 线下：现实相聚、咖啡与心动门扉 (Offline Real-life Meetup & Coffee)
export const PixelIconOffline: React.FC<{ className?: string; isAqua?: boolean }> = ({
  className = 'w-7 h-7',
  isAqua = false,
}) => (
  <svg viewBox="0 0 28 28" className={className} style={{ shapeRendering: 'crispEdges' }}>
    {/* 底座背景 */}
    <rect x="4" y="4" width="20" height="20" fill={isAqua ? '#0369a1' : '#1a1120'} />
    <rect x="5" y="5" width="18" height="18" fill={isAqua ? '#f0f9ff' : '#2c1737'} />
    <rect x="6" y="6" width="16" height="16" fill={isAqua ? '#e0f2fe' : '#3a1e4a'} />
    {/* 咖啡杯/茶杯 */}
    <rect x="8" y="12" width="10" height="9" fill={isAqua ? '#7dd3fc' : '#f7d6e8'} />
    <rect x="9" y="13" width="8" height="7" fill="#ffffff" />
    {/* 杯中热饮 */}
    <rect x="10" y="14" width="6" height="4" fill={isAqua ? '#38bdf8' : '#ff8ecb'} />
    {/* 杯耳 */}
    <rect x="18" y="14" width="3" height="5" fill={isAqua ? '#7dd3fc' : '#f7d6e8'} />
    <rect x="19" y="15" width="1" height="3" fill={isAqua ? '#e0f2fe' : '#3a1e4a'} />
    {/* 杯底托盘 */}
    <rect x="7" y="21" width="12" height="2" fill={isAqua ? '#0284c7' : '#d88fbf'} />
    {/* 袅袅升起的水心热气 */}
    <rect x="11" y="9" width="1" height="2" fill={isAqua ? '#0284c7' : '#ff8ecb'} />
    <rect x="13" y="7" width="2" height="2" fill={isAqua ? '#38bdf8' : '#ff8ecb'} />
    <rect x="16" y="8" width="1" height="2" fill={isAqua ? '#0284c7' : '#ff8ecb'} />
    {/* 碰面两颗小爱心 / 星芒 */}
    <rect x="12" y="7" width="4" height="2" fill={isAqua ? '#0284c7' : '#ff8ecb'} />
    <rect x="13" y="9" width="2" height="1" fill={isAqua ? '#38bdf8' : '#ff8ecb'} />
    {/* 右上角现实闪光 */}
    <rect x="21" y="5" width="2" height="2" fill={isAqua ? '#38bdf8' : '#ffe082'} />
    <rect x="20" y="6" width="4" height="1" fill={isAqua ? '#38bdf8' : '#ffe082'} />
    <rect x="21" y="7" width="1" height="2" fill="#ffffff" />
  </svg>
);

// 直接进线下图标 (Door into reality)
export const PixelIconOfflineDirect: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" className={className} style={{ shapeRendering: 'crispEdges' }}>
    {/* 门框 */}
    <rect x="3" y="3" width="14" height="18" fill="#ff8ecb" />
    <rect x="4" y="4" width="12" height="16" fill="#1e102a" />
    {/* 敞开的门 */}
    <rect x="5" y="5" width="8" height="14" fill="#d88fbf" />
    <rect x="6" y="6" width="6" height="12" fill="#ff8ecb" />
    {/* 门把手 */}
    <rect x="10" y="11" width="2" height="2" fill="#ffe082" />
    {/* 步入箭标与星芒 */}
    <rect x="14" y="10" width="5" height="2" fill="#ffffff" />
    <rect x="17" y="8" width="2" height="6" fill="#ffffff" />
    <rect x="19" y="9" width="2" height="4" fill="#ffffff" />
    <rect x="21" y="10" width="1" height="2" fill="#ffe082" />
  </svg>
);

// 邀约线下图标 (Invitation letter with heart)
export const PixelIconOfflineInvite: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" className={className} style={{ shapeRendering: 'crispEdges' }}>
    {/* 信封底 */}
    <rect x="3" y="5" width="18" height="14" fill="#d88fbf" />
    <rect x="4" y="6" width="16" height="12" fill="#2d1737" />
    {/* 信纸抽出 */}
    <rect x="6" y="3" width="12" height="7" fill="#ffffff" />
    <rect x="7" y="4" width="10" height="1" fill="#d88fbf" />
    <rect x="7" y="6" width="6" height="1" fill="#ff8ecb" />
    {/* 信封折痕 */}
    <rect x="4" y="6" width="2" height="2" fill="#ff8ecb" />
    <rect x="18" y="6" width="2" height="2" fill="#ff8ecb" />
    <rect x="6" y="8" width="2" height="2" fill="#ff8ecb" />
    <rect x="16" y="8" width="2" height="2" fill="#ff8ecb" />
    {/* 红色火漆心 */}
    <rect x="10" y="11" width="4" height="3" fill="#ff8ecb" />
    <rect x="11" y="14" width="2" height="1" fill="#ff8ecb" />
    <rect x="11" y="11" width="1" height="1" fill="#ffffff" />
  </svg>
);

// 5.7 记忆：像素发光记忆水晶与心动记忆磁带 (Memory Core Crystal & Memory Chip)
export const PixelIconMemory: React.FC<{ className?: string; isAqua?: boolean }> = ({
  className = 'w-7 h-7',
  isAqua = false,
}) => (
  <svg viewBox="0 0 28 28" className={className} style={{ shapeRendering: 'crispEdges' }}>
    {/* 底座背景 */}
    <rect x="4" y="4" width="20" height="20" fill={isAqua ? '#0369a1' : '#1a1120'} />
    <rect x="5" y="5" width="18" height="18" fill={isAqua ? '#f0f9ff' : '#2d1538'} />
    <rect x="6" y="6" width="16" height="16" fill={isAqua ? '#e0f2fe' : '#3c1b4c'} />
    {/* 水晶 / 磁带芯片外框 */}
    <rect x="8" y="7" width="12" height="14" fill={isAqua ? '#0284c7' : '#582a6f'} />
    <rect x="9" y="8" width="10" height="12" fill={isAqua ? '#7dd3fc' : '#7a3a9a'} />
    {/* 芯片左右卷轴/数据节点 */}
    <rect x="10" y="10" width="2" height="2" fill="#ffffff" />
    <rect x="16" y="10" width="2" height="2" fill="#ffffff" />
    <rect x="10" y="16" width="2" height="2" fill="#ffffff" />
    <rect x="16" y="16" width="2" height="2" fill="#ffffff" />
    {/* 中央发光记忆之晶心 */}
    <rect x="12" y="12" width="4" height="4" fill={isAqua ? '#0284c7' : '#ff8ecb'} />
    <rect x="13" y="11" width="2" height="1" fill={isAqua ? '#0284c7' : '#ff8ecb'} />
    <rect x="13" y="16" width="2" height="1" fill={isAqua ? '#0284c7' : '#ff8ecb'} />
    <rect x="13" y="13" width="2" height="2" fill="#ffffff" />
    {/* 记忆微光条 (数据流光) */}
    <rect x="8" y="9" width="1" height="10" fill={isAqua ? '#38bdf8' : '#ff8ecb'} />
    <rect x="19" y="9" width="1" height="10" fill={isAqua ? '#38bdf8' : '#ff8ecb'} />
    {/* 四角记忆神经星芒 */}
    <rect x="6" y="6" width="2" height="1" fill={isAqua ? '#38bdf8' : '#ffe082'} />
    <rect x="6" y="7" width="1" height="1" fill={isAqua ? '#38bdf8' : '#ffe082'} />
    <rect x="21" y="6" width="1" height="1" fill={isAqua ? '#38bdf8' : '#ffe082'} />
    <rect x="20" y="6" width="1" height="2" fill={isAqua ? '#38bdf8' : '#ffe082'} />
    <rect x="21" y="21" width="1" height="1" fill={isAqua ? '#0284c7' : '#ff8ecb'} />
    <rect x="6" y="21" width="1" height="1" fill={isAqua ? '#0284c7' : '#ff8ecb'} />
  </svg>
);

// 6. 外观：调色板 / 魔法笔 (Appearance Palette)
export const PixelIconAppearance: React.FC<{ className?: string; isAqua?: boolean }> = ({
  className = 'w-7 h-7',
  isAqua = false,
}) => (
  <svg viewBox="0 0 28 28" className={className} style={{ shapeRendering: 'crispEdges' }}>
    {/* 调色盘主体 */}
    <rect x="5" y="5" width="18" height="18" fill={isAqua ? '#0284c7' : '#3b2a5a'} />
    <rect x="6" y="6" width="16" height="16" fill={isAqua ? '#e0f2fe' : '#493066'} />
    {/* 颜料点 */}
    <rect x="8" y="8" width="3" height="3" fill={isAqua ? '#38bdf8' : '#ff8ecb'} />
    <rect x="9" y="8" width="1" height="1" fill="#ffffff" />
    <rect x="15" y="8" width="3" height="3" fill={isAqua ? '#ffffff' : '#f7d6e8'} />
    <rect x="19" y="12" width="3" height="3" fill={isAqua ? '#0284c7' : '#ffe082'} />
    <rect x="8" y="15" width="3" height="3" fill={isAqua ? '#7dd3fc' : '#b7a2d9'} />
    {/* 握持孔 */}
    <rect x="14" y="15" width="4" height="4" fill={isAqua ? '#0369a1' : '#1a1120'} />
    {/* 画笔斜跨 */}
    <rect x="18" y="18" width="6" height="2" fill={isAqua ? '#7dd3fc' : '#d88fbf'} />
    <rect x="22" y="20" width="2" height="2" fill={isAqua ? '#38bdf8' : '#ff8ecb'} />
  </svg>
);

// 7. 用户：像素猫脸 / 治愈萌脸 (User Pixel Avatar)
export const PixelIconUser: React.FC<{ className?: string; isAqua?: boolean }> = ({
  className = 'w-7 h-7',
  isAqua = false,
}) => (
  <svg viewBox="0 0 28 28" className={className} style={{ shapeRendering: 'crispEdges' }}>
    {/* 耳朵 */}
    <rect x="5" y="4" width="5" height="5" fill={isAqua ? '#0284c7' : '#1a1120'} />
    <rect x="6" y="5" width="3" height="3" fill={isAqua ? '#7dd3fc' : '#ff8ecb'} />
    <rect x="18" y="4" width="5" height="5" fill={isAqua ? '#0284c7' : '#1a1120'} />
    <rect x="19" y="5" width="3" height="3" fill={isAqua ? '#7dd3fc' : '#ff8ecb'} />
    {/* 脸部 */}
    <rect x="4" y="8" width="20" height="14" fill={isAqua ? '#0284c7' : '#1a1120'} />
    <rect x="5" y="9" width="18" height="12" fill={isAqua ? '#ffffff' : '#22162e'} />
    {/* 大眼睛 */}
    <rect x="7" y="12" width="4" height="4" fill={isAqua ? '#0369a1' : '#ffe082'} />
    <rect x="9" y="12" width="1" height="4" fill={isAqua ? '#0284c7' : '#1a1120'} />
    <rect x="7" y="12" width="1" height="1" fill="#ffffff" />
    <rect x="17" y="12" width="4" height="4" fill={isAqua ? '#0369a1' : '#ffe082'} />
    <rect x="18" y="12" width="1" height="4" fill={isAqua ? '#0284c7' : '#1a1120'} />
    <rect x="17" y="12" width="1" height="1" fill="#ffffff" />
    {/* 小鼻子 */}
    <rect x="13" y="16" width="2" height="2" fill={isAqua ? '#38bdf8' : '#ff8ecb'} />
    {/* 腮红 */}
    <rect x="5" y="16" width="2" height="1" fill={isAqua ? '#bae6fd' : '#d88fbf'} />
    <rect x="21" y="16" width="2" height="1" fill={isAqua ? '#bae6fd' : '#d88fbf'} />
  </svg>
);

// 8. 像素便签 (Memo Pad)
export const PixelIconMemo: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 28 28" className={className} style={{ shapeRendering: 'crispEdges' }}>
    <rect x="5" y="4" width="18" height="20" fill="#1a1120" />
    <rect x="6" y="5" width="16" height="18" fill="#fff0f5" />
    {/* 顶部便签夹 */}
    <rect x="10" y="3" width="8" height="3" fill="#ff8ecb" />
    {/* 横线 */}
    <rect x="8" y="10" width="10" height="1" fill="#d88fbf" />
    <rect x="8" y="14" width="12" height="1" fill="#d88fbf" />
    <rect x="8" y="18" width="7" height="1" fill="#d88fbf" />
    {/* 爱心小印章 */}
    <rect x="17" y="17" width="3" height="3" fill="#ff8ecb" />
  </svg>
);

// 9. 像素云朵 (Weather Cloud)
export const PixelIconWeather: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 28 28" className={className} style={{ shapeRendering: 'crispEdges' }}>
    <rect x="8" y="7" width="10" height="4" fill="#1a1120" />
    <rect x="5" y="11" width="18" height="8" fill="#1a1120" />
    {/* 云朵内部粉紫白渐变 */}
    <rect x="9" y="8" width="8" height="4" fill="#ffffff" />
    <rect x="6" y="12" width="16" height="6" fill="#f7d6e8" />
    <rect x="8" y="14" width="12" height="3" fill="#d88fbf" />
    {/* 小星星 */}
    <rect x="19" y="6" width="2" height="2" fill="#ffe082" />
    <rect x="4" y="17" width="2" height="2" fill="#ff8ecb" />
  </svg>
);

// 10. 像素每日一言 (Heart Envelope)
export const PixelIconQuote: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 28 28" className={className} style={{ shapeRendering: 'crispEdges' }}>
    <rect x="4" y="6" width="20" height="16" fill="#1a1120" />
    <rect x="5" y="7" width="18" height="14" fill="#f7d6e8" />
    {/* 信封折痕 */}
    <path d="M5 7 L14 15 L23 7" stroke="#6b4c8a" strokeWidth="2" fill="none" />
    {/* 封口大爱心 */}
    <rect x="12" y="11" width="4" height="4" fill="#ff8ecb" />
    <rect x="13" y="12" width="2" height="2" fill="#ffffff" />
  </svg>
);

// ==========================================
// 🔲 地雷系双层精致像素图标容器 (PixelAppCard)
// 完美的圆角微倒角、点阵粉边、深暮紫底、四角微雕
// ==========================================
export const PixelAppCard: React.FC<{
  children: React.ReactNode;
  active?: boolean;
  jiggleClass?: string;
  badge?: number;
  className?: string;
  isAqua?: boolean;
}> = ({ children, active, jiggleClass = '', badge = 0, className = '', isAqua = false }) => {
  return (
    <div
      className={`relative w-14 h-14 rounded-2xl p-[2px] transition-transform duration-150 select-none ${
        active
          ? isAqua
            ? 'scale-95 shadow-[0_0_18px_#38bdf8]'
            : 'scale-95 shadow-[0_0_16px_#ff8ecb]'
          : 'hover:scale-105'
      } ${jiggleClass} ${className}`}
      style={
        isAqua
          ? {
              background: 'linear-gradient(135deg, #ffffff 0%, #bae6fd 50%, #7dd3fc 100%)',
              boxShadow: '0 6px 18px -4px rgba(56, 189, 248, 0.35), 0 2px 6px rgba(186, 230, 253, 0.6)',
            }
          : {
              background: 'linear-gradient(135deg, #d88fbf 0%, #3b2a5a 50%, #6b4c8a 100%)',
              boxShadow: '0 6px 18px -4px rgba(216, 143, 191, 0.35), 0 2px 6px rgba(26, 17, 32, 0.8)',
            }
      }
    >
      {/* 内层卡片本体 */}
      <div
        className={`w-full h-full rounded-[14px] flex items-center justify-center relative overflow-hidden transition-colors ${
          isAqua
            ? 'bg-gradient-to-b from-[#ffffff] via-[#f0f9ff] to-[#e0f2fe] border border-[#7dd3fc]/80 shadow-inner'
            : 'bg-gradient-to-b from-[#241635] via-[#1a1120] to-[#120b18] border border-[#5a3e75]/50'
        }`}
      >
        {/* 顶部微弱高光 */}
        <div
          className={`absolute top-0 left-2 right-2 h-[1px] pointer-events-none ${
            isAqua ? 'bg-white' : 'bg-white/25'
          }`}
        ></div>

        {/* 内部图标 */}
        {children}

        {/* 四角精致像素微点装饰 */}
        <div
          className={`absolute top-1 left-1 w-1 h-1 rounded-xs pointer-events-none ${
            isAqua ? 'bg-[#38bdf8]/70' : 'bg-[#d88fbf]/60'
          }`}
        ></div>
        <div
          className={`absolute top-1 right-1 w-1 h-1 rounded-xs pointer-events-none ${
            isAqua ? 'bg-[#38bdf8]/70' : 'bg-[#d88fbf]/60'
          }`}
        ></div>
        <div
          className={`absolute bottom-1 left-1 w-1 h-1 rounded-xs pointer-events-none ${
            isAqua ? 'bg-[#38bdf8]/70' : 'bg-[#d88fbf]/60'
          }`}
        ></div>
        <div
          className={`absolute bottom-1 right-1 w-1 h-1 rounded-xs pointer-events-none ${
            isAqua ? 'bg-[#38bdf8]/70' : 'bg-[#d88fbf]/60'
          }`}
        ></div>
      </div>

      {/* 未读消息红粉/水蓝小圆点 */}
      {badge > 0 && (
        <div
          className={`absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full text-white text-[9px] font-bold flex items-center justify-center shadow-sm ${
            isAqua ? 'bg-[#0284c7] border-2 border-white' : 'bg-[#ff4081] border-2 border-[#1a1120]'
          }`}
        >
          {badge}
        </div>
      )}
    </div>
  );
};

// 11. 像素萌兔 (Pixel Bunny 🐰 - 对应参考图中的核心头像与吉祥物)
export const PixelBunny: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 28 28" className={className} style={{ shapeRendering: 'crispEdges' }}>
    {/* 兔耳朵轮廓 */}
    <rect x="7" y="2" width="4" height="10" fill="#1a1120" />
    <rect x="17" y="2" width="4" height="10" fill="#1a1120" />
    {/* 耳朵内部粉色 */}
    <rect x="8" y="3" width="2" height="8" fill="#ff8ecb" />
    <rect x="18" y="3" width="2" height="8" fill="#ff8ecb" />
    {/* 耳根蝴蝶结 */}
    <rect x="6" y="8" width="3" height="3" fill="#3b2a5a" />
    <rect x="7" y="9" width="1" height="1" fill="#ff8ecb" />
    {/* 脸部轮廓 */}
    <rect x="4" y="9" width="20" height="15" fill="#1a1120" />
    <rect x="5" y="10" width="18" height="13" fill="#fff0f6" />
    {/* 萌萌大眼睛 */}
    <rect x="8" y="13" width="3" height="4" fill="#241535" />
    <rect x="8" y="13" width="1" height="2" fill="#ffffff" />
    <rect x="17" y="13" width="3" height="4" fill="#241535" />
    <rect x="17" y="13" width="1" height="2" fill="#ffffff" />
    {/* 软萌腮红 */}
    <rect x="6" y="17" width="3" height="2" fill="#ff8ecb" />
    <rect x="19" y="17" width="3" height="2" fill="#ff8ecb" />
    {/* 鼻子与小嘴 */}
    <rect x="13" y="16" width="2" height="1" fill="#ff8ecb" />
    <rect x="12" y="18" width="1" height="1" fill="#241535" />
    <rect x="15" y="18" width="1" height="1" fill="#241535" />
    <rect x="13" y="19" width="2" height="1" fill="#241535" />
    {/* 小手 */}
    <rect x="8" y="23" width="3" height="2" fill="#ffb6c1" />
    <rect x="17" y="23" width="3" height="2" fill="#ffb6c1" />
  </svg>
);

// 12. 像素等级勋章 (Pixel Level Badge - 对应参考图中的 Lv.1 徽记)
export const PixelLevelBadge: React.FC<{ level?: string; className?: string }> = ({
  level = 'Lv.1',
  className = '',
}) => (
  <div
    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-[#d88fbf] bg-gradient-to-r from-[#2a1738] to-[#1a1024] text-[10px] font-mono font-bold text-[#ff8ecb] shadow-[0_2px_8px_rgba(255,142,203,0.25)] ${className}`}
  >
    <PixelSparkle className="w-2.5 h-2.5 text-[#ff8ecb]" />
    <span>{level}</span>
  </div>
);

// ==========================================
// 🌊「蓝白水色主题」专属日系清新像素资产库
// 色系：#0284c7 (深水蓝), #38bdf8 (天空蓝), #7dd3fc (冰蓝),
// #bae6fd (浅水蓝), #e0f2fe (霜雪蓝), #f0f9ff (奶白水色), #ffffff (纯白)
// ==========================================

// 13. 像素小鱼 (Pixel Fish 🐟)
export const PixelFish: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-6 h-6',
  color = '#38bdf8',
}) => (
  <svg viewBox="0 0 24 16" className={className} style={{ shapeRendering: 'crispEdges' }}>
    {/* 尾鳍 */}
    <rect x="0" y="3" width="2" height="10" fill="#0284c7" />
    <rect x="2" y="5" width="2" height="6" fill="#7dd3fc" />
    <rect x="1" y="4" width="2" height="8" fill="#bae6fd" />
    {/* 鱼身轮廓 */}
    <rect x="4" y="4" width="14" height="8" fill="#0284c7" />
    <rect x="5" y="3" width="11" height="10" fill="#0284c7" />
    {/* 鱼身主体填充 */}
    <rect x="5" y="4" width="12" height="8" fill={color} />
    <rect x="6" y="5" width="11" height="6" fill="#7dd3fc" />
    {/* 肚皮奶白色 */}
    <rect x="7" y="9" width="8" height="2" fill="#ffffff" />
    {/* 背鳍 */}
    <rect x="9" y="1" width="4" height="2" fill="#0284c7" />
    <rect x="10" y="2" width="2" height="1" fill="#bae6fd" />
    {/* 胸鳍 */}
    <rect x="10" y="8" width="3" height="2" fill="#bae6fd" />
    {/* 灵动大眼睛 */}
    <rect x="14" y="6" width="3" height="3" fill="#ffffff" />
    <rect x="15" y="6" width="2" height="2" fill="#0369a1" />
    <rect x="15" y="6" width="1" height="1" fill="#ffffff" />
    {/* 吐出的小气泡 */}
    <rect x="21" y="4" width="2" height="2" fill="#bae6fd" />
    <rect x="23" y="1" width="1" height="1" fill="#7dd3fc" />
  </svg>
);

// 14. 像素云朵 (Pixel Cloud ☁️)
export const PixelCloud: React.FC<{ className?: string }> = ({ className = 'w-7 h-5' }) => (
  <svg viewBox="0 0 28 16" className={className} style={{ shapeRendering: 'crispEdges' }}>
    {/* 边框 */}
    <rect x="6" y="2" width="12" height="12" fill="#7dd3fc" />
    <rect x="2" y="6" width="24" height="8" fill="#7dd3fc" />
    <rect x="16" y="4" width="9" height="10" fill="#7dd3fc" />
    {/* 内部纯白与奶白 */}
    <rect x="7" y="3" width="10" height="10" fill="#ffffff" />
    <rect x="3" y="7" width="22" height="6" fill="#ffffff" />
    <rect x="17" y="5" width="7" height="8" fill="#ffffff" />
    <rect x="5" y="11" width="18" height="3" fill="#f0f9ff" />
    {/* 腮红 */}
    <rect x="6" y="9" width="3" height="2" fill="#bae6fd" />
    <rect x="19" y="9" width="3" height="2" fill="#bae6fd" />
  </svg>
);

// 15. 像素水滴 (Pixel Droplet 💧)
export const PixelDroplet: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 16 16" className={className} style={{ shapeRendering: 'crispEdges' }}>
    <rect x="7" y="1" width="2" height="2" fill="#0284c7" />
    <rect x="6" y="3" width="4" height="2" fill="#0284c7" />
    <rect x="4" y="5" width="8" height="3" fill="#0284c7" />
    <rect x="3" y="8" width="10" height="5" fill="#0284c7" />
    <rect x="5" y="13" width="6" height="2" fill="#0284c7" />
    {/* 内部水光 */}
    <rect x="5" y="5" width="6" height="3" fill="#38bdf8" />
    <rect x="4" y="8" width="8" height="4" fill="#7dd3fc" />
    <rect x="6" y="12" width="4" height="1" fill="#38bdf8" />
    {/* 高光 */}
    <rect x="5" y="7" width="2" height="3" fill="#ffffff" />
    <rect x="6" y="6" width="1" height="1" fill="#ffffff" />
  </svg>
);

// 16. 像素透明泡泡 (Pixel Bubble 🫧)
export const PixelBubble: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 16 16" className={className} style={{ shapeRendering: 'crispEdges' }}>
    <rect x="5" y="1" width="6" height="1" fill="#7dd3fc" />
    <rect x="5" y="14" width="6" height="1" fill="#7dd3fc" />
    <rect x="2" y="4" width="1" height="8" fill="#7dd3fc" />
    <rect x="13" y="4" width="1" height="8" fill="#7dd3fc" />
    <rect x="3" y="2" width="2" height="2" fill="#7dd3fc" />
    <rect x="11" y="2" width="2" height="2" fill="#7dd3fc" />
    <rect x="3" y="12" width="2" height="2" fill="#7dd3fc" />
    <rect x="11" y="12" width="2" height="2" fill="#7dd3fc" />
    {/* 弧形晶莹高光 */}
    <rect x="4" y="3" width="3" height="1" fill="#ffffff" />
    <rect x="3" y="4" width="1" height="3" fill="#ffffff" />
    <rect x="11" y="11" width="1" height="1" fill="#ffffff" />
  </svg>
);

// 17. 像素水蓝小蝴蝶结 (Pixel Aqua Ribbon 🎀)
export const PixelAquaRibbon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" className={className} style={{ shapeRendering: 'crispEdges' }}>
    {/* 蝴蝶结轮廓 */}
    <rect x="2" y="5" width="20" height="9" fill="#0284c7" />
    <rect x="10" y="7" width="4" height="5" fill="#0284c7" />
    {/* 左右翼填充 */}
    <rect x="3" y="6" width="7" height="7" fill="#7dd3fc" />
    <rect x="14" y="6" width="7" height="7" fill="#7dd3fc" />
    <rect x="4" y="7" width="5" height="5" fill="#38bdf8" />
    <rect x="15" y="7" width="5" height="5" fill="#38bdf8" />
    {/* 丝带飘带 */}
    <rect x="6" y="14" width="4" height="6" fill="#0284c7" />
    <rect x="7" y="14" width="2" height="5" fill="#7dd3fc" />
    <rect x="14" y="14" width="4" height="6" fill="#0284c7" />
    <rect x="15" y="14" width="2" height="5" fill="#7dd3fc" />
    {/* 中心打结 */}
    <rect x="11" y="8" width="2" height="3" fill="#ffffff" />
    <rect x="5" y="7" width="2" height="1" fill="#ffffff" />
    <rect x="16" y="7" width="2" height="1" fill="#ffffff" />
  </svg>
);

// 18. 像素小星星 (Pixel Star ⭐)
export const PixelStar: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-4 h-4',
  color = '#7dd3fc',
}) => (
  <svg viewBox="0 0 16 16" className={className} style={{ shapeRendering: 'crispEdges' }}>
    <rect x="7" y="1" width="2" height="14" fill={color} />
    <rect x="1" y="7" width="14" height="2" fill={color} />
    <rect x="5" y="5" width="6" height="6" fill={color} />
    <rect x="6" y="3" width="4" height="10" fill={color} />
    <rect x="3" y="6" width="10" height="4" fill={color} />
    <rect x="7" y="7" width="2" height="2" fill="#ffffff" />
  </svg>
);

// 19. 像素小花 (Pixel Flower 🌸)
export const PixelFlower: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 16 16" className={className} style={{ shapeRendering: 'crispEdges' }}>
    {/* 5 花瓣 */}
    <rect x="6" y="1" width="4" height="4" fill="#ffffff" />
    <rect x="6" y="11" width="4" height="4" fill="#ffffff" />
    <rect x="1" y="6" width="4" height="4" fill="#ffffff" />
    <rect x="11" y="6" width="4" height="4" fill="#ffffff" />
    <rect x="4" y="4" width="8" height="8" fill="#ffffff" />
    {/* 边框淡蓝 */}
    <rect x="5" y="0" width="6" height="1" fill="#7dd3fc" />
    <rect x="5" y="15" width="6" height="1" fill="#7dd3fc" />
    <rect x="0" y="5" width="1" height="6" fill="#7dd3fc" />
    <rect x="15" y="5" width="1" height="6" fill="#7dd3fc" />
    {/* 花蕊水蓝 */}
    <rect x="6" y="6" width="4" height="4" fill="#38bdf8" />
    <rect x="7" y="7" width="2" height="2" fill="#fef08a" />
  </svg>
);

// 20. 像素小月亮 (Pixel Moon 🌙)
export const PixelMoon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 16 16" className={className} style={{ shapeRendering: 'crispEdges' }}>
    <rect x="6" y="1" width="6" height="2" fill="#7dd3fc" />
    <rect x="4" y="3" width="4" height="2" fill="#7dd3fc" />
    <rect x="2" y="5" width="4" height="6" fill="#7dd3fc" />
    <rect x="4" y="11" width="4" height="2" fill="#7dd3fc" />
    <rect x="6" y="13" width="6" height="2" fill="#7dd3fc" />
    {/* 月光主体 */}
    <rect x="7" y="2" width="4" height="12" fill="#fef08a" />
    <rect x="5" y="4" width="3" height="8" fill="#fef08a" />
    <rect x="3" y="6" width="3" height="4" fill="#fef08a" />
    <rect x="4" y="5" width="2" height="2" fill="#ffffff" />
  </svg>
);

// 21. 像素水波纹 (Pixel Wave 〰️)
export const PixelWave: React.FC<{ className?: string }> = ({ className = 'w-6 h-2' }) => (
  <svg viewBox="0 0 24 8" className={className} style={{ shapeRendering: 'crispEdges' }}>
    <rect x="0" y="4" width="4" height="2" fill="#7dd3fc" />
    <rect x="4" y="2" width="4" height="2" fill="#38bdf8" />
    <rect x="8" y="4" width="4" height="2" fill="#7dd3fc" />
    <rect x="12" y="2" width="4" height="2" fill="#38bdf8" />
    <rect x="16" y="4" width="4" height="2" fill="#7dd3fc" />
    <rect x="20" y="2" width="4" height="2" fill="#38bdf8" />
    {/* 浪花小白点 */}
    <rect x="5" y="1" width="2" height="1" fill="#ffffff" />
    <rect x="13" y="1" width="2" height="1" fill="#ffffff" />
    <rect x="21" y="1" width="2" height="1" fill="#ffffff" />
  </svg>
);

// 22. 水色小兔 (Pixel Aqua Bunny 🐰)
export const PixelAquaBunny: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 28 28" className={className} style={{ shapeRendering: 'crispEdges' }}>
    {/* 兔耳朵轮廓 */}
    <rect x="7" y="2" width="4" height="10" fill="#0284c7" />
    <rect x="17" y="2" width="4" height="10" fill="#0284c7" />
    {/* 耳朵内部冰蓝 */}
    <rect x="8" y="3" width="2" height="8" fill="#7dd3fc" />
    <rect x="18" y="3" width="2" height="8" fill="#7dd3fc" />
    {/* 耳根小水蓝蝴蝶结 */}
    <rect x="5" y="8" width="5" height="3" fill="#38bdf8" />
    <rect x="7" y="9" width="1" height="1" fill="#ffffff" />
    {/* 脸部轮廓 */}
    <rect x="4" y="9" width="20" height="15" fill="#0284c7" />
    <rect x="5" y="10" width="18" height="13" fill="#ffffff" />
    {/* 萌萌大眼睛 */}
    <rect x="8" y="13" width="3" height="4" fill="#0369a1" />
    <rect x="8" y="13" width="1" height="2" fill="#ffffff" />
    <rect x="17" y="13" width="3" height="4" fill="#0369a1" />
    <rect x="17" y="13" width="1" height="2" fill="#ffffff" />
    {/* 浅水蓝腮红 */}
    <rect x="6" y="17" width="3" height="2" fill="#bae6fd" />
    <rect x="19" y="17" width="3" height="2" fill="#bae6fd" />
    {/* 鼻子与小嘴 */}
    <rect x="13" y="16" width="2" height="1" fill="#7dd3fc" />
    <rect x="12" y="18" width="1" height="1" fill="#0369a1" />
    <rect x="15" y="18" width="1" height="1" fill="#0369a1" />
    <rect x="13" y="19" width="2" height="1" fill="#0369a1" />
    {/* 小手 */}
    <rect x="8" y="23" width="3" height="2" fill="#e0f2fe" />
    <rect x="17" y="23" width="3" height="2" fill="#e0f2fe" />
  </svg>
);

