import React, { useState, useEffect } from 'react';
import { SafeAreaView, ActivityIndicator, Dimensions, ScrollView, View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
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
const wsize = p => {
  return width * (p / 100)
}
const hsize = p => {
  return height * (p / 100)
}
const steps = ['nickname', 'profile']

export default function Setup({ navigation }) {
  const [setupType, setSetuptype] = useState('nickname')
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

		if (username) {
			const data = { userid, username, profile, permission: cameraPermission && pickingPermission }

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
  const saveInfo = () => {
    const index = steps.indexOf(setupType)
    let nextStep, msg = ""

    setLoading(true)

    switch (index) {
      case 0:
        if (!username) {
          msg = "Please provide a name you like"
        }

        break
      case 1:
        if (!profile.uri && Platform.OS == 'ios') {
          msg = "Please provide a profile you like"
        }
    }

    if (msg == "") {
      nextStep = index == 1 ? "done" : steps[index + 1]

      if (nextStep == "profile") {
        allowCamera()
        allowChoosing()
      }

      setSetuptype(nextStep)
    }

    setLoading(false)
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
		<SafeAreaView style={[styles.setup, { opacity: loading ? 0.5 : 1 }]}>
			<ScrollView style={{ backgroundColor: '#EAEAEA', height: '90%', width: '100%' }}>
				<View style={styles.box}>
					<Text style={styles.boxHeader}>Setup</Text>

					<View style={styles.inputsBox}>
            {setupType == "nickname" && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputHeader}>Enter a name you like:</Text>
                <TextInput style={styles.input} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Enter a username" autoCapitalize="none" onChangeText={(username) => setUsername(username)} value={username} autoCorrect={false}/>
              </View>
            )}

            {(setupType == "profile" && (cameraPermission !== null || pickingPermission !== null)) && (
              <View style={styles.cameraContainer}>
                <Text style={styles.inputHeader}>Provide a photo of yourself</Text>

                {profile.uri ? (
                  <>
                    <Image style={styles.camera} source={{ uri: profile.uri }}/>

                    <TouchableOpacity style={styles.cameraAction} onPress={() => setProfile({ uri: '', name: '' })}>
                      <Text style={styles.cameraActionHeader}>Cancel</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Camera 
                      style={styles.camera} 
                      type={camType} ref={r => {setCamcomp(r)}}
                      ratio="1:1"
                    />

                    <View style={styles.cameraActions}>
                      <TouchableOpacity style={styles.cameraAction} onPress={snapPhoto.bind(this)}>
                        <Text style={styles.cameraActionHeader}>Take{'\n'}this photo</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.cameraAction} onPress={() => choosePhoto()}>
                        <Text style={styles.cameraActionHeader}>Choose{'\n'}from phone</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}  
              </View>
            )}
					</View>

					{errorMsg ? <Text style={styles.errorMsg}>{errorMsg}</Text> : null }
					{loading ? <ActivityIndicator color="black" size="small"/> : null}

          <View style={styles.actions}>
            {setupType != "nickname" && (
              <TouchableOpacity style={[styles.action, { opacity: loading ? 0.3 : 1 }]} onPress={() => {
                let index = steps.indexOf(setupType)

                index--

                setSetuptype(steps[index])
              }}>
                <Text style={styles.actionHeader}>Back</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.action} disabled={loading} onPress={() => setupType == "profile" ? setupAccount() : saveInfo()}>
              <Text style={styles.actionHeader}>{setupType == "profile" ? "Done" : "Next"}</Text>
            </TouchableOpacity>
          </View>
				</View>
			</ScrollView>

			<View style={styles.bottomNavs}>
				<View style={styles.bottomNavsRow}>
					<TouchableOpacity style={styles.bottomNav} onPress={() => {
						AsyncStorage.clear()

						navigation.dispatch(
							CommonActions.reset({
								index: 1,
								routes: [{ name: 'main' }]
							})
						);
					}}>
						<Text style={styles.bottomNavHeader}>Log-Out</Text>
					</TouchableOpacity>
				</View>
			</View>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	setup: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { alignItems: 'center', width: '100%' },
	boxHeader: { fontFamily: 'appFont', fontSize: wsize(10), fontWeight: 'bold', paddingVertical: 30 },

	inputsBox: { paddingHorizontal: 20, width: '90%' },
	inputContainer: { marginVertical: 30, width: '100%' },
	inputHeader: { fontFamily: 'appFont', fontSize: wsize(5) },
	input: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(6), padding: 5, width: '100%' },
	cameraContainer: { alignItems: 'center', marginBottom: 50, width: '100%' },
	cameraHeader: { fontFamily: 'appFont', fontWeight: 'bold', paddingVertical: 5 },
	camera: { height: wsize(70), width: wsize(70) },
	cameraActions: { flexDirection: 'row' },
	cameraAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: 100 },
	cameraActionHeader: { fontSize: wsize(3), textAlign: 'center' },

	errorMsg: { color: 'darkred', fontSize: wsize(4), textAlign: 'center' },

  actions: { flexDirection: 'row', marginBottom: 50 },
	action: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 10 },
	actionHeader: { fontFamily: 'appFont', fontSize: wsize(5) },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
	bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', justifyContent: 'space-around', margin: 5, width: wsize(30) },
	bottomNavHeader: { fontSize: wsize(5) },
})
