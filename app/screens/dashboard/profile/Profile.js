import { HeaderBackButton } from '@react-navigation/elements';
import {
  ChevronRight,
  InfoIcon,
  Power,
  Settings,
  ToggleRight,
  UserCircle,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { API_URL } from '../../../../app-config';
import { SitesImage } from '../../../../assets/images';
import { avatars } from '../../../../assets/images/profile/avatars';
import { Box, Dialog } from '../../../../components';
import { useAppContext } from '../../../../hooks';
import { version } from '../../../../package.json';

const Profile = ({ navigation, route }) => {
  // const { screen, data } = route.params;
  console.log(route);
  const { authInfo, deviceInfo } = useAppContext();
  const { user, logout } = authInfo;
  const { theme } = deviceInfo;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatedUser, setUpdatedUser] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  useEffect(() => {
    const fetchUser = async (id, token) => {
      try {
        setLoading(true);
        const response = await fetch(API_URL + 'api/users/profile/' + id, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        const data = result.data;
        if (!data.isActive) {
          logout();
        } else {
          const newUser = {
            ...user,
            staffId: data.staffId,
            designation: data.designation,
            roles: data.roles,
            sites: data.sites,
          };
          setUpdatedUser(newUser);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchUser(user.id, user.token);
    }
  }, [logout, user]);

  const site = updatedUser?.sites.find(
    item => item.code === updatedUser.active_site,
  );
  const avatarIndex = updatedUser?.avatar ?? Math.floor(Math.random() * avatars.length);
  const userAvatar = avatars[avatarIndex];

  const boxStyle = {
    backgroundColor: '#fff',
    borderRadius: 0,
  };

  const iconColor = theme === 'light' ? '#000' : '#d1d5db'

  return (
    <>
      {loading && !updatedUser && (
        <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-950 p-3">
          <ActivityIndicator size="large" color="#EB4B50" />
          <Text className="mt-4 text-gray-400 text-base text-center">
            Loading profile. Please wait......
          </Text>
        </View>
      )}
      {error && !updatedUser && (
        <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-950 p-3">
          <Text>Failed to load user: {String(error.message || error)}</Text>
        </View>
      )}
      {!loading && !error && updatedUser && (
        <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-950 p-3">
          <ScrollView className="w-full">
            <Box
              className="header relative border border-gray-200"
              style={boxStyle}
              elevation={2}
            >
              <View className="back-button w-10 h-10 absolute top-1.5 left-1.5 flex-row items-center justify-center rounded-full">
                <HeaderBackButton
                  onPress={() =>
                    // screen && data
                    //   ? navigation.replace(screen, data)
                    //   : screen
                    //     ? navigation.replace(screen)
                    navigation.goBack()
                  }
                />
              </View>
              <View className="picture relative w-28 h-28 flex-row items-center justify-center border border-gray-100 rounded-full mx-auto mt-1">
                <TouchableOpacity
                  onPress={() => navigation.push('PersonalInfo', { updatedUser })}
                >
                  <Image className="w-24 h-24 rounded-full" source={userAvatar} />
                </TouchableOpacity>
              </View>
              <Text className="text-sm text-center text-gray-500 font-medium capitalize mt-1">
                {updatedUser.name}
              </Text>
              {updatedUser.staffId && (
                <Text className="text-xs text-center text-gray-400 font-medium capitalize">
                  {updatedUser.staffId}
                </Text>
              )}
            </Box>
            <View className="actions">
              <TouchableOpacity
                className="user-info border border-t-0 border-l-0 border-r-0 border-gray-200 flex-row items-center justify-between rounded p-2.5 mt-2"
                onPress={() => navigation.push('PersonalInfo', { updatedUser })}
              >
                <View className="icon-text flex-row items-center">
                  <UserCircle size={24} color="#f43f5e" />
                  <Text className="text-base xs:text-lg text-gray-400 font-medium capitalize ml-2">
                    personal info
                  </Text>
                </View>
                <ChevronRight size={24} color={iconColor} />
              </TouchableOpacity>
              <TouchableOpacity
                className="shortcuts border border-t-0 border-l-0 border-r-0 border-gray-200 flex-row items-center justify-between rounded p-2.5"
                onPress={() => navigation.push('Shortcuts', { ...updatedUser })}
              >
                <View className="icon-text flex-row items-center">
                  <ToggleRight size={24} color="#16a34a" />
                  <Text className="text-base xs:text-lg text-gray-400 font-medium capitalize ml-2">
                    shortcuts
                  </Text>
                </View>
                <ChevronRight size={24} color={iconColor} />
              </TouchableOpacity>
              <TouchableOpacity
                className="settings border border-t-0 border-l-0 border-r-0 border-gray-200 flex-row items-center justify-between rounded p-2.5"
                onPress={() => navigation.push('Settings', { ...updatedUser })}
              >
                <View className="icon-text flex-row items-center">
                  <Settings size={24} color="#c026d3" />
                  <Text className="text-base xs:text-lg text-gray-400 font-medium capitalize ml-2">
                    settings
                  </Text>
                </View>
                <ChevronRight size={24} color={iconColor} />
              </TouchableOpacity>
              <TouchableOpacity
                className="app-info border border-t-0 border-l-0 border-r-0 border-gray-200 flex-row items-center justify-between rounded p-2.5"
                onPress={() => navigation.push('AppInfo')}
              >
                <View className="icon-text flex-row items-center">
                  <InfoIcon size={24} color="#2563eb" />
                  <Text className="text-base xs:text-lg text-gray-400 font-medium capitalize ml-2">
                    app info
                  </Text>
                </View>
                <ChevronRight size={24} color={iconColor} />
              </TouchableOpacity>
              <View className="user-site border border-t-0 border-l-0 border-r-0 border-gray-200 flex-row items-center justify-between rounded p-2.5">
                <View className="icon-text flex-row items-center">
                  <Image
                    className="w-6 h-6"
                    source={site?.imgURL ? { uri: site.imgURL } : SitesImage}
                  />
                  <Text
                    className="w-[210px] text-base xs:text-lg text-gray-400 font-medium capitalize ml-2"
                    numberOfLines={1}
                  >
                    {user.active_site}-{site?.name}
                  </Text>
                </View>
                {updatedUser?.sites !== null && updatedUser?.sites.length > 1 ? (
                  <TouchableOpacity
                    className="w-auto"
                    onPress={() => navigation.replace('ChooseSite', { mode: 'switch', user: updatedUser })}>
                    <Text className="text-xs bg-blue-600 text-white text-center font-medium px-2 py-1 rounded-full capitalize">
                      change
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <ChevronRight size={24} color={iconColor} />
                )}
              </View>
              <TouchableOpacity
                className="logout border border-t-0 border-l-0 border-r-0 border-gray-200 rounded p-2.5"
                onPress={() => setDialogVisible(true)}
              >
                <View className="icon-text flex-row items-center">
                  <Power size={22} color="#ea580c" />
                  <Text className="text-base xs:text-lg text-gray-400 font-medium capitalize ml-2">
                    Logout
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
          <View className="footer">
            <View className="version-info w-full">
              <Text className="text-gray-400 text-sm xs:text-lg text-center font-bold">
                Operations App-v{version}
              </Text>
            </View>
            {/* <View className="w-2/5 mx-auto mt-2">
              <Button
                text="Logout"
                size="small"
                variant="danger"
                icon={<Power size={22} color="#fff" />}
                onPress={() => setDialogVisible(true)}
              />
            </View> */}
          </View>
          <Dialog
            isOpen={dialogVisible}
            modalHeader="Are you sure?"
            modalSubHeader="Some saved data and settings might be lost."
            onClose={() => setDialogVisible(false)}
            onSubmit={() => logout()}
            leftButtonText="cancel"
            rightButtonText="confirm"
          />
        </View>
      )}
    </>
  );
};

export default Profile;
