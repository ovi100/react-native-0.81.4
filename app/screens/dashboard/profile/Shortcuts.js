import { View, Text, TouchableWithoutFeedback, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { getStorage, setStorage } from '../../../../utils/storage';
import { PasswordSaveImage, RtvPressImage, SignImage, ThemeToggleImage, TouchImage } from '../../../../assets/images';
import { Switch } from '../../../../components';

const Shortcuts = ({ navigation, route }) => {
  const { roles } = route.params;
  const [isDarkEnabled, setIsDarkEnabled] = useState(false);
  const [isPressEnabled, setIsPressEnabled] = useState(false);
  const [isSignEnabled, setIsSignEnabled] = useState(false);
  const [isRtvEnabled, setIsRtvEnabled] = useState(false);
  const [isSavePasswordEnabled, setIsSavePasswordEnabled] = useState(false);

  useEffect(() => {
    const getAsyncStorage = async () => {
      const [dark, press, sign, rtvPress, savePassword] = await Promise.all([
        getStorage('darkMode'),
        getStorage('pressMode'),
        getStorage('signMode'),
        getStorage('rtvPressMode'),
        getStorage('savePassword'),
      ]);
      setIsDarkEnabled(dark);
      setIsPressEnabled(press);
      setIsSignEnabled(sign);
      setIsRtvEnabled(rtvPress);
      setIsSavePasswordEnabled(savePassword);
    };
    getAsyncStorage();
  }, []);

  const toggleSwitch = async (type, updateFn, currentValue) => {
    const newValue = !currentValue;
    updateFn(newValue);
    await setStorage(type, newValue);
  };

  const toggleDarkSwitch = () =>
    toggleSwitch('darkMode', setIsDarkEnabled, isDarkEnabled);
  const togglePressSwitch = () =>
    toggleSwitch('pressMode', setIsPressEnabled, isPressEnabled);
  const toggleSignSwitch = () =>
    toggleSwitch('signMode', setIsSignEnabled, isSignEnabled);
  const toggleRtvSwitch = () =>
    toggleSwitch('rtvPressMode', setIsRtvEnabled, isRtvEnabled);
  const toggleSavePasswordSwitch = () =>
    toggleSwitch(
      'savePassword',
      setIsSavePasswordEnabled,
      isSavePasswordEnabled,
    );

  const common = [
    {
      id: 'theme',
      permission: 'theme-toggle-access',
      enabled: isDarkEnabled,
      toggle: toggleDarkSwitch,
      trackColor: { false: '#3c3c3c', true: '#386641' },
      thumbColor: { false: '#081c15', true: '#3a5a40' },
      label: 'Dark mode is',
      icon: ThemeToggleImage,
    },
    {
      id: 'save-password',
      permission: 'save-password-access',
      enabled: isSavePasswordEnabled,
      toggle: toggleSavePasswordSwitch,
      trackColor: { false: '#3c3c3c', true: '#386641' },
      thumbColor: { false: '#081c15', true: '#3a5a40' },
      label: 'Password save mode is',
      icon: PasswordSaveImage,
    },
  ];

  const switchList = [
    {
      id: 'press',
      permission: 'press-mode-access',
      enabled: isPressEnabled,
      toggle: togglePressSwitch,
      trackColor: { false: '#3c3c3c', true: '#386641' },
      thumbColor: { false: '#081c15', true: '#3a5a40' },
      label: 'Press mode is',
      icon: TouchImage,
    },
    {
      id: 'sign',
      permission: 'vendor-sign-access',
      enabled: isSignEnabled,
      toggle: toggleSignSwitch,
      trackColor: { false: '#3c3c3c', true: '#386641' },
      thumbColor: { false: '#081c15', true: '#3a5a40' },
      label: 'Vendor sign mode is',
      icon: SignImage,
    },
    {
      id: 'rtv',
      permission: 'rtv-press-access',
      enabled: isRtvEnabled,
      toggle: toggleRtvSwitch,
      trackColor: { false: '#3c3c3c', true: '#386641' },
      thumbColor: { false: '#081c15', true: '#3a5a40' },
      label: 'Rtv press mode is',
      icon: RtvPressImage,
    },
  ];

  const filterPermissions = data => {
    if (roles.includes('Application Admin')) {
      return [...common, ...data];
    }

    const filteredList = data.filter(item =>
      roles.includes(item.permission),
    );
    return [...common, ...filteredList];
  };
  const permissions = filterPermissions(switchList);

  return (
    <View className="flex-1 bg-white dark:bg-neutral-950 p-2">
      {permissions.map(item => (
        <View
          className="switch border-b border-gray-200 flex-row items-center py-2.5"
          key={item.id}>
          <View className="w-full flex-row items-center justify-between">
            <TouchableWithoutFeedback onPress={item.toggle}>
              <View className="flex-row items-center">
                <Image source={item.icon} className="w-7 h-7 mr-2" />
                <Text
                  className={`text-sm xs:text-base ${item.enabled ? 'text-slate-600' : 'text-gray-400'
                    } font-medium`}>
                  {item.label} {item.enabled ? 'on' : 'off'}
                </Text>
              </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={item.toggle}>
              <Switch
                trackColor={item.trackColor}
                thumbColor={item.thumbColor}
                ios_backgroundColor="#3e3e3e"
                size={20}
                type="rounded"
                value={item.enabled}
                onChange={item.toggle}
              />
            </TouchableWithoutFeedback>
          </View>
        </View>
      ))}
    </View>
  )
}

export default Shortcuts