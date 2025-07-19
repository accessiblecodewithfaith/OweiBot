import moment from 'moment-timezone';

export function isVendorAvailable(hours, timezone) {
  const now = moment().tz(timezone);
  const today = now.format('dddd'); // e.g. "Monday"
  const currentTime = now.format('HH:mm');

  if (!hours || !hours[today]) return false;

  const open = hours[today].open;
  const close = hours[today].close;

  return open && close && currentTime >= open && currentTime <= close;
}
