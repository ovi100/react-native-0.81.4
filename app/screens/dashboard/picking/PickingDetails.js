import { View, Text, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native'
import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { useAppContext, useBackHandler } from '../../../../hooks';
import { API_URL } from '../../../../app-config';
import { FlatListStyle, shortBinNumber, toast } from '../../../../utils';
import { EmptyBox } from '../../../../components/animations';
import { FalseHeader } from '../../../../components';
import { getStorage } from '../../../../utils/storage';

const PickingDetails = ({ navigation, route }) => {
  const { screen, dn, site } = route.params;
  const { authInfo } = useAppContext();
  const { user } = authInfo;
  const [isLoading, setIsLoading] = useState(false);
  const [articles, setArticles] = useState([]);
  const [pressMode, setPressMode] = useState(false);
  const tableHeader = ['Bin', 'Article Info', 'Quantity'];

  // Custom hook to navigate screen
  useBackHandler(screen);

  const customHeader = useMemo(() => (
    <View className="text px-1 xs:px-2">
      <Text className="text-sh text-base xs:text-lg text-center font-medium">
        {`Picking Details\nDN ${dn}`}
      </Text>
    </View>
  ), [dn]);

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

  const fetchPickingData = useCallback(async () => {
    try {
      setIsLoading(true);
      await fetch(API_URL + `api/sto/picking-packing-items?documentNumber=${dn}&site=${site}&type=picking`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          }
        })
        .then(response => response.json())
        .then(result => {
          if (result.success) {
            setArticles(result.data.items);
          } else {
            let message = result.message.trim();
            message = message.includes('Could not open connection')
              ? 'SAP server is off 🙁'
              : message;
            toast(message);
          }
        })
        .catch(error => {
          const message = error.message.includes('JSON Parse error')
            ? 'Server is down'
            : error.message;
          toast(message);
        });
    } catch (error) {
      toast(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [dn, site, user.token]);

  useFocusEffect(useCallback(() => {
    fetchPickingData();
  }, [fetchPickingData]));

  const renderTableHeader = item => (
    <Text
      className="w-1/3 text-white text-sm xs:text-base text-center font-bold"
      key={item}>
      {item}
    </Text>
  );

  const renderItem = ({ item, index }) => {
    const Wrapper = pressMode ? TouchableOpacity : View;
    const params = { ...item, dn, site, token: user.token }
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
    <>
      {isLoading && (
        <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-950">
          <ActivityIndicator size="large" color="#EB4B50" />
          <Text className="mt-4 text-gray-400 text-base text-center">
            Loading dn data. Please wait......
          </Text>
        </View>
      )}
      {!isLoading && !articles.length && (
        <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-950">
          <EmptyBox styles="w-28 h-28" />
          <Text className="mt-4 text-gray-400 text-base text-center">
            No article is found!
          </Text>
        </View>
      )}
      {!isLoading && articles.length > 0 && (
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
                // refreshControl={
                //   <RefreshControl
                //     colors={['#fff']}
                //     onRefresh={onRefresh}
                //     progressBackgroundColor="#000"
                //     refreshing={refreshing}
                //   />
                // }
                />
              </View>
              {/* <CameraScan /> */}
            </View>
          </View>
        </View>
      )}
    </>
  )
}

export default PickingDetails