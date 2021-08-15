import axios from 'axios'
import { local_api_url, wifi_api_url } from '../../assets/info'

export const getTransactions = data => {
	return axios.post(
		`${wifi_api_url}/transactions/get_transactions`,
		data
	)
}
