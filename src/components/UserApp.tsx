import React, { useState } from 'react';
import {
  ArrowLeft,
  Camera,
  Heart,
  Sparkles,
  MapPin,
  Calendar,
  User,
  Briefcase,
  Smile,
  BookOpen,
  Image as ImageIcon,
  Check,
  Upload,
  Cloud,
  Sun,
  CloudRain,
  RotateCw,
  Hash,
  Compass,
} from 'lucide-react';
import { UserProfile } from '../types/phone';
import {
  PixelBow,
  PixelSparkle,
  PixelHeart,
  PixelBunny,
  PixelBlackCat,
  PixelLevelBadge,
  PixelIconContacts,
} from './PixelAssets';
import defaultBannerUrl from '../assets/images/user_profile_banner_1790869097641.jpg';
import defaultFaceLockUrl from '../assets/images/user_facelock_card_1790869116896.jpg';
import {
  AvatarPickerModal,
  PRESET_AVATARS,
  SOLID_AVATAR_COLORS,
  renderUniversalAvatar,
} from './AvatarPickerModal';
import {
  BannerPickerModal,
  PRESET_BANNERS,
  SOLID_BANNER_GRADIENTS,
  getUniversalBannerStyle,
} from './BannerPickerModal';

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: '123456',
  username: '',
  name: '',
  nickname: '',
  identity: '',
  bio: '',
  gender: '',
  sexualOrientation: '',
  birthday: '',
  region: '',
  weather: '',
  realRegion: '',
  hobbies: '',
  persona: '',
  appearanceText: '',
  avatar: 'bunny',
  banner: 'default',
  status: '在线',
  level: 'Lv.1',
};

interface UserAppProps {
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onBack: () => void;
  subPage?: 'view' | 'edit';
  onNavigateSub?: (sub: 'view' | 'edit') => void;
}

