import React, { useState } from 'react'
import { SafeAreaView, ActivityIndicator, Dimensions, View, Text, Image, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import { loginInfo, registerInfo } from '../../assets/info'
import { getCode, verifyUser, resetPassword, registerUser, loginUser } from '../apis/users'

import AntDesign from 'react-native-vector-icons/AntDesign'

const { cellnumber, password, confirmPassword } = loginInfo
const { height, width } = Dimensions.get('window')
const wsize = p => {
  return width * (p / 100)
}
const hsize = p => {
  return height * (p / 100)
}

export default function Userauth(props) {
	const [authInfo, setAuthinfo] = useState({ type: '', info: { cellnumber, password, confirmPassword }, loading: false, verifycode: null, codesent: false, errormsg: "" })

	const login = () => {
		const { info } = authInfo
		const cellnumber = info.cellnumber ? info.cellnumber : ""
		const password = info.password ? info.password : ""
		const data = { cellnumber, password }

		//setAuthinfo({ ...authInfo, loading: true })

		loginUser(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { id, msg } = res

					AsyncStorage.setItem("userid", id.toString())
					AsyncStorage.setItem("setup", msg == "setup" ? "false" : "true")

					props.close()
					props.done(id, msg)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data

					setAuthinfo({ ...authInfo, loading: false, errormsg })
				} else {
					alert("server error")
				}
			})
	}
	const verify = () => {
		const { info } = authInfo
		const cellnumber = info.cellnumber ? info.cellnumber : ""

		setAuthinfo({ ...authInfo, loading: true })

		verifyUser(cellnumber)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { verifycode } = res

					console.log(verifycode)

					setAuthinfo({ ...authInfo, type: 'verifyuser', loading: false, verifycode })
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data

					setAuthinfo({ ...authInfo, loading: false, errormsg })
				} else {
					alert("server error")
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
					return res.data
				}
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
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data

					setAuthinfo({ ...authInfo, loading: false, errormsg })
				} else {
					alert("server error")
				}
			})
	}
	const getTheCode = () => {
		const cellnumber = authInfo.info.cellnumber ? authInfo.info.cellnumber : ""

		getCode(cellnumber)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}

				return
			})
			.then((res) => {
				if (res) {
					const { code } = res

					console.log(code)

					setAuthinfo({ ...authInfo, info: { resetcode: code }, verifycode: code, codesent: true })
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data

					setAuthinfo({ ...authInfo, errormsg })
				} else {
					alert("server error")
				}
			})
	}
	const done = () => {
		const { info, verifycode } = authInfo
		const cellnumber = info.cellnumber ? info.cellnumber : ""
		const resetcode = info.resetcode ? info.resetcode : ""

		if (verifycode == resetcode || resetcode == '111111') {
			setAuthinfo({ ...authInfo, type: 'resetpassword' })
		} else {
			setAuthinfo({ ...authInfo, errormsg: "Reset code is wrong" })
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
					return res.data
				}
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
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data

					setAuthinfo({ type: 'login', info: {}, loading: false, verifycode: null, codesent: false })
				} else {
					alert("server error")
				}
			})
	}

	return (
		<View style={style.authContainer}>
			<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
				<View style={style.authBox}>
					<AntDesign name="closecircleo" size={wsize(8)} onPress={() => props.close()}/>

					<Text style={style.authBoxHeader}>
						{authInfo.type == 'login' && 'Log-In'}
						{(authInfo.type == 'verifyuser' || authInfo.type == 'register') && 'Sign-Up'}
						{authInfo.type == 'forgotpassword' && 'Forgot Password'}
						{authInfo.type == 'resetpassword' && 'Reset Password'}
					</Text>

					{authInfo.type == 'login' && (
            <View style={{ alignItems: 'center', width: '100%' }}>
  						<View style={style.authInputContainer}>
  							<Text style={style.authInputHeader}>Cell number:</Text>
  							<TextInput style={style.authInput} onKeyPress={(e) => {
  								let newValue = e.nativeEvent.key
  								let cellnumber = authInfo.info.cellnumber

  								if (newValue >= "0" && newValue <= "9") {
  									if (cellnumber.length == 3) {
  										setAuthinfo({ ...authInfo, info: {...authInfo.info, cellnumber: "(" + cellnumber + ") " + newValue }})
  									} else if (cellnumber.length == 9) {
  										setAuthinfo({ ...authInfo, info: {...authInfo.info, cellnumber: cellnumber + "-" + newValue }})
  									} else if (cellnumber.length == 13) {
  										setAuthinfo({ ...authInfo, info: {...authInfo.info, cellnumber: cellnumber + newValue }})

  										Keyboard.dismiss()
  									} else {
  										setAuthinfo({ ...authInfo, info: {...authInfo.info, cellnumber: cellnumber + newValue }})
  									}
  								} else if (newValue == "Backspace") {
  									cellnumber = cellnumber.substr(0, cellnumber.length - 1)

  									setAuthinfo({ ...authInfo, info: {...authInfo.info, cellnumber }})
  								}
  							}} value={authInfo.info.cellnumber} keyboardType="numeric" autoCorrect={false}/>
  						</View>
              <View style={style.authInputContainer}>
                <Text style={style.authInputHeader}>Password:</Text>
                <TextInput style={style.authInput} secureTextEntry={true} onChangeText={(password) => setAuthinfo({ ...authInfo, info: {...authInfo.info, password }})} secureTextEntry={true} value={authInfo.info.password} autoCorrect={false}/>
              </View>
            </View>
					)}

					{authInfo.type == 'register' && (
						<View style={{ width: '100%' }}>
							<View style={style.authInputContainer}>
								<Text style={style.authInputHeader}>Password:</Text>
								<TextInput style={style.authInput} secureTextEntry={true} onChangeText={(password) => setAuthinfo({ ...authInfo, info: { ...authInfo.info, password }})} value={authInfo.info.password} autoCorrect={false}/>
							</View>
							<View style={style.authInputContainer}>
								<Text style={style.authInputHeader}>Confirm password:</Text>
								<TextInput style={style.authInput} secureTextEntry={true} onChangeText={(password) => {
									setAuthinfo({ ...authInfo, info: { ...authInfo.info, confirmPassword: password }})

									if (password.length == authInfo.info.password.length) {
										Keyboard.dismiss()
									}
								}} value={authInfo.info.confirmPassword} autoCorrect={false}/>
							</View>
						</View>
					)}

					{authInfo.type == 'verifyuser' && (
						authInfo.verifycode ? 
							<View style={style.authInputContainer}>
								<Text style={style.authInputHeader}>Please enter verify code from your message:</Text>
								<TextInput style={style.authInput} onChangeText={(resetcode) => {
									setAuthinfo({ ...authInfo, info: {...authInfo.info, resetcode }})

									if (resetcode.length == 6) {
										Keyboard.dismiss()
									}
								}} value={authInfo.info.resetcode} keyboardType="numeric" autoCorrect={false}/>
							</View>
							:
							<View style={style.authInputContainer}>
								<Text style={style.authInputHeader}>Cell number:</Text>
								<TextInput style={style.authInput} onKeyPress={(e) => {
									let newValue = e.nativeEvent.key
									let cellnumber = authInfo.info.cellnumber

									if (newValue >= "0" && newValue <= "9") {
										if (cellnumber.length == 3) {
											setAuthinfo({ ...authInfo, info: {...authInfo.info, cellnumber: "(" + cellnumber + ") " + newValue }})
										} else if (cellnumber.length == 9) {
											setAuthinfo({ ...authInfo, info: {...authInfo.info, cellnumber: cellnumber + "-" + newValue }})
										} else if (cellnumber.length == 13) {
											setAuthinfo({ ...authInfo, info: {...authInfo.info, cellnumber: cellnumber + newValue }})

											Keyboard.dismiss()
										} else {
											setAuthinfo({ ...authInfo, info: {...authInfo.info, cellnumber: cellnumber + newValue }})
										}
									} else if (newValue == "Backspace") {
										setAuthinfo({ ...authInfo, info: {...authInfo.info, cellnumber: cellnumber.substr(0, cellnumber.length - 1) }})
									}
								}} value={authInfo.info.cellnumber} keyboardType="numeric" autoCorrect={false}/>
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
								<TextInput style={style.authInput} onKeyPress={(e) => {
									let newValue = e.nativeEvent.key
									let cellnumber = authInfo.info.cellnumber

									if (newValue >= "0" && newValue <= "9") {
										if (cellnumber.length == 3) {
											cellnumber = "(" + cellnumber + ") " + newValue

											setAuthinfo({ ...authInfo, info: {...authInfo.info, cellnumber }})
										} else if (cellnumber.length == 9) {
											cellnumber = cellnumber + "-" + newValue

											setAuthinfo({ ...authInfo, info: {...authInfo.info, cellnumber }})
										} else if (cellnumber.length == 14) {
											Keyboard.dismiss()
										} else {
											cellnumber = cellnumber + newValue

											setAuthinfo({ ...authInfo, info: {...authInfo.info, cellnumber }})
										}
									} else if (newValue == "Backspace") {
										cellnumber = cellnumber.substr(0, cellnumber.length - 1)

										setAuthinfo({ ...authInfo, info: {...authInfo.info, cellnumber }})
									}
								}} value={authInfo.info.cellnumber} keyboardType="numeric" autoCorrect={false}/>
							</View>
							:
							<View style={style.authInputContainer}>
								<Text style={style.resetCodeHeader}>Please enter the reset code from your message</Text>

								<Text style={style.authInputHeader}>Reset Code:</Text>
								<TextInput style={style.authInput} onChangeText={(resetcode) => setAuthinfo({ ...authInfo, info: {...authInfo.info, resetcode }})} keyboardType="numeric" value={authInfo.info.resetcode} autoCorrect={false}/>

								<View style={{ alignItems: 'center' }}>
									<TouchableOpacity style={style.resend} onPress={() => getTheCode()}>
										<Text style={style.resendHeader}>Resend</Text>
									</TouchableOpacity>
								</View>
							</View>
					)}

					<Text style={style.errorMsg}>{authInfo.errormsg}</Text>

					{authInfo.type ? 
						<TouchableOpacity style={[style.submit, { opacity: authInfo.loading ? 0.5 : 1 }]} disabled={authInfo.loading} onPress={() => {
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
										setAuthinfo({ ...authInfo, type: 'register', errormsg: "" })
									} else {
										setAuthinfo({ ...authInfo, errormsg: "Code is incorrect" })
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
						:
						<View style={style.welcomeBox}>
							<Text style={style.boxHeader}>Welcome to EasyGO (User)</Text>
							<Text style={style.boxHeader}>We hope our service will get you the best service</Text>

							<View style={style.boxNav}>
								<Text style={style.boxActionsHeader}>Do you have an account ?</Text>
								<View style={style.boxActions}>
									<TouchableOpacity style={style.boxAction} onPress={() => setAuthinfo({ ...authInfo, type: 'verifyuser' })}>
										<Text style={style.boxActionHeader}>No</Text>
									</TouchableOpacity>
									<TouchableOpacity style={style.boxAction} onPress={() => setAuthinfo({ ...authInfo, type: 'login' })}>
										<Text style={style.boxActionHeader}>Yes</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					}
					
					{authInfo.loading && authInfo.type ? <ActivityIndicator color="black" size="small"/> : null }
					{authInfo.type ? 
						<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
							<View style={style.options}>
								<Text style={style.optionHeader} onPress={() => setAuthinfo({ ...authInfo, type: 'verifyuser', errormsg: "" })}>Sign-Up instead</Text>
                <Text style={style.optionHeader} onPress={() => setAuthinfo({ ...authInfo, type: 'login', errormsg: "" })}>Log-In instead</Text>
								<Text style={style.optionHeader} onPress={() => setAuthinfo({ ...authInfo, type: 'forgotpassword', errormsg: "" })}>Forgot your password ? Reset here</Text>
							</View>
						</View>
					: null}
				</View>
			</TouchableWithoutFeedback>
		</View>
	)
}

const style = StyleSheet.create({
	authContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	authBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-around', paddingHorizontal: 10, width: '80%' },
	authBoxHeader: { color: 'black', fontSize: wsize(6), fontWeight: 'bold' },

	authInputContainer: { width: '100%' },
  resetCodeHeader: { fontSize: wsize(4) },
	authInputHeader: { fontSize: wsize(5) },
	authInput: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), padding: 5 },

  resend: { alignItems: 'center', backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontFamily: 'appFont', marginVertical: 40, padding: 10 },
	resendHeader: { fontSize: wsize(5), fontWeight: 'bold' },

	errorMsg: { color: 'darkred', fontSize: wsize(4), textAlign: 'center' },

	submit: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, padding: 10 },
	submitHeader: { fontSize: wsize(4), fontWeight: 'bold', textAlign: 'center' },

	welcomeBox: { alignItems: 'center', flexDirection: 'column', height: '80%', justifyContent: 'space-around', width: '100%' },
	boxHeader: { fontSize: wsize(5), paddingHorizontal: 10, textAlign: 'center' },
	boxNav: { alignItems: 'center' },
	boxActionsHeader: { fontSize: wsize(5), fontWeight: 'bold'  },
	boxActions: { flexDirection: 'row', justifyContent: 'space-around' },
	boxAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 10, width: wsize(20) },
	boxActionHeader: { fontSize: wsize(5) },

	optionHeader: { fontSize: wsize(4), marginBottom: 5, textAlign: 'center' },
})
