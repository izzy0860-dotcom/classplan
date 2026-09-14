import React from 'react';
import { PracticeCard } from '../types';
import { CardBadges } from './CardBadges';
import { X, Volume2, Sparkles, HelpCircle, Check, ArrowRight } from 'lucide-react';
import { playTapSound } from '../utils/sound';

interface CardDetailModalProps {
  card: PracticeCard | null;
  onClose: () => void;
  onSelectForVote?: (card: PracticeCard) => void;
  onSelectForPledge?: (card: PracticeCard) => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  onClose,
  onSelectForVote,
  onSelectForPledge,
}) => {
  if (!card) return null;

  const handleSpeak = () => {
    playTapSound();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = `${card.title}. ${card.description}. 실천 다짐 예시: ${card.classroomExamples.join(', ')}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-amber-300 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#FFB800] via-[#FFAE00] to-[#E99600] p-6 text-center relative">
          <button
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="absolute top-4 right-4 w-11 h-11 bg-white/80 hover:bg-white text-slate-800 rounded-full flex items-center justify-center shadow transition-transform active:scale-95 z-20"
            aria-label="닫기"
          >
            <X className="w-6 h-6" />
          </button>

          <span className="inline-block bg-white/25 text-amber-950 px-3 py-0.5 rounded-full text-xs font-bold mb-2">
            2026 전국 교찾희 참여 친구들이 보내 온 약속
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-amber-950 font-jua">
            {card.title}
          </h2>

          <div className="mt-3 flex justify-center">
            <CardBadges badges={card.badges} size="lg" />
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Card core message box */}
          <div className="bg-amber-50 rounded-2xl p-5 border-2 border-amber-200/80 text-center relative">
            <p className="text-lg sm:text-xl font-bold text-amber-950 font-dodum leading-relaxed whitespace-pre-line">
              {card.description}
            </p>
            <button
              onClick={handleSpeak}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm shadow transition-transform active:scale-95"
            >
              <Volume2 className="w-4 h-4" />
              <span>함께 소리 내어 읽기</span>
            </button>
          </div>

          {/* Classroom Reflection Question */}
          <div className="bg-sky-50 rounded-2xl p-5 border border-sky-200">
            <div className="flex items-center gap-2 text-sky-800 font-bold mb-2">
              <HelpCircle className="w-5 h-5 text-sky-600" />
              <h4 className="text-base font-extrabold font-jua">우리 반 함께 생각하기</h4>
            </div>
            <p className="text-slate-800 font-medium leading-relaxed font-dodum">
              {card.reflectionQuestion}
            </p>
          </div>

          {/* Practical Examples for 4th graders */}
          <div>
            <div className="flex items-center gap-2 text-amber-900 font-bold mb-3">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h4 className="text-base font-extrabold font-jua">교실에서 실천하는 멋진 행동 3가지</h4>
            </div>
            <div className="space-y-2">
              {card.classroomExamples.map((ex, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80"
                >
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex-shrink-0 flex items-center justify-center font-bold text-xs mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-slate-700 text-sm font-semibold leading-relaxed">
                    {ex}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-3 justify-end items-center">
          <button
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm"
          >
            닫기
          </button>

          {onSelectForVote && (
            <button
              onClick={() => {
                playTapSound();
                onSelectForVote(card);
                onClose();
              }}
              className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow flex items-center gap-2 transition-transform active:scale-95 font-jua"
            >
              <Check className="w-4 h-4" />
              <span>이 실천 약속에 투표하기</span>
            </button>
          )}

          {onSelectForPledge && (
            <button
              onClick={() => {
                playTapSound();
                onSelectForPledge(card);
                onClose();
              }}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow flex items-center gap-2 transition-transform active:scale-95 font-jua"
            >
              <span>손도장 다짐 쓰러 가기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
