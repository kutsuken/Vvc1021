import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Upload,
  Sparkles,
  MessageSquare,
  Edit2,
  Trash2,
  BookOpen,
  Check,
  RefreshCw,
  User,
  Camera,
} from 'lucide-react';
import { ApiConfig, CharacterPersona, WorldBookItem } from '../types/phone';
import {
  PixelBow,
  PixelSparkle,
  PixelHeart,
  PixelBlackCat,
  PixelIconContacts,
  PixelIconQQ,
} from './PixelAssets';
import { polishPersonaWithAI } from '../utils/aiService';
import { AvatarPickerModal, renderUniversalAvatar } from './AvatarPickerModal';

interface PersonasAppProps {
  personas: CharacterPersona[];
  worldbooks: WorldBookItem[];
  activeApi: ApiConfig;
  onSavePersonas: (list: CharacterPersona[]) => void;
  onBack: () => void;
  onStartChatWithPersona: (char: CharacterPersona) => void;
  subPage?: string;
  onNavigateSub: (sub: string, params?: any) => void;
  currentTheme?: string;
}

const PRESET_AVATARS = [
  { id: 'cat', name: '黑猫', component: PixelBlackCat },
  { id: 'girl', name: '少女', component: PixelIconContacts },
  { id: 'qq', name: '企鹅', component: PixelIconQQ },
  { id: 'bow', name: '丝带', component: PixelBow },
  { id: 'heart', name: '爱心', component: PixelHeart },
  { id: 'sparkle', name: '星芒', component: PixelSparkle },
];

