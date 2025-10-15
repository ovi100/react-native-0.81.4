import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Image, TextInput, ActivityIndicator, FlatList } from 'react-native';
import { useBackHandler } from '../../../../hooks';
import {
  BatchImage,
  BoxImage,
  MrpImage,
  OfferPriceImage,
  RegularPriceImage,
  SapImage,
  SwGreenImage,
  SwRedImage,
  VatImage
} from '../../../../assets/images';
import { calculateShelfLife, formatDateText, formatIsoDate, getDate, toast, validateDate } from '../../../../utils';
import { Button, CircularProgress } from '../../../../components';
import { useForm, Controller } from 'react-hook-form';
import { API_URL } from '../../../../app-config';
import { MaterialCatList } from '../../../../data';
import { useFocusEffect } from '@react-navigation/native';

// Helper to show tiny error text
const ErrorText = ({ msg }) =>
  msg ? (
    <Text className="text-[10px] text-red-500 mt-1">{String(msg)}</Text>
  ) : null;

const ArticleDetails = ({ navigation, route }) => {
  const {
    screen,
    po,
    dn,
    // childPack,
    site,
    token,
    material,
    description,
    remainingQuantity,
    poItem,
    taxRate,
    unit,
    unitPrice,
    unitVat,
    logicVat,
  } = route.params;
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      quantity: dn ? String(remainingQuantity ?? '') : '',
      challanQuantity: dn ? String(remainingQuantity ?? '') : '',
      batchNumber: '',
      mrp: '',
      mfgDate: '',
      expDate: '',
    },
  });
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [isCheckingExist, setIsCheckingExist] = useState(false);
  const [stock, setStock] = useState(0);
  const [prices, setPrices] = useState([]);
  const category = MaterialCatList[material.slice(0, 2)];
  const skipDateCheck = category.includes('GM') || category.includes('NFD') || category.includes('CONSUMABLES');
  const regex = /^(dk|ds)/i;

  // Custom hook to navigate screen
  useBackHandler(screen);

  const customHeader = useMemo(
    () => (
      <View className="text px-1 xs:px-2">
        <Text className="text-sm xs:text-base text-sh text-center font-medium capitalize">
          article {' ' + material}
        </Text>
        <Text
          className="w-56 xs:w-full mx-auto text-xs xs:text-sm text-sh text-center font-medium capitalize"
          numberOfLines={2}
        >
          {description}
        </Text>
      </View>
    ),
    [description, material]
  );

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: () => customHeader });
  }, [customHeader, navigation]);


  const fetchProductInfo = async () => {
    try {
      setIsLoadingInfo(true);
      await fetch(API_URL + `api/service/stock-mrp/?site=${site}&material=${material}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            setStock(result.data.sapStock);
            setPrices(result.data.epsData);
          } else {
            toast(result.message);
          }
        })
        .catch(error => {
          const msg = error.message.includes('JSON Parse error')
            ? 'Server is down'
            : error.message;
          toast(msg);
        });
    } catch (error) {
      toast(error.message);
    } finally {
      setIsLoadingInfo(false);
    }
  };

  const fetchExistInfo = async () => {
    try {
      const document = po || dn;
      setIsCheckingExist(true);
      await fetch(API_URL + `api/service/existing-data/?documentNumber=${document}&material=${material}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            setValue("batchNumber", result.data.batchNumber, { shouldValidate: true });
            setValue("mrp", result.data.mrp, { shouldValidate: true });
            setValue("mfgDate", formatIsoDate(result.data.mfgDate), { shouldValidate: true });
            setValue("expDate", formatIsoDate(result.data.expDate), { shouldValidate: true });
          } else {
            toast(result.message);
          }
        })
        .catch(error => {
          const msg = error.message.includes('JSON Parse error')
            ? 'Server is down'
            : error.message;
          toast(msg);
        });
    } catch (error) {
      toast(error.message);
    } finally {
      setIsCheckingExist(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const getProductInfo = async () => {
        await fetchExistInfo();
        if (!regex.test(site)) {
          await fetchProductInfo();
        }
      };
      if (material && site && token) {
        getProductInfo();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [material, site, token]),
  );

  const quantity = watch('quantity');
  const mfgText = watch('mfgDate');
  const expText = watch('expDate');

  // VAT calculation
  const itemVatAmount = (() => {
    const qty = Number(quantity || 0);
    if (!qty || unitVat === 0) return 0;
    if (logicVat != null) return Math.min(unitVat, logicVat) * qty;
    return unitVat * qty;
  })();

  const renderItem = ({ item, index }) => (
    <View className="flex-row items-center gap-x-1 mr-1 last:mr-0" key={index}>
      <Image
        className="w-4 h-4"
        source={
          item.type === 'regular' ? RegularPriceImage : OfferPriceImage
        }
      />
      <Text className="text-xs text-[#2E2C3B] font-medium">
        {String(item.unitPrice)} ({item.quantity})
      </Text>
    </View>
  );

  // Shelf life calculation (derived)
  const shelfLife = calculateShelfLife(getDate(mfgText), getDate(expText));

  const onSubmit = async (data) => {
    try {
      setIsButtonLoading(true);

      const postData = {
        material,
        poNumber: po,
        poItem,
        unitVat,
        unitPrice,
        site,
        unit,
        quantity: +data.quantity,
        // challanQuantity: +data.challanQuantity,
        batchNumber: data.batchNumber,
        mrp: +data.mrp,
        mfgDate: getDate(data.mfgDate),
        expDate: getDate(data.expDate),
      };

      await fetch(API_URL + 'api/po/receive', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })
        .then(response => response.json())
        .then(result => {
          if (result.success) {
            console.log(result)
            navigation.push(screen);
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
    <>
      {isCheckingExist && (
        <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-950">
          <ActivityIndicator size="large" color="#EB4B50" />
          <Text className="mt-4 text-gray-400 text-base text-center">
            Searching received data. Please wait......
          </Text>
        </View>
      )}
      {!isCheckingExist && (
        <View className="flex-1 bg-white dark:bg-neutral-950">
          <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView keyboardShouldPersistTaps="handled">
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

                      <View className="input-boxes flex-1 flex-row mt-2">
                        <View className="left-box w-1/2">
                          <Controller
                            control={control}
                            name="quantity"
                            rules={{
                              required: 'Quantity is required',
                              validate: (v) => {
                                const n = Number(v);
                                if (Number.isNaN(n)) return 'Must be a number';
                                if (n <= 0) return 'Must be greater than 0';
                                if (remainingQuantity != null && n > Number(remainingQuantity))
                                  return 'Receive quantity exceed';
                                return true;
                              },
                            }}
                            render={({ field: { value, onChange, onBlur } }) => (
                              <TextInput
                                className="h-14 bg-[#F5F6FA] border border-t-0 border-black/25 text-[#5D80C5] text-xs xs:text-sm rounded-2xl px-4 mr-2"
                                placeholder="Enter quantity"
                                placeholderTextColor="#5D80C5"
                                selectionColor="#5D80C5"
                                keyboardType="numeric"
                                value={value}
                                onChangeText={(t) => {
                                  onChange(t);
                                  setValue('challanQuantity', t, { shouldValidate: true });
                                }}
                                onBlur={onBlur}
                              />
                            )}
                          />
                          <ErrorText msg={errors.quantity?.message} />
                        </View>

                        {/* challan quantity */}
                        <View className="right-box w-1/2">
                          <Controller
                            control={control}
                            name="challanQuantity"
                            rules={{
                              required: 'Challan quantity is required',
                              validate: (v) => {
                                const n = Number(v);
                                if (Number.isNaN(n)) return 'Must be a number';
                                if (n <= 0) return 'Must be greater than 0';
                                if (n < +quantity) return 'Challan quantity cannot be less than receive quantity';
                                if (n > remainingQuantity) return 'Challan quantity cannot be greater than po quantity';
                                return true;
                              },
                            }}
                            render={({ field: { value, onChange, onBlur } }) => (
                              <TextInput
                                className="h-14 bg-[#F5F6FA] border border-t-0 border-black/25 text-[#5D80C5] text-xs xs:text-sm rounded-2xl px-4"
                                placeholder="challan quantity"
                                placeholderTextColor="#5D80C5"
                                selectionColor="#5D80C5"
                                keyboardType="numeric"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                              />
                            )}
                          />
                          <ErrorText msg={errors.challanQuantity?.message} />
                        </View>
                      </View>

                      <View className="stock-vat flex-row items-center justify-between mt-0">
                        <View className="sap-stock">
                          {isLoadingInfo ? (
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
                                {String(stock)}
                              </Text>
                            </View>
                          )}
                        </View>

                        <View className="vat">
                          <View className="flex-row items-center gap-x-3">
                            <Text className="text-black text-sm font-bold">
                              {taxRate && `${taxRate}%`}
                              {itemVatAmount > 0 && ` (${itemVatAmount.toFixed(2)})`}
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
                          <Controller
                            control={control}
                            name="batchNumber"
                            rules={{
                              required: 'Batch number is required',
                              minLength: { value: 2, message: 'Too short' },
                            }}
                            render={({ field: { value, onChange, onBlur } }) => (
                              <TextInput
                                className="bg-[#F5F6FA] border border-t-0 border-black/25 h-12 text-[#5D80C5] text-xs xs:text-sm rounded-2xl px-4"
                                placeholder="Batch number"
                                placeholderTextColor="#5D80C5"
                                selectionColor="#5D80C5"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                              />
                            )}
                          />
                          <ErrorText msg={errors.batchNo?.message} />
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
                          <Controller
                            control={control}
                            name="mrp"
                            rules={{
                              validate: (v) => {
                                if (!v) return true; // optional
                                const n = Number(v);
                                if (Number.isNaN(n)) return 'Must be a number';
                                if (n < 0) return 'Cannot be negative';
                                return true;
                              },
                            }}
                            render={({ field: { value, onChange, onBlur } }) => (
                              <TextInput
                                className="bg-[#F5F6FA] border border-t-0 border-black/25 h-12 text-[#5D80C5] text-xs xs:text-sm rounded-2xl px-4"
                                placeholder="Enter MRP"
                                placeholderTextColor="#5D80C5"
                                selectionColor="#5D80C5"
                                keyboardType="numeric"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                              />
                            )}
                          />
                          <ErrorText msg={errors.mrp?.message} />
                        </View>
                        {!regex.test(site) && (
                          <>
                            {isLoadingInfo && prices.length === 0 && (
                              <View className="flex-row items-center gap-x-1 mt-1">
                                <ActivityIndicator size="small" color={'#f87171'} />
                                <Text className="text-xs text-center text-red-400 font-medium">
                                  price loading....
                                </Text>
                              </View>
                            )}

                            {!isLoadingInfo && prices.length > 0 && (
                              <View className="mrp-info flex-row items-center mt-1">
                                <FlatList
                                  data={prices}
                                  renderItem={renderItem}
                                  keyExtractor={(_, index) => String(index)}
                                  horizontal={true}
                                />
                              </View>
                            )}
                            {!isLoadingInfo && prices.length === 0 && (
                              <View className="mt-1">
                                <Text className="text-xs text-center text-red-400 font-medium">
                                  price not found!
                                </Text>
                              </View>
                            )}
                          </>
                        )}
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
                          {mfgText && mfgText.length === 8 && (
                            <Text className="text-xs xs:text-sm text-[#2E2C3B] font-medium capitalize">
                              {getDate(mfgText).toLocaleDateString('en-Uk', { dateStyle: 'medium' })}
                            </Text>
                          )}
                        </View>
                        <View className="date-picker mt-2">
                          <Controller
                            control={control}
                            name="mfgDate"
                            rules={{
                              required: 'MFG date is required',
                              validate: (value) => !skipDateCheck ? validateDate(value, 'mfg') : true,
                            }}
                            render={({ field: { value, onChange, onBlur } }) => (
                              <TextInput
                                className="bg-[#F5F6FA] border border-t-0 border-black/25 h-12 text-[#5D80C5] text-xs xs:text-sm rounded-2xl px-4"
                                placeholder="DD/MM/YY"
                                placeholderTextColor="#5D80C5"
                                value={value}
                                onChangeText={text => onChange(formatDateText(text))}
                                onBlur={onBlur}
                                keyboardType="numeric"
                                maxLength={10}
                              />
                            )}
                          />
                          <ErrorText msg={errors.mfgDate?.message} />
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
                          {expText && expText.length === 8 && (
                            <Text className="text-xs xs:text-sm text-[#2E2C3B] font-medium capitalize">
                              {getDate(expText).toLocaleDateString('en-Uk', { dateStyle: 'medium' })}
                            </Text>
                          )}
                        </View>
                        <View className="date-picker mt-2">
                          <Controller
                            control={control}
                            name="expDate"
                            rules={{
                              required: 'Expiry date is required',
                              validate: (value) => !skipDateCheck ? validateDate(value, 'exp') : true
                            }}
                            render={({ field: { value, onChange, onBlur } }) => (
                              <TextInput
                                className="bg-[#F5F6FA] border border-t-0 border-black/25 h-12 text-[#5D80C5] text-xs xs:text-sm rounded-2xl px-4"
                                placeholder="DD/MM/YY"
                                placeholderTextColor="#5D80C5"
                                value={value}
                                onChangeText={text => onChange(formatDateText(text))}
                                onBlur={onBlur}
                                keyboardType="numeric"
                                maxLength={10}
                              />
                            )}
                          />
                          <ErrorText msg={errors.expDate?.message} />
                        </View>
                      </View>
                    </View>

                    {shelfLife > 0 && (
                      <View className="w-full bg-[#FEFBFB] flex-col items-center border border-[#F2EFEF] rounded mb-3 py-2">
                        <Text className="text-xs xs:text-sm text-[#2E2C3B] text-center font-medium capitalize mb-2">
                          shelf life
                        </Text>
                        <CircularProgress
                          progress={shelfLife}
                          variant={shelfLife >= 75 ? 'success' : 'danger'}
                        />
                      </View>
                    )}
                  </View>

                  <View className="button mb-6">
                    <Button
                      text={isButtonLoading || isSubmitting ? 'Receiving item' : 'Mark as Received'}
                      variant="brand"
                      loading={isButtonLoading || isSubmitting}
                      onPress={handleSubmit(onSubmit)}
                      disabled={!isValid || isButtonLoading || isSubmitting}
                    />
                  </View>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      )}
    </>
  );
};

export default ArticleDetails;
