/**
 * 线下小说场景插画生图生成器
 * 支持根据小说情节描述生成高精细度日系/唯美文学插图，支持自定义 Prompt 与风格选择
 */

function createSvgDataUrl(svgContent: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`;
}

export type IllustrationTheme = 'cafe' | 'rain' | 'night' | 'sunset' | 'sakura' | 'library' | 'bedroom' | 'dream';

export function detectSceneTheme(text: string): IllustrationTheme {
  const t = text.toLowerCase();
  if (t.includes('雨') || t.includes('伞') || t.includes('湿') || t.includes('水滴')) {
    return 'rain';
  }
  if (t.includes('夜') || t.includes('星') || t.includes('月') || t.includes('晚') || t.includes('黑暗') || t.includes('灯火')) {
    return 'night';
  }
  if (t.includes('夕阳') || t.includes('黄昏') || t.includes('晚霞') || t.includes('余晖') || t.includes('日落')) {
    return 'sunset';
  }
  if (t.includes('樱') || t.includes('花') || t.includes('风') || t.includes('树') || t.includes('公园') || t.includes('草')) {
    return 'sakura';
  }
  if (t.includes('书') || t.includes('馆') || t.includes('页') || t.includes('读') || t.includes('静')) {
    return 'library';
  }
  if (t.includes('床') || t.includes('被') || t.includes('眠') || t.includes('房') || t.includes('枕')) {
    return 'bedroom';
  }
  if (t.includes('咖啡') || t.includes('茶') || t.includes('杯') || t.includes('店') || t.includes('座') || t.includes('饮')) {
    return 'cafe';
  }
  return 'dream';
}

export function generateNovelIllustration(text: string, charName: string, customTheme?: IllustrationTheme): { url: string; title: string; theme: IllustrationTheme } {
  const theme = customTheme || detectSceneTheme(text);

  let title = `【${charName}】的温存时光`;
  let svgContent = '';

  if (theme === 'rain') {
    title = `窗外细雨与「${charName}」的低语`;
    svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" width="100%" height="100%">
        <defs>
          <linearGradient id="rainBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#120c1f"/>
            <stop offset="60%" stop-color="#1c132f"/>
            <stop offset="100%" stop-color="#2a1742"/>
          </linearGradient>
          <linearGradient id="lampGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffb86c" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#ff79c6" stop-opacity="0"/>
          </linearGradient>
          <filter id="blur">
            <feGaussianBlur stdDeviation="3"/>
          </filter>
        </defs>
        <rect width="600" height="380" fill="url(#rainBg)"/>
        <!-- 窗外朦胧街灯 -->
        <circle cx="160" cy="140" r="70" fill="url(#lampGlow)" filter="url(#blur)"/>
        <circle cx="480" cy="180" r="90" fill="url(#lampGlow)" filter="url(#blur)"/>
        <!-- 窗框与玻璃反光 -->
        <rect x="40" y="30" width="520" height="320" rx="16" fill="none" stroke="#ff8ecb" stroke-opacity="0.2" stroke-width="3"/>
        <line x1="300" y1="30" x2="300" y2="350" stroke="#ff8ecb" stroke-opacity="0.15" stroke-width="2"/>
        <line x1="40" y1="190" x2="560" y2="190" stroke="#ff8ecb" stroke-opacity="0.15" stroke-width="2"/>
        <!-- 雨滴划痕 -->
        <path d="M120 70 Q122 130 118 180" stroke="#a4b5ff" stroke-width="1.8" stroke-opacity="0.5" stroke-linecap="round"/>
        <path d="M220 90 Q218 150 224 210" stroke="#a4b5ff" stroke-width="2.2" stroke-opacity="0.6" stroke-linecap="round"/>
        <path d="M380 60 Q382 120 376 220" stroke="#a4b5ff" stroke-width="1.5" stroke-opacity="0.4" stroke-linecap="round"/>
        <path d="M440 110 Q444 170 438 250" stroke="#a4b5ff" stroke-width="2" stroke-opacity="0.55" stroke-linecap="round"/>
        <path d="M510 80 Q508 140 514 190" stroke="#a4b5ff" stroke-width="1.8" stroke-opacity="0.5" stroke-linecap="round"/>
        <!-- 室内温馨剪影与热饮热气 -->
        <ellipse cx="300" cy="330" rx="220" ry="40" fill="#150a24"/>
        <rect x="270" y="275" width="46" height="40" rx="8" fill="#ffd1dc" opacity="0.85"/>
        <path d="M316 285 Q328 295 316 305" fill="none" stroke="#ffd1dc" stroke-width="4" stroke-linecap="round" opacity="0.85"/>
        <path d="M285 265 Q288 250 282 240 Q286 230 284 220" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
        <path d="M298 265 Q295 250 300 240 Q296 230 299 220" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
        <!-- 氛围文字 -->
        <text x="300" y="365" font-family="serif" font-size="13" fill="#ffb3d9" text-anchor="middle" letter-spacing="3" opacity="0.9">雨滴落下的声音 · 属于两人的静谧此刻</text>
      </svg>
    `;
  } else if (theme === 'sunset') {
    title = `落日余晖洒在「${charName}」的发梢`;
    svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" width="100%" height="100%">
        <defs>
          <linearGradient id="sunsetBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#4a154b"/>
            <stop offset="40%" stop-color="#b83280"/>
            <stop offset="70%" stop-color="#ed8936"/>
            <stop offset="100%" stop-color="#2d1537"/>
          </linearGradient>
          <linearGradient id="sunRay" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#fefcbf" stop-opacity="0.9"/>
            <stop offset="100%" stop-color="#f687b3" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <rect width="600" height="380" fill="url(#sunsetBg)"/>
        <!-- 巨大落日金轮 -->
        <circle cx="300" cy="210" r="110" fill="#fffaf0" opacity="0.9"/>
        <circle cx="300" cy="210" r="140" fill="#fed7aa" opacity="0.3"/>
        <circle cx="300" cy="210" r="180" fill="#fbb6ce" opacity="0.2"/>
        <!-- 百叶窗投影斜光束 -->
        <polygon points="0,0 200,0 600,340 400,340" fill="url(#sunRay)" opacity="0.25"/>
        <polygon points="0,60 140,60 520,380 380,380" fill="url(#sunRay)" opacity="0.2"/>
        <polygon points="0,120 80,120 440,380 360,380" fill="url(#sunRay)" opacity="0.18"/>
        <!-- 城市天际线剪影 -->
        <path d="M0 380 L0 280 L40 280 L40 310 L90 310 L90 260 L140 260 L140 300 L220 300 L220 250 L270 250 L270 290 L340 290 L340 240 L390 240 L390 310 L470 310 L470 270 L530 270 L530 380 Z" fill="#200d2f"/>
        <!-- 飞鸟几只 -->
        <path d="M240 110 Q246 102 252 110 Q258 102 264 110" fill="none" stroke="#4a154b" stroke-width="2" stroke-linecap="round"/>
        <path d="M265 95 Q270 88 275 95 Q280 88 285 95" fill="none" stroke="#4a154b" stroke-width="1.8" stroke-linecap="round"/>
        <text x="300" y="365" font-family="serif" font-size="13" fill="#ffe4e6" text-anchor="middle" letter-spacing="3" opacity="0.95">暖橘色的夕暮 · 留存这一刻的悸动</text>
      </svg>
    `;
  } else if (theme === 'night') {
    title = `夜幕星河与「${charName}」的眸光`;
    svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" width="100%" height="100%">
        <defs>
          <linearGradient id="nightBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0a0514"/>
            <stop offset="60%" stop-color="#190e2b"/>
            <stop offset="100%" stop-color="#2d1645"/>
          </linearGradient>
        </defs>
        <rect width="600" height="380" fill="url(#nightBg)"/>
        <!-- 皎洁弯月 -->
        <path d="M460 70 A55 55 0 1 0 520 150 A48 48 0 1 1 460 70 Z" fill="#fef9c3" opacity="0.92"/>
        <circle cx="485" cy="115" r="75" fill="#fef9c3" opacity="0.12"/>
        <!-- 繁星点点 -->
        <circle cx="80" cy="60" r="1.5" fill="#fff"/>
        <circle cx="140" cy="120" r="2" fill="#ffd1dc"/>
        <circle cx="210" cy="40" r="2.5" fill="#fff"/>
        <circle cx="280" cy="90" r="1.5" fill="#a5f3fc"/>
        <circle cx="350" cy="50" r="2" fill="#fff"/>
        <circle cx="390" cy="130" r="1.8" fill="#fbcfe8"/>
        <circle cx="100" cy="180" r="1.5" fill="#fff"/>
        <circle cx="260" cy="170" r="2.2" fill="#ffd1dc"/>
        <!-- 柔和星芒十字 -->
        <path d="M210 32 L210 48 M202 40 L218 40" stroke="#fff" stroke-width="1.5" opacity="0.8"/>
        <path d="M350 42 L350 58 M342 50 L358 50" stroke="#ffd1dc" stroke-width="1.5" opacity="0.8"/>
        <!-- 阳台栏杆剪影 -->
        <rect x="0" y="310" width="600" height="70" fill="#11071f"/>
        <line x1="0" y1="310" x2="600" y2="310" stroke="#ff8ecb" stroke-opacity="0.3" stroke-width="3"/>
        <line x1="60" y1="310" x2="60" y2="380" stroke="#ff8ecb" stroke-opacity="0.2" stroke-width="2"/>
        <line x1="160" y1="310" x2="160" y2="380" stroke="#ff8ecb" stroke-opacity="0.2" stroke-width="2"/>
        <line x1="260" y1="310" x2="260" y2="380" stroke="#ff8ecb" stroke-opacity="0.2" stroke-width="2"/>
        <line x1="360" y1="310" x2="360" y2="380" stroke="#ff8ecb" stroke-opacity="0.2" stroke-width="2"/>
        <line x1="460" y1="310" x2="460" y2="380" stroke="#ff8ecb" stroke-opacity="0.2" stroke-width="2"/>
        <line x1="560" y1="310" x2="560" y2="380" stroke="#ff8ecb" stroke-opacity="0.2" stroke-width="2"/>
        <text x="300" y="365" font-family="serif" font-size="13" fill="#e9d5ff" text-anchor="middle" letter-spacing="3" opacity="0.95">星河低垂 · 只有彼此心跳的夜晚</text>
      </svg>
    `;
  } else if (theme === 'sakura') {
    title = `落樱纷飞与「${charName}」的重逢`;
    svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" width="100%" height="100%">
        <defs>
          <linearGradient id="sakuraBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#281134"/>
            <stop offset="50%" stop-color="#4a1a4e"/>
            <stop offset="100%" stop-color="#1f0c2a"/>
          </linearGradient>
        </defs>
        <rect width="600" height="380" fill="url(#sakuraBg)"/>
        <!-- 樱花树枝剪影 -->
        <path d="M0 60 Q120 90 220 50 Q300 20 400 80" fill="none" stroke="#230d2e" stroke-width="14" stroke-linecap="round"/>
        <path d="M220 50 Q260 120 310 140" fill="none" stroke="#230d2e" stroke-width="7" stroke-linecap="round"/>
        <!-- 飘落的花瓣 -->
        <ellipse cx="140" cy="110" rx="9" ry="6" fill="#fbcfe8" transform="rotate(25 140 110)"/>
        <ellipse cx="230" cy="160" rx="11" ry="7" fill="#f472b6" transform="rotate(-30 230 160)"/>
        <ellipse cx="320" cy="120" rx="10" ry="6" fill="#fbcfe8" transform="rotate(45 320 120)"/>
        <ellipse cx="380" cy="190" rx="12" ry="7.5" fill="#f472b6" transform="rotate(15 380 190)"/>
        <ellipse cx="450" cy="240" rx="10" ry="6.5" fill="#fbcfe8" transform="rotate(-40 450 240)"/>
        <ellipse cx="180" cy="270" rx="11" ry="7" fill="#f472b6" transform="rotate(35 180 270)"/>
        <ellipse cx="280" cy="310" rx="9" ry="5.5" fill="#fbcfe8" transform="rotate(-15 280 310)"/>
        <!-- 柔光光晕 -->
        <circle cx="300" cy="190" r="130" fill="#f472b6" opacity="0.12"/>
        <text x="300" y="365" font-family="serif" font-size="13" fill="#fbcfe8" text-anchor="middle" letter-spacing="3" opacity="0.95">春风吹拂 · 飞舞在眼底的花瓣</text>
      </svg>
    `;
  } else {
    // 默认 cafe 咖啡厅 / 暖调浪漫
    title = `午后暖意 · 与「${charName}」的对座`;
    svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" width="100%" height="100%">
        <defs>
          <linearGradient id="cafeBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#24122d"/>
            <stop offset="50%" stop-color="#3b1d44"/>
            <stop offset="100%" stop-color="#180b20"/>
          </linearGradient>
          <radialGradient id="tableGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fed7aa" stop-opacity="0.5"/>
            <stop offset="100%" stop-color="#3b1d44" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="600" height="380" fill="url(#cafeBg)"/>
        <!-- 暖色桌面光圈 -->
        <ellipse cx="300" cy="280" rx="240" ry="90" fill="url(#tableGlow)"/>
        <!-- 咖啡杯与茶碟 -->
        <ellipse cx="300" cy="290" rx="70" ry="22" fill="#ffedd5" stroke="#2b1137" stroke-width="4"/>
        <ellipse cx="300" cy="285" rx="52" ry="16" fill="#fde68a" stroke="#2b1137" stroke-width="3"/>
        <ellipse cx="300" cy="284" rx="46" ry="12" fill="#78350f"/>
        <ellipse cx="300" cy="283" rx="40" ry="9" fill="#92400e" opacity="0.8"/>
        <!-- 杯把 -->
        <path d="M352 280 C375 280 375 295 352 295" fill="none" stroke="#2b1137" stroke-width="5" stroke-linecap="round"/>
        <!-- 袅袅热气 -->
        <path d="M290 265 Q295 245 288 230 Q292 215 289 200" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>
        <path d="M310 265 Q305 245 312 230 Q308 215 311 200" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>
        <!-- 甜品小碟 -->
        <ellipse cx="440" cy="275" rx="42" ry="14" fill="#fbcfe8" stroke="#2b1137" stroke-width="3"/>
        <circle cx="440" cy="270" r="14" fill="#f43f5e"/>
        <text x="300" y="365" font-family="serif" font-size="13" fill="#fde68a" text-anchor="middle" letter-spacing="3" opacity="0.95">指尖轻触的温度 · 咖啡与微甜心事</text>
      </svg>
    `;
  }

  return {
    url: createSvgDataUrl(svgContent),
    title,
    theme,
  };
}
