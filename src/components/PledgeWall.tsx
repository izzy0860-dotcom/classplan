import React, { useState } from 'react';
import { PracticeCard, StudentPledge } from '../types';
import { HandprintSVG } from './HandprintSVG';
import { CardBadges } from './CardBadges';
import { Printer, Sparkles, Heart, Award, ZoomIn, X, Share2, PlusCircle } from 'lucide-react';
import { playTapSound } from '../utils/sound';

interface PledgeWallProps {
  classNameTitle: string;
  cards: PracticeCard[];
  chosenCardId: number;
  pledges: StudentPledge[];
  onAddMorePledge: () => void;
  onDeletePledge?: (id: string) => void;
}

export const PledgeWall: React.FC<PledgeWallProps> = ({
  classNameTitle,
  cards,
  chosenCardId,
  pledges,
  onAddMorePledge,
  onDeletePledge,
}) => {
  const chosenCard = cards.find((c) => c.id === chosenCardId) || cards[0];
  const [selectedPledge, setSelectedPledge] = useState<StudentPledge | null>(null);

  const handlePrint = () => {
    playTapSound();
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Action Header Banner (Hidden on Print) */}
      <div className="no-print bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>우리 반 명예의 전당</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-jua">
            {classNameTitle} 손도장 실천 다짐 나무
          </h2>
          <p className="text-amber-100 text-sm mt-1 font-dodum">
            우리 반 친구들의 따뜻한 손도장과 다짐이 모여 함께 자라나는 희망 나무입니다.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onAddMorePledge}
            className="px-5 py-3.5 bg-white text-amber-900 hover:bg-amber-50 rounded-2xl font-black text-sm shadow-lg flex items-center gap-2 transition-transform active:scale-95 font-jua"
          >
            <PlusCircle className="w-4 h-4 text-orange-600" />
            <span>손도장 더 등록하기</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-sm shadow-lg flex items-center gap-2 transition-transform active:scale-95 font-jua"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>학급 서약서 인쇄하기</span>
          </button>
        </div>
      </div>

      {/* Chosen Promise Focus Block */}
      <div className="bg-amber-500/10 border-2 border-amber-300 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-2xl shadow-lg flex-shrink-0">
            <Award className="w-9 h-9 text-amber-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-800 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                2학기 우리 반 실천 약속
              </span>
              <span className="text-xs text-slate-500">
                총 {pledges.length}명의 친구가 서약했습니다
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-jua mt-1">
              &ldquo;{chosenCard.title}&rdquo;
            </h3>
            <p className="text-slate-700 text-sm font-semibold font-dodum mt-0.5">
              {chosenCard.description.replace('\n', ' ')}
            </p>
          </div>
        </div>

        <div className="flex-shrink-0">
          <CardBadges badges={chosenCard.badges} size="md" />
        </div>
      </div>

      {/* Handprint Gallery Grid / Wall */}
      {pledges.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-amber-300">
          <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4">
            <HandprintSVG color="#EA580C" size={60} />
          </div>
          <h4 className="text-xl font-black text-slate-800 font-jua">
            아직 등록된 손도장이 없어요!
          </h4>
          <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto font-dodum">
            아이들이 전자칠판으로 나와 손도장을 찍고 다짐을 적으면 이곳에 아름답게 전시됩니다.
          </p>
          <button
            onClick={onAddMorePledge}
            className="mt-5 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm shadow transition-transform active:scale-95 font-jua"
          >
            첫 손도장 찍으러 가기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {pledges.map((p) => (
            <div
              key={p.id}
              onClick={() => {
                playTapSound();
                setSelectedPledge(p);
              }}
              className="group bg-white rounded-3xl p-5 shadow-md hover:shadow-xl border-2 border-amber-100 hover:border-amber-300 transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden active:scale-98"
            >
              {/* Subtle stamp watermarked background */}
              <div className="absolute -right-4 -bottom-4 opacity-15 group-hover:opacity-25 transition-opacity pointer-events-none">
                <HandprintSVG
                  color={p.stampColor}
                  size={120}
                  angle={p.stampAngle}
                  handType={p.handType}
                />
              </div>

              {/* Student Number & Name Header */}
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center font-jua">
                    {p.studentNumber}
                  </span>
                  <span className="font-black text-slate-900 text-base font-jua">
                    {p.studentName}
                  </span>
                </div>
                <ZoomIn className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
              </div>

              {/* Centered Handprint Stamp Graphic */}
              <div className="flex justify-center my-3 relative z-10">
                <div className="p-2 rounded-2xl bg-amber-50/50 group-hover:bg-amber-100/60 transition-colors">
                  <HandprintSVG
                    color={p.stampColor}
                    size={84}
                    angle={p.stampAngle}
                    handType={p.handType}
                  />
                </div>
              </div>

              {/* Written Pledge Snippet */}
              <div className="bg-slate-50 group-hover:bg-amber-50/80 rounded-2xl p-3 border border-slate-100 transition-colors relative z-10">
                <p className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-2 leading-relaxed font-dodum">
                  &ldquo;{p.pledgeText}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Printable Classroom Poster / Certificate Section (Visible on screen and optimized for print) */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl border-4 border-amber-300 print:border-none print:shadow-none print:p-4">
        {/* Certificate Decorative Border */}
        <div className="border-4 border-double border-amber-600/60 p-6 sm:p-8 rounded-2xl relative bg-gradient-to-b from-amber-50/30 via-white to-amber-50/30">
          {/* Certificate Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black tracking-widest uppercase mb-2">
              월드비전 교실에서 찾은 희망 캠페인
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-amber-950 font-jua tracking-tight">
              {classNameTitle} 실천 서약서
            </h1>
            <p className="text-sm font-bold text-slate-600 mt-1 font-dodum">
              우리가 함께 정한 2학기 교실 속 따뜻한 약속
            </p>
          </div>

          {/* Chosen Promise Box on Certificate */}
          <div className="bg-amber-100/80 rounded-2xl p-6 border-2 border-amber-300 text-center max-w-2xl mx-auto mb-8 shadow-sm">
            <span className="text-xs font-black text-amber-800 uppercase tracking-wider block mb-1">
              [ 2학기 우리 반 실천 약속 ]
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-950 font-jua">
              &ldquo;{chosenCard.title}&rdquo;
            </h2>
            <p className="text-sm sm:text-base font-semibold text-slate-800 mt-2 font-dodum whitespace-pre-line">
              {chosenCard.description}
            </p>
          </div>

          {/* Handprint Stamps Grid on Certificate */}
          <div className="mb-10">
            <h4 className="text-center text-sm font-black text-amber-900 font-jua mb-4">
              우리 반 친구들의 손도장 다짐 ({pledges.length}명)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {pledges.map((p) => (
                <div
                  key={p.id}
                  className="bg-white/90 rounded-xl p-3 border border-amber-200/80 text-center shadow-xs flex flex-col items-center justify-between"
                >
                  <HandprintSVG
                    color={p.stampColor}
                    size={56}
                    angle={p.stampAngle}
                    handType={p.handType}
                  />
                  <div className="font-black text-xs text-slate-900 mt-1 font-jua">
                    {p.studentNumber}번 {p.studentName}
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5 font-dodum">
                    {p.pledgeText}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Official Solemn Pledge Oath & Signature Box */}
          <div className="border-t-2 border-amber-200 pt-6 text-center">
            <p className="text-sm sm:text-base font-bold text-slate-800 leading-relaxed font-dodum max-w-xl mx-auto">
              우리 {classNameTitle} 친구들은 위 실천 약속을 가슴에 새기고,<br />
              서로를 배려하고 존중하는 행복한 교실을 만들어 갈 것을 굳게 약속합니다.
            </p>

            <div className="mt-6 flex items-center justify-center gap-8 text-sm font-black text-amber-950 font-jua">
              <span>서약 일자: {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span>{classNameTitle} 학생 일동</span>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Student Pledge Detail Modal */}
      {selectedPledge && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedPledge(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-4 border-amber-300 text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPledge(null)}
              className="absolute top-4 right-4 w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full flex items-center justify-center shadow"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-black">
                {classNameTitle} 실천 다짐 카드
              </span>
            </div>

            <div className="flex justify-center my-4">
              <HandprintSVG
                color={selectedPledge.stampColor}
                size={130}
                angle={selectedPledge.stampAngle}
                handType={selectedPledge.handType}
              />
            </div>

            <h3 className="text-2xl font-black text-slate-900 font-jua">
              {selectedPledge.studentNumber}번 {selectedPledge.studentName}의 다짐
            </h3>

            <div className="mt-4 bg-amber-50 rounded-2xl p-4 border border-amber-200 text-slate-800 text-base font-bold font-dodum leading-relaxed">
              &ldquo;{selectedPledge.pledgeText}&rdquo;
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setSelectedPledge(null)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm"
              >
                확인
              </button>
              {onDeletePledge && (
                <button
                  onClick={() => {
                    if (window.confirm(`${selectedPledge.studentName} 학생의 서약을 삭제할까요?`)) {
                      onDeletePledge(selectedPledge.id);
                      setSelectedPledge(null);
                    }
                  }}
                  className="px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl font-bold text-xs"
                >
                  서약 삭제
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
