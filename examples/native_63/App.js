import React, { useEffect, useState } from 'react';
import {
  Button,
  StatusBar,
  Switch,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import {
  NimbblReactNative,
  getListOfUpiIntent,
  // openUpiApp,
} from 'nimbbl-react-native';

import {
  apiHost,
  checkoutHost,
  environments,
  productDetails,
} from './constants';
import { dependencies } from './package.json';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [showCheckout, setShowCheckout] = useState(false);
  const [response, setResponse] = useState('{}');
  const [orderId, setOrderId] = useState('');
  const [environment, setEnvironment] = useState('pp');
  const [appLists, setAppLists] = useState(null);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const {
    'react-native': reactNative,
    react,
    'react-native-webview': reactNativeWebview,
  } = dependencies;

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
    // required
    show: showCheckout,
    access_key: 'access_key_81x7ByYkREmW205N',
    orderId: orderId,
    callback_url: 'https://www.example.com/',
    host: checkoutHost[environment],
    onClose: (data) => {
      console.log('response: ', data);
      setResponse(data);
      setShowCheckout(false);
    },
    // net banking
    // payment_mode_code: 'net_banking',
    // bank_code: 'sbi',

    // card
    // payment_mode_code: 'card',

    // wallet
    // payment_mode_code: 'wallet',
    // wallet_code: 'phonepe',

    // upi
    payment_mode_code: 'upi',
    payment_flow: 'collect',
    upi_id: 'pikuafk@pingpay',
    // upi_app_code: 'phonepe',
    // optional
    environment: environment,
  };

  const getApps = async () => {
    const result = await getListOfUpiIntent();
    const apps = result?.UPIApps || [];

    setAppLists(apps);
  };

  // const openApp = async () => {
  //   const appData = {
  //     package_name: 'com.phonepe.app',
  //     url: 'upi://pay?pa=shopnimbbltech.payu@indus&pn=Bigital+Technologies+Pvt+ltd&tr=17635538667&am=3.00&cu=INR&tn=UPI+Transaction+for+PPPL17635538667290623175139',
  //   };

  //   const status = await openUpiApp(appData);
  //   console.log('status', status);
  // };

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

        <Button title="Show available upi apps" onPress={getApps} />

        <View style={{ marginVertical: 8 }}>
          {Array.isArray(appLists) ? (
            appLists?.length > 0 ? (
              appLists?.map((app) => <Text key={app.name}>{app.name}</Text>)
            ) : (
              <Text>No upi apps found</Text>
            )
          ) : (
            <></>
          )}
        </View>

        <Button title="Create Order" onPress={createOrder} />

        <Text style={{ marginVertical: 8 }}>OrderId: {orderId}</Text>

        {/* <Button title="Open App" onPress={openApp} /> */}

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

      <NimbblReactNative {...nativeSdkProps} />
    </>
  );
};

export default App;
