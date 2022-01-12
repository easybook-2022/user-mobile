import io from 'socket.io-client'

const local_url = true
const test_stripe = true
const test_input = true
const test_card = true

const users = [
	{ id: 0, username: "robogram", cellnumber: "(000) 000-0000", password: "password", confirmPassword: "password" },
	{ id: 1, username: "user1", cellnumber: "(111) 111-1111", password: "password", confirmPassword: "password" },
	{ id: 2, username: "user2", cellnumber: "(222) 222-2222", password: "password", confirmPassword: "password" },
	{ id: 3, username: "user3", cellnumber: "(333) 333-3333", password: "password", confirmPassword: "password" },
	{ id: 4, username: "user4", cellnumber: "(444) 444-4444", password: "password", confirmPassword: "password" },
	{ id: 5, username: "user5", cellnumber: "(555) 555-5555", password: "password", confirmPassword: "password" },
	{ id: 6, username: "user6", cellnumber: "(666) 666-6666", password: "password", confirmPassword: "password" },
	{ id: 7, username: "user7", cellnumber: "(777) 777-7777", password: "password", confirmPassword: "password" },
	{ id: 8, username: "user8", cellnumber: "(888) 888-8888", password: "password", confirmPassword: "password" },
	{ id: 9, username: "user9", cellnumber: "(999) 999-9999", password: "password", confirmPassword: "password" },
	{ id: 10, username: "user10", cellnumber: "(101) 010-1010", password: "password", confirmPassword: "password" },
	{ id: 11, username: "user11", cellnumber: "(010) 101-0101", password: "password", confirmPassword: "password" },
	{ id: 12, username: "user12", cellnumber: "(123) 123-1234", password: "password", confirmPassword: "password" },
	{ id: 13, username: "user13", cellnumber: "(234) 234-2345", password: "password", confirmPassword: "password" },
	{ id: 14, username: "user14", cellnumber: "(345) 345-3456", password: "password", confirmPassword: "password" }
]
const emptyUser = { username: "", cellnuber: "", password: "", confirmPassword: "" }

const testCards = [
	{ id: 0, number: "4000000000000077", expMonth: 2, expYear: 34, cvc: '232' }, // visa
	{ id: 1, number: "5555555555554444", expMonth: 1, expYear: 23, cvc: '121' }, // mastercard
	{ id: 2, number: "378282246310005", expMonth: 5, expYear: 29, cvc: '243' }, // amex
	/*{ id: 3, number: "6011111111111117", expMonth: 9, expYear: 22, cvc: '869' }, // discover
	{ id: 4, number: "30569309025904", expMonth: 12, expYear: 45, cvc: '054' }, // diners club
	{ id: 5, number: "3530111333300000", expMonth: 12, expYear: 23, cvc: '056' }, // jcb*/
]
const realCards = [
	{ id: 0, number: "4537336027385014", expMonth: 9, expYear: 23, cvc: '959' },
	{ id: 1, number: "379241612120017", expMonth: 7, expYear: 24, cvc: '3510' },
	{ id: 2, number: "4512238770577855", expMonth: 11, expYear: 23, cvc: '086' },
]
const emptyCard = { number: "", expMonth: "", expYear: "", cvc: "" }
const { number, expMonth, expYear, cvc } = 
	test_card ? 
		test_stripe ? 
			testCards[0]
			:
			realCards[Math.floor(Math.random() * 2) + 0]
	:
	emptyCard

const login = test_input ? users[0] : emptyUser
const register = test_input ? users[0] : emptyUser
const wifi_api_url = "http://192.168.0.172:5001/flask"
const wifi_socket_url = "http://192.168.0.172:5002"
const server_api_url = "https://www.easygo.tk/flask"
const server_socket_url = "wss://www.easygo.tk"
const socket_url = local_url ? wifi_socket_url : server_socket_url

export const loginInfo = { username: login.username, cellnumber: login.cellnumber, password: login.password, latitude: 43.663631, longitude: -79.351501 }
export const socket = io.connect(socket_url)
export const registerInfo = { username: register.username, cellnumber: register.cellnumber, password: register.password, confirmPassword: register.confirmPassword, latitude: 43.663631, longitude: -79.351501 }
export const url = local_url ? wifi_api_url : server_api_url
export const isLocal = test_input
export const cardInfo = { number, expMonth, expYear, cvc }
export const stripe_key = test_stripe ? "sk_test_lft1B76yZfF2oEtD5rI3y8dz" : "sk_live_AeoXx4kxjfETP2fTR7IkdTYC"
export const logo_url = url + "/static/"
export const displayTime = unixtime => {
	const months = ['January', 'February', 'March', 'April', 'May', 'Jun', 'July', 'August', 'September', 'October', 'November', 'December']
	const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	const currTime = new Date(Date.now())
	const currentDate = Date.parse(months[currTime.getMonth()] + " " + currTime.getDate() + ", " + currTime.getFullYear() + " 23:59")
	const time = parseInt(unixtime)
	const selectedDate = new Date(time)
	let hour = selectedDate.getHours(), minute = selectedDate.getMinutes(), period, date = selectedDate.getDate()
	let timeStr = "", timeheader = "", diff

	minute = minute < 10 ? '0' + minute : minute
	period = hour > 12 ? 'pm' : 'am'
	hour = hour > 12 ? 
			hour - 12 
			:
			hour == 0 ? 12 : hour

	timeheader = hour + ":" + minute + " " + period

	if (time < currentDate) {
		timeStr = "today at " + timeheader
	} else if (time > currentDate) {
		if (time - currentDate > 86400000) {
			diff = time - currentDate

			if (diff <= 604800000) { // this week
				let sDay = new Date(time)
				let eDay = new Date(currentDate)

				timeStr = " on " + days[sDay.getDay()] + " at " + timeheader
			} else if (diff > 604800000 && diff <= 1210000000) { // next week
				let sDay = new Date(time)
				let eDay = new Date(currentDate)

				timeStr = " next " + days[sDay.getDay()] + " at " + timeheader
			} else {
				let sDay = new Date(time)
				let eDay = new Date(currentDate)

				timeStr = " on " + days[sDay.getDay()] + ", " + months[sDay.getMonth()] + " " + date + " at " + timeheader
			}
		} else {
			timeStr = "tomorrow at " + timeheader
		}
	}

	return timeStr
}
export const stripeFee = amount => {
	return (amount + 0.30) / (1 - 0.029)
}
