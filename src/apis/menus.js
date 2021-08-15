import axios from 'axios'
import { local_api_url, wifi_api_url } from '../../assets/info'

export const getMenus = data => {
	return axios.post(
		`${wifi_api_url}/menus/get_menus`,
		data
	)
}
