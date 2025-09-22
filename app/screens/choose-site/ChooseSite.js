import { View, Text, Image, TouchableOpacity, FlatList } from 'react-native';
import { useAppContext } from '../../../hooks';
import { setStorage } from '../../../utils/storage';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { AvatarImage, SitesImage } from '../../../assets/images';
import { Button } from '../../components/ui';
import { width } from '../../../utils';

const ChooseSite = ({ navigation, route }) => {
  const { authInfo } = useAppContext();
  const { setUser, logout } = authInfo;
  const [search, setSearch] = useState('');
  const user = route?.params?.user || null;
  const mode = route?.params?.mode || 'select';
  let sites = useMemo(() => (user?.sites ?? []), [user]);
  const hasActiveSite = Boolean(user && user.active_site);

  useLayoutEffect(() => {
    let screenOptions = screenOptions = {
      headerTitle: !route?.params?.user?.active_site ? 'Choose Site' : 'Change Site',
      headerBackVisible: route?.params?.screen !== 'root',
      headerTitleAlign: 'center',
      headerTitleStyle: {
        fontSize: width >= 360 ? 18 : 14,
      },
      headerSearchBarOptions: {
        placeholder: 'search site code',
        hintTextColor: 'black',
        textColor: '#000',
        autoCapitalize: 'characters',
        headerIconColor: 'black',
        onChangeText: event => setSearch(event.nativeEvent.text),
      },
    };

    navigation.setOptions(screenOptions);
  }, [navigation, route.params]);

  useEffect(() => {
    if (!user) return;
    const hasOneSite = sites?.length === 1;
    if (hasOneSite) {
      handleSelect(sites[0])
    }
  }, [handleSelect, sites, user]);

  const handleSelect = useCallback(async site => {
    if (!user) return;

    const updated = { ...user, active_site: site.code };
    setUser(updated);
    await setStorage('user', updated);

    if (mode === 'switch') {
      navigation.goBack();
    } else {
      navigation.replace('Dashboard');
    }
  }, [mode, navigation, setUser, user]);

  if (hasActiveSite && mode === 'select') {
    navigation.navigate('Dashboard');
  }

  if (search !== '') {
    sites = sites.filter(item =>
      item.code.toLowerCase().includes(search.toLowerCase()),
    );
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      className="site-box w-1/4 mt-4"
      onPress={() => handleSelect(item)}
      key={item.code}>
      <View className="flex-col items-center">
        <View className="icon">
          <Image
            className="w-14 h-14"
            source={item.imgURL ? { uri: item.imgURL } : SitesImage}
          />
        </View>
        <Text className="text text-black mt-3">{item.code}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white px-3">
      <View className="flex-1">
        {user?.sites.length === 0 && (
          <View className="h-full items-center justify-center px-3">
            <View className="photo">
              <Image
                className="w-28 xs:w-36 h-28 xs:h-36 rounded-full"
                source={AvatarImage}
              />
            </View>
            <View className="mt-3">
              <Text className="text-blue-600 text-lg xs:text-2xl font-semibold capitalize">
                hello, {user?.name}
              </Text>
            </View>
            <View className="w-4/5 mt-3">
              <Text className="text-center text-gray-400 text-base xs:text-lg font-semibold mb-2">
                User Id: {user?.staffId ? user.staffId : user?.email}
              </Text>
              <Text className="text-center text-gray-400 text-base xs:text-lg">
                You don't have any active site. Please contact with admin
              </Text>
            </View>
            <View className="mt-5">
              <Button text='Logout' variant='danger' onPress={logout} />
            </View>
          </View>
        )}
        {sites?.length > 1 && (
          <FlatList
            data={sites}
            renderItem={renderItem}
            keyExtractor={item => item.code}
            initialNumToRender={24}
            horizontal={false}
            numColumns={4}
            key={`flatList-${4}`}
            // onEndReached={handleEndReached}
            // ListFooterComponent={sites.length > 24 ? renderFooter : null}
            ListFooterComponentStyle={{ paddingVertical: 10 }}
          />
        )}
      </View>
    </View>
  )
}

export default ChooseSite;