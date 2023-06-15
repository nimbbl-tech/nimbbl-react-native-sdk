export const apiHost = {
  pp: 'https://apipp.nimbbl.tech/',
  prod: 'https://api.nimbbl.tech/',
  qa1: 'https://qa1api.nimbbl.tech/',
  qa2: 'https://qa2api.nimbbl.tech/',
  qa3: 'https://qa3api.nimbbl.tech/',
};

export const checkoutHost = {
  pp: 'https://checkoutpp.nimbbl.tech/',
  prod: 'https://checkout.nimbbl.tech/',
  qa1: 'https://qa1checkout.nimbbl.tech/',
  qa2: 'https://qa2checkout.nimbbl.tech/',
  qa3: 'https://qa3checkout.nimbbl.tech/',
};

export const environments = ['prod', 'pp', 'qa3', 'qa1', 'qa2'];

export const productDetails = {
  amount_before_tax: 2.0,
  tax: 0,
  total_amount: 3.0,
  user: {
    email: 'abc@gmail.com',
    first_name: 'abc',
    last_name: null,
    country_code: '+91',
    mobile_number: '9004229994',
  },
  shipping_address: {
    street: 'L.N. Pappan Marg',
    landmark: 'Dr E Moses Rd',
    area: 'Worli',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400018',
    address_type: 'residential',
  },
  currency: 'INR',
  invoice_id: 'invoice_Ava' + Math.random(),
  referrer_platform: '',
  referrer_platform_identifer: '',
  order_line_items: [
    {
      sku_id: 'sku1',
      title: 'Burger',
      description: 'maharaja MaC',
      quantity: '1',
      rate: 1,
      amount_before_tax: '1',
      tax: '1',
      total_amount: '1',
      image_url:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7Ay5KWSTviUsTHZ7m_-YJvOlPMwGhZIPuzobqynBqQbQP1_KWCuc8qlwREOiTP38Hs_fLTJYl&usqp=CAc',
    },
  ],
  bank_account: {
    account_number: '037801513988',
    name: 'Vasudha Maini',
    ifsc: 'ICIC0000378',
  },
  custom_attributes: {
    Name: 'abc',
    Place: 'Delhi',
    Animal: 'Tiger',
    Thing: 'Pen',
  },
};
