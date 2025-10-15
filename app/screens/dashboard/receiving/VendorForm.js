import React, {useRef, useState} from 'react';
import {View, Text, ScrollView, Image, TouchableOpacity} from 'react-native';
import SignatureCapture from 'react-native-signature-capture';
import {Button, Modal} from '../../../../../components';
import {Camera, CloseCircle, Reload, Save, Trash} from '../../../../../icons';
import {colors} from '../../../../../utils/common';
import {useImagePicker} from '../../../../../hooks';
import {setStorage} from '../../../../../utils/asyncStorage';
import {API_URL} from '@env';
import {uploadFile} from '../../../../../utils/apiServices';
import {width} from '../../../../../utils';

const VendorForm = ({
  bottomModalVisible,
  setBottomModalVisible,
  user,
  vendorId,
  setVendorDetails,
}) => {
  const signRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDraw, setIsDraw] = useState(false);
  const [vendorSign, setVendorSign] = useState(null);
  const {takePhoto, reTakePhoto, removePhoto, image, setImage} =
    useImagePicker();

  const saveSign = () => signRef.current?.saveImage();

  const resetSign = () => {
    signRef.current?.resetImage();
    removePhoto();
    setVendorSign(null);
    setIsDraw(false);
  };

  const onSave = result => setVendorSign(result.encoded);

  const onDrag = () => setIsDraw(true);

  const saveAndCapturePhoto = async () => {
    await saveSign();
    await takePhoto();
  };

  const uploadImage = async (file, path) => {
    const URL = API_URL + 'api/service/image/upload';
    let url = '';
    await uploadFile({
      uploadUrl: URL,
      file: file,
      path: path,
      onProgress: setIsUploading,
      onSuccess: result => {
        if (result.status) {
          url = result.url;
        } else {
          toast(result.message);
        }
      },
      onError: error => {
        toast(error.message);
      },
    });
    return url;
  };

  const uploadVendorDetails = async () => {
    let date = new Date().toLocaleDateString('en-GB');
    date = date.replaceAll('/', '.');
    let folderName = `po info/vendor images/vendor-${vendorId}/date-${date}/`;
    let signFilename = `signature-${user._id}.jpg`;
    let imageFilename = `photo-${user._id}.jpg`;
    let vendorPhoto, singImage;

    if (vendorSign) {
      singImage = await uploadImage(image, folderName + signFilename);
    }
    if (image) {
      vendorPhoto = await uploadImage(image, folderName + imageFilename);
    }
    let vendorDetails = {
      vendorId,
      vendorPhoto,
      vendorSign: singImage,
    };
    setVendorDetails(vendorDetails);
    await setStorage('vendorDetails', vendorDetails);
    removePhoto();
    resetSign();
    setBottomModalVisible(false);
  };

  return (
    <Modal
      isOpen={bottomModalVisible}
      header="Add Vendor Details"
      closeIcon={<CloseCircle size={6} color="#000" />}
      onPress={() => setBottomModalVisible(false)}>
      <View className="content">
        <ScrollView>
          <Text className="text-sm text-slate-600 font-medium">
            Draw the signature inside the border area by using finger
          </Text>
          <View className="signature-button h-32 my-3">
            <View className="signature relative h-32 border border-gray-300">
              <SignatureCapture
                style={{flex: 1}}
                ref={signRef}
                onSaveEvent={onSave}
                onDragEvent={onDrag}
                saveImageFileInExtStorage={false}
                showBorder={true}
                showNativeButtons={false}
                showTitleLabel={false}
                backgroundColor="#ffffff"
                strokeColor="#000000"
                minStrokeWidth={3}
                maxStrokeWidth={3}
                viewMode={'portrait'}
              />
              {isDraw && (
                <View className="controls absolute top-1 right-2">
                  <Button
                    type="icon"
                    icon={<Reload size={5} color={colors['danger']} />}
                    onPress={() => resetSign()}
                  />
                </View>
              )}
            </View>
          </View>
          <View className="image-upload">
            {isDraw && !image && (
              <Button
                variant="primary"
                text="Save and Take a photo"
                onPress={() => saveAndCapturePhoto()}
                icon={<Save size={5} color="#fff" />}
              />
            )}

            {image && (
              <View className="image-preview relative my-3">
                <Image
                  className="w-full h-60 rounded"
                  source={{uri: image.uri}}
                />
                <View className="buttons w-full absolute bottom-5 flex-row items-center justify-center">
                  <TouchableOpacity
                    className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center mx-2"
                    onPress={() => removePhoto()}>
                    <Trash size={6} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mx-2"
                    onPress={() => reTakePhoto()}>
                    <Camera size={6} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {vendorSign && image && (
            <Button
              text={isUploading ? 'Uploading...' : 'Submit Details'}
              size={width > 460 ? 'large' : 'medium'}
              variant="primary"
              loading={isUploading}
              onPress={() => uploadVendorDetails()}
            />
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default VendorForm;
