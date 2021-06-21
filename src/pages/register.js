import React, { useState } from 'react';
import { AsyncStorage, SafeAreaView, View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { registerUser } from '../apis/users'

export default function register({ navigation }) {
	const [phonenumber, setPhonenumber] = useState('1231231234')
	const [password, setPassword] = useState('password')
	const [confirmpassword, setConfirmpassword] = useState('c password')

	const register = () => {
		const data = { cellnumber: phonenumber, password: password }

		registerUser(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}

				return
			})
			.then((res) => {
				if (res) {
					const { id } = res

					AsyncStorage.setItem("id", id)
					
					navigation.dispatch(
						CommonActions.reset({
							index: 1,
							routes: [{ name: 'main' }]
						})
					);
				}
			})
	}

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={style.box}>
				<Image style={style.background} source={require('../../assets/auto-bg.jpg')}/>
				<Text style={style.boxHeader}>Sign-Up</Text>

				<View style={style.inputsBox}>
					<View style={style.inputContainer}>
						<Text style={style.inputHeader}>Phone number:</Text>
						<TextInput style={style.input} onChangeText={(phonenumber) => setPhonenumber(phonenumber)} value={phonenumber} keyboardType="numeric"/>
					</View>

					<View style={style.inputContainer}>
						<Text style={style.inputHeader}>Password:</Text>
						<TextInput style={style.input} secureEntry={true} onChangeText={(password) => setPassword(password)} value={password}/>
					</View>

					<View style={style.inputContainer}>
						<Text style={style.inputHeader}>Confirm Password:</Text>
						<TextInput style={style.input} secureEntry={true} onChangeText={(confirmpassword) => setPassword(confirmpassword)} value={confirmpassword}/>
					</View>
				</View>

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
		</SafeAreaView>
	);
}

const style = StyleSheet.create({
	box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	background: { height: '100%', position: 'absolute', width: '100%' },
	boxHeader: { fontFamily: 'appFont', fontSize: 50, fontWeight: 'bold', paddingVertical: 30 },
	inputsBox: { backgroundColor: 'white', paddingHorizontal: 20, width: '80%' },
	inputContainer: { marginVertical: 20 },
	inputHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold' },
	input: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: 20, padding: 10 },
	options: { flexDirection: 'row' },
	option: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, padding: 5 },
	optionHeader: {  },
	submit: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontFamily: 'appFont', marginVertical: 40, padding: 20 },
	submitHeader: { fontWeight: 'bold' },
})
