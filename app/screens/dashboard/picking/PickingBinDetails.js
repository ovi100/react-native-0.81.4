import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useBackHandler } from '../../../../hooks';
import { useFocusEffect } from '@react-navigation/native';
import { getStorage } from '../../../../utils/storage';
import { FlatListStyle, shortBinNumber } from '../../../../utils';
import { FalseHeader } from '../../../../components';

const PickingBinDetails = ({ navigation, route }) => {
  const { screen, items, dnNumber, binCode, site, token } = route.params;
  const articles = items || [];
  const [pressMode, setPressMode] = useState(false);
  const tableHeader = ['Bin', 'Article Info', 'Quantity'];

  // Custom hook to navigate screen
  useBackHandler(screen);

  const customHeader = useMemo(() => (
    <View className="text px-1 xs:px-2">
      <Text className="text-sh text-base xs:text-lg text-center font-medium">
        Bin {binCode} Articles
      </Text>
    </View>
  ), [binCode]);

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: () => customHeader });
  }, [customHeader, navigation]);

  useFocusEffect(
    useCallback(() => {
      const getAsyncStorage = async () => {
        const press = await getStorage('pressMode');
        setPressMode(press);

      };
      getAsyncStorage();
    }, [])
  );

  const renderTableHeader = item => (
    <Text
      className="w-1/3 text-white text-sm xs:text-base text-center font-bold"
      key={item}>
      {item}
    </Text>
  );

  const renderItem = ({ item, index }) => {
    const Wrapper = pressMode ? TouchableOpacity : View;
    const params = { ...item, dnNumber, site, token }
    return (
      <Wrapper
        key={index}
        onPress={() =>
          navigation.replace('PickingArticleDetails', params)
        }
        className="flex-row items-center border border-tb rounded-lg mt-2.5 px-3 py-4">
        <Text
          className="w-1/3 text-black text-sm xs:text-base text-center"
          numberOfLines={1}>
          {shortBinNumber(item.binCode)}
        </Text>
        <Text
          className="w-1/3 text-black text-sm xs:text-base text-center"
          numberOfLines={1}>
          {item.material}
        </Text>
        <Text
          className="w-1/3 text-blue-600 text-sm xs:text-base text-center"
          numberOfLines={1}>
          {item.quantity}
        </Text>
      </Wrapper>
    );
  };

  return (
    <View className="flex-1 bg-white dark:bg-neutral-950">
      <View className="flex-1 h-full px-2 sm:px-4">
        <FalseHeader />
        <View className="content flex-1 justify-between pb-2">
          <View className={`table h-full`}>
            <View className="table-header flex-row bg-th text-center p-2">
              {tableHeader.map(th => renderTableHeader(th))}
            </View>
            <FlatList
              data={articles}
              renderItem={renderItem}
              keyExtractor={(_, i) => i.toString()}
              initialNumToRender={10}
              ListFooterComponentStyle={FlatListStyle}
            />
          </View>
          {/* <CameraScan /> */}
        </View>
      </View>
    </View>
  )
}

export default PickingBinDetails;