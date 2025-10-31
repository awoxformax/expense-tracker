import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ThemeConfig, useThemeConfig } from "./_constants/theme";

export default function AddExpense() {
  const router = useRouter();
  const themeConfig = useThemeConfig();
  const styles = useMemo(() => createStyles(themeConfig), [themeConfig]);

  return (
    <LinearGradient
      colors={themeConfig.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Xərc əlavə et</Text>
          <Text style={styles.description}>
            Ana səhifədə kateqoriya kartlarına toxunaraq xərc əlavə edə bilərsiniz. Geri
            qayıtmaq üçün aşağıdakı düymədən istifadə edin.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace("/Home")}
          >
            <LinearGradient
              colors={themeConfig.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonInner}
            >
              <Text style={styles.buttonText}>Ana səhifəyə qayıt</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const createStyles = ({ palette }: ThemeConfig) =>
  StyleSheet.create({
    gradient: {
      flex: 1,
      backgroundColor: palette.background,
    },
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 28,
    },
    card: {
      backgroundColor: palette.card,
      borderRadius: 26,
      paddingHorizontal: 26,
      paddingVertical: 36,
      shadowColor: palette.shadow,
      shadowOpacity: 0.22,
      shadowOffset: { width: 0, height: 20 },
      shadowRadius: 34,
      elevation: 14,
      borderWidth: 1,
      borderColor: palette.border,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: palette.text,
      marginBottom: 12,
    },
    description: {
      fontSize: 16,
      lineHeight: 24,
      color: palette.textMuted,
      marginBottom: 28,
    },
    button: {
      borderRadius: 18,
      overflow: "hidden",
      elevation: 3,
    },
    buttonInner: {
      paddingVertical: 15,
      alignItems: "center",
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
    },
  });
