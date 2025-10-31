import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useProfile } from "./_context/ProfileContext";
import { Category, CategoryGroup, ThemeMode } from "./_types/profile";
import {
  ThemeConfig,
  ThemePalette,
  useThemeConfig,
} from "./_constants/theme";

type SetupThemeConfig = {
  palette: ThemePalette;
  gradient: ThemeConfig["gradient"];
  buttonGradient: ThemeConfig["buttonGradient"];
  inputBackground: string;
  surfaceOverlay: string;
  selectedBackground: string;
  groupButtonActive: string;
};

const getSetupTheme = (mode: ThemeMode, base: ThemeConfig): SetupThemeConfig => ({
  palette: base.palette,
  gradient: base.gradient,
  buttonGradient: base.buttonGradient,
  inputBackground: base.inputBackground,
  surfaceOverlay: base.surfaceOverlay,
  selectedBackground:
    mode === "dark" ? "rgba(73, 48, 33, 0.58)" : "rgba(255, 244, 234, 0.9)",
  groupButtonActive:
    mode === "dark" ? "rgba(215, 153, 99, 0.22)" : "rgba(193, 144, 91, 0.14)",
});


const groupLabels: Record<CategoryGroup, string> = {
  daily: "Gündəlik xərclər",
  monthly: "Aylıq xərclər",
};

const userLabels = {
  student: "Tələbə",
  worker: "İşçi",
  parent: "Ailə başçısı",
};

