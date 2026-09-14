import React, { useState } from 'react';
import { PracticeCard, StudentPledge } from '../types';
import { SUGGESTED_PLEDGES } from '../data/cards';
import { HandprintSVG } from './HandprintSVG';
import { CardBadges } from './CardBadges';
import { playStampSound, playTapSound } from '../utils/sound';
import confetti from 'canvas-confetti';
import { Sparkles, Check, HeartHandshake, User, Palette, RotateCw, Hand, ArrowRight } from 'lucide-react';

interface PledgeCreatorProps {
  cards: PracticeCard[];
  targetCardId: number;
  onSelectTargetCard: (cardId: number) => void;
  onSavePledge: (pledge: Omit<StudentPledge, 'id' | 'timestamp'>) => void;
  existingPledges: StudentPledge[];
  onGoToWall: () => void;
  totalStudentsCount?: number;
}

const STAMP_COLORS = [
  { name: '인주 빨강', color: '#DC2626', bg: 'bg-red-600' },
  { name: '따뜻한 주황', color: '#EA580C', bg: 'bg-orange-600' },
  { name: '햇살 노랑', color: '#D97706', bg: 'bg-amber-600' },
  { name: '클로버 초록', color: '#16A34A', bg: 'bg-green-600' },
  { name: '청명한 파랑', color: '#2563EB', bg: 'bg-blue-600' },
  { name: '포도 보라', color: '#9333EA', bg: 'bg-purple-600' },
  { name: '체리 핑크', color: '#E11D48', bg: 'bg-rose-600' }
];

