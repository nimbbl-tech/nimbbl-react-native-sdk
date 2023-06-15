import { NativeModules } from 'react-native';

const { NimbblUpiIntent } = NativeModules;

// sample response
// [
//   { name: 'Samsung Pay Mini', packageName: 'com.samsung.android.spaymini' },
//   { name: 'PhonePe', packageName: 'com.phonepe.app' }
// ];

interface AppDetails {
  name: string;
  package_name: string;
  upi_app_code: string;
  logo_url: string;
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

export default getListOfUpiIntent;
