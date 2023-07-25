import { Environments } from './constants/Urls';

export interface NimbblReactNativeProps {
  // required
  accessKey: string;
  show: boolean;
  orderId: string;
  onClose: (data: any) => void;

  // enforced payment (optional)
  payment_mode_code?: 'net_banking' | 'wallet' | 'card' | 'upi';
  bank_code?: string;
  wallet_code?: string;
  payment_flow?: 'intent' | 'collect';
  upi_id?: string;
  upi_app_code?: string;

  // optional
  environment?: Environments;
}
