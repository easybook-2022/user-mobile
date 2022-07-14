import io from 'socket.io-client'

const local_url = true
const test_input = true

const testUsers = [
	{ id: 0, username: "robogram", cellnumber: "(000) 000-0000", password: "qqqqqq", confirmPassword: "" },
	{ id: 1, username: "user1", cellnumber: "(111) 111-1111", password: "qqqqqq", confirmPassword: "" },
	{ id: 2, username: "user2", cellnumber: "(222) 222-2222", password: "qqqqqq", confirmPassword: "" },
	{ id: 3, username: "user3", cellnumber: "(333) 333-3333", password: "qqqqqq", confirmPassword: "" },
	{ id: 4, username: "user4", cellnumber: "(444) 444-4444", password: "qqqqqq", confirmPassword: "" },
	{ id: 5, username: "user5", cellnumber: "(555) 555-5555", password: "qqqqqq", confirmPassword: "" },
	{ id: 6, username: "user6", cellnumber: "(666) 666-6666", password: "qqqqqq", confirmPassword: "" },
	{ id: 7, username: "user7", cellnumber: "(777) 777-7777", password: "qqqqqq", confirmPassword: "" },
	{ id: 8, username: "user8", cellnumber: "(888) 888-8888", password: "qqqqqq", confirmPassword: "" },
	{ id: 9, username: "user9", cellnumber: "(999) 999-9999", password: "qqqqqq", confirmPassword: "" },
	{ id: 10, username: "user10", cellnumber: "(101) 010-1010", password: "qqqqqq", confirmPassword: "" },
	{ id: 11, username: "user11", cellnumber: "(010) 101-0101", password: "qqqqqq", confirmPassword: "" },
	{ id: 12, username: "user12", cellnumber: "(123) 123-1234", password: "qqqqqq", confirmPassword: "" },
	{ id: 13, username: "user13", cellnumber: "(234) 234-2345", password: "qqqqqq", confirmPassword: "" },
	{ id: 14, username: "user14", cellnumber: "(345) 345-3456", password: "qqqqqq", confirmPassword: "" }
]
const realUsers = [
  { id: 0, username: "kevin", cellnumber: "(647) 926-3868", password: "qqqqqq", confirmPassword: "" }
]
const emptyUser = { username: "", cellnumber: "", password: "", confirmPassword: "" }

const useInput = true

const signin = test_input ? testUsers[0] : useInput ? realUsers[0] : emptyUser

const host = "192.168.2.107"
const wifi_api_url = "http://" + host + ":5001/flask"
const wifi_socket_url = "http://" + host + ":5002"
const server_api_url = "https://www.easygo.tk/flask"
const server_socket_url = "wss://www.easygo.tk"
const socket_url = local_url ? wifi_socket_url : server_socket_url

export const signinInfo = { username: signin.username, cellnumber: signin.cellnumber, password: signin.password, confirmPassword: signin.confirmPassword, latitude: 43.663631, longitude: -79.351501 }
export const socket = io.connect(socket_url)
export const url = local_url ? wifi_api_url : server_api_url
export const isLocal = test_input
export const useSpeech = local_url == false
export const logo_url = url + "/static/"
