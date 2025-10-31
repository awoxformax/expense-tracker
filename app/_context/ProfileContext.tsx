import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { CATEGORY_PRESETS } from "../_constants/categoryPresets";
import {
  Category,
  CategoryGroup,
  CurrencyCode,
  Expense,
  Income,
  IncomeReminder,
  IncomeFrequency,
  IncomeSourceType,
  LanguageCode,
  ProfileDetails,
  StudentIncomePreference,
  ThemeMode,
  UserType,
} from "../_types/profile";
import { formatCurrency } from "../_utils/format";

type NotificationRefState = {
  daily?: string;
  monthly?: string;
  limitWarningSent: boolean;
  incomeReminders: Record<string, string>;
};

type PersistedState = {
  userType?: UserType;
  selectedCategories: Category[];
  customCategories: Category[];
  budget: number | null;
  expenses: Expense[];
  profile: ProfileDetails;
  incomes: Income[];
  incomeReminders: IncomeReminder[];
  currency: CurrencyCode;
  theme: ThemeMode;
  notificationsEnabled: boolean;
  language?: LanguageCode;
  languageSelected?: boolean;
  studentIncomePreference?: StudentIncomePreference | null;
};

const STORAGE_KEY = "expense-tracker/profile-state-v1";

const DEFAULT_PROFILE: ProfileDetails = {
  firstName: "",
  lastName: "",
  birthDate: null,
};

const detectInitialLanguage = (): LanguageCode => {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase();
    if (locale.startsWith("ru")) {
      return "ru";
    }
    if (locale.startsWith("en")) {
      return "en";
    }
  } catch (error) {
    console.warn("Dil avtomatik seçilmədi", error);
  }
  return "az";
};

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

const startOfDay = (value: Date) => {
  const next = new Date(value);
  next.setHours(0, 0, 0, 0);
  return next;
};

const daysInMonth = (year: number, monthIndex: number) =>
  new Date(year, monthIndex + 1, 0).getDate();

const computeNextTriggerDate = (
  reminder: Pick<
    IncomeReminder,
    "frequency" | "dayOfMonth" | "weekday" | "nextTrigger"
  >,
  fromDate?: Date,
) => {
  const base = fromDate
    ? startOfDay(fromDate)
    : startOfDay(
        new Date(
          reminder.nextTrigger ? `${reminder.nextTrigger}T00:00:00` : Date.now(),
        ),
      );

  if (Number.isNaN(base.getTime())) {
    return toIsoDate(startOfDay(new Date()));
  }

  switch (reminder.frequency) {
    case "monthly": {
      const desiredDay =
        reminder.dayOfMonth ?? Math.max(1, Math.min(28, base.getDate()));
      const next = new Date(base);
      next.setMonth(next.getMonth() + 1);
      const monthLimit = daysInMonth(next.getFullYear(), next.getMonth());
      next.setDate(Math.min(desiredDay, monthLimit));
      return toIsoDate(next);
    }
    case "weekly": {
      const targetWeekday =
        typeof reminder.weekday === "number"
          ? reminder.weekday
          : base.getDay();
      const diff = (targetWeekday - base.getDay() + 7) % 7 || 7;
      const next = new Date(base);
      next.setDate(next.getDate() + diff);
      return toIsoDate(next);
    }
    case "irregular":
    default: {
      const next = new Date(base);
      next.setDate(next.getDate() + 30);
      return toIsoDate(next);
    }
  }
};

const normalizeTriggerDate = (value?: string) => {
  if (!value) {
    return toIsoDate(startOfDay(new Date()));
  }
  const parsed = startOfDay(new Date(`${value}T00:00:00`));
  if (Number.isNaN(parsed.getTime())) {
    return toIsoDate(startOfDay(new Date()));
  }
  return toIsoDate(parsed);
};

