import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../screens/auth/Login';
import Register from '../screens/auth/Register';
import Home from '../screens/dashboard/Home';


const RootNavigator = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Register"
        component={Register}
        options={{
          title: 'Registration',
          headerTitleAlign: 'center',
          headerShadowVisible: false,
        }}
      />

      <Stack.Screen
        name="Home"
        component={Home}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
