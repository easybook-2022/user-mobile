import React, { useState, useEffect } from 'react';
import { 
	SafeAreaView, ActivityIndicator, Dimensions, ScrollView, View, Text, TextInput, 
	Image, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet, Modal 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker';
import { CommonActions } from '@react-navigation/native';
import { cardInfo, stripe_key, logo_url } from '../../assets/info'
import { getUserInfo, updateUser } from '../apis/users'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

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

	const [cameraPermission, setCamerapermission] = useState(null);
	const [pickingPermission, setPickingpermission] = useState(null);
	const [camComp, setCamcomp] = useState(null)

	const [username, setUsername] = useState('')
	const [cellnumber, setCellnumber] = useState('')
	const [password, setPassword] = useState('')
	const [confirmpassword, setConfirmpassword] = useState('')
	const [profile, setProfile] = useState({ uri: '', name: '', old: '' })
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
					const { username, cellnumber, profile } = res.userInfo

					setUsername(username)
					setCellnumber(cellnumber)
					setProfile({ uri: '', name: '', old: profile })
          setLoaded(true)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					setErrormsg("an error has occurred in server")
				}
			})
	}

	const updateAccount = async() => {
		const userid = await AsyncStorage.getItem("userid")

		if (username && cellnumber) {
			const data = { userid, username, cellnumber, profile }

			setLoading(true)

			updateUser(data)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
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

						switch (status) {
							case "sameusername":
								setLoading(false)
								setErrormsg(errormsg)

								break
							case "samecellnumber":
								setLoading(false)
								setErrormsg(errormsg)

								break
							default:
						}
					} else {
						setErrormsg("an error has occurred in server")
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
		}
	}
	const snapPhoto = async() => {
		let letters = [
			"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", 
			"n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
		]
		let photo_name_length = Math.floor(Math.random() * (15 - 10)) + 10
		let char = "", captured, self = this

		if (camComp) {
			let options = { quality: 0 };
			let photo = await camComp.takePictureAsync(options)
			let photo_option = [
				{ resize: { width: width, height: width }},
				{ flip: ImageManipulator.FlipType.Horizontal }
			]
			let photo_save_option = { format: ImageManipulator.SaveFormat.JPEG, base64: true }

			photo = await ImageManipulator.manipulateAsync(
				photo.localUri || photo.uri,
				photo_option,
				photo_save_option
			)

			for (let k = 0; k <= photo_name_length - 1; k++) {
				if (k % 2 == 0) {
	                char += "" + letters[Math.floor(Math.random() * letters.length)].toUpperCase();
	            } else {
	                char += "" + (Math.floor(Math.random() * 9) + 0);
	            }
			}

			FileSystem.moveAsync({
				from: photo.uri,
				to: `${FileSystem.documentDirectory}/${char}.jpg`
			})
			.then(() => {
				setProfile({
					uri: `${FileSystem.documentDirectory}/${char}.jpg`,
					name: `${char}.jpg`
				})
			})
		}
	}
	const choosePhoto = async() => {
		let letters = [
			"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", 
			"n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
		]
		let photo_name_length = Math.floor(Math.random() * (15 - 10)) + 10
		let char = "", captured, self = this
		let photo = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			aspect: [4, 3],
			quality: 0.1,
			base64: true
		});

		for (let k = 0; k <= photo_name_length - 1; k++) {
			if (k % 2 == 0) {
                char += "" + letters[Math.floor(Math.random() * letters.length)].toUpperCase();
            } else {
                char += "" + (Math.floor(Math.random() * 9) + 0);
            }
		}

		if (!photo.cancelled) {
			FileSystem.moveAsync({
				from: photo.uri,
				to: `${FileSystem.documentDirectory}/${char}.jpg`
			})
			.then(() => {
				setProfile({
					uri: `${FileSystem.documentDirectory}/${char}.jpg`,
					name: `${char}.jpg`
				})
			})
		}
	}
	const allowCamera = async() => {
		const { status } = await Camera.getCameraPermissionsAsync()

		if (status == 'granted') {
			setCamerapermission(status === 'granted')
		} else {
			const { status } = await Camera.requestCameraPermissionsAsync()

			setCamerapermission(status === 'granted')
		}
	}
	const allowChoosing = async() => {
		const { status } = await ImagePicker.getMediaLibraryPermissionsAsync()
        
        if (status == 'granted') {
        	setPickingpermission(status === 'granted')
        } else {
        	const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        	setPickingpermission(status === 'granted')
        }
	}

	useEffect(() => {
		getTheUserInfo()

		allowCamera()
		allowChoosing()
	}, [])

	return (
		<SafeAreaView style={style.account}>
			<View style={style.box}>
				{loaded ? 
					<ScrollView>
						<View style={style.inputsBox}>
							<View style={style.inputContainer}>
								<Text style={style.inputHeader}>Username:</Text>
								<TextInput style={style.input} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="username" onChangeText={(username) => setUsername(username)} value={username} autoCorrect={false}/>
							</View>

							<View style={style.inputContainer}>
								<Text style={style.inputHeader}>Cell number:</Text>
								<TextInput style={style.input} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="cell phone number" onKeyPress={(e) => {
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

							<View style={style.cameraContainer}>
								<Text style={style.inputHeader}>Profile Picture</Text>

								{profile.uri ? 
									<>
										<Image style={style.camera} source={{ uri: profile.uri }}/>

										<TouchableOpacity style={style.cameraAction} onPress={() => setProfile({ ...profile, uri: '', name: '' })}>
											<Text style={style.cameraActionHeader}>Cancel</Text>
										</TouchableOpacity>
									</>
									:
									profile.old ? 
										<>
											<Image style={style.camera} source={{ uri: logo_url + profile.old }}/>

											<TouchableOpacity style={style.cameraAction} onPress={() => setProfile({ uri: '', name: '', old: '' })}>
												<Text style={style.cameraActionHeader}>Cancel</Text>
											</TouchableOpacity>
										</>
										:
										<>
											<Camera 
												style={style.camera} 
												type={Camera.Constants.Type.front} ref={r => {setCamcomp(r)}}
												ratio="1:1"
											/>

											<View style={style.cameraActions}>
												<TouchableOpacity style={style.cameraAction} onPress={snapPhoto.bind(this)}>
													<Text style={style.cameraActionHeader}>Take{'\n'}this photo</Text>
												</TouchableOpacity>
												<TouchableOpacity style={style.cameraAction} onPress={() => choosePhoto()}>
													<Text style={style.cameraActionHeader}>Choose{'\n'}from phone</Text>
												</TouchableOpacity>
											</View>
										</>
								}	
							</View>

							{loading ? <ActivityIndicator color="black" size="small"/> : null}

							<View style={{ alignItems: 'center' }}>
								<TouchableOpacity style={style.updateButton} onPress={() => updateAccount()}>
									<Text style={style.updateButtonHeader}>Done</Text>
								</TouchableOpacity>
							</View>
						</View>

						{errorMsg ? <Text style={style.errorMsg}>{errorMsg}</Text> : null }
					</ScrollView>
					:
					<View style={{ flexDirection: 'column', height: '100%', justifyContent: 'space-around' }}>
						<ActivityIndicator color="black" size="small"/>
					</View>
				}
			</View>
		</SafeAreaView>
	);
}

const style = StyleSheet.create({
	account: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },

	inputsBox: { alignItems: 'center', marginBottom: 50 },
	inputContainer: { marginVertical: 20, width: '90%' },
	inputHeader: { fontFamily: 'appFont', fontSize: wsize(6), fontWeight: 'bold' },
	input: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(6), padding: 5 },
	cameraContainer: { alignItems: 'center', marginVertical: 50, width: '100%' },
	camera: { height: wsize(70), width: wsize(70) },
	cameraActions: { flexDirection: 'row' },
	cameraAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: wsize(30) },
	cameraActionHeader: { fontSize: wsize(4), textAlign: 'center' },

	updateButton: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 20, padding: 10, width: wsize(30) },
	updateButtonHeader: { fontFamily: 'appFont', fontSize: wsize(5) },

	errorMsg: { color: 'darkred', fontSize: wsize(4), textAlign: 'center' },
})
