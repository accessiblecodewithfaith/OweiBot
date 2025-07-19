import { parsePhoneNumber } from 'libphonenumber-js';

export function getCountryFromPhone(phone) {
  try {
    const number = parsePhoneNumber(phone);
    const country = number.country;
    
    // You can customize output with flags or country names
    return country || 'Unknown';
  } catch (err) {
    console.error('📛 Phone parsing error:', err);
    return 'Unknown';
  }
}
