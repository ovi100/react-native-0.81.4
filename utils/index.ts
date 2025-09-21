import { Dimensions, PermissionsAndroid, Platform, ToastAndroid } from "react-native";
const { width: w, height: h } = Dimensions.get('window');

export const toast = (message: string) => {
  ToastAndroid.show(message, ToastAndroid.LONG);
};
export const height = Math.round(h);
export const width = Math.round(w);
export const validateUserId = (id: string) => {
  const checkEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id);
  const checkPhone = /^01[3-9]\d{8}$/.test(id);
  const checkStaffId = /^\d{5}$/.test(id) || /^L\d{5}$/.test(id);
  const isValidUserId = checkEmail || checkPhone || checkStaffId;
  return isValidUserId;
};
export const requestPermissions = async () => {
  try {
    const permissions = [
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      // PermissionsAndroid.PERMISSIONS.REQUEST_INSTALL_PACKAGES,
    ];

    // console.log(Platform.Version)

    // Only required for Android 12 and below
    if (+Platform.Version <= 32) {
      permissions.push(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      permissions.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
    }
    const granted = await PermissionsAndroid.requestMultiple(permissions);

    const result = Object.values(granted).every(
      status => status === PermissionsAndroid.RESULTS.GRANTED,
    );

    if (result) {
      // toast('All permissions granted');
    } else {
      toast('Some permissions denied');
    }
  } catch (error: any) {
    toast(error.message);
  }
};