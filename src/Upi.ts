import { NativeModules } from 'react-native';

const { NimbblUpiIntent } = NativeModules;

// sample response
// [
//   { name: 'PhonePe', packageName: 'com.phonepe.app' }
// ];

export interface AppDetails {
  name: string;
  package_name: string;
  upi_app_code: string;
  logo_url: string;
}

interface AppParams {
  package_name: string;
  url: string;
}

/**
 * returns a promise which resolves to
 * the list of available upi apps on the user's device
 */
const getListOfUpiIntent = async (): Promise<{ UPIApps: AppDetails[] }> => {
  const result = (await NimbblUpiIntent.getUpiApps()) as string;
  const UPIApps = JSON.parse(result) as AppDetails[];
  return { UPIApps };
};

/**
 * takes `package_name` and `url` as input and opens the specified upi app for payment
 * @returns `success` | `failed`
 */
const openUpiApp = async (appParams: AppParams): Promise<string> => {
  return await NimbblUpiIntent.openUpiApp(JSON.stringify(appParams));
};

export { getListOfUpiIntent, openUpiApp };
