import React, { useState, useEffect } from 'react';
import { AsyncStorage, ActivityIndicator, Dimensions, ScrollView, View, Text, TextInput, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Constants from 'expo-constants';
import stripe from 'tipsi-stripe'
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import { CommonActions } from '@react-navigation/native';
import { info, logo_url } from '../../assets/info'
import { 
	getUserInfo, updateUser, addPaymentMethod, getPaymentMethods, 
	setPaymentmethodDefault, getPaymentmethodInfo, deleteThePaymentMethod
} from '../apis/users'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

stripe.setOptions({
	publishableKey: 'pk_test_bWW1YHLx5wgY3rU9fk6cNhBu'
})

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

export default function account({ navigation }) {
	const [permission, setPermission] = useState(null);
	const [camComp, setCamcomp] = useState(null)
	const [camType, setCamtype] = useState(Camera.Constants.Type.back);

	const [username, setUsername] = useState('')
	const [phonenumber, setPhonenumber] = useState(info.cellnumber)
	const [password, setPassword] = useState(info.password)
	const [confirmpassword, setConfirmpassword] = useState(info.password)
	const [profile, setProfile] = useState({ uri: '', name: '', old: '' })
	const [paymentMethods, setPaymentMethods] = useState([])
	const [loaded, setLoaded] = useState(false)
	const [paymentMethodForm, setPaymentmethodform] = useState({
		show: false,
		type: '',
		number: '', expMonth: '', expYear: '', cvc: ''
	})
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
					setPhonenumber(cellnumber)
					setProfile({ uri: '', name: '', old: profile })
				}
			})
	}

	const addNewPaymentMethod = async() => {
		const userid = await AsyncStorage.getItem("userid")
		const { number, expMonth, expYear, cvc } = paymentMethodForm
		const data = { userid }
		const params = { number: '4000000000000077', expMonth: 11, expYear: 23, cvc: '223' }

		const token = await stripe.createTokenWithCard(params)

		data['cardtoken'] = token.tokenId

		addPaymentMethod(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setPaymentmethodform({
						...paymentMethodForm,
						show: false,
						number: '', expMonth: '', expYear: '', cvc: ''
					})
					getThePaymentMethods()
				}
			})
	}
	const updateThePaymentMethod = async() => {

	}

	const usePaymentMethod = async(cardid) => {
		const userid = await AsyncStorage.getItem("userid")
		const data = { userid, cardid }

		setPaymentmethodDefault(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const newPaymentmethods = [...paymentMethods]

					newPaymentmethods.forEach(function (data) {
						data.default = false

						if (data.cardid == cardid) {
							data.default = true
						}
					})

					setPaymentMethods(newPaymentmethods)
				}
			})
	}
	const editPaymentMethod = async(cardid, index) => {
		const userid = await AsyncStorage.getItem("userid")
		const data = { userid, cardid }

		getPaymentmethodInfo(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { exp_month, exp_year, last4 } = res.paymentmethodInfo

					setPaymentmethodform({
						show: true,
						index,
						type: 'edit',

						number: '',
						placeholder: "****" + last4,
						expMonth: exp_month,
						expYear: exp_year,
						cvc: ''
					})
				}
			})
	}
	const deletePaymentMethod = async(cardid, index) => {
		const userid = await AsyncStorage.getItem("userid")
		const data = { userid, cardid }

		deleteThePaymentMethod(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const newPaymentmethods = [...paymentMethods]

					newPaymentmethods.splice(index, 1)

					setPaymentMethods(newPaymentmethods)
				}
			})
	}

	const getThePaymentMethods = async() => {
		const userid = await AsyncStorage.getItem("userid")

		getPaymentMethods(userid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setPaymentMethods(res.cards)
					setLoaded(true)
				}
			})
	}
	const updateAccount = async() => {
		const userid = await AsyncStorage.getItem("userid")

		if (username && phonenumber) {
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
		getThePaymentMethods()

		openCamera()
	}, [])

	return (
		<View style={{ paddingVertical: offsetPadding }}>
			<View style={style.box}>
				<TouchableOpacity style={style.back} onPress={() => navigation.goBack()}>
					<Text style={style.backHeader}>Back</Text>
				</TouchableOpacity>

				{loaded ? 
					<ScrollView>
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

										<TouchableOpacity style={style.cameraAction} onPress={() => setProfile({ ...profile, uri: '', name: '' })}>
											<AntDesign name="closecircleo" size={30}/>
										</TouchableOpacity>
									</>
								) : (
									profile.old ? 
										<>
											<Image style={style.camera} source={{ uri: logo_url + profile.old }}/>

											<TouchableOpacity style={style.cameraAction} onPress={() => setProfile({ uri: '', name: '', old: '' })}>
												<AntDesign name="closecircleo" size={30}/>
											</TouchableOpacity>
										</>
										:
										<>
											<Camera style={style.camera} type={camType} ref={r => {setCamcomp(r)}}/>

											<TouchableOpacity style={style.cameraAction} onPress={snapPhoto.bind(this)}>
												<Entypo name="camera" size={30}/>
											</TouchableOpacity>
										</>
								)}	
							</View>

							<View style={{ alignItems: 'center' }}>
								<TouchableOpacity style={style.updateButton} onPress={() => updateAccount()}>
									<Text>Done</Text>
								</TouchableOpacity>
							</View>
						</View>

						<View style={style.paymentMethods}>
							<Text style={style.paymentMethodHeader}>Payment Method(s)</Text>

							<TouchableOpacity style={style.paymentMethodAdd} onPress={() => {
								setPaymentmethodform({
									show: true,
									type: 'add',
									number: '', expMonth: '', expYear: '', cvc: ''
								})
							}}>
								<Text>Add a card</Text>
							</TouchableOpacity>

							{paymentMethods.map((info, index) => (
								<View key={info.key} style={style.paymentMethod}>
									<View style={style.paymentMethodRow}>
										<Text style={style.paymentMethodHeader}>#{index + 1}:</Text>
										<View style={style.paymentMethodImageHolder}>
											<Image style={style.paymentMethodImage} source={require("../../assets/visa.png")}/>
										</View>
										<View style={style.paymentMethodNumberHolder}>
											<Text style={style.paymentMethodNumberHeader}>{info.number}</Text>
										</View>
									</View>
									<View style={style.paymentMethodActions}>
										<TouchableOpacity style={info.default ? style.paymentMethodActionDisabled : style.paymentMethodAction} disabled={info.default} onPress={() => usePaymentMethod(info.cardid)}>
											<Text style={info.default ? style.paymentMethodActionHeaderDisabled : style.paymentMethodActionHeader}>Use as default</Text>
										</TouchableOpacity>
										<TouchableOpacity style={style.paymentMethodAction} onPress={() => editPaymentMethod(info.cardid, index)}>
											<Text style={style.paymentMethodActionHeader}>Change info</Text>
										</TouchableOpacity>
										<TouchableOpacity style={info.default ? style.paymentMethodActionDisabled : style.paymentMethodAction} disabled={info.default} onPress={() => deletePaymentMethod(info.cardid, index)}>
											<Text style={info.default ? style.paymentMethodActionHeaderDisabled : style.paymentMethodActionHeader}>Delete</Text>
										</TouchableOpacity>
									</View>
								</View>
							))}
						</View>

						{errorMsg ? <Text style={style.errorMsg}>{errorMsg}</Text> : null }
					</ScrollView>
					:
					<ActivityIndicator size="small"/>
				}
			</View>

			{paymentMethodForm.show && (
				<Modal transparent={true}>
					<View style={{ paddingVertical: offsetPadding }}>
						<View style={style.form}>
							<View style={style.formContainer}>
								<View style={{ alignItems: 'center', marginVertical: 20 }}>
									<TouchableOpacity onPress={() => {
										setPaymentmethodform({
											show: false,
											type: '',
											number: '', expMonth: '', expYear: '', cvc: ''
										})
									}}>
										<AntDesign name="closecircleo" size={30}/>
									</TouchableOpacity>
								</View>

								<Text style={style.formHeader}>{paymentMethodForm.type == 'add' ? 'Add' : 'Editing'} payment method</Text>

								<View style={style.formInputField}>
									<Text style={style.formInputHeader}>Card number</Text>
									<TextInput style={style.formInputInput} onChangeText={(number) => setPaymentmethodform({
										...paymentMethodForm,
										number: number.toString()
									})} value={paymentMethodForm.number} keyboardType="numeric"/>
								</View>
								<View style={style.formInputField}>
									<Text style={style.formInputHeader}>Expiry month</Text>
									<TextInput style={style.formInputInput} onChangeText={(expMonth) => setPaymentmethodform({
										...paymentMethodForm,
										expMonth: expMonth.toString()
									})} value={paymentMethodForm.expMonth} keyboardType="numeric" placeholder="MM" maxLength={2}/>
								</View>
								<View style={style.formInputField}>
									<Text style={style.formInputHeader}>Expiry Year</Text>
									<TextInput style={style.formInputInput} onChangeText={(expYear) => setPaymentmethodform({
										...paymentMethodForm,
										expYear: expYear.toString()
									})} value={paymentMethodForm.expYear} keyboardType="numeric" placeholder="YYYY" maxLength={4}/>
								</View>
								<View style={style.formInputField}>
									<Text style={style.formInputHeader}>Security Code</Text>
									<TextInput style={style.formInputInput} onChangeText={(cvc) => setPaymentmethodform({
										...paymentMethodForm,
										cvc: cvc.toString()
									})} value={paymentMethodForm.cvc} keyboardType="numeric"/>
								</View>

								<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
									<TouchableOpacity style={style.formSubmit} onPress={() => {
										if (paymentMethodForm.type == 'add') {
											addNewPaymentMethod()
										} else {
											updateThePaymentMethod()
										}
									}}>
										<Text style={style.formSubmitHeader}>{paymentMethodForm.type == 'add' ? 'Add' : 'Save'} Payment Method</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</View>
				</Modal>
			)}
		</View>
	);
}

