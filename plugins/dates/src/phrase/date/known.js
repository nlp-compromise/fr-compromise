let known = {
  'aujourd\'hui': (opts) => opts.today.startOf('day'),
  'heir': (opts) => opts.today.minus(1, 'date').startOf('day'),
  'demain': (opts) => opts.today.add(1, 'date').startOf('day'),
}
