import React, { useEffect, useState } from 'react';
import {
  Button,
  NativeModules,
  StatusBar,
  Text,
  useColorScheme,
  View,
  Switch,
} from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen';
import { NativeSdk } from 'nimbbl_react_native_sdk';

import { dependencies } from './package.json';

const { NimbblUPIHelperModule } = NativeModules;

const environments = ['prod', 'pp', 'qa3', 'qa1', 'qa2'];

const apiHost = {
  pp: 'https://apipp.nimbbl.tech/',
  prod: 'https://api.nimbbl.tech/',
  qa1: 'https://qa1api.nimbbl.tech/',
  qa2: 'https://qa2api.nimbbl.tech/',
  qa3: 'https://qa3api.nimbbl.tech/',
};

const checkoutHost = {
  pp: 'https://checkoutpp.nimbbl.tech/',
  prod: 'https://checkout.nimbbl.tech/',
  qa1: 'https://qa1checkout.nimbbl.tech/',
  qa2: 'https://qa2checkout.nimbbl.tech/',
  qa3: 'https://qa3checkout.nimbbl.tech/',
};

const productDetails = {
  amount_before_tax: 2.0,
  tax: 0,
  total_amount: 3.0,
  user: {
    email: 'abc@gmail.com',
    first_name: 'abc',
    last_name: null,
    country_code: '+91',
    mobile_number: '9004229994',
  },
  shipping_address: {
    street: 'L.N. Pappan Marg',
    landmark: 'Dr E Moses Rd',
    area: 'Worli',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400018',
    address_type: 'residential',
  },
  currency: 'INR',
  invoice_id: 'invoice_Ava' + Math.random(),
  referrer_platform: '',
  referrer_platform_identifer: '',
  order_line_items: [
    {
      sku_id: 'sku1',
      title: 'Burger',
      description: 'maharaja MaC',
      quantity: '1',
      rate: 1,
      amount_before_tax: '1',
      tax: '1',
      total_amount: '1',
      image_url:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7Ay5KWSTviUsTHZ7m_-YJvOlPMwGhZIPuzobqynBqQbQP1_KWCuc8qlwREOiTP38Hs_fLTJYl&usqp=CAc',
    },
  ],
  bank_account: {
    account_number: '037801513988',
    name: 'Vasudha Maini',
    ifsc: 'ICIC0000378',
  },
  custom_attributes: {
    Name: 'abc',
    Place: 'Delhi',
    Animal: 'Tiger',
    Thing: 'Pen',
  },
};

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [showCheckout, setShowCheckout] = useState(false);
  const [response, setResponse] = useState('{}');
  const [orderId, setOrderId] = useState('');
  const [environment, setEnvironment] = useState('qa1');

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const {
    'react-native': reactNative,
    react,
    'react-native-webview': reactNativeWebview,
  } = dependencies;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await NimbblUPIHelperModule.sendUpiIntents();
        console.log('NimbblUPIHelperModule', res);
      } catch (e) {
        console.log('error', e);
      }
    };

    fetchData();
  }, []);

  const createOrder = async () => {
    const tokenResponse = await fetch(
      apiHost[environment] + 'api/v2/generate-token',
      {
        method: 'POST',
        body: JSON.stringify({
          access_key: 'access_key_81x7ByYkREmW205N',
          access_secret: 'access_secret_ArL0OKDKBGx5A0zP',
        }),
      },
    );

    const tokenData = await tokenResponse.json();
    const token = tokenData?.token || '';

    const orderResponse = await fetch(
      apiHost[environment] + 'api/v2/create-order',
      {
        method: 'POST',
        body: JSON.stringify(productDetails),
        headers: new Headers({
          Authorization: 'Bearer ' + token,
        }),
      },
    );
    const order = await orderResponse.json();

    console.log(order);
    setOrderId(order?.order_id || '');
  };

  const nativeSdkProps = {
    show: showCheckout,
    environment: environment,
    orderId: orderId,
    access_key: 'access_key_81x7ByYkREmW205N',
    access_secret: 'access_secret_ArL0OKDKBGx5A0zP',
    callback_url: 'https://www.google.com/',
    host: checkoutHost[environment],
    onClose: (data) => {
      console.log('response: ', data);
      setResponse(data);
      setShowCheckout(false);
    },
  };

  console.log(nativeSdkProps);

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View
        style={{
          backgroundColor: isDarkMode ? Colors.black : Colors.white,
          paddingLeft: 16,
          paddingRight: 16,
        }}>
        <Text style={{ marginTop: 24, fontSize: 24, fontWeight: '500' }}>
          Nimbbl React Native SDK Example
        </Text>

        <Text
          style={{
            marginTop: 16,
            marginBottom: 16,
            fontFamily: 'monospace',
            fontSize: 18,
            lineHeight: 26,
          }}>
          Dependencies:
          {JSON.stringify(
            {
              react,
              'react-native': reactNative,
              'react-native-webview': reactNativeWebview,
            },
            undefined,
            1,
          )}
        </Text>

        <View style={{ marginBottom: 16 }}>
          {environments.map((name) => {
            const isSelected = environment === name;

            return (
              <View
                key={name}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Text style={{ textTransform: 'uppercase' }}>{name}</Text>
                <Switch
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={isSelected ? '#f5dd4b' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() => {
                    setEnvironment(name);
                    setOrderId('');
                  }}
                  value={isSelected}
                />
              </View>
            );
          })}
        </View>

        <Button title="Create Order" onPress={createOrder} />

        <Text style={{ marginVertical: 8 }}>OrderId: {orderId}</Text>

        <Button
          disabled={!orderId}
          title="Show Checkout"
          onPress={() => {
            setShowCheckout((prev) => !prev);
          }}
        />

        <Text style={{ marginTop: 16, fontFamily: 'monospace' }}>
          response: {JSON.stringify(JSON.parse(response), null, 2)}
        </Text>
      </View>

      <NativeSdk {...nativeSdkProps} />
    </>
  );
};

export default App;