const style = StyleSheet.create({
	box: { height: '100%', width: '100%' },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, height: 34, margin: 20, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: 20 },
	boxHeader: { fontFamily: 'appFont', fontSize: 30, fontWeight: 'bold', textAlign: 'center' },

	inputsBox: { marginBottom: 100, paddingHorizontal: 50 },
	inputContainer: { marginVertical: 30 },
	inputHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold' },
	input: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: 20, padding: 5 },
	cameraContainer: { alignItems: 'center', marginBottom: 50, width: '100%' },
	cameraHeader: { fontFamily: 'appFont', fontWeight: 'bold', paddingVertical: 5 },
	camera: { height: width * 0.8, width: width * 0.8 },
	cameraAction: { margin: 10 },

	paymentMethods: { alignItems: 'center', marginHorizontal: 10, marginTop: 50 },
	paymentMethodHeader: { fontFamily: 'appFont', fontSize: 20, textAlign: 'center' },
	paymentMethodAdd: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 3, padding: 5 },
	paymentMethod: { marginVertical: 30 },
	paymentMethodRow: { flexDirection: 'row', justifyContent: 'space-between' },
	paymentMethodHeader: { fontSize: 20, fontWeight: 'bold', padding: 5 },
	paymentMethodImageHolder: { height: 40, margin: 2, width: 40 },
	paymentMethodImage: { height: 40, width: 40 },
	paymentMethodNumberHolder: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 5, flexDirection: 'row', justifyContent: 'space-between', padding: 5, width: '70%' },
	paymentMethodNumberHeader: { fontSize: 20, paddingVertical: 4, textAlign: 'center', width: '50%' },
	paymentMethodActions: { flexDirection: 'row', justifyContent: 'space-around' },
	paymentMethodAction: { borderRadius: 2, borderStyle: 'solid', borderWidth: 2, marginTop: 5, padding: 5, width: 100 },
	paymentMethodActionHeader: { fontSize: 12, textAlign: 'center' },
	paymentMethodActionDisabled: { backgroundColor: 'black', borderRadius: 2, borderStyle: 'solid', borderWidth: 2, marginTop: 5, padding: 5, width: 100 },
	paymentMethodActionHeaderDisabled: { color: 'white', fontSize: 12, textAlign: 'center' },

	errorMsg: { color: 'red', fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },

	updateButton: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 20, padding: 10, width: 100 },

	// form
	form: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	formContainer: { backgroundColor: 'white', height: '70%', width: '80%' },
	formHeader: { fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
	formInputField: { marginBottom: 20, marginHorizontal: '10%', width: '80%' },
	formInputHeader: { fontSize: 20, fontWeight: 'bold' },
	formInputInput: { borderRadius: 2, borderStyle: 'solid', borderWidth: 3, padding: 5, width: '100%' },
	formSubmit: { alignItems: 'center', borderRadius: 2, borderStyle: 'solid', borderWidth: 1, padding: 5 },
	formSubmitHeader: {  },
})
