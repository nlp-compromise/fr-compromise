export default [

  [/^[012]?[0-9]h$/i, 'Time', '04h'],
  [/^[012]?[0-9]h[0-9]{2}$/i, 'Time', '23h30'],
  [/^'[0-9]{2}$/, 'Year'],
  // times
  [/^[012]?[0-9](:[0-5][0-9])(:[0-5][0-9])$/, 'Time', '3:12:31'],
  [/^[012]?[0-9](:[0-5][0-9])?(:[0-5][0-9])$/i, 'Time', '1:12'],

  // iso-dates
  [/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}/i, 'Date', 'iso-date'],
  [/^[0-9]{1,4}-[0-9]{1,2}-[0-9]{1,4}$/, 'Date', 'iso-dash'],
  [/^[0-9]{1,4}\/[0-9]{1,2}\/[0-9]{1,4}$/, 'Date', 'iso-slash'],
  [/^[0-9]{1,4}\.[0-9]{1,2}\.[0-9]{1,4}$/, 'Date', 'iso-dot'],
  [/^[0-9]{1,4}-[a-z]{2,9}-[0-9]{1,4}$/i, 'Date', '12-dec-2019'],

  // timezones
  [/^utc ?[+-]?[0-9]+$/, 'Timezone', 'utc-9'],
  [/^(gmt|utc)[+-][0-9]{1,2}$/i, 'Timezone', 'gmt-3'],

  //phone numbers
  [/^[0-9]{3}-[0-9]{4}$/, 'PhoneNumber', '421-0029'],
  [/^(\+?[0-9][ -])?[0-9]{3}[ -]?[0-9]{3}-[0-9]{4}$/, 'PhoneNumber', '1-800-'],


  //money
  //like $5.30
  [
    /^[-+]?[$\xA2-\xA5\u058F\u060B\u09F2\u09F3\u09FB\u0AF1\u0BF9\u0E3F\u17DB\u20A0-\u20BD\uA838\uFDFC\uFE69\uFF04\uFFE0\uFFE1\uFFE5\uFFE6][-+]?[0-9]+(,[0-9]{3})*(\.[0-9]+)?([kmb]|bn)?\+?$/,
    ['Money', 'Value'],
    '$5.30',
  ],
  //like 5.30$
  [
    /^[-+]?[0-9]+(,[0-9]{3})*(\.[0-9]+)?[$\xA2-\xA5\u058F\u060B\u09F2\u09F3\u09FB\u0AF1\u0BF9\u0E3F\u17DB\u20A0-\u20BD\uA838\uFDFC\uFE69\uFF04\uFFE0\uFFE1\uFFE5\uFFE6]\+?$/,
    ['Money', 'Value'],
    '5.30£',
  ],
  //like
  [/^[-+]?[$£]?[0-9]([0-9,.])+(usd|eur|jpy|gbp|cad|aud|chf|cny|hkd|nzd|kr|rub)$/i, ['Money', 'Value'], '$400usd'],

  //numbers
  // 50 | -50 | 3.23  | 5,999.0  | 10+
  [/^[-+]?[0-9]+(,[0-9]{3})*(\.[0-9]+)?\+?$/, ['Cardinal', 'NumericValue'], '5,999'],
  [/^[-+]?[0-9]+(,[0-9]{3})*(\.[0-9]+)?(e|er)$/, ['Ordinal', 'NumericValue'], '53rd'],
  // .73th
  [/^\.[0-9]+\+?$/, ['Cardinal', 'NumericValue'], '.73th'],
  //percent
  [/^[-+]?[0-9]+(,[0-9]{3})*(\.[0-9]+)?%\+?$/, ['Percent', 'Cardinal', 'NumericValue'], '-4%'],
  [/^\.[0-9]+%$/, ['Percent', 'Cardinal', 'NumericValue'], '.3%'],
  //fraction
  [/^[0-9]{1,4}\/[0-9]{1,4}(e|er)?s?$/, ['Fraction', 'NumericValue'], '2/3rds'],
  //range
  [/^[0-9.]{1,3}[a-z]{0,2}[-–—][0-9]{1,3}[a-z]{0,2}$/, ['Value', 'NumberRange'], '3-4'],
  //time-range
  [/^[0-9]{1,2}(:[0-9][0-9])?(am|pm)? ?[-–—] ?[0-9]{1,2}(:[0-9][0-9])?(am|pm)$/, ['Time', 'NumberRange'], '3-4pm'],
  //with unit
  [/^[0-9.]+([a-z]{1,4})$/, 'Value', '9km'],
]