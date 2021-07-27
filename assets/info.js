import { LOCAL_API_URL, WIFI_API_URL } from "@env"

const users = [
	{ id: 0, cellnumber: "9999999999", password: "password" },
	{ id: 1, cellnumber: "1111111111", password: "password" }
]
const { cellnumber, password } = users[1]

export const info = {
	cellnumber: cellnumber,
	password: password,
	latitude: 43.663631,
	longitude: -79.351501
}

export const logo_url = WIFI_API_URL + "/static/"
