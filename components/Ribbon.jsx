import { Text, View } from 'react-native';

const Ribbon = ({ label }) => {
  return (
    <View
      className={`absolute rotate-[38deg] ${label === 'Loose' ? 'bg-blue-600' : 'bg-red-500'
        } text-center text-white font-semibold py-0.5 -right-[98px] xs:-right-[22px] -top-1 xs:top-[3px] w-[72px]`}>
      <Text className="text-[6px] xs:text-[8px] text-white text-center font-bold pl-1 uppercase">
        {label === 'Loose' ? label : label}
      </Text>
    </View>
  );
};

export default Ribbon;
