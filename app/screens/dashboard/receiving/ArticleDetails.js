import React, { useLayoutEffect, useMemo, useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Image, TextInput } from 'react-native';
import { useBackHandler } from '../../../../hooks';
import { BatchImage, BoxImage, MrpImage, SapImage, SwGreenImage, SwRedImage, VatImage } from '../../../../assets/images';
import { calculateShelfLife, handleDate } from '../../../../utils';
import { Button, CircularProgress } from '../../../../components';

const ArticleDetails = ({ navigation, route }) => {
  const { screen, po, dn, childPack, material, description, remainingQuantity, taxRate, unitVat, logicVat } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [newQuantity, setNewQuantity] = useState(
    dn ? remainingQuantity.toString() : '',
  );
  const [challanQuantity, setChallanQuantity] = useState(newQuantity);
  const [priceInfo, setPriceInfo] = useState([]);
  const [mfgDate, setMfgDate] = useState(new Date());
  const [expDate, setExpDate] = useState(new Date());
  const [batchNo, setBatchNo] = useState('');
  const [itemVatAmount, setItemVatAmount] = useState(0);
  const [mrp, setMrp] = useState('');

  // Custom hook to navigate screen
  useBackHandler(screen);

  const customHeader = useMemo(() => (
    <View className="text px-1 xs:px-2">
      <Text className="text-sm xs:text-base text-sh text-center font-medium capitalize">
        article {' ' + material}
      </Text>
      <Text
        className="w-56 xs:w-full mx-auto text-xs xs:text-sm text-sh text-center font-medium capitalize"
        numberOfLines={2}>
        {description}
      </Text>
    </View>
  ), [description, material]);

  useLayoutEffect(() => {
    const options = {
      headerTitle: () => customHeader,
    };
    navigation.setOptions(options);
  }, [description, customHeader, material, navigation]);

  const calculateVatAmount = (quantity) => {
    let vatAmount = 0;
    if (unitVat === 0) {
      vatAmount = 0;
    } else if (logicVat !== null) {
      vatAmount = Math.min(unitVat, logicVat) * quantity;
    } else {
      vatAmount = unitVat * quantity;
    }
    setItemVatAmount(vatAmount);
  };

  const shelfLife = calculateShelfLife(mfgDate?.date, expDate?.date);

  return (
    <View className="flex-1 bg-white dark:bg-neutral-950">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView>
          <View className="flex-1 px-4">
            <View className="content flex-1 justify-between pb-2">
              <View className="input-boxes mt-2">
                {/* Quantity Box */}
                <View className="quantity-box bg-[#FEFBFB] border border-[#F2EFEF] rounded px-3 xs:px-5 py-2">
                  <View className="box-header flex-row items-center justify-between">
                    <View className="text flex-row items-center gap-3">
                      <Image className="w-5 h-5" source={BoxImage} />
                      <Text className="text-sm xs:text-base text-[#2E2C3B] font-medium capitalize">
                        received quantity
                      </Text>
                    </View>
                    <Text className="font-bold bg-blue-600 text-white text-xs xs:text-sm rounded-full py-1 px-2">
                      {remainingQuantity}
                    </Text>
                  </View>
                  <View className="input-box flex-row items-center mt-2">
                    <TextInput
                      className="w-1/2 h-14 bg-[#F5F6FA] border border-t-0 border-black/25 text-[#5D80C5] text-xs xs:text-sm rounded-2xl px-4 mr-2"
                      placeholder="Enter quantity"
                      placeholderTextColor="#5D80C5"
                      selectionColor="#5D80C5"
                      keyboardType="numeric"
                      value={newQuantity.toString()}
                      onChangeText={value => {
                        setNewQuantity(value);
                        setChallanQuantity(value);
                        calculateVatAmount(value);
                      }}
                    />

                    <TextInput
                      className="w-1/2 h-14 bg-[#F5F6FA] border border-t-0 border-black/25 text-[#5D80C5] text-xs xs:text-sm rounded-2xl px-4"
                      placeholder="challan quantity"
                      placeholderTextColor="#5D80C5"
                      selectionColor="#5D80C5"
                      keyboardType="numeric"
                      value={challanQuantity.toString()}
                      onChangeText={value => setChallanQuantity(value)}
                    />
                  </View>
                  <View className="stock-vat flex-row items-center justify-between mt-2">
                    <View className="sap-stock">
                      {/* {isSapStockLoading ? (
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
                      )} */}
                    </View>
                    <View className="vat">
                      <View className="flex-row items-center gap-x-3">
                        <Text className="text-black text-sm font-bold">
                          {taxRate && `${taxRate}%`}
                          {itemVatAmount > 0 &&
                            ` (${itemVatAmount.toFixed(2)})`}
                        </Text>
                        <Image className="w-10 h-10" source={VatImage} />
                      </View>
                    </View>
                  </View>
                </View>

                <View className="w-full batch-mrp flex-row mt-3">
                  {/* Product Batch */}
                  <View className="w-1/2 product-batch bg-[#FEFBFB] border border-[#F2EFEF] rounded px-3 py-2 mr-0.5">
                    <View className="box-header flex-row items-center gap-1.5 xs:gap-3">
                      <Image className="w-5 h-5" source={BatchImage} />
                      <Text className="text-sm xs:text-base text-[#2E2C3B] font-medium capitalize">
                        batch no.
                      </Text>
                    </View>
                    <View className="input-box mt-2">
                      <TextInput
                        className="bg-[#F5F6FA] border border-t-0 border-black/25 h-12 text-[#5D80C5] text-xs xs:text-sm rounded-2xl px-4"
                        placeholder="Batch number"
                        placeholderTextColor="#5D80C5"
                        selectionColor="#5D80C5"
                        value={batchNo.toString()}
                        onChangeText={value => setBatchNo(value)}
                      />
                    </View>
                  </View>

                  {/* Product MRP */}
                  <View className="w-1/2 product-mrp bg-[#FEFBFB] border border-[#F2EFEF] rounded px-3 py-2 ml-0.5">
                    <View className="box-header flex-row items-center gap-1.5 xs:gap-3">
                      <Image className="w-5 h-5" source={MrpImage} />
                      <Text className="text-sm xs:text-base text-[#2E2C3B] font-medium">
                        MRP Price
                      </Text>
                    </View>
                    <View className="input-box mt-2">
                      <TextInput
                        className="bg-[#F5F6FA] border border-t-0 border-black/25 h-12 text-[#5D80C5] text-xs xs:text-sm rounded-2xl px-4"
                        placeholder="Enter MRP"
                        placeholderTextColor="#5D80C5"
                        selectionColor="#5D80C5"
                        keyboardType="numeric"
                        value={mrp.toString()}
                        onChangeText={value => setMrp(value)}
                      />
                    </View>
                    {/* {!regex.test(site.toLowerCase()) && (
                      <>
                        {isLoading && priceInfo?.length === 0 && (
                          <View className="flex-row items-center gap-x-1 mt-1">
                            <ActivityIndicator size="small" color={'#f87171'} />
                            <Text className="text-xs text-center text-red-400 font-medium">
                              price loading....
                            </Text>
                          </View>
                        )}

                        {!isLoading && priceInfo?.length > 0 && (
                          <View className="mrp-info flex-row items-center mt-1">
                            <FlatList
                              data={priceInfo}
                              renderItem={renderItem}
                              keyExtractor={(_, index) => String(index)}
                              horizontal={true}
                            />
                          </View>
                        )}
                        {!isLoading && priceInfo?.length === 0 && (
                          <View className="mt-1">
                            <Text className="text-xs text-center text-red-400 font-medium">
                              price not found!
                            </Text>
                          </View>
                        )}
                      </>
                    )} */}
                  </View>
                </View>
                <View className="w-full mfg-exp-date flex-row mt-3 mb-3">
                  {/* Product Manufacturing Date */}
                  <View className="w-1/2 mfg-date bg-[#FEFBFB] border border-[#F2EFEF] rounded px-3 py-2 mr-0.5">
                    <View className="box-header">
                      <View className="flex-row items-center gap-1.5 xs:gap-3">
                        <Image className="w-5 h-5" source={SwGreenImage} />
                        <Text className="text-sm xs:text-base text-[#2E2C3B] font-medium">
                          MFG Date
                        </Text>
                      </View>
                      {mfgDate?.date && mfgDate?.text?.length === 8 && (
                        <Text className="text-xs xs:text-sm text-[#2E2C3B] font-medium capitalize">
                          {mfgDate?.date?.toLocaleDateString('en-Uk', {
                            dateStyle: 'medium',
                          })}
                        </Text>
                      )}
                    </View>
                    <View className="date-picker mt-2">
                      <TextInput
                        className="bg-[#F5F6FA] border border-t-0 border-black/25 h-12 text-[#5D80C5] text-xs xs:text-sm rounded-2xl px-4"
                        placeholder="DD/MM/YY"
                        placeholderTextColor="#5D80C5"
                        value={mfgDate?.text}
                        onChangeText={text =>
                          setMfgDate(handleDate(text, 'mfg'))
                        }
                        keyboardType="numeric"
                        maxLength={10}
                      />
                    </View>
                  </View>

                  {/* Product Expiry Date */}
                  <View className="w-1/2 exp-date bg-[#FEFBFB] border border-[#F2EFEF] rounded px-3 py-2 ml-0.5">
                    <View className="box-header">
                      <View className="flex-row items-center gap-1.5 xs:gap-3">
                        <Image className="w-5 h-5" source={SwRedImage} />
                        <Text className="text-sm xs:text-base text-[#2E2C3B] font-medium capitalize">
                          exp date
                        </Text>
                      </View>
                      {expDate?.date && expDate?.text?.length === 8 && (
                        <Text className="text-xs xs:text-sm text-[#2E2C3B] font-medium capitalize">
                          {expDate?.date?.toLocaleDateString('en-Uk', {
                            dateStyle: 'medium',
                          })}
                        </Text>
                      )}
                    </View>
                    <View className="date-picker mt-2">
                      <TextInput
                        className="bg-[#F5F6FA] border border-t-0 border-black/25 h-12 text-[#5D80C5] text-xs xs:text-sm rounded-2xl px-4"
                        placeholder="DD/MM/YY"
                        placeholderTextColor="#5D80C5"
                        value={expDate?.text}
                        onChangeText={text =>
                          setExpDate(handleDate(text, 'exp'))
                        }
                        keyboardType="numeric"
                        maxLength={10}
                      />
                    </View>
                  </View>
                </View>

                {shelfLife > 0 && (
                  <View className="w-full bg-[#FEFBFB] flex-col items-center border border-[#F2EFEF] rounded mb-3 py-2">
                    <Text className="text-xs xs:text-sm text-[#2E2C3B] text-center font-medium capitalize mb-2">
                      shelf life
                    </Text>
                    {/* <CircularProgress
                      progress={shelfLife}
                      variant={
                        (!isLocal && shelfLife >= 50) ||
                          (isLocal && shelfLife >= 75)
                          ? 'success'
                          : 'danger'
                      }
                    /> */}
                    <CircularProgress
                      progress={shelfLife}
                      variant={shelfLife >= 75 ? 'success' : 'danger'}
                    />
                  </View>
                )}
              </View>
              <View className="button">
                <Button
                  text={isButtonLoading ? 'Receiving item' : 'Mark as Received'}
                  variant="brand"
                  loading={isButtonLoading}
                  onPress={() => null}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

export default ArticleDetails;