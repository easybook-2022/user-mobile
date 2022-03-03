import React, { useState, useEffect } from 'react';
import { 
	SafeAreaView, ActivityIndicator, Dimensions, ScrollView, View, Text, TextInput, 
	Image, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet, Modal 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { cardInfo, logo_url } from '../../assets/info'
import { getUserInfo, updateUser } from '../apis/users'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

// components
import Loadingprogress from '../components/loadingprogress';

const { height, width } = Dimensions.get('window')
const wsize = p => {
  return width * (p / 100)
}
const hsize = p => {
  return height * (p / 100)
}

export default function Account(props) {
	const amexLogo = require("../../assets/amex.jpg")
	const dinersclubLogo = require("../../assets/dinersclub.png")
	const discoverLogo = require("../../assets/discover.png")
	const jbcLogo = require("../../assets/jbc.png")
	const mastercardLogo = require("../../assets/mastercard.png")
	const unionpayLogo = require("../../assets/unionpay.png")
	const visaLogo = require("../../assets/visa.png")

	const { params } = props.route
	const refetch = params && params.refetch ? params.refetch : null
	const required = params && params.required ? params.required : null

	const [username, setUsername] = useState('')
	const [cellnumber, setCellnumber] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmpassword] = useState('')
	const [loaded, setLoaded] = useState(false)
	const [loading, setLoading] = useState(false)
	const [errorMsg, setErrormsg] = useState('')

	const getTheUserInfo = async() => {
		const userid = await AsyncStorage.getItem("userid")

		getUserInfo(userid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { username, cellnumber } = res.userInfo

					setUsername(username)
					setCellnumber(cellnumber)
          setLoaded(true)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					alert("get user info")
				}
			})
	}

	const updateAccount = async() => {
		const userid = await AsyncStorage.getItem("userid")

		if (username && cellnumber) {
			const data = { userid, username, cellnumber, password, confirmPassword }

			setLoading(true)

			updateUser(data)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
            setLoading(false)

						props.navigation.dispatch(
							CommonActions.reset({
								index: 0,
								routes: [{ name: "main" }]
							})
						)
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						const { errormsg, status } = err.response.data

						setErrormsg(errormsg)
            setLoading(false)
					} else {
						alert("update user")
					}
				})
		} else {
			if (!username) {
				setErrormsg("Please enter a username you like")

				return
			}

			if (!cellnumber) {
				setErrormsg("Please enter your cell phone number")

				return
			}

      if (password || confirmPassword) {
        if (!password) {
          setErrormsg("Please enter your new password")
        } else {
          setErrormsg("Please confirm your new password")
        }

        return
      }
		}
	}

	useEffect(() => {
		getTheUserInfo()
	}, [])

	return (
		<SafeAreaView style={styles.account}>
			<View style={styles.box}>
				{loaded ? 
					<ScrollView>
						<View style={styles.inputsBox}>
							<View style={styles.inputContainer}>
								<Text style={styles.inputHeader}>Username:</Text>
								<TextInput style={styles.input} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Username" onChangeText={(username) => setUsername(username)} value={username} autoCorrect={false}/>
							</View>

							<View style={styles.inputContainer}>
								<Text style={styles.inputHeader}>Cell number:</Text>
								<TextInput style={styles.input} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Cell phone number" onKeyPress={(e) => {
									let newValue = e.nativeEvent.key

									if (newValue >= "0" && newValue <= "9") {
										if (cellnumber.length == 3) {
											setCellnumber("(" + cellnumber + ") " + newValue)
										} else if (cellnumber.length == 9) {
											setCellnumber(cellnumber + "-" + newValue)
										} else if (cellnumber.length == 13) {
											setCellnumber(cellnumber + newValue)

											Keyboard.dismiss()
										} else {
											setCellnumber(cellnumber + newValue)
										}
									} else if (newValue == "Backspace") {
										setCellnumber(cellnumber.substr(0, cellnumber.length - 1))
									}
								}} keyboardType="numeric" value={cellnumber} autoCorrect={false}/>
							</View>

              <View style={{ alignItems: 'center', marginVertical: 30, width: '100%' }}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputHeader}>New password:</Text>
                  <TextInput style={styles.input} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="New password" secureTextEntry={true} onChangeText={(password) => setPassword(password)} value={password} autoCorrect={false}/>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputHeader}>Confirm your new password:</Text>
                  <TextInput style={styles.input} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Confirm password" secureTextEntry={true} onChangeText={(password) => setConfirmpassword(password)} value={confirmPassword} autoCorrect={false}/>
                </View>
              </View>

							<View style={{ alignItems: 'center' }}>
								<TouchableOpacity style={styles.updateButton} onPress={() => updateAccount()}>
									<Text style={styles.updateButtonHeader}>Save</Text>
								</TouchableOpacity>
							</View>
						</View>

						{errorMsg ? <Text style={styles.errorMsg}>{errorMsg}</Text> : null }
					</ScrollView>
					:
					<View style={{ flexDirection: 'column', height: '100%', justifyContent: 'space-around' }}>
						<ActivityIndicator color="black" size="small"/>
					</View>
				}
			</View>

      {loading && (
        <Modal transparent={true}>
          <Loadingprogress/>
        </Modal>
      )}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	account: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },

	inputsBox: { alignItems: 'center', marginBottom: 50 },
	inputContainer: { backgroundColor: 'rgba(127, 127, 127, 0.1)', borderRadius: 10, marginVertical: 10, padding: 10, width: '90%' },
	inputHeader: { fontFamily: 'appFont', fontSize: wsize(6), fontWeight: 'bold' },
	input: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(6), padding: 5 },

	updateButton: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 20, padding: 10, width: wsize(30) },
	updateButtonHeader: { fontFamily: 'appFont', fontSize: wsize(5) },

	errorMsg: { color: 'darkred', fontSize: wsize(4), textAlign: 'center' },
})
