import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Shield,
  MessageSquare,
  Sparkles,
  Volume2,
  Smile,
  BookOpen,
  Layers,
  Camera,
  Image as ImageIcon,
  UserCheck,
  Calendar,
  PhoneCall,
  Clock,
  PhoneOff,
  UserCheck2,
  Moon,
  Sun,
  Plus,
  Trash2,
  Check,
  ChevronRight,
  Eye,
} from 'lucide-react';
import {
  CharacterPersona,
  CharacterChatSettings,
  WorldBookItem,
  PresetItem,
  StickerItem,
  ApiConfig,
  UserProfile,
} from '../types/phone';
import { DEFAULT_WORLDBOOKS, DEFAULT_PRESETS } from '../utils/storage';
import { renderUniversalAvatar } from './AvatarPickerModal';

interface ChatSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  char: CharacterPersona;
  settings: CharacterChatSettings;
  onSaveSettings: (newSettings: CharacterChatSettings) => void;
  worldbooks: WorldBookItem[];
  onSaveWorldbooks?: (worldbooks: WorldBookItem[]) => void;
  presets: PresetItem[];
  onSavePresets?: (presets: PresetItem[]) => void;
  stickers: StickerItem[];
  onSaveStickers?: (stickers: StickerItem[]) => void;
  activeApi: ApiConfig | null;
  userProfile?: UserProfile;
  onWakeUpCharacter?: () => void;
}

