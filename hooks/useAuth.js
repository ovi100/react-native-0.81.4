import { API_URL, APP_STAGE } from '../app-config';
import { useEffect, useState } from 'react';
import { version } from '../package.json';
// import useActivity from './useActivity';
import { getStorage, multiRemove, setStorage } from '../utils/storage';
import { toast } from '../utils';

const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isLoadingAppInfo, setIsLoadingAppInfo] = useState(false);
  const [appInfo, setAppInfo] = useState(null);
  // const { createActivity } = useActivity();

  useEffect(() => {
    console.log('App Running on', APP_STAGE);
    isLoggedIn();
  }, []);

  const login = async (userId, password) => {
    try {
      setIsLoading(true);
      const URL = API_URL + 'api/auth/login';
      const loginData = {
        phoneNumber: /^L/.test(userId) ? userId : userId.toLowerCase(),
        password,
      };

      await fetch(URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      })
        .then(response => response.json())
        .then(async result => {
          if (result.success) {
            const random = Math.floor(Math.random() * 19);
            const updatedUser = {
              ...result.data.user,
              active_site: '',
              avatar: random,
              sites: result.data.sites,
              token: result.data.token,
            };
            // console.log('updated user', updatedUser);
            setUser(updatedUser);
            await setStorage('user', updatedUser);
            await setStorage('loginInfo', loginData);
            // activity
            // await createActivity(
            //   result.user._id,
            //   'login',
            //   `${
            //     result.user.name
            //   } logged in with version ${version.toUpperCase()}`,
            // );
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
    } catch (error) {
      toast(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    multiRemove([
      'user',
      'pressMode',
      'signMode',
      'vendorDetails',
    ]);
    setIsLoading(false);
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      let storedUser = await getStorage('user');
      setUser(storedUser);

      if (storedUser) {
        setUser(storedUser);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        setUser(null);
      }
    } catch (error) {
      // Message('customError', error.message);
      toast(error.message);
      setIsLoading(false);
    }
  };

  const authInfo = {
    login,
    logout,
    isLoading,
    user,
    setUser,
    version,
    isLoadingAppInfo,
    setIsLoadingAppInfo,
    appInfo,
    setAppInfo,
  };

  return authInfo;
};

export default useAuth;
