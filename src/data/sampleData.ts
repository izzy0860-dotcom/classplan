import { StudentVote, StudentPledge } from '../types';

const SAMPLE_NAMES = [
  '김서준', '이수아', '박도윤', '최하은', '정민재',
  '윤지우', '강시우', '조예은', '한서진', '유채원',
  '백은우', '송하윤', '문지호', '신서윤', '오현우',
  '임지원', '권태윤', '서아린', '황민석', '배다은',
  '정수민'
];

const STAMP_COLORS = [
  '#DC2626', '#EA580C', '#D97706', '#16A34A', '#2563EB', '#9333EA', '#E11D48'
];

export const generateSampleVotes = (): StudentVote[] => {
  // Let card 1 ("입장 바꿔 생각하기") and card 3 ("화내지 않고 마음 말하기") have popular votes
  const cardDistribution = [1, 1, 1, 1, 1, 1, 2, 2, 3, 3, 3, 3, 4, 5, 6, 7, 7, 7, 8, 8];

  return SAMPLE_NAMES.map((name, index) => ({
    id: `vote-${index + 1}`,
    studentNumber: index + 1,
    studentName: name,
    cardId: cardDistribution[index % cardDistribution.length],
    timestamp: Date.now() - (20 - index) * 60000,
  }));
};

export const generateSamplePledges = (targetCardId: number = 1): StudentPledge[] => {
  const samplePledgeTexts: Record<number, string[]> = {
    1: [
      '친구가 속상해할 때 먼저 다가가서 그 친구의 마음을 헤아려볼게요!',
      '내 생각만 고집하지 않고 친구의 입장에서 한 번 더 생각할게요!',
      '친구의 장점과 노력을 먼저 인정하고 따뜻하게 칭찬할게요!',
      '친구가 실수했을 때 비웃지 않고 먼저 손잡아 줄게요!',
      '짝꿍과 이야기할 때 상대방의 마음을 먼저 생각하고 대답할게요!'
    ],
    3: [
      '화가 나도 소리치지 않고 차분한 목소리로 내 마음을 설명할게요!',
      '짜증 대신 "너의 행동 때문에 속상했어"라고 나-전달법으로 말할게요!',
      '친구와 다툼이 생기면 서로 대화로 풀 수 있도록 먼저 차분해질게요!'
    ]
  };

  const defaultTexts = samplePledgeTexts[targetCardId] || samplePledgeTexts[1];

  return SAMPLE_NAMES.slice(0, 16).map((name, index) => ({
    id: `pledge-${index + 1}`,
    studentNumber: index + 1,
    studentName: name,
    cardId: targetCardId,
    pledgeText: defaultTexts[index % defaultTexts.length],
    stampColor: STAMP_COLORS[index % STAMP_COLORS.length],
    stampAngle: ((index * 7) % 25) - 12,
    handType: index % 3 === 0 ? 'left' : 'right',
    timestamp: Date.now() - (16 - index) * 120000,
  }));
};
