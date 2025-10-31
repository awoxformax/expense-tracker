import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { apiRequest } from "./_utils/apiClient";
import { ThemeConfig, useThemeConfig } from "./_constants/theme";

export default function Signup() {
  const router = useRouter();
  const themeConfig = useThemeConfig();
  const styles = useMemo(() => createStyles(themeConfig), [themeConfig]);
  const { palette } = themeConfig;
  const inputBackground = themeConfig.inputBackground;
  const surfaceOverlay = themeConfig.surfaceOverlay;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSignup = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const cleanedPassword = password.trim();
    const cleanedConfirm = confirm.trim();

    if (!normalizedEmail || !cleanedPassword || !cleanedConfirm) {
      alert("Zəhmət olmasa bütün xanaları doldurun.");
      return;
    }

    if (cleanedPassword !== cleanedConfirm) {
      alert("Şifrələr uyğun gəlmir.");
      return;
    }

    try {
      const { response } = await apiRequest({
        path: "/api/auth/signup",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          password: cleanedPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Qeydiyyat uğursuz oldu.");
        return;
      }

      alert("Qeydiyyat tamamlandı! İndi daxil ol.");
      router.push("/Login");
    } catch (err) {
      alert("Serverə qoşulmaq mümkün olmadı.");
    }
  };

  return (
    <LinearGradient
      colors={themeConfig.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View pointerEvents="none" style={styles.ambientTop} />
      <View pointerEvents="none" style={styles.ambientBottom} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.card}>
          <Text style={styles.eyebrow}>Yeni hesab</Text>
          <Text style={styles.title}>Maliyyə səyahətinə başla</Text>
          <Text style={styles.subtitle}>
            Hesabını oluştur, rahat qəhvə tonlarında idarə panelinə qoşul.
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="ad@şirkət.az"
              placeholderTextColor={palette.textMuted}
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Şifrə</Text>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor={palette.textMuted}
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Şifrəni təkrar et</Text>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor={palette.textMuted}
              style={styles.input}
              secureTextEntry
              value={confirm}
              onChangeText={setConfirm}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSignup}>
            <LinearGradient
              colors={themeConfig.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonInner}
            >
              <Text style={styles.buttonText}>Qeydiyyatdan keç</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.helperBlock}>
            <Text style={styles.helperLine}>Şəxsi maliyyə planların bir addım uzaqda.</Text>
          </View>

          <TouchableOpacity onPress={() => router.push("/Login")} style={styles.loginRow}>
            <Text style={styles.link}>Artıq hesabın var?</Text>
            <Text style={styles.linkHighlight}>Daxil ol</Text>
          </TouchableOpacity>
        </View>
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
  ambientTop: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(200, 144, 91, 0.2)",
    top: -60,
    left: -40,
  },
  ambientBottom: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(255, 255, 255, 0.28)",
    bottom: -70,
    right: -60,
  },
  card: {
    width: "88%",
    backgroundColor: palette.card,
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingVertical: 36,
    shadowColor: palette.shadow,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 16 },
    shadowRadius: 30,
    elevation: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "600",
    color: palette.primaryDark,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: palette.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: palette.textMuted,
    marginBottom: 30,
  },
  field: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: palette.textMuted,
    marginBottom: 6,
  },
  input: {
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
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    marginBottom: 18,
  },
  buttonInner: {
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  helperBlock: {
    backgroundColor: surfaceOverlay,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  helperLine: {
    color: palette.textMuted,
    fontSize: 13,
    textAlign: "center",
  },
  loginRow: {
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
