import { PlayerStats, PlayerContribution, RatingBreakdown, PaymentReliability } from '@/types';

export function calculateRating(
  stats: Pick<PlayerStats, 'matches_played' | 'goals' | 'assists' | 'wins' | 'losses' | 'mvp_count' | 'yellow_cards' | 'red_cards' | 'attendance_percentage' | 'clean_sheets' | 'saves' | 'goals_conceded' | 'late_cancellations' | 'no_shows' | 'is_goalkeeper'>,
  contribution: Pick<PlayerContribution, 'availability_response_points' | 'assigned_position_points' | 'versatility_points' | 'substitute_points' | 'organization_points' | 'captain_points'>
): RatingBreakdown {
  const isNewPlayer = stats.matches_played === 0;

  // 1. Performance Score (0–50)
  let performanceRaw: number;
  if (stats.is_goalkeeper) {
    performanceRaw =
      stats.clean_sheets * 5 +
      stats.saves * 1 +
      stats.wins * 2 +
      stats.mvp_count * 5 -
      stats.goals_conceded * 1 -
      stats.losses * 1;
  } else {
    performanceRaw =
      stats.goals * 4 +
      stats.assists * 3 +
      stats.wins * 2 +
      stats.mvp_count * 5 -
      stats.losses * 1;
  }
  const performanceScore = Math.min(50, Math.max(0, performanceRaw));

  // 2. Attendance Score (0–20)
  const attendanceScore = (stats.attendance_percentage / 100) * 20;

  // 3. Team Contribution Score (0–20)
  const rawContrib =
    contribution.availability_response_points +
    contribution.assigned_position_points +
    contribution.versatility_points +
    contribution.substitute_points +
    contribution.organization_points +
    contribution.captain_points;
  const contributionScore = Math.min(20, Math.max(0, rawContrib));

  // 4. Discipline Score (0–10)
  const disciplineRaw =
    10 -
    stats.yellow_cards * 1 -
    stats.red_cards * 3 -
    stats.late_cancellations * 2 -
    stats.no_shows * 3;
  const disciplineScore = Math.max(0, disciplineRaw);

  const rawTotal = performanceScore + attendanceScore + contributionScore + disciplineScore;

  let finalRating: number;
  if (isNewPlayer) {
    finalRating = 0;
  } else {
    finalRating = Math.min(99, Math.max(40, Math.round(rawTotal)));
  }

  let ratingLabel = 'New Player';
  if (!isNewPlayer) {
    if (finalRating >= 90) ratingLabel = 'Elite';
    else if (finalRating >= 80) ratingLabel = 'Key Player';
    else if (finalRating >= 70) ratingLabel = 'Reliable';
    else if (finalRating >= 60) ratingLabel = 'Developing';
    else if (finalRating >= 50) ratingLabel = 'Rotation Player';
    else ratingLabel = 'Needs Improvement';
  }

  return {
    performanceScore: round1(performanceScore),
    attendanceScore: round1(attendanceScore),
    contributionScore: round1(contributionScore),
    disciplineScore: round1(disciplineScore),
    finalRating,
    ratingLabel,
    isNewPlayer,
  };
}

export function getRatingGradient(rating: number, isNew: boolean): string {
  if (isNew) return 'from-slate-600 to-slate-500';
  if (rating >= 90) return 'from-yellow-500 to-amber-400';
  if (rating >= 80) return 'from-slate-500 to-slate-400';
  if (rating >= 70) return 'from-emerald-700 to-emerald-500';
  if (rating >= 60) return 'from-blue-700 to-blue-500';
  if (rating >= 50) return 'from-purple-700 to-purple-500';
  return 'from-gray-600 to-gray-500';
}

export function getRatingAccent(rating: number, isNew: boolean): string {
  if (isNew) return '#64748b';
  if (rating >= 90) return '#f59e0b';
  if (rating >= 80) return '#94a3b8';
  if (rating >= 70) return '#1a5c3a';
  if (rating >= 60) return '#2563eb';
  if (rating >= 50) return '#7c3aed';
  return '#6b7280';
}

export function calculatePaymentReliability(
  payments: Array<{ status: string }>
): PaymentReliability {
  const total = payments.length;
  if (total === 0) {
    return { percentage: 0, label: 'No Data', totalMonths: 0, paidMonths: 0, partialMonths: 0, unpaidMonths: 0 };
  }
  const paid = payments.filter(p => p.status === 'paid' || p.status === 'overpaid').length;
  const partial = payments.filter(p => p.status === 'partial').length;
  const unpaid = payments.filter(p => p.status === 'unpaid').length;
  const percentage = Math.round((paid / total) * 100);

  let label = 'Poor';
  if (percentage >= 90) label = 'Excellent';
  else if (percentage >= 75) label = 'Good';
  else if (percentage >= 50) label = 'Average';

  return { percentage, label, totalMonths: total, paidMonths: paid, partialMonths: partial, unpaidMonths: unpaid };
}

function round1(n: number) { return Math.round(n * 10) / 10; }
