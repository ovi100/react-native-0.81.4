import { cssInterop } from "nativewind";
import LottieView from "lottie-react-native";

// Enable className → style mapping for LottieView
cssInterop(LottieView, {
  className: { target: "style" },
});
