import { View, Text } from 'react-native';
import { Button } from '../../components/ui';
import { useAppContext } from '../../../hooks';

const Home = ({ navigation }) => {
  const { authInfo } = useAppContext();
  const { user, logout } = authInfo;
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="w-full text-2xl font-bold text-blue-500 text-center capitalize">
        Welcome, {user.name}
      </Text>
      <Text className="text-lg text-black text-center my-2">
        Active Site : {user.active_site}
      </Text>
      <View className="flex-row items-center gap-x-2 mt-5">
        <Button text='Logout Now' size='small' variant='danger' edge='capsule' onPress={logout} />
        <Button
          text='Change Site'
          size='small'
          variant='danger'
          edge='capsule'
          onPress={() => navigation.navigate('ChooseSite', { screen: 'Home', user })}
        />
      </View>
    </View>
  );
};

export default Home;