type ProfileContextValue = {
  userType?: UserType;
  profile: ProfileDetails;
  categories: Category[];
  customCategories: Category[];
  budget: number | null;
  language: LanguageCode;
  languageSelected: boolean;
  studentIncomePreference: StudentIncomePreference | null;
  currency: CurrencyCode;
  theme: ThemeMode;
  expenses: Expense[];
  incomes: Income[];
  incomeReminders: IncomeReminder[];
  totalExpenses: number;
  totalIncome: number;
  balance: number;
  notificationsEnabled: boolean;
  isHydrated: boolean;
  setUserType: (type: UserType) => void;
  updateProfile: (updates: Partial<ProfileDetails>) => void;
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
    createdAt?: string;
  }) => void;
  addIncome: (income: {
    source: string;
    amount: number;
    receivedAt?: string;
    reminderId?: string;
  }) => void;
  removeIncome: (id: string) => void;
  addIncomeReminder: (input: {
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
    remindHour?: number;
    remindMinute?: number;
    notes?: string;
  }) => IncomeReminder;
  updateIncomeReminder: (
    id: string,
    updates: Partial<IncomeReminder>,
  ) => void;
  confirmIncomeReminder: (
    id: string,
    amount: number,
    receivedAt?: string,
  ) => void;
  skipIncomeReminder: (id: string, nextTrigger?: string) => void;
  removeIncomeReminder: (id: string) => void;
  resetProfile: () => void;
  getPresetCategories: (type: UserType) => Category[];
  setCurrency: (currency: CurrencyCode) => void;
  setTheme: (theme: ThemeMode) => void;
  exportProfileData: () => Promise<string>;
  toggleNotifications: (enabled: boolean) => Promise<void>;
  setLanguage: (code: LanguageCode) => void;
  setStudentIncomePreference: (
    preference: StudentIncomePreference | null,
  ) => void;
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

//if (typeof Notifications.setNotificationHandler === "function") {
  //Notifications.setNotificationHandler({
    //handleNotification: async () => ({
     // shouldPlaySound: false,
      //shouldSetBadge: false,
      //shouldShowAlert: true,
   // }),
  //});
