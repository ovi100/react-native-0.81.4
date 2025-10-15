import {useState} from 'react';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {Message} from '../utils';

const useImagePicker = () => {
  const [image, setImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const pickPhoto = async () => {
    try {
      setIsProcessing(true);
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.18,
      });

      if (result && result.didCancel) {
        setImage(null);
        return;
      }

      if (result && result.errorCode) {
        Message('customError', result.errorMessage);
        return;
      }

      setImage(result.assets[0]);
    } catch (error) {
      Message('customError', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const rePickPhoto = () => {
    setImage(null);
    pickPhoto();
  };

  const takePhoto = async () => {
    try {
      setIsProcessing(true);
      const result = await launchCamera({mediaType: 'photo', quality: 0.18});

      if (result && result.didCancel) {
        setImage(null);
        return;
      }

      if (result && result.errorCode) {
        Message('customError', result.errorMessage);
        return;
      }

      setImage(result.assets[0]);
    } catch (error) {
      Message('customError', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const removePhoto = () => setImage(null);

  const reTakePhoto = () => {
    setImage(null);
    takePhoto();
  };

  return {
    isProcessing,
    image,
    setImage,
    pickPhoto,
    rePickPhoto,
    takePhoto,
    removePhoto,
    reTakePhoto,
  };
};

export default useImagePicker;