export const PersonasApp: React.FC<PersonasAppProps> = ({
  personas,
  worldbooks,
  activeApi,
  onSavePersonas,
  onBack,
  onStartChatWithPersona,
  subPage = 'list',
  onNavigateSub,
  currentTheme = 'sky',
}) => {
  const isAqua = currentTheme === 'aqua_pixel';
  const [editingPersona, setEditingPersona] = useState<CharacterPersona | null>(null);

  // 表单状态
  const [formName, setFormName] = useState('');
  const [formRemarks, setFormRemarks] = useState('');
  const [formAvatar, setFormAvatar] = useState('cat');
  const [formPrompt, setFormPrompt] = useState('');
  const [formBoundWorldBooks, setFormBoundWorldBooks] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  // 待确认删除的角色对象
  const [charToDelete, setCharToDelete] = useState<CharacterPersona | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // AI 润色状态
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishPreview, setPolishPreview] = useState<string | null>(null);

  // 头像上传与选择系统弹窗状态
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [charForAvatarModal, setCharForAvatarModal] = useState<CharacterPersona | null>(null);

  const handleStartAdd = () => {
    setEditingPersona(null);
    setFormName('');
    setFormRemarks('');
    setFormAvatar('cat');
    setFormPrompt('');
    setFormBoundWorldBooks([]);
    setFormError(null);
    setPolishPreview(null);
    onNavigateSub('create');
  };

  const handleStartEdit = (p: CharacterPersona) => {
    setEditingPersona(p);
    setFormName(p.name);
    setFormRemarks(p.remarks);
    setFormAvatar(p.avatar);
    setFormPrompt(p.personaPrompt);
    setFormBoundWorldBooks(p.boundWorldBookIds || []);
    setFormError(null);
    setPolishPreview(null);
    onNavigateSub('edit');
  };

  // 点击删除按钮：触发应用内确认弹窗
  const handleDeleteClick = (p: CharacterPersona) => {
    setCharToDelete(p);
  };

  // 确认删除角色
  const handleConfirmDelete = () => {
    if (!charToDelete) return;
    const deletedId = charToDelete.id;
    const deletedName = charToDelete.name;
    const next = personas.filter((p) => p.id !== deletedId);
    onSavePersonas(next);
    setCharToDelete(null);
    showToast(`已成功移除联系人「${deletedName}」`);
    if (subPage === 'edit' || (editingPersona && editingPersona.id === deletedId)) {
      onBack();
    }
  };

  // 触发 AI 一键润色角色设定
  const handleAIPolish = async () => {
    if (!formPrompt.trim()) {
      setFormError('请先输入一段基础人设描述');
      return;
    }
    setFormError(null);
    setIsPolishing(true);
    setPolishPreview(null);
    try {
      const polished = await polishPersonaWithAI(
        formPrompt,
        formName || '角色',
        activeApi
      );
      setPolishPreview(polished);
    } catch (e: any) {
      setFormError(`润色失败：${e.message || '网络连接超时'}`);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleApplyPolish = () => {
    if (polishPreview) {
      setFormPrompt(polishPreview);
      setPolishPreview(null);
    }
  };

  const handleToggleWorldBook = (wbId: string) => {
    setFormBoundWorldBooks((prev) =>
      prev.includes(wbId) ? prev.filter((id) => id !== wbId) : [...prev, wbId]
    );
  };

  // 头像上传 (自动压缩至128x128 Base64)
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, 128, 128);
        const compressedBase64 = canvas.toDataURL('image/png', 0.85);
        setFormAvatar(compressedBase64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setFormError(null);
    if (!formName.trim()) {
      setFormError('请填写联系人名字');
      return;
    }
    if (!formPrompt.trim()) {
      setFormError('请填写角色设定提示词');
      return;
    }

    if (editingPersona) {
      const next = personas.map((p) =>
        p.id === editingPersona.id
          ? {
              ...p,
              name: formName.trim(),
              remarks: formRemarks.trim(),
              avatar: formAvatar,
              personaPrompt: formPrompt.trim(),
              boundWorldBookIds: formBoundWorldBooks,
            }
          : p
      );
      onSavePersonas(next);
      showToast('联系人设定已保存 ✦');
    } else {
      const newChar: CharacterPersona = {
        id: 'char_' + Date.now(),
        name: formName.trim(),
        remarks: formRemarks.trim(),
        avatar: formAvatar,
        personaPrompt: formPrompt.trim(),
        boundWorldBookIds: formBoundWorldBooks,
        createdAt: Date.now(),
      };
      onSavePersonas([...personas, newChar]);
      showToast('新联系人已添加 ✦');
    }
    onBack();
  };

  const renderAvatarPreview = (avatarVal: string) => {
    return renderUniversalAvatar(avatarVal, 'w-8 h-8');
  };

  // 1. 联系人列表页
  if (subPage === 'list') {
    return (
      <div
        className={`flex-1 flex flex-col select-none overflow-hidden relative font-mono transition-colors duration-200 ${
          isAqua
            ? 'bg-gradient-to-b from-[#f0f9ff] via-[#e0f2fe] to-[#bae6fd] text-[#0369a1]'
            : 'bg-gradient-to-b from-[#180f21] via-[#120b18] to-[#0a050e] text-[#f7d6e8]'
        }`}
      >
        {/* 顶部标题栏 */}
        <div
          className={`h-12 px-4 flex items-center justify-between border-b backdrop-blur-md z-10 transition-colors ${
            isAqua
              ? 'border-[#7dd3fc]/60 bg-[#e0f2fe]/90 text-[#0369a1]'
              : 'border-[#3b2a5a] bg-[#1e1328]/90 text-[#f7d6e8]'
          }`}
        >
          <button
            onClick={onBack}
            className={`p-1.5 jelly-btn cursor-pointer ${
              isAqua ? 'text-[#0284c7] hover:text-[#0369a1]' : 'text-[#d88fbf] hover:text-white'
            }`}
          >
            <ArrowLeft className="w-5 h-5 stroke-[2]" />
          </button>
          <div className="flex items-center gap-1.5 font-mono text-sm font-bold">
            <span className={isAqua ? 'text-[#0c4a6e]' : 'text-[#f7d6e8]'}>通讯录</span>
            <PixelBow className="w-5 h-5 drop-shadow-sm" />
          </div>
          <button
            onClick={handleStartAdd}
            className={`w-7 h-7 rounded-xl flex items-center justify-center jelly-btn cursor-pointer ${
              isAqua
                ? 'bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] text-white shadow-[0_2px_10px_rgba(2,132,199,0.35)]'
                : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] shadow-[0_2px_10px_rgba(255,142,203,0.35)] hover:opacity-90'
            }`}
            title="新建联系人"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* 消息提示浮层 */}
        {toastMsg && (
          <div
            className={`absolute top-14 left-4 right-4 z-40 px-3.5 py-2 rounded-2xl shadow-xl text-center text-xs font-mono animate-in fade-in slide-in-from-top-2 border ${
              isAqua
                ? 'bg-white/95 border-[#38bdf8] text-[#0284c7]'
                : 'bg-[#29173b]/95 border-[#ff8ecb]/60 text-[#f7d6e8]'
            }`}
          >
            ✦ {toastMsg}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className={`text-[11px] font-mono leading-relaxed px-1 ${isAqua ? 'text-[#0369a1]/80' : 'text-[#b7a2d9]'}`}>
            小手机通讯录好友。支持自定义头像、AI 润色设定与世界书绑定。点击联系人可直接发起 QQ 聊天。
          </div>

          {personas.length === 0 ? (
            <div className="py-16 px-4 flex flex-col items-center justify-center text-center">
              <div
                className={`w-16 h-16 rounded-3xl border flex items-center justify-center mb-3 ${
                  isAqua
                    ? 'bg-white/80 border-[#7dd3fc] shadow-[0_4px_16px_rgba(56,189,248,0.2)]'
                    : 'bg-[#1e1329] border-[#ff8ecb]/30 shadow-[0_4px_16px_rgba(255,142,203,0.15)]'
                }`}
              >
                <PixelIconContacts className="w-10 h-10 opacity-70" />
              </div>
              <div className={`font-mono text-sm font-bold mb-1 ${isAqua ? 'text-[#0c4a6e]' : 'text-[#f7d6e8]'}`}>
                通讯录暂无好友
              </div>
              <p className={`font-mono text-xs max-w-xs mb-5 leading-relaxed ${isAqua ? 'text-[#0369a1]/70' : 'text-[#b7a2d9]/60'}`}>
                当前没有任何联系人。点击下方按钮即可创建全新角色好友并开启 QQ 聊天~
              </p>
              <button
                onClick={handleStartAdd}
                className={`px-5 py-2.5 rounded-2xl text-xs font-mono font-bold flex items-center gap-1.5 jelly-btn cursor-pointer ${
                  isAqua
                    ? 'bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] text-white shadow-[0_2px_12px_rgba(2,132,199,0.35)]'
                    : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] shadow-[0_2px_12px_rgba(255,142,203,0.4)] hover:opacity-90'
                }`}
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>新建联系人</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {personas.map((p) => {
                const boundCount = p.boundWorldBookIds?.length || 0;
                return (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-2xl border shadow-md flex flex-col gap-2.5 transition-all ${
                      isAqua
                        ? 'bg-white/90 border-[#7dd3fc] hover:border-[#0284c7]'
                        : 'bg-[#1e1329]/85 border-[#3b2a5a] hover:border-[#ff8ecb]/80 shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* 角色头像 */}
                        <button
                          type="button"
                          onClick={() => {
                            setCharForAvatarModal(p);
                            setIsAvatarModalOpen(true);
                          }}
                          className={`relative w-12 h-12 rounded-2xl border-2 flex items-center justify-center overflow-hidden shadow-inner shrink-0 cursor-pointer group jelly-btn ${
                            isAqua
                              ? 'bg-[#e0f2fe] border-[#7dd3fc] hover:border-[#0284c7]'
                              : 'bg-gradient-to-b from-[#2e1d3d] to-[#150d1e] border-[#d88fbf] hover:border-[#ff8ecb]'
                          }`}
                          title={`点击更换「${p.name}」的头像`}
                        >
                          {renderAvatarPreview(p.avatar)}
                          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Camera className={`w-3.5 h-3.5 ${isAqua ? 'text-white' : 'text-[#ff8ecb]'}`} />
                          </div>
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-mono font-bold ${isAqua ? 'text-[#0c4a6e]' : 'text-[#f7d6e8]'}`}>
                              {p.name}
                            </span>
                            {p.remarks && (
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${
                                  isAqua
                                    ? 'text-[#0284c7] bg-[#e0f2fe] border-[#bae6fd]'
                                    : 'text-[#b7a2d9] bg-[#2a1738] border-[#3b2a5a]'
                                }`}
                              >
                                {p.remarks}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded border flex items-center gap-1 font-mono ${
                                isAqua
                                  ? 'text-[#0284c7] bg-[#e0f2fe] border-[#7dd3fc]'
                                  : 'text-[#ff8ecb] bg-[#2f1b3e] border-[#ff8ecb]/40'
                              }`}
                            >
                              <BookOpen className="w-2.5 h-2.5" />
                              <span>绑定世界书: {boundCount} 条</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEdit(p)}
                          className={`p-1.5 rounded-lg jelly-btn cursor-pointer ${
                            isAqua ? 'text-[#0284c7] hover:bg-[#e0f2fe]' : 'text-[#d88fbf] hover:text-[#ff8ecb] hover:bg-[#2e1c3e]'
                          }`}
                          title="编辑角色设定"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(p)}
                          className={`p-1.5 rounded-lg jelly-btn cursor-pointer ${
                            isAqua ? 'text-[#0369a1] hover:text-rose-600 hover:bg-rose-50' : 'text-[#b7a2d9] hover:text-rose-400 hover:bg-rose-950/40'
                          }`}
                          title={`删除联系人「${p.name}」`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* 人设 Prompt 简要预览 */}
                    <p
                      className={`text-[11px] line-clamp-2 leading-relaxed p-2.5 rounded-xl border font-mono ${
                        isAqua
                          ? 'text-[#0369a1] bg-[#f0f9ff] border-[#bae6fd]'
                          : 'text-[#b7a2d9] bg-[#170e20] border-[#3b2a5a]/60'
                      }`}
                    >
                      {p.personaPrompt}
                    </p>

                    {/* 开启 QQ 对话快捷按钮 */}
                    <button
                      onClick={() => onStartChatWithPersona(p)}
                      className={`w-full py-2 rounded-xl text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors jelly-btn cursor-pointer border ${
                        isAqua
                          ? 'bg-[#e0f2fe] hover:bg-[#bae6fd] text-[#0284c7] border-[#7dd3fc]'
                          : 'bg-gradient-to-r from-[#2f1b3e] to-[#241535] hover:from-[#3a224c] hover:to-[#2d1b40] border-[#ff8ecb]/50 text-[#ff8ecb]'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>与 {p.name} 开启 QQ 聊天</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 头像上传与选择系统弹窗 */}
        {charForAvatarModal && (
          <AvatarPickerModal
            currentAvatar={charForAvatarModal.avatar || 'cat'}
            isOpen={isAvatarModalOpen}
            onClose={() => {
              setIsAvatarModalOpen(false);
              setCharForAvatarModal(null);
            }}
            onSelectAvatar={(newAvatar) => {
              if (charForAvatarModal) {
                const next = personas.map((char) =>
                  char.id === charForAvatarModal.id ? { ...char, avatar: newAvatar } : char
                );
                onSavePersonas(next);
              }
            }}
            title={`更换「${charForAvatarModal.name}」的头像`}
          />
        )}

        {/* 确认删除联系人应用内弹窗 */}
        {charToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
            <div
              className={`w-full max-w-xs rounded-3xl p-5 shadow-2xl flex flex-col items-center text-center space-y-3.5 font-mono border ${
                isAqua
                  ? 'bg-white border-[#7dd3fc] text-[#0369a1]'
                  : 'bg-[#1f132a] border-[#ff8ecb]/50 text-[#f7d6e8]'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/40 flex items-center justify-center text-rose-500 shadow-inner">
                <Trash2 className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className={`text-sm font-bold ${isAqua ? 'text-[#0c4a6e]' : 'text-[#f7d6e8]'}`}>删除联系人</h3>
                <p className={`text-xs mt-1.5 leading-relaxed ${isAqua ? 'text-[#0369a1]' : 'text-[#b7a2d9]'}`}>
                  确定要从通讯录中删除「<span className={`font-bold ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`}>{charToDelete.name}</span>」吗？
                </p>
                <p className={`text-[10px] mt-1 ${isAqua ? 'text-[#0369a1]/70' : 'text-[#b7a2d9]/60'}`}>
                  与 Ta 的聊天记录仍将安全保留在手机中。
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full pt-1">
                <button
                  type="button"
                  onClick={() => setCharToDelete(null)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border jelly-btn cursor-pointer ${
                    isAqua
                      ? 'bg-[#f0f9ff] text-[#0369a1] border-[#bae6fd] hover:bg-[#e0f2fe]'
                      : 'bg-[#2a1b38] hover:bg-[#38234c] text-[#b7a2d9] border-[#4b3670]'
                  }`}
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-[0_2px_12px_rgba(244,63,94,0.4)] jelly-btn cursor-pointer"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. 创建 / 编辑角色视图
  return (
    <div
      className={`flex-1 flex flex-col select-none overflow-hidden relative font-mono transition-colors duration-200 ${
        isAqua
          ? 'bg-gradient-to-b from-[#f0f9ff] via-[#e0f2fe] to-[#bae6fd] text-[#0369a1]'
          : 'bg-gradient-to-b from-[#180f21] via-[#120b18] to-[#0a050e] text-[#f7d6e8]'
      }`}
    >
      <div
        className={`h-12 px-4 flex items-center justify-between border-b backdrop-blur-md transition-colors ${
          isAqua
            ? 'border-[#7dd3fc]/60 bg-[#e0f2fe]/90 text-[#0369a1]'
            : 'border-[#3b2a5a] bg-[#1e1328]/90 text-[#f7d6e8]'
        }`}
      >
        <button
          onClick={onBack}
          className={`p-1.5 jelly-btn cursor-pointer ${
            isAqua ? 'text-[#0284c7] hover:text-[#0369a1]' : 'text-[#d88fbf] hover:text-white'
          }`}
        >
          <ArrowLeft className="w-5 h-5 stroke-[2]" />
        </button>
        <span className={`text-sm font-mono font-bold ${isAqua ? 'text-[#0c4a6e]' : 'text-[#f7d6e8]'}`}>
          {editingPersona ? '编辑联系人设定' : '新建联系人'}
        </span>
        <button
          onClick={handleSave}
          className={`text-xs font-mono font-bold px-3.5 py-1.5 rounded-xl jelly-btn cursor-pointer shadow-md ${
            isAqua
              ? 'bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] text-white shadow-[0_2px_10px_rgba(2,132,199,0.35)]'
              : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] shadow-[0_2px_10px_rgba(255,142,203,0.35)] hover:opacity-90'
          }`}
        >
          保存
        </button>
      </div>

      {/* 提示通知 */}
      {toastMsg && (
        <div className="absolute top-14 left-4 right-4 z-40 bg-[#29173b]/95 border border-[#ff8ecb]/60 px-3.5 py-2 rounded-2xl shadow-xl text-center text-xs font-mono text-[#f7d6e8] animate-in fade-in slide-in-from-top-2">
          ✦ {toastMsg}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 表单校验错误提示条 */}
        {formError && (
          <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/60 text-xs text-rose-200 font-mono flex items-center gap-2 animate-in fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping shrink-0"></span>
            <span>{formError}</span>
          </div>
        )}

        {/* 头像配置 */}
        <div>
          <label className="block text-[11px] font-mono text-[#b7a2d9] mb-1.5">角色头像</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setCharForAvatarModal(null);
                setIsAvatarModalOpen(true);
              }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-b from-[#2e1d3d] to-[#150d1e] border-2 border-[#d88fbf] hover:border-[#ff8ecb] flex items-center justify-center overflow-hidden shadow-inner shrink-0 cursor-pointer group jelly-btn relative"
              title="点击打开头像系统"
            >
              {renderAvatarPreview(formAvatar)}
              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-4 h-4 text-[#ff8ecb]" />
              </div>
            </button>

            <div className="flex-1 space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  setCharForAvatarModal(null);
                  setIsAvatarModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#2e1d3e] text-xs font-bold text-[#ff8ecb] border border-[#d88fbf]/50 hover:bg-[#3d2652] cursor-pointer flex items-center gap-1.5 jelly-btn shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>选择 / 上传角色头像</span>
              </button>
              <div className="text-[10px] text-[#b7a2d9]/60 font-mono">
                支持相册照片、智能居中裁剪与精选地雷系预设
              </div>
            </div>
          </div>
        </div>

        {/* 名字与备注 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={`block text-[11px] font-mono mb-1 ${isAqua ? 'text-[#0369a1]' : 'text-[#b7a2d9]'}`}>
              联系人姓名 *
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => {
                setFormName(e.target.value);
                if (formError) setFormError(null);
              }}
              placeholder="例如：软软 / 傲娇猫猫"
              className={`w-full px-3 py-2 text-xs rounded-xl border font-mono focus:outline-none ${
                isAqua
                  ? 'bg-white text-[#0c4a6e] border-[#7dd3fc] focus:border-[#0284c7]'
                  : 'bg-[#1f132a] text-[#f7d6e8] border-[#4b3670] focus:border-[#ff8ecb]'
              }`}
            />
          </div>
          <div>
            <label className={`block text-[11px] font-mono mb-1 ${isAqua ? 'text-[#0369a1]' : 'text-[#b7a2d9]'}`}>
              个性标签/头衔
            </label>
            <input
              type="text"
              value={formRemarks}
              onChange={(e) => setFormRemarks(e.target.value)}
              placeholder="例如：毒舌女仆 / 粘人学妹"
              className={`w-full px-3 py-2 text-xs rounded-xl border font-mono focus:outline-none ${
                isAqua
                  ? 'bg-white text-[#0c4a6e] border-[#7dd3fc] focus:border-[#0284c7]'
                  : 'bg-[#1f132a] text-[#f7d6e8] border-[#4b3670] focus:border-[#ff8ecb]'
              }`}
            />
          </div>
        </div>

        {/* 人设提示词 (附带 AI 一键润色) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={`text-[11px] font-mono ${isAqua ? 'text-[#0369a1]' : 'text-[#b7a2d9]'}`}>
              角色详细人设 (Prompt) *
            </label>
            <button
              type="button"
              onClick={handleAIPolish}
              disabled={isPolishing || !formPrompt.trim()}
              className={`text-[10px] flex items-center gap-1 font-mono font-medium disabled:opacity-40 jelly-btn cursor-pointer ${
                isAqua ? 'text-[#0284c7] hover:text-[#0369a1]' : 'text-[#ff8ecb] hover:text-white'
              }`}
            >
              {isPolishing ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              <span>AI 一键润色人设</span>
            </button>
          </div>

          <textarea
            rows={5}
            value={formPrompt}
            onChange={(e) => {
              setFormPrompt(e.target.value);
              if (formError) setFormError(null);
            }}
            placeholder="写下 Ta 的性格、说话语气、背景故事与日常互动细节..."
            className={`w-full px-3 py-2 text-xs rounded-xl border font-mono focus:outline-none leading-relaxed ${
              isAqua
                ? 'bg-white text-[#0c4a6e] border-[#7dd3fc] focus:border-[#0284c7]'
                : 'bg-[#1f132a] text-[#f7d6e8] border-[#4b3670] focus:border-[#ff8ecb]'
            }`}
          ></textarea>

          {/* AI 润色结果比对采纳卡片 */}
          {polishPreview && (
            <div
              className={`mt-2 p-3 rounded-xl border text-xs font-mono space-y-2 animate-in fade-in duration-200 ${
                isAqua
                  ? 'bg-white border-[#38bdf8] shadow-md'
                  : 'bg-[#241535] border-[#ff8ecb]/60'
              }`}
            >
              <div className={`flex items-center justify-between font-medium text-[11px] ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`}>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI 润色提案：</span>
                </div>
                <button
                  type="button"
                  onClick={handleApplyPolish}
                  className={`px-2 py-0.5 rounded-lg font-bold jelly-btn cursor-pointer ${
                    isAqua
                      ? 'bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] text-white'
                      : 'bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] hover:opacity-90'
                  }`}
                >
                  采纳替换
                </button>
              </div>
              <p
                className={`text-[11px] leading-relaxed p-2 rounded-lg border ${
                  isAqua
                    ? 'text-[#0c4a6e] bg-[#f0f9ff] border-[#bae6fd]'
                    : 'text-[#f7d6e8] bg-[#190e24] border-[#3b2a5a]'
                }`}
              >
                {polishPreview}
              </p>
            </div>
          )}
        </div>

        {/* 专属世界书守则绑定 */}
        <div>
          <label className={`block text-[11px] font-mono mb-1.5 ${isAqua ? 'text-[#0369a1]' : 'text-[#b7a2d9]'}`}>
            局部世界书绑定 (该联系人专属设定)
          </label>
          {worldbooks.length === 0 ? (
            <div
              className={`text-[10px] font-mono p-3 rounded-xl border ${
                isAqua
                  ? 'text-[#0369a1]/70 bg-white/70 border-[#bae6fd]'
                  : 'text-[#b7a2d9]/60 bg-[#1d1226]/80 border-[#3b2a5a]'
              }`}
            >
              当前没有世界书条目，可在世界书应用中创建专属设定守则。
            </div>
          ) : (
            <div
              className={`space-y-1.5 max-h-36 overflow-y-auto p-2 rounded-xl border ${
                isAqua
                  ? 'bg-white/80 border-[#7dd3fc]'
                  : 'bg-[#1d1226]/80 border-[#3b2a5a]'
              }`}
            >
              {worldbooks.map((wb) => {
                const isSelected = formBoundWorldBooks.includes(wb.id);
                return (
                  <div
                    key={wb.id}
                    onClick={() => handleToggleWorldBook(wb.id)}
                    className={`px-3 py-2 rounded-lg border text-xs font-mono cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected
                        ? isAqua
                          ? 'border-[#0284c7] bg-[#e0f2fe] text-[#0284c7]'
                          : 'border-[#ff8ecb] bg-[#341d45] text-[#f7d6e8]'
                        : isAqua
                        ? 'border-[#bae6fd] bg-white text-[#0369a1] hover:bg-[#f0f9ff]'
                        : 'border-[#3b2a5a] bg-[#1a1024]/80 text-[#b7a2d9] hover:bg-[#251535]'
                    }`}
                  >
                    <div>
                      <div className="font-bold">{wb.name}</div>
                      <div className="text-[9px] opacity-70">
                        {wb.scope === 'global' ? '全局守则 (全员自动生效)' : '局部专属条目'}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className={`w-4 h-4 stroke-[3] ${isAqua ? 'text-[#0284c7]' : 'text-[#ff8ecb]'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 编辑模式下的专属删除角色按钮 */}
        {editingPersona && (
          <div className="pt-2 pb-6">
            <button
              type="button"
              onClick={() => handleDeleteClick(editingPersona)}
              className="w-full py-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/40 hover:bg-rose-500/20 text-rose-500 text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors jelly-btn cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>删除该联系人</span>
            </button>
          </div>
        )}
      </div>

      {/* 头像上传与选择系统弹窗 */}
      <AvatarPickerModal
        currentAvatar={formAvatar}
        isOpen={isAvatarModalOpen && !charForAvatarModal}
        onClose={() => setIsAvatarModalOpen(false)}
        onSelectAvatar={(newAvatar) => {
          setFormAvatar(newAvatar);
        }}
        title="选择 / 上传角色头像"
      />

      {/* 确认删除联系人应用内弹窗 */}
      {charToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xs bg-[#1f132a] border border-[#ff8ecb]/50 rounded-3xl p-5 shadow-[0_12px_40px_rgba(0,0,0,0.85)] flex flex-col items-center text-center space-y-3.5 font-mono">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/50 border border-rose-500/60 flex items-center justify-center text-rose-400 shadow-inner">
              <Trash2 className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#f7d6e8]">删除联系人</h3>
              <p className="text-xs text-[#b7a2d9] mt-1.5 leading-relaxed">
                确定要从通讯录中删除「<span className="text-[#ff8ecb] font-bold">{charToDelete.name}</span>」吗？
              </p>
              <p className="text-[10px] text-[#b7a2d9]/60 mt-1">
                与 Ta 的聊天记录仍将安全保留在手机中。
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full pt-1">
              <button
                type="button"
                onClick={() => setCharToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#2a1b38] hover:bg-[#38234c] text-[#b7a2d9] text-xs font-bold border border-[#4b3670] jelly-btn cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-[0_2px_12px_rgba(244,63,94,0.4)] jelly-btn cursor-pointer"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

