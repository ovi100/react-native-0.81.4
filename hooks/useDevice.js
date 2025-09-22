import { useState } from 'react';
import { Dimensions, Platform, useColorScheme } from 'react-native';

const useDevice = () => {
  const [theme, setTheme] = useState(useColorScheme());
  const { width, height } = Dimensions.get('window');

  const deviceInfo = {
    theme,
    setTheme,
    width,
    height,
    os: Platform.OS,
    brand: Platform.constants.Brand,
    model: Platform.constants.Model,
    manufacturer: Platform.constants.Manufacturer,
    version: Platform.Version,
    isIos: Platform.OS === 'ios',
    isAndroid: Platform.OS === 'android',
    osVersion: Platform.constants.Release,
  };

  return deviceInfo;
};

export default useDevice;
