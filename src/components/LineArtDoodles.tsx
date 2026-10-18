import React from 'react';

// 简笔治愈线稿：猫咪
export const LineCat: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* 脸部轮廓与耳朵 */}
    <path d="M14 18 L10 10 L19 13 C22 12 26 12 29 13 L38 10 L34 18 C37 21 38 25 38 29 C38 37 32 42 24 42 C16 42 10 37 10 29 C10 25 11 21 14 18 Z" />
    {/* 眯起的微笑眼睛 */}
    <path d="M16 26 Q19 23 22 26" />
    <path d="M26 26 Q29 23 32 26" />
    {/* 小鼻子和胡须 */}
    <path d="M23 29 L25 29 L24 30 Z" />
    <path d="M15 30 L8 31" />
    <path d="M15 33 L9 36" />
    <path d="M33 30 L40 31" />
    <path d="M33 33 L39 36" />
  </svg>
);

// 简笔治愈线稿：小鱼
export const LineFish: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* 鱼身与尾巴 */}
    <path d="M38 24 C34 16 22 14 12 20 C8 22 5 24 5 24 C5 24 8 26 12 28 C22 34 34 32 38 24 Z" />
    <path d="M38 24 L45 16 L42 24 L45 32 Z" />
    {/* 鱼眼与鱼鳃 */}
    <circle cx="12" cy="23" r="1.5" fill="currentColor" />
    <path d="M18 19 Q21 24 18 29" />
    {/* 小气泡 */}
    <circle cx="4" cy="18" r="1.5" />
    <circle cx="2" cy="13" r="1" />
  </svg>
);

// 简笔治愈线稿：小兔子
export const LineBunny: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* 长耳朵 */}
    <path d="M17 22 C15 15 14 6 18 6 C21 6 21 15 22 20" />
    <path d="M26 20 C27 15 27 6 30 6 C34 6 33 15 31 22" />
    {/* 圆圆小脸 */}
    <path d="M15 26 C13 32 16 40 24 40 C32 40 35 32 33 26 C31 22 27 21 24 21 C21 21 17 22 15 26 Z" />
    {/* 眼睛与小嘴 */}
    <circle cx="19" cy="28" r="1" fill="currentColor" />
    <circle cx="29" cy="28" r="1" fill="currentColor" />
    <path d="M24 31 L23 33 L24 34 L25 33 Z" />
  </svg>
);

// 简笔治愈线稿：小鸟
export const LineBird: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M8 26 C10 18 20 16 28 20 C34 23 38 21 42 16 C39 26 31 34 22 34 C14 34 8 30 8 26 Z" />
    <path d="M42 16 L38 21" />
    <circle cx="34" cy="21" r="1.5" fill="currentColor" />
    <path d="M18 26 Q24 28 26 23" />
  </svg>
);

// 简笔治愈线稿：热气腾腾小水杯/咖啡
export const LineCup: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M10 18 L13 38 C13 40 15 42 18 42 L30 42 C33 42 35 40 35 38 L38 18 Z" />
    <path d="M37 22 C41 22 43 25 43 28 C43 32 40 34 36 34" />
    {/* 水汽 */}
    <path d="M18 13 Q20 10 18 7" />
    <path d="M24 14 Q26 10 24 6" />
    <path d="M30 13 Q32 10 30 7" />
  </svg>
);

// 简笔星星与云朵装饰
export const LineCloudStar: React.FC<{ className?: string }> = ({ className = 'w-12 h-8' }) => (
  <svg
    viewBox="0 0 64 36"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* 云朵 */}
    <path d="M12 26 C8 26 6 23 6 20 C6 17 9 14 13 14 C14 10 18 8 23 8 C28 8 32 11 34 15 C36 14 39 14 41 16 C44 18 45 22 43 26 Z" />
    {/* 四角简笔星星 */}
    <path d="M52 10 L54 6 L56 10 L60 12 L56 14 L54 18 L52 14 L48 12 Z" />
    <circle cx="58" cy="24" r="1.2" fill="currentColor" />
  </svg>
);
