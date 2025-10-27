import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { CATEGORY_PRESETS } from "../constants/categoryPresets";
import {
  Category,
  CategoryGroup,
  Expense,
  UserType,
} from "../types/profile";

type ProfileContextValue = {
  userType?: UserType;
  categories: Category[];
  customCategories: Category[];
  budget: number | null;
  expenses: Expense[];
  totalExpenses: number;
  setUserType: (type: UserType) => void;
  setSelectedCategories: (categories: Category[]) => void;
  addCustomCategory: (category: {
    name: string;
    description: string;
    group: CategoryGroup;
  }) => Category;
  setBudget: (amount: number) => void;
  addExpense: (expense: {
    categoryId: string;
    title: string;
    amount: number;
  }) => void;
  resetProfile: () => void;
  getPresetCategories: (type: UserType) => Category[];
};

const ProfileContext = createContext<ProfileContextValue | undefined>(
  undefined,
);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [userType, setUserTypeState] = useState<UserType | undefined>(
    undefined,
  );
  const [selectedCategories, setSelectedCategoriesState] = useState<Category[]>(
    [],
  );
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [budget, setBudgetState] = useState<number | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, item) => sum + item.amount, 0),
    [expenses],
  );

  const setUserType = (type: UserType) => {
    setUserTypeState(type);
    setSelectedCategoriesState([]);
    setCustomCategories([]);
    setBudgetState(null);
    setExpenses([]);
  };

  const setSelectedCategories = (categories: Category[]) => {
    setSelectedCategoriesState(categories);
  };

  const addCustomCategory = (category: {
    name: string;
    description: string;
    group: CategoryGroup;
  }): Category => {
    const newCategory: Category = {
      id: `custom-${Date.now()}`,
      ...category,
      isCustom: true,
    };
    setCustomCategories((prev) => [...prev, newCategory]);
    setSelectedCategoriesState((prev) => [...prev, newCategory]);
    return newCategory;
  };

  const setBudget = (amount: number) => {
    setBudgetState(amount);
  };

  const addExpense = (expense: {
    categoryId: string;
    title: string;
    amount: number;
  }) => {
    setExpenses((prev) => [
      ...prev,
      {
        id: `expense-${Date.now()}`,
        ...expense,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const resetProfile = () => {
    setUserTypeState(undefined);
    setSelectedCategoriesState([]);
    setCustomCategories([]);
    setBudgetState(null);
    setExpenses([]);
  };

  const getPresetCategories = useCallback(
    (type: UserType) => CATEGORY_PRESETS[type],
    [],
  );

  const value = useMemo(
    () => ({
      userType,
      categories: selectedCategories,
      customCategories,
      budget,
      expenses,
      totalExpenses,
      setUserType,
      setSelectedCategories,
      addCustomCategory,
      setBudget,
      addExpense,
      resetProfile,
      getPresetCategories,
    }),
    [
      userType,
      selectedCategories,
      customCategories,
      budget,
      expenses,
      totalExpenses,
      getPresetCategories,
    ],
  );

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfile must be used within ProfileProvider");
  }
  return ctx;
}
