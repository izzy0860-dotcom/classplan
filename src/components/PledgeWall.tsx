import React, { useState } from 'react';
import { PracticeCard, StudentPledge } from '../types';
import { HandprintSVG } from './HandprintSVG';
import { CardBadges } from './CardBadges';
import { Printer, Sparkles, Heart, Award, ZoomIn, X, Share2, PlusCircle, RefreshCw, Users, CheckCircle2, Clock } from 'lucide-react';
import { playTapSound } from '../utils/sound';

interface PledgeWallProps {
  classNameTitle: string;
  cards: PracticeCard[];
  chosenCardId: number;
  pledges: StudentPledge[];
  onAddMorePledge: () => void;
  onDeletePledge?: (id: string) => void;
  totalStudentsCount?: number;
  onSyncFromSheets?: () => void;
  isSyncing?: boolean;
  lastSyncTime?: Date | null;
  isGoogleSheetsConnected?: boolean;
}

export const PledgeWall: React.FC<PledgeWallProps> = ({
  classNameTitle,
  cards,
  chosenCardId,
  pledges,
  onAddMorePledge,
  onDeletePledge,
  totalStudentsCount = 21,
  onSyncFromSheets,
  isSyncing = false,
  lastSyncTime,
  isGoogleSheetsConnected = false,
}) => {
  const chosenCard = cards.find((c) => c.id === chosenCardId) || cards[0];
  const [selectedPledge, setSelectedPledge] = useState<StudentPledge | null>(null);

  // Map of pledges by studentNumber
  const pledgeByNumber = new Map<number, StudentPledge>();
  pledges.forEach((p) => {
    pledgeByNumber.set(p.studentNumber, p);
  });

  const submittedCount = pledges.length;
  const remainingCount = Math.max(0, totalStudentsCount - submittedCount);
  const completionPercentage = Math.round((submittedCount / totalStudentsCount) * 100);

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
            <span>우리 반 명예의 전당 (총 {totalStudentsCount}명)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-jua">
            {classNameTitle} 손도장 실천 다짐 나무
          </h2>
          <p className="text-amber-100 text-sm mt-1 font-dodum">
            각자 크롬북으로 등록한 손도장과 다짐이 실시간으로 모여 우리 반 서약서가 완성됩니다.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-end">
          {/* Real-time sync button */}
          {onSyncFromSheets && (
            <button
              onClick={() => {
                playTapSound();
                onSyncFromSheets();
              }}
              disabled={isSyncing}
              className={`px-4 py-3.5 rounded-2xl font-black text-sm shadow-lg flex items-center gap-2 transition-transform active:scale-95 font-jua ${
                isGoogleSheetsConnected
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title="구글 시트에서 친구들이 올린 다짐 불러오기"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? '동기화 중...' : '친구들 다짐 새로고침'}</span>
            </button>
          )}

          <button
            onClick={onAddMorePledge}
            className="px-5 py-3.5 bg-white text-amber-900 hover:bg-amber-50 rounded-2xl font-black text-sm shadow-lg flex items-center gap-2 transition-transform active:scale-95 font-jua"
          >
            <PlusCircle className="w-4 h-4 text-orange-600" />
            <span>손도장 등록하기</span>
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

      {/* 21-Student Live Submission Status Bar (Hidden on Print) */}
      <div className="no-print bg-white rounded-3xl p-6 shadow-md border-2 border-amber-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 font-jua">
                  우리 반 크롬북 참여 현황 ({submittedCount} / {totalStudentsCount}명 서약 완료)
                </h3>
                {submittedCount === totalStudentsCount ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                    전원 완료! 🎉
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    {remainingCount}명 작성 중
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-dodum">
                {isGoogleSheetsConnected
                  ? '구글 시트와 실시간 연동 중입니다. 학생들이 제출하면 자동으로 이곳에 반영됩니다.'
                  : '구글 시트 미연동 상태입니다. 상단 [구글 시트 연동]을 통해 21명 크롬북과 자동 동기화할 수 있습니다.'}
              </p>
            </div>
          </div>

          {lastSyncTime && (
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>최근 갱신: {lastSyncTime.toLocaleTimeString('ko-KR')}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
          <div
            className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-500 rounded-full"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {/* 21 Student Number Badges Checklist */}
        <div>
          <span className="text-xs font-bold text-slate-600 block mb-2 font-jua">
            학생별 서약 확인표 (1~{totalStudentsCount}번)
          </span>
          <div className="grid grid-cols-7 sm:grid-cols-11 md:grid-cols-21 gap-1.5">
            {Array.from({ length: totalStudentsCount }, (_, i) => i + 1).map((num) => {
              const p = pledgeByNumber.get(num);
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    if (p) {
                      playTapSound();
                      setSelectedPledge(p);
                    }
                  }}
                  className={`p-2 rounded-xl text-center border transition-all ${
                    p
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold hover:bg-emerald-100 hover:scale-105 cursor-pointer shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-400 font-normal cursor-default'
                  }`}
                  title={p ? `${p.studentName}: "${p.pledgeText}" (클릭하여 보기)` : `${num}번 학생 아직 미제출`}
                >
                  <div className="text-xs font-jua">{num}번</div>
                  <div className="text-[10px] truncate">
                    {p ? p.studentName.replace(/^[0-9]+번\s*/, '') : '작성중'}
                  </div>
                  <div className="mt-0.5 text-[10px] flex justify-center">
                    {p ? (
                      <span style={{ color: p.stampColor }} className="text-xs">✋</span>
                    ) : (
                      <span className="text-slate-300">○</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chosen Promise Focus Block (Hidden on Print) */}
      <div className="no-print bg-amber-500/10 border-2 border-amber-300 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
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

      {/* Handprint Gallery Grid / Wall (Interactive on Screen) */}
      {pledges.length === 0 ? (
        <div className="no-print bg-white rounded-3xl p-12 text-center border-2 border-dashed border-amber-300">
          <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4">
            <HandprintSVG color="#EA580C" size={60} />
          </div>
          <h4 className="text-xl font-black text-slate-800 font-jua">
            아직 등록된 손도장이 없어요!
          </h4>
          <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto font-dodum">
            아이들이 각자의 크롬북에서 손도장을 찍고 다짐을 등록하면 이곳에 실시간으로 나타납니다.
          </p>
          <button
            onClick={onAddMorePledge}
            className="mt-5 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm shadow transition-transform active:scale-95 font-jua"
          >
            첫 손도장 찍으러 가기
          </button>
        </div>
      ) : (
        <div className="no-print grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {pledges.map((p) => (
            <div
              key={p.id}
              onClick={() => {
                playTapSound();
                setSelectedPledge(p);
              }}
              className="group bg-white rounded-3xl p-5 border-2 border-amber-200/80 hover:border-amber-400 shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden transform hover:-translate-y-1"
            >
              {/* Background watermark badge */}
              <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
                <HandprintSVG color={p.stampColor} size={110} />
              </div>

              <div>
                {/* Stamp visual */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-black font-jua">
                    {p.studentNumber}번 {p.studentName}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPledge(p);
                    }}
                    className="text-slate-400 hover:text-amber-600"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex justify-center my-3 group-hover:scale-105 transition-transform">
                  <HandprintSVG
                    color={p.stampColor}
                    size={80}
                    angle={p.stampAngle}
                    handType={p.handType}
                  />
                </div>

                {/* Pledge text quote */}
                <div className="bg-amber-50/80 rounded-2xl p-3.5 border border-amber-200/60 mt-2">
                  <p className="text-slate-800 text-xs sm:text-sm font-semibold font-dodum leading-relaxed line-clamp-3">
                    &ldquo;{p.pledgeText}&rdquo;
                  </p>
                </div>
              </div>

              {/* Timestamp */}
              <div className="mt-3 pt-2 border-t border-amber-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{p.handType === 'right' ? '오른손' : '왼손'} 서약</span>
                <span>{new Date(p.timestamp).toLocaleDateString('ko-KR')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* Printable Certificate Wall View (Visible on Screen & Print) */}
      {/* Optimized for 21 Students on A4 / Poster Format */}
      {/* ======================================================== */}
      <div id="printable-certificate" className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-amber-300 relative overflow-hidden">
        {/* Certificate Frame Borders */}
        <div className="border-4 border-double border-amber-600/60 rounded-2xl p-6 sm:p-8 relative bg-gradient-to-b from-amber-50/30 via-white to-amber-50/20">
          
          {/* Certificate Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black tracking-widest uppercase mb-2">
              월드비전 교실에서 찾은 희망 캠페인
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-amber-950 font-jua tracking-tight">
              {classNameTitle} 실천 서약서
            </h1>
            <p className="text-sm font-bold text-slate-600 mt-1 font-dodum">
              우리 21명의 친구들이 함께 정하고 각자의 손도장으로 약속한 교실 속 따뜻한 실천
            </p>
          </div>

          {/* Chosen Promise Box on Certificate */}
          <div className="bg-amber-100/80 rounded-2xl p-5 border-2 border-amber-300 text-center max-w-2xl mx-auto mb-6 shadow-sm">
            <span className="text-xs font-black text-amber-800 uppercase tracking-wider block mb-0.5">
              [ 2학기 우리 반 실천 약속 ]
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-950 font-jua">
              &ldquo;{chosenCard.title}&rdquo;
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-1 font-dodum whitespace-pre-line">
              {chosenCard.description}
            </p>
          </div>

          {/* Handprint Stamps Grid on Certificate (21 Students Layout: 7 cols x 3 rows) */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3 px-2">
              <h4 className="text-sm font-black text-amber-900 font-jua">
                우리 반 21명 친구들의 손도장 다짐 ({pledges.length}명 완료)
              </h4>
              <span className="text-xs text-slate-500 font-dodum">
                교실 뒷판 게시 및 학급 액자 보관용
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2.5 sm:gap-3">
              {Array.from({ length: totalStudentsCount }, (_, i) => i + 1).map((num) => {
                const p = pledgeByNumber.get(num);
                return (
                  <div
                    key={num}
                    className={`rounded-xl p-2.5 text-center flex flex-col items-center justify-between min-h-[110px] sm:min-h-[120px] transition-all ${
                      p
                        ? 'bg-white border border-amber-200/90 shadow-2xs'
                        : 'bg-amber-50/30 border-2 border-dashed border-amber-200'
                    }`}
                  >
                    {p ? (
                      <>
                        <HandprintSVG
                          color={p.stampColor}
                          size={46}
                          angle={p.stampAngle}
                          handType={p.handType}
                        />
                        <div className="font-black text-[11px] text-slate-900 mt-1 font-jua truncate w-full">
                          {p.studentNumber}번 {p.studentName.replace(/^[0-9]+번\s*/, '')}
                        </div>
                        <p className="text-[10px] text-slate-600 line-clamp-2 mt-0.5 font-dodum leading-tight w-full">
                          &ldquo;{p.pledgeText}&rdquo;
                        </p>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-300 py-3">
                        <span className="text-xl opacity-40">✋</span>
                        <span className="text-[10px] font-jua text-slate-400 mt-1">{num}번</span>
                        <span className="text-[9px] text-slate-400">작성 대기</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Official Solemn Pledge Oath & Signature Box */}
          <div className="border-t-2 border-amber-200 pt-5 text-center">
            <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed font-dodum max-w-xl mx-auto">
              우리 {classNameTitle} 21명의 친구들은 위 실천 약속을 가슴에 새기고,<br />
              서로를 배려하고 존중하는 폭력 없는 행복한 교실을 만들어 갈 것을 굳게 약속합니다.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs sm:text-sm font-black text-amber-950 font-jua">
              <span>서약 일자: {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span>{classNameTitle} 학생 21명 일동</span>
              <span className="px-3 py-1 bg-amber-100 rounded-lg border border-amber-300">담임교사 서명 : (인)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Student Pledge Detail Modal */}
      {selectedPledge && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
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
