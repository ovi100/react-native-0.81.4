import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { menuElevation } from '../utils/common';

const MenuButton = ({item}) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      key={item.name}
      activeOpacity={0.8}
      className="w-1/3 mb-4"
      onPress={() => navigation.replace(item.screen)}>
      <View className="flex-col items-center p-1">
        <View className="icon" style={menuElevation}>
          <Image
            className="w-24 h-24 rounded-xl"
            source={item.icon}
          />
        </View>
        <Text
          className="text text-black dark:text-gray-300 text-sm text-center mt-1"
          numberOfLines={2}>
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default MenuButton;
