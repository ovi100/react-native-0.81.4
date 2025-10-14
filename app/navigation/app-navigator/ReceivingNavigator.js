import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { width } from '../../../utils';
import Receiving from '../../screens/dashboard/receiving/Receiving';
import { useAppContext } from '../../../hooks';
import { ProfileMenuImage } from '../../../assets/images';
import { Button } from '../../../components';
import { Image } from 'react-native';
import { HeaderBackButton } from '@react-navigation/elements';
import DocumentDetails from '../../screens/dashboard/receiving/DocumentDetails';
import ArticleDetails from '../../screens/dashboard/receiving/ArticleDetails';

const ReceivingNavigator = () => {
  const Stack = createNativeStackNavigator();
  const { authInfo } = useAppContext();
  const { user } = authInfo;

  const screenSettings = {
    headerBackVisible: true,
    headerShadowVisible: false,
    headerTitleAlign: 'center',
    headerTitleStyle: {
      fontSize: width >= 360 ? 18 : 16,
    },
  };

  const leftButton = (route, navigation) => {
    const { screen } = route.params;
    const style = { marginLeft: -5 }
    // console.log('back button params', route.params);
    return (
      <HeaderBackButton
        style={style}
        onPress={() => navigation.replace(screen, route.params)} />
    )
  };

  const rightButton = (route, navigation) => {
    // const params = route.name == "Profile" ? {userId: user.id}: 
    return (
      <Button
        type="icon"
        icon={<Image source={ProfileMenuImage} className="w-7 h-7" />}
        onPress={() =>
          navigation.push('ProfileRoot', { screen: route.name, userId: user.id, data: route.params })
        }
      />
    );
  };

  return (
    <Stack.Navigator
      name="ReceivingRoot"
      screenOptions={({ route, navigation }) => {
        // const visibleButton = route.name !== 'ProfileRoot';
        return {
          headerLeft: () => leftButton(route, navigation),
          headerRight: () => rightButton(route, navigation),
        };
      }}
    >
      <Stack.Screen
        name="Receiving"
        component={Receiving}
        options={screenSettings}
        initialParams={{ screen: "Home" }}
      />
      <Stack.Screen
        name="ChildPacks"
        component={Receiving}
        initialParams={{ screen: "Receiving" }}
      />
      <Stack.Screen
        name="DocumentDetails"
        component={DocumentDetails}
        options={{
          headerTitle: 'Document Details',
          ...screenSettings
        }}
        initialParams={{ screen: "Receiving" }}
      />
      <Stack.Screen
        name="ArticleDetails"
        component={ArticleDetails}
        options={{
          // headerTitle: 'Article Details',
          ...screenSettings
        }}
        initialParams={{ screen: "DocumentDetails" }}
      />
      <Stack.Screen
        name="ArticleReport"
        component={Receiving}
        initialParams={{ screen: "DocumentDetails" }}
      />
    </Stack.Navigator>
  );
};

export default ReceivingNavigator;
