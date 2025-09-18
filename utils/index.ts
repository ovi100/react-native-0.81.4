import { Dimensions, ToastAndroid } from "react-native";
const { width: w, height: h } = Dimensions.get('window');

export const toast = (message: string) => {
  ToastAndroid.show(message, ToastAndroid.LONG);
};
export const height = Math.round(h);
export const width = Math.round(w);
export const validateUserId = (id: string) => {
  const isValidUserId =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id) ||
    /^\d{5}$/.test(id) ||
    /^L\d{5}$/.test(id);
  return isValidUserId;
};