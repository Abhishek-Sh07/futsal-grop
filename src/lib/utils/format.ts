import { MONTHS } from '@/types';

export function formatNPR(amount: number): string {
  return `NPR ${amount.toLocaleString('en-NP')}`;
}

export function formatMonthYear(month: number, year: number): string {
  return `${MONTHS[month - 1]} ${year}`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export function getMonthOptions(count = 12): Array<{ month: number; year: number; label: string }> {
  const options = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      label: formatMonthYear(d.getMonth() + 1, d.getFullYear()),
    });
  }
  return options;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
