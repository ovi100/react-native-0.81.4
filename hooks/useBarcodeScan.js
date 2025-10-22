import { useCallback, useEffect, useState } from 'react';
import { DeviceEventEmitter, NativeEventEmitter, Platform } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import SunmiScanner from '../utils/sunmi/scanner';
import { BarcodeScanner } from '../utils/native';
import { getStorage } from '../utils/storage';
import { toast } from '../utils';

const useBarcodeScan = () => {
  const { stopCameraScan } = BarcodeScanner;
  const { startScan, stopScan } = SunmiScanner;
  const [barcode, setBarcode] = useState('');
  const isFocused = useIsFocused();
  const brand = Platform.constants?.Brand || 'Unknown';

  const sunmiScanner = useCallback(() => {
    if (!isFocused) {
      return;
    }

    startScan();
    const listener = DeviceEventEmitter.addListener(
      'ScanDataReceived',
      async data => {
        const code = data.code.trim();
        const pressMode = await getStorage('pressMode');
        if (pressMode) {
          toast('Turn off the press mode');
          return;
        }

        if (!code) {
          return;
        }
        setBarcode(code);
      },
    );

    return listener;
  }, [isFocused, startScan]);

  const cameraScanner = useCallback(() => {
    const scannerEvents = new NativeEventEmitter(BarcodeScanner);
    const listener = scannerEvents.addListener(
      'onBarcodeScanned',
      async data => {
        const code = data.trim();

        if (!code) {
          return;
        }
        setBarcode(code);
      },
    );

    return listener;
  }, []);

  useEffect(() => {
    let listener;
    if (brand.toLowerCase() === 'sunmi') {
      listener = sunmiScanner();
    } else {
      listener = cameraScanner();
    }

    return () => {
      stopScan();
      stopCameraScan();
      listener?.remove();
    };
  }, [brand, sunmiScanner, cameraScanner, stopScan, stopCameraScan]);

  const resetBarcode = () => {
    setBarcode('');
  };

  return { barcode, resetBarcode };
};

export default useBarcodeScan;
