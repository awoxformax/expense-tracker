import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useProfile } from "./_context/ProfileContext";
import { ThemeConfig, useThemeConfig } from "./_constants/theme";
import { StudentIncomePreference } from "./_types/profile";

const OPTIONS: Array<{
  id: StudentIncomePreference;
  title: string;
  description: string;
}> = [
  {
    id: "working",
    title: "İşləyirəm",
    description: "Maaş əldə edirəm və gəlirlərimi ona uyğun izləmək istəyirəm.",
  },
  {
    id: "stipend",
    title: "Sadəcə təqaüd və ya digər",
    description: "Təqaüd, ailə dəstəyi və ya kiçik gəlir mənbələri əsasdır.",
  },
  {
    id: "mixed",
    title: "Həm maaş, həm digər",
    description: "Maaşla yanaşı təqaüd və əlavə gəlir mənbələri də var.",
  },
];

export default function StudentIncomeSetup() {
  const router = useRouter();
  const {
    userType,
    studentIncomePreference,
    setStudentIncomePreference,
    isHydrated,
  } = useProfile();
  const themeConfig = useThemeConfig();
  const styles = useMemo(() => createStyles(themeConfig), [themeConfig]);
  const [selected, setSelected] = useState<StudentIncomePreference>("working");

  useEffect(() => {
    if (studentIncomePreference) {
      setSelected(studentIncomePreference);
    }
  }, [studentIncomePreference]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    if (userType !== "student") {
      router.replace("/Home");
    }
  }, [isHydrated, userType, router]);

  if (!isHydrated) {
    return null;
  }

  const handleContinue = () => {
    setStudentIncomePreference(selected);
    router.replace("/Home");
  };

  return (
    <LinearGradient colors={themeConfig.gradient} style={styles.gradient}>
      <View style={styles.container}>
        <View style={styles.headerCard}>
          <Text style={styles.eyebrow}>Tələbə profili</Text>
          <Text style={styles.title}>Gəlir mənbəyinizi seçin</Text>
          <Text style={styles.subtitle}>
            Bu seçim gəlir planlaşdırıcısında hansı variantların önə çıxacağını
            müəyyən edir.
          </Text>
        </View>

        <View style={styles.options}>
          {OPTIONS.map((option) => {
            const active = option.id === selected;
            return (
              <TouchableOpacity
                key={option.id}
                style={[styles.optionCard, active && styles.optionCardActive]}
                onPress={() => setSelected(option.id)}
                activeOpacity={0.9}
              >
                <View style={[styles.radio, active && styles.radioActive]}>
                  {active ? <View style={styles.radioDot} /> : null}
                </View>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionTitle, active && styles.optionTitleActive]}>
                    {option.title}
                  </Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.confirmButton}
          activeOpacity={0.92}
          onPress={handleContinue}
        >
          <LinearGradient
            colors={themeConfig.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.confirmInner}
          >
            <Text style={styles.confirmText}>Davam et</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.helper}>
          <View style={styles.helperInner}>
            <Text style={styles.helperTitle}>Sonradan dəyişə bilərsiniz</Text>
            <Text style={styles.helperText}>
              Ayarlar bölməsində gəlir üstünlüyünü yeniləyə və ya hazır planları
              silə bilərsiniz.
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const createStyles = (config: ThemeConfig) => {
  const { palette } = config;
  const surfaceOverlay = config.surfaceOverlay;

  return StyleSheet.create({
    gradient: {
      flex: 1,
      backgroundColor: palette.background,
    },
    container: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 60,
      paddingBottom: 40,
    },
    headerCard: {
      backgroundColor: palette.card,
      borderRadius: 28,
      paddingHorizontal: 26,
      paddingVertical: 30,
      borderWidth: 1,
      borderColor: palette.border,
      shadowColor: palette.shadow,
      shadowOpacity: 0.18,
      shadowOffset: { width: 0, height: 14 },
      shadowRadius: 28,
      elevation: 10,
      marginBottom: 28,
    },
    eyebrow: {
      fontSize: 13,
      fontWeight: "600",
      color: palette.primaryDark,
      letterSpacing: 0.5,
      marginBottom: 10,
    },
    title: {
      color: palette.text,
      fontSize: 26,
      fontWeight: "700",
      marginBottom: 12,
    },
    subtitle: {
      color: palette.textMuted,
      fontSize: 15,
      lineHeight: 22,
    },
    options: {
      gap: 18,
    },
    optionCard: {
      backgroundColor: palette.card,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: palette.border,
      flexDirection: "row",
      alignItems: "center",
      padding: 20,
      shadowColor: palette.shadow,
      shadowOpacity: 0.14,
      shadowOffset: { width: 0, height: 12 },
      shadowRadius: 24,
      elevation: 6,
    },
    optionCardActive: {
      borderColor: palette.primary,
      backgroundColor: surfaceOverlay,
    },
    radio: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: palette.border,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    radioActive: {
      borderColor: palette.primary,
    },
    radioDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: palette.primary,
    },
    optionContent: {
      flex: 1,
    },
    optionTitle: {
      color: palette.text,
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 6,
    },
    optionTitleActive: {
      color: palette.primary,
    },
    optionDescription: {
      color: palette.textMuted,
      fontSize: 14,
      lineHeight: 20,
    },
    confirmButton: {
      marginTop: 32,
      borderRadius: 24,
      overflow: "hidden",
      elevation: 6,
    },
    confirmInner: {
      paddingVertical: 16,
      alignItems: "center",
    },
    confirmText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 0.3,
    },
    helper: {
      marginTop: 24,
    },
    helperInner: {
      backgroundColor: surfaceOverlay,
      borderRadius: 20,
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    helperTitle: {
      color: palette.primary,
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 6,
    },
    helperText: {
      color: palette.textMuted,
      fontSize: 13,
      lineHeight: 20,
    },
  });
};
