import LottieView from 'lottie-react-native';
import animationData from '../../assets/lottie/server.json';

const ServerError = ({ styles }) => {
  return (
    <LottieView
      source={animationData}
      className={`${styles} mx-auto`}
      autoPlay
      loop
    />
  );
};

export default ServerError;
