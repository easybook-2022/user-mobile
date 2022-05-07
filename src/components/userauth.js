import React, { useState } from 'react'
import { SafeAreaView, ActivityIndicator, Dimensions, View, Text, Image, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import { isLocal, loginInfo, registerInfo } from '../../assets/info'
import { displayPhonenumber } from 'geottuse-tools'
import { getCode, verifyUser, resetPassword, registerUser, loginUser } from '../apis/users'

import AntDesign from 'react-native-vector-icons/AntDesign'

const { username, cellnumber, password, confirmPassword } = loginInfo
const { height, width } = Dimensions.get('window')
const wsize = p => {
  return width * (p / 100)
}
const hsize = p => {
  return height * (p / 100)
}

export default function Userauth(props) {
	const [authInfo, setAuthinfo] = useState({ type: '', info: { username, cellnumber, password, confirmPassword }, loading: false, verifycode: null, codesent: false, errormsg: "" })

	const login = () => {
		const { info } = authInfo
		const cellnumber = info.cellnumber ? info.cellnumber : ""
		const password = info.password ? info.password : ""
		const data = { cellnumber, password }

		setAuthinfo({ ...authInfo, loading: true })

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

					props.done(id)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data

					setAuthinfo({ ...authInfo, loading: false, errormsg })
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

					setAuthinfo({ ...authInfo, type: 'verifyuser', loading: false, verifycode })
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data

					setAuthinfo({ ...authInfo, loading: false, errormsg })
				}
			})
	}
	const register = () => {
		const { info } = authInfo
    const username = info.username ? info.username : ""
		const cellnumber = info.cellnumber ? info.cellnumber : ""
		const password = info.password ? info.password : ""
		const confirmPassword = info.confirmPassword ? info.confirmPassword : ""
		const data = { username, cellnumber, password, confirmPassword }

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

          props.done(id)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data

					setAuthinfo({ ...authInfo, loading: false, errormsg })
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

					setAuthinfo({ ...authInfo, info: { usercode: code }, verifycode: code, codesent: true })
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data

					setAuthinfo({ ...authInfo, errormsg })
				}
			})
	}
	const done = () => {
		const { info, verifycode } = authInfo
		const cellnumber = info.cellnumber ? info.cellnumber : ""
		const usercode = info.usercode ? info.usercode : ""

		if (verifycode == usercode || usercode == '111111') {
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
					
					setUserid(id)
          props.done(id)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data

					setAuthinfo({ type: 'login', info: {}, loading: false, verifycode: null, codesent: false })
				}
			})
	}

	return (
		<View style={styles.authContainer}>
			<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
				<View style={styles.authBox}>
					<AntDesign name="closecircleo" size={wsize(8)} onPress={() => props.close()}/>

					<Text style={styles.authBoxHeader}>
						{authInfo.type == 'login' && 'Log-In'}
						{(authInfo.type == 'verifyuser' || authInfo.type == 'register') && 'Sign-Up'}
						{authInfo.type == 'forgotpassword' && 'Forgot Password'}
						{authInfo.type == 'resetpassword' && 'Reset Password'}
					</Text>

					{authInfo.type == 'login' && (
            <View style={{ alignItems: 'center', width: '100%' }}>
  						<View style={styles.authInputContainer}>
  							<Text style={styles.authInputHeader}>Cell number:</Text>
  							<TextInput style={styles.authInput} onChangeText={(num) => setAuthinfo({ 
                  ...authInfo, 
                  info: { 
                    ...authInfo.info, 
                    cellnumber: displayPhonenumber(authInfo.info.cellnumber, num, () => Keyboard.dismiss())
                  }
                })} value={authInfo.info.cellnumber} keyboardType="numeric" autoCorrect={false}/>
  						</View>
              <View style={styles.authInputContainer}>
                <Text style={styles.authInputHeader}>Password:</Text>
                <TextInput style={styles.authInput} secureTextEntry={true} onChangeText={(password) => setAuthinfo({ ...authInfo, info: {...authInfo.info, password }})} secureTextEntry={true} value={authInfo.info.password} autoCorrect={false}/>
              </View>
            </View>
					)}

					{authInfo.type == 'register' && (
						<View style={{ width: '100%' }}>
              <View style={styles.authInputContainer}>
                <Text style={styles.authInputHeader}>Enter your name:</Text>
                <TextInput style={styles.authInput} onChangeText={(username) => setAuthinfo({ ...authInfo, info: { ...authInfo.info, username }})} value={authInfo.info.username} autoCorrect={false} autoCapitalize="none"/>
              </View>
							<View style={styles.authInputContainer}>
								<Text style={styles.authInputHeader}>Password:</Text>
								<TextInput style={styles.authInput} secureTextEntry={true} onChangeText={(password) => setAuthinfo({ ...authInfo, info: { ...authInfo.info, password }})} value={authInfo.info.password} autoCorrect={false}/>
							</View>
							<View style={styles.authInputContainer}>
								<Text style={styles.authInputHeader}>Confirm password:</Text>
								<TextInput style={styles.authInput} secureTextEntry={true} onChangeText={(password) => {
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
							<View style={styles.authInputContainer}>
								<Text style={styles.authInputHeader}>Please enter verify code from your message:</Text>
								<TextInput style={styles.authInput} onChangeText={(usercode) => {
									if (usercode.length == 6) {
										Keyboard.dismiss()

                    if ((isLocal && usercode == '111111') || usercode == authInfo.verifycode) {
                      setAuthinfo({ ...authInfo, type: 'register', errormsg: "" })
                    } else {
                      setAuthinfo({ ...authInfo, errormsg: "Code is incorrect" })
                    }
									}
								}} value={authInfo.info.usercode} keyboardType="numeric" autoCorrect={false}/>
							</View>
							:
							<View style={styles.authInputContainer}>
								<Text style={styles.authInputHeader}>Cell number:</Text>
								<TextInput style={styles.authInput} onChangeText={(num) => setAuthinfo({ 
                  ...authInfo, 
                  info: {
                    ...authInfo.info, 
                    cellnumber: displayPhonenumber(authInfo.info.cellnumber, num, () => Keyboard.dismiss())
                  }
                })} value={authInfo.info.cellnumber} keyboardType="numeric" autoCorrect={false}/>
							</View>
					)}

					{authInfo.type == 'resetpassword' && (
						<View>
							<View style={styles.authInputContainer}>
								<Text style={styles.authInputHeader}>New password:</Text>
								<TextInput style={styles.authInput} secureTextEntry={true} onChangeText={(password) => setAuthinfo({ ...authInfo, info: { ...authInfo.info, newPassword: password }})} value={authInfo.info.newPassword} autoCorrect={false}/>
							</View>

							<View style={styles.authInputContainer}>
								<Text style={styles.authInputHeader}>Confirm password:</Text>
								<TextInput style={styles.authInput} secureTextEntry={true} onChangeText={(password) => setAuthinfo({ ...authInfo, info: { ...authInfo.info, confirmPassword: password }})} value={authInfo.info.confirmPassword} autoCorrect={false}/>
							</View>
						</View>
					)}

					{authInfo.type == 'forgotpassword' && (
						!authInfo.codesent ? 
							<View style={styles.authInputContainer}>
								<Text style={styles.authInputHeader}>Cell number:</Text>
								<TextInput style={styles.authInput} onChangeText={(num) => setAuthinfo({ 
                  ...authInfo, 
                  info: {
                    ...authInfo.info, 
                    cellnumber: displayPhonenumber(authInfo.info.cellnumber, num, () => Keyboard.dismiss())
                  }
                })} value={authInfo.info.cellnumber} keyboardType="numeric" autoCorrect={false}/>
							</View>
							:
							<View style={styles.authInputContainer}>
								<Text style={styles.userCodeHeader}>Please enter the reset code from your message</Text>

								<Text style={styles.authInputHeader}>Reset Code:</Text>
								<TextInput style={styles.authInput} onChangeText={(usercode) => setAuthinfo({ ...authInfo, info: {...authInfo.info, usercode }})} keyboardType="numeric" value={authInfo.info.usercode} autoCorrect={false}/>

								<View style={{ alignItems: 'center' }}>
									<TouchableOpacity style={styles.resend} onPress={() => getTheCode()}>
										<Text style={styles.resendHeader}>Resend</Text>
									</TouchableOpacity>
								</View>
							</View>
					)}

					<Text style={styles.errorMsg}>{authInfo.errormsg}</Text>

					{authInfo.type ? 
            (
              authInfo.type == 'forgotpassword' || 
              (authInfo.type == 'verifyuser' && !authInfo.verifycode) || 
              authInfo.type == 'resetpassword' || 
              authInfo.type == 'register' || 
              authInfo.type == 'login'
            ) ?
  						<TouchableOpacity style={[styles.submit, { opacity: authInfo.loading ? 0.5 : 1 }]} disabled={authInfo.loading} onPress={() => {
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
  								verify()
  							} else if (authInfo.type == 'register') {
  								register()
  							}
  						}}>
  							<Text style={styles.submitHeader}>
  								{authInfo.type == 'forgotpassword' && (authInfo.codesent ? 'Done' : 'Get Code')}
  								{authInfo.type == 'verifyuser' && (!authInfo.verifycode && 'Register')}
  								{authInfo.type == 'resetpassword' && 'Done'}
  								{authInfo.type == 'register' && 'Register'}
  								{authInfo.type == 'login' && 'Sign-In'}
  							</Text>
  						</TouchableOpacity>
              :
              null
						:
						<View style={styles.welcomeBox}>
							<Text style={styles.boxHeader}>Welcome to EasyGO (User)</Text>
							<Text style={styles.boxHeader}>We hope our service will get you the best service</Text>

							<View style={styles.boxOptions}>
                <View style={{ marginBottom: 50 }}>
                  <View style={styles.boxOption}>
                    <View style={styles.column}><Text style={styles.boxOptionHeader}>Are you new ?</Text></View>
                    <TouchableOpacity style={styles.boxOptionTouch} onPress={() => setAuthinfo({ ...authInfo, type: 'verifyuser' })}><Text>Click to{'\n'}Register</Text></TouchableOpacity>
                  </View>
                  <Text style={{ fontWeight: 'bold', marginTop: -5, textAlign: 'center' }}>Register to re-book easily (30 seconds)</Text>
                </View>
                <View style={styles.boxOption}>
                  <View style={styles.column}><Text style={styles.boxOptionHeader}>Already registered ?</Text></View>
                  <TouchableOpacity style={styles.boxOptionTouch} onPress={() => setAuthinfo({ ...authInfo, type: 'login' })}><Text>Click to{'\n'}Login</Text></TouchableOpacity>
                </View>
              </View>
						</View>
					}
					{authInfo.loading && authInfo.type ? <ActivityIndicator color="black" size="small"/> : null }
					{authInfo.type ? 
						<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
							<View style={styles.options}>
								<Text style={styles.optionHeader} onPress={() => setAuthinfo({ ...authInfo, type: 'verifyuser', errormsg: "" })}>Sign-Up instead</Text>
                <Text style={styles.optionHeader} onPress={() => setAuthinfo({ ...authInfo, type: 'login', errormsg: "" })}>Log-In instead</Text>
								<Text style={styles.optionHeader} onPress={() => setAuthinfo({ ...authInfo, type: 'forgotpassword', errormsg: "" })}>Forgot your password ? Reset here</Text>
							</View>
						</View>
					: null}
				</View>
			</TouchableWithoutFeedback>
		</View>
	)
}

