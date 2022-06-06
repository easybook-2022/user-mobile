import axios from 'axios'
import { url } from '../../assets/info'

export const getBusinesses = data => {
	return axios.post(
		`${url}/businesses/get_businesses`,
		data
	)
}

export const getMoreBusinesses = data => {
	return axios.post(
		`${url}/businesses/get_more_businesses`,
		data
	)
}

export const getBusinessProfile = data => {
	return axios.post(
		`${url}/businesses/get_business_profile`,
		data
	)
}

export const makeReservation = data => {
	return axios.post(
		`${url}/businesses/make_reservation`,
		data
	)
}

export const getBusinessHours = id => {
	return axios.get(`${url}/businesses/get_business_hours/${id}`)
}

export const getDayHours = data => {
  return axios.post(
    `${url}/businesses/get_day_hours`,
    data
  )
}
