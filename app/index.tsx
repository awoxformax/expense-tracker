import React, { useEffect, useMemo } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useProfile } from "./_context/ProfileContext";
import { ThemeConfig, useThemeConfig } from "./_constants/theme";

export default function Index() {
  const router = useRouter();
  const { languageSelected, isHydrated } = useProfile();
  const themeConfig = useThemeConfig();
  const styles = useMemo(() => createStyles(themeConfig), [themeConfig]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    if (!languageSelected) {
      router.replace("/LanguageSelect");
    }
  }, [isHydrated, languageSelected, router]);

  return (
    <LinearGradient
      colors={themeConfig.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.backgroundOrnament} />
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Expense Tracker</Text>
          </View>
          <Text style={styles.title}>Sakit maliyyə idarəetməsi</Text>
          <Text style={styles.subtitle}>
            Qəhvə tonlarında rahat panel, balanslı statistika, gündəlik büdcə motivasiyası.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/Login")}
          >
            <LinearGradient
              colors={themeConfig.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButtonInner}
            >
              <Text style={styles.primaryButtonText}>Daxil ol</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/Signup")}
          >
            <Text style={styles.secondaryButtonText}>Yeni hesab yarat</Text>
          </TouchableOpacity>
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
    backgroundOrnament: {
      position: "absolute",
      width: 320,
      height: 320,
      borderRadius: 160,
      backgroundColor: "rgba(200, 144, 91, 0.18)",
      top: -80,
      right: -100,
    },
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 28,
    },
    card: {
      width: "100%",
      backgroundColor: palette.card,
      borderRadius: 28,
      paddingHorizontal: 30,
      paddingVertical: 40,
      shadowColor: palette.shadow,
      shadowOpacity: 0.22,
      shadowOffset: { width: 0, height: 18 },
      shadowRadius: 34,
      elevation: 14,
      borderWidth: 1,
      borderColor: palette.border,
    },
    badge: {
      alignSelf: "flex-start",
      backgroundColor: "rgba(200, 144, 91, 0.12)",
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginBottom: 18,
    },
    badgeText: {
      color: palette.primaryDark,
      fontSize: 13,
      fontWeight: "600",
      letterSpacing: 1,
    },
    title: {
      fontSize: 30,
      fontWeight: "700",
      color: palette.text,
      marginBottom: 12,
    },
    subtitle: {
      fontSize: 16,
      color: palette.textMuted,
      lineHeight: 24,
      marginBottom: 34,
    },
    primaryButton: {
      borderRadius: 18,
      overflow: "hidden",
      marginBottom: 16,
      elevation: 3,
    },
    primaryButtonInner: {
      paddingVertical: 16,
      alignItems: "center",
    },
    primaryButtonText: {
      color: "#fff",
      fontSize: 17,
      fontWeight: "700",
      letterSpacing: 0.4,
    },
    secondaryButton: {
      backgroundColor: surfaceOverlay,
      borderRadius: 16,
      paddingVertical: 14,
      alignItems: "center",
    },
    secondaryButtonText: {
      color: palette.primary,
      fontSize: 16,
      fontWeight: "600",
    },
  });
};
