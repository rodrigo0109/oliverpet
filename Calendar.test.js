const moment = require('moment')
const assert = require('assert')
const { CalendarLoader, CalendarSpots, getAvailableSpots } = require('./Calendar')

describe('getAvailableSpot', function () {
	it('Should get 1 available spots of calendar 1', function () {
		let result = getAvailableSpots(1, "10-04-2023", 30)
		assert.ok(result)
		assert.equal(result.length, 1)
		assert.equal(result[0].startHour.valueOf(), moment.utc('2023-04-10T16:00:00.000Z').valueOf())
		assert.equal(result[0].endHour.valueOf(), moment.utc('2023-04-10T16:50:00.000Z').valueOf())
	})
})

describe('getAvailableSpot', function () {
	it('Should get 1 available spots of calendar 2', function () {
		let result = getAvailableSpots(2, "13-04-2023", 25)
		assert.ok(result)
		assert.equal(result.length, 1)
		assert.equal(result[0].startHour.valueOf(), moment.utc('2023-04-13T18:00:00.000Z').valueOf())
		assert.equal(result[0].endHour.valueOf(), moment.utc('2023-04-13T18:25:00.000Z').valueOf())
	})
})

describe('getAvailableSpot', function () {
	it('Should get no available spots of calendar 3', function () {
		let result = getAvailableSpots(2, "16-04-2023", 25)
		assert.ok(result)
		assert.equal(result.length, 0)
	})
})

describe('getAvailableSpot with classes', function () {
	it('Should get 1 available spots of calendar 1', function () {
		const calendarLoader = new CalendarLoader(1)
		const calendarData = calendarLoader.loadCalendarData()

		const calendarAvailability = new CalendarSpots(calendarData, "10-04-2023", 30);
		const availableSpots = calendarAvailability.getAvailableSpots()
		const generateSlot = calendarAvailability.generateNewSlot(availableSpots)

		assert.ok(generateSlot)
		assert.equal(generateSlot.length, 1)
		assert.equal(generateSlot[0].startHour.valueOf(), moment.utc('2023-04-10T16:00:00.000Z').valueOf())
		assert.equal(generateSlot[0].endHour.valueOf(), moment.utc('2023-04-10T16:50:00.000Z').valueOf())
	})
})

describe('getAvailableSpot with classes', function () {
	it('Should get 1 available spots of calendar 2', function () {
		const calendarLoader = new CalendarLoader(2)
		const calendarData = calendarLoader.loadCalendarData()
		
		const calendarAvailability = new CalendarSpots(calendarData, "13-04-2023", 25);
		const availableSpots = calendarAvailability.getAvailableSpots()
		const generateSlot = calendarAvailability.generateNewSlot(availableSpots)

		assert.ok(generateSlot)
		assert.equal(generateSlot.length, 1)
		assert.equal(generateSlot[0].startHour.valueOf(), moment.utc('2023-04-13T18:00:00.000Z').valueOf())
		assert.equal(generateSlot[0].endHour.valueOf(), moment.utc('2023-04-13T18:25:00.000Z').valueOf())
	})
})

describe('getAvailableSpot with classes', function () {
	it('Should get no available spots of calendar 3', function () {
		const calendarLoader = new CalendarLoader(3)
		const calendarData = calendarLoader.loadCalendarData()
		
		const calendarAvailability = new CalendarSpots(calendarData, "16-04-2023", 25);
		const availableSpots = calendarAvailability.getAvailableSpots()
		const generateSlot = calendarAvailability.generateNewSlot(availableSpots)
		
		assert.ok(generateSlot)
		assert.equal(generateSlot.length, 0)
	})
})
