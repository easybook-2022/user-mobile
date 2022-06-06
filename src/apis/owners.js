import axios from 'axios'
import { url } from '../../assets/info'

export const getAllStylists = id => {
	return axios.get(`${url}/owners/get_all_stylists/${id}`)
}

export const getStylistInfo = id => {
	return axios.get(`${url}/owners/get_stylist_info/${id}`)
}

export const getAllWorkersTime = id => {
  return axios.get(`${url}/owners/get_all_workers_time/${id}`)
}

export const getWorkersHour = data => {
  return axios.post(
    `${url}/owners/get_workers_hour`,
    data
  )
}

export const searchWorkers = data => {
	return axios.post(
		`${url}/owners/search_workers`,
		data
	)
}

export const getWorkersTime = id => {
  return axios.get(`${url}/owners/get_workers_time/${id}`)
}
