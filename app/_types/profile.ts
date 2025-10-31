export type UserType = "student" | "worker" | "parent";

export type CategoryGroup = "daily" | "monthly";

export type CurrencyCode = "AZN" | "USD" | "EUR";

export type ThemeMode = "light" | "dark";
export type LanguageCode = "az" | "ru" | "en";
export type StudentIncomePreference = "working" | "stipend" | "mixed";

export type Category = {
  id: string;
  name: string;
  description: string;
  group: CategoryGroup;
  isCustom?: boolean;
};

export type Expense = {
  id: string;
  categoryId: string;
  title: string;
  amount: number;
  createdAt: string;
};

export type Income = {
  id: string;
  source: string;
  amount: number;
  receivedAt: string;
  reminderId?: string;
};

export type ProfileDetails = {
  firstName: string;
  lastName: string;
  birthDate: string | null;
};

export type IncomeSourceType =
  | "salary"
  | "pension"
  | "freelance"
  | "other";

export type IncomeFrequency = "monthly" | "weekly" | "irregular";

export type IncomeReminder = {
  id: string;
  sourceType: IncomeSourceType;
  label: string;
  frequency: IncomeFrequency;
  dayOfMonth?: number;
  weekday?: number;
  nextTrigger: string;
  autoAddOnConfirm: boolean;
  windowStartDay?: number;
  windowEndDay?: number;
  autoRenew?: boolean;
  defaultAmount?: number;
  remindHour: number;
  remindMinute: number;
  lastTriggeredAt?: string | null;
  lastReceivedAt?: string | null;
  notes?: string;
};
