import { LOCAL_API_URL, WIFI_API_URL } from "@env"

const users = [
	{ id: 0, cellnumber: "9999999999", password: "password" },
	{ id: 1, cellnumber: "1111111111", password: "password" },
	{ id: 2, cellnumber: "2222222222", password: "password" },
	{ id: 3, cellnumber: "3333333333", password: "password" },
	{ id: 4, cellnumber: "4444444444", password: "password" },
	{ id: 5, cellnumber: "5555555555", password: "password" },
	{ id: 6, cellnumber: "6666666666", password: "password" },
	{ id: 7, cellnumber: "7777777777", password: "password" },
	{ id: 8, cellnumber: "8888888888", password: "password" },
	{ id: 9, cellnumber: "9999999999", password: "password" },
	{ id: 10, cellnumber: "1010101010", password: "password" },
	{ id: 11, cellnumber: "0101010101", password: "password" },
]
const { cellnumber, password } = users[0]

export const info = {
	cellnumber: cellnumber,
	password: password,
	latitude: 43.663631,
	longitude: -79.351501
}

export const logo_url = WIFI_API_URL + "/static/"
