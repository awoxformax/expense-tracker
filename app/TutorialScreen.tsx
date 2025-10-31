import React, { useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Swiper from "react-native-swiper";
import { useRouter } from "expo-router";
import { ThemeConfig, useThemeConfig } from "./_constants/theme";

const { width } = Dimensions.get("window");
const slides = [
  {
    id: 1,
    title: "Xərclərini izləməyə başla",
    desc: "Expense Tracker gündəlik və aylıq xərclərini yumşaq panellərdə sənə göstərir.",
    image: require("../assets/images/slide1.png"),
  },
  {
    id: 2,
    title: "Balansını qorumağa kömək edək",
    desc: "Büdcənin hara getdiyini aydın gör, vacib ödənişləri vaxtında planla.",
    image: require("../assets/images/slide2.png"),
  },
  {
    id: 3,
    title: "Profilinə uyğun seçim",
    desc: "Tələbə, işçi və ya ailə başçısı ol, sənin üçün seçilmiş kateqoriyalar hazırdır.",
    image: require("../assets/images/slide3.png"),
  },
];

export default function TutorialScreen() {
  const [index, setIndex] = useState(0);
  const swiperRef = useRef<Swiper | null>(null);
  const router = useRouter();
  const themeConfig = useThemeConfig();
  const styles = useMemo(() => createStyles(themeConfig), [themeConfig]);
  const { palette } = themeConfig;
  const surfaceOverlay = themeConfig.surfaceOverlay;

  return (
    <LinearGradient
      colors={themeConfig.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.topOrbit} />
      <View style={styles.bottomOrbit} />
      <Swiper
        ref={swiperRef}
        loop={false}
        dot={<View style={styles.dot} />}
        activeDot={<View style={styles.activeDot} />}
        onIndexChanged={(i) => setIndex(i)}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <View style={styles.imageHolder}>
              <Image source={slide.image} style={styles.image} />
            </View>
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
        <LinearGradient
          colors={themeConfig.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.buttonInner}
        >
          <Text style={styles.buttonText}>
            {index === slides.length - 1 ? "Başla" : "Sonrakı"}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const createStyles = (config: ThemeConfig) => {
  const { palette } = config;
  const surfaceOverlay = config.surfaceOverlay;
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  topOrbit: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(200, 144, 91, 0.18)",
    top: -70,
    left: -60,
  },
  bottomOrbit: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(255, 255, 255, 0.28)",
    bottom: -80,
    right: -90,
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  imageHolder: {
    width: width * 0.78,
    height: width * 0.78,
    borderRadius: 28,
    backgroundColor: surfaceOverlay,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 34,
  },
  image: {
    width: "88%",
    height: "88%",
    resizeMode: "contain",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: palette.text,
    textAlign: "center",
    marginBottom: 12,
  },
  desc: {
    fontSize: 16,
    color: palette.textMuted,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 12,
  },
  dot: {
    backgroundColor: "rgba(79, 56, 39, 0.2)",
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: palette.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  button: {
    width: "70%",
    alignSelf: "center",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 48,
    elevation: 4,
  },
  buttonInner: {
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  });
};
