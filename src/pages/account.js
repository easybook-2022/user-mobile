import React, { useState, useEffect } from 'react';
import { 
	ActivityIndicator, Dimensions, ScrollView, View, Text, TextInput, 
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
import { 
	getUserInfo, updateUser, addPaymentMethod, updatePaymentMethod, getPaymentMethods, 
	setPaymentmethodDefault, getPaymentmethodInfo, deleteThePaymentMethod
} from '../apis/users'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight

const fsize = p => {
	return width * p
}

export default function account(props) {
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
	const [paymentMethods, setPaymentMethods] = useState([])
	const [loaded, setLoaded] = useState(false)
	const [paymentMethodForm, setPaymentmethodform] = useState({
		show: false,
		id: '',
		type: '',
		number: '', expMonth: '', expYear: '', cvc: '',

		loading: false
	})
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
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					setErrormsg("an error has occurred in server")
				}
			})
	}

	const openPaymentMethodForm = () => {
		setPaymentmethodform({
			...paymentMethodForm,
			show: true,
			type: 'add',
			number: cardInfo.number, expMonth: cardInfo.expMonth,
			expYear: cardInfo.expYear, cvc: cardInfo.cvc
		})
	}
	const addNewPaymentMethod = async() => {
		const userid = await AsyncStorage.getItem("userid")
		const { number, expMonth, expYear, cvc } = paymentMethodForm
		const data = { userid }
		const cardDetails = {
			"card[number]": number,
			"card[exp_month]": expMonth,
			"card[exp_year]": expYear,
			"card[cvc]": cvc,
		}

		setPaymentmethodform({
			...paymentMethodForm,
			loading: true
		})

		let formBody = [];
			
		for (let property in cardDetails) {
			let encodedKey = encodeURIComponent(property);
			let encodedValue = encodeURIComponent(cardDetails[property]);
			formBody.push(encodedKey + "=" + encodedValue);
		}
		formBody = formBody.join("&");
		
		const resp = await fetch("https://api.stripe.com/v1/tokens", {
			method: "post",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: "Bearer " + stripe_key,
			},
			body: formBody,
		});
		const json = await resp.json()

		data['cardtoken'] = json.id

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
						number: '', expMonth: '', expYear: '', cvc: '',
						loading: false
					})
					getThePaymentMethods()
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					setErrormsg("an error has occurred in server")
				}
			})
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
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					setErrormsg("an error has occurred in server")
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
						id: cardid,
						type: 'edit',

						number: cardInfo.number,
						placeholder: "****" + last4,
						expMonth: exp_month.toString(),
						expYear: exp_year.toString(),
						cvc: cardInfo.cvc
					})
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					setErrormsg("an error has occurred in server")
				}
			})
	}
	const updateThePaymentMethod = async() => {
		const userid = await AsyncStorage.getItem("userid")
		const { id, number, expMonth, expYear, cvc } = paymentMethodForm
		const data = { oldcardtoken: id, userid }
		const cardDetails = {
			"card[number]": number,
			"card[exp_month]": expMonth,
			"card[exp_year]": expYear,
			"card[cvc]": cvc,
		}

		setPaymentmethodform({
			...paymentMethodForm,
			loading: true
		})

		let formBody = [];
			
		for (let property in cardDetails) {
			let encodedKey = encodeURIComponent(property);
			let encodedValue = encodeURIComponent(cardDetails[property]);
			formBody.push(encodedKey + "=" + encodedValue);
		}
		formBody = formBody.join("&");
		
		const resp = await fetch("https://api.stripe.com/v1/tokens", {
			method: "post",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: "Bearer " + stripe_key,
			},
			body: formBody,
		});
		const json = await resp.json()

		data['cardtoken'] = json.id

		updatePaymentMethod(data)
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
						id: '',
						number: '', expMonth: '', expYear: '', cvc: '',
						loading: false
					})
					getThePaymentMethods()
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					setErrormsg("an error has occurred in server")
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
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					setErrormsg("an error has occurred in server")
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
					const cards = res.cards

					cards.forEach(function (card) {
						switch (card['cardname']) {
							case "American Express":
								card['logo'] = amexLogo

								break
							case "Diners Club":
								card['logo'] = dinersclubLogo

								break
							case "Discover":
								card['logo'] = discoverLogo

								break
							case "JCB":
								card['logo'] = jbcLogo
								break
							case "MasterCard":
								card['logo'] = mastercardLogo

								break
							case "UnionPay":
								card['logo'] = unionpayLogo

								break
							case "Visa":
								card['logo'] = visaLogo

								break
							default:
						}
					})

					setPaymentMethods(cards)
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
		getThePaymentMethods()

		allowCamera()
		allowChoosing()

		if (required == "card") openPaymentMethodForm()
	}, [])

	return (
		<View style={style.account}>
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
								<TextInput style={style.input} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="cell phone number" onChangeText={(cellnumber) => setCellnumber(cellnumber)} value={cellnumber} autoCorrect={false}/>
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

							{loading ? <ActivityIndicator size="small"/> : null}

							<View style={{ alignItems: 'center' }}>
								<TouchableOpacity style={style.updateButton} onPress={() => updateAccount()}>
									<Text style={style.updateButtonHeader}>Done</Text>
								</TouchableOpacity>
							</View>
						</View>

						<View style={style.paymentMethods}>
							<Text style={style.paymentMethodHeader}>Payment Method(s)</Text>

							<TouchableOpacity style={style.paymentMethodAdd} onPress={() => openPaymentMethodForm()}>
								<Text style={style.paymentMethodAddHeader}>Add a card</Text>
							</TouchableOpacity>

							{paymentMethods.map((info, index) => (
								<View key={info.key} style={style.paymentMethod}>
									<View style={style.paymentMethodRow}>
										<Text style={style.paymentMethodHeader}>#{index + 1}:</Text>
										<View style={style.paymentMethodImageHolder}>
											<Image style={style.paymentMethodImage} source={info.logo}/>
										</View>
										<View style={style.paymentMethodNumberHolder}>
											<Text style={style.paymentMethodNumberHeader}>{info.number}</Text>
										</View>
									</View>
									<View style={style.paymentMethodActions}>
										<TouchableOpacity style={info.default ? style.paymentMethodActionDisabled : style.paymentMethodAction} disabled={info.default} onPress={() => usePaymentMethod(info.cardid)}>
											<Text style={info.default ? style.paymentMethodActionHeaderDisabled : style.paymentMethodActionHeader}>Set default</Text>
										</TouchableOpacity>
										<TouchableOpacity style={style.paymentMethodAction} onPress={() => editPaymentMethod(info.cardid, index)}>
											<Text style={style.paymentMethodActionHeader}>Edit</Text>
										</TouchableOpacity>
										<TouchableOpacity style={style.paymentMethodAction} onPress={() => deletePaymentMethod(info.cardid, index)}>
											<Text style={style.paymentMethodActionHeader}>Remove</Text>
										</TouchableOpacity>
									</View>
								</View>
							))}
						</View>

						{errorMsg ? <Text style={style.errorMsg}>{errorMsg}</Text> : null }
					</ScrollView>
					:
					<View style={{ flexDirection: 'column', height: '100%', justifyContent: 'space-around' }}>
						<ActivityIndicator size="small"/>
					</View>
				}
			</View>

			{paymentMethodForm.show && (
				<Modal transparent={true}>
					<TouchableWithoutFeedback style={{ paddingVertical: offsetPadding }} onPress={() => Keyboard.dismiss()}>
						<View style={style.form}>
							<View style={style.formContainer}>
								<View style={{ alignItems: 'center', marginVertical: 5 }}>
									<TouchableOpacity onPress={() => {
										setPaymentmethodform({
											show: false,
											id: '', type: '',
											number: '', expMonth: '', expYear: '', cvc: ''
										})
									}}>
										<AntDesign name="closecircleo" size={30}/>
									</TouchableOpacity>

									<Text style={style.formHeader}>Enter card information</Text>
								</View>

								<View style={style.formInputBox}>
									<View style={style.formInputField}>
										<Text style={style.formInputHeader}>Card number</Text>
										<TextInput style={style.formInputInput} onChangeText={(number) => setPaymentmethodform({
											...paymentMethodForm,
											number
										})} value={paymentMethodForm.number.toString()} placeholder={paymentMethodForm.placeholder} keyboardType="numeric" autoCorrect={false}/>
									</View>
									<View style={style.formInputField}>
										<Text style={style.formInputHeader}>Expiry month</Text>
										<TextInput style={style.formInputInput} onChangeText={(expMonth) => setPaymentmethodform({
											...paymentMethodForm,
											expMonth
										})} value={paymentMethodForm.expMonth.toString()} keyboardType="numeric" placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="MM" maxLength={2} autoCorrect={false}/>
									</View>

									<View style={{ flexDirection: 'row' }}>
										<View style={{ width: '50%' }}>
											<View style={style.formInputField}>
												<Text style={style.formInputHeader}>Expiry Year</Text>
												<TextInput style={style.formInputInput} onChangeText={(expYear) => setPaymentmethodform({
													...paymentMethodForm,
													expYear
												})} value={paymentMethodForm.expYear.toString()} keyboardType="numeric" placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="YYYY" maxLength={4} autoCorrect={false}/>
											</View>
										</View>
										<View style={{ width: '50%' }}>
											<View style={style.formInputField}>
												<Text style={style.formInputHeader}>Security Code</Text>
												<TextInput style={style.formInputInput} onChangeText={(cvc) => setPaymentmethodform({
													...paymentMethodForm,
													cvc
												})} value={paymentMethodForm.cvc.toString()} keyboardType="numeric" autoCorrect={false}/>
											</View>
										</View>
									</View>
										
								</View>

								{paymentMethodForm.loading ? <ActivityIndicator size="small"/> : null}

								<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
									<TouchableOpacity style={style.formSubmit} disabled={paymentMethodForm.loading} onPress={() => {
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
					</TouchableWithoutFeedback>
				</Modal>
			)}
		</View>
	);
}

