import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { SafeAreaView } from 'react-native-safe-area-context';
import AppProvider from "../contexts/AppContext";
import RootNavigator from './navigation/RootNavigator';
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

export default App;
