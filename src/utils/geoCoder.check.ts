import { buildNominatimReverseUrl, parseNominatimPayload, reverseGeocode } from './geoCoder';

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

const url = buildNominatimReverseUrl(26.8467, 80.9462);
assert(url.includes('accept-language=en'), 'URL must force English labels');
assert(url.includes('lat=26.8467'), 'URL must include latitude');
assert(url.includes('lon=80.9462'), 'URL must include longitude');

const parsed = parseNominatimPayload({
  display_name: 'Lucknow, Uttar Pradesh, 226027, India',
  address: { city: 'Lucknow', state: 'Uttar Pradesh', postcode: '226027' },
});
assert(parsed?.city === 'Lucknow', 'city');
assert(parsed?.state === 'Uttar Pradesh', 'state');
assert(parsed?.postcode === '226027', 'postcode');

const bad = parseNominatimPayload(null);
assert(bad === null, 'null payload');

reverseGeocode(26.8467, 80.9462)
  .then((row) => {
    assert(row.lat === 26.8467, 'lat preserved even on network failure');
    console.log('geoCoder checks passed', { urlOk: true, city: parsed?.city, liveOk: row.ok, error: row.error });
  })
  .catch((err) => {
    console.error('geoCoder reverseGeocode must not throw', err);
    process.exit(1);
  });
