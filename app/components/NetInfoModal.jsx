import {Text, View} from 'react-native';
import Modal from './Modal';
import NoInternet from './animations/NoInternet';

const NetInfoModal = ({netInfo}) => {
  return (
    <Modal
      isOpen={!netInfo.isConnected || !netInfo.isInternetReachable}
      header="No Internet Connection"
      showCloseButton={false}>
      <View className="modal-content h-auto max-h-[82%]">
        <NoInternet styles="w-24 h-24" />
        <View className="text-content mt-5">
          {!netInfo.isConnected && (
            <Text className="text-sm text-red-400 font-semibold text-center mt-3">
              You don't have any internet connection. Please connect with a
              mobile or wifi network
            </Text>
          )}
          {netInfo.isConnected && !netInfo.isInternetReachable && (
            <Text className="text-sm text-red-400 font-semibold text-center mt-3">
              You're connected with {netInfo.type.toUpperCase()} network. But
              the device is connected with no internet connection
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default NetInfoModal;
