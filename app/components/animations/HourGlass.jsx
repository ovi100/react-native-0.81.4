import LottieView from 'lottie-react-native';
import animationData from '../../../assets/lottie/hour-glass.json';

const HourGlass = ({ styles }) => {
  return (
    <LottieView
      source={animationData}
      className={`${styles} mx-auto`}
      autoPlay
      loop
    />
  );
};

export default HourGlass;
