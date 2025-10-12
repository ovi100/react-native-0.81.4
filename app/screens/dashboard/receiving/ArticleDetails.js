import React from 'react';
import { View, Text } from 'react-native';

const ArticleDetails = ({ navigation, route }) => {
  console.log(route.params);
  return (
    <View>
      <Text>ArticleDetails</Text>
    </View>
  )
}

export default ArticleDetails;