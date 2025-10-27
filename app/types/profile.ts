export type UserType = "student" | "worker" | "parent";

export type CategoryGroup = "daily" | "monthly";

export type CurrencyCode = "AZN" | "USD" | "EUR";

export type ThemeMode = "light" | "dark";

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
};

export type ProfileDetails = {
  firstName: string;
  lastName: string;
  birthDate: string | null;
};