const style = StyleSheet.create({
	account: { backgroundColor: 'white', height: '100%', paddingBottom: offsetPadding, width: '100%' },
	box: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },

	inputsBox: { alignItems: 'center', marginBottom: 50 },
	inputContainer: { marginVertical: 20, width: '90%' },
	inputHeader: { fontFamily: 'appFont', fontSize: fsize(0.06), fontWeight: 'bold' },
	input: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: fsize(0.06), padding: 5 },
	cameraContainer: { alignItems: 'center', marginVertical: 50, width: '100%' },
	camera: { height: fsize(0.7), width: fsize(0.7) },
	cameraActions: { flexDirection: 'row' },
	cameraAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5, width: 100 },
	cameraActionHeader: { fontSize: fsize(0.04), textAlign: 'center' },

	paymentMethods: { alignItems: 'center', margin: 10 },
	paymentMethodHeader: { fontFamily: 'appFont', fontSize: fsize(0.05), textAlign: 'center' },
	paymentMethodAdd: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 3, padding: 5 },
	paymentMethodAddHeader: { fontSize: fsize(0.05) },
	paymentMethod: { marginVertical: 30 },
	paymentMethodRow: { flexDirection: 'row', justifyContent: 'space-between' },
	paymentMethodHeader: { fontSize: fsize(0.05), fontWeight: 'bold', padding: 5 },
	paymentMethodImageHolder: { height: 40, margin: 2, width: 40 },
	paymentMethodImage: { height: 40, width: 40 },
	paymentMethodNumberHolder: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 5, flexDirection: 'row', justifyContent: 'space-between', padding: 5, width: '70%' },
	paymentMethodNumberHeader: { fontSize: fsize(0.05), paddingVertical: 4, textAlign: 'center', width: '50%' },
	paymentMethodActions: { flexDirection: 'row', justifyContent: 'space-around' },
	paymentMethodAction: { borderRadius: 2, borderStyle: 'solid', borderWidth: 2, marginTop: 5, padding: 5, width: 80 },
	paymentMethodActionHeader: { fontSize: fsize(0.033), textAlign: 'center' },
	paymentMethodActionDisabled: { backgroundColor: 'black', borderRadius: 2, borderStyle: 'solid', borderWidth: 2, marginTop: 5, padding: 5, width: 80 },
	paymentMethodActionHeaderDisabled: { color: 'white', fontSize: fsize(0.033), textAlign: 'center' },

	updateButton: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 20, padding: 10, width: fsize(0.3) },
	updateButtonHeader: { fontFamily: 'appFont', fontSize: fsize(0.05) },

	// form
	form: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	formContainer: { backgroundColor: 'white', height: '90%', paddingVertical: 10, width: '90%' },
	formHeader: { fontSize: fsize(0.05), fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
	formInputField: { marginBottom: 20, marginHorizontal: '10%', width: '80%' },
	formInputHeader: { fontSize: fsize(0.04), fontWeight: 'bold' },
	formInputInput: { borderRadius: 2, borderStyle: 'solid', borderWidth: 3, fontSize: fsize(0.04), padding: 5, width: '100%' },
	formSubmit: { alignItems: 'center', borderRadius: 2, borderStyle: 'solid', borderWidth: 1, padding: 5 },
	formSubmitHeader: {  },

	errorMsg: { color: 'darkred', fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
})
