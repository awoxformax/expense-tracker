import { Stack } from "expo-router";
import { ProfileProvider } from "./_context/ProfileContext";

export default function RootLayout() {
  return (
    <ProfileProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="LanguageSelect"
          options={{ title: "Dil seçimi" }}
        />
        <Stack.Screen name="index" options={{ title: "Expense Tracker" }} />
        <Stack.Screen name="Login" options={{ title: "Daxil ol" }} />
        <Stack.Screen name="Signup" options={{ title: "Qeydiyyat" }} />
        <Stack.Screen name="Home" options={{ title: "Ana səhifə" }} />
        <Stack.Screen
          name="AddExpense"
          options={{ title: "Xərc əlavə et" }}
        />
        <Stack.Screen
          name="TutorialScreen"
          options={{ title: "Bələdçi" }}
        />
        <Stack.Screen
          name="UserTypeSelect"
          options={{ title: "Profil seçimi" }}
        />
        <Stack.Screen
          name="CategorySetup"
          options={{ title: "Kateqoriya seçimi" }}
        />
        <Stack.Screen
          name="StudentIncomeSetup"
          options={{ title: "Tələbə gəliri" }}
        />
      </Stack>
    </ProfileProvider>
  );
}
