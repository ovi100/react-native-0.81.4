import { useCallback, useEffect, useState } from 'react';
import { DeviceEventEmitter, NativeEventEmitter, Platform } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { API_URL } from '../app-config';
import SunmiScanner from '../utils/sunmi/scanner';
import { BarcodeScanner } from '../utils/native';
import { toast } from '../utils';
import { getStorage } from '../utils/storage';

const useCheckBarcode = token => {
  const { stopCameraScan } = BarcodeScanner;
  const { startScan, stopScan } = SunmiScanner;
  const [barcode, setBarcode] = useState('');
  // const [isCustomBarcode, setIsCustomBarcode] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState(null);
  const isFocused = useIsFocused();
  const brand = Platform.constants?.Brand || 'Unknown';

  const getBarcodeDetails = useCallback(async code => {
    try {
      setIsChecking(true);
      const res = await fetch(`${API_URL}barcodes/barcode/${code}`, {
        method: 'GET',
        headers: {
          authorization: token,
        },
      });

      const response = await res.json();

      if (response?.success) {
        setResult({ ...response.data, scanCode: code });
      }
    } catch (error) {
      toast(error.message || error.message);
      setResult(null);
    } finally {
      setIsChecking(false);
    }
  }, [token]);

  const sunmiScanner = useCallback(() => {
    if (!isFocused) {
      return;
    }

    startScan();
    const listener = DeviceEventEmitter.addListener(
      'ScanDataReceived',
      async data => {
        const code = data.code?.trim();
        if (!code) {
          return;
        }
        const pressMode = await getStorage('pressMode');
        if (pressMode) {
          toast('Turn off the press mode');
          setBarcode('');
          return;
        }
        setBarcode(code);
        await getBarcodeDetails(code);
      },
    );

    return listener;
  }, [getBarcodeDetails, isFocused, startScan]);

  const cameraScanner = useCallback(() => {
    const scannerEvents = new NativeEventEmitter(BarcodeScanner);
    const listener = scannerEvents.addListener(
      'onBarcodeScanned',
      async data => {
        const code = data.trim();
        // let material = code;
        // const condition = (code.length >= 12 && code.startsWith('20')) || (code.length >= 9 && code.endsWith('.'))
        // if (code.length >= 12 && code.startsWith('20')) {
        //   const modifiedCode = code.slice(2, -1);
        //   const articleCode = modifiedCode.slice(0, 5);
        //   material = articleCode.slice(0, 2) + '00' + articleCode.slice(2);
        // }
        // if (code.length >= 9 && code.endsWith('.')) {
        //   material = articleCode.slice(0, 7);
        // }
        if (!code) {
          return;
        }
        setBarcode(code);
        await getBarcodeDetails(code);
      },
    );

    return listener;
  }, [getBarcodeDetails]);

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
  }, [brand, sunmiScanner, cameraScanner, stopScan, stopCameraScan, token]);

  const resetBarcode = () => {
    setBarcode('');
    setResult(null);
  };

  return { isChecking, result, barcode, resetBarcode };
};

export default useCheckBarcode;
