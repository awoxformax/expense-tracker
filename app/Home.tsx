import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useProfile } from "./_context/ProfileContext";
import {
  IncomeReminder,
  IncomeFrequency,
  IncomeSourceType,
  LanguageCode,
  StudentIncomePreference,
} from "./_types/profile";
import { ThemeConfig, useThemeConfig } from "./_constants/theme";
import { formatCurrency, formatDate } from "./_utils/format";

type TabKey = "home" | "income" | "settings";
type WizardStep = 1 | 2 | 3;

type WizardData = {
  type: IncomeSourceType;
  label: string;
  windowStartDay: string;
  windowEndDay: string;
  customDate: string;
  autoRenew: boolean;
  confirmNow: boolean | null;
  defaultAmount: string;
};

const TAB_ITEMS: { key: TabKey; icon: keyof typeof Feather.glyphMap; label: string }[] = [
  { key: "home", icon: "home", label: "Ana" },
  { key: "income", icon: "trending-up", label: "Gəlirlər" },
  { key: "settings", icon: "settings", label: "Ayarlar" },
];

const SOURCE_OPTIONS: { type: IncomeSourceType; label: string; helper: string }[] = [
  { type: "salary", label: "Maaş", helper: "Rəsmi iş gəliri" },
  { type: "pension", label: "Təqaüd", helper: "Dövlət və ya fond ödənişi" },
  { type: "freelance", label: "Frilanser", helper: "Layihə və müqavilə gəliri" },
  { type: "other", label: "Digər", helper: "Başqa gəlir mənbəyi" },
];

const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  az: "Azərbaycan",
  ru: "Русский",
  en: "English",
};

const STUDENT_PREF_LABELS: Record<StudentIncomePreference, string> = {
  working: "İşləyirəm",
  stipend: "Təqaüd / digər",
  mixed: "Hər ikisi",
};

const MAX_SALARY_DAY = 5;

const clampDay = (value: number) => {
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.min(Math.max(Math.floor(value), 1), 28);
};

const ensureSalaryDay = (value: number) => Math.min(clampDay(value), MAX_SALARY_DAY);

const toIsoDate = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.toISOString().slice(0, 10);
};

const buildMonthlyTrigger = (day: number) => {
  const safeDay = ensureSalaryDay(day);
  const today = new Date();
  const candidate = new Date(today.getFullYear(), today.getMonth(), safeDay);
  if (candidate <= today) {
    candidate.setMonth(candidate.getMonth() + 1);
  }
  return toIsoDate(candidate);
};

const buildIrregularTrigger = (value: string) => {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return toIsoDate(new Date());
  }
  return toIsoDate(parsed);
};

const nextTriggerFor = (
  frequency: IncomeFrequency,
  windowEndDay: number,
  customDate: string,
) => {
  if (frequency === "monthly") {
    return buildMonthlyTrigger(windowEndDay);
  }
  return buildIrregularTrigger(customDate);
};

const describeReminder = (reminder: IncomeReminder) => {
  const next = formatDate(reminder.nextTrigger);
  switch (reminder.frequency) {
    case "monthly": {
      const windowText =
        typeof reminder.windowStartDay === "number" && typeof reminder.windowEndDay === "number"
          ? ` (${reminder.windowStartDay}-${reminder.windowEndDay} arası)`
          : "";
      return `Hər ay${windowText} • növbəti: ${next}`;
    }
    case "weekly":
      return `Həftəlik • növbəti: ${next}`;
    default:
      return `Qeyri-müntəzəm • növbəti: ${next}`;
  }
};

const parseAmount = (raw: string) => {
  if (!raw.trim()) {
    return undefined;
  }
  const normalized = Number.parseFloat(raw.replace(",", "."));
  if (Number.isNaN(normalized)) {
    return undefined;
  }
  return parseFloat(normalized.toFixed(2));
};

