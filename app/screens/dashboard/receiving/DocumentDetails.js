import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { FalseHeader, Ribbon } from '../../../../components';
import { useAppContext } from '../../../../hooks';
import { toast } from '../../../../utils';
import { getStorage } from '../../../../utils/storage';

const DocumentDetails = ({ navigation, route }) => {
  const { items, poNumber, receivingPlant, storageLocation, vendor } = route.params;
  const { authInfo } = useAppContext();
  const { user } = authInfo;
  const [pressMode, setPressMode] = useState(false);
  const tableHeader = poNumber
    ? ['Article Info', 'PO Qty', 'GRN Qty', 'REM Qty']
    : ['Article Info', 'Quantity', 'Action'];

  useEffect(() => {
    const getAsyncStorage = async () => {
      const [press] =
        await Promise.all([
          getStorage('pressMode'),
        ]);
      setPressMode(press);

    };
    getAsyncStorage();
  }, []);

  const renderTableHeader = item => {
    const poStyles = `${item === 'Article Info' ? 'w-2/5' : 'w-1/5'} text-xs`;
    const dnStyles = `${item === 'Action' ? 'w-1/4 xs:w-1/5' : 'w-[37.5%] xs:w-2/5'
      } text-xs`;

    return (
      <Text
        className={`${poNumber ? poStyles : dnStyles
          } text-white sm:text-sm text-center font-bold`}
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
      const remQty = item.grnQuantity >= item.totalReceivedQuantity
        ? item.quantity - item.grnQuantity
        : item.quantity - item.totalReceivedQuantity;
      return remQty;
    }


    return (
      <Wrapper
        key={item.poItem}
        onPress={() =>
          notSameSite
            ? toast(`Article ${item.material} is not for ${user.active_site}`)
            : navigation.replace('ArticleDetails', item)
        }
        className={`relative overflow-hidden flex-row items-center border 
          ${notSameSite ? 'border-red-500' : 'border-tb'} rounded-lg mt-2.5 px-3 py-2`}>
        <View className="w-2/5">
          <View className="flex-row items-center gap-x-1 mb-1">
            <Text className="text-black text-xs xs:text-sm" numberOfLines={1}>
              ({Number(item.poItem) / 10}) {item.material}
            </Text>
            {item.plant !== user.site && (
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

  return (
    <View className="bg-white flex-1">
      <View className="flex-1 h-full px-2 sm:px-4">
        <FalseHeader />
        <View className="content flex-1 justify-between pb-2">
          <View
            className={`table h-full`}>
            <View className="table-header flex-row bg-th text-center p-2">
              {tableHeader.map(th => renderTableHeader(th))}
            </View>
            <FlatList
              data={items}
              renderItem={renderPoItem}
              keyExtractor={item => item.poItem}
              initialNumToRender={10}
              // onEndReached={handleEndReached}
              // ListFooterComponent={items.length > 10 ? renderFooter : null}
              ListFooterComponentStyle={{ paddingVertical: 10 }}
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

          {/* {po && hasGrnItems && (
            <View className="button">
              {!enableGrnReview && (
                <Button
                  text={challans.length > 0 ? 'Edit Challan' : 'Add Challan'}
                  size={width > 460 ? 'large' : 'medium'}
                  variant="brand"
                  onPress={() => setChallanModal(true)}
                />
              )}
              {enableGrnReview && (
                <Button
                  text={isButtonLoading ? 'Sending GRN' : 'Review GRN'}
                  size={width > 460 ? 'large' : 'medium'}
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
                size={width > 460 ? 'large' : 'medium'}
                variant="brand"
                loading={isButtonLoading}
                onPress={() => setGrnModal(true)}
              />
            </View>
          )} */}
          {/* <CameraScan /> */}
        </View>
      </View>
    </View>
  )
}

export default DocumentDetails;