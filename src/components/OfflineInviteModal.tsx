import React, { useState } from 'react';
import { X, Calendar, MapPin, Coffee, Sparkles, Send, CheckCircle2, XCircle, HeartHandshake, ArrowRight } from 'lucide-react';
import { CharacterPersona, ApiConfig, UserProfile } from '../types/phone';
import { OfflineInviteInfo } from '../types/offline';
import { generateOfflineInviteResponse } from '../utils/offlineAiService';
import { renderUniversalAvatar } from './AvatarPickerModal';

interface OfflineInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  char: CharacterPersona;
  userProfile?: UserProfile;
  activeApi?: ApiConfig | null;
  onConfirmInviteAccepted: (inviteInfo: OfflineInviteInfo) => void;
}

export const OfflineInviteModal: React.FC<OfflineInviteModalProps> = ({
  isOpen,
  onClose,
  char,
  userProfile,
  activeApi,
  onConfirmInviteAccepted,
}) => {
  const [time, setTime] = useState('明天下午 15:00');
  const [location, setLocation] = useState('转角猫咪咖啡厅靠窗座');
  const [activity, setActivity] = useState('一起品尝草莓芭菲，安静聊聊天');
  const [note, setNote] = useState('穿暖和一点哦，我在老地方等你~');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteResult, setInviteResult] = useState<OfflineInviteInfo | null>(null);

  if (!isOpen) return null;

  const quickTimes = ['今天傍晚 18:30', '明天下午 15:00', '本周六午后 14:00', '阳光明媚的周末上午'];
  const quickLocations = ['转角猫咪咖啡厅靠窗座', '海边微风长椅', '安静的书店角落', '校园天台吹风处'];
  const quickActivities = ['一起品尝草莓芭菲，安静聊聊天', '漫步在林荫道下分享最近的心事', '边听轻音乐边喝热红茶发呆', '去寻找最好吃的日落甜品店'];

  const handleSendInvite = async () => {
    if (!time.trim() || !location.trim() || !activity.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await generateOfflineInviteResponse(
        char,
        {
          time: time.trim(),
          location: location.trim(),
          activity: activity.trim(),
          note: note.trim() || undefined,
        },
        userProfile,
        activeApi
      );

      const newInvite: OfflineInviteInfo = {
        time: time.trim(),
        location: location.trim(),
        activity: activity.trim(),
        note: note.trim() || undefined,
        status: res.accepted ? 'accepted' : 'rejected',
        characterResponse: res.response,
        createdAt: Date.now(),
      };

      setInviteResult(newInvite);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnterOffline = () => {
    if (inviteResult && inviteResult.status === 'accepted') {
      onConfirmInviteAccepted(inviteResult);
      onClose();
    }
  };

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col justify-end animate-in fade-in select-none">
      <div className="bg-[#1c1026] rounded-t-3xl border-t border-[#4b3670] flex flex-col max-h-[92%] shadow-2xl">
        {/* 顶部标题栏 */}
        <div className="p-4 border-b border-[#3b2a5a] flex items-center justify-between shrink-0 bg-[#251535]/95">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2e173e] border border-[#ff8ecb]/60 flex items-center justify-center overflow-hidden shrink-0">
              {renderUniversalAvatar(char.avatar, 'w-6 h-6')}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#f7d6e8]">向「{char.name}」发起线下邀约</h3>
              <p className="text-[10px] text-[#b7a2d9]">填写时间与地点，对方将根据人使做出真实验收反应</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#b7a2d9] hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 邀约表单与结果卡片 (滚动区) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-[#f7d6e8]">
          {/* 邀约未发出或需要重新编辑时 */}
          {!inviteResult ? (
            <div className="space-y-4">
              {/* 1. 邀约时间 */}
              <div className="space-y-1.5">
                <label className="font-bold flex items-center gap-1.5 text-[#ff8ecb] text-xs">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>约定时间</span>
                </label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="例如：明天下午 15:00"
                  className="w-full px-3 py-2 bg-[#150d1e] text-[#f7d6e8] rounded-xl border border-[#3b2a5a] focus:outline-none focus:border-[#ff8ecb] text-xs font-mono"
                />
                {/* 快捷时间标签 */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  {quickTimes.map((qt) => (
                    <button
                      key={qt}
                      type="button"
                      onClick={() => setTime(qt)}
                      className="px-2 py-0.5 rounded-lg bg-[#231535] text-[10px] text-[#b7a2d9] hover:text-[#ff8ecb] border border-[#3b2a5a]/60"
                    >
                      {qt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. 约定地点 */}
              <div className="space-y-1.5">
                <label className="font-bold flex items-center gap-1.5 text-[#ff8ecb] text-xs">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>约定地点</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="例如：转角猫咪咖啡厅靠窗座"
                  className="w-full px-3 py-2 bg-[#150d1e] text-[#f7d6e8] rounded-xl border border-[#3b2a5a] focus:outline-none focus:border-[#ff8ecb] text-xs"
                />
                {/* 快捷地点标签 */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  {quickLocations.map((ql) => (
                    <button
                      key={ql}
                      type="button"
                      onClick={() => setLocation(ql)}
                      className="px-2 py-0.5 rounded-lg bg-[#231535] text-[10px] text-[#b7a2d9] hover:text-[#ff8ecb] border border-[#3b2a5a]/60"
                    >
                      {ql}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. 相聚活动内容 */}
              <div className="space-y-1.5">
                <label className="font-bold flex items-center gap-1.5 text-[#ff8ecb] text-xs">
                  <Coffee className="w-3.5 h-3.5" />
                  <span>约定活动 / 约会安排</span>
                </label>
                <input
                  type="text"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  placeholder="例如：品尝新出炉的草莓大福并散步"
                  className="w-full px-3 py-2 bg-[#150d1e] text-[#f7d6e8] rounded-xl border border-[#3b2a5a] focus:outline-none focus:border-[#ff8ecb] text-xs"
                />
                {/* 快捷活动标签 */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  {quickActivities.map((qa) => (
                    <button
                      key={qa}
                      type="button"
                      onClick={() => setActivity(qa)}
                      className="px-2 py-0.5 rounded-lg bg-[#231535] text-[10px] text-[#b7a2d9] hover:text-[#ff8ecb] border border-[#3b2a5a]/60 truncate max-w-full"
                    >
                      {qa}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. 附加给对方的话 */}
              <div className="space-y-1.5">
                <label className="font-bold flex items-center gap-1.5 text-[#ff8ecb] text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>附言备忘 (捎带给对方的话)</span>
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="说点悄悄话吧，例如：记得穿暖和一点哦..."
                  className="w-full px-3 py-2 bg-[#150d1e] text-[#f7d6e8] rounded-xl border border-[#3b2a5a] focus:outline-none focus:border-[#ff8ecb] text-xs resize-none"
                />
              </div>
            </div>
          ) : (
            /* 对方回应展示卡片 */
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              <div
                className={`p-4 rounded-2xl border ${
                  inviteResult.status === 'accepted'
                    ? 'bg-[#1e142e] border-emerald-500/60 shadow-[0_4px_24px_rgba(16,185,129,0.15)]'
                    : 'bg-[#2a1324] border-rose-500/60 shadow-[0_4px_24px_rgba(244,63,94,0.15)]'
                }`}
              >
                {/* 状态徽章 */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    {inviteResult.status === 'accepted' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <div className="font-bold text-sm text-white">
                        {inviteResult.status === 'accepted'
                          ? `「${char.name}」已欣然接受邀约！`
                          : `「${char.name}」婉拒了本次邀约`}
                      </div>
                      <div className="text-[10px] text-[#b7a2d9]">
                        {inviteResult.status === 'accepted'
                          ? '双方约定已达成，可立即进入线下相聚空间'
                          : '对方可能感到唐突或有顾虑，可调整计划后再试'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 对方回复语录 (带头像气泡) */}
                <div className="mt-3.5 flex items-start gap-2.5 bg-black/35 p-3 rounded-xl border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-[#231535] border border-[#ff8ecb]/60 flex items-center justify-center overflow-hidden shrink-0 mt-0.5">
                    {renderUniversalAvatar(char.avatar, 'w-6 h-6')}
                  </div>
                  <div className="flex-1 text-xs text-[#f7d6e8] leading-relaxed break-words whitespace-pre-wrap">
                    {inviteResult.characterResponse}
                  </div>
                </div>

                {/* 约定概要清单 */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-white/10 text-[#b7a2d9]">
                  <div>
                    <span className="opacity-60">时间：</span>
                    <span className="text-white font-mono">{inviteResult.time}</span>
                  </div>
                  <div>
                    <span className="opacity-60">地点：</span>
                    <span className="text-white">{inviteResult.location}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="opacity-60">活动：</span>
                    <span className="text-[#ff8ecb]">{inviteResult.activity}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮栏 */}
        <div className="p-3 border-t border-[#3b2a5a] bg-[#1e1328] flex items-center gap-2 shrink-0">
          {!inviteResult ? (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-[#281538] border border-[#4b3670] text-[#b7a2d9] hover:text-white font-bold text-xs jelly-btn"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSendInvite}
                disabled={isSubmitting || !time.trim() || !location.trim()}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] font-bold text-xs flex items-center justify-center gap-1.5 jelly-btn shadow-md disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? '对方正在斟酌答复...' : '向对方发起正式邀约'}</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setInviteResult(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#281538] border border-[#4b3670] text-[#b7a2d9] hover:text-white font-bold text-xs jelly-btn"
              >
                重新修改邀约
              </button>
              {inviteResult.status === 'accepted' ? (
                <button
                  type="button"
                  onClick={handleEnterOffline}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-[#ff8ecb] text-[#1a1120] font-bold text-xs flex items-center justify-center gap-1.5 jelly-btn shadow-md"
                >
                  <span>立即赴约 · 进入线下空间</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-[#281538] border border-[#4b3670] text-[#b7a2d9] font-bold text-xs jelly-btn"
                >
                  好的，知道了
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
