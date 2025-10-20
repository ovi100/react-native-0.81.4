import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { Button, FalseHeader, Modal } from '../../../../components';
import { useAppContext, useBackHandler } from '../../../../hooks';
import { FlatListStyle, serverMessage, toast } from '../../../../utils';
import { useFocusEffect } from '@react-navigation/native';
import { API_URL } from '../../../../app-config';
import { EmptyBox } from '../../../../components/animations';
import ChallanForm from '../../common/ChallanForm';
import GrnReview from '../../common/GrnReview';

const DocumentDetails = ({ navigation, route }) => {
  const { screen, poNumber, dnNumber, } = route.params;
  const { authInfo, challanInfo } = useAppContext();
  const { user } = authInfo;
  const {
    setChallanModal,
    challans,
    setChallans,
    setGrnModal,
    enableGrnReview,
    setEnableGrnReview
  } = challanInfo;
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [articles, setArticles] = useState([]);
  const [docInfo, setDocInfo] = useState(null);
  const [grnResult, setGrnResult] = useState(null);
  const DOC_TYPE = poNumber ? "po" : "dn";
  const tableHeader = poNumber
    ? ['Article Info', 'PO Qty', 'RCV Qty']
    : ['Article Info', 'Quantity', 'Action'];

  // Custom hook to navigate screen
  useBackHandler(screen);

  const customHeader = useMemo(
    () => (
      <View className="text px-1 xs:px-2">
        {poNumber && (
          <Text className="text-sm xs:text-base text-sh text-center font-medium">
            {`PO ${poNumber} Details`}
          </Text>
        )}
        {dnNumber && (

          <Text
            className="text-sm xs:text-base text-sh text-center font-medium">
            {`DN ${dnNumber} Details`}
          </Text>

        )}

      </View>
    ),
    [dnNumber, poNumber]
  );

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: () => customHeader });
  }, [customHeader, navigation]);

  const endpoint = useMemo(() => {
    if (!DOC_TYPE) return null;
    if (DOC_TYPE === "po") return `${API_URL}api/po/receiving-list/${poNumber}`;
    if (DOC_TYPE === "dn") return `${API_URL}api/dn/receiving-list/${dnNumber}`;
    return null;
  }, [DOC_TYPE, dnNumber, poNumber]);

  // Fetching document details
  const fetchData = async (url, token, signal) => {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      signal
    });

    const json = await response.json();
    // console.log(json);

    if (!response.ok || !json?.success) {
      throw new Error(serverMessage(json?.message || response.statusText));
    }

    return json?.data ?? {};
  };

  useFocusEffect(
    useCallback(() => {
      let ignore = false;
      const ac = new AbortController();

      (async () => {
        try {
          setIsLoading(true);
          const data = await fetchData(endpoint, user.token, ac.signal);
          if (ignore) return;

          console.log('po details', data);

          setDocInfo(data);
          const items = data?.itemList ?? [];
          setTotalItems(items.length);
          const challanList = data?.challans ?? [];
          const filteredList = items.filter(item => item.pendingGrnQuantity > 0);
          const newList = filteredList.map(item => {
            return {
              ...item,
              inputQuantity: item.pendingGrnQuantity,
              selected: false,
            }
          });
          setArticles(newList);
          setChallans(challanList);
        } catch (err) {
          if (!ignore && err?.name !== "AbortError") {
            toast(serverMessage(err.message));
          }
        } finally {
          if (!ignore) setIsLoading(false);
        }
      })();

      return () => {
        ignore = true;
        ac.abort();
      };
    }, [endpoint, setChallans, user.token])
  );

  const renderTableHeader = item => {
    const poStyles = `${item === 'Article Info' ? 'w-1/2' : 'w-1/4'}`;
    const dnStyles = `${item === 'Action' ? 'w-1/4 xs:w-1/5' : 'w-[37.5%] xs:w-2/5'}`;

    return (
      <Text
        className={`${poNumber ? poStyles : dnStyles} text-white text-xs xs:text-sm text-center font-bold`}
        key={item}>
        {item}
      </Text>
    );
  };

  const handleInputChange = (item, quantity) => {
    console.log(+quantity, +item.pendingGrnQuantity)

    if (+quantity > +item.pendingGrnQuantity) {
      toast('Quantity exceed');
      return;
    }

    setArticles(preValues =>
      preValues.map(article =>
        article.material === item.material
          ? {
            ...article,
            inputQuantity: quantity,
          }
          : article,
      ),
    );
  };

  const renderPoItem = ({ item }) => (
    <View key={item.poItem}
      className="flex-row items-center border border-tb rounded-lg mt-2.5 px-3 py-2">
      <View className="w-1/2">
        <View className="flex-row items-center gap-x-1 mb-1">
          <Text className="text-black text-xs xs:text-sm" numberOfLines={1}>
            ({Number(item.poItem) / 10}) {item.material}
          </Text>
          {item.plant !== user.active_site && (
            <Text
              className="text-red-500 text-xs xs:text-sm font-medium"
              numberOfLines={1}>
              ({item.plant})
            </Text>
          )}
        </View>
        <Text className="w-full text-black text-xs">{item.description}</Text>
      </View>
      <Text
        className="w-1/4 text-black text-xs xs:text-sm text-center"
        numberOfLines={1}>
        {item.quantity}
      </Text>
      <View className="w-1/3 mx-auto">
        <TextInput
          className={`w-20 h-10 text-black text-xs border ${item.selected ? 'border-gray-400'
            : 'border-gray-200'} text-center rounded-sm px-2 focus:border-blue-500`}
          keyboardType="phone-pad"
          autoFocus={item.selected}
          value={item.inputQuantity.toString() || ''}
          onChangeText={value => handleInputChange(item, value)}
        />
      </View>
    </View>
  );

  const grnItems = articles.filter(item => +item.inputQuantity > 0)

  let grnSummery = {};

  // GRN Summery
  if (grnItems.length > 0) {
    grnSummery = grnItems.reduce(
      (acc, curr, i) => {
        acc.totalItems = i + 1;
        acc.totalPrice += curr.inputQuantity * curr.unitPrice;
        acc.totalVatAmount += curr.inputQuantity * curr.unitVat;
        acc.totalNetAmount += curr.inputQuantity * curr.netPrice;
        return acc;
      },
      { totalItems: 0, totalPrice: 0, totalVatAmount: 0, totalNetAmount: 0 },
    );
  };

  const totalChallanAmount = () => {
    let amount = 0;
    if (challans.length > 0) {
      amount = challans.reduce((total, item) => {
        const a = parseFloat(item.totalVatAmount);
        return total + (isNaN(a) ? 0 : a);
      }, 0);
    };
    return amount;
  };

  const totalVatAmount = totalChallanAmount();
  const vatMarginAmount = grnSummery?.totalVatAmount * (2 / 100);
  const minGrnVatAmount = grnSummery?.totalVatAmount - vatMarginAmount;
  // const maxGrnVatAmount = grnSummery?.totalVatAmount + vatMarginAmount;
  const isValidVatAmount = totalVatAmount >= minGrnVatAmount;

  const hasGrnItems = grnItems.length > 0;
  // const hasVendorDetails =
  //   (vendorDetails && signMode) || !signMode || signMode === null;
  const isEmptyVatAmount = grnSummery?.totalVatAmount === 0;

  const enableGrnButton = (hasGrnItems && isValidVatAmount) || isEmptyVatAmount;

  const createGrn = async () => {
    try {
      setIsButtonLoading(true);

      const postData = {
        poNumber,
        vendor: docInfo?.vendor,
        site: user.active_site,
        poData: grnItems.map(item => {
          return {
            poItem: item.poItem,
            material: item.material,
            quantity: item.inputQuantity,
            poQty: item.quantity,
            netPrice: item.netPrice,
            taxRate: item.taxRate,
            unit: item.unit,
            unitIso: item.unitISO,
            storageLocation: docInfo?.storageLocation,
          }
        }),
        challans: challans.map(challan => {
          return {
            ...challan,
            totalVatAmount: +challan.totalVatAmount,
            totalCalculatedVatAmount: grnSummery?.totalVatAmount
          }
        }),
      };

      await fetch(API_URL + 'api/po/create-po-grn', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })
        .then(response => response.json())
        .then(result => {
          if (result.success) {
            setChallans([]);
            setEnableGrnReview(false);
            setGrnModal(false);
            setGrnResult(result);
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
      {isLoading && (
        <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-950">
          <ActivityIndicator size="large" color="#EB4B50" />
          <Text className="mt-4 text-gray-400 text-base text-center">
            Loading {poNumber ? 'po' : 'dn'} data. Please wait......
          </Text>
        </View>
      )}
      {!isLoading && !articles.length && (
        <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-950">
          <EmptyBox />
          <Text className="mt-4 text-gray-400 text-base text-center">
            No article is found!
          </Text>
        </View>
      )}
      {!isLoading && articles.length > 0 && (
        <View className="flex-1 bg-white dark:bg-neutral-950">
          <View className="flex-1 h-full px-2 sm:px-4">
            <FalseHeader />
            <View className="content flex-1 justify-between pb-2">
              <View className={`table ${hasGrnItems ? 'h-[85%] xs:h-[88%]' : 'h-full'}`}>
                <View className="table-header flex-row bg-th text-center p-2">
                  {tableHeader.map(th => renderTableHeader(th))}
                </View>
                <FlatList
                  data={articles}
                  renderItem={renderPoItem}
                  keyExtractor={item => item.poItem}
                  initialNumToRender={10}
                  ListFooterComponentStyle={FlatListStyle}
                // refreshControl={
                //   <RefreshControl
                //     colors={['#fff']}
                //     onRefresh={onRefresh}
                //     progressBackgroundColor="#000"
                //     refreshing={refreshing}
                //   />
                // }
                />
              </View>

              {poNumber && hasGrnItems && (
                <View className="button">
                  {!enableGrnReview && (
                    <Button
                      text={challans.length > 0 ? 'Edit Challan' : 'Add Challan'}
                      variant="brand"
                      onPress={() => setChallanModal(true)}
                    />
                  )}
                  {enableGrnReview && (
                    <Button
                      text={isButtonLoading ? 'Sending GRN' : 'Review GRN'}
                      variant="brand"
                      loading={isButtonLoading}
                      onPress={() => setGrnModal(true)}
                    />
                  )}
                </View>
              )}
              {/*  {dn && articles.length === 0 && hasGrnItems && (
                <View className="button">
                  <Button
                    text={isButtonLoading ? '' : 'Review GRN'}
                    variant="brand"
                    loading={isButtonLoading}
                    onPress={() => setGrnModal(true)}
                  />
                </View>
              )} */}
              {/* <CameraScan /> */}
            </View>
          </View>
          {/* Challan Modal */}
          <ChallanForm po={poNumber} isEmptyVatAmount={isEmptyVatAmount} />

          {/* GRN Review Modal */}
          <GrnReview
            grnItems={grnItems}
            grnInfo={grnSummery}
            enableGrnButton={enableGrnButton}
            documentInfo={{ po: poNumber, dn: dnNumber }}
            totalItems={totalItems}
            minGrnVatAmount={minGrnVatAmount}
            visibleDnGrnButton={dnNumber && hasGrnItems && articles.length === 0}
            onPress={createGrn}
            screen='approval'
          />

          <Modal
            isOpen={grnResult !== null}
            header='GRN is Created successfully'
            onPress={() => {
              setGrnResult(null);
              navigation.replace("Approvals");
            }}
          >
            <View className="modal-content flex-col items-center justify-center mt-2">
              <Text className="text-5xl text-green-500 p-2">
                📜
              </Text>

              <Text className="text-base text-black font-semibold mb-2">
                GRN Number
              </Text>
              <TextInput
                className="w-full border border-gray-100 rounded focus:border-gray-100"
                editable={Boolean(grnResult)}
                value={grnResult?.data?.grnNumber || ''}
              />
              {/* <View className="buttons mx-auto mt-2">
                <Button
                  text="Go to receiving"
                  size="tiny"
                  variant="primary"
                  edge="capsule"
                  onPress={() => navigation.replace('Receiving', { document: poNumber })}
                />
              </View> */}
            </View>
          </Modal>
        </View>
      )}
    </>
  )
}

export default DocumentDetails;