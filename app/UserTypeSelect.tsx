import React, { useEffect, useMemo } from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useProfile } from "./_context/ProfileContext";
import { UserType } from "./_types/profile";
import { ThemeConfig, useThemeConfig } from "./_constants/theme";

const OPTIONS: Array<{
  id: UserType;
  label: string;
  description: string;
  image: ImageSourcePropType;
}> = [
  {
    id: "student",
    label: "Tələbə",
    description: "Dərs, təhsil və gündəlik icra üçün sadə plan.",
    image: require("../assets/images/student.png"),
  },
  {
    id: "worker",
    label: "İşçi",
    description: "Maaş, ofis və şəxsi xərclərini balansda saxla.",
    image: require("../assets/images/worker.png"),
  },
  {
    id: "parent",
    label: "Ailə başçısı",
    description: "Ev büdcəsi və ailə planı üçün rahat nəzarət.",
    image: require("../assets/images/family.png"),
  },
];

export default function UserTypeSelect() {
  const router = useRouter();
  const { setUserType, languageSelected, isHydrated } = useProfile();
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

  const handleSelect = (type: UserType) => {
    setUserType(type);
    router.replace("/CategorySetup");
  };

  if (!isHydrated) {
    return null;
  }

  return (
    <LinearGradient
      colors={themeConfig.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <View style={styles.headerCard}>
          <Text style={styles.eyebrow}>Profil seçimi</Text>
          <Text style={styles.title}>Sənin üçün hansı ssenari uyğundur?</Text>
          <Text style={styles.subtitle}>
            Seçiminə uyğun kateqoriyalar və statistikalar avtomatik hazır olsun.
          </Text>
        </View>

        <View style={styles.options}>
          {OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.card}
              onPress={() => handleSelect(option.id)}
              activeOpacity={0.9}
            >
              <View style={styles.cardImageHolder}>
                <Image source={option.image} style={styles.icon} />
              </View>
              <View style={styles.cardTextBlock}>
                <Text style={styles.cardTitle}>{option.label}</Text>
                <Text style={styles.cardDescription}>{option.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.helper}>
          <LinearGradient
            colors={themeConfig.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.helperInner}
          >
            <Text style={styles.helperText}>
              İstənilən vaxt profilini dəyişə bilərsən.
            </Text>
          </LinearGradient>
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
    card: {
      backgroundColor: palette.card,
      borderRadius: 24,
      flexDirection: "row",
      alignItems: "center",
      padding: 20,
      borderWidth: 1,
      borderColor: palette.border,
      shadowColor: palette.shadow,
      shadowOpacity: 0.16,
      shadowOffset: { width: 0, height: 12 },
      shadowRadius: 24,
      elevation: 8,
    },
    cardImageHolder: {
      width: 64,
      height: 64,
      borderRadius: 18,
      backgroundColor: surfaceOverlay,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 18,
    },
    icon: {
      width: 40,
      height: 40,
      resizeMode: "contain",
    },
    cardTextBlock: {
      flex: 1,
    },
    cardTitle: {
      color: palette.text,
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 6,
    },
    cardDescription: {
      color: palette.textMuted,
      fontSize: 14,
      lineHeight: 20,
    },
    helper: {
      marginTop: 34,
      borderRadius: 20,
      overflow: "hidden",
      elevation: 6,
    },
    helperInner: {
      paddingVertical: 14,
      borderRadius: 20,
      alignItems: "center",
    },
    helperText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "600",
      letterSpacing: 0.2,
    },
  });
};