export const PledgeCreator: React.FC<PledgeCreatorProps> = ({
  cards,
  targetCardId,
  onSelectTargetCard,
  onSavePledge,
  existingPledges,
  onGoToWall,
  totalStudentsCount = 25,
}) => {
  const currentCard = cards.find((c) => c.id === targetCardId) || cards[0];

  const [studentNum, setStudentNum] = useState<number>(1);
  const [studentName, setStudentName] = useState<string>('');
  const [pledgeText, setPledgeText] = useState<string>('');
  const [stampColor, setStampColor] = useState<string>(STAMP_COLORS[0].color);
  const [handType, setHandType] = useState<'left' | 'right'>('right');
  const [stampAngle, setStampAngle] = useState<number>(-5);
  const [isStamped, setIsStamped] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Set of student numbers who already pledged
  const pledgedStudentNums = new Set(existingPledges.map((p) => p.studentNumber));

  const handleStampPadTouch = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    playStampSound();
    setIsStamped(true);
    // Slight random angle for natural stamp feel (-15 to 15 deg)
    const randomAngle = Math.floor(Math.random() * 26) - 13;
    setStampAngle(randomAngle);
  };

  const handleSelectSuggested = (text: string) => {
    playTapSound();
    setPledgeText(text);
  };

  const handleSubmitPledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pledgeText.trim()) {
      alert('우리 반을 위한 다짐 한마디를 적어주세요!');
      return;
    }

    const nameToSave = studentName.trim() || `${studentNum}번 학생`;

    setIsSubmitting(true);
    playStampSound();

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    onSavePledge({
      studentNumber: studentNum,
      studentName: nameToSave,
      cardId: currentCard.id,
      pledgeText: pledgeText.trim(),
      stampColor,
      stampAngle,
      handType,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      // Auto move to next unpledged student number
      let nextNum = studentNum + 1;
      while (nextNum <= totalStudentsCount && pledgedStudentNums.has(nextNum)) {
        nextNum++;
      }
      if (nextNum <= totalStudentsCount) {
        setStudentNum(nextNum);
      }
      setStudentName('');
      setPledgeText('');
      setIsStamped(false);
    }, 1000);
  };

  const suggestions = SUGGESTED_PLEDGES[currentCard.id] || [];

  return (
    <div className="space-y-8">
      {/* Top Banner & Card Connection */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>2학기 실천 다짐 손도장 서약식</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-jua">
            우리 반의 약속에 나만의 손도장과 다짐을 새겨요!
          </h2>
          <p className="text-amber-100 text-sm mt-1 font-dodum">
            정해진 실천 카드에 손도장을 쾅 찍고, 2학기 동안 실천할 다짐을 적어보세요.
          </p>
        </div>

        {/* Card Selector / Change Promise */}
        <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex flex-col items-center md:items-end gap-2 w-full md:w-auto">
          <span className="text-xs text-amber-200 font-bold">서약할 실천 카드 선택</span>
          <select
            value={currentCard.id}
            onChange={(e) => {
              playTapSound();
              onSelectTargetCard(Number(e.target.value));
            }}
            className="px-4 py-2 bg-white text-slate-900 font-black rounded-xl text-sm shadow cursor-pointer focus:outline-none"
          >
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id}번: {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Target Card Mini Banner */}
      <div className="bg-amber-100/70 border-2 border-amber-300 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-xl shadow">
            {currentCard.id}
          </div>
          <div>
            <span className="text-xs font-bold text-amber-800">우리가 실천할 약속 카드</span>
            <h3 className="text-xl sm:text-2xl font-black text-amber-950 font-jua">
              &ldquo;{currentCard.title}&rdquo;
            </h3>
            <p className="text-slate-700 text-xs sm:text-sm font-dodum">
              {currentCard.description.replace('\n', ' ')}
            </p>
          </div>
        </div>

        <div className="flex-shrink-0">
          <CardBadges badges={currentCard.badges} size="sm" />
        </div>
      </div>

      {/* Main Interactive Form for Electronic Whiteboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Handprint Touch Stamp Pad (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-xl border-2 border-amber-200 flex flex-col items-center text-center">
          <div className="w-full flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-amber-600 uppercase tracking-wider">
              TOUCH STAMP PAD
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  setHandType(handType === 'right' ? 'left' : 'right');
                }}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <Hand className="w-3.5 h-3.5" />
                <span>{handType === 'right' ? '오른손' : '왼손'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  setStampAngle((prev) => (prev + 15) % 360);
                }}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs"
                title="각도 조절"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <h3 className="text-lg font-black text-slate-900 font-jua mb-1">
            전자칠판 손도장 터치 패드
          </h3>
          <p className="text-xs text-slate-500 mb-4 font-dodum">
            아래 패드에 손바닥을 얹거나 터치하면 도장이 쾅 찍힙니다!
          </p>

          {/* Stamping Touch Area */}
          <div
            onClick={handleStampPadTouch}
            onTouchStart={handleStampPadTouch}
            className="w-full h-64 bg-amber-50/70 border-4 border-dashed border-amber-300 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden cursor-pointer hover:bg-amber-100/60 transition-colors shadow-inner select-none active:scale-[0.99]"
          >
            {isStamped ? (
              <div className="animate-in zoom-in-50 duration-200 flex flex-col items-center">
                <HandprintSVG
                  color={stampColor}
                  size={150}
                  angle={stampAngle}
                  handType={handType}
                />
                <div className="mt-2 text-xs font-bold text-slate-600 font-jua">
                  {studentName.trim() ? studentName : `${studentNum}번 학생`}의 손도장
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-amber-700/60 pointer-events-none">
                <div className="w-24 h-24 rounded-full border-4 border-amber-400/40 flex items-center justify-center animate-pulse">
                  <Hand className="w-12 h-12 text-amber-500" />
                </div>
                <span className="mt-3 text-sm font-black text-amber-900 font-jua">
                  손바닥을 대고 쾅! 터치하세요
                </span>
                <span className="text-xs text-amber-700/80 mt-0.5">
                  (인주 소리와 함께 손도장이 찍혀요)
                </span>
              </div>
            )}
          </div>

          {/* Color Inks Palette */}
          <div className="w-full mt-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
              <Palette className="w-4 h-4 text-amber-600" />
              <span>손도장 인주 색상 선택</span>
            </div>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {STAMP_COLORS.map((item) => (
                <button
                  key={item.color}
                  type="button"
                  onClick={() => {
                    playTapSound();
                    setStampColor(item.color);
                  }}
                  className={`w-9 h-9 rounded-full ${item.bg} border-2 transition-transform active:scale-90 flex items-center justify-center shadow-md ${
                    stampColor === item.color
                      ? 'border-slate-900 scale-110 ring-2 ring-amber-400'
                      : 'border-white'
                  }`}
                  title={item.name}
                >
                  {stampColor === item.color && (
                    <Check className="w-4 h-4 text-white stroke-[3]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Student Info & Written Pledge (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-xl border-2 border-amber-200">
          <div className="mb-4">
            <span className="text-xs font-extrabold text-amber-600 uppercase tracking-wider">
              STUDENT PLEDGE
            </span>
            <h3 className="text-xl font-black text-slate-900 font-jua flex items-center gap-2">
              <HeartHandshake className="w-6 h-6 text-amber-500" />
              <span>나의 실천 다짐 쓰기</span>
            </h3>
          </div>

          <form onSubmit={handleSubmitPledge} className="space-y-4">
            {/* Student Number & Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  번호 선택
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={studentNum}
                    onChange={(e) => {
                      playTapSound();
                      setStudentNum(Number(e.target.value));
                    }}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                  >
                    {Array.from({ length: totalStudentsCount }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}번 {pledgedStudentNums.has(n) ? '(이미 서약함)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  이름 (학생 이름)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="예: 김민준"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Suggested sentence starters */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>추천 다짐 문장 (터치하면 자동 입력)</span>
                <span className="text-[11px] text-amber-700 font-normal">
                  4학년 추천 실천문
                </span>
              </label>
              <div className="space-y-2">
                {suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggested(sug)}
                    className={`w-full text-left p-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all active:scale-98 flex items-start gap-2 ${
                      pledgeText === sug
                        ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold'
                        : 'bg-slate-50 hover:bg-amber-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex-shrink-0 flex items-center justify-center font-black text-[10px] mt-0.5">
                      ✓
                    </span>
                    <span>{sug}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Pledge Textarea */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                직접 적는 실천 다짐 한마디
              </label>
              <textarea
                rows={3}
                required
                placeholder="2학기 동안 우리 반에서 내가 어떻게 실천할지 다짐을 적어보세요!"
                value={pledgeText}
                onChange={(e) => setPledgeText(e.target.value)}
                className="w-full p-4 rounded-xl border-2 border-slate-200 font-dodum text-sm sm:text-base text-slate-900 focus:border-amber-500 focus:outline-none resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-700 hover:to-orange-700 text-white rounded-2xl font-black text-lg sm:text-xl shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-98 font-jua"
              >
                <Hand className="w-6 h-6" />
                <span>손도장 쾅! 실천 다짐 서약 등록</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Class Pledge Status & Link to Wall */}
      <div className="bg-white rounded-3xl p-6 shadow-md border border-amber-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-600">PLEDGE PROGRESS</span>
          <h4 className="text-xl font-black text-slate-900 font-jua">
            서약 완료한 친구들 ({existingPledges.length} / {totalStudentsCount}명)
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            손도장을 찍은 친구들의 서약 카드가 우리 반 다짐 나무에 모입니다.
          </p>
        </div>

        <button
          onClick={() => {
            playTapSound();
            onGoToWall();
          }}
          className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg flex items-center gap-2 transition-transform active:scale-95 font-jua"
        >
          <span>우리 반 손도장 다짐 나무 보기</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
