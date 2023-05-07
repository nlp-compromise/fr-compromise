import spacetime from 'spacetime'

class Moment {
  constructor(input, opts) {
    this.unit = 'millisecond'
    this.opts = opts || {}
    this.s = spacetime(input, opts.timezone)
  }
  start() {
    this.s = this.s.startOf(this.unit)
    return this
  }
  end() {
    this.s = this.s.endOf(this.unit)
    return this
  }
  mid() {
    //do nothing
    return this
  }
  iso() {
    return this.s.iso()
  }
}


class Day extends Moment {
  constructor(str, opts) {
    super(str, opts)
    this.unit = 'day'
  }
  mid() {
    this.start()
    this.s = this.s.add(12, 'hour')//noon
    return this
  }
}

class Week extends Moment {
  constructor(str, opts) {
    super(str, opts)
    this.unit = 'week'
  }
  mid() {
    this.start()
    this.s = this.s.add(3, 'day')//wednesday
    return this
  }
}

class Month extends Moment {
  constructor(str, opts) {
    super(str, opts)
    this.unit = 'month'
  }
  mid() {
    this.start()
    this.s = this.s.add(14, 'days')
    return this
  }
}

class Year extends Moment {
  constructor(str, opts) {
    super(str, opts)
    this.unit = 'year'
  }
  mid() {
    this.start()
    this.s = this.s.add(6, 'months')
    return this
  }
}

export { Moment, Month, Day, Week, Year }
