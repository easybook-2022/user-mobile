import axios from 'axios'
import { url } from '../../assets/info'

export const getWorkers = locationid => {
	return axios.get(`${url}/owners/get_workers/${locationid}`)
}

export const getWorkerInfo = id => {
	return axios.get(`${url}/owners/get_worker_info/${id}`)
}

export const searchWorkers = data => {
	return axios.post(
		`${url}/owners/search_workers`,
		data
	)
}

export const getWorkersTime = locationid => {
  return axios.get(`${url}/owners/get_workers_time/${locationid}`)
}
