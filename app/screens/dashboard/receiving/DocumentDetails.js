import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Button, FalseHeader, Ribbon } from '../../../../components';
import { useAppContext, useBackHandler } from '../../../../hooks';
import { FlatListStyle, serverMessage, toast } from '../../../../utils';
import { getStorage } from '../../../../utils/storage';
import { useFocusEffect } from '@react-navigation/native';
import { API_URL } from '../../../../app-config';
import { EmptyBox } from '../../../../components/animations';
import ChallanForm from './ChallanForm';

const DocumentDetails = ({ navigation, route }) => {
  const { screen, po, dn, childPack } = route.params;
  const { authInfo, challanInfo } = useAppContext();
  const { user } = authInfo;
  const {
    setChallanModal,
    challans,
    setChallans,
    setGrnModal,
    enableGrnReview,
    setEnableGrnReview,
  } = challanInfo;
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [articles, setArticles] = useState([]);
  const [grnItems, setGrnItems] = useState([]);
  // const [documentDetails, setDocumentDetails] = useState(null);
  const [pressMode, setPressMode] = useState(false);
  const DOC_TYPE = po ? "po" : dn ? "dn" : childPack ? "child" : null;
  const tableHeader = po
    ? ['Article Info', 'PO Qty', 'GRN Qty', 'REM Qty']
    : ['Article Info', 'Quantity', 'Action'];

  // Custom hook to navigate screen
  useBackHandler(screen);

  const customHeader = useMemo(
    () => (
      <View className="text px-1 xs:px-2">
        {po && (
          <Text className="text-sm xs:text-base text-sh text-center font-medium">
            {`PO ${po} Details`}
          </Text>
        )}
        {dn && (
          <>
            {childPack && (
              <Text className="text-sm xs:text-base text-sh text-center font-medium">
                {`Pack ${childPack} Details`}
              </Text>
            )}
            <Text
              className={`${childPack ? 'text-xs' : 'text-sm xs:text-base'
                }  text-sh text-center font-medium`}>
              {`DN ${dn} Details`}
            </Text>
          </>
        )}

      </View>
    ),
    [childPack, dn, po]
  );

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: () => customHeader });
  }, [customHeader, navigation]);

  const endpoint = useMemo(() => {
    if (!DOC_TYPE) return null;
    if (DOC_TYPE === "po") return `${API_URL}api/po/receiving-list/${po}`;
    if (DOC_TYPE === "dn") return `${API_URL}api/dn/receiving-list/${dn}`;
    if (DOC_TYPE === "child") return `${API_URL}api/child-pack/receiving-list/${childPack}`;
    return null;
  }, [DOC_TYPE, childPack, dn, po]);

  useFocusEffect(
    useCallback(() => {
      const getAsyncStorage = async () => {
        const [press] =
          await Promise.all([
            getStorage('pressMode'),
          ]);
        setPressMode(press);

      };
      getAsyncStorage();
    }, [])
  );

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

          const items = data?.itemList ?? [];
          const grnList = items.filter(item => item.currentReceivedQuantity > 0);
          setGrnItems(grnList);
          const filteredList = items.filter(item => item.quantity !== item.totalReceivedQuantity);
          setArticles(filteredList);
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
    }, [endpoint, user.token])
  );

  const renderTableHeader = item => {
    const poStyles = `${item === 'Article Info' ? 'w-2/5' : 'w-1/5'}`;
    const dnStyles = `${item === 'Action' ? 'w-1/4 xs:w-1/5' : 'w-[37.5%] xs:w-2/5'}`;

    return (
      <Text
        className={`${po ? poStyles : dnStyles} text-white text-xs xs:text-sm text-center font-bold`}
        key={item}>
        {item}
      </Text>
    );
  };

  const renderPoItem = ({ item }) => {
    // const isLocal = Boolean(!importedList.includes(Number(item.material)));
    // const isLowItem = lowSaleGpList.includes(item.material);
    const notSameSite = item.plant !== user.active_site;
    const isPressMood = pressMode || item.isItemPressable;
    const Wrapper = isPressMood ? TouchableOpacity : View;

    const getRemainingQuantity = () => {
      const remQty = (item.grnQuantity + item.totalReceivedQuantity) >= item.grnQuantity ?
        item.quantity - (item.grnQuantity + item.totalReceivedQuantity) :
        item.grnQuantity >= item.totalReceivedQuantity ? item.quantity - item.grnQuantity
          : item.quantity - item.totalReceivedQuantity;
      return remQty;
    };

    const params = {
      ...item,
      remainingQuantity: getRemainingQuantity(),
      po,
      dn,
      childPack,
      site: user.active_site,
      token: user.token
    }
    return (
      <Wrapper
        key={item.poItem}
        onPress={() =>
          notSameSite
            ? toast(`Article ${item.material} is not for ${user.active_site}`)
            : navigation.replace('ArticleDetails', params)
        }
        className={`relative overflow-hidden flex-row items-center border 
          ${notSameSite ? 'border-red-500' : 'border-tb'} rounded-lg mt-2.5 px-3 py-2`}>
        <View className="w-2/5">
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
          className="w-1/5 text-black text-xs xs:text-sm text-center"
          numberOfLines={1}>
          {item.quantity}
        </Text>
        <Text
          className="w-1/5 text-black text-xs xs:text-sm text-center"
          numberOfLines={1}>
          {item.grnQuantity}
        </Text>
        <Text
          className="w-1/5 text-blue-600 text-sm xs:text-base text-center"
          numberOfLines={1}>
          {getRemainingQuantity()}
        </Text>

        {item.isItemPressable && <Ribbon label="Loose" />}
        {/* {isLowItem && <Ribbon label="Low GP" />} */}
      </Wrapper>
    );
  };

  let grnSummery = {};

  // GRN Summery
  if (grnItems.length > 0) {
    grnSummery = grnItems.reduce(
      (acc, curr, i) => {
        acc.totalItems = i + 1;
        acc.totalPrice += curr.quantity * curr.unitPrice;
        acc.totalVatAmount += curr.unitVat;
        acc.totalNetAmount += curr.quantity * curr.netPrice;
        return acc;
      },
      { totalItems: 0, totalPrice: 0, totalVatAmount: 0, totalNetAmount: 0 },
    );
  };

  const totalChallanAmount = () => {
    let amount = 0;
    if (challans.length > 0) {
      amount = challans.reduce((total, item) => {
        const a = parseFloat(item.vatAmount);
        return total + (isNaN(a) ? 0 : a);
      }, 0);
    };
    return amount;
  };

  const totalVatAmount = totalChallanAmount();
  const totalVatAmountPercent = grnSummery?.totalVatAmount * (2 / 100);
  const minGrnVatAmount = grnSummery?.totalVatAmount - totalVatAmountPercent;
  const maxGrnVatAmount = grnSummery?.totalVatAmount + totalVatAmountPercent;
  const isValidVatAmount = totalVatAmount >= minGrnVatAmount;

  const hasGrnItems = grnItems.length > 0;
  // const hasVendorDetails =
  //   (vendorDetails && signMode) || !signMode || signMode === null;
  const isEmptyVatAmount = grnSummery?.totalVatAmount === 0;

  const enableGrnButton = (hasGrnItems && isValidVatAmount) || isEmptyVatAmount;

  return (
    <>
      {isLoading && (
        <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-950">
          <ActivityIndicator size="large" color="#EB4B50" />
          <Text className="mt-4 text-gray-400 text-base text-center">
            Loading {po ? 'po' : dn ? 'dn' : 'child pack'} data. Please wait......
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

              {po && hasGrnItems && (
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
              {dn && articles.length === 0 && hasGrnItems && (
                <View className="button">
                  <Button
                    text={isButtonLoading ? '' : 'Review GRN'}
                    variant="brand"
                    loading={isButtonLoading}
                    onPress={() => setGrnModal(true)}
                  />
                </View>
              )}
              {/* <CameraScan /> */}
            </View>
          </View>
          {/* Challan Modal */}
          {po && (
            <ChallanForm po={po} isEmptyVatAmount={isEmptyVatAmount} />
          )}
        </View>
      )}
    </>
  )
}

export default DocumentDetails;