export const UserApp: React.FC<UserAppProps> = ({
  profile,
  onSaveProfile,
  onBack,
  subPage = 'view',
  onNavigateSub,
}) => {
  const [isEditing, setIsEditing] = useState(subPage === 'edit');
  const [formData, setFormData] = useState<UserProfile>(() => ({
    ...DEFAULT_USER_PROFILE,
    ...profile,
    username: profile.username || (profile as any).name || '',
    identity: profile.identity || (profile as any).occupation || '',
    weather: profile.weather || '',
    sexualOrientation: profile.sexualOrientation || '',
  }));
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [weatherNotice, setWeatherNotice] = useState<string>('');
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [isBannerPickerOpen, setIsBannerPickerOpen] = useState(false);

  // 头像渲染逻辑 (支持通用头像系统)
  const renderAvatarImg = (avatarVal: string) => {
    return renderUniversalAvatar(avatarVal, 'w-14 h-14');
  };

  const getBannerStyle = (bannerVal: string): React.CSSProperties => {
    return getUniversalBannerStyle(bannerVal);
  };

  const getBannerUrl = (bannerVal: string) => {
    if (bannerVal && bannerVal.startsWith('data:image')) {
      return bannerVal;
    }
    return defaultBannerUrl;
  };

  const getFaceLockUrl = (faceImg?: string) => {
    if (faceImg && faceImg.startsWith('data:image')) {
      return faceImg;
    }
    return defaultFaceLockUrl;
  };

  // 头像上传压缩至 128x128 Base64
  const handleUploadAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const base64 = canvas.toDataURL('image/png', 0.85);
        setFormData((prev) => ({ ...prev, avatar: base64 }));
        if (!isEditing) {
          onSaveProfile({ ...profile, avatar: base64 });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // 封面横幅上传压缩
  const handleUploadBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormData((prev) => ({ ...prev, banner: base64 }));
      if (!isEditing) {
        onSaveProfile({ ...profile, banner: base64 });
      }
    };
    reader.readAsDataURL(file);
  };

  // 锁脸图上传
  const handleUploadFaceLock = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormData((prev) => ({ ...prev, faceLockImage: base64 }));
      if (!isEditing) {
        onSaveProfile({ ...profile, faceLockImage: base64 });
      }
    };
    reader.readAsDataURL(file);
  };

  // 实时检测定位与天气
  const handleDetectWeather = async () => {
    setIsFetchingWeather(true);
    setWeatherNotice('正在连接卫星电波...');

    const parseWmoWeather = (code: number, temp: number) => {
      let desc = '晴朗';
      if (code === 1 || code === 2) desc = '多云';
      else if (code === 3) desc = '阴天';
      else if (code >= 45 && code <= 48) desc = '雾霭';
      else if (code >= 51 && code <= 67) desc = '细雨绵绵';
      else if (code >= 71 && code <= 77) desc = '飞雪轻扬';
      else if (code >= 80 && code <= 82) desc = '阵雨急骤';
      else if (code >= 95) desc = '雷雨交加';
      return `${desc} ${Math.round(temp)}°C`;
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
            );
            if (res.ok) {
              const data = await res.json();
              const currentWeather = data.current_weather;
              const result = parseWmoWeather(currentWeather.weathercode, currentWeather.temperature);
              setFormData((prev) => ({ ...prev, weather: result }));
              setWeatherNotice(`已同步现实天气：${result}`);
            } else {
              fallbackWeather();
            }
          } catch {
            fallbackWeather();
          } finally {
            setIsFetchingWeather(false);
            setTimeout(() => setWeatherNotice(''), 3000);
          }
        },
        () => {
          fallbackWeather();
        },
        { timeout: 5000 }
      );
    } else {
      fallbackWeather();
    }

    async function fallbackWeather() {
      try {
        const res = await fetch('https://wttr.in/?format=%C+%t');
        if (res.ok) {
          const text = (await res.text()).trim();
          if (text) {
            setFormData((prev) => ({ ...prev, weather: text }));
            setWeatherNotice(`已按网络节点同步：${text}`);
            setIsFetchingWeather(false);
            setTimeout(() => setWeatherNotice(''), 3000);
            return;
          }
        }
      } catch {
        // ignore
      }
      const presets = ['微风晴朗 22°C', '草莓粉霞 20°C', '微雨清冽 18°C', '星夜清凉 19°C'];
      const chosen = presets[Math.floor(Math.random() * presets.length)];
      setFormData((prev) => ({ ...prev, weather: chosen }));
      setWeatherNotice(`已适配当前氛围：${chosen}`);
      setIsFetchingWeather(false);
      setTimeout(() => setWeatherNotice(''), 3000);
    }
  };

  const handleSave = () => {
    onSaveProfile(formData);
    setIsEditing(false);
    onNavigateSub?.('view');
  };

  const handleStartEdit = () => {
    setFormData({
      ...DEFAULT_USER_PROFILE,
      ...profile,
      username: profile.username || (profile as any).name || '',
      identity: profile.identity || (profile as any).occupation || '',
      weather: profile.weather || '',
      sexualOrientation: profile.sexualOrientation || '',
    });
    setIsEditing(true);
    onNavigateSub?.('edit');
  };

  // ==========================================
  // 1. 编辑资料态 (右上角保存已去掉，底部保留保存资料)
  // ==========================================
  if (isEditing) {
    return (
      <div className="flex-1 flex flex-col bg-gradient-to-b from-[#180f21] via-[#120b18] to-[#0a050e] select-none text-[#f7d6e8] overflow-hidden font-mono">
        {/* 顶部标题栏 (依照要求：已去掉右上角的保存按钮，仅保留返回与居中标题) */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-[#3b2a5a] bg-[#1e1328]/95 backdrop-blur-md z-20 shrink-0">
          <button
            onClick={() => {
              setIsEditing(false);
              onNavigateSub?.('view');
            }}
            className="p-1.5 text-[#d88fbf] hover:text-white jelly-btn"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2]" />
          </button>
          <div className="flex items-center gap-1.5 font-bold text-sm text-[#f7d6e8]">
            <PixelSparkle className="w-3.5 h-3.5 text-[#ff8ecb]" />
            <span>编辑资料</span>
          </div>
          {/* 右侧空位保持居中对称 */}
          <div className="w-8"></div>
        </div>

        {/* 资料编辑表单滚动区 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 1. 顶部可更换横幅封面预览 */}
          <div
            onClick={() => setIsBannerPickerOpen(true)}
            style={getBannerStyle(formData.banner)}
            className="relative h-28 rounded-2xl overflow-hidden border-2 border-[#3b2a5a] group shadow-md cursor-pointer"
          >
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsBannerPickerOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-full bg-[#1e1328]/90 border border-[#d88fbf] text-xs font-bold text-[#ff8ecb] hover:bg-[#2b183a] cursor-pointer flex items-center gap-1.5 shadow-md jelly-btn"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>更换封面横幅 / 背景</span>
              </button>
            </div>
          </div>

          {/* 2. 头像修改 */}
          <div className="flex items-center gap-4 p-3 bg-[#1d1226]/85 rounded-2xl border border-[#3b2a5a] shadow-sm">
            <div
              onClick={() => setIsAvatarPickerOpen(true)}
              className="relative w-16 h-16 rounded-2xl bg-gradient-to-b from-[#2e1d3d] to-[#150d1e] border-2 border-[#d88fbf] flex items-center justify-center overflow-hidden shadow-inner shrink-0 cursor-pointer group"
              title="点击更换头像"
            >
              {renderAvatarImg(formData.avatar)}
              <div className="absolute bottom-0 right-0 p-1 bg-[#ff8ecb] text-[#1a1120] rounded-tl-lg shadow-sm group-hover:scale-110 transition-transform">
                <Camera className="w-3 h-3" />
              </div>
            </div>

            <div className="flex-1 space-y-1.5">
              <div className="text-xs font-bold text-[#f7d6e8]">{formData.username || formData.name}</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAvatarPickerOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#2e1d3e] text-[11px] font-bold text-[#ff8ecb] border border-[#d88fbf]/50 hover:bg-[#3d2652] cursor-pointer flex items-center gap-1.5 jelly-btn shadow-sm"
                >
                  <Upload className="w-3 h-3" />
                  <span>选择 / 上传头像系统</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. 基础信息字段：网名、姓名、昵称分开；ID可修改 */}
          <div className="space-y-3">
            {/* 网名 (主页主显) */}
            <div>
              <div className="flex items-center justify-between text-xs text-[#b7a2d9] mb-1">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#ff8ecb]" />
                  <span className="font-bold">网名 (主页主显)</span>
                </div>
                <span className="text-[10px] text-[#ff8ecb]">主页优先展示 ✦</span>
              </div>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="小手机用户"
                className="w-full px-3 py-2 text-xs bg-[#1f132a] text-[#f7d6e8] rounded-xl border border-[#4b3670] focus:outline-none focus:border-[#ff8ecb]"
              />
            </div>

            {/* 姓名 & 昵称 分开 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-[#b7a2d9] mb-1">
                  <Smile className="w-3.5 h-3.5 text-[#d88fbf]" />
                  <span className="font-bold">姓名</span>
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="真实或人设姓名"
                  className="w-full px-3 py-2 text-xs bg-[#1f132a] text-[#f7d6e8] rounded-xl border border-[#4b3670] focus:outline-none focus:border-[#ff8ecb]"
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-xs text-[#b7a2d9] mb-1">
                  <Heart className="w-3.5 h-3.5 text-[#ff8ecb]" />
                  <span className="font-bold">昵称</span>
                </div>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  placeholder="如：软糖兔兔"
                  className="w-full px-3 py-2 text-xs bg-[#1f132a] text-[#f7d6e8] rounded-xl border border-[#4b3670] focus:outline-none focus:border-[#ff8ecb]"
                />
              </div>
            </div>

            {/* 用户 ID (可修改) & 身份 (职业改成身份) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-[#b7a2d9] mb-1">
                  <Hash className="w-3.5 h-3.5 text-[#ff8ecb]" />
                  <span className="font-bold">用户 ID (可修改)</span>
                </div>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  placeholder="123456"
                  className="w-full px-3 py-2 text-xs bg-[#1f132a] text-[#f7d6e8] rounded-xl border border-[#4b3670] focus:outline-none focus:border-[#ff8ecb]"
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-xs text-[#b7a2d9] mb-1">
                  <Briefcase className="w-3.5 h-3.5 text-[#ff8ecb]" />
                  <span className="font-bold">身份</span>
                </div>
                <input
                  type="text"
                  value={formData.identity}
                  onChange={(e) => setFormData({ ...formData, identity: e.target.value })}
                  placeholder="赛博漫游者 / 学生"
                  className="w-full px-3 py-2 text-xs bg-[#1f132a] text-[#f7d6e8] rounded-xl border border-[#4b3670] focus:outline-none focus:border-[#ff8ecb]"
                />
              </div>
            </div>

            {/* 个性签名 */}
            <div>
              <div className="flex items-center justify-between text-xs text-[#b7a2d9] mb-1">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-[#ff8ecb]" />
                  <span className="font-bold">个性签名</span>
                </div>
                <span className="text-[10px] text-[#b7a2d9]/60">{formData.bio.length}/50</span>
              </div>
              <textarea
                rows={2}
                maxLength={50}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="在小小的世界里，收集大大的喜欢 ♡"
                className="w-full px-3 py-2 text-xs bg-[#1f132a] text-[#f7d6e8] rounded-xl border border-[#4b3670] focus:outline-none focus:border-[#ff8ecb] leading-relaxed"
              ></textarea>
            </div>

            {/* 性别 & 性取向 (完全分开) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-[#b7a2d9] mb-1 font-bold">性别</div>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#1f132a] text-[#f7d6e8] rounded-xl border border-[#4b3670] focus:outline-none focus:border-[#ff8ecb]"
                >
                  <option value="女" className="bg-[#1f132a]">女</option>
                  <option value="男" className="bg-[#1f132a]">男</option>
                  <option value="魔法少女" className="bg-[#1f132a]">魔法少女</option>
                  <option value="保密" className="bg-[#1f132a]">保密</option>
                  <option value="其他" className="bg-[#1f132a]">其他</option>
                </select>
              </div>

              <div>
                <div className="flex items-center gap-1 text-xs text-[#b7a2d9] mb-1 font-bold">
                  <Compass className="w-3 h-3 text-[#ff8ecb]" />
                  <span>性取向</span>
                </div>
                <input
                  type="text"
                  value={formData.sexualOrientation}
                  onChange={(e) => setFormData({ ...formData, sexualOrientation: e.target.value })}
                  placeholder="如：泛性恋 / 异性恋 / 保密"
                  className="w-full px-3 py-2 text-xs bg-[#1f132a] text-[#f7d6e8] rounded-xl border border-[#4b3670] focus:outline-none focus:border-[#ff8ecb]"
                />
              </div>
            </div>

            {/* 生日 (已修正：支持标准字符输入与便捷日期选择，100%可修改) */}
            <div>
              <div className="flex items-center justify-between text-xs text-[#b7a2d9] mb-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Calendar className="w-3.5 h-3.5 text-[#ff8ecb]" />
                  <span>生日 (直接输入或挑选)</span>
                </div>
                <span className="text-[10px] text-[#b7a2d9]/60">格式：YYYY-MM-DD</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.birthday}
                  onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                  placeholder="2000-01-01"
                  className="flex-1 px-3 py-2 text-xs bg-[#1f132a] text-[#f7d6e8] rounded-xl border border-[#4b3670] focus:outline-none focus:border-[#ff8ecb]"
                />
                <input
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => {
                    if (e.target.value) setFormData({ ...formData, birthday: e.target.value });
                  }}
                  className="w-9 h-8 p-1 rounded-xl bg-[#2e1d3e] border border-[#d88fbf]/50 text-[#ff8ecb] cursor-pointer"
                  title="唤起系统日历"
                />
              </div>
            </div>

            {/* 地区 */}
            <div>
              <div className="flex items-center gap-1 text-xs text-[#b7a2d9] mb-1 font-bold">
                <MapPin className="w-3.5 h-3.5 text-[#ff8ecb]" />
                <span>地区</span>
              </div>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                placeholder="星辰海边缘"
                className="w-full px-3 py-2 text-xs bg-[#1f132a] text-[#f7d6e8] rounded-xl border border-[#4b3670] focus:outline-none focus:border-[#ff8ecb]"
              />
            </div>

            {/* 天气 (在地区下面：支持实时检测现实定位天气，也可自己改) */}
            <div className="p-3 bg-[#1d1226]/85 rounded-2xl border border-[#3b2a5a] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#f7d6e8]">
                  <Cloud className="w-3.5 h-3.5 text-[#ff8ecb]" />
                  <span>当地天气</span>
                </div>
                <button
                  type="button"
                  onClick={handleDetectWeather}
                  disabled={isFetchingWeather}
                  className="px-2.5 py-1 rounded-lg bg-[#2e1d3e] text-[10px] font-bold text-[#ff8ecb] border border-[#d88fbf]/50 hover:bg-[#3d2652] flex items-center gap-1 jelly-btn disabled:opacity-50"
                >
                  <RotateCw className={`w-3 h-3 ${isFetchingWeather ? 'animate-spin' : ''}`} />
                  <span>{isFetchingWeather ? '获取中...' : '✦ 实时检测定位天气'}</span>
                </button>
              </div>

              <input
                type="text"
                value={formData.weather}
                onChange={(e) => setFormData({ ...formData, weather: e.target.value })}
                placeholder="如：微风晴朗 22°C 或 阴有小雨 18°C"
                className="w-full px-3 py-2 text-xs bg-[#160d20] text-[#f7d6e8] rounded-xl border border-[#4b3670] focus:outline-none focus:border-[#ff8ecb]"
              />

              {/* 快捷天气预设微按钮 */}
              <div className="flex items-center gap-1.5 pt-0.5">
                {[
                  { label: '☀️ 晴朗 24°C', val: '晴朗 24°C' },
                  { label: '🌧️ 微雨 19°C', val: '微雨 19°C' },
                  { label: '☁️ 多云 21°C', val: '多云 21°C' },
                  { label: '❄️ 初雪 0°C', val: '初雪 0°C' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setFormData({ ...formData, weather: item.val })}
                    className="px-2 py-0.5 rounded-md bg-[#251535] text-[10px] text-[#b7a2d9] border border-[#3b2a5a] hover:text-[#ff8ecb]"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {weatherNotice && (
                <div className="text-[10px] text-[#ff8ecb] pt-0.5 animate-in fade-in">
                  {weatherNotice}
                </div>
              )}
            </div>

            {/* 现实映射地区 */}
            <div>
              <div className="flex items-center gap-1 text-xs text-[#b7a2d9] mb-1 font-bold">
                <MapPin className="w-3.5 h-3.5 text-[#d88fbf]" />
                <span>现实映射地区</span>
              </div>
              <input
                type="text"
                value={formData.realRegion}
                onChange={(e) => setFormData({ ...formData, realRegion: e.target.value })}
                placeholder="未设置"
                className="w-full px-3 py-2 text-xs bg-[#1f132a] text-[#f7d6e8] rounded-xl border border-[#4b3670] focus:outline-none focus:border-[#ff8ecb]"
              />
            </div>

            {/* 我的爱好 */}
            <div>
              <div className="text-xs text-[#b7a2d9] mb-1 font-bold">我的爱好</div>
              <textarea
                rows={2}
                value={formData.hobbies}
                onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
                placeholder="例如：收集表情包、喝草莓奶昔、听复古掌机音乐..."
                className="w-full px-3 py-2 text-xs bg-[#1f132a] text-[#f7d6e8] rounded-xl border border-[#4b3670] focus:outline-none focus:border-[#ff8ecb]"
              ></textarea>
            </div>

            {/* 人设 */}
            <div>
              <div className="flex items-center gap-1.5 text-xs text-[#b7a2d9] mb-1 font-bold">
                <BookOpen className="w-3.5 h-3.5 text-[#ff8ecb]" />
                <span>详细人设描述</span>
              </div>
              <textarea
                rows={3}
                value={formData.persona}
                onChange={(e) => setFormData({ ...formData, persona: e.target.value })}
                placeholder="Ta的性格背景故事、说话口吻与小习惯..."
                className="w-full px-3 py-2 text-xs bg-[#1f132a] text-[#f7d6e8] rounded-xl border border-[#4b3670] focus:outline-none focus:border-[#ff8ecb] leading-relaxed"
              ></textarea>
            </div>

            {/* 外貌 */}
            <div>
              <div className="text-xs text-[#b7a2d9] mb-1 font-bold">外貌特征设定</div>
              <textarea
                rows={2}
                value={formData.appearanceText}
                onChange={(e) => setFormData({ ...formData, appearanceText: e.target.value })}
                placeholder="例如：紫色水母头短发留长束、紫蓝粉渐变双瞳、地雷系穿搭..."
                className="w-full px-3 py-2 text-xs bg-[#1f132a] text-[#f7d6e8] rounded-xl border border-[#4b3670] focus:outline-none focus:border-[#ff8ecb]"
              ></textarea>
            </div>

            {/* 锁脸图 (人设卡立绘) */}
            <div>
              <div className="text-xs text-[#b7a2d9] mb-1.5 font-bold">
                锁脸图 (人设卡立绘展示)
              </div>
              <div className="p-3 bg-[#1d1226]/85 rounded-2xl border border-[#3b2a5a] flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#d88fbf] shadow-inner bg-[#150d1e] shrink-0">
                  <img
                    src={getFaceLockUrl(formData.faceLockImage)}
                    alt="锁脸图"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <label className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#2e1d3e] text-xs font-bold text-[#ff8ecb] border border-[#d88fbf]/50 hover:bg-[#3d2652] cursor-pointer jelly-btn">
                    <Upload className="w-3.5 h-3.5" />
                    <span>更换锁脸图</span>
                    <input type="file" accept="image/*" onChange={handleUploadFaceLock} className="hidden" />
                  </label>
                  <div className="text-[10px] text-[#b7a2d9]/60">
                    在个人主页作为角色人设大卡片展示
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 底部保存按钮 (保留底部全宽主按钮) */}
          <div className="pt-2 pb-5">
            <button
              onClick={handleSave}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#d88fbf] to-[#ff8ecb] text-[#1a1120] text-xs font-bold shadow-[0_4px_16px_rgba(255,142,203,0.35)] hover:opacity-90 jelly-btn"
            >
              保存资料
            </button>
          </div>
        </div>

        {/* 弹窗: 头像上传系统 */}
        <AvatarPickerModal
          currentAvatar={formData.avatar}
          isOpen={isAvatarPickerOpen}
          onClose={() => setIsAvatarPickerOpen(false)}
          onSelectAvatar={(newAvatar) => {
            setFormData((prev) => ({ ...prev, avatar: newAvatar }));
          }}
          title="更换我的个人头像"
        />

        {/* 弹窗: 背景/横幅上传系统 */}
        <BannerPickerModal
          currentBanner={formData.banner}
          isOpen={isBannerPickerOpen}
          onClose={() => setIsBannerPickerOpen(false)}
          onSelectBanner={(newBanner) => {
            setFormData((prev) => ({ ...prev, banner: newBanner }));
          }}
          title="更换个人中心背景横幅"
        />
      </div>
    );
  }

  // ==========================================
  // 2. 个人主页展示态
  // ==========================================
  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-[#180f21] via-[#120b18] to-[#0a050e] select-none text-[#f7d6e8] overflow-hidden font-mono relative">
      {/* 顶部可滚动的个人中心主页面 */}
      <div className="flex-1 overflow-y-auto pb-6">
        {/* 顶部横幅 (Banner) */}
        <div
          onClick={() => setIsBannerPickerOpen(true)}
          style={getBannerStyle(profile.banner)}
          className="relative h-44 w-full overflow-hidden cursor-pointer group"
          title="点击更换个人中心横幅背景"
        >
          {/* 顶部遮罩渐变 */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#180f21]/70 via-transparent to-[#180f21]"></div>

          {/* 顶栏操作按钮 */}
          <div className="absolute top-2 left-3 right-3 flex items-center justify-between z-10">
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-full bg-[#1e1328]/80 backdrop-blur-md border border-[#d88fbf]/60 text-[#f7d6e8] flex items-center justify-center hover:text-white jelly-btn shadow-md"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2]" />
            </button>

            {/* 更换背景横幅按钮 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsBannerPickerOpen(true);
              }}
              className="px-2.5 py-1 rounded-full bg-black/45 hover:bg-black/65 text-[#f7d6e8] hover:text-[#ff8ecb] text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-md border border-white/20 transition-all jelly-btn shadow-md"
              title="更换个人中心背景横幅"
            >
              <Camera className="w-3.5 h-3.5 text-[#ff8ecb]" />
              <span>换背景</span>
            </button>
          </div>

          {/* 横幅右下角情绪标签徽章 */}
          <div className="absolute bottom-3 right-3">
            <div className="px-3 py-1 rounded-full bg-[#1e1328]/85 backdrop-blur-md border border-[#ff8ecb] text-[10px] font-bold text-[#ff8ecb] shadow-md flex items-center gap-1 animate-pulse">
              <span>Love... ♡</span>
            </div>
          </div>
        </div>

        {/* 头像与主要信息区 */}
        <div className="px-4 -mt-10 relative z-20 space-y-3">
          <div className="flex items-end justify-between">
            {/* 头像卡片 */}
            <div className="relative">
              <div
                onClick={() => setIsAvatarPickerOpen(true)}
                className="w-20 h-20 rounded-3xl p-[2px] bg-gradient-to-tr from-[#d88fbf] via-[#3b2a5a] to-[#ff8ecb] shadow-[0_6px_24px_rgba(216,143,191,0.45)] cursor-pointer jelly-btn group"
                title="点击打开头像系统更换头像"
              >
                <div className="w-full h-full rounded-[22px] bg-[#1a1120] flex items-center justify-center overflow-hidden border border-[#5a3e75] group-hover:border-[#ff8ecb] transition-colors">
                  {renderAvatarImg(profile.avatar)}
                </div>
              </div>
              {/* 小相机更换头像入口 */}
              <button
                type="button"
                onClick={() => setIsAvatarPickerOpen(true)}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#ff8ecb] border-2 border-[#1a1120] flex items-center justify-center text-[#1a1120] cursor-pointer shadow-md hover:scale-110 transition-transform"
                title="打开头像系统更换头像"
              >
                <Camera className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>

            {/* 右侧等级与唯一保留的「编辑资料」按钮 (依照要求：只保留编辑资料) */}
            <div className="flex items-center gap-2 mb-1">
              <PixelLevelBadge level={profile.level || 'Lv.1'} />
              <button
                onClick={handleStartEdit}
                className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#2e1d3e] to-[#20132b] border border-[#d88fbf]/60 text-xs font-bold text-[#ff8ecb] hover:border-[#ff8ecb] flex items-center gap-1.5 jelly-btn shadow-sm"
              >
                <span>编辑资料</span>
              </button>
            </div>
          </div>

          {/* 用户网名、ID 与在线胶囊 (一般主页都显示网名) */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[#f7d6e8]">
                {profile.username || profile.nickname || profile.name || '未设置网名'}
              </span>
              <PixelHeart className="w-4 h-4 text-[#ff8ecb]" />
            </div>

            <div className="flex items-center gap-2 text-[10px] text-[#b7a2d9]">
              <span>ID: {profile.id || '123456'}</span>
              <span className="w-1 h-1 rounded-full bg-[#d88fbf]/60"></span>
              <span className="px-2 py-0.5 rounded-full bg-[#2a1738] border border-[#ff8ecb]/40 text-[#ff8ecb] flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>{profile.status || '在线'}</span>
              </span>
            </div>

            {/* 个性签名 */}
            <p className="text-xs text-[#f7d6e8] leading-relaxed pt-1 font-medium">
              {profile.bio || <span className="text-[#b7a2d9]/40 italic">未填写个性签名...</span>}
            </p>
          </div>

          {/* 装饰飘落微元素 */}
          <div className="flex items-center justify-between text-[#ff8ecb]/50 pt-1 pointer-events-none">
            <PixelSparkle className="w-3 h-3" />
            <PixelBow className="w-4 h-4" />
            <PixelSparkle className="w-3 h-3" />
          </div>

          {/* 人设锁脸大插图卡片 */}
          <div className="relative rounded-3xl overflow-hidden border-2 border-[#d88fbf]/60 shadow-[0_8px_28px_rgba(0,0,0,0.7)] group">
            <div className="aspect-[4/3] w-full bg-[#180e22]">
              <img
                src={getFaceLockUrl(profile.faceLockImage)}
                alt="人设形象"
                className="w-full h-full object-cover"
              />
            </div>
            {/* 萌系浮层标签 */}
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between pointer-events-none">
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#1a1120]/80 backdrop-blur-md border border-[#ff8ecb]/50 text-[#ff8ecb] font-bold">
                ✦ 专属形象卡
              </span>
              <div className="flex items-center gap-1">
                <PixelBunny className="w-6 h-6 drop-shadow-md" />
              </div>
            </div>
          </div>

          {/* 「我的介绍:」详细卡片区 (依照要求：已去除后面的图标和加号功能) */}
          <div className="bg-[#1e1329]/85 rounded-3xl border border-[#3b2a5a] p-4 space-y-3.5 shadow-md">
            <div className="border-b border-[#3b2a5a]/60 pb-2">
              <span className="text-xs font-bold text-[#f7d6e8]">我的介绍:</span>
            </div>

            {/* 属性网格一览 (依照要求：网名、姓名、昵称、身份、性别、性取向、生日、地区、天气) */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#160d20] border border-[#3b2a5a]/60">
                <div className="text-[10px] text-[#ff8ecb] font-medium">网名 (主显)</div>
                <div className="font-bold text-[#f7d6e8] mt-0.5 truncate">{profile.username || '未设置'}</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#160d20] border border-[#3b2a5a]/60">
                <div className="text-[10px] text-[#b7a2d9]">姓名</div>
                <div className="font-bold text-[#f7d6e8] mt-0.5 truncate">{profile.name || '未设置'}</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#160d20] border border-[#3b2a5a]/60">
                <div className="text-[10px] text-[#b7a2d9]">昵称</div>
                <div className="font-bold text-[#f7d6e8] mt-0.5 truncate">{profile.nickname || '未设置'}</div>
              </div>

              {/* 职业身份改成只有身份 */}
              <div className="p-2.5 rounded-xl bg-[#160d20] border border-[#3b2a5a]/60">
                <div className="text-[10px] text-[#b7a2d9]">身份</div>
                <div className="font-bold text-[#f7d6e8] mt-0.5 truncate">{profile.identity || (profile as any).occupation || '未设置'}</div>
              </div>

              {/* 性别设定改成只有性别 */}
              <div className="p-2.5 rounded-xl bg-[#160d20] border border-[#3b2a5a]/60">
                <div className="text-[10px] text-[#b7a2d9]">性别</div>
                <div className="font-bold text-[#f7d6e8] mt-0.5 truncate">{profile.gender || '未设置'}</div>
              </div>

              {/* 性取向 (与性别分开展示) */}
              <div className="p-2.5 rounded-xl bg-[#160d20] border border-[#3b2a5a]/60">
                <div className="text-[10px] text-[#b7a2d9]">性取向</div>
                <div className="font-bold text-[#f7d6e8] mt-0.5 truncate">{profile.sexualOrientation || '未设置'}</div>
              </div>

              {/* 生日 */}
              <div className="p-2.5 rounded-xl bg-[#160d20] border border-[#3b2a5a]/60">
                <div className="text-[10px] text-[#b7a2d9]">生日</div>
                <div className="font-bold text-[#f7d6e8] mt-0.5 truncate">{profile.birthday || '未设置'}</div>
              </div>

              {/* 常驻地区 */}
              <div className="p-2.5 rounded-xl bg-[#160d20] border border-[#3b2a5a]/60">
                <div className="text-[10px] text-[#b7a2d9]">常驻地区</div>
                <div className="font-bold text-[#f7d6e8] mt-0.5 truncate">{profile.region || '未设置'}</div>
              </div>

              {/* 当地天气 (在地区下面) */}
              <div className="p-2.5 rounded-xl bg-[#160d20] border border-[#3b2a5a]/60">
                <div className="text-[10px] text-[#ff8ecb] flex items-center gap-1 font-bold">
                  <Cloud className="w-2.5 h-2.5" />
                  <span>当地天气</span>
                </div>
                <div className="font-bold text-[#f7d6e8] mt-0.5 truncate">{profile.weather || '未设置'}</div>
              </div>
            </div>

            {/* 现实映射地区 (如有) */}
            {profile.realRegion && profile.realRegion !== '未设置' && (
              <div className="p-2.5 rounded-xl bg-[#160d20] border border-[#3b2a5a]/60 text-xs">
                <div className="text-[10px] text-[#b7a2d9]">现实映射地区</div>
                <div className="font-bold text-[#f7d6e8] mt-0.5">{profile.realRegion}</div>
              </div>
            )}

            {/* 我的爱好 */}
            <div className="p-3 rounded-xl bg-[#160d20] border border-[#3b2a5a]/60 space-y-1">
              <div className="text-[10px] text-[#ff8ecb] font-bold">♥ 我的爱好</div>
              <div className="text-xs text-[#f7d6e8] leading-relaxed">
                {profile.hobbies || <span className="text-[#b7a2d9]/40 italic">未填写</span>}
              </div>
            </div>

            {/* 详细人设 */}
            <div className="p-3 rounded-xl bg-[#160d20] border border-[#3b2a5a]/60 space-y-1">
              <div className="text-[10px] text-[#ff8ecb] font-bold">✦ 人设背景</div>
              <div className="text-xs text-[#f7d6e8] leading-relaxed">
                {profile.persona || <span className="text-[#b7a2d9]/40 italic">未设定</span>}
              </div>
            </div>

            {/* 外貌设定 */}
            <div className="p-3 rounded-xl bg-[#160d20] border border-[#3b2a5a]/60 space-y-1">
              <div className="text-[10px] text-[#ff8ecb] font-bold">✿ 外貌设定</div>
              <div className="text-xs text-[#f7d6e8] leading-relaxed">
                {profile.appearanceText || <span className="text-[#b7a2d9]/40 italic">未设定</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 弹窗: 头像上传系统 (直接同步至QQ) */}
      <AvatarPickerModal
        currentAvatar={profile.avatar}
        isOpen={isAvatarPickerOpen}
        onClose={() => setIsAvatarPickerOpen(false)}
        onSelectAvatar={(newAvatar) => {
          setFormData((prev) => ({ ...prev, avatar: newAvatar }));
          onSaveProfile({ ...profile, avatar: newAvatar });
        }}
        title="更换我的个人头像"
      />

      {/* 弹窗: 背景/横幅上传系统 (与QQ空间独立不同步) */}
      <BannerPickerModal
        currentBanner={profile.banner}
        isOpen={isBannerPickerOpen}
        onClose={() => setIsBannerPickerOpen(false)}
        onSelectBanner={(newBanner) => {
          setFormData((prev) => ({ ...prev, banner: newBanner }));
          onSaveProfile({ ...profile, banner: newBanner });
        }}
        title="更换个人中心背景横幅"
      />
    </div>
  );
};
