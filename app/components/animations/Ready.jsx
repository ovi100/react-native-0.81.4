import LottieView from 'lottie-react-native';
import animationData from '../../assets/lottie/ready.json';

const Ready = ({ styles }) => {
  return (
    <LottieView
      source={animationData}
      className={`${styles} mx-auto`}
      autoPlay
      loop
    />
  );
};

export default Ready;
