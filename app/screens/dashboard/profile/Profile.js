import React from 'react';
import { View, Text } from 'react-native';
import { useAppContext } from '../../../../hooks';
import { Button } from '../../../../components';

const Profile = ({ navigation }) => {
  const { authInfo } = useAppContext();
  const { user, logout } = authInfo;
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="w-full text-2xl font-bold text-blue-500 text-center capitalize">
        Hello, {user.name}
      </Text>
      <View className="flex-row items-center gap-x-2 mt-5">
        <Button text='Go Back' size='small' variant='danger' edge='capsule' onPress={() => navigation.goBack()} />
        <Button text='Logout Now' size='small' variant='danger' edge='capsule' onPress={logout} />
        <Button
          text='Change Site'
          size='small'
          variant='danger'
          edge='capsule'
          onPress={() => navigation.navigate('ChooseSite', { mode: 'switch', user })}
        />
      </View>
    </View>
  )
}

export default Profile