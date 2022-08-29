import axios from 'axios'
import { url } from '../../assets/info'

const beginUrl = `${url}/owners/`

export const getAllStylists = data => {
  const { locationid, cancelToken } = data

	return axios.get(
    `${beginUrl}get_all_stylists/${locationid}`,
    { cancelToken }
  )
}

export const getStylistInfo = data => {
  const { workerid, cancelToken } = data

	return axios.get(
    `${beginUrl}get_stylist_info/${workerid}`,
    { cancelToken }
  )
}

export const getAllWorkersTime = data => {
  const { locationid, cancelToken } = data

  return axios.get(
    `${beginUrl}get_all_workers_time/${locationid}`,
    { cancelToken }
  )
}

export const getWorkersHour = data => {
  return axios.post(
    `${beginUrl}get_workers_hour`,
    data
  )
}

export const searchWorkers = data => {
	return axios.post(
		`${beginUrl}search_workers`,
		data
	)
}

export const getWorkersTime = data => {
  const { locationid, cancelToken } = data

  return axios.get(
    `${beginUrl}get_workers_time/${locationid}`,
    { cancelToken }
  )
}
