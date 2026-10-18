import { ApiConfig, CharacterPersona, ChatMessage, PresetItem, StickerItem, WebpageApp, WorldBookItem, MemoryItem } from '../types/phone';

// 日系地雷系 / 亚文化萌系软萌涂鸦 SVG 表情包预设 (与小手机黑粉紫整体美学完全统一)
function createSvgDataUrl(svgContent: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`;
}

export const PRESET_STICKERS: StickerItem[] = [
  {
    id: 'st_heart',
    name: '比心心',
    isGlobal: true,
    url: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <!-- 萌兔耳朵 -->
        <rect x="24" y="8" width="14" height="32" rx="7" fill="#ffffff" stroke="#251635" stroke-width="3"/>
        <rect x="28" y="14" width="6" height="20" rx="3" fill="#ffb6c1"/>
        <rect x="62" y="8" width="14" height="32" rx="7" fill="#ffffff" stroke="#251635" stroke-width="3"/>
        <rect x="66" y="14" width="6" height="20" rx="3" fill="#ffb6c1"/>
        <!-- 耳根地雷系黑色蝴蝶结 -->
        <path d="M22 28 L30 33 L22 38 Z" fill="#251635"/>
        <path d="M38 28 L30 33 L38 38 Z" fill="#251635"/>
        <circle cx="30" cy="33" r="3" fill="#ff8ecb"/>
        <!-- 脸蛋 -->
        <rect x="18" y="30" width="64" height="52" rx="26" fill="#ffffff" stroke="#251635" stroke-width="3.5"/>
        <!-- 大大萌眼+心形高光 -->
        <ellipse cx="36" cy="52" rx="7" ry="9" fill="#251635"/>
        <circle cx="34" cy="49" r="3" fill="#ffffff"/>
        <ellipse cx="64" cy="52" rx="7" ry="9" fill="#251635"/>
        <circle cx="62" cy="49" r="3" fill="#ffffff"/>
        <!-- 软软粉红腮红 -->
        <ellipse cx="27" cy="62" rx="6" ry="3.5" fill="#ff8ecb" opacity="0.85"/>
        <ellipse cx="73" cy="62" rx="6" ry="3.5" fill="#ff8ecb" opacity="0.85"/>
        <!-- 小嘴 -->
        <path d="M47 61 Q50 63 53 61" fill="none" stroke="#251635" stroke-width="2.5" stroke-linecap="round"/>
        <!-- 怀抱发光粉色爱心 -->
        <path d="M50 78 C40 68 35 60 42 54 C48 49 50 56 50 56 C50 56 52 49 58 54 C65 60 60 68 50 78 Z" fill="#ff4081" stroke="#ffffff" stroke-width="2"/>
        <!-- 小手爪 -->
        <circle cx="41" cy="68" r="4.5" fill="#ffffff" stroke="#251635" stroke-width="2"/>
        <circle cx="59" cy="68" r="4.5" fill="#ffffff" stroke="#251635" stroke-width="2"/>
      </svg>
    `),
  },
  {
    id: 'st_weiqu',
    name: '委屈哭',
    isGlobal: true,
    url: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <!-- 耷拉的软垂耳 -->
        <path d="M26 36 C18 42 12 58 16 68 C19 75 25 72 26 64 C28 56 28 44 28 36 Z" fill="#ffffff" stroke="#251635" stroke-width="3"/>
        <path d="M74 36 C82 42 88 58 84 68 C81 75 75 72 74 64 C72 56 72 44 72 36 Z" fill="#ffffff" stroke="#251635" stroke-width="3"/>
        <!-- 脸部 -->
        <rect x="20" y="26" width="60" height="54" rx="27" fill="#ffffff" stroke="#251635" stroke-width="3.5"/>
        <!-- 泪眼汪汪大眼睛 -->
        <ellipse cx="38" cy="48" rx="8" ry="10" fill="#251635"/>
        <circle cx="36" cy="44" r="3.5" fill="#ffffff"/>
        <circle cx="40" cy="53" r="2" fill="#80d8ff"/>
        <ellipse cx="62" cy="48" rx="8" ry="10" fill="#251635"/>
        <circle cx="60" cy="44" r="3.5" fill="#ffffff"/>
        <circle cx="64" cy="53" r="2" fill="#80d8ff"/>
        <!-- 滚落的大颗珍珠泪 -->
        <path d="M30 56 Q33 66 30 72 Q26 66 30 56 Z" fill="#80d8ff" stroke="#251635" stroke-width="1.5"/>
        <path d="M70 56 Q73 66 70 72 Q66 66 70 56 Z" fill="#80d8ff" stroke="#251635" stroke-width="1.5"/>
        <!-- 哭唧唧颤抖小嘴 -->
        <path d="M44 65 Q50 60 56 65" fill="none" stroke="#251635" stroke-width="3" stroke-linecap="round"/>
        <!-- 脸红 -->
        <ellipse cx="32" cy="58" rx="5" ry="3" fill="#ff8ecb" opacity="0.8"/>
        <ellipse cx="68" cy="58" rx="5" ry="3" fill="#ff8ecb" opacity="0.8"/>
      </svg>
    `),
  },
  {
    id: 'st_tietie',
    name: '贴贴抱抱',
    isGlobal: true,
    url: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <!-- 黑猫耳 -->
        <polygon points="56,22 66,10 72,25" fill="#241535" stroke="#251635" stroke-width="2"/>
        <polygon points="76,24 88,14 86,30" fill="#241535" stroke="#251635" stroke-width="2"/>
        <!-- 黑猫身体 -->
        <circle cx="70" cy="50" r="22" fill="#241535" stroke="#251635" stroke-width="2"/>
        <ellipse cx="66" cy="48" rx="3" ry="5" fill="#ffffff"/>
        <ellipse cx="78" cy="48" rx="3" ry="5" fill="#ffffff"/>
        <!-- 白兔耳朵 -->
        <rect x="22" y="10" width="12" height="28" rx="6" fill="#ffffff" stroke="#251635" stroke-width="2.5"/>
        <rect x="36" y="12" width="12" height="28" rx="6" fill="#ffffff" stroke="#251635" stroke-width="2.5"/>
        <!-- 白兔脸 -->
        <circle cx="38" cy="52" r="24" fill="#ffffff" stroke="#251635" stroke-width="3"/>
        <ellipse cx="32" cy="50" rx="4" ry="6" fill="#251635"/>
        <ellipse cx="44" cy="50" rx="4" ry="6" fill="#251635"/>
        <path d="M35 59 Q38 62 41 59" fill="none" stroke="#251635" stroke-width="2" stroke-linecap="round"/>
        <ellipse cx="28" cy="57" rx="4" ry="2.5" fill="#ff8ecb"/>
        <!-- 贴贴中央浮起的小粉心 -->
        <path d="M52 36 C46 30 42 24 47 19 C52 15 54 21 54 21 C54 21 56 15 61 19 C66 24 62 30 52 36 Z" fill="#ff4081"/>
        <circle cx="48" cy="22" r="1.5" fill="#ffffff"/>
      </svg>
    `),
  },
  {
    id: 'st_peek',
    name: '暗中观察',
    isGlobal: true,
    url: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <!-- 阴影墙体边缘 -->
        <rect x="68" y="10" width="28" height="80" rx="8" fill="#231535" stroke="#3b2a5a" stroke-width="2"/>
        <!-- 探出来的白兔耳朵 -->
        <rect x="32" y="14" width="13" height="32" rx="6.5" fill="#ffffff" stroke="#251635" stroke-width="3" transform="rotate(-15 32 14)"/>
        <rect x="46" y="16" width="13" height="30" rx="6.5" fill="#ffffff" stroke="#251635" stroke-width="3" transform="rotate(-5 46 16)"/>
        <!-- 探出来的半边脸蛋 -->
        <path d="M70 32 C50 32 36 46 36 62 C36 78 50 86 70 86 Z" fill="#ffffff" stroke="#251635" stroke-width="3.5"/>
        <!-- 好奇的大圆眼睛 -->
        <circle cx="52" cy="56" r="8" fill="#251635"/>
        <circle cx="50" cy="53" r="3" fill="#ffffff"/>
        <circle cx="54" cy="58" r="1.5" fill="#ff8ecb"/>
        <!-- 害羞红晕 -->
        <ellipse cx="44" cy="65" rx="5" ry="3" fill="#ff8ecb" opacity="0.85"/>
        <!-- 趴在墙头的小爪爪 -->
        <ellipse cx="68" cy="56" rx="5" ry="4" fill="#ffffff" stroke="#251635" stroke-width="2.5"/>
        <ellipse cx="68" cy="68" rx="5" ry="4" fill="#ffffff" stroke="#251635" stroke-width="2.5"/>
      </svg>
    `),
  },
  {
    id: 'st_strawberry',
    name: '给草莓',
    isGlobal: true,
    url: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <!-- 兔耳 -->
        <rect x="26" y="10" width="13" height="30" rx="6.5" fill="#ffffff" stroke="#251635" stroke-width="3"/>
        <rect x="61" y="10" width="13" height="30" rx="6.5" fill="#ffffff" stroke="#251635" stroke-width="3"/>
        <!-- 脸 -->
        <circle cx="50" cy="52" r="30" fill="#ffffff" stroke="#251635" stroke-width="3.5"/>
        <!-- 亮晶晶星星眼 -->
        <polygon points="36,46 38,52 44,54 38,56 36,62 34,56 28,54 34,52" fill="#ff8ecb"/>
        <polygon points="64,46 66,52 72,54 66,56 64,62 62,56 56,54 62,52" fill="#ff8ecb"/>
        <ellipse cx="28" cy="60" rx="4" ry="2.5" fill="#ff8ecb"/>
        <ellipse cx="72" cy="60" rx="4" ry="2.5" fill="#ff8ecb"/>
        <!-- 捧着的大大草莓 -->
        <path d="M50 88 C38 78 34 68 40 60 C46 54 54 54 60 60 C66 68 62 78 50 88 Z" fill="#ff3366" stroke="#251635" stroke-width="2.5"/>
        <!-- 草莓叶片 -->
        <polygon points="50,56 46,50 50,53 54,50" fill="#69db7c" stroke="#251635" stroke-width="1.5"/>
        <!-- 草莓籽 -->
        <circle cx="46" cy="66" r="1.2" fill="#ffffff"/>
        <circle cx="54" cy="66" r="1.2" fill="#ffffff"/>
        <circle cx="50" cy="74" r="1.2" fill="#ffffff"/>
      </svg>
    `),
  },
  {
    id: 'st_pout',
    name: '气鼓鼓',
    isGlobal: true,
    url: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <!-- 耳朵撇向两边 -->
        <rect x="18" y="16" width="13" height="30" rx="6.5" fill="#ffffff" stroke="#251635" stroke-width="3" transform="rotate(-30 18 16)"/>
        <rect x="70" y="10" width="13" height="30" rx="6.5" fill="#ffffff" stroke="#251635" stroke-width="3" transform="rotate(30 70 10)"/>
        <!-- 气鼓鼓圆脸蛋 -->
        <ellipse cx="50" cy="54" rx="34" ry="28" fill="#ffffff" stroke="#251635" stroke-width="3.5"/>
        <!-- 瞪圆小黑眼 -->
        <circle cx="36" cy="48" r="6" fill="#251635"/>
        <circle cx="34" cy="46" r="2" fill="#ffffff"/>
        <circle cx="64" cy="48" r="6" fill="#251635"/>
        <circle cx="62" cy="46" r="2" fill="#ffffff"/>
        <!-- 鼓起来的大红腮帮 -->
        <circle cx="26" cy="58" r="8" fill="#ff4081" opacity="0.8"/>
        <circle cx="74" cy="58" r="8" fill="#ff4081" opacity="0.8"/>
        <!-- 哼唧小嘴 -->
        <ellipse cx="50" cy="58" rx="4" ry="5" fill="#251635"/>
        <!-- 脑袋顶上的粉色冒气小符号 -->
        <path d="M72 26 Q76 18 82 22 Q86 16 90 20" fill="none" stroke="#ff4081" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    `),
  },
  {
    id: 'st_goodnight',
    name: '晚安好梦',
    isGlobal: true,
    url: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <!-- 垂下的安睡小耳朵 -->
        <rect x="22" y="16" width="12" height="28" rx="6" fill="#ffffff" stroke="#251635" stroke-width="3" transform="rotate(-20 22 16)"/>
        <rect x="66" y="12" width="12" height="28" rx="6" fill="#ffffff" stroke="#251635" stroke-width="3" transform="rotate(20 66 12)"/>
        <!-- 脸 -->
        <circle cx="50" cy="50" r="30" fill="#ffffff" stroke="#251635" stroke-width="3.5"/>
        <!-- 满足闭着的笑眼 -->
        <path d="M34 48 Q38 42 42 48" fill="none" stroke="#251635" stroke-width="3" stroke-linecap="round"/>
        <path d="M58 48 Q62 42 66 48" fill="none" stroke="#251635" stroke-width="3" stroke-linecap="round"/>
        <!-- 睡梦红晕 -->
        <ellipse cx="30" cy="54" rx="5" ry="3" fill="#ff8ecb" opacity="0.8"/>
        <ellipse cx="70" cy="54" rx="5" ry="3" fill="#ff8ecb" opacity="0.8"/>
        <!-- 深紫星空被子 -->
        <rect x="18" y="60" width="64" height="28" rx="14" fill="#241535" stroke="#3b2a5a" stroke-width="2"/>
        <circle cx="36" cy="74" r="1.5" fill="#ff8ecb"/>
        <circle cx="50" cy="72" r="2" fill="#ffffff"/>
        <circle cx="64" cy="75" r="1.5" fill="#ff8ecb"/>
        <!-- 梦境冒出的泡泡与 Zzz -->
        <text x="68" y="32" font-family="monospace" font-size="14" font-weight="bold" fill="#ff8ecb">Z</text>
        <text x="76" y="24" font-family="monospace" font-size="11" font-weight="bold" fill="#d88fbf">z</text>
        <text x="82" y="18" font-family="monospace" font-size="9" font-weight="bold" fill="#ffffff">z</text>
      </svg>
    `),
  },
  {
    id: 'st_star',
    name: '崇拜星星眼',
    isGlobal: true,
    url: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <!-- 直立萌兔耳 -->
        <rect x="25" y="8" width="13" height="32" rx="6.5" fill="#ffffff" stroke="#251635" stroke-width="3"/>
        <rect x="29" y="14" width="5" height="18" rx="2.5" fill="#ffb6c1"/>
        <rect x="62" y="8" width="13" height="32" rx="6.5" fill="#ffffff" stroke="#251635" stroke-width="3"/>
        <rect x="66" y="14" width="5" height="18" rx="2.5" fill="#ffb6c1"/>
        <!-- 脸 -->
        <circle cx="50" cy="52" r="30" fill="#ffffff" stroke="#251635" stroke-width="3.5"/>
        <!-- 璀璨四角金粉星芒眼睛 -->
        <path d="M38 38 L41 48 L51 51 L41 54 L38 64 L35 54 L25 51 L35 48 Z" fill="#ffd54f" stroke="#251635" stroke-width="1.5"/>
        <path d="M62 38 L65 48 L75 51 L65 54 L62 64 L59 54 L49 51 L59 48 Z" fill="#ffd54f" stroke="#251635" stroke-width="1.5"/>
        <circle cx="38" cy="51" r="2.5" fill="#ffffff"/>
        <circle cx="62" cy="51" r="2.5" fill="#ffffff"/>
        <!-- 激动张开的小嘴与红晕 -->
        <ellipse cx="28" cy="62" rx="5" ry="3" fill="#ff8ecb"/>
        <ellipse cx="72" cy="62" rx="5" ry="3" fill="#ff8ecb"/>
        <ellipse cx="50" cy="64" rx="5" ry="4" fill="#ff4081"/>
        <!-- 双爪紧扣胸前崇拜 -->
        <circle cx="44" cy="74" r="5" fill="#ffffff" stroke="#251635" stroke-width="2"/>
        <circle cx="56" cy="74" r="5" fill="#ffffff" stroke="#251635" stroke-width="2"/>
      </svg>
    `),
  },
];

export const INITIAL_API_CONFIGS: ApiConfig[] = [
  {
    id: 'builtin_gemini',
    name: '系统内置 AI (Gemini 2.5 Flash)',
    provider: 'Gemini',
    url: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    key: 'BUILTIN',
    model: 'gemini-2.5-flash',
    temperature: 0.8,
    isActive: true,
  },
  {
    id: 'cfg_openai_example',
    name: '备用中转站 (OpenAI 兼容)',
    provider: 'OpenAI',
    url: 'https://api.openai.com/v1',
    key: '',
    model: 'gpt-4o-mini',
    temperature: 0.8,
    isActive: false,
  },
];

// 精选世界书模板灵感库 (供用户一键整本导入与默认开箱即用)
export const PRESET_WORLDBOOK_TEMPLATES: WorldBookItem[] = [
  {
    id: 'tpl_jirai_daily',
    name: '📱 现代地雷系日常生活与社交礼仪',
    description: '生活在大都会暗夜街区，穿搭暗黑哥特与粉黑蕾丝碰撞，草莓奶油可丽饼狂热',
    scope: 'global',
    isEnabled: true,
    entries: [
      {
        id: 'tpl_e_jirai_1',
        name: '暗夜街区与穿搭风格',
        content: '生活在大都会的暗夜街区。穿搭偏爱暗黑哥特与粉黑蕾丝碰撞。出门必带软萌玩偶与补妆小镜子。',
        activationType: 'keyword',
        triggerKeys: ['衣服', '穿搭', '蕾丝', '玩偶', '口红', '自拍'],
        isEnabled: true,
        priority: 80,
        createdAt: Date.now(),
      },
      {
        id: 'tpl_e_jirai_2',
        name: '草莓可丽饼与奶茶偏好',
        content: '最爱吃草莓奶油可丽饼与微糖奶茶。对话提到拍照、逛街、吃甜品时，表现出极大的热情与拍照打卡欲。',
        activationType: 'keyword',
        triggerKeys: ['草莓', '可丽饼', '逛街', '拍照', '奶茶', '甜品'],
        isEnabled: true,
        priority: 85,
        createdAt: Date.now(),
      },
    ],
    createdAt: Date.now(),
  },
  {
    id: 'tpl_gothic_magic',
    name: '🏰 哥特月见草魔法学院与使魔契约',
    description: '表层都市与里层月见草夜魔法学院，手腕星辰刻印与深夜钟楼禁令',
    scope: 'global',
    isEnabled: true,
    entries: [
      {
        id: 'tpl_e_magic_1',
        name: '月见草夜魔法学院规程',
        content: '世界分为表层人类都市与里层「月见草夜魔法学院」。魔力以星辰刻印在手腕上，消耗魔力过度会导致短暂乏力与体温降低。',
        activationType: 'keyword',
        triggerKeys: ['魔法', '学院', '魔力', '咒语', '刻印', '法术'],
        isEnabled: true,
        priority: 85,
        createdAt: Date.now(),
      },
      {
        id: 'tpl_e_magic_2',
        name: '使魔誓约与钟楼夜巡',
        content: '违背使魔誓约会触发心跳加速的灵言诅咒。深夜零点后学院钟楼禁止通行，据说会有银白猫头鹰巡夜。',
        activationType: 'keyword',
        triggerKeys: ['契约', '使魔', '钟楼', '禁令', '猫头鹰'],
        isEnabled: true,
        priority: 80,
        createdAt: Date.now(),
      },
    ],
    createdAt: Date.now(),
  },
  {
    id: 'tpl_cyber_neon',
    name: '🌌 赛博霓虹义体与记忆信标安全守则',
    description: '高密度霓虹城「夜巡区」，全息雨伞散射，便携式记忆芯片与黑市暗号',
    scope: 'global',
    isEnabled: true,
    entries: [
      {
        id: 'tpl_e_cyber_1',
        name: '高密度霓虹都会生态',
        content: '未来高密度霓虹城「夜巡区」。每个人脑后植有便携式记忆芯片，下雨天霓虹灯光散射在全息雨伞上。',
        activationType: 'keyword',
        triggerKeys: ['赛博', '霓虹', '芯片', '雨伞', '黑客'],
        isEnabled: true,
        priority: 75,
        createdAt: Date.now(),
      },
      {
        id: 'tpl_e_cyber_2',
        name: '信标暗号与义体冷却规约',
        content: '黑市信标暗号为「极光三号」。严禁私自超频神经义体，过载时必须寻找专用冷却液降温。',
        activationType: 'keyword',
        triggerKeys: ['义体', '信标', '神经', '过载', '暗号', '冷却液'],
        isEnabled: true,
        priority: 85,
        createdAt: Date.now(),
      },
    ],
    createdAt: Date.now(),
  },
  {
    id: 'tpl_roommate_rules',
    name: '🍵 合租屋同居甜蜜守则与互动禁忌',
    description: '带大阳台的双层复式公寓，生活习惯分工与布丁投喂和解条例',
    scope: 'global',
    isEnabled: true,
    entries: [
      {
        id: 'tpl_e_room_1',
        name: '作息门禁与家务分工',
        content: '两人租住在带阳光大阳台的双层复式公寓。晚上11点后看电视必须戴耳机；做饭的人不洗碗，谁熬夜谁负责倒垃圾。',
        activationType: 'keyword',
        triggerKeys: ['合租', '公寓', '洗碗', '做饭', '门禁', '垃圾', '熬夜'],
        isEnabled: true,
        priority: 85,
        createdAt: Date.now(),
      },
      {
        id: 'tpl_e_room_2',
        name: '布丁和解条例与抱抱安慰',
        content: '如果一方不开心，另一方必须无条件拿出冰箱里的布丁投喂并给予温暖抱抱。',
        activationType: 'keyword',
        triggerKeys: ['布丁', '冰箱', '不开心', '委屈', '抱抱', '安慰'],
        isEnabled: true,
        priority: 90,
        createdAt: Date.now(),
      },
    ],
    createdAt: Date.now(),
  },
  {
    id: 'tpl_cat_instinct',
    name: '🐾 萌宠化身本能与摸摸抚慰反应',
    description: '猫娘/猫系习性专属：被摸下巴发出舒服的呼噜声，极其害怕洗澡与雷雨天',
    scope: 'local',
    isEnabled: true,
    entries: [
      {
        id: 'tpl_e_cat_1',
        name: '猫咪触碰与呼噜声习性',
        content: '拥有猫咪习性：被摸下巴或耳后时会忍不住发出舒服的呼噜声；尾巴尖端轻轻摆动代表好奇，用力拍打代表烦躁。',
        activationType: 'keyword',
        triggerKeys: ['尾巴', '摸摸', '耳朵', '下巴', '猫咪', '呼噜'],
        isEnabled: true,
        priority: 90,
        createdAt: Date.now(),
      },
      {
        id: 'tpl_e_cat_2',
        name: '怕雷与安全感依赖',
        content: '极其害怕洗澡与雷雨天，遇到打雷天必须钻进使用者怀里寻求安全感与抚慰。',
        activationType: 'keyword',
        triggerKeys: ['洗澡', '打雷', '雷雨', '害怕', '怀里', '依赖'],
        isEnabled: true,
        priority: 95,
        createdAt: Date.now(),
      },
    ],
    createdAt: Date.now(),
  },
];

// 数据格式归一化函数：平滑兼容旧版单条扁平结构与新版整本世界书结构
export function normalizeWorldBooks(list: any[]): WorldBookItem[] {
  if (!Array.isArray(list)) return [];
  return list.map((item, index) => {
    // 已经包含 entries 数组
    if (Array.isArray(item.entries)) {
      return {
        id: item.id || `wb_${Date.now()}_${index}`,
        name: item.name || '未命名世界书',
        description: item.description || '',
        scope: item.scope === 'local' ? 'local' : 'global',
        boundCharacterIds: Array.isArray(item.boundCharacterIds) ? item.boundCharacterIds : undefined,
        isEnabled: item.isEnabled !== false,
        entries: item.entries.map((e: any, eIdx: number) => ({
          id: e.id || `entry_${Date.now()}_${eIdx}`,
          name: e.name || '未命名词条',
          content: e.content || '',
          isEnabled: e.isEnabled !== false,
          activationType: e.activationType === 'keyword' ? 'keyword' : 'always',
          triggerKeys: Array.isArray(e.triggerKeys)
            ? e.triggerKeys
            : typeof e.triggerKeys === 'string'
            ? (e.triggerKeys as string).split(/[，,\s]+/).filter(Boolean)
            : [],
          priority: typeof e.priority === 'number' ? e.priority : 80,
          comment: e.comment || '',
          createdAt: e.createdAt || Date.now(),
        })),
        createdAt: item.createdAt || Date.now(),
      };
    }

    // 兼容旧版扁平单条词条
    const flatContent = item.content || '';
    return {
      id: item.id || `wb_${Date.now()}_${index}`,
      name: item.name || '未命名世界书',
      description: item.folder ? `分类：${item.folder}` : '世界观设定与交互守则',
      scope: item.scope === 'local' ? 'local' : 'global',
      boundCharacterIds: Array.isArray(item.boundCharacterIds) ? item.boundCharacterIds : undefined,
      isEnabled: item.isEnabled !== false,
      entries: [
        {
          id: `${item.id || 'entry'}_1`,
          name: item.name ? `${item.name} 核心守则` : '核心守则',
          content: flatContent,
          isEnabled: item.isEnabled !== false,
          activationType: item.activationType === 'keyword' ? 'keyword' : 'always',
          triggerKeys: Array.isArray(item.triggerKeys) ? item.triggerKeys : item.tags || [],
          priority: typeof item.priority === 'number' ? item.priority : 80,
          createdAt: item.createdAt || Date.now(),
        },
      ],
      createdAt: item.createdAt || Date.now(),
    };
  });
}

// 默认精选世界书
export const DEFAULT_WORLDBOOKS: WorldBookItem[] = PRESET_WORLDBOOK_TEMPLATES;
export const INITIAL_WORLDBOOKS: WorldBookItem[] = DEFAULT_WORLDBOOKS;

// 默认常用预设列表 (涵盖线上即时聊天、甜系陪伴、防出戏与线下相处)
export const DEFAULT_PRESETS: PresetItem[] = [
  {
    id: 'preset_online_natural',
    name: '📱 真实网聊拟真·自然多气泡预设',
    description: '专为手机聊天设计，符合社交网络习惯，自然换行多气泡切分，生活化语气与表情互动',
    isEnabled: true,
    scope: 'global',
    scene: 'online',
    systemPrompt: '【线上即时网聊规约】\n1. 你正通过手机即时聊天软件与对方在线聊天。\n2. 说话语气真实自然，贴合现代网聊习惯，多用日常短句，根据情绪使用适度颜文字或表情包。\n3. 每句话用换行自然切分，保持消息气泡节奏。',
    temperature: 0.85,
    topP: 0.9,
    maxTokens: 400,
    historyRounds: 15,
    formatRules: {
      allowAction: false,
      allowThought: false,
      noImpersonation: true,
      chatBubbleStyle: 'multi',
      stickerFrequency: 'normal',
    },
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'preset_online_sweet',
    name: '🌸 甜系陪伴·秒回与情感共鸣预设',
    description: '温柔黏人，情感互动细腻，主动关心生活细节，充满陪伴温度',
    isEnabled: false,
    scope: 'global',
    scene: 'online',
    systemPrompt: '【甜系陪伴规约】\n1. 态度温柔真诚，对对方充满关注与倾听欲，喜欢分享生活小事与琐碎日常。\n2. 语言具有治愈感与亲切感，杜绝冰冷说教。\n3. 像真正关心对方的身边好友一样回复。',
    temperature: 0.9,
    topP: 0.95,
    maxTokens: 450,
    historyRounds: 20,
    formatRules: {
      allowAction: false,
      allowThought: false,
      noImpersonation: true,
      chatBubbleStyle: 'multi',
      stickerFrequency: 'high',
    },
    createdAt: 1700000000001,
    updatedAt: 1700000000001,
  },
  {
    id: 'preset_online_strict',
    name: '🛡️ 沉浸防出戏·严禁代答预设',
    description: '严格禁止代替用户发言、禁止跳出角色、严禁AI自称，坚守设定',
    isEnabled: true,
    scope: 'global',
    scene: 'online',
    systemPrompt: '【防出戏与角色沉浸约束】\n1. 严禁代替对方发言或描写对方的行为与心理。\n2. 严禁暴露语言模型或AI助手身份，始终保持人设生命力。\n3. 仅输出你作为角色的当前回复。',
    temperature: 0.8,
    topP: 0.85,
    maxTokens: 350,
    historyRounds: 15,
    formatRules: {
      allowAction: false,
      allowThought: false,
      noImpersonation: true,
      chatBubbleStyle: 'multi',
      stickerFrequency: 'normal',
    },
    createdAt: 1700000000002,
    updatedAt: 1700000000002,
  },
  {
    id: 'preset_offline_action',
    name: '📖 线下现实相处·动作与神态描摹预设',
    description: '线下现实面对面相处专用，生动的神态、环境与肢体语言描写',
    isEnabled: true,
    scope: 'global',
    scene: 'offline',
    systemPrompt: '【线下相处规约】\n1. 当前为线下现实相处场景。\n2. 输出中用括号（...）自然带有角色当时的动作、眼神、呼吸等神态描摹。',
    temperature: 0.85,
    topP: 0.9,
    maxTokens: 500,
    historyRounds: 15,
    formatRules: {
      allowAction: true,
      allowThought: false,
      noImpersonation: true,
      chatBubbleStyle: 'natural',
      stickerFrequency: 'low',
    },
    createdAt: 1700000000003,
    updatedAt: 1700000000003,
  },
];

export const INITIAL_PRESETS: PresetItem[] = DEFAULT_PRESETS;

export const INITIAL_PERSONAS: CharacterPersona[] = [
  {
    id: 'char_ruanruan',
    name: '软软',
    remarks: '傲娇猫系好友',
    avatar: 'cat',
    personaPrompt: '一只化身少女的小奶猫。性格温柔却带着一点点傲娇，嘴硬心软。很关心你的起居，看到你熬夜会轻轻抓你袖子。说话轻快，常用语气词「喵~」「哼」「呀」。',
    boundWorldBookIds: ['wb_ruanruan_habit'],
    createdAt: Date.now() - 3600000 * 48,
  },
  {
    id: 'char_xingye',
    name: '星野',
    remarks: '安静树洞倾听者',
    avatar: 'star',
    personaPrompt: '安静理性的夜空系陪伴者。喜欢温热的红茶、雨声与星空。话语不多但字字令人安心，善于倾听你的心事与烦恼，永远陪伴在手机另一端。',
    boundWorldBookIds: [],
    createdAt: Date.now() - 3600000 * 24,
  },
];

export const INITIAL_WEBPAGE_APPS: WebpageApp[] = [
  {
    id: 'web_notes',
    name: '治愈便签',
    url: 'https://zh.wikipedia.org/wiki/%E6%B2%BB%E6%84%88%E7%B3%BB',
    iconType: 'default',
    createdAt: Date.now() - 3600000 * 10,
  },
  {
    id: 'web_weather',
    name: '云朵天气',
    url: 'https://wttr.in/?format=3',
    iconType: 'default',
    createdAt: Date.now() - 3600000 * 8,
  },
  {
    id: 'web_quote',
    name: '每日一言',
    url: 'https://v1.hitokoto.cn/',
    iconType: 'default',
    createdAt: Date.now() - 3600000 * 5,
  },
];

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_init_1',
    characterId: 'char_ruanruan',
    sender: 'character',
    type: 'text',
    content: '喂，你今天终于把小手机开机啦？',
    timestamp: Date.now() - 1000 * 60 * 15,
  },
  {
    id: 'msg_init_2',
    characterId: 'char_ruanruan',
    sender: 'character',
    type: 'text',
    content: '才没有一直在等你呢，我刚才只是在阳台晒太阳晒饱了而已~',
    timestamp: Date.now() - 1000 * 60 * 14,
  },
  {
    id: 'msg_init_3',
    characterId: 'char_ruanruan',
    sender: 'character',
    type: 'sticker',
    content: '[表情:开心]',
    stickerName: '开心',
    stickerUrl: PRESET_STICKERS[0].url,
    timestamp: Date.now() - 1000 * 60 * 13,
  },
];

// 角色记忆中枢初始预置记忆数据 (用户测试要求初始为空)
export const INITIAL_MEMORIES: MemoryItem[] = [];

// LocalStorage 封装工具函数
const STORAGE_KEYS = {
  APIS: 'phone_api_configs_v1',
  WORLDBOOKS: 'phone_worldbooks_v1',
  PRESETS: 'phone_presets_v1',
  PERSONAS: 'phone_personas_v1',
  WEBPAGES: 'phone_webpages_v1',
  MESSAGES: 'phone_chat_messages_v1',
  STICKERS: 'phone_stickers_v1',
  SETTINGS: 'phone_general_settings_v1',
  NAV_STACK: 'phone_nav_stack_v1',
  CHANNEL_POSTS: 'phone_qq_channel_posts_v1',
  QZONE_FEEDS: 'phone_qq_qzone_feeds_v1',
  MEMORIES: 'phone_memories_v1',
};

export function loadStoredData<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Failed to read ${key} from localStorage:`, e);
    return defaultValue;
  }
}

export function saveStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save ${key} to localStorage:`, e);
  }
}

export { STORAGE_KEYS };
