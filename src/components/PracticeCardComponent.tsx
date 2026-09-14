import React from 'react';
import { PracticeCard } from '../types';
import { CardBadges } from './CardBadges';
import { Sparkles, Volume2, CheckCircle2, HeartHandshake } from 'lucide-react';
import { playTapSound } from '../utils/sound';

interface PracticeCardProps {
  card: PracticeCard;
  isSelected?: boolean;
  onSelect?: (card: PracticeCard) => void;
  onOpenDetail?: (card: PracticeCard) => void;
  voteCount?: number;
  totalVotes?: number;
  isVotingMode?: boolean;
  rank?: number;
  highlightBest?: boolean;
}

export const PracticeCardComponent: React.FC<PracticeCardProps> = ({
  card,
  isSelected,
  onSelect,
  onOpenDetail,
  voteCount = 0,
  totalVotes = 0,
  isVotingMode = false,
  rank,
  highlightBest = false,
}) => {
  const votePercentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTapSound();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = `${card.title}. ${card.description}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCardClick = () => {
    playTapSound();
    if (onSelect) {
      onSelect(card);
    } else if (onOpenDetail) {
      onOpenDetail(card);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex flex-col rounded-3xl p-4 sm:p-5 text-left transition-all duration-300 cursor-pointer select-none ${
        isSelected
          ? 'ring-4 ring-orange-500 shadow-2xl scale-[1.02] bg-gradient-to-b from-[#FFAE00] to-[#E58A00]'
          : 'bg-gradient-to-b from-[#FFB800] via-[#FBA800] to-[#E99600] shadow-lg hover:shadow-2xl hover:-translate-y-1'
      } ${highlightBest ? 'ring-4 ring-amber-400 animate-pulse' : ''}`}
      style={{
        boxShadow: isSelected
          ? '0 20px 30px -10px rgba(234, 88, 12, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.5)'
          : '0 12px 24px -8px rgba(217, 119, 6, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.4)'
      }}
    >
      {/* Background Decorative Pattern */}
      <div className="absolute top-3 right-3 text-amber-200/40 pointer-events-none">
        <Sparkles className="w-8 h-8" />
      </div>
      <div className="absolute top-8 left-3 w-12 h-12 rounded-full border-4 border-white/20 pointer-events-none" />
      <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-amber-400/20 pointer-events-none" />

      {/* Top Banner */}
      <div className="relative z-10 text-center mb-3">
        <span className="inline-block text-amber-100 font-black text-sm tracking-wider drop-shadow-sm font-jua">
          2026
        </span>
        <h4 className="text-amber-950 font-black text-base sm:text-lg leading-tight tracking-tight mt-0.5">
          전국 교찾희 참여<br />
          <span className="text-amber-900 font-extrabold text-sm sm:text-base">친구들이 보내 온 약속</span>
        </h4>
      </div>

      {/* Main White Content Container */}
      <div className="relative z-10 bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-amber-100/80 flex flex-col justify-between min-h-[220px] transition-transform group-hover:scale-[1.01]">
        {/* Title */}
        <div className="text-center pt-2 pb-3">
          <h3 className="text-2xl sm:text-[26px] font-black text-slate-900 leading-snug tracking-tight font-jua">
            {card.title}
          </h3>
        </div>

        {/* Description Bubble */}
        <div className="bg-[#FFF5E5] rounded-xl p-3 sm:p-4 text-center border border-amber-200/60 mt-auto">
          <p className="text-slate-800 text-sm sm:text-[15px] font-semibold leading-relaxed whitespace-pre-line font-dodum">
            {card.description}
          </p>
        </div>

        {/* Corner Power Badges (overlapping authentic badge look) */}
        <div className="absolute -bottom-4 right-2 z-20">
          <CardBadges badges={card.badges} size="md" />
        </div>
      </div>

      {/* Card Footer: World Vision Campaign mark */}
      <div className="relative z-10 mt-5 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          {/* World Vision Logo Icon */}
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md border border-amber-200">
            <span className="text-orange-600 font-black text-xs">+W</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-amber-950/70 tracking-tight leading-none">
              월드비전
            </span>
            <span className="text-[13px] font-black text-amber-950 tracking-tight leading-tight font-jua">
              교실에서 찾은 희망
            </span>
          </div>
        </div>

        {/* Read aloud icon button */}
        <button
          type="button"
          onClick={handleSpeak}
          title="소리 내어 읽어주기"
          className="w-9 h-9 rounded-full bg-white/80 hover:bg-white text-amber-900 flex items-center justify-center shadow transition-transform active:scale-95"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      {/* Voting Mode Overlay / Stats Bar */}
      {isVotingMode && (
        <div className="mt-3 pt-3 border-t border-amber-400/40 relative z-10">
          <div className="flex items-center justify-between text-xs font-black text-amber-950 mb-1">
            <span className="flex items-center gap-1">
              {rank && (
                <span className={`px-2 py-0.5 rounded-full text-white text-[11px] ${
                  rank === 1 ? 'bg-red-500 font-bold' : rank === 2 ? 'bg-blue-600' : 'bg-slate-700'
                }`}>
                  {rank}위
                </span>
              )}
              <span>득표수</span>
            </span>
            <span className="text-sm font-black text-amber-950">
              {voteCount}표 <span className="text-xs text-amber-900 font-normal">({votePercentage}%)</span>
            </span>
          </div>
          {/* Vote percentage bar */}
          <div className="w-full bg-amber-200/80 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className="bg-amber-800 h-full rounded-full transition-all duration-500"
              style={{ width: `${votePercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-2 left-2 z-30 bg-orange-600 text-white rounded-full p-1 shadow-lg animate-bounce">
          <CheckCircle2 className="w-6 h-6 fill-white text-orange-600" />
        </div>
      )}

      {/* Card detail peek button */}
      {onOpenDetail && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            playTapSound();
            onOpenDetail(card);
          }}
          className="mt-3 w-full py-2 bg-white/90 hover:bg-white text-amber-950 font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all hover:shadow text-center flex items-center justify-center gap-1.5 active:scale-98"
        >
          <HeartHandshake className="w-4 h-4 text-orange-500" />
          <span>실천 방법 & 생각 나누기</span>
        </button>
      )}
    </div>
  );
};
