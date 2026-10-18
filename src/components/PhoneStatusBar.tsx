import React, { useEffect, useState } from 'react';
import { Wifi } from 'lucide-react';

interface PhoneStatusBarProps {
  batteryLevel?: number;
  theme?: string;
}

export const PhoneStatusBar: React.FC<PhoneStatusBarProps> = ({ batteryLevel = 98, theme = 'sky' }) => {
  const [timeStr, setTimeStr] = useState('15:43');
  const isAqua = theme === 'aqua_pixel';

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${h}:${m}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={`w-full h-8 px-5 pt-1.5 flex items-center justify-between text-[11px] font-mono tracking-wider select-none z-30 shrink-0 transition-colors ${
        isAqua ? 'text-[#0284c7]' : 'text-[#f7d6e8]'
      }`}
    >
      {/* 左侧：时间 + 像素小星芒 */}
      <div
        className={`flex items-center gap-1.5 font-bold ${
          isAqua ? 'drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)]' : 'drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]'
        }`}
      >
        <span className={isAqua ? 'text-[#38bdf8] text-[10px]' : 'text-[#ff8ecb] text-[10px]'}>✦</span>
        <span>{timeStr}</span>
      </div>

      {/* 右侧：像素信号、WiFi与点阵电池 */}
      <div
        className={`flex items-center gap-2 ${
          isAqua ? 'drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)]' : 'drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]'
        }`}
      >
        {/* 蜂窝信号 4 格 */}
        <div className="flex items-end gap-[2px] h-3">
          <span className={`w-[3px] h-[3px] rounded-none ${isAqua ? 'bg-[#7dd3fc]' : 'bg-[#d88fbf]'}`}></span>
          <span className={`w-[3px] h-[5px] rounded-none ${isAqua ? 'bg-[#7dd3fc]' : 'bg-[#d88fbf]'}`}></span>
          <span className={`w-[3px] h-[8px] rounded-none ${isAqua ? 'bg-[#38bdf8]' : 'bg-[#d88fbf]'}`}></span>
          <span className={`w-[3px] h-[11px] rounded-none ${isAqua ? 'bg-[#0284c7]' : 'bg-[#ff8ecb]'}`}></span>
        </div>

        {/* WiFi 图标 */}
        <Wifi className={`w-3.5 h-3.5 stroke-[2] ${isAqua ? 'text-[#0284c7]' : 'text-[#d88fbf]'}`} />

        {/* 像素电量 */}
        <div className="flex items-center gap-1">
          <span className={`text-[10px] font-mono ${isAqua ? 'text-[#0284c7]' : 'text-[#f7d6e8]'}`}>
            {batteryLevel}%
          </span>
          <div
            className={`w-4 h-2.5 border p-[1px] flex items-center ${
              isAqua ? 'border-[#38bdf8] bg-white/80' : 'border-[#d88fbf] bg-[#1a1120]'
            }`}
          >
            <div
              className={`h-full ${
                isAqua
                  ? 'bg-gradient-to-r from-[#7dd3fc] to-[#38bdf8]'
                  : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb]'
              }`}
              style={{ width: `${Math.min(100, Math.max(10, batteryLevel))}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
