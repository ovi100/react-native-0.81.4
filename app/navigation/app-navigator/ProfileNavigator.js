import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Profile from '../../screens/dashboard/profile/Profile';
import PersonalInfo from '../../screens/dashboard/profile/PersonalInfo';
import Shortcuts from '../../screens/dashboard/profile/Shortcuts';
import Settings from '../../screens/dashboard/profile/Settings';
import AppInfo from '../../screens/dashboard/profile/AppInfo';
import ChooseSite from '../../screens/choose-site/ChooseSite';

const ProfileNavigator = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator name="ProfileRoot">
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PersonalInfo"
        component={PersonalInfo}
      />
      <Stack.Screen
        name="Shortcuts"
        component={Shortcuts}
      />
      <Stack.Screen
        name="Settings"
        component={Settings}
      />
      <Stack.Screen
        name="AppInfo"
        component={AppInfo}
      />
      <Stack.Screen
        name="ChooseSite"
        component={ChooseSite}
      />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;
