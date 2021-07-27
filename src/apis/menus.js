import axios from 'axios'
import { LOCAL_API_URL, WIFI_API_URL } from "@env"

export const getMenus = data => {
	return axios.post(
		`${WIFI_API_URL}/menus/get_menus`,
		data
	)
}
