import { HotUpdater, getUpdateSource } from "@hot-updater/react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppProvider from "../contexts/AppContext";
import RootNavigator from './navigation/RootNavigator';
import { ActivityIndicator, Text, View } from "react-native";
import { elevations } from "../utils/common";
import '../global.css';

const App = () => {
  return (
    <AppProvider>
      <GestureHandlerRootView className="flex-1">
        <RootNavigator />
      </GestureHandlerRootView>
    </AppProvider>
  );
};

export default HotUpdater.wrap({
  source: getUpdateSource("https://qxrfwfhsxjbjfsrdbfcr.supabase.co/functions/v1/update-server", {
    updateStrategy: "appVersion", // or "fingerprint"                                               
  }),
  fallbackComponent: ({ progress, status }) => (
    <View className="bg-white border border-gray-200 flex-1 items-center justify-center p-5 rounded-lg" style={elevations[2]}>
      {status === 'Checking for Update' && progress === 0 && (
        <View className="items-center justify-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="text-sm text-black text-center font-medium ml-2">
            Checking for Update
          </Text>
        </View>
      )}

      {status === 'UPDATING' && progress > 0 && (
        <View>
          <Text className="text-sm text-black text-center font-medium">
            Live update is in progress
          </Text>
          <View className="mt-3">
            <Text className="text-sm md:text-lg text-black text-center font-medium">
              Applying the live update ensures you will get the latest version of
              the application.
            </Text>
            <Text className="text-xs md:text-base text-black text-center font-semibold my-2.5">
              Downloading ({progress})%
            </Text>
            <View className="">
              <Text>{Math.round(progress * 100)}</Text>
              {/* <ProgressBar
                size="small"
                variant="success"
                progress={Math.round(progress * 100)}
              /> */}
            </View>
          </View>
        </View>
      )}
    </View>
  ),
})(App);

// export default App;
