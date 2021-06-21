import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function account({ navigation }) {
	const [phonenumber, setPhonenumber] = useState('1231231234')
	const [password, setPassword] = useState('password')
	const [confirmpassword, setConfirmpassword] = useState('password')
	const [profile, setProfile] = useState({ photo: '', width: 0, height: 0 })

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={style.box}>
				<TouchableOpacity style={style.back} onPress={() => navigation.goBack()}>
					<Text style={style.backHeader}>Back</Text>
				</TouchableOpacity>
				<Text style={style.boxHeader}>Account</Text>
			</View>
		</SafeAreaView>
	);
}

const style = StyleSheet.create({
	box: { height: '100%', width: '100%' },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, margin: 20, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: 20 },
	boxHeader: { fontFamily: 'appFont', fontSize: 30, fontWeight: 'bold', textAlign: 'center' },
})
