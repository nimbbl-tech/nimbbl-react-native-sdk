import React, { useEffect, useRef, useState } from 'react';
import { Alert, Modal, useWindowDimensions } from 'react-native';
import WebView from 'react-native-webview';
import { parse } from 'search-params';

import { Environments, callback_url, getUrls } from './constants/Urls';
import { decryptResponse } from './utils/crypto';
import ReasonPopup from './ReasonPopup';
import getListOfUpiIntent, { AppDetails } from './Upi';

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

interface NimbblReactNativeProps {
  // required
  accessKey: string;
  show: boolean;
  orderId: string;
  onClose: (data: any) => void;

  // optional
  environment?: Environments;
}

const NimbblReactNative = (props: NimbblReactNativeProps) => {
  const { accessKey, environment = 'prod', onClose, orderId, show } = props;

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
  // + '&resource=' + accessKey;

  console.log('environment:', environment);

  // { UPIApps: [] }

  const injectJavascript = `
    window.nimbbl_webview = {
      isNative: true,
      UPIIntentAvailable: ${JSON.stringify(upiAppList)},
    };
    true;
  `;

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
        source={{ uri: url }}
        mixedContentMode='compatibility'
        javaScriptCanOpenWindowsAutomatically={true}
        setSupportMultipleWindows={false}
        injectedJavaScript={injectJavascript}
        onNavigationStateChange={(e) => {
          const responseURL = e.url;

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
