import React, { useEffect, useRef, useState } from 'react';
import { Alert, Modal, useWindowDimensions } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { parse } from 'search-params';

import { callback_url, getUrls } from './constants/Urls';
import { decryptResponse } from './utils/crypto';
import ReasonPopup from './ReasonPopup';
import { AppDetails, getListOfUpiIntent, openUpiApp } from './Upi';
import getEnforcedUrl from './utils/getEnforcedUrl';
import { NimbblReactNativeProps } from './NimbblReactNativeProps';

const updateOrder = async (
  params: Pick<NimbblReactNativeProps, 'orderId' | 'environment'>
) => {
  const { environment = 'prod', orderId } = params;

  await fetch(getUrls(environment).updateOrder + orderId, {
    method: 'PUT',
    body: JSON.stringify({
      callback_mode: 'callback_url_redirect',
      callback_url,
    }),
  });
};

const NimbblReactNative = (props: NimbblReactNativeProps) => {
  const {
    accessKey,
    upi_app_code,
    bank_code,
    environment = 'prod',
    orderId,
    payment_flow,
    payment_mode_code,
    show,
    wallet_code,
    upi_id,
    onClose,
  } = props;

  const width = useWindowDimensions().width;
  const height = useWindowDimensions().height;

  const [upiAppList, setUpiAppList] = useState<AppDetails[]>([]);
  const [showReason, setShowReason] = useState(false);
  const webviewRef = useRef<WebView>(null);

  const hideReason = () => setShowReason(false);

  const handleClose = (reason: string) => {
    if (onClose) {
      onClose(
        JSON.stringify({
          event_type: 'globalHandleCheckoutResponse',
          payload: {
            nimbbl_order_id: orderId,
            nimbbl_transaction_id: null,
            nimbbl_signature: null,
            order_id: orderId,
            transaction_id: null,
            signature: null,
            reason: reason,
            status: 'failed',
          },
        })
      );
    }
  };

  const onMessage = async (event: WebViewMessageEvent) => {
    const data = JSON.parse(event.nativeEvent.data);
    const { package_name, url } = data || {};

    console.log('data', { package_name, url });

    if (!package_name) throw Error('Package Name is required but is not found');
    if (!url) throw Error('Payment Url is required but is not found');

    const status = await openUpiApp({ package_name, url });
    webviewRef.current?.postMessage(status);

    // if(status === 'cancelled') {

    // }

    console.log('status', status);
  };

  useEffect(() => {
    const getApps = async () => {
      const upiApps = await getListOfUpiIntent();
      console.log('List of UPI apps:', JSON.stringify(upiApps, null, 2));

      setUpiAppList(upiApps.UPIApps ?? []);
    };

    getApps();
  }, []);

  useEffect(() => {
    if (show) {
      updateOrder({
        orderId,
        environment,
      });
    }
  }, [orderId, show, environment]);

  const { checkoutParams, host } = getUrls(environment);
  const url = host + checkoutParams + orderId;
  const enforcedUrl = getEnforcedUrl({
    upi_app_code,
    bank_code,
    payment_flow,
    payment_mode_code,
    url,
    wallet_code,
    upi_id,
  });

  console.log('enforcedUrl:', enforcedUrl);
  console.log('environment:', environment);

  const injectJavascript = `
    window.nimbbl_webview = {
      isNative: true,
      UPIIntentAvailable: ${JSON.stringify(upiAppList)},
    };
    true;
  `;

  console.log('injectedJs', injectJavascript);

  return (
    <Modal
      style={{ width, height }}
      visible={show}
      animationType='slide'
      onRequestClose={() => {
        Alert.alert(
          'Are you sure you want to cancel this payment?',
          undefined,
          [
            {
              text: 'No',
              onPress: () => {},
              style: 'cancel',
            },
            {
              text: 'Yes',
              onPress: () => {
                setShowReason(true);
              },
            },
          ],
          { cancelable: false }
        );
      }}>
      <WebView
        ref={webviewRef}
        style={{
          backgroundColor: '#fff',
          width,
          height,
        }}
        startInLoadingState={false}
        source={{ uri: enforcedUrl }}
        mixedContentMode='compatibility'
        javaScriptCanOpenWindowsAutomatically={true}
        setSupportMultipleWindows={false}
        injectedJavaScript={injectJavascript}
        injectedJavaScriptBeforeContentLoaded={injectJavascript}
        onMessage={onMessage}
        onNavigationStateChange={(e) => {
          const responseURL = e.url;
          console.log('webview url', responseURL);

          if (callback_url && responseURL.includes(callback_url)) {
            const queryParams = parse(responseURL);
            const responseString = decryptResponse(
              queryParams?.response as string
            );

            // closing webview
            if (onClose) {
              onClose(responseString);
            }
          }
        }}
      />

      <ReasonPopup
        orderId={orderId}
        show={showReason}
        hideReason={hideReason}
        handleClose={handleClose}
        environment={environment}
      />
    </Modal>
  );
};

export default NimbblReactNative;
