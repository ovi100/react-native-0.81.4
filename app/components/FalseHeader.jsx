import { Text, TouchableHighlight } from 'react-native';

const FalseHeader = () => {
  return (
    <TouchableHighlight className="false-header absolute -top-10" onPress={() => null}>
      <Text className="text-xs text-white text-center capitalize">
        false header
      </Text>
    </TouchableHighlight>
  );
};

export default FalseHeader;
