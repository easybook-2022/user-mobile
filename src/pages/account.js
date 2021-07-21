import React, { useState, useEffect } from 'react';
import { AsyncStorage, Dimensions, SafeAreaView, ScrollView, View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import { CommonActions } from '@react-navigation/native';
import { info, logo_url } from '../../assets/info'
import { getUserInfo, updateUser } from '../apis/users'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')

export default function account({ navigation }) {
	const [permission, setPermission] = useState(null);
	const [camComp, setCamcomp] = useState(null)
	const [camType, setCamtype] = useState(Camera.Constants.Type.back);

	const [username, setUsername] = useState('')
	const [phonenumber, setPhonenumber] = useState(info.cellnumber)
	const [password, setPassword] = useState(info.password)
	const [confirmpassword, setConfirmpassword] = useState(info.password)
	const [profile, setProfile] = useState({ uri: '', name: '' })
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
					const userInfo = res.userInfo

					setUsername(userInfo.username)
					setPhonenumber(userInfo.cellnumber)
					setProfile({ uri: logo_url + userInfo.profile, name: userInfo.profile })
				}
			})
	}
	const updateAccount = async() => {
		const userid = await AsyncStorage.getItem("userid")

		if (username && phonenumber && profile.name) {
			const data = { userid, username, phonenumber, profile }

			updateUser(data)
				.then((res) => {
					if (res.status == 200) {
						if (!res.data.errormsg) {
							return res.data
						} else {
							setErrormsg(res.data.errormsg)
						}
					}
				})
				.then((res) => {
					if (res) {
						navigation.dispatch(
							CommonActions.reset({
								index: 0,
								routes: [{ name: "main" }]
							})
						)
					}
				})
		} else {
			if (!username) {
				setErrormsg("Please enter a username you like")

				return
			}

			if (!phonenumber) {
				setErrormsg("Please enter your cell phone number")

				return
			}

			if (!profile.name) {
				setErrormsg("Please take a photo of yourself for identification purpose")

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
			let photo_option = [{ resize: { width: width, height: width }}]
			let photo_save_option = { format: ImageManipulator.SaveFormat.JPEG, base64: true }

			if (camType == Camera.Constants.Type.front) {
				photo_option.push({ flip: ImageManipulator.FlipType.Horizontal })
			}

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
	const openCamera = async() => {
		const { status } = await Camera.getPermissionsAsync()

		if (status == 'granted') {
			setPermission(status === 'granted')
		} else {
			const { status } = await Camera.requestPermissionsAsync()

			setPermission(status === 'granted')
		}
	}

	useEffect(() => {
		getTheUserInfo()
		openCamera()
	}, [])

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<ScrollView style={{ width: '100%' }}>
				<TouchableOpacity style={style.back} onPress={() => navigation.goBack()}>
					<Text style={style.backHeader}>Back</Text>
				</TouchableOpacity>

				<View style={style.box}>
					<Text style={style.boxHeader}>Account</Text>

					<View style={style.inputsBox}>
						<View style={style.inputContainer}>
							<Text style={style.inputHeader}>Username:</Text>
							<TextInput style={style.input} placeholder="username" onChangeText={(username) => setUsername(username)} value={username}/>
						</View>

						<View style={style.inputContainer}>
							<Text style={style.inputHeader}>Cell number:</Text>
							<TextInput style={style.input} placeholder="cell phone number" onChangeText={(phonenumber) => setPhonenumber(phonenumber)} value={phonenumber}/>
						</View>

						<View style={style.cameraContainer}>
							<Text style={style.cameraHeader}>Profile Picture</Text>

							{profile.uri ? (
								<>
									<Image style={style.camera} source={{ uri: profile.uri }}/>

									<TouchableOpacity style={style.cameraAction} onPress={() => setProfile({ uri: '', name: '' })}>
										<AntDesign name="closecircleo" size={30}/>
									</TouchableOpacity>
								</>
							) : (
								<>
									<Camera style={style.camera} type={camType} ref={r => {setCamcomp(r)}}/>

									<TouchableOpacity style={style.cameraAction} onPress={snapPhoto.bind(this)}>
										<Entypo name="camera" size={30}/>
									</TouchableOpacity>
								</>
							)}	
						</View>
					</View>

					{errorMsg ? <Text style={style.errorMsg}>{errorMsg}</Text> : null }

					<TouchableOpacity style={style.updateButton} onPress={() => updateAccount()}>
						<Text>Done</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const style = StyleSheet.create({
	box: { alignItems: 'center', height: '100%', width: '100%' },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, margin: 20, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: 20 },
	boxHeader: { fontFamily: 'appFont', fontSize: 30, fontWeight: 'bold', textAlign: 'center' },

	inputsBox: { paddingHorizontal: 20, width: '80%' },
	inputContainer: { marginVertical: 30 },
	inputHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold' },
	input: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: 20, padding: 5 },
	cameraContainer: { alignItems: 'center', marginBottom: 50, width: '100%' },
	cameraHeader: { fontFamily: 'appFont', fontWeight: 'bold', paddingVertical: 5 },
	camera: { height: width * 0.8, width: width * 0.8 },
	cameraAction: { margin: 10 },
	errorMsg: { color: 'red', fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },
	updateButton: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 20, padding: 10 },
})
