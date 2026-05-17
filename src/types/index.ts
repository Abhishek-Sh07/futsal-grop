export type Role = 'admin' | 'player';
export type PlayerStatus = 'active' | 'inactive';
export type PaymentStatus = 'paid' | 'unpaid' | 'partial' | 'overpaid';
export type PaymentMethod = 'cash' | 'esewa' | 'khalti' | 'bank_transfer' | 'other';
export type ExpenseCategory =
  | 'ground_booking'
  | 'jersey_kit'
  | 'tournament_fee'
  | 'water_drinks'
  | 'referee_fee'
  | 'medical'
  | 'miscellaneous';
export type TransactionType = 'income' | 'expense';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  email: string;
  role: Role;
  status: PlayerStatus;
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  monthly_fee: number;
  status: PlayerStatus;
  joined_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  player_id: string;
  month: number;
  year: number;
  amount_due: number;
  paid_amount: number;
  remaining_amount: number;
  status: PaymentStatus;
  payment_method: PaymentMethod | null;
  paid_date: string | null;
  notes: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  player?: Player;
}

export interface PaymentLog {
  id: string;
  payment_id: string;
  action_type: string;
  old_amount: number | null;
  new_amount: number | null;
  old_status: PaymentStatus | null;
  new_status: PaymentStatus | null;
  changed_by: string | null;
  changed_at: string;
  notes: string | null;
}

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  expense_date: string;
  paid_by: string | null;
  notes: string | null;
  receipt_url: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  reference_id: string | null;
  description: string;
  amount: number;
  created_by: string | null;
  created_at: string;
}

export interface DashboardStats {
  totalPlayers: number;
  activePlayers: number;
  monthlyTarget: number;
  totalCollected: number;
  pendingAmount: number;
  totalExpenses: number;
  currentBalance: number;
  paidCount: number;
  unpaidCount: number;
  partialCount: number;
  overpaidCount: number;
}

export interface MonthYear {
  month: number;
  year: number;
}

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, string> = {
  ground_booking: 'Ground Booking',
  jersey_kit: 'Jersey / Kit',
  tournament_fee: 'Tournament Fee',
  water_drinks: 'Water / Drinks',
  referee_fee: 'Referee Fee',
  medical: 'Medical / First Aid',
  miscellaneous: 'Miscellaneous',
};

export const PAYMENT_METHODS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  esewa: 'eSewa',
  khalti: 'Khalti',
  bank_transfer: 'Bank Transfer',
  other: 'Other',
};

export type MatchType = '5v5' | '7v7';
export type PlayerRole = 'starter' | 'substitute' | 'unavailable';

export interface Formation {
  id: string;
  name: string;
  match_type: MatchType;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface FormationPlayer {
  id: string;
  formation_id: string;
  player_id: string;
  role: PlayerRole;
  position_x: number | null;
  position_y: number | null;
}
