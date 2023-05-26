import React, { useEffect, useState } from 'react';
import { Alert, Modal, useWindowDimensions } from 'react-native';
import WebView from 'react-native-webview';
import { parse } from 'search-params';

import { Environments, getUrls } from './constants/Urls';
import { decryptResponse, encryptBody } from './utils/crypto';
import ReasonPopup from './ReasonPopup';

const fetchOrders = async (
  params: Pick<
    NativeSdkProps,
    'accessKey' | 'accessSecret' | 'orderId' | 'environment' | 'callback_url'
  >
) => {
  const {
    accessKey,
    accessSecret,
    environment = 'prod',
    orderId,
    callback_url,
  } = params;
  console.log('fetchOrders', environment);

  const tokenRes = await fetch(getUrls(environment).egt, {
    method: 'POST',
    body: encryptBody({
      access_key: accessKey,
      access_secret: accessSecret,
      order_id: orderId,
    }),
  });
  console.log('token res', tokenRes);
  const tokenData = await tokenRes.json();
  const { token = '' } = tokenData || {};
  console.log('token data', tokenData);

  await fetch(getUrls(environment).updateOrder + orderId, {
    method: 'PUT',
    body: JSON.stringify({
      callback_mode: 'callback_url_redirect',
      callback_url,
    }),
  });
};

interface NativeSdkProps {
  show: boolean;
  accessKey: string;
  accessSecret?: string;
  orderId: string;
  host: string;
  environment?: Environments;
  callback_url: string;
  onClose: (data: any) => void;
}

const NativeSdk = (props: NativeSdkProps) => {
  const {
    accessKey,
    accessSecret,
    host,
    environment = 'prod',
    onClose,
    orderId,
    show,
    callback_url,
  } = props;

  const width = useWindowDimensions().width;
  const height = useWindowDimensions().height;

  const [showReason, setShowReason] = useState(false);
  // const [order, setOrder] = useState<any>(null);

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
    if (show) {
      fetchOrders({
        accessKey,
        orderId,
        accessSecret: accessSecret || '',
        environment,
        callback_url,
      });
      // .then((data) => {
      //   setOrder(data);
      // });
    }
  }, [accessKey, orderId, show, environment, callback_url]);

  console.log('env', environment);

  const url = host + getUrls(environment).checkoutParams + orderId;

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

export default NativeSdk;
