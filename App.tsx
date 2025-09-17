import { APP_STAGE } from './app-config';
import { View, Text } from 'react-native';
import { dependencies } from './package.json';
import './global.css';

const App = () => {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-blue-500 text-center">
        Welcome to React Native {'\n' + dependencies['react-native']}
      </Text>
      <Text className="text-lg text-black text-center mt-2">
        Tailwind CSS is ready for the project
      </Text>
      <Text className="text-sm text-gray-600 mt-2">App Stage: {APP_STAGE}</Text>
    </View>
  );
};

export default App;
