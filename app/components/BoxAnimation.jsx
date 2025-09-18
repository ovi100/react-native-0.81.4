import { useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const BoxAnimation = ({ leftBoxText = '', rightBoxText = '', number }) => {
  const translateX = useSharedValue(0);
  const { width } = Dimensions.get('window');

  useEffect(() => {
    translateX.value = withRepeat(
      withSequence(
        withTiming(width - 130, { duration: 2500, easing: Easing.linear }),
        withTiming(20, { duration: 0 }),
      ),
      -1,
      false,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));


  return (
    <View>
      <View className="w-full flex-row items-center justify-between">
        {/* Box 1 */}
        <View className="w-1/5 h-12 bg-red-200 rounded-md items-center justify-center">
          <Text className="text-sm text-red-700 font-semibold">
            {leftBoxText}
          </Text>
        </View>

        <View className={`w-3/5 -z-20 border border-black border-dashed`} />

        {/* Animated Number */}
        <Animated.View
          className="w-auto h-auto border border-gray-300 rounded bg-white absolute -z-10 items-center justify-center"
          style={animatedStyle}>
          <Text className="text-green-500 text-sm font-bold px-2 py-1">
            {number}
          </Text>
        </Animated.View>

        {/* Box 2 */}
        <View className="w-1/5 h-12 bg-green-200 text-white rounded-md items-center justify-center">
          <Text className="text-sm text-green-700 font-semibold">
            {rightBoxText}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default BoxAnimation;
