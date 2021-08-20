import React, { useState } from 'react';
import { AsyncStorage, ActivityIndicator, Dimensions, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { registerUser } from '../apis/users'
import { userInfo } from '../../assets/info'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - offsetPadding

export default function register({ navigation }) {
	const [phonenumber, setPhonenumber] = useState(userInfo.cellnumber)
	const [password, setPassword] = useState(userInfo.password)
	const [confirmpassword, setConfirmpassword] = useState(userInfo.password)

	const [loading, setLoading] = useState(false)
	const [errorMsg, setErrormsg] = useState('')

	const register = () => {
		const data = { cellnumber: phonenumber, password: password, confirmPassword: confirmpassword }

		setLoading(true)

		registerUser(data)
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
					const { id } = res

					AsyncStorage.setItem("userid", id.toString())
					AsyncStorage.setItem("setup", "false")
					
					navigation.navigate("setup")
				}
			})
	}

	return (
		<View style={style.register}>
			<View style={{ paddingVertical: offsetPadding }}>
				<View style={style.box}>
					<Text style={style.boxHeader}>Sign-Up</Text>

					<View style={style.inputsBox}>
						<View style={style.inputContainer}>
							<Text style={style.inputHeader}>Phone number:</Text>
							<TextInput style={style.input} onChangeText={(phonenumber) => setPhonenumber(phonenumber)} value={phonenumber} keyboardType="numeric" autoCorrect={false}/>
						</View>

						<View style={style.inputContainer}>
							<Text style={style.inputHeader}>Password:</Text>
							<TextInput style={style.input} secureTextEntry={true} onChangeText={(password) => setPassword(password)} value={password} autoCorrect={false}/>
						</View>

						<View style={style.inputContainer}>
							<Text style={style.inputHeader}>Confirm Password:</Text>
							<TextInput style={style.input} secureTextEntry={true} onChangeText={(confirmpassword) => setPassword(confirmpassword)} value={confirmpassword} autoCorrect={false}/>
						</View>

						{errorMsg ? <Text style={style.errorMsg}>{errorMsg}</Text> : null}
					</View>

					{loading ? <ActivityIndicator size="small"/> : null}

					<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
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

					<TouchableOpacity style={style.submit} onPress={register}>
						<Text style={style.submitHeader}>Register</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
}

const style = StyleSheet.create({
	register: { backgroundColor: '#0288FF', height: '100%', width: '100%' },
	box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	boxHeader: { fontFamily: 'appFont', fontSize: 30, fontWeight: 'bold', paddingVertical: 30 },

	inputsBox: { backgroundColor: 'rgba(2, 136, 255, 0.1)', paddingHorizontal: 20, width: '80%' },
	inputContainer: { marginVertical: '5%' },
	inputHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold' },
	input: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: 20, padding: 10 },
	errorMsg: { color: 'red', fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },

	options: { flexDirection: 'row' },
	option: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, padding: 5 },
	optionHeader: {  },
	submit: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontFamily: 'appFont', marginVertical: 40, padding: 10 },
	submitHeader: { fontWeight: 'bold' },
})
