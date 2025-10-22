import { View, Text, TextInput, Image } from 'react-native';
import React, { useLayoutEffect, useMemo, useState } from 'react';
import { Button, FalseHeader } from '../../../../components';
import { BoxImage } from '../../../../assets/images';
import { API_URL } from '../../../../app-config';
import { toast } from '../../../../utils';

const PickingArticleDetails = ({ navigation, route }) => {
  const { screen, dnNumber, site, token, binCode, material, quantity } = route.params;
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [pickedQuantity, setPickedQuantity] = useState(0);

  const customHeader = useMemo(() => (
    <View className="text px-1 xs:px-2">
      <Text className="text-base xs:text-lg text-sh text-center font-medium capitalize">
        picking article{' ' + material}
      </Text>
      {/* <Text
        className="text-sh text-xs xs:text-sm text-center font-medium capitalize"
        numberOfLines={2}>
        {description}
      </Text> */}
    </View>
  ), [material]);

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: () => customHeader });
  }, [customHeader, navigation]);

  // console.log(screen, dn, site, token, binCode, material, quantity);

  const pickItem = async () => {
    try {
      setIsButtonLoading(true);

      const postData = {
        dnNumber,
        quantity: pickedQuantity,
        material,
        binCode
      };

      await fetch(API_URL + 'api/sto/pick-items', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      })
        .then(response => response.json())
        .then(result => {
          if (result.success) {
            navigation.replace(screen, { dnNumber, site });
          } else {
            toast(result.message);
          }
        })
        .catch(({ message }) => {
          const msg = message.includes('JSON Parse error')
            ? 'Server is down'
            : message;
          toast(msg);
        });
    } catch (e) {
      toast(e);
    } finally {
      setIsButtonLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-neutral-950">
      <View className="flex-1 px-4">
        <FalseHeader />
        <View className="content flex-1 justify-between py-2">
          {/* Quantity Box */}
          <View className="quantity-box bg-[#FEFBFB] border border-[#F2EFEF] p-5">
            <View className="box-header flex-row items-center justify-between">
              <View className="text">
                <Text className="text-base text-[#2E2C3B] font-medium capitalize">
                  picked quantity
                </Text>
              </View>
              <View className="quantity flex-row items-center gap-3">
                <Image className="w-8 h-8" source={BoxImage} />
                <Text className="text-black font-bold">
                  {quantity}
                </Text>
              </View>
            </View>
            <View className="input-box mt-6">
              <TextInput
                className="bg-[#F5F6FA] border border-t-0 border-black/25 h-[50px] text-[#5D80C5] rounded-2xl mb-3 px-4"
                placeholder="Type Picked Quantity"
                placeholderTextColor="#5D80C5"
                selectionColor="#5D80C5"
                keyboardType="numeric"
                // value={pickedQuantity.toString()}
                onChangeText={value => setPickedQuantity(+value)}
              />
            </View>
            {/* <View className="sap-stock">
              {isLoading ? (
                <View className="flex-row items-center gap-x-1 mt-1">
                  <ActivityIndicator size="small" color={'#0964AF'} />
                  <Text className="text-xs text-center text-[#0964AF] font-medium">
                    SAP stock loading....
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center gap-x-3">
                  <Image className="w-10 h-10" source={SapImage} />
                  <Text className="text-black text-sm font-bold">
                    {sapStock}
                  </Text>
                </View>
              )}
            </View> */}
          </View>

          <View className="button mt-3">
            <Button
              text={
                isButtonLoading ? 'Picking article' : 'Mark as Picked'
              }
              size='medium'
              variant="brand"
              loading={isButtonLoading}
              disabled={pickedQuantity <= 0}
              onPress={() => pickItem()}
            />
          </View>
        </View>
      </View>
    </View>
  )
}

export default PickingArticleDetails;