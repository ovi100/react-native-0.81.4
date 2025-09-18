import LottieView from 'lottie-react-native';
import animationData from '../../assets/lottie/scan.json';

const Scan = ({ styles }) => {
  return (
    <LottieView
      source={animationData}
      className={`${styles} mx-auto`}
      autoPlay
      loop
    />
  );
};

export default Scan;
