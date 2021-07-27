import axios from 'axios'
import { LOCAL_API_URL, WIFI_API_URL } from "@env"

export const getTransactions = data => {
	return axios.post(
		`${WIFI_API_URL}/transactions/get_transactions`,
		data
	)
}
