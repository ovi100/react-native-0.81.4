import React, { useLayoutEffect, useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard } from 'react-native';
import { FalseHeader, Input } from '../../../../components';
import { useAppContext, useBackHandler } from '../../../../hooks';
import { Search } from 'lucide-react-native';
import { Scan } from '../../../../components/animations';
import { toast } from '../../../../utils';
import { API_URL } from '../../../../app-config';

const Receiving = ({ navigation, route }) => {
  const { authInfo } = useAppContext();
  const { user } = authInfo;
  const [search, setSearch] = useState('');
  const [isPo, setIsPo] = useState(false);
  const [isDn, setIsDn] = useState(false);
  const [isChildPack, setIsChildPack] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const poRegex = /^[1-467][0-9]{9}$/;
  const dnRegex = /^12[0-9]{7}$/;


  // Custom hook to navigate screen
  useBackHandler('Home');

  useLayoutEffect(() => {
    let screenOptions = {};
    if (user.active_site) {
      const regex = /^(dk|ds)/i;
      screenOptions.headerTitle = regex.test(user?.active_site.toLowerCase())
        ? `${user?.active_site.toLowerCase().slice(0, 2) === 'dk' ? 'DC' : 'DS'
        } Receiving`
        : 'Outlet Receiving';
    }
    navigation.setOptions(screenOptions);
  }, [navigation, user.active_site]);

  const checkDocument = async (document, type) => {

    if (type === 'dn') {
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
            let params = {};
            if (type === 'po') {
              params = {
                po: result.documentNumber,
              };
            } else if (type === 'dn') {
              params = {
                dn: result.documentNumber,
              };
            } else {
              params = {
                childPackNumber: result.documentNumber,
              };
            }
            navigation.replace('DocumentDetails', params);

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
    const isValidPo = poRegex.test(search);
    setIsPo(isValidPo);
    const isValidDn = dnRegex.test(search);
    setIsDn(isValidDn);
    const isValidChildPack =
      search.includes(user.active_site.toUpperCase()) &&
      search.length === 13;
    setIsChildPack(isValidChildPack);

    if (!search) {
      toast('Please enter a PO, DN or child pack number');
      setSearch('');
      return;
    } else if (search && !isValidPo && !isValidDn && !isValidChildPack) {
      toast('Enter a valid PO, DN or child pack number');
      return;
    } else {
      const type = isValidPo ? 'po' : isValidDn ? 'dn' : 'childPack'
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
            placeholder={`Search by ${user?.active_site.toLowerCase().slice(0, 2) === 'dk'
              ? 'po'
              : 'po or dn'
              } number`}
            onChangeText={value => setSearch(value)}
            value={search}
          />
        </View>
        <View className="content h-4/5 justify-center">
          {isChecking ? (
            <View className="bg-white">
              <ActivityIndicator size="large" color="#EB4B50" />
              <Text className="mt-4 text-gray-400 text-sm xs:text-base text-center">
                {isPo && 'Checking PO number......'}
                {isDn && 'Checking DN number......'}
                {isChildPack && 'Checking child pack number......'}
              </Text>
            </View>
          ) : (
            <View className="relative">
              <Scan styles="w-52 xs:w-54 h-52 xs:h-54" />
              <Text className="text-base xs:text-lg text-gray-400 text-center font-bold uppercase">
                Scan or Search
              </Text>
              <Text className="text-base xs:text-lg text-gray-400 text-center font-semibold mt-3">
                PO, DN or Child Pack Number
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

export default Receiving;