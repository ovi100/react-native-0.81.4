import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../screens/dashboard/Home';
import ChooseSite from '../screens/choose-site/ChooseSite';

const AppNavigator = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator name="App">
      <Stack.Screen
        name="ChooseSite"
        component={ChooseSite}
      />
      <Stack.Screen
        name="Home"
        component={Home}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
