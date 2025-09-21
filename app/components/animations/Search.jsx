import LottieView from 'lottie-react-native';
import animationData from '../../../assets/lottie/search.json';

const Search = ({ styles }) => {
  return (
    <LottieView
      source={animationData}
      className={`${styles} mx-auto`}
      autoPlay
      loop
    />
  );
};

export default Search;
