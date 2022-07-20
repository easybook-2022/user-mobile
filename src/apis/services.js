import axios from 'axios'
import { url } from '../../assets/info'

const beginUrl = `${url}/services/`

export const getServiceInfo = id => {
	return axios.get(`${beginUrl}get_service_info/${id}`)
}
