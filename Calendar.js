const moment = require('moment')
const fs = require('fs');


class CalendarLoader {
	constructor(calendarPath) {
		this.calendarPath = calendarPath
	}

	loadCalendarData() {
		let rawdata = fs.readFileSync('./calendars/calendar.' + this.calendarPath + '.json');
		let data = JSON.parse(rawdata);
		return data
	}
}

class CalendarSpots {
	constructor(calendarData, date, duration) {
		this.calendarData = calendarData
		this.date = date
		this.duration = duration
		this.durationBefore = calendarData.durationBefore
		this.durationAfter = calendarData.durationAfter
		this.dateISO = moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD')
	}

	getAvailableSpots() {
		const data = this.calendarData
		const date = this.date
		const dateISO = this.dateISO
		let daySlots = []
		for (const key in data.slots) {
			if (key === date) {
				daySlots = data.slots[key]
			}
		}
		const realSpots = []
		daySlots.forEach(daySlot => {
			if (data.sessions && data.sessions[date]) {
				let noConflicts = true
				data.sessions[date].forEach(sessionSlot => {
					let sessionStart = moment(dateISO + ' ' + sessionSlot.start).valueOf()
					let sessionEnd = moment(dateISO + ' ' + sessionSlot.end).valueOf()
					let start = moment(dateISO + ' ' + daySlot.start).valueOf()
					let end = moment(dateISO + ' ' + daySlot.end).valueOf()
					if (sessionStart > start && sessionEnd < end) {
						realSpots.push({ start: daySlot.start, end: sessionSlot.start})
						realSpots.push({ start: sessionSlot.end, end: daySlot.end})
						noConflicts = false
					} else if (sessionStart === start && sessionEnd < end) {
						realSpots.push({ start: sessionSlot.end, end: daySlot.end})
						noConflicts = false
					} else if (sessionStart > start && sessionEnd === end) {
						realSpots.push({ start: daySlot.start, end: sessionSlot.start})
						noConflicts = false
					} else if (sessionStart === start && sessionEnd === end) {
						noConflicts = false
					}
				})
				if (noConflicts) {
					realSpots.push(daySlot)
				}
			} else {
				realSpots.push(daySlot)
			}
		})
		return realSpots;
	}

	generateNewSlot(realSpots) {
		const self = this

		let arrSlot = [];
		realSpots.forEach(function (slot) {
			let start = slot.start;
			let resultSlot;
				do {
					resultSlot = self._getOneMiniSlot(start, slot.end);
				if (resultSlot) {
					arrSlot.push(resultSlot);
					start = moment.utc(resultSlot.endHour).format('HH:mm')
				}
				} while (resultSlot);

			return arrSlot;
		});
		return arrSlot;
	}

	_getMomentHour(hour){
		let finalHourForAdd = moment(this.dateISO + ' ' + hour);
		return finalHourForAdd;
	}

	_addMinutes(hour, minutes){
		let result = moment(hour).add(minutes, 'minutes').format('HH:mm');
		return result;
	}

	_getOneMiniSlot(startSlot, endSlot){
		const durationBefore = this.durationBefore;
		const durationAfter = this.durationAfter;
		const duration = this.duration;
		const dateISO = this.dateISO;

		let init = 0;
		let startHour;
		let endHour;
		let clientStartHour;
		let clientEndHour;

		let startHourFirst = this._getMomentHour(startSlot);
		startHour = startHourFirst.format('HH:mm');
		endHour = this._addMinutes(startHourFirst, durationBefore + duration + durationAfter);
		clientStartHour = this._addMinutes(startHourFirst, durationBefore);
		clientEndHour = this._addMinutes(startHourFirst, duration);

		if (moment.utc(endHour, 'HH:mm').valueOf() > moment.utc(endSlot, 'HH:mm').valueOf()) {
			return null;
		} 
		const objSlot = {
			startHour: moment.utc(dateISO + ' ' + startHour)
			.toDate(),
			endHour: moment.utc(dateISO + ' ' + endHour)
			.toDate(),
			clientStartHour: moment.utc(dateISO + ' ' + clientStartHour)
			.toDate(),
			clientEndHour: moment.utc(dateISO + ' ' + clientEndHour)
			.toDate(),
		};
		init += 1;
		return objSlot;
	}

