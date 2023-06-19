export type Environments = 'prod' | 'pp' | 'qa3' | 'qa1' | 'qa2';

export const host: Record<Environments, string> = {
  pp: 'https://apipp.nimbbl.tech/',
  prod: 'https://api.nimbbl.tech/',
  qa1: 'https://qa1api.nimbbl.tech/',
  qa2: 'https://qa2api.nimbbl.tech/',
  qa3: 'https://qa3api.nimbbl.tech/',
};

const checkoutHost: Record<Environments, string> = {
  pp: 'https://checkoutpp.nimbbl.tech/',
  prod: 'https://checkout.nimbbl.tech/',
  qa1: 'https://qa1checkout.nimbbl.tech/',
  qa2: 'https://qa2checkout.nimbbl.tech/',
  qa3: 'https://qa3checkout.nimbbl.tech/',
};

export const getUrls = (environment: Environments) => ({
  egt: host[environment] + 'api/v2/egt',
  generateToken: host[environment] + 'api/v2/generate-token',
  getOrder: host[environment] + 'api/v2/get-order/',
  updateOrder: host[environment] + 'api/v2/update-order/',
  checkoutParams: '?modal=false&order_id=',
  host: checkoutHost[environment],
});

export const callback_url = 'https://shop.nimbbl.tech/thank-you';
