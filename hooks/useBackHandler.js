import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';

const useBackHandler = (
  screen,
  params = {},
) => {
  const navigation = useNavigation();

  useEffect(() => {
    const onBackPress = () => {
      navigation.replace(screen, params);
      return true; // Prevent default behavior
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );

    return () => backHandler.remove();
  }, [navigation, screen, params])
};

export default useBackHandler;
