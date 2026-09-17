import React, { useState, useEffect, useCallback } from 'react';
import { ActiveTab, PracticeCard, StudentVote, StudentPledge } from './types';
import { PRACTICE_CARDS } from './data/cards';
import { Header } from './components/Header';
import { CardsExploreView } from './components/CardsExploreView';
import { VotingBoard } from './components/VotingBoard';
import { PledgeCreator } from './components/PledgeCreator';
import { PledgeWall } from './components/PledgeWall';
import { CardDetailModal } from './components/CardDetailModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { generateSampleVotes, generateSamplePledges } from './data/sampleData';
import { getGoogleSheetsUrl, sendToGoogleSheets, fetchPledgesFromGoogleSheets } from './utils/googleSheets';

const TOTAL_STUDENTS = 21;

const STORAGE_KEYS = {
  TITLE: 'hope_class_title',
  VOTES: 'hope_class_votes',
  PLEDGES: 'hope_class_pledges',
  CHOSEN_CARD: 'hope_class_chosen_card',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('cards');
  const [classTitle, setClassTitle] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.TITLE) || '4학년 우리 반';
  });

  const [votes, setVotes] = useState<StudentVote[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VOTES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [pledges, setPledges] = useState<StudentPledge[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLEDGES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedClassCardId, setSelectedClassCardId] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHOSEN_CARD);
      return saved ? Number(saved) : 1;
    } catch {
      return 1;
    }
  });

  const [activeDetailCard, setActiveDetailCard] = useState<PracticeCard | null>(null);
  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState(false);
  const [isGoogleSheetsConnected, setIsGoogleSheetsConnected] = useState<boolean>(() => {
    return !!getGoogleSheetsUrl();
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TITLE, classTitle);
  }, [classTitle]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(votes));
  }, [votes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLEDGES, JSON.stringify(pledges));
  }, [pledges]);

  useEffect(() => {
    if (selectedClassCardId) {
      localStorage.setItem(STORAGE_KEYS.CHOSEN_CARD, String(selectedClassCardId));
    }
  }, [selectedClassCardId]);

  // Synchronize remote student pledges from Google Sheets so Chromebooks see other classmates' submissions
  const handleSyncFromSheets = useCallback(async () => {
    const url = getGoogleSheetsUrl();
    if (!url) return;

    setIsSyncing(true);
    try {
      const res = await fetchPledgesFromGoogleSheets(url);
      if (res.success && res.pledges && res.pledges.length > 0) {
        setPledges((prev) => {
          const map = new Map<number, StudentPledge>();
          // retain local items
          prev.forEach((p) => map.set(p.studentNumber, p));

          // merge remote items
          res.pledges.forEach((rp, idx) => {
            const sNum = rp.studentNumber || idx + 1;
            const matchedCard =
              PRACTICE_CARDS.find((c) => c.title === rp.cardTitle) ||
              PRACTICE_CARDS.find((c) => c.id === selectedClassCardId) ||
              PRACTICE_CARDS[0];

            map.set(sNum, {
              id: rp.id || `remote-pledge-${sNum}`,
              studentNumber: sNum,
              studentName: rp.studentName || `${sNum}번 학생`,
              cardId: matchedCard.id,
              pledgeText: rp.pledgeText || '',
              stampColor: rp.stampColor || '#DC2626',
              stampAngle: rp.stampAngle ?? (((sNum * 7) % 24) - 12),
              handType: rp.handType || 'right',
              timestamp: typeof rp.timestamp === 'number' ? rp.timestamp : Date.now(),
            });
          });

          return Array.from(map.values()).sort((a, b) => a.studentNumber - b.studentNumber);
        });
        setLastSyncTime(new Date());
      }
    } catch (err) {
      console.warn('Sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [selectedClassCardId]);

  // Periodic polling every 8 seconds when Google Sheets is connected
  useEffect(() => {
    if (!isGoogleSheetsConnected) return;

    // Initial sync on mount
    handleSyncFromSheets();

    const interval = setInterval(() => {
      handleSyncFromSheets();
    }, 8000);

    return () => clearInterval(interval);
  }, [isGoogleSheetsConnected, handleSyncFromSheets]);

  // Vote Handlers
  const handleAddVote = (studentNumber: number, studentName: string, cardId: number) => {
    const newVote: StudentVote = {
      id: `vote-${Date.now()}-${studentNumber}`,
      studentNumber,
      studentName,
      cardId,
      timestamp: Date.now(),
    };
    // Replace if this student number already voted, or append
    setVotes((prev) => {
      const filtered = prev.filter((v) => v.studentNumber !== studentNumber);
      return [...filtered, newVote];
    });

    // Auto-sync to Google Sheets in background if URL configured
    const targetCard = PRACTICE_CARDS.find((c) => c.id === cardId);
    sendToGoogleSheets({
      action: 'vote',
      classTitle,
      studentNumber,
      studentName: studentName || `${studentNumber}번 학생`,
      cardId,
      cardTitle: targetCard?.title || `실천 약속 ${cardId}`,
    }).catch(() => {});
  };

  const handleResetVotes = () => {
    setVotes([]);
  };

  const handleSelectClassPromise = (cardId: number) => {
    setSelectedClassCardId(cardId);
  };

  // Pledge Handlers
  const handleSavePledge = (pledgeData: Omit<StudentPledge, 'id' | 'timestamp'>) => {
    const newPledge: StudentPledge = {
      ...pledgeData,
      id: `pledge-${Date.now()}-${pledgeData.studentNumber}`,
      timestamp: Date.now(),
    };
    setPledges((prev) => {
      const filtered = prev.filter((p) => p.studentNumber !== pledgeData.studentNumber);
      return [...filtered, newPledge];
    });

    // Auto-sync to Google Sheets in background if URL configured
    const targetCard = PRACTICE_CARDS.find((c) => c.id === pledgeData.cardId);
    sendToGoogleSheets({
      action: 'pledge',
      classTitle,
      studentNumber: pledgeData.studentNumber,
      studentName: pledgeData.studentName || `${pledgeData.studentNumber}번 학생`,
      cardTitle: targetCard?.title || '실천 약속',
      pledgeText: pledgeData.pledgeText,
      stampColor: pledgeData.stampColor,
      handType: pledgeData.handType,
    }).then(() => {
      // Immediate pull after submission
      handleSyncFromSheets();
    }).catch(() => {});
  };

  const handleDeletePledge = (id: string) => {
    setPledges((prev) => prev.filter((p) => p.id !== id));
  };

  // Sample data generator for quick teacher demonstration
  const handleFillSampleData = () => {
    const sampleVotes = generateSampleVotes();
    const samplePledges = generateSamplePledges(selectedClassCardId || 1);
    setVotes(sampleVotes);
    setPledges(samplePledges);
    if (!selectedClassCardId) {
      setSelectedClassCardId(1);
    }
  };

  const handleResetAllData = () => {
    setVotes([]);
    setPledges([]);
    setSelectedClassCardId(1);
    localStorage.removeItem(STORAGE_KEYS.VOTES);
    localStorage.removeItem(STORAGE_KEYS.PLEDGES);
    localStorage.removeItem(STORAGE_KEYS.CHOSEN_CARD);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBF0] text-slate-800">
      {/* Electronic Whiteboard Top Navigation & Class Controls */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        classTitle={classTitle}
        onChangeClassTitle={setClassTitle}
        onFillSampleData={handleFillSampleData}
        onResetAllData={handleResetAllData}
        onOpenGoogleSheetsModal={() => setIsGoogleSheetsModalOpen(true)}
        isGoogleSheetsConnected={isGoogleSheetsConnected}
        totalVotesCount={votes.length}
        totalPledgesCount={pledges.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'cards' && (
          <CardsExploreView
            cards={PRACTICE_CARDS}
            onOpenCardDetail={setActiveDetailCard}
            onGoToVote={() => setActiveTab('vote')}
            onGoToPledgeWithCard={(card) => {
              setSelectedClassCardId(card.id);
              setActiveTab('pledge');
            }}
          />
        )}

        {activeTab === 'vote' && (
          <VotingBoard
            cards={PRACTICE_CARDS}
            votes={votes}
            onAddVote={handleAddVote}
            onResetVotes={handleResetVotes}
            selectedClassCardId={selectedClassCardId}
            onSelectClassPromise={handleSelectClassPromise}
            onGoToPledge={() => setActiveTab('pledge')}
            onOpenCardDetail={setActiveDetailCard}
            totalStudentsCount={TOTAL_STUDENTS}
          />
        )}

        {activeTab === 'pledge' && (
          <PledgeCreator
            cards={PRACTICE_CARDS}
            targetCardId={selectedClassCardId || 1}
            onSelectTargetCard={setSelectedClassCardId}
            onSavePledge={handleSavePledge}
            existingPledges={pledges}
            onGoToWall={() => setActiveTab('wall')}
            totalStudentsCount={TOTAL_STUDENTS}
          />
        )}

        {activeTab === 'wall' && (
          <PledgeWall
            classNameTitle={classTitle}
            cards={PRACTICE_CARDS}
            chosenCardId={selectedClassCardId || 1}
            pledges={pledges}
            onAddMorePledge={() => setActiveTab('pledge')}
            onDeletePledge={handleDeletePledge}
            totalStudentsCount={TOTAL_STUDENTS}
            onSyncFromSheets={handleSyncFromSheets}
            isSyncing={isSyncing}
            lastSyncTime={lastSyncTime}
            isGoogleSheetsConnected={isGoogleSheetsConnected}
          />
        )}
      </main>

      {/* Card Detail & Reflection Modal */}
      <CardDetailModal
        card={activeDetailCard}
        onClose={() => setActiveDetailCard(null)}
        onSelectForVote={(card) => {
          setActiveTab('vote');
        }}
        onSelectForPledge={(card) => {
          setSelectedClassCardId(card.id);
          setActiveTab('pledge');
        }}
      />

      {/* Google Sheets Integration & Sync Modal */}
      <GoogleSheetsModal
        isOpen={isGoogleSheetsModalOpen}
        onClose={() => {
          setIsGoogleSheetsModalOpen(false);
          setIsGoogleSheetsConnected(!!getGoogleSheetsUrl());
        }}
        classTitle={classTitle}
        votes={votes}
        pledges={pledges}
        cards={PRACTICE_CARDS}
      />

      {/* Classroom Footer (hidden on print) */}
      <footer className="no-print bg-amber-100/50 border-t border-amber-200 py-6 text-center text-xs text-amber-900/80 font-medium font-dodum">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            월드비전 교실에서 찾은 희망 캠페인 • 초등학교 4학년 2학기 실천 약속 & 손도장 다짐
          </span>
          <span>
            전자칠판 터치 지원 • 실시간 참여형 투표 • 학급 서약서 인쇄 지원
          </span>
        </div>
      </footer>
    </div>
  );
}
