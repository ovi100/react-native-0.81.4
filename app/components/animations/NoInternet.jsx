import LottieView from 'lottie-react-native';
import animationData from '../../../assets/lottie/wifi.json';

const NoInternet = ({ styles }) => {
  return (
    <LottieView
      source={animationData}
      className={`${styles} mx-auto`}
      autoPlay
      loop
    />
  );
};

export default NoInternet;
