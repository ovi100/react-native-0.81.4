import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppContext } from '../../../hooks';
import ChooseSite from '../../screens/choose-site/ChooseSite';
import ProfileNavigator from './ProfileNavigator';
import Home from '../../screens/dashboard/Home';
import ReceivingNavigator from './ReceivingNavigator';
import ApprovalNavigator from './ApprovalNavigator';
import PickingNavigator from './PickingNavigator';
import PackingNavigator from './PackingNavigator';
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
  };

  return (
    <Stack.Navigator name="Dashboard">
      <Stack.Screen
        name="Home"
        component={Home}
        options={{
          headerShadowVisible: false,
        }}
        initialParams={{ ...user }}
      />
      <Stack.Screen
        name="ReceivingRoot"
        component={ReceivingNavigator}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="ApprovalRoot"
        component={ApprovalNavigator}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="ProfileRoot"
        component={ProfileNavigator}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="PickingRoot"
        component={PickingNavigator}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="PackingRoot"
        component={PackingNavigator}
        options={{
          headerShown: false
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
