const users = [
	{ id: 0, username: "robogram", cellnumber: "0000000000", password: "password" },
	{ id: 1, username: "user1", cellnumber: "1111111111", password: "password" },
	{ id: 2, username: "user2", cellnumber: "2222222222", password: "password" },
	{ id: 3, username: "user3", cellnumber: "3333333333", password: "password" },
	{ id: 4, username: "user4", cellnumber: "4444444444", password: "password" },
	{ id: 5, username: "user5", cellnumber: "5555555555", password: "password" },
	{ id: 6, username: "user6", cellnumber: "6666666666", password: "password" },
	{ id: 7, username: "user7", cellnumber: "7777777777", password: "password" },
	{ id: 8, username: "user8", cellnumber: "8888888888", password: "password" },
	{ id: 9, username: "user9", cellnumber: "9999999999", password: "password" },
	{ id: 10, username: "user10", cellnumber: "1010101010", password: "password" },
	{ id: 11, username: "user11", cellnumber: "0101010101", password: "password" },
	{ id: 12, username: "user12", cellnumber: "1231231234", password: "password" },
	{ id: 13, username: "user13", cellnumber: "2342342345", password: "password" },
	{ id: 14, username: "user14", cellnumber: "3453453456", password: "password" }
]
const cards = [
	{ id: 0, number: "4000000000000077", expMonth: 2, expYear: 34, cvc: '232' }, // visa
	{ id: 1, number: "5555555555554444", expMonth: 1, expYear: 23, cvc: '121' }, // mastercard
	{ id: 2, number: "378282246310005", expMonth: 5, expYear: 29, cvc: '243' }, // amex
	{ id: 3, number: "6011111111111117", expMonth: 9, expYear: 22, cvc: '869' }, // discover
	{ id: 4, number: "30569309025904", expMonth: 12, expYear: 45, cvc: '054' }, // diners club
	{ id: 5, number: "3530111333300000", expMonth: 12, expYear: 23, cvc: '056' }, // jcb
]
const { number, expMonth, expYear, cvc } = cards[Math.floor(Math.random() * 5) + 0]

let login = users[0]
export const loginInfo = { username: login.username, cellnumber: login.cellnumber, password: login.password, latitude: 43.663631, longitude: -79.351501 }

let register = users[6]
export const registerInfo = { username: register.username, cellnumber: register.cellnumber, password: register.password, latitude: 43.663631, longitude: -79.351501 }

export const wifi_api_url = "http://192.168.0.172:5000/flask"
export const server_api_url = "https://www.easygo.tk/flask"
export const url = wifi_api_url
export const cardInfo = { number, expMonth, expYear, cvc }
export const stripe_key = "sk_test_lft1B76yZfF2oEtD5rI3y8dz"
export const logo_url = url + "/static/"
export const displayTime = unixtime => {
	const months = ['January', 'February', 'March', 'April', 'May', 'Jun', 'July', 'August', 'September', 'October', 'November', 'December']
	const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	const currTime = new Date(Date.now())
	const currentDate = Date.parse(months[currTime.getMonth()] + " " + currTime.getDate() + ", " + currTime.getFullYear() + " 23:59")
	const selectedDate = new Date(unixtime)
	let hour = selectedDate.getHours(), minute = selectedDate.getMinutes(), period
	let timeStr = "", timeheader = "", diff

	minute = minute < 10 ? '0' + minute : minute
	period = hour > 12 ? 'pm' : 'am'
	hour = hour > 12 ? hour - 12 : hour

	timeheader = hour + ":" + minute + " " + period

	if (unixtime < currentDate) {
		timeStr = "today at " + timeheader
	} else if (unixtime > currentDate) {
		if (unixtime - currentDate > 86400000) {
			diff = unixtime - currentDate

			if (diff <= 604800000) { // this week
				let sDay = new Date(unixtime)
				let eDay = new Date(currentDate)

				if (sDay.getDay() == eDay.getDay()) {
					timeStr = " next " + days[sDay.getDay()] + " at " + timeheader
				} else {
					timeStr = " this " + days[sDay.getDay()] + " at " + timeheader
				}
			} else if (diff > 604800000 && diff <= 1210000000) { // next week
				let sDay = new Date(unixtime)
				let eDay = new Date(currentDate)

				if (sDay.getDay() != eDay.getDay()) {
					timeStr = " next " + days[sDay.getDay()] + " at " + timeheader
				} else {
					timeStr = " this " + days[sDay.getDay()] + ", " + months[sDay.getMonth()] + " " + date + " at " + timeheader
				}
			} else {
				let sDay = new Date(unixtime)
				let eDay = new Date(currentDate)

				if (sDay.getMonth() != eDay.getMonth()) {
					timeStr = " this " + days[sDay.getDay()] + ", " + months[sDay.getMonth()] + " " + date + " at " + timeheader
				} else {
					timeStr = " this " + days[sDay.getDay()] + ", " + date + " at " + timeheader
				}
			}
		} else {
			timeStr = "tomorrow at " + timeheader
		}
	}

	return timeStr
}
