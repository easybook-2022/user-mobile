import React, { useState } from 'react';
import { AsyncStorage, Dimensions, View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { getCode } from '../apis/users'
import { userInfo } from '../../assets/info'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

export default function forgotpassword({ navigation }) {
	const [info, setInfo] = useState({ phonenumber: userInfo.cellnumber, resetcode: '', sent: false })
	const [code, setCode] = useState('')
	const [errorMsg, setErrormsg] = useState('')

	const getTheCode = () => {
		getCode(info.phonenumber)
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

					setInfo({ ...info, sent: true })
					setCode(code)
				}
			})
			.catch((error) => console.log(error))
	}
	const done = () => {
		const { resetcode } = info

		if (code == resetcode) {
			navigation.navigate("resetpassword", { cellnumber: info.phonenumber })
		} else {
			setErrormsg("Reset code is wrong")
		}
	}

	return (
		<View style={style.forgotpassword}>
			<View style={{ paddingVertical: offsetPadding }}>
				<View style={style.box}>
					<Text style={style.boxHeader}>Forgot Password</Text>

					<View style={style.inputsBox}>
						{!info.sent ? 
							<View style={style.inputContainer}>
								<Text style={style.inputHeader}>Phone number:</Text>
								<TextInput style={style.input} onChangeText={(phonenumber) => setInfo({ ...info, phonenumber })} value={info.phonenumber} keyboardType="numeric" autoCorrect={false}/>
							</View>
							:
							<View style={style.inputContainer}>
								<Text style={style.resetCodeHeader}>Please enter the reset code sent your phone</Text>

								<Text style={style.inputHeader}>Reset Code:</Text>
								<TextInput style={style.input} onChangeText={(resetcode) => setInfo({ ...info, resetcode })} keyboardType="numeric" value={info.resetcode} autoCorrect={false}/>

								<View style={{ alignItems: 'center' }}>
									<TouchableOpacity style={style.resend} onPress={() => getTheCode()}>
										<Text style={style.resendHeader}>Resend</Text>
									</TouchableOpacity>
								</View>
							</View>
						}

						<Text style={style.errorMsg}>{errorMsg}</Text>
					</View>

					<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
						<View style={style.options}>
							<TouchableOpacity style={style.option} onPress={() => {
								navigation.dispatch(
									CommonActions.reset({
										index: 1,
										routes: [{ name: 'register' }]
									})
								);
							}}>
								<Text style={style.optionHeader}>Don't have an account ? Sign up</Text>
							</TouchableOpacity>
							<View style={style.options}>
								<TouchableOpacity style={style.option} onPress={() => {
									navigation.dispatch(
										CommonActions.reset({
											index: 1,
											routes: [{ name: 'login' }]
										})
									);
								}}>
									<Text style={style.optionHeader}>Already a member ? Log in</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>

					{!info.sent ? 
						<TouchableOpacity style={style.submit} onPress={() => getTheCode()}>
							<Text style={style.submitHeader}>Get Code</Text>
						</TouchableOpacity>
						:
						<TouchableOpacity style={style.submit} onPress={() => done()}>
							<Text style={style.submitHeader}>Done</Text>
						</TouchableOpacity>
					}
				</View>
			</View>
		</View>
	);
}

const style = StyleSheet.create({
	forgotpassword: { backgroundColor: '#0288FF', height: '100%', width: '100%' },
	box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	background: { height: '100%', position: 'absolute', width: '100%' },
	boxHeader: { color: 'white', fontFamily: 'appFont', fontSize: 30, fontWeight: 'bold', paddingVertical: 30 },
	
	inputsBox: { backgroundColor: 'rgba(2, 136, 255, 0.1)', paddingHorizontal: 20, width: '80%' },
	inputContainer: { marginVertical: 5 },
	inputHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold' },
	input: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: 20, padding: 10 },
	resend: { alignItems: 'center', backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontFamily: 'appFont', marginVertical: 40, padding: 10, width: 100 },
	resendHeader: { fontWeight: 'bold' },
	errorMsg: { color: 'red', fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
	
	options: {  },
	option: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, marginVertical: 5, padding: 5 },
	optionHeader: {  },
	submit: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontFamily: 'appFont', marginVertical: 40, padding: 10 },
	submitHeader: { fontWeight: 'bold' },
})
