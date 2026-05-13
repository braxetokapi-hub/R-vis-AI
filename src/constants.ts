import { DailyChallenge } from './types';

export const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: 'math_speed',
    type: 'speed',
    target: 5,
    subject: 'Mathématiques',
    timeLimit: 120, // 2 minutes
    rewardPoints: 500,
    badgeId: 'speed'
  },
  {
    id: 'history_accuracy',
    type: 'correct_answers',
    target: 3,
    subject: 'Histoire-Géo',
    rewardPoints: 300,
    badgeId: 'expert'
  },
  {
    id: 'science_marathon',
    type: 'subject_mastery',
    target: 10,
    subject: 'Physique-Chimie',
    rewardPoints: 400,
    badgeId: 'marathon'
  }
];
