import LottieView from 'lottie-react-native';
import animationData from '../../../assets/lottie/empty-box.json';

const EmptyBox = ({ styles }) => {
  return (
    <LottieView
      className={`${styles} mx-auto`}
      source={animationData}
      autoPlay
      loop
    />
  );
};

export default EmptyBox;
