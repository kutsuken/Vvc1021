import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, ExternalLink, Globe } from 'lucide-react';
import { WebpageApp } from '../types/phone';

interface MiniBrowserModalProps {
  webApp: WebpageApp;
  onClose: () => void;
}

export const MiniBrowserModal: React.FC<MiniBrowserModalProps> = ({ webApp, onClose }) => {
  const [iframeKey, setIframeKey] = useState(0);

  return (
    <div className="absolute inset-0 bg-[#120b18] z-40 flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* 浏览器顶部地址栏与工具条 */}
      <div className="h-11 px-3 bg-[#1e1328] border-b border-[#3b2a5a] flex items-center justify-between gap-2 select-none">
        <button onClick={onClose} className="p-1 text-[#d88fbf] hover:text-white jelly-btn">
          <ArrowLeft className="w-4 h-4 stroke-[2]" />
        </button>

        {/* 仿移动端迷你地址栏 */}
        <div className="flex-1 max-w-[240px] px-2.5 py-1 bg-[#160d20] rounded-lg border border-[#4b3670] flex items-center gap-1.5 overflow-hidden font-mono">
          <Globe className="w-3 h-3 text-[#ff8ecb] shrink-0" />
          <span className="text-[11px] text-[#f7d6e8] truncate">{webApp.url}</span>
        </div>

        <div className="flex items-center gap-1 font-mono">
          <button
            onClick={() => setIframeKey((k) => k + 1)}
            className="p-1 text-[#d88fbf] hover:text-[#ff8ecb] jelly-btn"
            title="刷新"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <a
            href={webApp.url}
            target="_blank"
            rel="noreferrer"
            className="p-1 text-[#d88fbf] hover:text-[#ff8ecb] jelly-btn"
            title="在新标签页中打开"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 嵌入网页容器 */}
      <div className="flex-1 relative bg-white">
        <iframe
          key={iframeKey}
          src={webApp.url}
          title={webApp.name}
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />

        {/* 底部保护与跳转辅助条 */}
        <div className="absolute bottom-2 left-4 right-4 p-2 rounded-xl bg-[#1e1328]/95 backdrop-blur-md border border-[#3b2a5a] shadow-lg flex items-center justify-between text-[11px] font-mono text-[#b7a2d9]">
          <span>如页面限制内嵌，可点击右侧</span>
          <a
            href={webApp.url}
            target="_blank"
            rel="noreferrer"
            className="text-[#ff8ecb] font-bold hover:underline flex items-center gap-0.5"
          >
            <span>直接访问</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
