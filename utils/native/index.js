import { NativeModules } from 'react-native';

const { BarcodeScanner } = NativeModules;
const { startCameraScan, stopCameraScan } = BarcodeScanner;

export { BarcodeScanner, startCameraScan, stopCameraScan };