const buildWizardDefaults = (preferredType: IncomeSourceType): WizardData => ({
  type: preferredType,
  label: SOURCE_OPTIONS.find((option) => option.type === preferredType)?.label ?? "Gəlir",
  windowStartDay: "1",
  windowEndDay: String(MAX_SALARY_DAY),
  customDate: toIsoDate(new Date()),
  autoRenew: preferredType === "salary" || preferredType === "pension",
  confirmNow: null,
  defaultAmount: "",
});

export default function Home() {
  const router = useRouter();
  const themeConfig = useThemeConfig();
  const {
    userType,
    profile,
    budget,
    setBudget,
    expenses,
    totalExpenses,
    totalIncome,
    incomes,
    addIncome,
    removeIncome,
    incomeReminders,
    addIncomeReminder,
    confirmIncomeReminder,
    skipIncomeReminder,
    removeIncomeReminder,
    balance,
    currency,
    setCurrency,
    theme,
    setTheme,
    notificationsEnabled,
    toggleNotifications,
    updateProfile,
    resetProfile,
    getPresetCategories,
    setSelectedCategories,
    exportProfileData,
    language,
    languageSelected,
    setLanguage,
    studentIncomePreference,
    setStudentIncomePreference,
    isHydrated,
  } = useProfile();

  const styles = useMemo(() => createStyles(themeConfig), [themeConfig]);
  const palette = themeConfig.palette;

  const defaultSourceType = useMemo<IncomeSourceType>(() => {
    if (userType === "student") {
      if (studentIncomePreference === "stipend") {
        return "pension";
      }
      if (studentIncomePreference === "mixed") {
        return "salary";
      }
    }
    return "salary";
  }, [studentIncomePreference, userType]);

  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [budgetInput, setBudgetInput] = useState(budget !== null ? String(budget) : "");
  const [incomeModalVisible, setIncomeModalVisible] = useState(false);
  const [incomeSource, setIncomeSource] = useState("");
  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeDate, setIncomeDate] = useState(toIsoDate(new Date()));
  const [incomeWizardVisible, setIncomeWizardVisible] = useState(false);
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [wizardData, setWizardData] = useState<WizardData>(() => buildWizardDefaults(defaultSourceType));
  const [reminderConfirmVisible, setReminderConfirmVisible] = useState(false);
  const [reminderSkipVisible, setReminderSkipVisible] = useState(false);
  const [reminderToProcess, setReminderToProcess] = useState<IncomeReminder | null>(null);
  const [processAmount, setProcessAmount] = useState("");
  const [processDate, setProcessDate] = useState(toIsoDate(new Date()));
  const [skipDate, setSkipDate] = useState(toIsoDate(new Date()));
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    birthDate: profile.birthDate ?? "",
  });

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    if (!languageSelected) {
      router.replace("/LanguageSelect");
      return;
    }
    if (!userType) {
      router.replace("/UserTypeSelect");
    }
  }, [isHydrated, languageSelected, userType, router]);

  useEffect(() => {
    if (!userType) {
      return;
    }
    const preset = getPresetCategories(userType);
    setSelectedCategories((prev) => (prev.length ? prev : preset));
  }, [userType, getPresetCategories, setSelectedCategories]);

  useEffect(() => {
    setBudgetInput(budget !== null ? String(budget) : "");
  }, [budget]);

  useEffect(() => {
    if (profileModalVisible) {
      setProfileForm({
        firstName: profile.firstName,
        lastName: profile.lastName,
        birthDate: profile.birthDate ?? "",
      });
    }
  }, [profileModalVisible, profile]);

  useEffect(() => {
    setWizardData(buildWizardDefaults(defaultSourceType));
    setWizardStep(1);
  }, [defaultSourceType, incomeWizardVisible]);

  const sortedIncomes = useMemo(
    () =>
      [...incomes].sort(
        (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
      ),
    [incomes],
  );

  const lastIncome = sortedIncomes.length ? sortedIncomes[0] : null;

  const nextReminder = useMemo(() => {
    let earliest: IncomeReminder | null = null;
    incomeReminders.forEach((reminder) => {
      const time = new Date(`${reminder.nextTrigger}T00:00:00`).getTime();
      if (Number.isNaN(time)) {
        return;
      }
      if (!earliest) {
        earliest = reminder;
        return;
      }
      const currentTime = new Date(`${earliest.nextTrigger}T00:00:00`).getTime();
      if (Number.isNaN(currentTime) || time < currentTime) {
        earliest = reminder;
      }
    });
    return earliest;
  }, [incomeReminders]);

  const pendingAutoReminders = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();

    return incomeReminders.filter((reminder) => {
      if (!reminder.autoRenew) {
        return false;
      }

      const alreadyLogged = incomes.some((income) => {
        if (income.reminderId !== reminder.id) {
          return false;
        }
        const incomeDateObj = new Date(income.receivedAt);
        return incomeDateObj.getFullYear() === year && incomeDateObj.getMonth() === month;
      });

      if (alreadyLogged) {
        return false;
      }

      if (reminder.frequency === "monthly") {
        const start =
          reminder.windowStartDay ??
          Math.max(1, (reminder.dayOfMonth ?? MAX_SALARY_DAY) - 2);
        const end = reminder.windowEndDay ?? reminder.dayOfMonth ?? MAX_SALARY_DAY;
        return day >= start && day <= end;
      }

      if (reminder.frequency === "irregular") {
        const target = new Date(reminder.nextTrigger);
        return (
          target.getFullYear() === year &&
          target.getMonth() === month &&
          target.getDate() === day
        );
      }

      return false;
    });
  }, [incomeReminders, incomes]);

  const handleSaveBudget = () => {
    const parsed = parseAmount(budgetInput);
    if (typeof parsed !== "number" || parsed <= 0) {
      Alert.alert("Xəta", "Zəhmət olmasa düzgün məbləğ daxil edin.");
      return;
    }
    setBudget(parsed);
    setBudgetInput(String(parsed));
  };

  const handleShareProfile = async () => {
    try {
      const payload = await exportProfileData();
      await Share.share({
        title: "Expense Tracker profili",
        message: payload,
      });
    } catch (error) {
      Alert.alert("Xəta", "Məlumatlar paylaşıla bilmədi.");
    }
  };

  const openIncomeWizard = () => {
    setWizardData(buildWizardDefaults(defaultSourceType));
    setWizardStep(1);
    setIncomeWizardVisible(true);
  };

  const handleWizardSourceSelect = (type: IncomeSourceType) => {
    setWizardData((prev) => ({
      ...prev,
      type,
      label:
        type === "other"
          ? prev.label
          : SOURCE_OPTIONS.find((option) => option.type === type)?.label ?? prev.label,
      autoRenew: type === "salary" || type === "pension" || prev.autoRenew,
    }));
  };

  const handleWizardNext = () => {
    if (wizardStep === 1) {
      if (wizardData.type === "other" && !wizardData.label.trim()) {
        Alert.alert("Xəta", "Zəhmət olmasa gəlir mənbəyinin adını yazın.");
        return;
      }
      setWizardStep(2);
      return;
    }

    if (wizardStep === 2) {
      if (wizardData.type === "salary" || wizardData.type === "pension") {
        const start = ensureSalaryDay(Number(wizardData.windowStartDay));
        const end = ensureSalaryDay(Number(wizardData.windowEndDay));
        if (Number.isNaN(start) || Number.isNaN(end)) {
          Alert.alert("Xəta", "Tarix aralığını düzgün daxil edin.");
          return;
        }
        if (start > end) {
          Alert.alert("Xəta", "Başlanğıc günü bitiş günündən kiçik olmalıdır.");
          return;
        }
      } else if (!wizardData.customDate.trim()) {
        Alert.alert("Xəta", "Tarixi YYYY-MM-DD formatında qeyd edin.");
        return;
      }
      setWizardStep(3);
      return;
    }

    handleCompleteWizard();
  };

  const handleWizardBack = () => {
    if (wizardStep === 1) {
      setIncomeWizardVisible(false);
      return;
    }
    setWizardStep((prev) => (prev === 1 ? prev : ((prev - 1) as WizardStep)));
  };

  const handleCompleteWizard = () => {
    const trimmedLabel = wizardData.label.trim();
    const frequency: IncomeFrequency =
      wizardData.type === "salary" || wizardData.type === "pension"
        ? "monthly"
        : "irregular";

    let windowStartDay: number | undefined;
    let windowEndDay: number | undefined;
    let nextTrigger = "";

    if (frequency === "monthly") {
      windowStartDay = ensureSalaryDay(Number(wizardData.windowStartDay));
      windowEndDay = ensureSalaryDay(Number(wizardData.windowEndDay));
      nextTrigger = nextTriggerFor(frequency, windowEndDay, wizardData.customDate);
    } else {
      nextTrigger = nextTriggerFor(frequency, MAX_SALARY_DAY, wizardData.customDate);
    }

    const defaultAmountValue = parseAmount(wizardData.defaultAmount);

    const reminder = addIncomeReminder({
      sourceType: wizardData.type,
      label:
        trimmedLabel ||
        SOURCE_OPTIONS.find((item) => item.type === wizardData.type)?.label ||
        "Gəlir",
      frequency,
      dayOfMonth: frequency === "monthly" ? windowEndDay : undefined,
      weekday: undefined,
      nextTrigger,
      autoAddOnConfirm: wizardData.autoRenew,
      windowStartDay,
      windowEndDay,
      autoRenew: wizardData.autoRenew,
      defaultAmount: defaultAmountValue,
      remindHour: 9,
      remindMinute: 0,
    });

    setIncomeWizardVisible(false);
    setWizardStep(1);
    setWizardData(buildWizardDefaults(defaultSourceType));

    if (wizardData.confirmNow) {
      setReminderToProcess(reminder);
      setProcessAmount(
        typeof reminder.defaultAmount === "number" ? String(reminder.defaultAmount) : "",
      );
      setProcessDate(reminder.nextTrigger);
      setReminderConfirmVisible(true);
    } else if (wizardData.confirmNow === false) {
      Alert.alert("Qeyd edildi", "Bildiriş saxlanıldı. Gəliri daha sonra təsdiqləyə bilərsiniz.");
    }
  };

  const handleAddIncomeManual = () => {
    const amount = parseAmount(incomeAmount);
    if (!incomeSource.trim() || typeof amount !== "number" || amount <= 0) {
      Alert.alert("Xəta", "Gəlir mənbəyini və məbləği düzgün daxil edin.");
      return;
    }
    const parsedDate = new Date(`${incomeDate}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime())) {
      Alert.alert("Xəta", "Tarix formatı düzgün deyil (YYYY-MM-DD).");
      return;
    }
    addIncome({
      source: incomeSource.trim(),
      amount,
      receivedAt: parsedDate.toISOString(),
    });
    setIncomeModalVisible(false);
  };

  const openConfirmReminder = (reminder: IncomeReminder) => {
    setReminderToProcess(reminder);
    setProcessAmount(
      typeof reminder.defaultAmount === "number" ? String(reminder.defaultAmount) : "",
    );
    setProcessDate(reminder.nextTrigger);
    setReminderConfirmVisible(true);
  };

  const handleConfirmReminderAction = () => {
    if (!reminderToProcess) {
      return;
    }
    const amountValue = parseAmount(processAmount);
    if (typeof amountValue !== "number" || amountValue <= 0) {
      Alert.alert("Xəta", "Məbləğ düzgün deyil.");
      return;
    }
    const parsedDate = new Date(`${processDate}T00:00:00`);
    אם (Number.isNaN(parsedDate.getTime())) {
      Alert.alert("Xəta", "Tarix formatı düzgün deyil.");
      return;
    }
    confirmIncomeReminder(reminderToProcess.id, amountValue, parsedDate.toISOString());
    setReminderConfirmVisible(false);
    setReminderToProcess(null);
  };

