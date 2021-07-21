import React, { useState, useEffect } from 'react';
import { AsyncStorage, Dimensions, ScrollView, View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import * as Location from 'expo-location';
import { CommonActions } from '@react-navigation/native';
import { setupUser } from '../apis/users'
import { info } from '../../assets/info'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

export default function setup({ navigation }) {
	const [permission, setPermission] = useState(null);
	const [camComp, setCamcomp] = useState(null)
	const [camType, setCamtype] = useState(Camera.Constants.Type.back);
	const [profile, setProfile] = useState({ uri: '', name: '' })
	const [username, setUsername] = useState('')
	const [errorMsg, setErrormsg] = useState('')
	
	const setupAccount = async() => {
		const userid = await AsyncStorage.getItem("userid")

		if (username && profile.name) {
			const data = { userid, username, profile }

			setupUser(data)
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
						AsyncStorage.setItem("setup", "true")

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
		(async() => openCamera())()
	}, [])

	if (permission === null) return <View/>

	return (
		<View style={{ paddingVertical: offsetPadding }}>
			<ScrollView style={{ width: '100%' }}>
				<View style={style.box}>
					<Text style={style.boxHeader}>Setup</Text>

					<View style={style.inputsBox}>
						<View style={style.inputContainer}>
							<Text style={style.inputHeader}>Username:</Text>
							<TextInput style={style.input} placeholder="Enter a username" onChangeText={(username) => setUsername(username)} value={username}/>
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

					<TouchableOpacity style={style.setupButton} onPress={() => setupAccount()}>
						<Text>Done</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>

			<View style={style.bottomNavs}>
				<View style={{ flexDirection: 'row' }}>
					<TouchableOpacity style={style.bottomNav} onPress={() => navigation.navigate("settings")}>
						<AntDesign name="setting" size={30}/>
					</TouchableOpacity>
					<TouchableOpacity style={style.bottomNav} onPress={() => {
						AsyncStorage.clear()

						navigation.dispatch(
							CommonActions.reset({
								index: 1,
								routes: [{ name: 'login' }]
							})
						);
					}}>
						<Text style={style.bottomNavHeader}>Log-Out</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	)
}

const style = StyleSheet.create({
	box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	boxHeader: { fontFamily: 'appFont', fontSize: 50, fontWeight: 'bold', paddingVertical: 30 },

	inputsBox: { paddingHorizontal: 20, width: '80%' },
	inputContainer: { marginVertical: 30 },
	inputHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold' },
	input: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: 20, padding: 5 },
	cameraContainer: { alignItems: 'center', marginBottom: 50, width: '100%' },
	cameraHeader: { fontFamily: 'appFont', fontWeight: 'bold', paddingVertical: 5 },
	camera: { height: width * 0.8, width: width * 0.8 },
	cameraAction: { margin: 10 },
	errorMsg: { color: 'red', fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },
	setupButton: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 20, padding: 10 },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', height: 30, marginVertical: 5, marginHorizontal: 20 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },
})
