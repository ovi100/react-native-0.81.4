import LottieView from 'lottie-react-native';
import animationData from '../../../assets/lottie/loading.json';

const Loading = ({ styles }) => {
  return (
    <LottieView
      className={`${styles} mx-auto`}
      source={animationData}
      autoPlay
      loop
    />
  );
};

export default Loading;
