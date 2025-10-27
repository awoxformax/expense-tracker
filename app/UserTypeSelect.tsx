import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageSourcePropType,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useProfile } from "./context/ProfileContext";
import { UserType } from "./types/profile";

const OPTIONS: Array<{
  id: UserType;
  label: string;
  image: ImageSourcePropType;
}> = [
  {
    id: "student",
    label: "Tələbə",
    image: require("../assets/images/student.png"),
  },
  {
    id: "worker",
    label: "İşçi",
    image: require("../assets/images/worker.png"),
  },
  {
    id: "parent",
    label: "Ailə başçısı",
    image: require("../assets/images/family.png"),
  },
];

export default function UserTypeSelect() {
  const router = useRouter();
  const { setUserType } = useProfile();

  const handleSelect = (type: UserType) => {
    setUserType(type);
    router.replace("/CategorySetup");
  };

  return (
    <LinearGradient colors={["#2575fc", "#6a11cb"]} style={styles.container}>
      <Text style={styles.title}>Profil növünü seç</Text>
      <Text style={styles.subtitle}>
        Sənə uyğun kateqoriyaları avtomatik hazırlayırıq.
      </Text>

      <View style={styles.options}>
        {OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.card}
            onPress={() => handleSelect(option.id)}
          >
            <Image source={option.image} style={styles.icon} />
            <Text style={styles.cardText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
  },
  options: {
    width: "100%",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "center",
  },
  cardText: {
    color: "#2575fc",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
  },
  icon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
});
