import React, { useState } from 'react';
import { PracticeCard, StudentVote } from '../types';
import { PracticeCardComponent } from './PracticeCardComponent';
import confetti from 'canvas-confetti';
import { playVoteSuccessSound, playFanfareSound, playTapSound } from '../utils/sound';
import { CheckCircle, Trophy, Eye, EyeOff, Sparkles, UserCheck, RotateCcw, ArrowRight } from 'lucide-react';

interface VotingBoardProps {
  cards: PracticeCard[];
  votes: StudentVote[];
  onAddVote: (studentNumber: number, studentName: string, cardId: number) => void;
  onResetVotes: () => void;
  selectedClassCardId: number | null;
  onSelectClassPromise: (cardId: number) => void;
  onGoToPledge: () => void;
  onOpenCardDetail: (card: PracticeCard) => void;
  totalStudentsCount?: number;
}

export const VotingBoard: React.FC<VotingBoardProps> = ({
  cards,
  votes,
  onAddVote,
  onResetVotes,
  selectedClassCardId,
  onSelectClassPromise,
  onGoToPledge,
  onOpenCardDetail,
  totalStudentsCount = 21,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [currentStudentNum, setCurrentStudentNum] = useState<number>(1);
  const [studentName, setStudentName] = useState<string>('');
  const [showLiveResults, setShowLiveResults] = useState<boolean>(true);
  const [voteSubmittedSuccess, setVoteSubmittedSuccess] = useState<boolean>(false);

  // Map of which student numbers voted
  const votedStudentNums = new Set(votes.map((v) => v.studentNumber));

  // Count votes per card
  const voteCounts: Record<number, number> = {};
  cards.forEach((c) => {
    voteCounts[c.id] = 0;
  });
  votes.forEach((v) => {
    voteCounts[v.cardId] = (voteCounts[v.cardId] || 0) + 1;
  });

  // Calculate ranks
  const sortedCards = [...cards].sort((a, b) => (voteCounts[b.id] || 0) - (voteCounts[a.id] || 0));
  const cardRanks: Record<number, number> = {};
  sortedCards.forEach((c, index) => {
    cardRanks[c.id] = index + 1;
  });

  const leadingCard = sortedCards[0];
  const maxVotes = voteCounts[leadingCard?.id] || 0;

  const handleCastVote = () => {
    if (!selectedCardId) return;

    const nameToUse = studentName.trim() || `${currentStudentNum}번 학생`;
    onAddVote(currentStudentNum, nameToUse, selectedCardId);
    playVoteSuccessSound();

    // Small celebratory confetti
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });

    setVoteSubmittedSuccess(true);
    setTimeout(() => {
      setVoteSubmittedSuccess(false);
      // Auto advance to next non-voted student number
      let nextNum = currentStudentNum + 1;
      while (nextNum <= totalStudentsCount && votedStudentNums.has(nextNum)) {
        nextNum++;
      }
      if (nextNum <= totalStudentsCount) {
        setCurrentStudentNum(nextNum);
      }
      setStudentName('');
      setSelectedCardId(null);
    }, 1200);
  };

  const handleFinalizePromise = (cardId: number) => {
    onSelectClassPromise(cardId);
    playFanfareSound();
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 }
    });
  };

  const chosenCard = cards.find((c) => c.id === selectedClassCardId);

  return (
    <div className="space-y-8">
      {/* Top Banner Notice for Classroom Touchboard */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>전자칠판 참여형 실천 약속 투표</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-jua leading-tight">
            우리 반이 2학기에 실천할 약속 1가지를 골라주세요!
          </h2>
          <p className="text-amber-100 text-sm mt-1 font-dodum">
            카드를 터치하여 선택한 후 [투표하기]를 누르면 우리 반 투표함에 쏙 들어갑니다.
          </p>
        </div>

        {/* Voting Progress Stats */}
        <div className="flex items-center gap-4 bg-white/15 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
          <div className="text-center">
            <span className="text-xs text-amber-200 block font-bold">투표한 친구</span>
            <span className="text-2xl font-black font-jua">
              {votes.length} / {totalStudentsCount}명
            </span>
          </div>
          <div className="h-8 w-px bg-white/30" />
          <button
            onClick={() => {
              playTapSound();
              setShowLiveResults(!showLiveResults);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-transform active:scale-95"
            title={showLiveResults ? '실시간 집계 숨기기' : '실시간 집계 보기'}
          >
            {showLiveResults ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>{showLiveResults ? '결과 공개 중' : '비밀 투표'}</span>
          </button>
        </div>
      </div>

      {/* Confirmed Class Promise Banner if finalized */}
      {chosenCard && (
        <div className="bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 text-white rounded-3xl p-6 shadow-xl border-4 border-emerald-300 animate-in fade-in zoom-in-95 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shadow-lg font-black text-2xl flex-shrink-0">
              <Trophy className="w-9 h-9 text-amber-500" />
            </div>
            <div>
              <span className="inline-block px-3 py-0.5 bg-white/20 rounded-full text-xs font-bold mb-1">
                🎉 우리 반 2학기 최종 확정 실천 약속
              </span>
              <h3 className="text-2xl sm:text-3xl font-black font-jua">
                &ldquo;{chosenCard.title}&rdquo;
              </h3>
              <p className="text-emerald-100 text-sm mt-0.5 font-dodum">
                {chosenCard.description.replace('\n', ' ')}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playTapSound();
              onGoToPledge();
            }}
            className="px-6 py-4 bg-white hover:bg-amber-50 text-emerald-800 rounded-2xl font-black text-base shadow-xl flex items-center gap-2 transition-transform active:scale-95 flex-shrink-0 font-jua"
          >
            <span>손도장 서약 작성하기</span>
            <ArrowRight className="w-5 h-5 text-emerald-600" />
          </button>
        </div>
      )}

      {/* Student Turn Selector (Electronic Whiteboard Touch Bar) */}
      <div className="bg-white rounded-3xl p-6 shadow-md border border-amber-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              TOUCH & VOTE
            </span>
            <h3 className="text-xl font-black text-slate-900 font-jua flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-amber-500" />
              <span>누가 투표할 차례인가요? (번호 또는 이름을 터치하세요)</span>
            </h3>
          </div>

          {/* Optional Name input */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="이름 입력 (선택)"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="px-4 py-2.5 rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none text-sm font-semibold w-full md:w-40"
            />
          </div>
        </div>

        {/* Student Number Buttons Grid (1 ~ 25) */}
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
          {Array.from({ length: totalStudentsCount }, (_, i) => i + 1).map((num) => {
            const hasVoted = votedStudentNums.has(num);
            const isCurrent = currentStudentNum === num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => {
                  playTapSound();
                  setCurrentStudentNum(num);
                }}
                className={`py-2.5 px-1 rounded-xl text-center font-bold text-sm transition-all duration-200 flex flex-col items-center justify-center relative active:scale-95 ${
                  isCurrent
                    ? 'bg-amber-500 text-white shadow-lg ring-2 ring-amber-600 scale-105'
                    : hasVoted
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-100 text-slate-700 hover:bg-amber-100 border border-slate-200'
                }`}
              >
                <span>{num}번</span>
                {hasVoted && (
                  <span className="text-[10px] text-emerald-700 font-extrabold flex items-center leading-none mt-0.5">
                    완료 ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 8 Practice Cards Touch Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-jua">
              8가지 실천 약속 카드
            </h3>
            <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-bold">
              터치하여 선택
            </span>
          </div>

          {selectedCardId && (
            <div className="text-sm font-extrabold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200 animate-pulse">
              선택됨: &ldquo;{cards.find((c) => c.id === selectedCardId)?.title}&rdquo;
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {cards.map((card) => {
            const isSelected = selectedCardId === card.id;
            const voteCount = voteCounts[card.id] || 0;
            const rank = cardRanks[card.id];
            const isTopVote = showLiveResults && maxVotes > 0 && voteCount === maxVotes;

            return (
              <div key={card.id} className="relative">
                <PracticeCardComponent
                  card={card}
                  isSelected={isSelected}
                  onSelect={() => {
                    playTapSound();
                    setSelectedCardId(card.id);
                  }}
                  onOpenDetail={() => onOpenDetailCard(card)}
                  voteCount={showLiveResults ? voteCount : undefined}
                  totalVotes={showLiveResults ? votes.length : undefined}
                  isVotingMode={showLiveResults}
                  rank={showLiveResults && voteCount > 0 ? rank : undefined}
                  highlightBest={isTopVote}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating or Fixed Bottom Vote Confirmation Action Bar */}
      <div className="sticky bottom-4 z-40 bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl border-2 border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-lg shadow-md font-jua">
            {currentStudentNum}번
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">
              {studentName.trim() ? studentName : `${currentStudentNum}번 학생`}의 투표
            </div>
            <div className="text-xs text-slate-500">
              {selectedCardId
                ? `선택한 약속: "${cards.find((c) => c.id === selectedCardId)?.title}"`
                : '위 8개의 카드 중 1개를 터치하세요'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            disabled={!selectedCardId || voteSubmittedSuccess}
            onClick={handleCastVote}
            className={`flex-1 sm:flex-initial px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95 font-jua ${
              !selectedCardId
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : voteSubmittedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white hover:shadow-orange-500/30'
            }`}
          >
            {voteSubmittedSuccess ? (
              <>
                <CheckCircle className="w-6 h-6 animate-spin" />
                <span>투표 완료! 🎉</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-6 h-6" />
                <span>투표하기 (손가락 터치)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Teacher Finalization Controls */}
      <div className="bg-amber-50/80 rounded-3xl p-6 border-2 border-amber-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wider">
            TEACHER CONTROLS
          </span>
          <h4 className="text-lg font-black text-slate-900 font-jua">
            선생님 확정 도구
          </h4>
          <p className="text-xs text-slate-600 mt-0.5">
            투표 결과를 바탕으로 우리 반 2학기 실천 약속을 최종 확정하거나 초기화할 수 있습니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {votes.length > 0 && leadingCard && (
            <button
              onClick={() => handleFinalizePromise(leadingCard.id)}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow transition-transform active:scale-95 flex items-center gap-2 font-jua"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>1위 &ldquo;{leadingCard.title}&rdquo; 최종 확정하기!</span>
            </button>
          )}

          <button
            onClick={() => {
              if (window.confirm('투표 기록을 모두 초기화하시겠습니까?')) {
                onResetVotes();
              }
            }}
            className="px-4 py-3 bg-white hover:bg-slate-100 text-slate-600 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>투표 초기화</span>
          </button>
        </div>
      </div>
    </div>
  );

  function onOpenDetailCard(card: PracticeCard) {
    onOpenCardDetail(card);
  }
};
