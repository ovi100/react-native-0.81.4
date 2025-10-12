import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { HotUpdater, getUpdateSource } from "@hot-updater/react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import NetInfo from '@react-native-community/netinfo';
import AppProvider from "../contexts/AppContext";
import RootNavigator from './navigation/RootNavigator';
import { Modal, NetInfoModal, ProgressBar } from "../components";
import "../nativewind-interop";
import '../global.css';

const App = () => {
  const [netInfo, setNetInfo] = useState(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => setNetInfo(state));
    return () => unsubscribe();
  }, []);

  return (
    <AppProvider>
      <GestureHandlerRootView className="flex-1">
        <RootNavigator />
      </GestureHandlerRootView>
      {netInfo && <NetInfoModal netInfo={netInfo} />}
    </AppProvider>
  );
};

export default HotUpdater.wrap({
  source: getUpdateSource("https://qxrfwfhsxjbjfsrdbfcr.supabase.co/functions/v1/update-server", {
    updateStrategy: "appVersion",
    shouldForceUpdate: true,
    reloadOnForceUpdate: true,
  }),
  fallbackComponent: ({ progress }) => {
    const downloadProgress = Math.round(progress * 100);

    return (
      <Modal
        isOpen={progress > 0}
        showCloseButton={false}
        header="Live update is in progress">
        <View className="modal-content">
          <Text className="text-sm xs:text-lg text-black text-center font-medium">
            Applying the live update ensures you will get the latest version of
            the application.
          </Text>
          <Text className="text-xs xs:text-base text-black text-center font-semibold my-2.5">
            Downloading ({downloadProgress})%
          </Text>
          <View className="">
            <ProgressBar size="small" variant="success" progress={downloadProgress} />
          </View>
        </View>
      </Modal>
    )
  }
})(App);

