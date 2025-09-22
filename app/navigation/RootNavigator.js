import { useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Splash from '../screens/common/Splash';
import ChooseSite from '../screens/choose-site/ChooseSite';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './app-navigator';
import { requestPermissions } from '../../utils';
import { useAppContext } from '../../hooks';


const RootNavigator = () => {
  const Stack = createNativeStackNavigator();
  const { authInfo, deviceInfo } = useAppContext();
  const { isLoading, user } = authInfo;
  const { theme } = deviceInfo;
  const currentTheme = theme === 'dark' ? DarkTheme : DefaultTheme

  useEffect(() => {
    requestPermissions();
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
    </NavigationContainer>
  );
};

export default RootNavigator;
