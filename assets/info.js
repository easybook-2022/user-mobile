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
]
const cards = [
	{ id: 0, number: "4000000000000077", expMonth: 2, expYear: 34, cvc: '232' },
	{ id: 1, number: "4000003720000278", expMonth: 1, expYear: 23, cvc: '121' },
	{ id: 2, number: "4000000000000077", expMonth: 5, expYear: 29, cvc: '243' },
	{ id: 3, number: "4000003720000278", expMonth: 9, expYear: 22, cvc: '869' },
	{ id: 4, number: "4000000000000077", expMonth: 12, expYear: 45, cvc: '054' },
]
const { username, cellnumber, password } = users[0]
const { number, expMonth, expYear, cvc } = cards[0]

export const local_api_url = "http://localhost:5000"
export const wifi_api_url = "http://192.168.0.14:5000"
export const userInfo = { username, cellnumber, password, latitude: 43.663631, longitude: -79.351501 }
export const cardInfo = { number, expMonth, expYear, cvc }
export const stripe_key = "sk_test_lft1B76yZfF2oEtD5rI3y8dz"
export const logo_url = wifi_api_url + "/static/"
