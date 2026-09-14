export interface CardBadge {
  label: string;
  color: 'orange' | 'blue' | 'pink' | 'mint' | 'green' | 'red';
  shape: 'heart' | 'diamond' | 'flower' | 'arch' | 'polygon';
}

export interface PracticeCard {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  badges: CardBadge[];
  corePower: string;
  reflectionQuestion: string;
  classroomExamples: string[];
}

export interface StudentVote {
  id: string;
  studentNumber: number;
  studentName: string;
  cardId: number;
  timestamp: number;
}

export interface StudentPledge {
  id: string;
  studentNumber: number;
  studentName: string;
  cardId: number;
  pledgeText: string;
  stampColor: string;
  stampAngle: number;
  handType: 'left' | 'right';
  timestamp: number;
  positionX?: number; // relative % for placement on pledge tree
  positionY?: number;
}

export type ActiveTab = 'cards' | 'vote' | 'pledge' | 'wall';
