import React, { useState } from 'react'
import { SafeAreaView, ActivityIndicator, Dimensions, View, Text, Image, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isLocal, loginInfo, registerInfo } from '../../assets/info'
import { displayPhonenumber } from 'geottuse-tools'
import { getCode, verifyUser, resetPassword, registerUser, loginUser } from '../apis/users'

import AntDesign from 'react-native-vector-icons/AntDesign'

const { username, cellnumber, password, confirmPassword } = loginInfo
const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}

export default function Userauth(props) {
	const [authInfo, setAuthinfo] = useState({ info: { username, cellnumber, password, confirmPassword }, loading: false, verifycode: null, verified: false, codesent: false, noAccount: false, errormsg: "" })

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

          switch (status) {
            case "nonexist":
              verify()
          }
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

					setAuthinfo({ ...authInfo, type: 'verifyuser', loading: false, verifycode, noAccount: true })
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
					<AntDesign style={styles.authBoxClose} name="closecircleo" size={wsize(8)} onPress={() => props.close()}/>

          <View style={styles.welcomeBox}>
            <Text style={styles.boxHeader}>Welcome to EasyGO</Text>
            <Text style={styles.boxHeader}>We show you the nearest services</Text>

            {!authInfo.noAccount ? 
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
              :
              !authInfo.verified ? 
                <View style={styles.authInputContainer}>
                  <Text style={styles.authInputHeader}>Please enter verify code from your message:</Text>
                  <TextInput style={styles.authInput} onChangeText={(usercode) => {
                    if (usercode.length == 6) {
                      Keyboard.dismiss()

                      if ((isLocal && usercode == '111111') || usercode == authInfo.verifycode) {
                        setAuthinfo({ ...authInfo, verified: true, errorMsg: "" })
                      } else {
                        setAuthinfo({ ...authInfo, errormsg: "Code is incorrect" })
                      }
                    }
                  }} value={authInfo.info.usercode} keyboardType="numeric" autoCorrect={false}/>
                </View>
                :
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
            }

            <Text style={styles.errorMsg}>{authInfo.errormsg}</Text>

            {!authInfo.noAccount && (
              !authInfo.verified ? 
                <TouchableOpacity style={[styles.submit, { opacity: authInfo.loading ? 0.5 : 1 }]} disabled={authInfo.loading} onPress={() => {
                  if (!authInfo.noAccount) {
                    login()
                  } else if (authInfo.verified) {
                    register()
                  }
                }}>
                  <Text style={styles.submitHeader}>Get in</Text>
                </TouchableOpacity>
              : null
            )}
          </View>
				</View>
			</TouchableWithoutFeedback>
		</View>
	)
}

const styles = StyleSheet.create({
	authContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	authBox: { alignItems: 'center', backgroundColor: 'white', height: '80%', paddingHorizontal: 10, width: '80%' },
  authBoxClose: { marginVertical: 30 },
	authBoxHeader: { color: 'black', fontSize: wsize(6), fontWeight: 'bold' },

	authInputContainer: { marginBottom: 10, width: '100%' },
  userCodeHeader: { fontSize: wsize(4) },
	authInputHeader: { fontSize: wsize(5) },
	authInput: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), padding: 5 },

  resend: { alignItems: 'center', backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontFamily: 'Chilanka_400Regular', marginVertical: 40, padding: 10 },
	resendHeader: { fontSize: wsize(5), fontWeight: 'bold' },
  
	errorMsg: { color: 'darkred', fontSize: wsize(4), textAlign: 'center' },

	submit: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, padding: 10 },
	submitHeader: { fontSize: wsize(4), fontWeight: 'bold', textAlign: 'center' },

	welcomeBox: { alignItems: 'center', width: '100%' },
	boxHeader: { fontSize: wsize(5), marginVertical: '5%', paddingHorizontal: 10, textAlign: 'center' },
	boxOptions: { alignItems: 'center' },
  boxOption: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
  boxOptionHeader: { fontSize: wsize(5), fontWeight: 'bold'  },
  boxOptionTouch: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 10 },
  boxOptionTouchHeader: { fontSize: wsize(5) },

	optionHeader: { fontSize: wsize(4), marginBottom: 5, textAlign: 'center' },

  column: { flexDirection: 'column', justifyContent: 'space-around' },
})
