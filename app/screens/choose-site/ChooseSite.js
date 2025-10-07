import { View, Text, Image, TouchableOpacity, FlatList } from 'react-native';
import { useAppContext } from '../../../hooks';
import { setStorage } from '../../../utils/storage';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { AvatarImage, SitesImage } from '../../../assets/images';
import { width } from '../../../utils';
import { Frown, LogOutIcon } from 'lucide-react-native';
import { Button } from '../../../components';

const ChooseSite = ({ navigation, route }) => {
  const { authInfo } = useAppContext();
  const { setUser, logout } = authInfo;
  const [search, setSearch] = useState('');
  const user = route?.params?.user || null;
  const mode = route?.params?.mode || 'select';
  let sites = useMemo(() => (user?.sites ?? []), [user]);
  const hasActiveSite = Boolean(user && user.active_site);


  useLayoutEffect(() => {
    let screenOptions = {};
    if (user.sites.length > 0) {
      screenOptions = {
        headerTitle: hasActiveSite ? 'Change Site' : 'Choose Site',
        headerBackVisible: mode !== 'select',
        headerShadowVisible: false,
        headerTitleAlign: mode !== 'select' ? 'center' : 'left',
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
    } else {
      screenOptions = {
        headerShown: false
      }
    }

    navigation.setOptions(screenOptions);
  }, [hasActiveSite, mode, navigation, user.sites.length]);

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
  };

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

  const listStyle = { paddingVertical: 10 };

  return (
    <View className="flex-1 bg-white dark:bg-neutral-950 px-3">
      <View className="flex-1">
        {user?.sites.length === 0 && (
          <View className="h-full items-center justify-center">
            <View className="photo">
              <Image
                className="w-28 xs:w-36 h-28 xs:h-36 rounded-full"
                source={AvatarImage}
              />
            </View>
            <View className="mt-3">
              <Text className="text-blue-600 text-xl font-semibold capitalize">
                hello, {user?.name}
              </Text>
            </View>
            <View className="w-4/5 mt-3">
              <Text className="text-center text-gray-400 text-base font-semibold mb-2">
                {
                  user?.staffId ? `User Id: ${user.staffId}` :
                    user?.email ? `Email: ${user.email}`
                      : `Phone: ${user.phoneNumber}`
                }
              </Text>
              <Text className="text-center text-gray-400 text-lg">
                You don't have any site access. Please contact with admin
              </Text>
            </View>
            <View className="mt-5">
              <Button
                text='Logout'
                size='small'
                variant='danger'
                icon={<LogOutIcon size={20} color="#fff" />}
                onPress={logout}
              />
            </View>
          </View>
        )}
        {user?.sites.length > 0 && sites?.length === 0 && (
          <View className="h-full items-center justify-center">
            <View className="mt-3">
              <Text className="text-center">
                <Frown size={60} color="#ccc" />
              </Text>
              <Text className="text-center text-gray-400 text-lg font-semibold mt-2">
                search for "{search}" not match any site!
              </Text>
              <Text className="text-center text-gray-400 text-lg font-semibold mt-2">
                please search something else.
              </Text>
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
            ListFooterComponentStyle={listStyle}
          />
        )}
      </View>
    </View>
  )
}

export default ChooseSite;