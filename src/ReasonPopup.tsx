import React, { useState } from 'react';
import { Button, Modal, View } from 'react-native';

import Radio from './components/Radio';
import { Environments, getUrls } from './constants/Urls';

const reasons = [
  'Unable to find my payment method',
  'Unable to complete the payment',
  "Don't want to make a purchase right now",
  "Don't understand how to proceed",
  'Others',
];

interface ReasonPopupProps {
  orderId: string;
  show: boolean;
  handleClose: (reason: string) => void;
  hideReason: () => void;
  environment?: Environments;
}

const ReasonPopup = (props: ReasonPopupProps) => {
  const {
    handleClose,
    hideReason,
    environment = 'prod',
    show,
    orderId,
  } = props;
  const [selectedReason, setSelectedReason] = useState('');

  const updateOrder = async () => {
    await fetch(getUrls(environment).updateOrder + orderId, {
      method: 'PUT',
      body: JSON.stringify({
        cancellation_reason: selectedReason,
        order_id: orderId,
      }),
    });

    hideReason();
    handleClose(selectedReason);
  };

  return (
    <Modal animationType='slide' visible={show} transparent={true}>
      <View
        style={{
          display: 'flex',
          justifyContent: 'center',
          backgroundColor: 'rgba(36,36,36,0.9)',
          height: '100%',
        }}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 24,
            marginHorizontal: 16,
            backgroundColor: '#fff',
          }}>
          {reasons.map((reason) => (
            <Radio
              selected={selectedReason === reason}
              key={reason}
              label={reason}
              onChange={() => {
                setSelectedReason(reason);
              }}
            />
          ))}
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <View style={{ flexBasis: '49%' }}>
              <Button title='Cancel' onPress={hideReason} />
            </View>

            <View style={{ flexBasis: '49%' }}>
              <Button
                disabled={selectedReason === ''}
                title='Confirm'
                onPress={updateOrder}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ReasonPopup;
