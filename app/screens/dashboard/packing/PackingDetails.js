import { View, Text, ActivityIndicator, FlatList, TextInput } from 'react-native'
import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { useAppContext, useBackHandler } from '../../../../hooks';
import { API_URL } from '../../../../app-config';
import { FlatListStyle, shortBinNumber, toast } from '../../../../utils';
import { EmptyBox } from '../../../../components/animations';
import { Button, FalseHeader, Input } from '../../../../components';
import { getStorage } from '../../../../utils/storage';
import { Search } from 'lucide-react-native';

const PackingDetails = ({ navigation, route }) => {
  const { screen, dnNumber, site, token } = route.params;
  const { authInfo } = useAppContext();
  const { user } = authInfo;
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [articles, setArticles] = useState([]);
  const [pressMode, setPressMode] = useState(false);
  const tableHeader = ['Article Info', 'Picked Qty', 'Packed Qty'];

  // Custom hook to navigate screen
  useBackHandler(screen);

  const customHeader = useMemo(() => (
    <View className="text px-1 xs:px-2">
      <Text className="text-sh text-base xs:text-lg text-center font-medium">
        Packing {dnNumber} Details
      </Text>
    </View>
  ), [dnNumber]);

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

  const fetchPackingData = useCallback(async () => {
    try {
      setIsLoading(true);
      await fetch(API_URL + `api/sto/picking-packing-items?documentNumber=${dnNumber}&site=${site}&type=packing`,
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
            const newList = result.data.items.map((item, index) => {
              return {
                ...item,
                id: index + 1,
                inputQuantity: 0,
                selected: false,
              }
            });
            setArticles(newList);
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
  }, [dnNumber, site, user.token]);

  useFocusEffect(
    useCallback(() => {
      fetchPackingData();
    }, [fetchPackingData])
  );

  const renderTableHeader = item => (
    <Text
      className="w-1/3 text-white text-sm xs:text-base text-center font-bold"
      key={item}>
      {item}
    </Text>
  );

  const handleInputChange = (item, quantity) => {
    if (+quantity > item.quantity) {
      toast('Quantity exceed');
      return;
    }

    setArticles(preValues =>
      preValues.map(article =>
        article.id === item.id
          ? {
            ...article,
            inputQuantity: +quantity,
          }
          : article,
      ),
    );
  };

  const renderItem = ({ item, index }) => (
    <View
      key={index}
      className="flex-row items-center border border-tb rounded-lg mt-2.5 p-2.5">
      <Text
        className="w-1/3 text-black text-sm xs:text-base text-center"
        numberOfLines={2}>
        {item.material + '\n' + shortBinNumber(item.binCode)}
      </Text>
      <Text
        className="w-1/3 text-blue-600 text-sm xs:text-base text-center"
        numberOfLines={1}>
        {item.quantity}
      </Text>
      <View className="w-1/3">
        <TextInput
          className={`w-20 h-10 text-black text-xs border ${item.selected ? 'border-gray-400'
            : 'border-gray-200'} text-center rounded-sm px-2 focus:border-blue-500 mx-auto`}
          keyboardType="phone-pad"
          autoFocus={pressMode || item.selected}
          value={item.inputQuantity > 0 ? item.inputQuantity.toString() : ''}
          onChangeText={value => handleInputChange(item, value)}
        />
      </View>
    </View>
  );

  const filteredData = articles.filter((item) => {
    const matchesSearch =
      item.material.includes(search.toLowerCase()) ||
      shortBinNumber(item.binCode).toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const selectedItems = articles.filter(item => item.inputQuantity > 0).map(item => {
    return {
      material: item.material,
      dnNumber,
      binCode: item.binCode,
      quantity: item.inputQuantity,
    }
  });


  const packItem = async () => {
    try {
      setIsButtonLoading(true);

      await fetch(API_URL + 'api/sto/pack-items', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedItems)
      })
        .then(response => response.json())
        .then(result => {
          console.log(result);
          if (result.success) {
            fetchPackingData();
          } else {
            toast(result.message);
          }
        })
        .catch(({ message }) => {
          const msg = message.includes('JSON Parse error')
            ? 'Server is down'
            : message;
          toast(msg);
        });
    } catch (e) {
      toast(e);
    } finally {
      setIsButtonLoading(false);
    }
  };

  // console.log(selectedItems);

  // const tabs = [
  //   { label: 'Tab 1', content: <View><Text>Content 1</Text></View> },
  //   { label: 'Tab 2', content: <View><Text>Content 2</Text></View> }
  // ]

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
          <View className="flex-1 px-2 sm:px-4">
            <FalseHeader />
            <View className="content flex-1 justify-between pb-2">
              {/* Search Box */}
              <View className="search">
                <Input
                  icon={<Search size={24} color="#64748b" />}
                  iconPosition="right"
                  placeholder="Search by bin or material number"
                  onChangeText={value => setSearch(value)}
                  value={search}
                />
              </View>
              <View className={`table h-[80%]`}>
                <View className="table-header flex-row bg-th text-center p-2">
                  {tableHeader.map(th => renderTableHeader(th))}
                </View>
                <FlatList
                  data={filteredData}
                  renderItem={renderItem}
                  keyExtractor={(_, i) => i.toString()}
                  initialNumToRender={10}
                  ListFooterComponentStyle={FlatListStyle}
                />
              </View>
              <View className="button mt-3">
                <Button
                  text={
                    isButtonLoading ? 'Picking article' : 'Mark as Picked'
                  }
                  size='medium'
                  variant="brand"
                  loading={isButtonLoading}
                  disabled={selectedItems.length === 0}
                  onPress={() => packItem()}
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

export default PackingDetails;