import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { API_URL } from '@env';
import { useAppContext } from '../../../../../hooks';
import { Button, Modal } from '../../../../../components';
import { CloseCircle, Trash } from '../../../../../icons';
import { height } from '../../../../../utils';
import ChallanInfo from './ChallanInfo';

const GrnReview = ({
  user,
  enableGrnButton,
  documentInfo,
  grnInfo,
  totalItems,
  minGrnVatAmount,
  grnItems,
  visibleDnGrnButton,
  visiblePoGrnButton,
  checkGrn,
  openVendorForm,
  onRefresh,
}) => {
  const { challanInfo } = useAppContext();
  const { challans, setChallans, setEnableGrnReview, grnModal, setGrnModal } =
    challanInfo;
  const [isRemovingGrnItem, setIsRemovingGrnItem] = useState(false);
  const [removingGrnItem, setRemovingGrnItem] = useState({});
  const { po, dn } = documentInfo;
  const tableHeader = po
    ? ['Code', 'Qty', 'Vat(%)', 'NP(৳)', 'Action']
    : ['#', 'Code', 'Qty'];

  const calculateVat = () => {
    let amount = 0;
    if (challans.length > 0) {
      amount = challans.reduce((total, item) => {
        const amount = parseFloat(item.vatAmount);
        return total + (isNaN(amount) ? 0 : amount);
      }, 0);
    }

    return amount;
  }

  const totalVatAmount = calculateVat();

  const infoTitle = `${challans.length
    } Challan:- ৳ ${totalVatAmount?.toLocaleString()}   CV:- ৳ ${grnInfo?.totalVatAmount?.toLocaleString()}`;

  const removeAllGrnItem = async () => {
    let postData = { po, userId: user._id, userName: user.name };

    try {
      setIsRemovingGrnItem(true);
      await fetch(API_URL + 'api/service/removeFullShelvingTempData', {
        method: 'PATCH',
        headers: {
          authorization: user.token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })
        .then(response => response.json())
        .then(async result => {
          if (result.status) {
            onRefresh();
            setChallans([]);
            setGrnModal(false);
            setEnableGrnReview(false);
          } else {
            toast(result.message);
          }
        })
        .catch(error => {
          const errorMessage = error.message.includes('JSON Parse error')
            ? 'Server is down'
            : error.message;
          toast(errorMessage);
        });
    } catch (error) {
      toast(error.message);
    } finally {
      setIsRemovingGrnItem(false);
    }
  };

  const removeGrnItem = async item => {
    let postData = {
      po: item.po,
      documentItem: item.poItem,
      material: item.material,
      quantity: item.quantity,
      userId: user._id,
      userName: user.name,
    };

    try {
      setRemovingGrnItem(item);
      await fetch(API_URL + 'api/service/removeShelvingTempData', {
        method: 'PATCH',
        headers: {
          authorization: user.token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })
        .then(response => response.json())
        .then(async result => {
          if (result.status) {
            onRefresh();
            setGrnModal(false);
          } else {
            toast(result.message);
          }
        })
        .catch(error => {
          const errorMessage = error.message.includes('JSON Parse error')
            ? 'Server is down'
            : error.message;
          toast(errorMessage);
        });
    } catch (error) {
      toast(error.message);
    } finally {
      setRemovingGrnItem({});
    }
  };

  const renderModalItem = ({ item }) => {
    const calculateItemPrice = () => {
      let itemNetAmount = 0;
      if (item.unitVat === 0) {
        itemNetAmount = 0;
      } else if (item.logicVat !== null) {
        itemNetAmount = ((item.logicVat + item.unitPrice) * item.quantity).toFixed(2);
      } else {
        itemNetAmount = ((item.unitVat + item.unitPrice) * item.quantity).toFixed(2);
      }
      return itemNetAmount;
    }

    return (
      <View
        className="bg-gray-100 flex-row items-center mt-1 p-2.5"
        key={po ? item.poItem : item.dnItem}>
        {!po && (
          <Text className="w-1/3 text-sh text-[10px] xs:text-xs text-center">
            {Number(item.dnItem) / 10}
          </Text>
        )}
        <Text
          className={`${!po ? 'w-1/3' : 'w-1/5'
            } text-sh text-[10px] xs:text-xs text-center`}>
          {item.material}
        </Text>
        {/* {po && (
        <Text className="w-1/5 text-sh text-[10px] xs:text-xs text-center">
          {item.netPrice.toFixed(2)}
        </Text>
      )} */}
        <Text
          className={`${!po ? 'w-1/3' : 'w-1/5'
            } text-sh text-[10px] xs:text-xs text-center`}>
          {item.quantity}
        </Text>
        {po && (
          <Text className="w-1/5 text-sh text-[10px] xs:text-xs text-center">
            {item.itemVatAmount ? item.itemVatAmount.toFixed(2) : 0}
          </Text>
        )}
        {po && (
          <Text className="w-1/5 text-sh text-[10px] xs:text-xs text-center">
            {calculateItemPrice()}
          </Text>
        )}
        {po && (
          <View className="w-1/5 mx-auto">
            <Button
              text=""
              type="icon"
              variant="danger"
              icon={
                item.poItem === removingGrnItem?.poItem ? null : (
                  <Trash size={4.5} color="black" />
                )
              }
              loading={item.poItem === removingGrnItem?.poItem}
              onPress={() => removeGrnItem(item)}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      isOpen={grnModal}
      header="Review GRN"
      closeIcon={<CloseCircle size={6} color="#000" />}
      onPress={() => setGrnModal(false)}>
      <View className="content justify-between">
        <View className="grn-list-table">
          <Text className="text-xs text-black text-center font-semibold pb-1">
            PO: {po}
          </Text>
          <View className="challan-info">
            <ChallanInfo title={infoTitle} route="grn" />
          </View>
          <View className="message flex-row items-center justify-between mb-1 sm:mb-2">
            <Text className="text-xs xs:text-sm text-black font-semibold capitalize">
              received {grnInfo.totalItems}/{totalItems}
            </Text>
            <TouchableOpacity
              className="bg-red-500 rounded px-2 py-1"
              onPress={() => (!isRemovingGrnItem ? removeAllGrnItem() : null)}>
              <Text className="text-white text-xs text-center font-medium capitalize">
                {isRemovingGrnItem ? 'removing...' : 'remove all'}
              </Text>
            </TouchableOpacity>
          </View>
          <View className="table-header bg-th flex-row items-center p-2">
            {tableHeader.map(th => (
              <Text
                key={th}
                className={`${po ? 'w-1/5' : 'w-1/3'
                  } text-white text-xs text-center`}>
                {th}
              </Text>
            ))}
          </View>
          <FlatList
            data={grnItems}
            renderItem={renderModalItem}
            keyExtractor={item => (item.po ? item.poItem : item.dnItem)}
            initialNumToRender={10}
            style={{ maxHeight: height * 0.4 }}
          // onEndReached={handleEndReached}
          />
          <View className="table-footer flex-row items-center justify-between mt-2 px-2">
            <View className="flex-row items-center justify-between mt-2">
              <Text className="text-black text-xs font-bold">Total TP:</Text>
              <Text className="text-black text-xs ml-1">
                {grnInfo.totalPrice?.toLocaleString()}
              </Text>
            </View>
            {grnInfo.totalPrice > 0 && (
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-black text-xs font-bold">
                  Total Amount:
                </Text>
                <Text className="text-black text-xs sm:text-sm ml-1">
                  {grnInfo.totalNetAmount.toFixed(2)}
                </Text>
              </View>
            )}
          </View>

          {totalVatAmount < minGrnVatAmount && (
            <Text className="bg-red-400 text-white text-xs sm:text-sm text-center rounded p-1 sm:p-2 mt-4 sm:mt-8">
              * Vendor VAT amount is less than calculated VAT amount
            </Text>
          )}
        </View>
        <View className="button w-3/5 mx-auto mt-5">
          {enableGrnButton && (
            <Button
              size="small"
              variant="primary"
              text="Send to GRN panel"
              // onPress={() => checkStorageLocation()}
              onPress={() => checkGrn()}
            />
          )}
          {/* {dn && hasGrnItems && articles.length === 0 && ( */}
          {visibleDnGrnButton && (
            <Button
              size="small"
              variant="primary"
              text="Send to GRN panel"
              // onPress={() => checkStorageLocation()}
              onPress={() => checkGrn()}
            />
          )}
          {/* {po && !vendorDetails && signMode && ( */}
          {visiblePoGrnButton && (
            <Button
              size="small"
              variant="primary"
              text="Add Vendor Details"
              // onPress={() => setBottomModalVisible(true)}
              onPress={() => openVendorForm(true)}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default GrnReview;
