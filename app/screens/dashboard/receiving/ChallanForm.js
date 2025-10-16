import React, { useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useAppContext} from '../../../../hooks';
import { formatDateText, formatIsoDate, getDate, toast } from '../../../../utils';
import { Button, Input, Modal } from '../../../../components';
import { Camera, CircleX, Trash } from 'lucide-react-native';
import ChallanInfo from './ChallanInfo';

const defaultChallan = {
  challanNumber: '',
  challanDate: '',
  challanImageUrl: '',
  totalVatAmount: '',
};

const ChallanForm = ({ po, isEmptyVatAmount }) => {
  const { challanInfo } = useAppContext();
  const {
    challans,
    setChallans,
    challanModal,
    setChallanModal,
    handleSkip,
    isEditingIndex,
    setIsEditingIndex,
    isUploading,
    uploadImage,
    validateChallanDate,
    validateVatAmount,
    takePhoto, 
    reTakePhoto, 
    removePhoto, 
    image, 
    setImage
  } = challanInfo;
  const {
    control,
    setValue,
    watch,
    reset,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: defaultChallan,
  });

  const hasChallanNumber = Boolean(watch('challanNumber'));
  const hasChallanDate = Boolean(watch('challanDate'));
  const hasVatAmount = Boolean(watch('totalVatAmount'));
  const enablePhotTake = hasChallanNumber && hasChallanDate && hasVatAmount;

  useEffect(() => {
    const item = challans[isEditingIndex];
    if (item) {
      setValue('challanNumber', item?.challanNumber || '', { shouldValidate: true });
      setValue('challanDate', formatIsoDate(item?.challanDate), { shouldValidate: true });
      setValue('totalVatAmount', item?.totalVatAmount?.toString() || '', { shouldValidate: true });
      setImage({ uri: item?.challanImageUrl });
    }
  }, [challans, isEditingIndex, setImage, setValue]);

  const resetChallan = () => {
    reset(defaultChallan);
    setIsEditingIndex(null);
    setImage(null);
  };

  const onSubmit = async data => {
    try {
      let imageUrl = '';

      if (image?.uri?.startsWith('file')) {
        const date = new Date().toLocaleDateString('en-GB').replaceAll('/', '.');
        const folderName = `po info/challan images/date-${date}/`;
        const imageName = `${po}-${data.challanNumber}.jpg`;
        // image.fileName = image.fileName.replaceAll(image.fileName, imageName)
        imageUrl = await uploadImage(image, folderName + imageName);
      }

      if (!imageUrl && isEditingIndex !== null) {
        imageUrl = challans[isEditingIndex]?.challanImageUrl;
      }

      if (!imageUrl) {
        toast('Please upload an image');
        return;
      }

      const challan = {
        ...data,
        challanDate: getDate(data.challanDate),
        challanImageUrl: imageUrl,
      };

      if (isEditingIndex !== null) {
        const updated = [...challans];
        updated[isEditingIndex] = challan;
        setChallans(updated);
        setIsEditingIndex(null);
        toast('Challan updated successfully');
      } else {
        setChallans(prev => [...prev, challan]);
        toast('Challan added successfully');
      }

      resetChallan();
    } catch (error) {
      toast(error.message);
    }
  };

  const buttonText = isUploading
    ? 'Uploading image'
    : isEditingIndex !== null && !isDirty
      ? 'Reset form'
      : isEditingIndex !== null && isDirty
        ? 'Update Challan'
        : 'Add Challan';

  const onChallanModalClose = () => {
    if (challans.length > 0) {
      handleSkip();
    } else {
      setChallanModal(false);
      resetChallan();
    }
  };

  const handleFormSubmit = () => {
    if (isEditingIndex !== null && !isDirty) {
      resetChallan();
    } else {
      handleSubmit(onSubmit)();
    }
  };

  return (
    <Modal
      isOpen={challanModal}
      showCloseButton={true}
      closeIcon={<CircleX size={24} color="#000" />}
      header="📜 Challan Info"
      onPress={() => onChallanModalClose()}>
      <View className="content">
        <Text className="text-xs text-slate-700 text-center font-semibold mb-2">
          PO: {po}
        </Text>
        <ChallanInfo />
        <ScrollView>
          <View className="form flex-1 border border-gray-300 rounded mb-3 p-2">
            <View className="header mb-2">
              <Text className="text-sm text-slate-700 text-center font-semibold">
                {isEditingIndex !== null ? 'Edit' : 'New'} Challan
                {isEditingIndex !== null ? ` #${isEditingIndex + 1}` : ''}
              </Text>
            </View>
            <View className="challan-number relative mb-2">
              <Controller
                name="challanNumber"
                control={control}
                rules={{
                  required: 'Challan number is required',
                  maxLength: {
                    value: 29,
                    message: 'Max challan number length is 29'
                  },
                  pattern: {
                    value: /^\S*$/,
                    message: 'Challan number cannot contain spaces'
                  }
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Enter challan number"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.challanNumber && (
                <Text className="absolute top-8 right-3 text-red-400 text-xs md:text-sm">
                  {errors.challanNumber?.message}
                </Text>
              )}
            </View>
            <View className="challan-date relative mb-2">
              <Controller
                name="challanDate"
                control={control}
                rules={{
                  required: 'Date is required',
                  validate: value => validateChallanDate(value),
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Date (dd/mm/yy)"
                    keyboardType="numeric"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={text => onChange(formatDateText(text))}
                  />
                )}
              />
              {errors.challanDate && (
                <Text className="absolute top-8 right-3 text-red-400 text-xs md:text-sm">
                  {errors.challanDate?.message}
                </Text>
              )}
            </View>
            <View className="vat-amount relative">
              <Controller
                name="totalVatAmount"
                control={control}
                rules={{
                  required: 'VAT amount is required',
                  validate: value => validateVatAmount(value, isEmptyVatAmount),
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Enter VAT Amount"
                    keyboardType="numeric"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.totalVatAmount && (
                <Text className="absolute top-8 right-3 text-red-400 text-xs md:text-sm">
                  {errors.totalVatAmount.message}
                </Text>
              )}
            </View>
            <View className="challan-image relative">
              <View className="image-upload">
                {(image?.uri || challans[isEditingIndex]?.image) && (
                  <View className="image-preview relative">
                    <Image
                      className="w-full h-40 rounded"
                      source={{
                        uri: image?.uri || challans[isEditingIndex]?.image,
                      }}
                    />

                    <View className="buttons w-full absolute bottom-5 flex-row items-center justify-center">
                      <TouchableOpacity
                        className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center mx-2"
                        onPress={() => removePhoto()}>
                        <Trash size={20} color="#fff" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mx-2"
                        onPress={() => reTakePhoto()}>
                        <Camera size={20} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </View>
            <View className="button mt-2">
              {!image && (
                <Button
                  text="Take Photo"
                  variant={enablePhotTake ? 'success' : 'default'}
                  icon={
                    <Camera size={22} color={enablePhotTake ? '#fff' : '#000'} />
                  }
                  disabled={!enablePhotTake}
                  onPress={() => takePhoto()}
                />
              )}
              {image && (
                <Button
                  text={buttonText}
                  variant="brand"
                  loading={isUploading}
                  onPress={() => handleFormSubmit()}
                />
              )}
            </View>
          </View>
          {isEmptyVatAmount && (
            <>
              <Text className="bg-yellow-400 text-black text-sm xs:text-xs text-center rounded p-2 mt-2">
                * Challan information is optional for the item(s) you received
                from this PO, please click on skip if you want to skip the
                challan info.
              </Text>
              <View className="button w-1/3 sm:w-3/4 mx-auto mt-2">
                <Button
                  text="Skip"
                  size="small"
                  variant="brand"
                  edge="capsule"
                  onPress={() => handleSkip()}
                />
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default ChallanForm;