	_removeMinutes(hour, minutes){
		let result = moment(hour).subtract(minutes, 'minutes').format('HH:mm');
		return result;
	}
}	

// 
function getAvailableSpots(calendar, date, duration ) {
	let rawdata = fs.readFileSync('./calendars/calendar.' + calendar + '.json');
	let data = JSON.parse(rawdata);
	const dateISO = moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD')
	let durationBefore = data.durationBefore;
	let durationAfter = data.durationAfter;
	let daySlots = []
	for (const key in data.slots) {
		if (key === date) {
			daySlots = data.slots[key]
		}
	}
	const realSpots = []
	daySlots.forEach(daySlot => {
		if (data.sessions && data.sessions[date]) {
			let noConflicts = true
			data.sessions[date].forEach(sessionSlot => {
				let sessionStart = moment(dateISO + ' ' + sessionSlot.start).valueOf()
				let sessionEnd = moment(dateISO + ' ' + sessionSlot.end).valueOf()
				let start = moment(dateISO + ' ' + daySlot.start).valueOf()
				let end = moment(dateISO + ' ' + daySlot.end).valueOf()
				if (sessionStart > start && sessionEnd < end) {
					realSpots.push({ start: daySlot.start, end: sessionSlot.start})
					realSpots.push({ start: sessionSlot.end, end: daySlot.end})
					noConflicts = false
				} else if (sessionStart === start && sessionEnd < end) {
					realSpots.push({ start: sessionSlot.end, end: daySlot.end})
					noConflicts = false
				} else if (sessionStart > start && sessionEnd === end) {
					realSpots.push({ start: daySlot.start, end: sessionSlot.start})
					noConflicts = false
				} else if (sessionStart === start && sessionEnd === end) {
					noConflicts = false
				}
			})
			if (noConflicts) {
				realSpots.push(daySlot)
			}
		} else {
			realSpots.push(daySlot)
		}
	})

	let arrSlot = [];
	realSpots.forEach(function (slot) {
		let init = 0;
		let startHour;
		let endHour;
		let clientStartHour;
		let clientEndHour;

		function getMomentHour(hour) {
		  let finalHourForAdd = moment(dateISO + ' ' + hour);
		  return finalHourForAdd;
		}
		function addMinutes(hour, minutes) {
		  let result = moment(hour).add(minutes, 'minutes').format('HH:mm');
		  return result;
		}
		function removeMinutes(hour, minutes) {
		  let result = moment(hour).subtract(minutes, 'minutes').format('HH:mm');
		  return result;
		}
		function getOneMiniSlot(startSlot, endSlot) {
		  let startHourFirst = getMomentHour(startSlot);
		  
			startHour = startHourFirst.format('HH:mm');;
			endHour = addMinutes(startHourFirst, durationBefore + duration + durationAfter);
			clientStartHour = addMinutes(startHourFirst, durationBefore);
			clientEndHour = addMinutes(startHourFirst, duration);

		  if (moment.utc(endHour, 'HH:mm').valueOf() > moment.utc(endSlot, 'HH:mm').valueOf()) {
			return null;
		  } 
		  const objSlot = {
			startHour: moment.utc(dateISO + ' ' + startHour)
			  .toDate(),
			endHour: moment.utc(dateISO + ' ' + endHour)
			  .toDate(),
			clientStartHour: moment.utc(dateISO + ' ' + clientStartHour)
			  .toDate(),
			clientEndHour: moment.utc(dateISO + ' ' + clientEndHour)
			  .toDate(),
		  };
		  init += 1;
		  return objSlot;
		}

		let start = slot.start;
		let resultSlot;
		do {
		  resultSlot = getOneMiniSlot(start, slot.end);
		  if (resultSlot) {
			arrSlot.push(resultSlot);
			start = moment.utc(resultSlot.endHour).format('HH:mm')
		  }
		} while (resultSlot);

		return arrSlot;
	});
	return arrSlot;
}

module.exports = { CalendarLoader, CalendarSpots, getAvailableSpots }