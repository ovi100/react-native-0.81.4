import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard } from 'react-native';
import { FalseHeader, Input } from '../../../../components';
import { useAppContext, useBackHandler } from '../../../../hooks';
import { Search } from 'lucide-react-native';
import { Scan } from '../../../../components/animations';
import { toast } from '../../../../utils';
import { API_URL } from '../../../../app-config';

const Packing = ({ navigation, route }) => {
  const { authInfo } = useAppContext();
  const { user } = authInfo;
  const [search, setSearch] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  // const dnRegex = /^12[0-9]{7}$/;

  // Custom hook to navigate screen
  useBackHandler('Home');

  const checkDocument = async (document, type) => {

    if (document.length === 9) {
      document = '0' + document;
    }

    try {
      setIsChecking(true);
      await fetch(API_URL + `api/service/check-document/?documentNumber=${document}&documentType=${type}&site=${user.active_site}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          }
        })
        .then(response => response.json())
        .then(async result => {
          if (result.success) {
            navigation.replace('PickingDetails');
          } else {
            let message = result.message.trim();
            message = message.includes('Could not open connection')
              ? 'SAP server is off 🙁'
              : message;
            toast(message);
          }
        })
        .catch(error => {
          const message = error.message.includes('JSON Parse error')
            ? 'Server is down'
            : error.message;
          toast('customError', message);
        });
    } catch (error) {
      toast(error.message);
    } finally {
      setIsChecking(false);
    }
  };

  const searchDocument = async () => {

    if (!search) {
      toast('Please enter a DN or short number');
      setSearch('');
      return;
    } else if (search && isNaN(search)) {
      toast('Enter a valid DN or short number');
      return;
    } else {
      const type = 'picking'
      Keyboard.dismiss();
      await checkDocument(search, type);
    }
  };

  return (
    <KeyboardAvoidingView
      className="bg-white flex-1 px-4"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <FalseHeader />
      <View className="flex-1">
        {/* Search Box */}
        <View className="search">
          <Input
            icon={<Search size={24} color="#64748b" />}
            onIconPress={() => searchDocument()}
            iconPosition="right"
            placeholder="Search by dn or short number"
            onChangeText={value => setSearch(value)}
            value={search}
          />
        </View>
        <View className="content h-3/5 justify-center">
          {isChecking ? (
            <View className="bg-white">
              <ActivityIndicator size="large" color="#EB4B50" />
              <Text className="mt-4 text-gray-400 text-sm xs:text-base text-center">
                Checking PO number......
              </Text>
            </View>
          ) : (
            <View className="relative">
              <Scan styles="w-52 xs:w-54 h-52 xs:h-54" />
              <Text className="text-base xs:text-lg text-gray-400 text-center font-bold uppercase">
                Scan or Search
              </Text>
              <Text className="text-base xs:text-lg text-gray-400 text-center font-semibold mt-3">
                DN or Short Number
              </Text>
            </View>
          )}

        </View>
        {/* <CameraScan /> */}
      </View>
      {/* <CustomToast /> */}
    </KeyboardAvoidingView>
  )
}

export default Packing;