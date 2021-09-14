import React, { useState } from 'react';
import { AsyncStorage, ActivityIndicator, Dimensions, View, Text, TextInput, TouchableWithoutFeedback, Keyboard, TouchableOpacity, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { verifyUser } from '../apis/users'
import { userInfo } from '../../assets/info'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - offsetPadding

export default function verifyuser(props) {
	const [cellnumber, setCellnumber] = useState('')
	const [verifyCode, setVerifycode] = useState('')
	const [userCode, setUsercode] = useState('')

	const [loading, setLoading] = useState(false)
	const [errorMsg, setErrormsg] = useState('')

	const verify = () => {
		setLoading(true)

		verifyUser(cellnumber)
			.then((res) => {
				if (res.status == 200) {
					if (!res.data.errormsg) {
						return res.data
					} else {
						setLoading(false)
						setErrormsg(res.data.errormsg)
					}
				}

				return
			})
			.then((res) => {
				if (res) {
					const { verifycode } = res

					setVerifycode(verifycode)
					setLoading(false)
				}
			})
	}

	return (
		<View style={style.register}>
			<View style={{ paddingVertical: offsetPadding }}>
				<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
					<View style={style.box}>
						<Text style={style.boxHeader}>Sign-Up</Text>

						<View style={style.inputsBox}>
							<View style={style.inputContainer}>
								{!verifyCode ?
									<>
										<Text style={style.inputHeader}>Cell number:</Text>
										<TextInput style={style.input} onChangeText={(cellnumber) => setCellnumber(cellnumber)} value={cellnumber} keyboardType="numeric" autoCorrect={false}/>
									</>
									:
									<>
										<Text style={style.inputHeader}>Enter verify code from your message:</Text>
										<TextInput style={style.input} onChangeText={(usercode) => setUsercode(usercode)} value={userCode} keyboardType="numeric" autoCorrect={false}/>
									</>
								}
							</View>

							<Text style={style.errorMsg}>{errorMsg}</Text>

							{!verifyCode ?
								<TouchableOpacity style={style.submit} onPress={verify}>
									<Text style={style.submitHeader}>Register</Text>
								</TouchableOpacity>
								:
								<View style={{ flexDirection: 'row', justifyContent: 'space-between', width: 210 }}>
									<TouchableOpacity style={style.submit} onPress={() => setVerifycode('')}>
										<Text style={style.submitHeader}>Back</Text>
									</TouchableOpacity>
									<TouchableOpacity style={style.submit} onPress={() => {
										if (verifyCode == userCode) {
											props.navigation.navigate("register", { cellnumber })
										} else {
											setErrormsg("The verify code is wrong")
										}
									}}>
										<Text style={style.submitHeader}>Verify</Text>
									</TouchableOpacity>
								</View>
							}
						</View>

						{loading ? <ActivityIndicator color="black" size="small"/> : null}

						<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
							<View style={style.options}>
								<TouchableOpacity style={style.option} onPress={() => {
									props.navigation.dispatch(
										CommonActions.reset({
											index: 1,
											routes: [{ name: 'login' }]
										})
									);
								}}>
									<Text style={style.optionHeader}>Already a member ? Log in</Text>
								</TouchableOpacity>
								<TouchableOpacity style={style.option} onPress={() => {
									props.navigation.dispatch(
										CommonActions.reset({
											index: 1,
											routes: [{ name: 'forgotpassword' }]
										})
									)
								}}>
									<Text style={style.optionHeader}>Forgot your password ? Reset here</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</TouchableWithoutFeedback>
			</View>
		</View>
	);
}

const style = StyleSheet.create({
	register: { backgroundColor: '#0288FF', height: '100%', width: '100%' },
	box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	boxHeader: { color: 'white', fontFamily: 'appFont', fontSize: 50, fontWeight: 'bold', paddingVertical: 30 },

	inputsBox: { alignItems: 'center', backgroundColor: 'rgba(2, 136, 255, 0.1)', paddingHorizontal: 20, width: '80%' },
	inputContainer: { marginVertical: '5%' },
	inputHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold' },
	input: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: 20, padding: 10, width: width - 100 },
	errorMsg: { color: 'darkred', fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
	submit: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontFamily: 'appFont', marginVertical: 40, padding: 10, width: 100 },
	submitHeader: { fontWeight: 'bold', textAlign: 'center' },

	options: {  },
	option: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, marginVertical: 5, padding: 5 },
	optionHeader: {  },
})
