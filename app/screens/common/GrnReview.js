import React from 'react';
import { View, Text, FlatList } from 'react-native';
import ChallanInfo from './ChallanInfo';
import { CircleX } from 'lucide-react-native';
import { useAppContext } from '../../../hooks';
import { Button, Modal } from '../../../components';
import { height } from '../../../utils';

const GrnReview = ({
  grnItems,
  grnInfo,
  enableGrnButton,
  documentInfo,
  totalItems,
  minGrnVatAmount,
  onPress,
  visibleDnGrnButton,
  screen = 'pre-grn'
}) => {
  const { challanInfo } = useAppContext();
  const { challans, grnModal, setGrnModal } = challanInfo;
  const { po, dn } = documentInfo;
  const tableHeader = po
    ? ['Code', 'RCV Qty', 'Total NP(৳)', 'Total Vat(%)']
    : ['#', 'Code', 'Qty'];

  const calculateVat = () => {
    let amount = 0;
    if (challans.length > 0) {
      amount = challans.reduce((total, item) => {
        const a = parseFloat(item.totalVatAmount);
        return total + (isNaN(a) ? 0 : a);
      }, 0);
    }

    return amount;
  }

  const totalVatAmount = calculateVat();

  // console.log(grnInfo)

  const infoTitle = `${challans.length
    } Challan:- ৳ ${totalVatAmount?.toLocaleString()}   CV:- ৳ ${grnInfo?.totalVatAmount?.toLocaleString()}`;

  const renderModalItem = ({ item }) => {

    return (
      <View
        className="bg-gray-100 flex-row items-center mt-1 p-2.5"
        key={po ? item.poItem : item.dnItem}>
        {dn && (
          <Text className="w-1/3 text-sh text-[10px] xs:text-xs text-center">
            {Number(item.dnItem) / 10}
          </Text>
        )}
        <Text
          className={`${!po ? 'w-1/3' : 'w-1/4'
            } text-sh text-[10px] xs:text-xs text-center`}>
          {item.material}
        </Text>
        <Text
          className={`${!po ? 'w-1/3' : 'w-1/4'
            } text-sh text-[10px] xs:text-xs text-center`}>
          {item.inputQuantity}
        </Text>
        {po && (
          <Text className="w-1/4 text-sh text-[10px] xs:text-xs text-center">
            {(item.netPrice * item.inputQuantity).toFixed(2)}
          </Text>
        )}
        {po && (
          <Text className="w-1/4 text-sh text-[10px] xs:text-xs text-center">
            {(item.unitVat * item.inputQuantity).toFixed(2)}
          </Text>
        )}
      </View>
    );
  };


  return (
    <Modal
      isOpen={grnModal}
      header="Review GRN"
      closeIcon={<CircleX size={24} color="#000" />}
      onPress={() => setGrnModal(false)}>
      <View className="content justify-between">
        <View className="grn-list-table">
          <Text className="text-xs text-black text-center font-semibold pb-1">
            PO: {po}
          </Text>
          <View className="challan-info">
            <ChallanInfo title={infoTitle} route="grn" />
          </View>
          <Text className="text-xs xs:text-sm text-black text-left font-semibold capitalize mb-2">
            received {grnInfo.totalItems}/{totalItems}
          </Text>
          <View className="table-header bg-th flex-row items-center p-2">
            {tableHeader.map(th => (
              <Text
                key={th}
                className={`${po ? 'w-1/4' : 'w-1/3'
                  } text-white text-xs text-center`}>
                {th}
              </Text>
            ))}
          </View>
          <FlatList
            data={grnItems}
            renderItem={renderModalItem}
            keyExtractor={item => (po ? item.poItem : item.dnItem)}
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
              text={screen === "approval" ? "Create GRN" : "Send to GRN panel"}
              onPress={() => onPress()}
            />
          )}
          {visibleDnGrnButton && (
            <Button
              size="small"
              variant="primary"
              text={screen === "approval" ? "Create GRN" : "Send to GRN panel"}
              onPress={() => onPress()}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default GrnReview;
