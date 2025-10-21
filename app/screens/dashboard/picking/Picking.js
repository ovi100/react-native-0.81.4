import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard } from 'react-native';
import { FalseHeader, Input } from '../../../../components';
import { useAppContext, useBackHandler, useBarcodeScan } from '../../../../hooks';
import { Search } from 'lucide-react-native';
import { Scan } from '../../../../components/animations';
import { toast } from '../../../../utils';
import { API_URL } from '../../../../app-config';

const Picking = ({ navigation, route }) => {
  const { authInfo } = useAppContext();
  const { user } = authInfo;
  const [search, setSearch] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const { barcode } = useBarcodeScan();

  // const dnRegex = /^12[0-9]{7}$/;

  // Custom hook to navigate screen
  useBackHandler('Home');

  const checkDocument = useCallback(async (document, type) => {

    if (document.length === 9) {
      document = '0' + document;
    }

    try {
      setIsChecking(true);
      await fetch(API_URL + `api/sto/picking-packing-items?documentNumber=${document}&site=${user.active_site}&type=${type}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          }
        })
        .then(response => response.json())
        .then(result => {
          console.log(result)
          if (result.success) {
            navigation.replace('PickingDetails', { dn: result.data.dnNumber, site: result.data.site });
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
          toast(message);
        });
    } catch (error) {
      toast(error.message);
    } finally {
      setIsChecking(false);
    }
  }, [navigation, user.active_site, user.token]);

  useEffect(() => {
    if (barcode) {
      if (isNaN(barcode)) {
        toast('Scan a valid DN or short number');
        return;
      }
      if (barcode.length < 9 || barcode.length < 3) {
        toast('Scan a valid DN or short number');
        return;
      }
      if (user) {
        checkDocument(barcode, 'picking');
        setSearch('');
      }
    }
  }, [barcode, checkDocument, user]);

  const searchDocument = async () => {
    if (!search) {
      toast('Please enter a DN or short number');
      setSearch('');
      return;
    } else if (isNaN(search)) {
      toast('Enter a valid DN or short number');
      return;
    } else if (search.length < 9 || search.length < 3) {
      toast('Enter a valid DN or short number');
      return;
    } else {
      Keyboard.dismiss();
      await checkDocument(search, 'picking');
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

export default Picking;