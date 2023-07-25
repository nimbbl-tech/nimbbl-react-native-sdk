import { NimbblReactNativeProps } from 'src/NimbblReactNativeProps';

const getEnforcedUrl = (
  params: Pick<
    NimbblReactNativeProps,
    | 'upi_app_code'
    | 'bank_code'
    | 'payment_flow'
    | 'payment_mode_code'
    | 'wallet_code'
    | 'upi_id'
  > & { url: string }
): string => {
  const {
    upi_id,
    upi_app_code,
    bank_code,
    payment_flow,
    payment_mode_code,
    url,
    wallet_code,
  } = params;

  let resultUrl = url;
  let paymentMode = '';
  let bankCode = '';
  let walletCode = '';
  let paymentFlow = '';
  let appCode = '';
  let upiId = '';

  switch (payment_mode_code) {
    case 'card': {
      paymentMode = 'Card';
      break;
    }
    case 'net_banking': {
      paymentMode = 'Netbanking';
      if (bank_code) bankCode = bank_code;
      break;
    }
    case 'wallet': {
      paymentMode = 'Wallet';
      if (wallet_code) walletCode = wallet_code;
      break;
    }
    case 'upi': {
      paymentMode = 'UPI';
      if (payment_flow) paymentFlow = payment_flow;
      if (upi_id) upiId = upi_id;
      if (upi_app_code) appCode = upi_app_code;
      break;
    }
  }

  if (paymentMode) resultUrl += `&payment_mode=${paymentMode}`;
  if (bankCode) resultUrl += `&bank_code=${bankCode}`;
  if (walletCode) resultUrl += `&wallet_code=${walletCode}`;
  if (paymentFlow) resultUrl += `&payment_flow=${paymentFlow}`;
  if (upiId) resultUrl += `&upi_id=${upiId}`;
  if (appCode) resultUrl += `&upi_app_code=${appCode}`;

  return resultUrl;
};

export default getEnforcedUrl;
