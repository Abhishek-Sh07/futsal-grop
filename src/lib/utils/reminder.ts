import { formatNPR, formatMonthYear } from './format';

export function generateReminderMessage(
  playerName: string,
  amount: number,
  month: number,
  year: number
): string {
  return `Hi ${playerName}, your futsal monthly fee of ${formatNPR(amount)} for ${formatMonthYear(month, year)} is still pending. Please clear it when possible. Thank you! 🙏`;
}

export function getWhatsAppUrl(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const withCountry = cleaned.startsWith('977') ? cleaned : `977${cleaned}`;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
}
