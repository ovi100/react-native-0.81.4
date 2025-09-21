import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAppContext } from '../../../hooks';

const Splash = ({ navigation }) => {
  const { authInfo } = useAppContext();
  const { isLoading, user } = authInfo;

  // useEffect(() => {
  //   console.log(isLoading, user);
  //   const noActiveSite = user && !user.active_site;
  //   const hasActiveSite = user && user.active_site;
  //   console.log(noActiveSite, hasActiveSite);
  //   if (!isLoading && hasActiveSite) {
  //     navigation.replace('App');
  //   } else if (!isLoading && noActiveSite) {
  //     navigation.replace('ChooseSite');
  //   } else {
  //     navigation.replace('Auth');
  //   }
  // }, [navigation, user, isLoading]);

  return (
    <View className="bg-slate-200 flex-1 items-center justify-center px-3">
      <ActivityIndicator size="large" color="#EB4B50" />
    </View>
  )
}

export default Splash;