import axios from 'axios'
import { url } from '../../assets/info'

export const getMenus = data => {
	return axios.post(
		`${url}/menus/get_menus`,
		data
	)
}
