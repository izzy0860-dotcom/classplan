import React, { useState } from 'react';
import { ActiveTab } from '../types';
import { LayoutGrid, Vote, Hand, TreeDeciduous, Volume2, VolumeX, Maximize2, Minimize2, Edit3, Check, FileSpreadsheet } from 'lucide-react';
import { playTapSound, setSoundEnabled, getSoundEnabled } from '../utils/sound';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  classTitle: string;
  onChangeClassTitle: (newTitle: string) => void;
  onFillSampleData: () => void;
  onResetAllData: () => void;
  onOpenGoogleSheetsModal: () => void;
  isGoogleSheetsConnected: boolean;
  totalVotesCount: number;
  totalPledgesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  classTitle,
  onChangeClassTitle,
  onFillSampleData,
  onResetAllData,
  onOpenGoogleSheetsModal,
  isGoogleSheetsConnected,
  totalVotesCount,
  totalPledgesCount,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(classTitle);
  const [soundOn, setSoundOn] = useState(getSoundEnabled());
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleSound = () => {
    const nextState = !soundOn;
    setSoundOn(nextState);
    setSoundEnabled(nextState);
    if (nextState) playTapSound();
  };

  const toggleFullscreen = () => {
    playTapSound();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const handleSaveTitle = (e: React.FormEvent) => {
    e.preventDefault();
    playTapSound();
    if (tempTitle.trim()) {
      onChangeClassTitle(tempTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const tabs = [
    { id: 'cards', label: '1. 8대 실천 카드', icon: LayoutGrid, desc: '카드를 터치해 읽어봐요' },
    { id: 'vote', label: '2. 우리 반 투표', icon: Vote, desc: '2학기 약속 1가지 정하기', badge: totalVotesCount > 0 ? `${totalVotesCount}표` : undefined },
    { id: 'pledge', label: '3. 손도장 다짐 쓰기', icon: Hand, desc: '손도장 쾅! 다짐 작성', badge: totalPledgesCount > 0 ? `${totalPledgesCount}명` : undefined },
    { id: 'wall', label: '4. 다짐 나무 & 서약서', icon: TreeDeciduous, desc: '명예의 전당 & 인쇄' },
  ];

  return (
    <header className="no-print bg-white/90 backdrop-blur-md border-b border-amber-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* Top Tier: Logo, Class Title, Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Campaign Branding & Class Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-md text-white font-black text-lg font-jua">
              희망
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/60">
                  월드비전 교실에서 찾은 희망
                </span>
              </div>

              {isEditingTitle ? (
                <form onSubmit={handleSaveTitle} className="flex items-center gap-1.5 mt-0.5">
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    autoFocus
                    className="px-2 py-0.5 text-lg font-black text-slate-900 border-2 border-amber-400 rounded-lg focus:outline-none font-jua"
                  />
                  <button
                    type="submit"
                    className="p-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div
                  onClick={() => setIsEditingTitle(true)}
                  className="flex items-center gap-1.5 cursor-pointer group mt-0.5"
                  title="학급명 변경하기"
                >
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-jua tracking-tight group-hover:text-amber-600 transition-colors">
                    {classTitle}
                  </h1>
                  <Edit3 className="w-4 h-4 text-slate-400 group-hover:text-amber-500" />
                </div>
              )}
            </div>
          </div>

          {/* Electronic Board Controls */}
          <div className="flex items-center gap-2">
            {/* Sound Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              className={`p-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all ${
                soundOn
                  ? 'bg-amber-100/70 border-amber-300 text-amber-900'
                  : 'bg-slate-100 border-slate-200 text-slate-500'
              }`}
              title={soundOn ? '효과음 끄기' : '효과음 켜기'}
            >
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{soundOn ? '소리 켬' : '소리 끔'}</span>
            </button>

            {/* Fullscreen Button for Whiteboard */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all"
              title="전자칠판 전체화면"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="hidden sm:inline">전체화면</span>
            </button>

            {/* Google Sheets Sync Button */}
            <button
              type="button"
              onClick={() => {
                playTapSound();
                onOpenGoogleSheetsModal();
              }}
              className={`px-3 py-2 border rounded-xl text-xs font-bold font-jua flex items-center gap-1.5 transition-all shadow-xs active:scale-95 ${
                isGoogleSheetsConnected
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
              }`}
              title="구글 스프레드시트(액셀) 실시간 연동"
            >
              <FileSpreadsheet className={`w-4 h-4 ${isGoogleSheetsConnected ? 'text-emerald-600' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">구글 시트 연동</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isGoogleSheetsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                }`}
              />
            </button>

            {/* Demo Teacher Helpers */}
            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

            <button
              type="button"
              onClick={() => {
                playTapSound();
                onFillSampleData();
              }}
              className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-all active:scale-95"
              title="시연용 샘플 학생 20명 채우기"
            >
              샘플 20명 채우기
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('모든 투표와 손도장 서약 데이터를 초기화하시겠습니까?')) {
                  onResetAllData();
                }
              }}
              className="px-2.5 py-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold"
              title="전체 초기화"
            >
              초기화
            </button>
          </div>
        </div>

        {/* Bottom Tier: Electronic Whiteboard Touch Nav Tabs */}
        <nav className="flex items-center gap-2 pt-3 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  playTapSound();
                  onTabChange(tab.id as ActiveTab);
                }}
                className={`flex-1 min-w-[170px] py-3 px-4 rounded-2xl font-black text-sm transition-all duration-200 flex items-center justify-between border-2 active:scale-98 select-none ${
                  isActive
                    ? 'bg-amber-500 border-amber-600 text-white shadow-lg scale-[1.02]'
                    : 'bg-white hover:bg-amber-50/70 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isActive ? 'bg-white/25 text-white' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-left leading-tight">
                    <div className="font-jua text-base sm:text-[15px]">{tab.label}</div>
                    <div
                      className={`text-[11px] font-medium font-dodum ${
                        isActive ? 'text-amber-100' : 'text-slate-400'
                      }`}
                    >
                      {tab.desc}
                    </div>
                  </div>
                </div>

                {tab.badge && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ml-1 ${
                      isActive ? 'bg-white text-amber-700' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