const styles = StyleSheet.create({
	authContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	authBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-around', paddingHorizontal: 10, width: '80%' },
	authBoxHeader: { color: 'black', fontSize: wsize(6), fontWeight: 'bold' },

	authInputContainer: { marginBottom: 10, width: '100%' },
  userCodeHeader: { fontSize: wsize(4) },
	authInputHeader: { fontSize: wsize(5) },
	authInput: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), padding: 5 },

  resend: { alignItems: 'center', backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontFamily: 'appFont', marginVertical: 40, padding: 10 },
	resendHeader: { fontSize: wsize(5), fontWeight: 'bold' },

	errorMsg: { color: 'darkred', fontSize: wsize(4), textAlign: 'center' },

	submit: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, padding: 10 },
	submitHeader: { fontSize: wsize(4), fontWeight: 'bold', textAlign: 'center' },

	welcomeBox: { alignItems: 'center', flexDirection: 'column', height: '80%', justifyContent: 'space-around', width: '100%' },
	boxHeader: { fontSize: wsize(5), paddingHorizontal: 10, textAlign: 'center' },
	boxOptions: { alignItems: 'center' },
  boxOption: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
  boxOptionHeader: { fontSize: wsize(5), fontWeight: 'bold'  },
  boxOptionTouch: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 10 },
  boxOptionTouchHeader: { fontSize: wsize(5) },

	optionHeader: { fontSize: wsize(4), marginBottom: 5, textAlign: 'center' },

  column: { flexDirection: 'column', justifyContent: 'space-around' },
})
