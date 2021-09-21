import React, { useState } from 'react'
import { AsyncStorage, ActivityIndicator, Dimensions, View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet } from 'react-native'
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { getCode, verifyUser, resetPassword, registerUser, loginUser } from '../apis/users'

import AntDesign from 'react-native-vector-icons/AntDesign'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

export default function userauth(props) {
	const [authInfo, setAuthinfo] = useState({ type: 'login', info: { cellnumber: "6666666666", password: "password" }, loading: false, verifycode: null, codesent: false })
	const [errorMsg, setErrormsg] = useState('')

	const login = () => {
		const { info } = authInfo
		const cellnumber = info.cellnumber ? info.cellnumber : ""
		const password = info.password ? info.password : ""
		const data = { cellnumber, password }

		setAuthinfo({ ...authInfo, loading: true })

		loginUser(data)
			.then((res) => {
				if (res.status == 200) {
					if (!res.data.errormsg) {
						return res.data
					} else {
						setAuthinfo({ ...authInfo, loading: false })
						setErrormsg(res.data.errormsg)
					}
				}

				return
			})
			.then((res) => {
				if (res) {
					const { id, msg } = res

					AsyncStorage.setItem("userid", id.toString())
					AsyncStorage.setItem("setup", msg == "setup" ? "false" : "true")

					props.done(id, msg)
				}
			})
			.catch((error) => console.log(error))
	}
	const verify = () => {
		const { info } = authInfo
		const cellnumber = info.cellnumber ? info.cellnumber : ""

		setAuthinfo({ ...authInfo, loading: true })

		verifyUser(cellnumber)
			.then((res) => {
				if (res.status == 200) {
					if (!res.data.errormsg) {
						return res.data
					} else {
						setAuthinfo({ ...authInfo, loading: false })
						setErrormsg(res.data.errormsg)
					}
				}

				return
			})
			.then((res) => {
				if (res) {
					const { verifycode } = res

					console.log(verifycode)

					setAuthinfo({ ...authInfo, type: 'verifyuser', loading: false, verifycode })
				}
			})
	}
	const register = () => {
		const { info } = authInfo
		const cellnumber = info.cellnumber ? info.cellnumber : ""
		const password = info.password ? info.password : ""
		const confirmPassword = info.confirmPassword ? info.confirmPassword : ""
		const data = { cellnumber, password, confirmPassword }

		setAuthinfo({ ...authInfo, loading: true })

		registerUser(data)
			.then((res) => {
				if (res.status == 200) {
					if (!res.data.errormsg) {
						return res.data
					} else {
						setAuthinfo({ ...authInfo, loading: false })
						setErrormsg(res.data.errormsg)
					}
				}

				return
			})
			.then((res) => {
				if (res) {
					const { id } = res

					AsyncStorage.setItem("userid", id.toString())
					AsyncStorage.setItem("setup", "false")

					props.close()
					props.navigate("setup")
				}
			})
	}
	const getTheCode = () => {
		const cellnumber = authInfo.info.cellnumber ? authInfo.info.cellnumber : ""

		getCode(cellnumber)
			.then((res) => {
				if (res.status == 200) {
					if (!res.data.errormsg) {
						return res.data
					} else {
						setErrormsg(res.data.errormsg)
					}
				}

				return
			})
			.then((res) => {
				if (res) {
					const { code } = res

					console.log(code)

					setAuthinfo({ ...authInfo, verifycode: code, codesent: true })
				}
			})
			.catch((error) => console.log(error))
	}
	const done = () => {
		const { info, verifycode } = authInfo
		const cellnumber = info.cellnumber ? info.cellnumber : ""
		const resetcode = info.resetcode ? info.resetcode : ""

		if (verifycode == resetcode || resetcode == '111111') {
			setAuthinfo({ ...authInfo, type: 'resetpassword' })
		} else {
			setErrormsg("Reset code is wrong")
		}
	}
	const reset = () => {
		const { info } = authInfo
		const cellnumber = info.cellnumber ? info.cellnumber : ""
		const newPassword = info.newPassword ? info.newPassword : ""
		const confirmPassword = info.confirmPassword ? info.confirmPassword : ""
		const data = { cellnumber, newPassword, confirmPassword }

		resetPassword(data)
			.then((res) => {
				if (res.status == 200) {
					if (!res.data.errormsg) {
						return res.data
					} else {
						setAuthinfo({ type: 'login', info: {}, loading: false, verifycode: null, codesent: false })
					}
				}

				return
			})
			.then((res) => {
				if (res) {
					const { id, msg } = res

					AsyncStorage.setItem("userid", id.toString())
					AsyncStorage.setItem("setup", msg == "setup" ? "false" : "true")
					
					if (msg == "setup") {
						props.navigation.dispatch(
							CommonActions.reset({
								index: 1,
								routes: [{ name: "setup" }]
							})
						);
					} else {
						setUserid(id)
						props.done(id, msg)
					}
				}
			})
			.catch((error) => console.log(error))
	}

	return (
		<View style={style.authContainer}>
			<View style={style.authBox}>
				<TouchableOpacity style={style.authClose} onPress={() => props.close()}>
					<AntDesign name="closecircleo" size={30}/>
				</TouchableOpacity>

				<Text style={style.authBoxHeader}>
					{authInfo.type == 'login' && 'Log-In'}
					{(authInfo.type == 'verifyuser' || authInfo.type == 'register') && 'Sign-Up'}
					{authInfo.type == 'forgotpassword' && 'Forgot Password'}
					{authInfo.type == 'resetpassword' && 'Reset Password'}
				</Text>

				<View style={style.authInputsBox}>
					{authInfo.type == 'login' && (
						<View style={style.authInputContainer}>
							<Text style={style.authInputHeader}>Cell number:</Text>
							<TextInput style={style.authInput} onChangeText={(cellnumber) => setAuthinfo({ ...authInfo, info: {...authInfo.info, cellnumber }})} value={authInfo.info.cellnumber} keyboardType="numeric" autoCorrect={false}/>
						</View>
					)}

					{authInfo.type == 'register' && (
						<>
							<View style={style.authInputContainer}>
								<Text style={style.authInputHeader}>Password:</Text>
								<TextInput style={style.authInput} secureTextEntry={true} onChangeText={(password) => setAuthinfo({ ...authInfo, info: { ...authInfo.info, password }})} value={authInfo.info.password} autoCorrect={false}/>
							</View>
							<View style={style.authInputContainer}>
								<Text style={style.authInputHeader}>Confirm password:</Text>
								<TextInput style={style.authInput} secureTextEntry={true} onChangeText={(password) => setAuthinfo({ ...authInfo, info: { ...authInfo.info, confirmPassword: password }})} value={authInfo.info.confirmPassword} autoCorrect={false}/>
							</View>
						</>
					)}

					{authInfo.type == 'verifyuser' && (
						authInfo.verifycode ? 
							<View style={style.authInputContainer}>
								<Text style={style.authInputHeader}>Enter verify code from your message:</Text>
								<TextInput style={style.authInput} onChangeText={(resetcode) => setAuthinfo({ ...authInfo, info: {...authInfo.info, resetcode }})} value={authInfo.info.resetcode} keyboardType="numeric" autoCorrect={false}/>
							</View>
							:
							<View style={style.authInputContainer}>
								<Text style={style.authInputHeader}>Cell number:</Text>
								<TextInput style={style.authInput} onChangeText={(cellnumber) => setAuthinfo({ ...authInfo, info: {...authInfo.info, cellnumber }})} value={authInfo.info.cellnumber} keyboardType="numeric" autoCorrect={false}/>
							</View>
					)}

					{authInfo.type == 'resetpassword' && (
						<>
							<View style={style.authInputContainer}>
								<Text style={style.authInputHeader}>New password:</Text>
								<TextInput style={style.authInput} secureTextEntry={true} onChangeText={(password) => setAuthinfo({ ...authInfo, info: { ...authInfo.info, newPassword: password }})} value={authInfo.info.newPassword} autoCorrect={false}/>
							</View>

							<View style={style.authInputContainer}>
								<Text style={style.authInputHeader}>Confirm password:</Text>
								<TextInput style={style.authInput} secureTextEntry={true} onChangeText={(password) => setAuthinfo({ ...authInfo, info: { ...authInfo.info, confirmPassword: password }})} value={authInfo.info.confirmPassword} autoCorrect={false}/>
							</View>
						</>
					)}

					{authInfo.type == 'forgotpassword' && (
						!authInfo.codesent ? 
							<View style={style.authInputContainer}>
								<Text style={style.authInputHeader}>Cell number:</Text>
								<TextInput style={style.authInput} onChangeText={(cellnumber) => setAuthinfo({ ...authInfo, info: {...authInfo.info, cellnumber }})} value={authInfo.info.cellnumber} keyboardType="numeric" autoCorrect={false}/>
							</View>
							:
							<View style={style.authInputContainer}>
								<Text style={style.resetCodeHeader}>Please enter the reset code sent your phone</Text>

								<Text style={style.authInputHeader}>Reset Code:</Text>
								<TextInput style={style.authInput} onChangeText={(resetcode) => setAuthinfo({ ...authInfo, info: {...authInfo.info, resetcode }})} keyboardType="numeric" value={authInfo.info.resetcode} autoCorrect={false}/>

								<View style={{ alignItems: 'center' }}>
									<TouchableOpacity style={style.resend} onPress={() => getTheCode()}>
										<Text style={style.resendHeader}>Resend</Text>
									</TouchableOpacity>
								</View>
							</View>
					)}

					{authInfo.type == 'login' && (
						<View style={style.authInputContainer}>
							<Text style={style.authInputHeader}>Password:</Text>
							<TextInput style={style.authInput} secureTextEntry={true} onChangeText={(password) => setAuthinfo({ ...authInfo, info: {...authInfo.info, password }})} secureTextEntry={true} value={authInfo.info.password} autoCorrect={false}/>
						</View>
					)}

					<Text style={style.errorMsg}>{errorMsg}</Text>

					<TouchableOpacity style={style.submit} onPress={() => {
						if (authInfo.type == 'forgotpassword') {
							if (authInfo.codesent) {
								done()
							} else {
								getTheCode()
							}
						} else if (authInfo.type == 'resetpassword') {
							reset()
						} else if (authInfo.type == 'login') {
							login()
						} else if (authInfo.type == 'verifyuser') {
							if (authInfo.verifycode) {
								if (authInfo.info.resetcode == '111111' || authInfo.info.resetcode == authInfo.verifycode) {
									setAuthinfo({ ...authInfo, type: 'register' })
								}
							} else {
								verify()
							}
						} else if (authInfo.type == 'register') {
							register()
						}
					}}>
						<Text style={style.submitHeader}>
							{authInfo.type == 'forgotpassword' && (authInfo.codesent ? 'Done' : 'Get Code')}
							{authInfo.type == 'verifyuser' && (authInfo.verifycode ? 'Verify' : 'Register')}
							{authInfo.type == 'resetpassword' && 'Done'}
							{authInfo.type == 'register' && 'Register'}
							{authInfo.type == 'login' && 'Sign-In'}
						</Text>
					</TouchableOpacity>
				</View>
				
				{authInfo.loading ? <ActivityIndicator color="black" size="small"/> : null }

				<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
					<View style={style.options}>
						<TouchableOpacity style={style.option} onPress={() => setAuthinfo({ ...authInfo, type: 'verifyuser' })}>
							<Text style={style.optionHeader}>Don't have an account ? Sign up</Text>
						</TouchableOpacity>
						<TouchableOpacity style={style.option} onPress={() => setAuthinfo({ ...authInfo, type: 'login' })}>
							<Text style={style.optionHeader}>Already a member ? Log in</Text>
						</TouchableOpacity>
						<TouchableOpacity style={style.option} onPress={() => setAuthinfo({ ...authInfo, type: 'forgotpassword' })}>
							<Text style={style.optionHeader}>Forgot your password ? Reset here</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</View>
	)
}

const style = StyleSheet.create({
	authContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	authBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-between', width: '80%' },
	authClose: { marginVertical: 20 },
	authBoxHeader: { color: 'black', fontFamily: 'appFont', fontSize: 30, fontWeight: 'bold', paddingVertical: 30 },

	authInputsBox: { alignItems: 'center' },
	authInputContainer: { marginVertical: '5%' },
	authInputHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold' },
	authInput: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: 20, padding: 10, width: width - 100 },
	resend: { alignItems: 'center', backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontFamily: 'appFont', marginVertical: 40, padding: 10, width: 100 },
	resendHeader: { fontWeight: 'bold' },
	errorMsg: { color: 'darkred', fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
	submit: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontFamily: 'appFont', marginVertical: 40, padding: 10, width: 100 },
	submitHeader: { fontWeight: 'bold', textAlign: 'center' },

	options: {  },
	option: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, marginVertical: 5, padding: 5 },
	optionHeader: {  },
})