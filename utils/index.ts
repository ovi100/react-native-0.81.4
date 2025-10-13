import { Dimensions, PermissionsAndroid, Platform, ToastAndroid } from "react-native";
const { width: w, height: h } = Dimensions.get('window');

export const toast = (message: string) => {
  ToastAndroid.show(message, ToastAndroid.LONG);
};

export const height = Math.round(h);
export const width = Math.round(w);
export const FlatListStyle = { paddingVertical: 10 };

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

export const serverMessage = (msg = "") => {
  const m = msg.trim();
  if (m.includes("Could not open connection")) return "SAP server is off 🙁";
  if (m.includes("JSON Parse error")) return "Server is down 🙁";
  return m || "Something went wrong";
};

export const calculateShelfLife = (mfgDate: Date, expDate: Date) => {
  if (mfgDate && expDate) {
    const date = new Date();
    const mfg = new Date(mfgDate);
    const exp = new Date(expDate);
    const shelfLife = Math.round(((exp.getTime() - date.getTime()) / (exp.getTime() - mfg.getTime())) * 100);
    return shelfLife;
  }
  return 0;
};

export const handleDate = (value: string, type: string) => {
  value = value.replace(/\D/g, '');

  if (value.length > 2 && value[2] !== '/') {
    value = value.slice(0, 2) + '/' + value.slice(2);
  }
  if (value.length > 5 && value[5] !== '/') {
    value = value.slice(0, 5) + '/' + value.slice(5);
  }

  const dateRegex = /^\d{2}\/\d{2}\/\d{2}$/;
  if (!dateRegex.test(value)) {
    return { date: null, text: value };
  }

  let [day, month, year] = value.split('/').map(Number);

  if (year > 99) {
    year = year % 100;
  }

  const currentYear = new Date().getFullYear() % 100;
  const fullYear = year + 2000;

  if (month < 1 || month > 12) {
    toast('Invalid month (1-12)');
    return { date: null, text: value };
  }

  const daysInMonth = new Date(fullYear, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    toast(`Invalid day (1-${daysInMonth})`);
    return { date: null, text: value };
  }

  const today = new Date();
  const inputDate = new Date(fullYear, month - 1, day);

  if (type === 'mfg') {
    const minYear = currentYear - 5;
    if (year < minYear || inputDate >= today) {
      toast('MFG date must be within 5 years and before today');
      return { date: null, text: value };
    }
  }
  if (type === 'exp') {
    const maxYear = currentYear + 8;
    if (year > maxYear || inputDate <= today) {
      toast('EXP date must be within 8 years and after today');
      return { date: null, text: value };
    }
  }

  return { date: inputDate, text: value };
};