import React from 'react';
import { View, Text, Image, TouchableOpacity, FlatList } from 'react-native';
import { useAppContext } from '../../../../hooks';
import { CirclePlus, SquarePen, Trash } from 'lucide-react-native';
import { Accordion } from '../../../../components';

const ChallanInfo = ({ title, route }) => {
  const { challanInfo } = useAppContext();
  const { challans, editChallan, deleteChallan, setChallanModal, } = challanInfo;
  const tableHeader = ['Challan info', 'Amount', 'Action'];

  const renderItem = ({ item, index }) => (
    <View
      className="flex-row items-center justify-between border border-tb mt-2 px-3 py-1.5 rounded"
      key={index}>
      <View className="flex-row items-center">
        <Image source={{ uri: item.challanImageUrl }} className="w-10 h-10 rounded" />
        <View className="ml-2">
          <Text className="text-sm text-slate-700">{item.challanNumber}</Text>
          <Text className="text-sm text-slate-700">
            {new Date(item.challanDate).toLocaleDateString('en-Uk', { dateStyle: 'medium' })}
          </Text>
        </View>
      </View>
      <Text className="text-sm text-slate-700 text-center flex-1 justify-center flex-wrap">
        {Number(item.totalVatAmount).toLocaleString()}
      </Text>
      <View className="flex-row items-center justify-end">
        <TouchableOpacity onPress={() => editChallan(index, route)}>
          <SquarePen size={20} color="#3b82f6" />
        </TouchableOpacity>
        <TouchableOpacity className="ml-3" onPress={() => deleteChallan(index)}>
          <Trash size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const totalVatAmount = challans.reduce((total, item) => {
    const amount = parseFloat(item.totalVatAmount);
    return total + (isNaN(amount) ? 0 : amount);
  }, 0);

  const challanItem = {
    title:
      title ||
      `${challans.length} Challan:- ৳ ${totalVatAmount.toLocaleString()}`,
    content: (
      <View className="table">
        <View className="table-header bg-th flex-row items-center justify-between mt-2 px-3 py-1.5">
          {tableHeader.map(th => (
            <Text
              key={th}
              className="text-sm text-white text-center font-semibold">
              {th}
            </Text>
          ))}
        </View>
        <View className="table-body">
          <FlatList
            data={challans}
            renderItem={renderItem}
            keyExtractor={(_, i) => i.toString()}
          />
        </View>
        {route === 'grn' && (
          <View className="table-footer w-4/5 mx-auto mt-2">
            <TouchableOpacity
              className="bg-green-600 flex-row items-center justify-center gap-x-1 rounded px-2 py-1.5"
              onPress={() => setChallanModal(true)}>
              <CirclePlus size={20} color="#fff" />
              <Text className="text-white text-xs text-center font-medium capitalize">
                add another
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    ),
  };

  return <>{challans.length > 0 ? <Accordion item={challanItem} /> : null}</>;
};

export default ChallanInfo;
