import axios from 'axios'
import { url } from '../../assets/info'

export const getTransactions = data => {
	return axios.post(
		`${url}/transactions/get_transactions`,
		data
	)
}
