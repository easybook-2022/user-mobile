import axios from 'axios'
import { url } from '../../assets/info'

const beginUrl = `${url}/locations/`

export const getLocations = data => {
	return axios.post(
		`${beginUrl}get_locations`,
		data
	)
}

export const getMoreLocations = data => {
	return axios.post(
		`${beginUrl}get_more_locations`,
		data
	)
}

export const getLocationProfile = data => {
	return axios.post(
		`${beginUrl}get_location_profile`,
		data
	)
}

export const makeReservation = data => {
	return axios.post(
		`${beginUrl}make_reservation`,
		data
	)
}

export const getLocationHours = id => {
	return axios.get(`${beginUrl}get_location_hours/${id}`)
}

export const getDayHours = data => {
  return axios.post(
    `${beginUrl}get_day_hours`,
    data
  )
}