export const ChatSettingsModal: React.FC<ChatSettingsModalProps> = ({
  isOpen,
  onClose,
  char,
  settings,
  onSaveSettings,
  worldbooks = [],
  onSaveWorldbooks,
  presets = [],
  onSavePresets,
  stickers,
  onSaveStickers,
  activeApi,
  userProfile,
  onWakeUpCharacter,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'permission'>('chat');
  const [localSettings, setLocalSettings] = useState<CharacterChatSettings>(settings);
  const [isStickerManagerOpen, setIsStickerManagerOpen] = useState(false);

  // 当外部 settings 变动或弹窗重新打开时，同步更新本地状态
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  // 表情包管理输入
  const [newStickerName, setNewStickerName] = useState('');
  const [newStickerUrl, setNewStickerUrl] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

  const handleUpdate = <K extends keyof CharacterChatSettings>(
    key: K,
    value: CharacterChatSettings[K]
  ) => {
    const next = { ...localSettings, [key]: value };
    setLocalSettings(next);
    onSaveSettings(next);
  };

  // 添加自定义表情包
  const handleAddSticker = () => {
    if (!newStickerName.trim() || !newStickerUrl.trim()) {
      showToast('请输入表情包名称和图片地址');
      return;
    }
    const newSticker: StickerItem = {
      id: 'st_custom_' + Date.now(),
      name: newStickerName.trim(),
      url: newStickerUrl.trim(),
      isGlobal: true,
    };
    if (onSaveStickers) {
      onSaveStickers([...stickers, newSticker]);
    }
    setNewStickerName('');
    setNewStickerUrl('');
    showToast('已添加表情包');
  };

  // 删除表情包
  const handleDeleteSticker = (id: string) => {
    if (onSaveStickers) {
      onSaveStickers(stickers.filter((s) => s.id !== id));
      showToast('已删除该表情包');
    }
  };

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 animate-in fade-in select-none">
      <div className="w-full max-w-lg bg-gradient-to-b from-[#221333] via-[#1a0e28] to-[#12081d] border border-[#ff8ecb]/50 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[92vh] space-y-4 animate-in zoom-in-95 text-[#f7d6e8]">
        {/* 顶部标题与角色标识 */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#2c1442] border border-[#ff8ecb]/60 overflow-hidden flex items-center justify-center shadow-inner">
              {renderUniversalAvatar(char.avatar, 'w-7 h-7')}
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{char.name}</span>
                <span className="text-[10px] text-[#ff8ecb] px-1.5 py-0.2 rounded-full bg-[#ff8ecb]/15 border border-[#ff8ecb]/30">
                  聊天更多设置
                </span>
              </div>
              <div className="text-[10px] text-[#b7a2d9]">专属对话模型与拟真行为管理</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#b7a2d9] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 模块主切换栏：聊天设置 / 角色权限 */}
        <div className="flex rounded-2xl bg-[#140a1d] p-1 border border-white/10 shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a0f24] shadow-md'
                : 'text-[#b7a2d9] hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>聊天设置</span>
          </button>
          <button
            onClick={() => setActiveTab('permission')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'permission'
                ? 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a0f24] shadow-md'
                : 'text-[#b7a2d9] hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>角色权限</span>
          </button>
        </div>

        {/* 提示 Toast */}
        {toastMsg && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1 rounded-full bg-black/90 border border-[#ff8ecb] text-white text-xs font-mono shadow-2xl flex items-center gap-1.5 pointer-events-none">
            <Sparkles className="w-3 h-3 text-[#ff8ecb]" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* 滚动配置区 */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {/* ========================================================= */}
          {/* 聊天设置 */}
          {/* ========================================================= */}
          {activeTab === 'chat' && (
            <div className="space-y-4">
              {/* 消息格式与对话模型 */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="text-xs font-bold text-[#ff8ecb] flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>消息格式与对话模型</span>
                </div>

                {/* 每轮输出气泡数 */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">每轮输出气泡数</div>
                      <div className="text-[10px] text-[#b7a2d9]">
                        {localSettings.customBubbleCountEnabled
                          ? `已开启自填：设定为 ${localSettings.customBubbleCount} 个气泡`
                          : '未开启：由 AI 智能自主发挥切分'}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleUpdate(
                          'customBubbleCountEnabled',
                          !localSettings.customBubbleCountEnabled
                        )
                      }
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                        localSettings.customBubbleCountEnabled ? 'bg-[#ff8ecb]' : 'bg-white/20'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          localSettings.customBubbleCountEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  {localSettings.customBubbleCountEnabled && (
                    <div className="pt-1.5 space-y-2 bg-black/30 p-2.5 rounded-xl border border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-[#d8b4e2]">用户自定义气泡数：</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={localSettings.customBubbleCount}
                            onChange={(e) => {
                              const v = parseInt(e.target.value) || 1;
                              handleUpdate('customBubbleCount', Math.max(1, Math.min(20, v)));
                            }}
                            className="w-16 bg-black/60 border border-[#ff8ecb]/50 focus:border-[#ff8ecb] rounded-lg px-2 py-1 text-xs text-white text-center font-mono font-bold focus:outline-none"
                          />
                          <span className="text-[11px] text-[#b7a2d9]">个</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-[#b7a2d9]/70 shrink-0">快捷选择：</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {[1, 2, 3, 4, 5, 6].map((num) => (
                            <button
                              key={num}
                              onClick={() => handleUpdate('customBubbleCount', num)}
                              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                                localSettings.customBubbleCount === num
                                  ? 'bg-[#ff8ecb] text-[#1a0f24]'
                                  : 'bg-white/10 text-[#d8b4e2] hover:bg-white/20'
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 对话模型 */}
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">对话模型</div>
                      <div className="text-[10px] text-[#b7a2d9]">
                        {localSettings.customModelEnabled
                          ? `自选指定模型：${localSettings.customModel || '未填(默认)'}`
                          : `未开启：跟随全局激活模型 (${activeApi?.model || '默认'})`}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleUpdate('customModelEnabled', !localSettings.customModelEnabled)
                      }
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                        localSettings.customModelEnabled ? 'bg-[#ff8ecb]' : 'bg-white/20'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          localSettings.customModelEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  {localSettings.customModelEnabled && (
                    <div className="pt-1.5 space-y-2 bg-black/30 p-2.5 rounded-xl border border-white/5">
                      <input
                        type="text"
                        value={localSettings.customModel}
                        onChange={(e) => handleUpdate('customModel', e.target.value)}
                        placeholder="输入指定模型，如: gemini-2.5-flash / gpt-4o / deepseek-chat"
                        className="w-full bg-black/40 border border-[#4b3670] focus:border-[#ff8ecb] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none font-mono"
                      />
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <span className="text-[10px] text-[#b7a2d9]/70 shrink-0">推荐模型：</span>
                        {[
                          'gemini-2.5-flash',
                          'gpt-4o',
                          'deepseek-chat',
                          'claude-3-5-sonnet',
                          'gemini-2.5-pro',
                        ].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => handleUpdate('customModel', m)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-colors ${
                              localSettings.customModel === m
                                ? 'bg-[#ff8ecb] text-[#1a0f24] font-bold'
                                : 'bg-white/10 text-[#d8b4e2] hover:bg-white/20'
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 短气泡回复 */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div>
                    <div className="font-bold text-white">短气泡回复</div>
                    <div className="text-[10px] text-[#b7a2d9]">
                      模拟年轻人日常手打即时通讯，以15字短句为主，轻快连发
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleUpdate('shortBubbleReply', !localSettings.shortBubbleReply)
                    }
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                      localSettings.shortBubbleReply ? 'bg-[#ff8ecb]' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        localSettings.shortBubbleReply ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 更改发语音 */}
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">发语音设置</div>
                      <div className="text-[10px] text-[#b7a2d9]">
                        支持角色在适当时刻发送语音条或语音卡片
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[10px] text-[#b7a2d9] block mb-1">发送频率：</label>
                      <select
                        value={localSettings.voiceReplyMode}
                        onChange={(e) => handleUpdate('voiceReplyMode', e.target.value as any)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                      >
                        <option value="random">偶尔发送语音条</option>
                        <option value="always">频繁发送语音</option>
                        <option value="audio_card">发送语音卡片</option>
                        <option value="off">关闭语音消息</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-[#b7a2d9] block mb-1">音色风格：</label>
                      <select
                        value={localSettings.voiceTone}
                        onChange={(e) => handleUpdate('voiceTone', e.target.value as any)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                      >
                        <option value="sweet">软萌少女音</option>
                        <option value="tsundere">傲娇甜妹音</option>
                        <option value="cool">清冷御姐音</option>
                        <option value="gentle">温柔正太音</option>
                        <option value="lively">阳光少年音</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* 表情包与符号互动 */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="text-xs font-bold text-[#ff8ecb] flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5" />
                  <span>表情包与符号互动</span>
                </div>

                {/* 表情包发送频率 */}
                <div className="space-y-1">
                  <div className="font-bold text-white">表情包发送频率</div>
                  <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                    {[
                      { key: 'high', label: '高频发送' },
                      { key: 'normal', label: '正常频率' },
                      { key: 'low', label: '低频偶尔' },
                      { key: 'off', label: '彻底关闭' },
                    ].map((item) => (
                      <button
                        key={item.key}
                        onClick={() => handleUpdate('stickerFrequency', item.key as any)}
                        className={`py-1.5 rounded-xl text-center text-[11px] font-bold transition-all ${
                          localSettings.stickerFrequency === item.key
                            ? 'bg-[#ff8ecb] text-[#1a0f24]'
                            : 'bg-white/5 text-[#b7a2d9] hover:bg-white/10'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 正文颜文字/emoji频率 */}
                <div className="space-y-1 pt-2 border-t border-white/5">
                  <div className="font-bold text-white">正文颜文字 / Emoji 频率</div>
                  <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                    {[
                      { key: 'high', label: '高频使用' },
                      { key: 'normal', label: '适度穿插' },
                      { key: 'low', label: '极少出现' },
                      { key: 'off', label: '完全不用' },
                    ].map((item) => (
                      <button
                        key={item.key}
                        onClick={() => handleUpdate('emojiFrequency', item.key as any)}
                        className={`py-1.5 rounded-xl text-center text-[11px] font-bold transition-all ${
                          localSettings.emojiFrequency === item.key
                            ? 'bg-[#ff8ecb] text-[#1a0f24]'
                            : 'bg-white/5 text-[#b7a2d9] hover:bg-white/10'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 允许ta在动态发表情包 */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div>
                    <div className="font-bold text-white">允许在动态发表情包</div>
                    <div className="text-[10px] text-[#b7a2d9]">
                      角色在 QQ 空间发布或评论动态时，可随文配发表情包
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleUpdate('allowPostStickerInQzone', !localSettings.allowPostStickerInQzone)
                    }
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                      localSettings.allowPostStickerInQzone ? 'bg-[#ff8ecb]' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        localSettings.allowPostStickerInQzone ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 表情包管理 */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">表情包管理</div>
                    <div className="text-[10px] text-[#b7a2d9]">
                      当前共有 {stickers.length} 个可用表情包（支持添加与删除）
                    </div>
                  </div>
                  <button
                    onClick={() => setIsStickerManagerOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-[#2e1540] hover:bg-[#ff8ecb] hover:text-[#1a0f24] border border-[#ff8ecb]/40 text-[#ff8ecb] text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <span>管理表情库</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 知识库与预设绑定 */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div className="text-xs font-bold text-[#ff8ecb] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>知识库与预设绑定</span>
                  </div>
                  <div className="text-[10px] text-[#b7a2d9] font-normal">
                    独立控制当前聊天的背景规则与预设体系
                  </div>
                </div>

                {/* 世界书额外启用 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                        <span>世界书额外启用</span>
                        <span className="text-[10px] text-[#ff8ecb] px-1.5 py-0.2 rounded-full bg-[#ff8ecb]/15 border border-[#ff8ecb]/30 font-normal">
                          已勾选 {(localSettings.extraWorldBookIds || []).length} 本
                        </span>
                      </div>
                      <div className="text-[10px] text-[#b7a2d9]">
                        勾选可在当前聊天中叠加生效的世界背景规则：
                      </div>
                    </div>
                    {worldbooks.length === 0 && onSaveWorldbooks && (
                      <button
                        type="button"
                        onClick={() => {
                          onSaveWorldbooks(DEFAULT_WORLDBOOKS);
                          showToast('已载入精选推荐世界设定');
                        }}
                        className="px-2 py-1 rounded-xl bg-[#2e1540] hover:bg-[#ff8ecb] hover:text-[#1a0f24] border border-[#ff8ecb]/40 text-[#ff8ecb] text-[10px] font-bold transition-all flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>载入推荐设定</span>
                      </button>
                    )}
                  </div>

                  {/* 角色人设自带的固有世界书提示 */}
                  {char.boundWorldBookIds && char.boundWorldBookIds.length > 0 && (
                    <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-[11px] text-purple-200 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-900 border border-purple-400 text-purple-300 font-bold shrink-0">
                          人设自带
                        </span>
                        <span className="truncate">
                          {(worldbooks.length > 0 ? worldbooks : DEFAULT_WORLDBOOKS).find((w) =>
                            char.boundWorldBookIds?.includes(w.id)
                          )?.name || '角色人设专属世界书'}
                        </span>
                      </div>
                      <span className="text-[10px] text-purple-300 shrink-0">默认常驻生效</span>
                    </div>
                  )}

                  {/* 世界书选择列表 */}
                  <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 pt-1">
                    {(worldbooks.length > 0 ? worldbooks : DEFAULT_WORLDBOOKS).map((wb) => {
                      const isChecked = Boolean(localSettings.extraWorldBookIds?.includes(wb.id));
                      const isCharBound = Boolean(char.boundWorldBookIds?.includes(wb.id));
                      return (
                        <div
                          key={wb.id}
                          onClick={() => {
                            const cur = localSettings.extraWorldBookIds || [];
                            const next = isChecked
                              ? cur.filter((id) => id !== wb.id)
                              : [...cur, wb.id];
                            handleUpdate('extraWorldBookIds', next);
                            if (worldbooks.length === 0 && onSaveWorldbooks) {
                              onSaveWorldbooks(DEFAULT_WORLDBOOKS);
                            }
                            showToast(isChecked ? `已取消「${wb.name}」` : `已启用「${wb.name}」`);
                          }}
                          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-[#37194f] border-[#ff8ecb] text-white shadow-[0_0_12px_rgba(255,142,203,0.25)]'
                              : 'bg-white/5 border-white/10 text-[#b7a2d9] hover:bg-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-xs truncate">{wb.name}</span>
                              {isCharBound && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-900/60 border border-purple-400/50 text-purple-200">
                                  自带已生效
                                </span>
                              )}
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/40 border border-white/10 text-[#d8b4e2]">
                                {wb.entries?.length || 0}条规则
                              </span>
                            </div>
                            {wb.description && (
                              <div className="text-[10px] text-white/50 truncate mt-0.5">
                                {wb.description}
                              </div>
                            )}
                          </div>
                          <div
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                              isChecked
                                ? 'bg-[#ff8ecb] border-[#ff8ecb] text-[#1a0f24]'
                                : 'border-white/30 bg-black/20'
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 单独绑定线上预设 */}
                <div className="space-y-2 pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                        <span>单独绑定线上预设</span>
                        {localSettings.boundOnlinePresetId ? (
                          <span className="text-[10px] text-cyan-300 px-1.5 py-0.2 rounded-full bg-cyan-950/70 border border-cyan-400/50 font-normal">
                            已单独绑定
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#b7a2d9] px-1.5 py-0.2 rounded-full bg-white/10 border border-white/10 font-normal">
                            跟随系统通用
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#b7a2d9]">
                        为当前聊天指定专属的线上对话交互规约（点击卡片即可直接选中绑定）：
                      </div>
                    </div>
                    {presets.length === 0 && onSavePresets && (
                      <button
                        type="button"
                        onClick={() => {
                          onSavePresets(DEFAULT_PRESETS);
                          showToast('已载入精选常用预设');
                        }}
                        className="px-2 py-1 rounded-xl bg-[#2e1540] hover:bg-[#ff8ecb] hover:text-[#1a0f24] border border-[#ff8ecb]/40 text-[#ff8ecb] text-[10px] font-bold transition-all flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>载入常用预设</span>
                      </button>
                    )}
                  </div>

                  {/* 快捷下拉选择器 */}
                  <select
                    value={localSettings.boundOnlinePresetId || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleUpdate('boundOnlinePresetId', val);
                      if (presets.length === 0 && onSavePresets) {
                        onSavePresets(DEFAULT_PRESETS);
                      }
                      showToast(val ? '已单独绑定该预设' : '已恢复跟随系统与全局预设');
                    }}
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff8ecb]"
                  >
                    <option value="">不单独绑定（跟随系统与角色通用预设）</option>
                    {(() => {
                      const effList = presets.length > 0 ? presets : DEFAULT_PRESETS;
                      const onlineList = effList.filter((p) => p.scene !== 'offline');
                      const list = onlineList.length > 0 ? onlineList : effList;
                      return list.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} {p.scope === 'local' ? '(专属)' : '(全局)'}
                        </option>
                      ));
                    })()}
                  </select>

                  {/* 直观卡片点击式单选列表 */}
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 pt-1">
                    {/* 选项 0: 跟随系统与全局预设 */}
                    <div
                      onClick={() => {
                        handleUpdate('boundOnlinePresetId', '');
                        showToast('已恢复跟随系统全局预设');
                      }}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        !localSettings.boundOnlinePresetId
                          ? 'bg-[#37194f] border-[#ff8ecb] text-white shadow-[0_0_12px_rgba(255,142,203,0.2)]'
                          : 'bg-white/5 border-white/10 text-[#b7a2d9] hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>跟随系统默认（全局预设）</span>
                          {!localSettings.boundOnlinePresetId && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#ff8ecb]/20 border border-[#ff8ecb]/50 text-[#ff8ecb]">
                              当前生效中
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#b7a2d9] mt-0.5">
                          不单独指定，自动使用全局启用的提示词预设与人设自身规则
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          !localSettings.boundOnlinePresetId
                            ? 'border-[#ff8ecb] bg-[#ff8ecb]'
                            : 'border-white/30'
                        }`}
                      >
                        {!localSettings.boundOnlinePresetId && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#1a0f24]" />
                        )}
                      </div>
                    </div>

                    {/* 各预设单选卡片 */}
                    {(() => {
                      const effList = presets.length > 0 ? presets : DEFAULT_PRESETS;
                      const onlineList = effList.filter((p) => p.scene !== 'offline');
                      const list = onlineList.length > 0 ? onlineList : effList;
                      return list.map((p) => {
                        const isSelected = localSettings.boundOnlinePresetId === p.id;
                        return (
                          <div
                            key={p.id}
                            onClick={() => {
                              handleUpdate('boundOnlinePresetId', p.id);
                              if (presets.length === 0 && onSavePresets) {
                                onSavePresets(DEFAULT_PRESETS);
                              }
                              showToast(`已绑定「${p.name}」`);
                            }}
                            className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-[#1b2b46] border-cyan-400 text-white shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                                : 'bg-white/5 border-white/10 text-[#b7a2d9] hover:bg-white/10 hover:border-white/20'
                            }`}
                          >
                            <div className="flex-1 min-w-0 pr-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-white truncate">
                                  {p.name}
                                </span>
                                {isSelected && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 font-bold">
                                    当前绑定
                                  </span>
                                )}
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/40 border border-white/10 text-[#d8b4e2]">
                                  {p.scope === 'local' ? '专属' : '全局'}
                                </span>
                              </div>
                              {p.description && (
                                <div className="text-[10px] text-[#b7a2d9] truncate mt-0.5">
                                  {p.description}
                                </div>
                              )}
                            </div>
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-white/30'
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#0a1524]" />}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 角色权限 */}
          {/* ========================================================= */}
          {activeTab === 'permission' && (
            <div className="space-y-4">
              {/* 感知与多媒体发送权限 */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="text-xs font-bold text-[#ff8ecb] flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  <span>感知与多媒体发送权限</span>
                </div>

                {/* 允许ai生图 */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">允许 AI 生图</div>
                    <div className="text-[10px] text-[#b7a2d9]">
                      角色在分享拍照、自拍或生活画面时可生成图片卡片
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleUpdate('allowAiImageGeneration', !localSettings.allowAiImageGeneration)
                    }
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                      localSettings.allowAiImageGeneration ? 'bg-[#ff8ecb]' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        localSettings.allowAiImageGeneration ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 表情包识图 */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div>
                    <div className="font-bold text-white">表情包识图</div>
                    <div className="text-[10px] text-[#b7a2d9]">
                      角色能主动理解你发来的表情包与图片情感，并趣味吐槽
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleUpdate('recognizeUserStickers', !localSettings.recognizeUserStickers)
                    }
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                      localSettings.recognizeUserStickers ? 'bg-[#ff8ecb]' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        localSettings.recognizeUserStickers ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 让ta看见我的头像 */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div>
                    <div className="font-bold text-white">感知我的头像</div>
                    <div className="text-[10px] text-[#b7a2d9]">
                      感知你的头像（当前：{userProfile?.avatar || '小萌兔'}），角色可在聊天中提起或夸赞
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleUpdate('allowSeeUserAvatar', !localSettings.allowSeeUserAvatar)
                    }
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                      localSettings.allowSeeUserAvatar ? 'bg-[#ff8ecb]' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        localSettings.allowSeeUserAvatar ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* 主动互动与通话权限 */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="text-xs font-bold text-[#ff8ecb] flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>主动互动与通话权限</span>
                </div>

                {/* 允许ta主动约你线下 */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">允许主动约你线下</div>
                    <div className="text-[10px] text-[#b7a2d9]">
                      聊得投机时，角色可主动发起线下相聚邀请卡片
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleUpdate(
                        'allowProactiveOfflineInvite',
                        !localSettings.allowProactiveOfflineInvite
                      )
                    }
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                      localSettings.allowProactiveOfflineInvite ? 'bg-[#ff8ecb]' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        localSettings.allowProactiveOfflineInvite
                          ? 'translate-x-4'
                          : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 允许ta主动打电话/发视频 */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div>
                    <div className="font-bold text-white">允许主动发起通话</div>
                    <div className="text-[10px] text-[#b7a2d9]">
                      想念或急切时，角色可发起语音或视频通话弹窗
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleUpdate('allowProactiveCall', !localSettings.allowProactiveCall)
                    }
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                      localSettings.allowProactiveCall ? 'bg-[#ff8ecb]' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        localSettings.allowProactiveCall ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 通话中ta主动说话 */}
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">通话中主动说话</div>
                      <div className="text-[10px] text-[#b7a2d9]">
                        开启后通话中角色会主动打破沉默找话题
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleUpdate('callProactiveSpeaking', !localSettings.callProactiveSpeaking)
                      }
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                        localSettings.callProactiveSpeaking ? 'bg-[#ff8ecb]' : 'bg-white/20'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          localSettings.callProactiveSpeaking ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  {localSettings.callProactiveSpeaking && (
                    <div className="pt-1.5 space-y-2 bg-black/30 p-2.5 rounded-xl border border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-[#d8b4e2]">选择主动说话间隔：</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="3"
                            max="60"
                            value={localSettings.callSpeakingInterval}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 5;
                              handleUpdate('callSpeakingInterval', Math.max(3, Math.min(60, val)));
                            }}
                            className="w-14 bg-black/60 border border-[#ff8ecb]/50 focus:border-[#ff8ecb] rounded-lg px-2 py-1 text-xs text-white text-center font-mono font-bold focus:outline-none"
                          />
                          <span className="text-[11px] text-[#b7a2d9]">秒</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                        <span className="text-[10px] text-[#b7a2d9]/70 shrink-0">快捷秒数：</span>
                        {[5, 10, 15, 20, 30].map((sec) => (
                          <button
                            key={sec}
                            onClick={() => handleUpdate('callSpeakingInterval', sec)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              localSettings.callSpeakingInterval === sec
                                ? 'bg-[#ff8ecb] text-[#1a0f24]'
                                : 'bg-white/10 text-[#d8b4e2] hover:bg-white/20'
                            }`}
                          >
                            {sec}秒
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 允许ta主动挂断 */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div>
                    <div className="font-bold text-white">允许主动挂断通话</div>
                    <div className="text-[10px] text-[#b7a2d9]">
                      聊完再见、害羞或被冷落太久时，角色可主动结束通话
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleUpdate('allowProactiveHangup', !localSettings.allowProactiveHangup)
                    }
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                      localSettings.allowProactiveHangup ? 'bg-[#ff8ecb]' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        localSettings.allowProactiveHangup ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* 拟真人类与作息规律 */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="text-xs font-bold text-[#ff8ecb] flex items-center gap-1.5">
                  <UserCheck2 className="w-3.5 h-3.5" />
                  <span>拟真人类与作息规律</span>
                </div>

                {/* 真人感回复 */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">真人感回复</div>
                    <div className="text-[10px] text-[#b7a2d9]">
                      根据回复字数智能模拟输入中状态与真实手打延迟
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleUpdate(
                        'realisticResponseTiming',
                        !localSettings.realisticResponseTiming
                      )
                    }
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                      localSettings.realisticResponseTiming ? 'bg-[#ff8ecb]' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        localSettings.realisticResponseTiming ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 允许ta主动找你 */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div>
                    <div className="font-bold text-white">允许主动发消息</div>
                    <div className="text-[10px] text-[#b7a2d9]">
                      闲置挂机时角色是否主动发消息关心或分享生活
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleUpdate(
                        'allowProactiveMessaging',
                        !localSettings.allowProactiveMessaging
                      )
                    }
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                      localSettings.allowProactiveMessaging ? 'bg-[#ff8ecb]' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        localSettings.allowProactiveMessaging ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 允许ta自行完全下线 */}
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">允许自行完全下线</div>
                      <div className="text-[10px] text-[#b7a2d9]">
                        支持深夜睡觉、出门打工或上课等真实作息自主下线
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleUpdate('allowSelfOffline', !localSettings.allowSelfOffline)
                      }
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                        localSettings.allowSelfOffline ? 'bg-[#ff8ecb]' : 'bg-white/20'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          localSettings.allowSelfOffline ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 当前下线状态指示与手动唤醒 */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-black/30 text-xs">
                    <span className="text-[#b7a2d9]">
                      当前作息状态：
                      <span className="font-bold text-white ml-1">
                        {localSettings.isCurrentlyOffline ? '🌙 离线中（睡觉/忙碌）' : '☀️ 在线中'}
                      </span>
                    </span>
                    {localSettings.isCurrentlyOffline && (
                      <button
                        onClick={() => {
                          handleUpdate('isCurrentlyOffline', false);
                          if (onWakeUpCharacter) onWakeUpCharacter();
                          showToast(`已唤醒「${char.name}」上线！`);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#ff8ecb] text-[#1a0f24] font-bold text-[11px] hover:opacity-90"
                      >
                        敲一敲唤醒 ta
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部保存与完成按钮 */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] text-[#b7a2d9]/70 font-mono">配置变动已即时生效并持久化</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a0f24] font-bold text-xs jelly-btn shadow-md"
          >
            完成设置
          </button>
        </div>
      </div>

      {/* 专属二级弹窗：表情包管理 */}
      {isStickerManagerOpen && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-60 flex items-center justify-center p-4 animate-in fade-in select-none">
          <div className="w-full max-w-md bg-[#20102f] border border-[#ff8ecb]/60 rounded-3xl p-5 shadow-2xl space-y-3.5 animate-in zoom-in-95 text-[#f7d6e8]">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-[#ff8ecb]" />
                <span>表情包管理库</span>
              </h3>
              <button
                onClick={() => setIsStickerManagerOpen(false)}
                className="text-[#b7a2d9] hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 添加新表情包 */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="text-xs font-bold text-[#ff8ecb]">➕ 添加自定义表情包</div>
              <input
                type="text"
                value={newStickerName}
                onChange={(e) => setNewStickerName(e.target.value)}
                placeholder="表情包名称（例如: 傲娇、委屈、抱抱）"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none"
              />
              <input
                type="text"
                value={newStickerUrl}
                onChange={(e) => setNewStickerUrl(e.target.value)}
                placeholder="图片 URL 地址 或 SVG Data URI"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none font-mono"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleAddSticker}
                  className="px-3.5 py-1 rounded-xl bg-[#ff8ecb] text-[#1a0f24] font-bold text-xs"
                >
                  添加保存
                </button>
              </div>
            </div>

            {/* 表情包列表 */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-white">当前全部表情包 ({stickers.length})：</div>
              <div className="max-h-56 overflow-y-auto grid grid-cols-4 gap-2 pr-1">
                {stickers.map((st) => (
                  <div
                    key={st.id}
                    className="p-1.5 rounded-xl bg-black/40 border border-white/10 flex flex-col items-center gap-1 group relative"
                  >
                    <img src={st.url} alt={st.name} className="w-10 h-10 object-contain rounded" />
                    <span className="text-[10px] truncate max-w-full text-[#d8b4e2]">{st.name}</span>
                    <button
                      onClick={() => handleDeleteSticker(st.id)}
                      className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-rose-900/80 text-rose-300 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="删除表情包"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