export default function CategorySetup() {
  const router = useRouter();
  const {
    userType,
    categories,
    customCategories,
    getPresetCategories,
    setSelectedCategories,
    addCustomCategory,
    languageSelected,
    isHydrated,
    theme,
  } = useProfile();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newCategoryGroup, setNewCategoryGroup] =
    useState<CategoryGroup>("daily");
  const baseTheme = useThemeConfig();
  const setupTheme = useMemo(() => getSetupTheme(theme, baseTheme), [theme, baseTheme]);
  const palette = setupTheme.palette;
  const gradientColors = setupTheme.gradient;
  const buttonGradient = setupTheme.buttonGradient;
  const styles = useMemo(() => createStyles(setupTheme), [setupTheme]);

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

  const availableCategories = useMemo(() => {
    if (!userType) {
      return [];
    }
    const map = new Map<string, Category>();
    getPresetCategories(userType).forEach((item) => map.set(item.id, item));
    customCategories.forEach((item) => map.set(item.id, item));
    return Array.from(map.values());
  }, [userType, customCategories, getPresetCategories]);

  useEffect(() => {
    if (!userType) {
      return;
    }
    if (selectedIds.size === 0) {
      const baseIds =
        categories.length > 0
          ? categories.map((item) => item.id)
          : availableCategories.map((item) => item.id);
      setSelectedIds(new Set(baseIds));
      return;
    }

    const availableIds = new Set(availableCategories.map((item) => item.id));
    let changed = false;
    const filtered = new Set<string>();
    selectedIds.forEach((id) => {
      if (availableIds.has(id)) {
        filtered.add(id);
      } else {
        changed = true;
      }
    });
    if (changed) {
      setSelectedIds(filtered);
    }
  }, [userType, categories, availableCategories, selectedIds]);

  const groupedCategories = useMemo(() => {
    return {
      daily: availableCategories.filter((item) => item.group === "daily"),
      monthly: availableCategories.filter((item) => item.group === "monthly"),
    };
  }, [availableCategories]);

  const toggleCategory = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAddCustomCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert("Xəta", "Zəhmət olmasa kateqoriya adını daxil edin.");
      return;
    }

    const created = addCustomCategory({
      name: newCategoryName.trim(),
      description:
        newCategoryDescription.trim() || "Fərdiləşdirilmiş kateqoriya",
      group: newCategoryGroup,
    });

    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.add(created.id);
      return next;
    });

    setNewCategoryName("");
    setNewCategoryDescription("");
  };

  const handleContinue = () => {
    if (selectedIds.size === 0) {
      Alert.alert("Xəta", "Minimum bir dənə kateqoriya seçməlisiniz.");
      return;
    }
    const selected = availableCategories.filter((item) =>
      selectedIds.has(item.id)
    );
    setSelectedCategories(selected);
    if (userType === "student") {
      router.replace("/StudentIncomeSetup");
      return;
    }
    router.replace("/Home");
  };

  if (!isHydrated) {
    return null;
  }

  if (!userType) {
    return null;
  }

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            Profil: {userLabels[userType as keyof typeof userLabels]}
          </Text>
          <Text style={styles.title}>Kateqoriyalarını seç</Text>
          <Text style={styles.subtitle}>
            Gündəlik və aylıq xərclər üçün istədiyin kombinasiyanı qur, istəsən
            öz kateqoriyanı da əlavə et.
          </Text>
        </View>

        {(Object.keys(groupLabels) as CategoryGroup[]).map((group) => {
          const items = groupedCategories[group];
          if (!items.length) {
            return null;
          }
          return (
            <View key={group} style={styles.section}>
              <Text style={styles.sectionTitle}>{groupLabels[group]}</Text>
              {items.map((item) => {
                const selected = selectedIds.has(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.categoryCard,
                      selected && styles.categorySelected,
                    ]}
                    onPress={() => toggleCategory(item.id)}
                  >
                    <View style={styles.cardHeader}>
                      <Text style={styles.categoryName}>{item.name}</Text>
                      <View
                        style={[
                          styles.categoryBadge,
                          selected && styles.categoryBadgeSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.categoryBadgeText,
                            selected && styles.categoryBadgeTextActive,
                          ]}
                        >
                          {selected ? "Seçildi" : "Seç"}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.categoryDescription}>
                      {item.description}
                    </Text>
                    {item.isCustom && (
                      <Text style={styles.customHint}>
                        Öz əlavə etdiyin kateqoriya
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}

        <View style={styles.customSection}>
          <Text style={styles.sectionTitle}>Öz kateqoriyanı əlavə et</Text>
          <View style={styles.groupSwitch}>
            {(["daily", "monthly"] as CategoryGroup[]).map((group) => {
              const isActive = newCategoryGroup === group;
              return (
                <TouchableOpacity
                  key={group}
                  style={[
                    styles.groupButton,
                    isActive && styles.groupButtonActive,
                  ]}
                  onPress={() => setNewCategoryGroup(group)}
                >
                  <Text
                    style={[
                      styles.groupButtonText,
                      isActive && styles.groupButtonTextActive,
                    ]}
                  >
                    {groupLabels[group]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TextInput
            value={newCategoryName}
            onChangeText={setNewCategoryName}
            placeholder="Kateqoriya adı"
            placeholderTextColor={palette.textMuted}
            style={styles.input}
          />
          <TextInput
            value={newCategoryDescription}
            onChangeText={setNewCategoryDescription}
            placeholder="Qısa açıqlama (istəyə bağlı)"
            placeholderTextColor={palette.textMuted}
            style={[styles.input, styles.multilineInput]}
            multiline
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddCustomCategory}
          >
            <LinearGradient
              colors={buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addButtonInner}
            >
              <Text style={styles.addButtonText}>+ Kateqoriya əlavə et</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <LinearGradient
            colors={buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.continueInner}
          >
            <Text style={styles.continueText}>Davam et</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const createStyles = (config: SetupThemeConfig) =>
  StyleSheet.create({
    gradient: {
      flex: 1,
      backgroundColor: config.palette.background,
    },
    content: {
      paddingHorizontal: 24,
      paddingTop: 48,
      paddingBottom: 80,
    },
    header: {
      marginBottom: 28,
      backgroundColor: config.palette.card,
      paddingHorizontal: 22,
      paddingVertical: 26,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: config.palette.border,
      shadowColor: config.palette.shadow,
      shadowOpacity: 0.18,
      shadowOffset: { width: 0, height: 12 },
      shadowRadius: 28,
      elevation: 10,
    },
    eyebrow: {
      fontSize: 13,
      fontWeight: "600",
      color: config.palette.primaryDark,
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: config.palette.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      lineHeight: 22,
      color: config.palette.textMuted,
    },
    section: {
      marginTop: 22,
    },
    sectionTitle: {
      color: config.palette.text,
      fontSize: 17,
      fontWeight: "600",
      marginBottom: 12,
    },
    categoryCard: {
      backgroundColor: config.palette.card,
      borderRadius: 18,
      padding: 18,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: config.palette.borderMuted,
      shadowColor: config.palette.shadow,
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 18,
      elevation: 6,
    },
    categorySelected: {
      borderColor: config.palette.primaryLight,
      backgroundColor: config.selectedBackground,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    categoryName: {
      color: config.palette.text,
      fontSize: 16,
      fontWeight: "600",
    },
    categoryBadge: {
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 4,
      backgroundColor: config.surfaceOverlay,
    },
    categoryBadgeSelected: {
      backgroundColor: config.palette.primary,
    },
    categoryBadgeText: {
      color: config.palette.textMuted,
      fontSize: 12,
      fontWeight: "600",
    },
    categoryBadgeTextActive: {
      color: "#fff",
    },
    categoryDescription: {
      color: config.palette.textMuted,
      fontSize: 14,
      lineHeight: 20,
    },
    customHint: {
      color: config.palette.primaryDark,
      fontSize: 12,
      marginTop: 6,
      fontStyle: "italic",
    },
    customSection: {
      marginTop: 30,
      padding: 20,
      borderRadius: 20,
      backgroundColor: config.palette.card,
      borderWidth: 1,
      borderColor: config.palette.border,
      shadowColor: config.palette.shadow,
      shadowOpacity: 0.14,
      shadowOffset: { width: 0, height: 12 },
      shadowRadius: 24,
      elevation: 8,
    },
    groupSwitch: {
      flexDirection: "row",
      marginBottom: 14,
      borderRadius: 14,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: config.palette.borderMuted,
    },
    groupButton: {
      flex: 1,
      paddingVertical: 10,
      backgroundColor: "transparent",
    },
    groupButtonActive: {
      backgroundColor: config.groupButtonActive,
    },
    groupButtonText: {
      color: config.palette.textMuted,
      textAlign: "center",
      fontSize: 13,
      fontWeight: "500",
    },
    groupButtonTextActive: {
      color: config.palette.primaryDark,
      fontWeight: "700",
    },
    input: {
      backgroundColor: config.inputBackground,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 13,
      color: config.palette.text,
      borderWidth: 1,
      borderColor: config.palette.border,
      marginBottom: 12,
      fontSize: 15,
    },
    multilineInput: {
      minHeight: 80,
      textAlignVertical: "top",
    },
    addButton: {
      borderRadius: 16,
      overflow: "hidden",
      elevation: 3,
    },
    addButtonInner: {
      paddingVertical: 14,
      alignItems: "center",
    },
    addButtonText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 15,
      letterSpacing: 0.2,
    },
    continueButton: {
      marginTop: 30,
      borderRadius: 24,
      overflow: "hidden",
      elevation: 4,
    },
    continueInner: {
      paddingVertical: 16,
      alignItems: "center",
    },
    continueText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 0.3,
    },
  });
