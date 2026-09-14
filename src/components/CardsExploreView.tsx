import React, { useState } from 'react';
import { PracticeCard } from '../types';
import { PracticeCardComponent } from './PracticeCardComponent';
import { Sparkles, ArrowRight, Heart, Users, MessageCircle, ShieldCheck, Flame } from 'lucide-react';
import { playTapSound } from '../utils/sound';

interface CardsExploreViewProps {
  cards: PracticeCard[];
  onOpenCardDetail: (card: PracticeCard) => void;
  onGoToVote: () => void;
  onGoToPledgeWithCard?: (card: PracticeCard) => void;
}

export const CardsExploreView: React.FC<CardsExploreViewProps> = ({
  cards,
  onOpenCardDetail,
  onGoToVote,
  onGoToPledgeWithCard,
}) => {
  const [filterPower, setFilterPower] = useState<string>('all');

  const powerFilters = [
    { id: 'all', label: '전체 (8개)', icon: Sparkles },
    { id: '공감', label: '공감의 힘', icon: Heart },
    { id: '존중', label: '존중의 힘', icon: Users },
    { id: '의사소통', label: '의사소통의 힘', icon: MessageCircle },
    { id: '신뢰책임', label: '신뢰·책임의 힘', icon: ShieldCheck },
    { id: '용기협력', label: '용기·협력의 힘', icon: Flame },
  ];

  const filteredCards = cards.filter((c) => {
    if (filterPower === 'all') return true;
    if (filterPower === '공감') return c.badges.some((b) => b.label.includes('공감'));
    if (filterPower === '존중') return c.badges.some((b) => b.label.includes('존중'));
    if (filterPower === '의사소통') return c.badges.some((b) => b.label.includes('의사소통'));
    if (filterPower === '신뢰책임') return c.badges.some((b) => b.label.includes('신뢰') || b.label.includes('책임'));
    if (filterPower === '용기협력') return c.badges.some((b) => b.label.includes('용기') || b.label.includes('협력'));
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Introduction Hero Card */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold mb-3">
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>2026 전국 교찾희 참여 친구들이 보내 온 약속</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-jua leading-tight">
            교실에서 찾은 희망 8대 실천 카드
          </h2>
          <p className="text-amber-100 text-sm sm:text-base mt-2 font-dodum leading-relaxed">
            전국의 친구들이 직접 적어 보낸 8가지 약속 카드입니다.
            각 카드를 전자칠판에서 터치하여 어떤 따뜻한 힘이 담겨 있는지 함께 읽고 생각해 보세요!
          </p>
        </div>

        <button
          onClick={() => {
            playTapSound();
            onGoToVote();
          }}
          className="px-6 py-4 bg-white hover:bg-amber-50 text-orange-600 rounded-2xl font-black text-base shadow-xl flex items-center gap-2 transition-transform active:scale-95 flex-shrink-0 font-jua"
        >
          <span>우리 반 투표 시작하기</span>
          <ArrowRight className="w-5 h-5 text-orange-600" />
        </button>
      </div>

      {/* Filter Category Tabs for Classroom Blackboard */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {powerFilters.map((f) => {
          const Icon = f.icon;
          const isActive = filterPower === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                playTapSound();
                setFilterPower(f.id);
              }}
              className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all select-none whitespace-nowrap active:scale-95 ${
                isActive
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-amber-50 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>

      {/* 8 Cards Display Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredCards.map((card) => (
          <PracticeCardComponent
            key={card.id}
            card={card}
            onOpenDetail={() => onOpenDetailCard(card)}
          />
        ))}
      </div>

      {/* Bottom Guidance Banner */}
      <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h4 className="text-lg font-black text-slate-900 font-jua">
            마음에 와닿는 실천 약속을 정하셨나요?
          </h4>
          <p className="text-slate-600 text-xs sm:text-sm mt-0.5 font-dodum">
            이제 [우리 반 투표]로 이동하여 4학년 친구들과 함께 1가지를 정하고 손도장으로 다짐해 보세요.
          </p>
        </div>

        <button
          onClick={() => {
            playTapSound();
            onGoToVote();
          }}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm shadow transition-transform active:scale-95 font-jua"
        >
          투표하러 가기 →
        </button>
      </div>
    </div>
  );

  function onOpenDetailCard(card: PracticeCard) {
    onOpenCardDetail(card);
  }
};
