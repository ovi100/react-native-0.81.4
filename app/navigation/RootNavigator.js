import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Splash from '../screens/common/Splash';
import ChooseSite from '../screens/choose-site/ChooseSite';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { requestPermissions } from '../../utils';
import { useAppContext } from '../../hooks';


const RootNavigator = () => {
  const Stack = createNativeStackNavigator();
  const { authInfo } = useAppContext();
  const { isLoading, user } = authInfo;
  const noActiveSite = Boolean(user && !user.active_site);
  const hasActiveSite = Boolean(user && user.active_site);

  useEffect(() => {
    requestPermissions();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
      // initialRouteName="Auth"

      >
        {isLoading ? (
          <Stack.Screen
            name="Splash"
            component={Splash}
            options={{
              headerShown: false,
            }}
          />
        ) : (!isLoading && noActiveSite) ? (
          <Stack.Screen
            name="ChooseSite"
            component={ChooseSite}
            initialParams={{
              screen: 'root',
              user
            }}
          />
        ) : (!isLoading && hasActiveSite) ? (
          <Stack.Screen
            name="App"
            component={AppNavigator}
            options={{
              headerShown: false,
            }}
          />
        ) : (
          <Stack.Screen
            name="Auth"
            component={AuthNavigator}
            options={{
              headerShown: false,
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
