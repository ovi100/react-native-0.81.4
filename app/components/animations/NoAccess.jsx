import LottieView from 'lottie-react-native';
import animationData from '../../../assets/lottie/no-access.json';

const NoAccess = ({ styles }) => {
  return (
    <LottieView
      className={`${styles} mx-auto`}
      source={animationData}
      autoPlay
      loop
    />
  );
};

export default NoAccess;
