import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { apiRequest } from "./_utils/apiClient";
import { ThemeConfig, useThemeConfig } from "./_constants/theme";

export default function Login() {
  const router = useRouter();
  const themeConfig = useThemeConfig();
  const styles = useMemo(() => createStyles(themeConfig), [themeConfig]);
  const { palette } = themeConfig;
  const inputBackground = themeConfig.inputBackground;
  const surfaceOverlay = themeConfig.surfaceOverlay;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1400,
      useNativeDriver: true,
      easing: Easing.out(Easing.quad),
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim]);

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const cleanedPassword = password.trim();

    if (!normalizedEmail || !cleanedPassword) {
      alert("Zəhmət olmasa email və şifrənizi daxil edin.");
      return;
    }

    try {
      console.log("POST /api/auth/login", normalizedEmail);
      const { response } = await apiRequest({
        path: "/api/auth/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          password: cleanedPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Giriş baş tutmadı.");
        return;
      }

      router.replace("/TutorialScreen");
    } catch (err) {
      alert("Serverə qoşulmaq mümkün olmadı.");
    }
  };

  const floatingTranslate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  return (
    <LinearGradient
      colors={themeConfig.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View pointerEvents="none" style={styles.ambientCircleLarge} />
      <View pointerEvents="none" style={styles.ambientCircleSmall} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Animated.View
          style={[
            styles.card,
            { opacity: fadeAnim, transform: [{ translateY: floatingTranslate }] },
          ]}
        >
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>ET</Text>
          </View>
          <Text style={styles.title}>Expense Tracker-ə xoş gəldin</Text>
          <Text style={styles.subtitle}>
            Giriş et və maliyyəni zövqlə idarə etməyə başla. Yumşaq tonlar,
            dəqiq statistikalar, rahat axın.
          </Text>

          <View style={styles.tag}>
            <Text style={styles.tagText}>Bu gün üçün sakit büdcə planı hazırdır</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              placeholder="ad@şirkət.az"
              style={styles.input}
              placeholderTextColor={palette.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Şifrə</Text>
            <TextInput
              placeholder="••••••••"
              style={styles.input}
              placeholderTextColor={palette.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <LinearGradient
              colors={themeConfig.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonInner}
            >
              <Text style={styles.buttonText}>Daxil ol</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.helperRow}>
            <Text style={styles.helperText}>Şifrəni unutdun?</Text>
            <Text style={styles.helperCallout}>Dəstək üçün yaz</Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/Signup")}
            style={styles.signupRow}
          >
            <Text style={styles.link}>Hesabın yoxdur?</Text>
            <Text style={styles.linkHighlight}>Qeydiyyatdan keç</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const createStyles = (config: ThemeConfig) => {
  const { palette } = config;
  const surfaceOverlay = config.surfaceOverlay;
  const inputBackground = config.inputBackground;
  return StyleSheet.create({
  gradient: {
    flex: 1,
    backgroundColor: palette.background,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 24,
  },
  ambientCircleLarge: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(198, 149, 103, 0.22)",
    top: -70,
    right: -80,
  },
  ambientCircleSmall: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255, 255, 255, 0.35)",
    bottom: -60,
    left: -40,
  },
  card: {
    width: "88%",
    backgroundColor: palette.card,
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingVertical: 36,
    shadowColor: palette.shadow,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 18 },
    shadowRadius: 32,
    elevation: 12,
    alignItems: "stretch",
    borderWidth: 1,
    borderColor: palette.border,
  },
  logoBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(200, 144, 91, 0.12)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 16,
  },
  logoBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 1,
    color: palette.primaryDark,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: palette.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: palette.textMuted,
    lineHeight: 24,
    marginBottom: 26,
  },
  tag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 240, 226, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 24,
  },
  tagText: {
    fontSize: 13,
    color: palette.primary,
    fontWeight: "600",
  },
  field: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 13,
    color: palette.textMuted,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    backgroundColor: inputBackground,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: palette.text,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: "#c8a680",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 2,
  },
  button: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 6,
    marginBottom: 18,
    elevation: 3,
  },
  buttonInner: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  helperRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: surfaceOverlay,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
  },
  helperText: {
    color: palette.textMuted,
    fontSize: 13,
  },
  helperCallout: {
    color: palette.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  link: {
    color: palette.textMuted,
    fontSize: 14,
  },
  linkHighlight: {
    color: palette.primary,
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 6,
  },
  });
};
