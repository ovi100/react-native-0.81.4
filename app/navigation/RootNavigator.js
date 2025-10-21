import { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Splash from '../screens/common/Splash';
import ChooseSite from '../screens/choose-site/ChooseSite';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './app-navigator';
import { requestPermissions } from '../../utils';
import { useAppContext } from '../../hooks';
import { BackHandler } from 'react-native';
import { Dialog } from '../../components';


const RootNavigator = () => {
  const Stack = createNativeStackNavigator();
  const { authInfo, deviceInfo } = useAppContext();
  const { isLoading, user } = authInfo;
  const { theme } = deviceInfo;
  const currentTheme = theme === 'dark' ? DarkTheme : DefaultTheme
  const [dialogVisible, setDialogVisible] = useState(false);

  useEffect(() => {
    requestPermissions();
  }, []);

  useEffect(() => {
    const backAction = () => {
      setDialogVisible(true);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);


  if (isLoading) {
    return <Splash />
  }

  return (
    <NavigationContainer theme={currentTheme}>
      <Stack.Navigator>
        {user ? (
          user.active_site ? (
            <Stack.Screen
              name="Dashboard"
              component={AppNavigator}
              options={{ headerShown: false }}
            />
          ) : (
            <Stack.Screen
              name="ChooseSite"
              component={ChooseSite}
              // options={{ headerShown: false }}
              initialParams={{ user }}
            />
          )
        ) : (
          <Stack.Screen
            name="Auth"
            component={AuthNavigator}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
      <Dialog
        isOpen={dialogVisible}
        modalHeader="Exit operations app"
        modalSubHeader="Press 'Cancel' to continue or 'Exit' to close the app."
        onClose={() => setDialogVisible(false)}
        onSubmit={() => BackHandler.exitApp()}
        leftButtonText="cancel"
        rightButtonText="exit"
      />
    </NavigationContainer>
  );
};

export default RootNavigator;
