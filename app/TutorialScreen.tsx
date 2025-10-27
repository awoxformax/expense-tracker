import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Swiper from "react-native-swiper";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: 1,
    title: "Xərclərini izləməyə başla",
    desc: "Expense Tracker ilə günlük ve aylığ xərcləri asanlıqla izlə.",
    image: require("../assets/images/slide1.png"),
  },
  {
    id: 2,
    title: "Balansını qoru",
    desc: "Büdcənin hara getdiyini aydın gör və vacib xərcləri unutma.",
    image: require("../assets/images/slide2.png"),
  },
  {
    id: 3,
    title: "Profilinə uyğun seçim",
    desc: "Tələbə, işçi və ya ailə başçısısan? Səni düşünərək kateqoriyalar qurduq.",
    image: require("../assets/images/slide3.png"),
  },
];

export default function TutorialScreen() {
  const [index, setIndex] = useState(0);
  const swiperRef = useRef<Swiper | null>(null);
  const router = useRouter();

  return (
    <LinearGradient colors={["#6a11cb", "#2575fc"]} style={styles.container}>
      <Swiper
        ref={swiperRef}
        loop={false}
        dot={<View style={styles.dot} />}
        activeDot={<View style={styles.activeDot} />}
        onIndexChanged={(i) => setIndex(i)}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <Image source={slide.image} style={styles.image} />
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.desc}>{slide.desc}</Text>
          </View>
        ))}
      </Swiper>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (index === slides.length - 1) {
            router.replace("/UserTypeSelect");
          } else {
            swiperRef.current?.scrollBy(1);
          }
        }}
      >
        <Text style={styles.buttonText}>
          {index === slides.length - 1 ? "Başla" : "Sonrakı"}
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  image: {
    width: width * 0.7,
    height: width * 0.7,
    resizeMode: "contain",
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  desc: {
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
  },
  dot: {
    backgroundColor: "rgba(255,255,255,0.4)",
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#fff",
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 30,
    width: "60%",
    alignSelf: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  buttonText: {
    color: "#2575fc",
    fontWeight: "bold",
    fontSize: 16,
  },
});
