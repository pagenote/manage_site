import { DAYS_IN_ONE_YEAR, DAYS_IN_WEEK } from './consts'

export default class CalendarHeatmap {
  constructor(endDate, values, max) {
    this.endDate = this._parseDate(endDate)
    this.max =
      max || Math.ceil((Math.max(...values.map((day) => day.count)) / 5) * 4)
    this.startDate = this._shiftDate(endDate, -DAYS_IN_ONE_YEAR)
    this.values = values
  }

  get activities() {
    return this.values.reduce((newValues, day) => {
      newValues[this._keyDayParser(day.date)] = {
        count: day.count,
        colorIndex: this.getColorIndex(day.count),
      }
      return newValues
    }, {})
  }

  get weekCount() {
    return this.getDaysCount() / DAYS_IN_WEEK
  }

  get calendar() {
    const date = this._shiftDate(
      this.startDate,
      -this.getCountEmptyDaysAtStart()
    )
    return Array.from({ length: this.weekCount }, () =>
      Array.from({ length: DAYS_IN_WEEK }, () => {
        const dDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        )
        const dayValues = this.activities[this._keyDayParser(dDate)]
        date.setDate(date.getDate() + 1)
        return {
          date: dDate,
          // dateFormat: `${dDate.getFullYear()}/${dDate.getMonth()+1}/${}`,
          count: dayValues ? dayValues.count : 0,
          colorIndex: dayValues ? dayValues.colorIndex : 0,
        }
      })
    )
  }

  get firstFullWeekOfMonths() {
    return this.calendar.reduce((months, week, index, weeks) => {
      if (index > 0) {
        const lastWeek = weeks[index - 1][0].date
        const currentWeek = week[0].date
        if (
          lastWeek.getFullYear() < currentWeek.getFullYear() ||
          lastWeek.getMonth() < currentWeek.getMonth()
        ) {
          months.push({ value: currentWeek.getMonth(), index })
        }
      }
      return months
    }, [])
  }

  getColorIndex(value) {
    if (value <= 0) {
      return 0
    } else if (value >= this.max) {
      return 4
    } else {
      return Math.ceil(((value * 100) / this.max) * 0.03)
    }
  }

  getCountEmptyDaysAtStart() {
    return this.startDate.getDay()
  }

  getCountEmptyDaysAtEnd() {
    return DAYS_IN_WEEK - 1 - this.endDate.getDay()
  }

  getDaysCount() {
    return (
      DAYS_IN_ONE_YEAR +
      1 +
      this.getCountEmptyDaysAtStart() +
      this.getCountEmptyDaysAtEnd()
    )
  }

  _shiftDate(date, numDays) {
    const newDate = new Date(date)
    newDate.setDate(newDate.getDate() + numDays)
    return newDate
  }

  _parseDate(entry) {
    return entry instanceof Date ? entry : new Date(entry)
  }

  _keyDayParser(date) {
    const day = this._parseDate(date)
    return `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`
  }
}
