import axios from 'axios'
import { url } from '../../assets/info'

export const getAllWorkers = id => {
	return axios.get(`${url}/workers/get_all_workers/${id}`)
}

export const getWorkerInfo = id => {
	return axios.get(`${url}/workers/get_worker_info/${id}`)
}

export const getAllWorkersTime = id => {
  return axios.get(`${url}/workers/get_all_workers_time/${id}`)
}

export const getWorkersHour = data => {
  return axios.post(
    `${url}/workers/get_workers_hour`,
    data
  )
}

export const searchWorkers = data => {
	return axios.post(
		`${url}/workers/search_workers`,
		data
	)
}

export const getWorkersTime = id => {
  return axios.get(`${url}/workers/get_workers_time/${id}`)
}
