import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image } from 'react-native';
import { ProfileMenuImage } from '../../../assets/images';
import { Button } from '../../../components';
import { useAppContext } from '../../../hooks';
import ChooseSite from '../../screens/choose-site/ChooseSite';
import Home from '../../screens/dashboard/Home';
import ProfileNavigator from './ProfileNavigator';
const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { authInfo } = useAppContext();
  const { user } = authInfo;
  const noActiveSite = Boolean(user && !user?.active_site);

  if (noActiveSite) {
    return (
      <Stack.Navigator name="Dashboard">
        <Stack.Screen name="ChooseSite" component={ChooseSite} />
      </Stack.Navigator>
    );
  }

  const headerButton = (route, navigation) => {
    return (
      <Button
        type="icon"
        icon={<Image source={ProfileMenuImage} className="w-7 h-7" />}
        onPress={() =>
          navigation.navigate('ProfileRoot', { screen: route.name, data: null })
        }
      />
    );
  };

  return (
    <Stack.Navigator
      name="Dashboard"
      screenOptions={({ route, navigation }) => {
        const visibleButton = route.name !== 'ProfileRoot';
        return {
          headerRight: () =>
            visibleButton ? headerButton(route, navigation) : null,
        };
      }}
    >
      <Stack.Screen
        name="Home"
        component={Home}
        options={{
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="ProfileRoot"
        component={ProfileNavigator}
        options={{
          headerShown: false,
          headerRight: () => null,
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
