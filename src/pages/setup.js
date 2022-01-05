import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { CommonActions } from '@react-navigation/native';
import { setupUser } from '../apis/users'
import { registerInfo } from '../../assets/info'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight

const fsize = p => {
	return width * p
}

export default function setup({ navigation }) {
	const [cameraPermission, setCamerapermission] = useState(null);
	const [pickingPermission, setPickingpermission] = useState(null);
	const [camComp, setCamcomp] = useState(null)
	const [camType, setCamtype] = useState(Camera.Constants.Type.front);
	const [profile, setProfile] = useState({ uri: '', name: '' })
	const [username, setUsername] = useState(registerInfo.username)
	
	const [loading, setLoading] = useState(false)
	const [errorMsg, setErrormsg] = useState('')
	
	const setupAccount = async() => {
		const userid = await AsyncStorage.getItem("userid")
		const time = Date.now()

		if (username) {
			const data = { userid, username, profile, permission: cameraPermission && pickingPermission, time }

			setLoading(true)
			setupUser(data)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						AsyncStorage.setItem("setup", "true")

						navigation.dispatch(
							CommonActions.reset({
								index: 0,
								routes: [{ name: "main", params: { firstTime: true } }]
							})
						)
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						const { errormsg, status } = err.response.data

						setLoading(false)
						setErrormsg(errormsg)
					} else {
						setErrormsg("an error has occurred in server")
					}
				})
		} else {
			if (!username) {
				setErrormsg("Please enter a username you like")

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
			let options = { quality: 0, base64: true, skipProcessing: true };
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
		allowCamera()
		allowChoosing()
	}, [])

	if (cameraPermission === null || pickingPermission === null) return <View/>

	return (
		<View style={[style.setup, { opacity: loading ? 0.5 : 1 }]}>
			<ScrollView style={{ backgroundColor: '#EAEAEA', height: '90%', width: '100%' }}>
				<View style={style.box}>
					<Text style={style.boxHeader}>Setup</Text>

					<View style={style.inputsBox}>
						<View style={style.inputContainer}>
							<Text style={style.inputHeader}>Enter a name you like:</Text>
							<TextInput style={style.input} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Enter a username" autoCapitalize="none" onChangeText={(username) => setUsername(username)} value={username} autoCorrect={false}/>
						</View>

						<View style={style.cameraContainer}>
							<Text style={style.inputHeader}>Profile Picture</Text>

							{profile.uri ? (
								<>
									<Image style={style.camera} source={{ uri: profile.uri }}/>

									<TouchableOpacity style={style.cameraAction} onPress={() => setProfile({ uri: '', name: '' })}>
										<Text style={style.cameraActionHeader}>Cancel</Text>
									</TouchableOpacity>
								</>
							) : (
								<>
									<Camera 
										style={style.camera} 
										type={camType} ref={r => {setCamcomp(r)}}
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
							)}	
						</View>
					</View>

					{errorMsg ? <Text style={style.errorMsg}>{errorMsg}</Text> : null }
					{loading ? <ActivityIndicator color="black" size="small"/> : null}

					<TouchableOpacity style={style.setupButton} disabled={loading} onPress={() => setupAccount()}>
						<Text style={style.setupButtonHeader}>Done</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>

			<View style={style.bottomNavs}>
				<View style={style.bottomNavsRow}>
					<TouchableOpacity style={style.bottomNav} onPress={() => {
						AsyncStorage.clear()

						navigation.dispatch(
							CommonActions.reset({
								index: 1,
								routes: [{ name: 'main' }]
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
	setup: { backgroundColor: 'white', height: '100%', paddingVertical: offsetPadding, width: '100%' },
	box: { alignItems: 'center', width: '100%' },
	boxHeader: { fontFamily: 'appFont', fontSize: fsize(0.1), fontWeight: 'bold', paddingVertical: 30 },

	inputsBox: { paddingHorizontal: 20, width: '90%' },
	inputContainer: { marginVertical: 30, width: '100%' },
	inputHeader: { fontFamily: 'appFont', fontSize: fsize(0.06) },
	input: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: fsize(0.06), padding: 5, width: '100%' },
	cameraContainer: { alignItems: 'center', marginBottom: 50, width: '100%' },
	cameraHeader: { fontFamily: 'appFont', fontWeight: 'bold', paddingVertical: 5 },
	camera: { height: fsize(0.7), width: fsize(0.7) },
	cameraActions: { flexDirection: 'row' },
	cameraAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: 100 },
	cameraActionHeader: { fontSize: fsize(0.03), textAlign: 'center' },

	errorMsg: { color: 'darkred', fontWeight: 'bold', textAlign: 'center' },

	setupButton: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginBottom: 50, marginTop: 5, padding: 10 },
	setupButtonHeader: { fontFamily: 'appFont', fontSize: fsize(0.05) },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
	bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', justifyContent: 'space-around', margin: 5 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },
})
