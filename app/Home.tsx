import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useProfile } from "./context/ProfileContext";
import { Category, CategoryGroup, Expense } from "./types/profile";

const userLabels = {
  student: "Telebe",
  worker: "Isci",
  parent: "Aile bascisi",
};

export default function Home() {
  const router = useRouter();
  const {
    userType,
    categories,
    budget,
    setBudget,
    expenses,
    totalExpenses,
    addExpense,
    resetProfile,
  } = useProfile();

  const [budgetInput, setBudgetInput] = useState("");
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  useEffect(() => {
    if (!userType) {
      router.replace("/UserTypeSelect");
      return;
    }
    setBudgetInput(budget !== null ? budget.toString() : "");
    setIsEditingBudget(budget === null);
  }, [userType, budget, router]);

  if (!userType) {
    return null;
  }

  const remainingBudget =
    budget !== null ? parseFloat((budget - totalExpenses).toFixed(2)) : 0;

  const groupedCategories = useMemo(() => {
    return {
      daily: categories.filter((item) => item.group === "daily"),
      monthly: categories.filter((item) => item.group === "monthly"),
    };
  }, [categories]);

  const expensesByCategory = useMemo(() => {
    const map = new Map<string, { total: number; items: Expense[] }>();
    categories.forEach((category) => {
      map.set(category.id, { total: 0, items: [] });
    });
    expenses.forEach((expense) => {
      const entry = map.get(expense.categoryId);
      if (entry) {
        entry.total += expense.amount;
        entry.items.push(expense);
      }
    });
    return map;
  }, [categories, expenses]);

  const handleSaveBudget = () => {
    const parsed = parseFloat(budgetInput.replace(",", "."));
    if (Number.isNaN(parsed) || parsed <= 0) {
      Alert.alert("Xəta", "Zəhmət olmasa düzgün büdcə daxil edin.");
      return;
    }
    setBudget(parseFloat(parsed.toFixed(2)));
    setIsEditingBudget(false);
  };

  const openExpenseModal = (category: Category) => {
    setActiveCategory(category);
    setExpenseTitle("");
    setExpenseAmount("");
    setExpenseModalVisible(true);
  };

  const handleAddExpense = () => {
    if (!activeCategory) {
      return;
    }
    const amount = parseFloat(expenseAmount.replace(",", "."));
    if (!expenseTitle.trim() || Number.isNaN(amount) || amount <= 0) {
      Alert.alert("Xəta", "Xərc səbəbi və məbləği düzgün daxil edin.");
      return;
    }
    addExpense({
      categoryId: activeCategory.id,
      title: expenseTitle.trim(),
      amount: parseFloat(amount.toFixed(2)),
    });
    setExpenseModalVisible(false);
  };

  const renderCategorySection = (group: CategoryGroup, data: Category[]) => {
    if (!data.length) {
      return null;
    }
    const header =
      group === "daily" ? "Gündəlik kateqoriyalar" : "Aylığ kateqoriyalar";
    return (
      <View key={group} style={styles.section}>
        <Text style={styles.sectionTitle}>{header}</Text>
        {data.map((category) => {
          const entry = expensesByCategory.get(category.id);
          const categoryTotal = entry ? entry.total : 0;
          const categoryExpenses = entry ? entry.items : [];
          return (
            <View key={category.id} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryDescription}>
                    {category.description}
                  </Text>
                </View>
                <View style={styles.categoryTotal}>
                  <Text style={styles.categoryTotalLabel}>Toplam</Text>
                  <Text style={styles.categoryTotalAmount}>
                    {categoryTotal.toFixed(2)} AZN
                  </Text>
                </View>
              </View>
              {categoryExpenses.length > 0 ? (
                <View style={styles.expenseList}>
                  {categoryExpenses.map((expense) => (
                    <View key={expense.id} style={styles.expenseRow}>
                      <Text style={styles.expenseName}>- {expense.title}</Text>
                      <Text style={styles.expenseAmount}>
                        {expense.amount.toFixed(2)} AZN
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyExpense}>Hələ xərc əlavə olunmayıb.</Text>
              )}
              <TouchableOpacity
                style={styles.addExpenseButton}
                onPress={() => openExpenseModal(category)}
              >
                <Text style={styles.addExpenseText}>
                  + Bu kateqoriyaya xərc əlavə et
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <LinearGradient colors={["#2575fc", "#6a11cb"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Xoş gəldin!</Text>
          <Text style={styles.profileText}>
            Seçdiyin profil: {userLabels[userType]}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              resetProfile();
              router.replace("/UserTypeSelect");
            }}
          >
            <Text style={styles.actionText}>Profil növünü dəyiş</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={() => router.push("/CategorySetup")}
          >
            <Text style={styles.actionText}>Kateqoriyaları düzəliş et</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.budgetCard}>
          <Text style={styles.budgetTitle}>Büdcə və xərclər</Text>
          {isEditingBudget ? (
            <>
              <Text style={styles.budgetHint}>
                Hazırki büdcəni daxil et ki, sərmayeni izləyə biləsən.
              </Text>
              <TextInput
                style={styles.budgetInput}
                value={budgetInput}
                onChangeText={setBudgetInput}
                placeholder="Meblegi yaz (AZN)"
                placeholderTextColor="#94a3b8"
                keyboardType="decimal-pad"
              />
              <View style={styles.budgetActions}>
                <TouchableOpacity
                  style={[styles.budgetButton, styles.budgetSaveButton]}
                  onPress={handleSaveBudget}
                >
                  <Text style={styles.budgetSaveText}>Büdcəni saxla</Text>
                </TouchableOpacity>
                {budget !== null && (
                  <TouchableOpacity
                    style={[styles.budgetButton, styles.budgetCancelButton]}
                    onPress={() => {
                      setBudgetInput(budget.toString());
                      setIsEditingBudget(false);
                    }}
                  >
                    <Text style={styles.budgetCancelText}>Ləğv et</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          ) : (
            <>
              <View style={styles.budgetSummaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Ümumi büdcə</Text>
                  <Text style={styles.summaryValue}>
                    {budget?.toFixed(2)} AZN
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Xərc olunan</Text>
                  <Text style={styles.summaryValue}>
                    {totalExpenses.toFixed(2)} AZN
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Qalıq</Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      remainingBudget < 0 && styles.overspent,
                    ]}
                  >
                    {remainingBudget.toFixed(2)} AZN
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.editBudgetButton}
                onPress={() => {
                  setBudgetInput(budget !== null ? budget.toString() : "");
                  setIsEditingBudget(true);
                }}
              >
                <Text style={styles.editBudgetText}>Büdcəni yenilə</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {categories.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Kateqoriya seçməmisən</Text>
            <Text style={styles.emptySubtitle}>
              Xərcləri izləmək Üçün əvvəlcə hansı bölmələrdən istifadə edəcəyini 
              seç.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push("/CategorySetup")}
            >
              <Text style={styles.emptyButtonText}>Kateqoriya seç</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {renderCategorySection("daily", groupedCategories.daily)}
            {renderCategorySection("monthly", groupedCategories.monthly)}
          </>
        )}
      </ScrollView>

      <Modal
        visible={expenseModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setExpenseModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yeni xərc</Text>
            {activeCategory && (
              <Text style={styles.modalSubtitle}>{activeCategory.name}</Text>
            )}
            <TextInput
              style={styles.modalInput}
              placeholder="Xərc adı"
              placeholderTextColor="#475569"
              value={expenseTitle}
              onChangeText={setExpenseTitle}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Məbləğ (AZN)"
              placeholderTextColor="#475569"
              keyboardType="decimal-pad"
              value={expenseAmount}
              onChangeText={setExpenseAmount}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => setExpenseModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Ləğv et</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirm]}
                onPress={handleAddExpense}
              >
                <Text style={styles.modalConfirmText}>Əlavə et</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    marginTop: 70,
    alignItems: "center",
  },
  greeting: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  profileText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 16,
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 12,
    borderRadius: 14,
    marginRight: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  actionButtonSecondary: {
    marginRight: 0,
    marginLeft: 10,
  },
  actionText: {
    color: "#fff",
    fontWeight: "600",
  },
  budgetCard: {
    marginTop: 24,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  budgetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  budgetHint: {
    color: "#475569",
    marginTop: 8,
    fontSize: 14,
  },
  budgetInput: {
    marginTop: 16,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#0f172a",
  },
  budgetActions: {
    flexDirection: "row",
    marginTop: 18,
    justifyContent: "space-between",
  },
  budgetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  budgetSaveButton: {
    backgroundColor: "#2563eb",
    marginRight: 10,
  },
  budgetSaveText: {
    color: "#fff",
    fontWeight: "700",
  },
  budgetCancelButton: {
    backgroundColor: "#e2e8f0",
    marginLeft: 10,
  },
  budgetCancelText: {
    color: "#1e293b",
    fontWeight: "600",
  },
  budgetSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryLabel: {
    color: "#475569",
    fontSize: 13,
  },
  summaryValue: {
    color: "#1e293b",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 6,
  },
  overspent: {
    color: "#dc2626",
  },
  editBudgetButton: {
    marginTop: 20,
    alignSelf: "center",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2563eb",
  },
  editBudgetText: {
    color: "#2563eb",
    fontWeight: "700",
  },
  emptyState: {
    marginTop: 30,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  emptySubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
  emptyButton: {
    marginTop: 18,
    backgroundColor: "#fff",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyButtonText: {
    color: "#2563eb",
    fontWeight: "700",
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 14,
  },
  categoryCard: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  categoryName: {
    color: "#1e293b",
    fontSize: 17,
    fontWeight: "700",
  },
  categoryDescription: {
    color: "#475569",
    marginTop: 4,
    maxWidth: 220,
  },
  categoryTotal: {
    alignItems: "flex-end",
  },
  categoryTotalLabel: {
    color: "#64748b",
    fontSize: 12,
  },
  categoryTotalAmount: {
    color: "#1d4ed8",
    fontSize: 16,
    fontWeight: "700",
  },
  expenseList: {
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 12,
  },
  expenseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  expenseName: {
    color: "#334155",
    fontSize: 14,
  },
  expenseAmount: {
    color: "#2563eb",
    fontWeight: "600",
  },
  emptyExpense: {
    color: "#64748b",
    fontStyle: "italic",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 12,
  },
  addExpenseButton: {
    marginTop: 14,
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  addExpenseText: {
    color: "#fff",
    fontWeight: "700",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.45)",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
  },
  modalSubtitle: {
    color: "#475569",
    marginTop: 4,
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    color: "#0f172a",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  modalCancel: {
    backgroundColor: "#e2e8f0",
    marginRight: 10,
  },
  modalCancelText: {
    color: "#1e293b",
    fontWeight: "600",
  },
  modalConfirm: {
    backgroundColor: "#2563eb",
    marginLeft: 10,
  },
  modalConfirmText: {
    color: "#fff",
    fontWeight: "700",
  },
});
