import axios from 'axios'
import { LOCAL_API_URL, WIFI_API_URL } from "@env"

const url = LOCAL_API_URL

export const getMenus = (data) => {
	return axios.post(
		`${url}/menus/get_menus`,
		data
	)
}
