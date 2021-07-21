import axios from 'axios'
import { LOCAL_API_URL, WIFI_API_URL } from "@env"

const url = LOCAL_API_URL

export const getTransactions = (data) => {
	return axios.post(
		`${url}/transactions/get_transactions`,
		data
	)
}
