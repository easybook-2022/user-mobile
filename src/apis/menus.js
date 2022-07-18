import axios from 'axios'
import { url } from '../../assets/info'

const beginUrl = `${url}/menus/`

export const getMenus = id => {
	return axios.get(`${beginUrl}get_menus/${id}`)
}
