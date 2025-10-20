import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { FlatListStyle, serverMessage, toast } from '../../../../utils';
import { useAppContext } from '../../../../hooks';
import { API_URL } from '../../../../app-config';
import { useFocusEffect } from '@react-navigation/native';
import { FalseHeader } from '../../../../components';
import { EmptyBox } from '../../../../components/animations';

const Approvals = ({ navigation }) => {
  const { authInfo } = useAppContext();
  const { user } = authInfo;
  const [isLoading, setIsLoading] = useState(false);
  // const [search, setSearch] = useState('');
  const [documentList, setDocumentList] = useState([]);
  const tableHeader = ['Doc Info', 'Sku', 'Date'];



  useFocusEffect(
    useCallback(() => {
      // Fetching document details
      const fetchData = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(API_URL + 'api/po/get-pending-for-grn', {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json",
            },
          });

          const json = await response.json();
          // console.log(json);

          if (!response.ok || !json?.success) {
            throw new Error(serverMessage(json?.message || response.statusText));
          }

          setDocumentList(json.data || []);
        } catch (err) {
          toast(serverMessage(err.message));
        } finally {
          setIsLoading(false);
        }
      };
      if (user) {
        fetchData();
      }
    }, [user])
  );

  const renderPoItem = ({ item }) => (
    <TouchableOpacity
      key={item.poNumber}
      onPress={() => navigation.replace('ApprovalsDocumentDetails', item)
      }
      className={`flex-row items-center border border-tb rounded-lg mt-2.5 px-3 py-3`}>
      <Text className="w-1/3 text-black text-xs xs:text-sm" numberOfLines={1}>
        {item.poNumber}
        {'\n'}
        {item.poGrnNumber !== null && `GRN No: ${item.poGrnNumber}`}
      </Text>
      <Text
        className="w-1/3 text-black text-xs xs:text-sm text-center"
        numberOfLines={1}>
        {item.sku}
      </Text>
      <Text
        className="w-1/3 text-black text-xs xs:text-sm text-center">
        {new Date(item.createdAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
        {'\n'}
        {item.createdBy}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      {isLoading && (
        <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-950">
          <ActivityIndicator size="large" color="#EB4B50" />
          <Text className="mt-4 text-gray-400 text-base text-center">
            Loading approval data. Please wait......
          </Text>
        </View>
      )}
      {!isLoading && !documentList.length && (
        <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-950">
          <EmptyBox styles="w-32 sm:w-36 h-32 sm:h-36" />
          <Text className="mt-4 text-gray-400 text-base sm:text-lg text-center">
            No article is found!
          </Text>
        </View>
      )}
      {!isLoading && documentList.length > 0 && (
        <View className="flex-1 bg-white dark:bg-neutral-950">
          <View className="flex-1 h-full px-2 sm:px-4">
            <FalseHeader />
            <View className="content flex-1 justify-between pb-2">
              <View className="table h-[85%] xs:h-[88%]">
                <View className="table-header flex-row bg-th text-center p-2">
                  {tableHeader.map(th => (
                    <Text
                      className="w-1/3 text-white text-xs xs:text-sm text-center font-bold"
                      key={th}>
                      {th}
                    </Text>
                  ))}
                </View>
                <FlatList
                  data={documentList}
                  renderItem={renderPoItem}
                  keyExtractor={item => item.poNumber}
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

              {/* {po && hasGrnItems && (
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
          )} */}
              {/* <CameraScan /> */}
            </View>
          </View>
        </View>
      )}
    </>
  )
}

export default Approvals;