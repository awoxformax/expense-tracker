import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useProfile } from "./context/ProfileContext";
import { Category, CategoryGroup } from "./types/profile";

const groupLabels: Record<CategoryGroup, string> = {
  daily: "Gündəlik xərclər",
  monthly: "Aylığ xərclər",
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
  } = useProfile();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newCategoryGroup, setNewCategoryGroup] =
    useState<CategoryGroup>("daily");

  useEffect(() => {
    if (!userType) {
      router.replace("/UserTypeSelect");
    }
  }, [userType, router]);

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
      Alert.alert("Xəta", "Minimum bir ədəd kateqoriya seçməlisiniz.");
      return;
    }
    const selected = availableCategories.filter((item) =>
      selectedIds.has(item.id),
    );
    setSelectedCategories(selected);
    router.replace("/Home");
  };

  if (!userType) {
    return null;
  }

  return (
    <LinearGradient colors={["#2575fc", "#6a11cb"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Kateqoriyarlarını seç</Text>
        <Text style={styles.subtitle}>
          Secdiyin profil: {userLabels[userType]}
        </Text>
        <Text style={styles.helper}>
         Gündəlik və aylıq kateqoriyalardan istədiyini seç, istəsən öz
          kateqoriyanı da əlavə et.
        </Text>

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
                      <Text style={styles.categoryBadge}>
                        {selected ? "Seçildi" : "Seç"}
                      </Text>
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
            {(["daily", "monthly"] as CategoryGroup[]).map((group) => (
              <TouchableOpacity
                key={group}
                style={[
                  styles.groupButton,
                  newCategoryGroup === group && styles.groupButtonActive,
                ]}
                onPress={() => setNewCategoryGroup(group)}
              >
                <Text
                  style={[
                    styles.groupButtonText,
                    newCategoryGroup === group && styles.groupButtonTextActive,
                  ]}
                >
                  {groupLabels[group]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            value={newCategoryName}
            onChangeText={setNewCategoryName}
                placeholder="Kateqoriya adı"
                placeholderTextColor="rgba(255,255,255,0.6)"
            style={styles.input}
          />
          <TextInput
            value={newCategoryDescription}
            onChangeText={setNewCategoryDescription}
            placeholder="Qısa açıqlama (istəyə bağlı)"
            placeholderTextColor="rgba(255,255,255,0.6)"
            style={[styles.input, styles.multilineInput]}
            multiline
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddCustomCategory}
          >
            <Text style={styles.addButtonText}>+ Kateqoriya əlavə et</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueText}>Dəvam et</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginTop: 6,
    fontSize: 16,
  },
  helper: {
    color: "rgba(255,255,255,0.75)",
    marginTop: 12,
    textAlign: "center",
    fontSize: 14,
  },
  section: {
    marginTop: 30,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  categoryCard: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  categorySelected: {
    borderColor: "rgba(255,255,255,0.8)",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryName: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  categoryBadge: {
    color: "#fff",
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },
  categoryDescription: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
  },
  customHint: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 4,
    fontStyle: "italic",
  },
  customSection: {
    marginTop: 30,
    padding: 18,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  groupSwitch: {
    flexDirection: "row",
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  groupButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
  groupButtonActive: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  groupButtonText: {
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    fontSize: 14,
  },
  groupButtonTextActive: {
    color: "#1d4ed8",
    fontWeight: "600",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#fff",
    marginBottom: 12,
  },
  multilineInput: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  addButton: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  addButtonText: {
    color: "#2563eb",
    fontWeight: "700",
  },
  continueButton: {
    marginTop: 30,
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  continueText: {
    color: "#2563eb",
    fontSize: 16,
    fontWeight: "700",
  },
});