//}

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
  const [profile, setProfile] = useState<ProfileDetails>(DEFAULT_PROFILE);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [incomeReminders, setIncomeReminders] = useState<IncomeReminder[]>([]);
  const [language, setLanguageState] = useState<LanguageCode>(
    () => detectInitialLanguage(),
  );
  const [languageSelected, setLanguageSelected] = useState(false);
  const [studentIncomePreference, setStudentIncomePreferenceState] =
    useState<StudentIncomePreference | null>(null);
  const [currency, setCurrencyState] = useState<CurrencyCode>("AZN");
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [notificationsEnabled, setNotificationsEnabledState] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const notificationStateRef = useRef<NotificationRefState>({
    limitWarningSent: false,
    incomeReminders: {},
  });

  useEffect(() => {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.DEFAULT,
      }).catch(() => {
        // noop - channel may already exist or notifications unsupported
      });
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as PersistedState;
          setUserTypeState(parsed.userType);
          setSelectedCategoriesState(parsed.selectedCategories || []);
          setCustomCategories(parsed.customCategories || []);
          setBudgetState(
            typeof parsed.budget === "number" ? parsed.budget : null,
          );
          setExpenses(parsed.expenses || []);
          setProfile(parsed.profile || DEFAULT_PROFILE);
          setIncomes(parsed.incomes || []);
          setIncomeReminders(parsed.incomeReminders || []);
          setLanguageState(parsed.language ?? detectInitialLanguage());
          setLanguageSelected(parsed.languageSelected ?? false);
          setStudentIncomePreferenceState(
            parsed.studentIncomePreference ?? null,
          );
          setCurrencyState(parsed.currency || "AZN");
          setThemeState(parsed.theme || "light");
          setNotificationsEnabledState(parsed.notificationsEnabled ?? false);
        }
      } catch (error) {
        console.warn("ProfileContext: failed to load state", error);
      } finally {
        setIsHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    const payload: PersistedState = {
      userType,
      selectedCategories,
      customCategories,
      budget,
      expenses,
      profile,
      incomes,
      incomeReminders,
      language,
      languageSelected,
      studentIncomePreference,
      currency,
      theme,
      notificationsEnabled,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(
      (error) => {
        console.warn("ProfileContext: failed to persist state", error);
      },
    );
  }, [
    userType,
    selectedCategories,
    customCategories,
    budget,
    expenses,
    profile,
    incomes,
    incomeReminders,
    language,
    languageSelected,
    studentIncomePreference,
    currency,
    theme,
    notificationsEnabled,
    isHydrated,
  ]);

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, item) => sum + item.amount, 0),
    [expenses],
  );

  const totalIncome = useMemo(
    () => incomes.reduce((sum, item) => sum + item.amount, 0),
    [incomes],
  );

  const balance = useMemo(
    () => parseFloat((totalIncome - totalExpenses).toFixed(2)),
    [totalIncome, totalExpenses],
  );

  const calculateTodaysExpenses = useCallback(() => {
    const today = new Date();
    return expenses.reduce((sum, item) => {
      const created = new Date(item.createdAt);
      const isSameDay =
        created.getFullYear() === today.getFullYear() &&
        created.getMonth() === today.getMonth() &&
        created.getDate() === today.getDate();
      return isSameDay ? sum + item.amount : sum;
    }, 0);
  }, [expenses]);

  const requestNotificationPermission = useCallback(async () => {
    if (Platform.OS === "web") {
      Alert.alert("Bildirişlər dəstəklənmir", "Web versiyada bildiriş yoxdur.");
      return false;
    }
    try {
      const settings = await Notifications.getPermissionsAsync();
      if (
        settings.granted ||
        settings.status === Notifications.PermissionStatus.GRANTED
      ) {
        return true;
      }
      const result = await Notifications.requestPermissionsAsync();
      return (
        result.granted ||
        result.status === Notifications.PermissionStatus.GRANTED
      );
    } catch (error) {
      console.warn("Bildiriş icazəsi alınmadı", error);
      return false;
    }
  }, []);

  const scheduleMonthlyReminder = useCallback(async () => {
    if (!notificationsEnabled || Platform.OS === "web") {
      return;
    }
    try {
      if (notificationStateRef.current.monthly) {
        await Notifications.cancelScheduledNotificationAsync(
          notificationStateRef.current.monthly,
        );
      }
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Sabah maaş günü 💰",
          body: "Ayın 1-i üçün planlarını xatırla.",
        },
        trigger: {
          day: 1,
          hour: 9,
          minute: 0,
          repeats: true,
        } as Notifications.CalendarTriggerInput,
      });
      notificationStateRef.current.monthly = id;
    } catch (error) {
      console.warn("Aylıq bildiriş qurulmadı", error);
    }
  }, [notificationsEnabled]);

  const scheduleDailySummary = useCallback(
    async (total?: number) => {
      if (!notificationsEnabled || Platform.OS === "web") {
        return;
      }
      try {
        if (notificationStateRef.current.daily) {
          await Notifications.cancelScheduledNotificationAsync(
            notificationStateRef.current.daily,
          );
        }
        const todaysTotal =
          typeof total === "number" ? total : calculateTodaysExpenses();
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: "Gündəlik xərclər",
            body: `Bu gün xərclərin ${formatCurrency(
              todaysTotal,
              currency,
            )} oldu.`,
          },
          trigger: {
            hour: 0,
            minute: 0,
            repeats: true,
          } as Notifications.CalendarTriggerInput,
        });
        notificationStateRef.current.daily = id;
      } catch (error) {
        console.warn("Gündəlik bildiriş qurulmadı", error);
      }
    },
    [calculateTodaysExpenses, currency, notificationsEnabled],
  );

  const toggleNotifications = useCallback(
    async (enabled: boolean) => {
      if (enabled) {
        const granted = await requestNotificationPermission();
        if (!granted) {
          return;
        }
        setNotificationsEnabledState(true);
      } else {
        setNotificationsEnabledState(false);
        notificationStateRef.current.limitWarningSent = false;
        const { daily, monthly, incomeReminders: reminderMap } =
          notificationStateRef.current;
        notificationStateRef.current = {
          limitWarningSent: false,
          incomeReminders: {},
        };
        try {
          if (daily) {
            await Notifications.cancelScheduledNotificationAsync(daily);
          }
          if (monthly) {
            await Notifications.cancelScheduledNotificationAsync(monthly);
          }
          await Promise.all(
            Object.values(reminderMap ?? {}).map((id) =>
              Notifications.cancelScheduledNotificationAsync(id),
            ),
          );
        } catch (error) {
          console.warn("Bildirişlər dayandırılmadı", error);
        }
      }
    },
    [requestNotificationPermission],
  );

  useEffect(() => {
    if (!notificationsEnabled) {
      return;
    }
    scheduleMonthlyReminder();
    scheduleDailySummary();
  }, [notificationsEnabled, scheduleMonthlyReminder, scheduleDailySummary]);

  useEffect(() => {
    if (!notificationsEnabled) {
      return;
    }
    scheduleDailySummary();
  }, [notificationsEnabled, expenses, currency, scheduleDailySummary]);

  useEffect(() => {
    if (!notificationsEnabled || Platform.OS === "web") {
      Object.keys(notificationStateRef.current.incomeReminders).forEach(
        (reminderId) => {
          cancelIncomeReminderNotification(reminderId);
        },
      );
      notificationStateRef.current.incomeReminders = {};
      return;
    }
    incomeReminders.forEach((reminder) => {
      scheduleIncomeReminderNotification(reminder);
    });
  }, [
    cancelIncomeReminderNotification,
    incomeReminders,
    notificationsEnabled,
    scheduleIncomeReminderNotification,
  ]);

  useEffect(() => {
    if (!notificationsEnabled) {
      notificationStateRef.current.limitWarningSent = false;
      return;
    }
    if (!budget || budget <= 0) {
      notificationStateRef.current.limitWarningSent = false;
      return;
    }
    const ratio = totalExpenses / budget;
    if (ratio >= 0.8 && !notificationStateRef.current.limitWarningSent) {
      if (Platform.OS !== "web") {
        Notifications.scheduleNotificationAsync({
          content: {
            title: "Büdcə xəbərdarlığı",
            body: `Bu ay limitin 80%-ni keçdin. Cari xərclər: ${formatCurrency(
              totalExpenses,
              currency,
            )}.`,
          },
          trigger: null,
        }).catch((error) => {
          console.warn("Xərc limit bildirişi göndərilmədi", error);
        });
      }
      notificationStateRef.current.limitWarningSent = true;
    } else if (ratio < 0.8) {
      notificationStateRef.current.limitWarningSent = false;
    }
  }, [notificationsEnabled, budget, totalExpenses, currency]);

  const setUserType = useCallback((type: UserType) => {
    setUserTypeState(type);
    setSelectedCategoriesState([]);
    setCustomCategories([]);
    setBudgetState(null);
    setExpenses([]);
    setStudentIncomePreferenceState(null);
  }, []);

  const setSelectedCategories = useCallback((categories: Category[]) => {
    setSelectedCategoriesState(categories);
  }, []);

  const addCustomCategory = useCallback(
    (category: { name: string; description: string; group: CategoryGroup }) => {
      const newCategory: Category = {
        id: `custom-${Date.now()}`,
        ...category,
        isCustom: true,
      };
      setCustomCategories((prev) => [...prev, newCategory]);
      setSelectedCategoriesState((prev) => [...prev, newCategory]);
      return newCategory;
    },
    [],
  );

  const setLanguage = useCallback((code: LanguageCode) => {
    setLanguageState(code);
    setLanguageSelected(true);
  }, []);

  const setStudentIncomePreference = useCallback(
    (preference: StudentIncomePreference | null) => {
      setStudentIncomePreferenceState(preference);
    },
    [],
  );

  const setBudget = useCallback((amount: number) => {
    setBudgetState(parseFloat(amount.toFixed(2)));
  }, []);

  const addExpense = useCallback(
    (expense: {
      categoryId: string;
      title: string;
      amount: number;
      createdAt?: string;
    }) => {
      setExpenses((prev) => [
        ...prev,
        {
          id: `expense-${Date.now()}`,
          categoryId: expense.categoryId,
          title: expense.title,
          amount: parseFloat(expense.amount.toFixed(2)),
          createdAt: expense.createdAt ?? new Date().toISOString(),
        },
      ]);
    },
    [],
  );

  const cancelIncomeReminderNotification = useCallback(
    async (reminderId: string) => {
      if (Platform.OS === "web") {
        delete notificationStateRef.current.incomeReminders[reminderId];
        return;
      }
      const scheduledId =
        notificationStateRef.current.incomeReminders[reminderId];
      if (!scheduledId) {
        return;
      }
      try {
        await Notifications.cancelScheduledNotificationAsync(scheduledId);
      } catch (error) {
        console.warn("Gəlir xatırlatması ləğv olunmadı", error);
      } finally {
        delete notificationStateRef.current.incomeReminders[reminderId];
      }
    },
    [],
  );

  const scheduleIncomeReminderNotification = useCallback(
    async (reminder: IncomeReminder) => {
      if (!notificationsEnabled || Platform.OS === "web") {
        return;
      }
      const triggerDate = startOfDay(
        new Date(`${reminder.nextTrigger}T00:00:00`),
      );
      if (Number.isNaN(triggerDate.getTime())) {
        return;
      }
      triggerDate.setHours(reminder.remindHour, reminder.remindMinute, 0, 0);
      const now = new Date();
      if (triggerDate.getTime() <= now.getTime()) {
        triggerDate.setTime(now.getTime() + 60 * 1000);
      }
      await cancelIncomeReminderNotification(reminder.id);
      try {
        const amountHint = reminder.defaultAmount
          ? ` — ${formatCurrency(reminder.defaultAmount, currency)}`
          : "";
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `Gəlir xatırlatması • ${reminder.label}`,
            body: `Bu gün ${reminder.label} üçün gəlirinizi təsdiqləyin${amountHint}.`,
            data: { reminderId: reminder.id },
          },
          trigger: triggerDate,
        });
        notificationStateRef.current.incomeReminders[reminder.id] =
          notificationId;
      } catch (error) {
        console.warn("Gəlir xatırlatması qurulmadı", error);
      }
    },
    [cancelIncomeReminderNotification, currency, notificationsEnabled],
  );

  const addIncome = useCallback(
    (income: {
      source: string;
      amount: number;
      receivedAt?: string;
      reminderId?: string;
    }) => {
      setIncomes((prev) => [
        {
          id: `income-${Date.now()}`,
          source: income.source,
          amount: parseFloat(income.amount.toFixed(2)),
          receivedAt: income.receivedAt ?? new Date().toISOString(),
          reminderId: income.reminderId,
        },
        ...prev,
      ]);
    },
    [],
  );

  const removeIncome = useCallback((id: string) => {
    setIncomes((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addIncomeReminder = useCallback(
    (input: {
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
      remindHour?: number;
      remindMinute?: number;
      notes?: string;
    }): IncomeReminder => {
      const normalizedTrigger = normalizeTriggerDate(input.nextTrigger);
      const baseDate = startOfDay(new Date(`${normalizedTrigger}T00:00:00`));
      const reminder: IncomeReminder = {
        id: `income-reminder-${Date.now()}`,
        sourceType: input.sourceType,
        label: input.label,
        frequency: input.frequency,
        dayOfMonth:
          input.frequency === "monthly"
            ? Math.max(
                1,
                Math.min(
                  28,
                  input.dayOfMonth ?? baseDate.getDate(),
                ),
              )
            : input.dayOfMonth,
        weekday:
          input.frequency === "weekly"
            ? input.weekday ?? baseDate.getDay()
            : input.weekday,
        nextTrigger: normalizedTrigger,
        autoAddOnConfirm: input.autoAddOnConfirm,
        windowStartDay: input.windowStartDay,
        windowEndDay: input.windowEndDay,
        autoRenew: input.autoRenew ?? false,
        defaultAmount:
          typeof input.defaultAmount === "number"
            ? parseFloat(input.defaultAmount.toFixed(2))
            : undefined,
        remindHour: input.remindHour ?? 9,
        remindMinute: input.remindMinute ?? 0,
        lastTriggeredAt: null,
        lastReceivedAt: null,
        notes: input.notes,
      };
      setIncomeReminders((prev) => [...prev, reminder]);
      if (notificationsEnabled) {
        scheduleIncomeReminderNotification(reminder);
      }
      return reminder;
    },
    [notificationsEnabled, scheduleIncomeReminderNotification],
  );

  const updateIncomeReminder = useCallback(
    (id: string, updates: Partial<IncomeReminder>) => {
      let updatedReminder: IncomeReminder | undefined;
      setIncomeReminders((prev) =>
        prev.map((item) => {
          if (item.id !== id) {
            return item;
          }
          const nextTrigger =
            updates.nextTrigger !== undefined
              ? normalizeTriggerDate(updates.nextTrigger)
              : item.nextTrigger;
          const normalizedAmount =
            typeof updates.defaultAmount === "number"
              ? parseFloat(Math.abs(updates.defaultAmount).toFixed(2))
              : updates.defaultAmount;
          updatedReminder = {
            ...item,
            ...updates,
            dayOfMonth:
              updates.dayOfMonth !== undefined
                ? updates.dayOfMonth
                : item.dayOfMonth,
            weekday:
              updates.weekday !== undefined ? updates.weekday : item.weekday,
            defaultAmount:
              normalizedAmount === undefined
                ? item.defaultAmount
                : normalizedAmount,
            nextTrigger,
            remindHour:
              updates.remindHour !== undefined
                ? updates.remindHour
                : item.remindHour,
            remindMinute:
              updates.remindMinute !== undefined
                ? updates.remindMinute
                : item.remindMinute,
          };
          return updatedReminder;
        }),
      );
      if (updatedReminder && notificationsEnabled) {
        scheduleIncomeReminderNotification(updatedReminder);
      }
    },
    [notificationsEnabled, scheduleIncomeReminderNotification],
  );

  const confirmIncomeReminder = useCallback(
    (id: string, amount: number, receivedAt?: string) => {
      const reminder = incomeReminders.find((item) => item.id === id);
      if (!reminder) {
        return;
      }
      const normalizedAmount = parseFloat(Math.abs(amount).toFixed(2));
      const fallbackDate = new Date(`${reminder.nextTrigger}T00:00:00`);
      const receiptDate = receivedAt
        ? new Date(receivedAt)
        : fallbackDate;
      const receiptIso = receiptDate.toISOString();
      addIncome({
        source: reminder.label,
        amount: normalizedAmount,
        receivedAt: receiptIso,
        reminderId: reminder.id,
      });
      const nextTrigger = computeNextTriggerDate(reminder, fallbackDate);
      const updatedReminder: IncomeReminder = {
        ...reminder,
        defaultAmount: normalizedAmount,
        nextTrigger,
        lastTriggeredAt: reminder.nextTrigger,
        lastReceivedAt: receiptIso,
      };
      setIncomeReminders((prev) =>
        prev.map((item) => (item.id === reminder.id ? updatedReminder : item)),
      );
      if (notificationsEnabled) {
        scheduleIncomeReminderNotification(updatedReminder);
      }
    },
    [
      addIncome,
      incomeReminders,
      notificationsEnabled,
      scheduleIncomeReminderNotification,
    ],
  );

  const skipIncomeReminder = useCallback(
    (id: string, nextTrigger?: string) => {
      const reminder = incomeReminders.find((item) => item.id === id);
      if (!reminder) {
        return;
      }
      const upcoming =
        nextTrigger && nextTrigger.length
          ? normalizeTriggerDate(nextTrigger)
          : computeNextTriggerDate(reminder);
      const updatedReminder: IncomeReminder = {
        ...reminder,
        nextTrigger: upcoming,
        lastTriggeredAt: reminder.nextTrigger,
      };
      setIncomeReminders((prev) =>
        prev.map((item) => (item.id === reminder.id ? updatedReminder : item)),
      );
      if (notificationsEnabled) {
        scheduleIncomeReminderNotification(updatedReminder);
      }
    },
    [incomeReminders, notificationsEnabled, scheduleIncomeReminderNotification],
  );

  const removeIncomeReminder = useCallback(
    (id: string) => {
      setIncomeReminders((prev) => prev.filter((item) => item.id !== id));
      cancelIncomeReminderNotification(id);
    },
    [cancelIncomeReminderNotification],
  );

  const updateProfile = useCallback((updates: Partial<ProfileDetails>) => {
    setProfile((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const setCurrency = useCallback((nextCurrency: CurrencyCode) => {
    setCurrencyState(nextCurrency);
  }, []);

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
  }, []);

  const exportProfileData = useCallback(async () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      userType,
      profile,
      language,
      languageSelected,
      studentIncomePreference,
      budget,
      currency,
      theme,
      categories: selectedCategories,
      customCategories,
      incomes,
      incomeReminders,
      expenses,
      totals: {
        income: totalIncome,
        expenses: totalExpenses,
        balance,
      },
    };
    return JSON.stringify(payload, null, 2);
  }, [
    userType,
    profile,
    language,
    languageSelected,
    studentIncomePreference,
    budget,
    currency,
    theme,
    selectedCategories,
    customCategories,
    incomes,
    incomeReminders,
    expenses,
    totalIncome,
    totalExpenses,
    balance,
  ]);

  const resetProfile = useCallback(() => {
    setUserTypeState(undefined);
    setSelectedCategoriesState([]);
    setCustomCategories([]);
    setBudgetState(null);
    setExpenses([]);
    setProfile(DEFAULT_PROFILE);
    setIncomes([]);
    setLanguageState(detectInitialLanguage());
    setLanguageSelected(false);
    setStudentIncomePreferenceState(null);
    setCurrencyState("AZN");
    setThemeState("light");
    setNotificationsEnabledState(false);
    notificationStateRef.current.limitWarningSent = false;
    const { daily, monthly, incomeReminders: reminderMap } =
      notificationStateRef.current;
    notificationStateRef.current = {
      limitWarningSent: false,
      incomeReminders: {},
    };
    if (Platform.OS !== "web") {
      const reminderCancellations = Object.values(reminderMap ?? {}).map(
        (id) => Notifications.cancelScheduledNotificationAsync(id),
      );
      Promise.all([
        AsyncStorage.removeItem(STORAGE_KEY),
        daily
          ? Notifications.cancelScheduledNotificationAsync(daily)
          : Promise.resolve(),
        monthly
          ? Notifications.cancelScheduledNotificationAsync(monthly)
          : Promise.resolve(),
        ...reminderCancellations,
      ]).catch((error) => {
        console.warn("Profil sıfırlanmadı", error);
      });
    } else {
      AsyncStorage.removeItem(STORAGE_KEY).catch((error) => {
        console.warn("Profil sıfırlanmadı", error);
      });
    }
  }, []);

  const getPresetCategories = useCallback(
    (type: UserType) => CATEGORY_PRESETS[type],
    [],
  );

  const value = useMemo(
    () => ({
      userType,
      profile,
      categories: selectedCategories,
      customCategories,
      budget,
      language,
      languageSelected,
      studentIncomePreference,
      currency,
      theme,
      expenses,
      incomes,
      incomeReminders,
      totalExpenses,
      totalIncome,
      balance,
      notificationsEnabled,
      isHydrated,
      setUserType,
      updateProfile,
      setSelectedCategories,
      addCustomCategory,
      setBudget,
      addExpense,
      addIncome,
      removeIncome,
      addIncomeReminder,
      updateIncomeReminder,
      confirmIncomeReminder,
      skipIncomeReminder,
      removeIncomeReminder,
      resetProfile,
      getPresetCategories,
      setCurrency,
      setTheme,
      exportProfileData,
      toggleNotifications,
      setLanguage,
      setStudentIncomePreference,
    }),
    [
      userType,
      profile,
      selectedCategories,
      customCategories,
      budget,
      language,
      languageSelected,
      studentIncomePreference,
      currency,
      theme,
      expenses,
      incomes,
      incomeReminders,
      totalExpenses,
      totalIncome,
      balance,
      notificationsEnabled,
      isHydrated,
      setUserType,
      updateProfile,
      setSelectedCategories,
      addCustomCategory,
      setBudget,
      addExpense,
      addIncome,
      removeIncome,
      addIncomeReminder,
      updateIncomeReminder,
      confirmIncomeReminder,
      skipIncomeReminder,
      removeIncomeReminder,
      resetProfile,
      getPresetCategories,
      setCurrency,
      setTheme,
      exportProfileData,
      toggleNotifications,
      setLanguage,
      setStudentIncomePreference,
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
