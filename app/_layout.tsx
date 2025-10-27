import { Stack } from "expo-router";
import { ProfileProvider } from "./context/ProfileContext";

export default function RootLayout() {
  return (
    <ProfileProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: "Welcome" }} />
        <Stack.Screen name="Login" options={{ title: "Login" }} />
        <Stack.Screen name="Signup" options={{ title: "Sign Up" }} />
        <Stack.Screen name="Home" options={{ title: "Home" }} />
        <Stack.Screen name="AddExpense" options={{ title: "Add Expense" }} />
        <Stack.Screen name="TutorialScreen" options={{ title: "Tutorial" }} />
        <Stack.Screen
          name="UserTypeSelect"
          options={{ title: "Profil seçimi" }}
        />
        <Stack.Screen
          name="CategorySetup"
          options={{ title: "Kateqoriya seçimi" }}
        />
      </Stack>
    </ProfileProvider>
  );
}
