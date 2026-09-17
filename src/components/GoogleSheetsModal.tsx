import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Copy,
  Send,
  ExternalLink,
  Sparkles,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import {
  getGoogleSheetsUrl,
  setGoogleSheetsUrl,
  sendToGoogleSheets,
  GOOGLE_APPS_SCRIPT_CODE,
} from '../utils/googleSheets';
import { StudentVote, StudentPledge, PracticeCard } from '../types';
import { playTapSound, playVoteSuccessSound } from '../utils/sound';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classTitle: string;
  votes: StudentVote[];
  pledges: StudentPledge[];
  cards: PracticeCard[];
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  classTitle,
  votes,
  pledges,
  cards,
}) => {
  const [url, setUrl] = useState(() => getGoogleSheetsUrl());
  const [isCopied, setIsCopied] = useState(false);
  const [testStatus, setTestStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });
  const [batchStatus, setBatchStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });
  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'guide'>('settings');

  if (!isOpen) return null;

  const isConnected = !!url.trim();

  const handleSaveUrl = () => {
    playTapSound();
    setGoogleSheetsUrl(url);
    setTestStatus({
      loading: false,
      success: true,
      message: '연동 URL이 저장되었습니다! 이제 학생들의 투표와 손도장이 자동 기록됩니다.',
    });
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
      setIsCopied(true);
      playTapSound();
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      alert('클립보드 복사에 실패했습니다. 아래 코드 박스에서 직접 복사해주세요.');
    }
  };

  const handleTestConnection = async () => {
    if (!url.trim()) {
      alert('먼저 구글 Apps Script 웹 앱 URL을 입력해주세요.');
      return;
    }
    playTapSound();
    setTestStatus({ loading: true });

    try {
      const result = await sendToGoogleSheets(
        {
          action: 'test',
          classTitle,
        },
        url.trim()
      );

      if (result.success) {
        playVoteSuccessSound();
        setTestStatus({
          loading: false,
          success: true,
          message: '연동 성공! 구글 스프레드시트의 "0.연동테스트" 시트에 확인 행이 추가되었습니다.',
        });
      } else {
        setTestStatus({
          loading: false,
          success: false,
          message: result.message,
        });
      }
    } catch (err) {
      setTestStatus({
        loading: false,
        success: false,
        message: '전송에 실패했습니다. 웹 앱 배포 권한("모든 사용자")을 확인해주세요.',
      });
    }
  };

  const handleBatchSync = async () => {
    if (!url.trim()) {
      alert('먼저 구글 Apps Script 웹 앱 URL을 입력해주세요.');
      return;
    }
    if (votes.length === 0 && pledges.length === 0) {
      alert('현재 저장된 투표나 손도장 다짐 데이터가 없습니다.');
      return;
    }

    playTapSound();
    setBatchStatus({ loading: true });

    const cardMap = new Map<number, string>(cards.map((c) => [c.id, c.title]));

    const formattedVotes = votes.map((v) => ({
      studentNumber: v.studentNumber,
      studentName: v.studentName,
      cardTitle: cardMap.get(v.cardId) || '실천 약속',
      timestamp: new Date(v.timestamp).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
    }));

    const formattedPledges = pledges.map((p) => ({
      studentNumber: p.studentNumber,
      studentName: p.studentName,
      cardTitle: cardMap.get(p.cardId) || '실천 약속',
      pledgeText: p.pledgeText,
      stampColor: p.stampColor,
      handType: p.handType,
      timestamp: new Date(p.timestamp).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
    }));

    try {
      await sendToGoogleSheets(
        {
          action: 'batch_sync',
          classTitle,
          votes: formattedVotes,
          pledges: formattedPledges,
        },
        url.trim()
      );

      playVoteSuccessSound();
      setBatchStatus({
        loading: false,
        success: true,
        message: `총 투표 ${votes.length}건, 손도장 다짐 ${pledges.length}건이 구글 시트에 일괄 전송되었습니다!`,
      });
    } catch {
      setBatchStatus({
        loading: false,
        success: false,
        message: '일괄 전송 중 오류가 발생했습니다.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border-2 border-emerald-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 sm:p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black font-jua">구글 스프레드시트(액셀) 연동</h3>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isConnected ? 'bg-emerald-300 text-emerald-950' : 'bg-white/25 text-white'
                  }`}
                >
                  {isConnected ? '실시간 연동 중 ✓' : '미설정'}
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-dodum mt-0.5">
                학생들이 찍은 손도장과 다짐을 선생님의 구글 시트로 자동 수집합니다.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-nav Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => {
              playTapSound();
              setActiveSubTab('settings');
            }}
            className={`px-4 py-2 text-sm font-bold font-jua rounded-t-xl transition-all ${
              activeSubTab === 'settings'
                ? 'bg-white border-t-2 border-x-2 border-emerald-500 text-emerald-800 -mb-px shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ⚙️ 연동 주소 입력 & 전송
          </button>
          <button
            onClick={() => {
              playTapSound();
              setActiveSubTab('guide');
            }}
            className={`px-4 py-2 text-sm font-bold font-jua rounded-t-xl transition-all ${
              activeSubTab === 'guide'
                ? 'bg-white border-t-2 border-x-2 border-emerald-500 text-emerald-800 -mb-px shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            📖 3분 연동 가이드 & 코드 복사
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {activeSubTab === 'settings' ? (
            <div className="space-y-5">
              {/* URL Input */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4">
                <label className="block text-xs font-black text-emerald-950 font-jua mb-1.5 flex items-center justify-between">
                  <span>Google Apps Script 웹 앱 URL (exec 주소)</span>
                  <a
                    href="https://sheets.new"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-normal font-dodum"
                  >
                    새 구글 시트 만들기 <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 px-3 py-2.5 bg-white text-xs sm:text-sm font-mono border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={handleSaveUrl}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl font-jua shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" /> 저장하기
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 font-dodum">
                  * 주소를 저장해두면 이후 학생들이 투표하거나 손도장을 찍을 때마다 백그라운드에서 구글 시트에 자동으로 한 줄씩 기록됩니다.
                </p>
              </div>

              {/* Status Banner */}
              {testStatus.message && (
                <div
                  className={`p-3.5 rounded-xl border text-xs font-dodum flex items-start gap-2.5 ${
                    testStatus.success
                      ? 'bg-emerald-100/80 border-emerald-300 text-emerald-900'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {testStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold">{testStatus.success ? '성공' : '확인 필요'}</div>
                    <div>{testStatus.message}</div>
                  </div>
                </div>
              )}

              {batchStatus.message && (
                <div
                  className={`p-3.5 rounded-xl border text-xs font-dodum flex items-start gap-2.5 ${
                    batchStatus.success
                      ? 'bg-emerald-100/80 border-emerald-300 text-emerald-900'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">일괄 전송 완료</div>
                    <div>{batchStatus.message}</div>
                  </div>
                </div>
              )}

              {/* Test & Batch Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <h4 className="font-black text-slate-900 font-jua text-sm flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" /> 1단계: 연결 테스트
                    </h4>
                    <p className="text-xs text-slate-600 font-dodum mt-1">
                      구글 시트에 테스트 데이터 1줄을 보내어 정상 작동하는지 확인합니다.
                    </p>
                  </div>
                  <button
                    onClick={handleTestConnection}
                    disabled={testStatus.loading}
                    className="mt-3 w-full py-2.5 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white text-xs font-bold font-jua rounded-xl flex items-center justify-center gap-2 active:scale-95"
                  >
                    {testStatus.loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>시험 데이터 1줄 전송</span>
                  </button>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <h4 className="font-black text-slate-900 font-jua text-sm flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> 2단계: 현재 데이터 일괄 전송
                    </h4>
                    <p className="text-xs text-slate-600 font-dodum mt-1">
                      이미 진행된 투표({votes.length}표)와 손도장 다짐({pledges.length}명)을 구글 시트로 한 번에 전송합니다.
                    </p>
                  </div>
                  <button
                    onClick={handleBatchSync}
                    disabled={batchStatus.loading}
                    className="mt-3 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold font-jua rounded-xl flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                  >
                    {batchStatus.loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <UploadIcon />
                    )}
                    <span>현재 모든 데이터 시트로 보내기</span>
                  </button>
                </div>
              </div>

              {/* Information callout */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 font-dodum space-y-1">
                <div className="font-bold flex items-center gap-1 text-amber-950 font-jua text-sm">
                  <HelpCircle className="w-4 h-4 text-amber-600" /> 선생님 안내 사항
                </div>
                <p>• 구글 시트 주소는 선생님 브라우저에 안전하게 저장됩니다.</p>
                <p>• 연동 후 학생들은 평소처럼 전자칠판에서 투표하고 손도장을 찍기만 하면 됩니다.</p>
                <p>• 배포 설정 시 <span className="font-bold underline">"액세스 권한이 있는 사용자: 모든 사용자(Anyone)"</span>로 설정해야 학생 기기에서 로그인 없이 전송됩니다.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-900 font-jua text-base">
                  구글 스프레드시트 3분 연동 순서
                </h4>
                <button
                  onClick={handleCopyCode}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-jua rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  {isCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopied ? '복사 완료!' : 'Code.gs 코드 복사하기'}</span>
                </button>
              </div>

              {/* 4 Steps */}
              <ol className="space-y-2.5 text-xs text-slate-700 font-dodum">
                <li className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex gap-2.5 items-start">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[11px]">1</span>
                  <div>
                    <span className="font-bold text-slate-900">구글 시트 생성 & Apps Script 열기:</span>
                    <p className="mt-0.5 text-slate-600">
                      새 구글 시트를 만들고, 상단 메뉴에서 <strong>[확장 프로그램] → [Apps Script]</strong>를 클릭합니다.
                    </p>
                  </div>
                </li>

                <li className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex gap-2.5 items-start">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[11px]">2</span>
                  <div>
                    <span className="font-bold text-slate-900">코드 붙여넣기 및 저장:</span>
                    <p className="mt-0.5 text-slate-600">
                      기존 코드를 모두 지우고 위 <strong className="text-emerald-700">[Code.gs 코드 복사하기]</strong> 버튼을 눌러 붙여넣은 뒤 상단 <strong>저장(디스켓 아이콘)</strong>을 누릅니다.
                    </p>
                  </div>
                </li>

                <li className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex gap-2.5 items-start">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[11px]">3</span>
                  <div>
                    <span className="font-bold text-slate-900">웹 앱으로 배포하기 (가장 중요):</span>
                    <p className="mt-0.5 text-slate-600">
                      우측 상단 파란색 <strong>[배포] → [새 배포]</strong> 클릭 → 톱니바퀴에서 <strong>[웹 앱]</strong> 선택:
                      <br />• <strong>다음 사용자 권한으로 실행:</strong> <span className="underline font-bold">나 (내 계정)</span>
                      <br />• <strong>액세스 권한이 있는 사용자:</strong> <span className="underline font-bold text-red-600">모든 사용자 (Anyone)</span>
                    </p>
                  </div>
                </li>

                <li className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex gap-2.5 items-start">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[11px]">4</span>
                  <div>
                    <span className="font-bold text-slate-900">URL 붙여넣기:</span>
                    <p className="mt-0.5 text-slate-600">
                      배포 완료 시 나오는 <strong>웹 앱 URL (https://script.google.com/macros/s/.../exec)</strong>을 복사하여 <strong>[연동 주소 입력]</strong> 탭에 넣고 저장하면 완료됩니다!
                    </p>
                  </div>
                </li>
              </ol>

              {/* Code Preview */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1 font-jua">
                  <span>Code.gs 스크립트 미리보기</span>
                  <button
                    onClick={handleCopyCode}
                    className="text-emerald-600 hover:underline flex items-center gap-1 font-normal font-dodum"
                  >
                    <Copy className="w-3 h-3" /> 코드 복사
                  </button>
                </div>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-56 leading-relaxed select-all">
                  {GOOGLE_APPS_SCRIPT_CODE}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-dodum">
            월드비전 교실에서 찾은 희망 • 구글 스프레드시트 데이터 연동
          </span>
          <button
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold font-jua text-sm"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

const UploadIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);
