import { HeaderBackButton } from '@react-navigation/elements';
import {
  ChevronRight,
  InfoIcon,
  Power,
  Settings,
  ToggleLeft,
  UserCircle,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Image } from 'react-native-svg';
import { API_URL } from '../../../../app-config';
import { SitesImage } from '../../../../assets/images';
import { avatars } from '../../../../assets/images/profile/avatars';
import { Box, Button, Dialog } from '../../../../components';
import { useAppContext } from '../../../../hooks';
import { version } from '../../../../package.json';

const Profile = ({ navigation, route }) => {
  // const { screen, data } = route.params;
  console.log(route);
  const { authInfo } = useAppContext();
  const { user, logout } = authInfo;
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

  if (loading && !updatedUser) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#EB4B50" />
        <Text className="mt-4 text-gray-400 text-base text-center">
          Loading profile. Please wait......
        </Text>
      </View>
    );
  }

  if (error && !updatedUser) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>Failed to load user: {String(error.message || error)}</Text>
      </View>
    );
  }

  const site = updatedUser?.sites.find(
    item => item.code === updatedUser.active_site,
  );
  const userAvatar = updatedUser?.avatar
    ? avatars[updatedUser.avatar]
    : avatars[Math.floor(Math.random() * 19)];

  const boxStyle = {
    backgroundColor: '#fff',
    borderRadius: 0,
  };

  console.log(userAvatar)

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-950 p-3">
      <ScrollView className="w-full">
        <Box
          className="header relative border border-gray-200"
          style={boxStyle}
          elevation={1}
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
            {updatedUser?.name}
          </Text>
          {updatedUser?.staffId && (
            <Text className="text-xs text-center text-gray-400 font-medium capitalize">
              {updatedUser?.staffId}
            </Text>
          )}
        </Box>
        <View className="actions">
          <TouchableOpacity
            className="user-info border border-t-0 border-l-0 border-r-0 border-gray-200 flex-row items-center justify-between rounded p-2.5 mt-2"
            onPress={() => navigation.push('PersonalInfo', { updatedUser })}
          >
            <View className="icon-text flex-row items-center">
              <UserCircle size={25} color="#f43f5e" />
              <Text className="text-base text-gray-400 font-medium capitalize ml-2">
                personal info
              </Text>
            </View>
            <ChevronRight className='w-6 h-6 text-black dark:text-gray-300' />
          </TouchableOpacity>
          <TouchableOpacity
            className="shortcuts border border-t-0 border-l-0 border-r-0 border-gray-200 flex-row items-center justify-between rounded p-2.5"
            onPress={() => navigation.push('Shortcuts', { ...updatedUser })}
          >
            <View className="icon-text flex-row items-center">
              <ToggleLeft size={25} color="#16a34a" />
              <Text className="text-base text-gray-400 font-medium capitalize ml-2">
                shortcuts
              </Text>
            </View>
            <ChevronRight size={25} />
          </TouchableOpacity>
          <TouchableOpacity
            className="settings border border-t-0 border-l-0 border-r-0 border-gray-200 flex-row items-center justify-between rounded p-2.5"
            onPress={() => navigation.push('Settings', { ...updatedUser })}
          >
            <View className="icon-text flex-row items-center">
              <Settings size={25} color="#c026d3" />
              <Text className="text-base text-gray-400 font-medium capitalize ml-2">
                settings
              </Text>
            </View>
            <ChevronRight size={25} />
          </TouchableOpacity>
          <TouchableOpacity
            className="app-info border border-t-0 border-l-0 border-r-0 border-gray-200 flex-row items-center justify-between rounded p-2.5"
            onPress={() => navigation.push('AppInfo')}
          >
            <View className="icon-text flex-row items-center">
              <InfoIcon size={25} color="#2563eb" />
              <Text className="text-base text-gray-400 font-medium capitalize ml-2">
                app info
              </Text>
            </View>
            <ChevronRight size={25} />
          </TouchableOpacity>
          <View className="user-site border border-t-0 border-l-0 border-r-0 border-gray-200 flex-row items-center justify-between rounded p-2.5">
            <View className="icon-text flex-row items-center">
              <Image
                className="w-6 h-6"
                source={site?.imgURL ? { uri: site.imgURL } : SitesImage}
              />
              <Text
                className="w-[210px] text-base text-gray-400 font-medium capitalize ml-2"
                numberOfLines={1}
              >
                {user.site}-{site?.name}
              </Text>
            </View>
            {updatedUser?.sites !== null && updatedUser?.length > 1 ? (
              <TouchableWithoutFeedback
                onPress={() => navigation.push('ChangeSite', { ...user })}
              >
                <Text className="text-center text-blue-600 text-base font-bold capitalize">
                  change
                </Text>
              </TouchableWithoutFeedback>
            ) : (
              <ChevronRight size={25} />
            )}
          </View>
        </View>
      </ScrollView>
      <View className="footer">
        <View className="version-info w-full">
          <Text className="text-gray-400 text-xs xs:text-sm text-center font-bold">
            Operations App-v{version}
          </Text>
        </View>
        <View className="w-2/5 mx-auto mt-2">
          <Button
            text="Logout"
            size="small"
            variant="danger"
            icon={<Power size={22} color="#fff" />}
            onPress={() => setDialogVisible(true)}
          />
        </View>
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
  );
};

export default Profile;
