import React, { useEffect, useState } from 'react'
import { AsyncStorage, SafeAreaView, ActivityIndicator, Dimensions, View, FlatList, Image, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native'
import { CommonActions } from '@react-navigation/native';

import Notifications from '../components/notifications'

import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

const { height, width } = Dimensions.get('window')

export default function main({ navigation }) {
	const [services, setServices] = useState([
		{ key: "0", service: "restaurants", header: "Restaurant(s)", locations: [
			{ key: 'l-0', id: "d9df9dsfsdf-0", service: "d9dsofidsoif-0", logo: { photo: require('../../assets/restaurant-logo.png'), width: 0, height: 0 }, name: "Tim Hortons 0", radiusKm: 1 },
			{ key: 'l-1', id: "d9df9dsfsdf-1", service: "d9dsofidsoif-1", logo: { photo: require('../../assets/restaurant-logo.png'), width: 0, height: 0 }, name: "Tim Hortons 1", radiusKm: 2 },
			{ key: 'l-2', id: "d9df9dsfsdf-2", service: "d9dsofidsoif-2", logo: { photo: require('../../assets/restaurant-logo.png'), width: 0, height: 0 }, name: "Tim Hortons 2", radiusKm: 3 },
			{ key: 'l-3', id: "d9df9dsfsdf-3", service: "d9dsofidsoif-3", logo: { photo: require('../../assets/restaurant-logo.png'), width: 0, height: 0 }, name: "Tim Hortons 3", radiusKm: 4 },
			{ key: 'l-4', id: "d9df9dsfsdf-4", service: "d9dsofidsoif-4", logo: { photo: require('../../assets/restaurant-logo.png'), width: 0, height: 0 }, name: "Tim Hortons 4", radiusKm: 5 },
			{ key: 'l-5', id: "d9df9dsfsdf-5", service: "d9dsofidsoif-5", logo: { photo: require('../../assets/restaurant-logo.png'), width: 0, height: 0 }, name: "Tim Hortons 5", radiusKm: 6 }
		], loading: true },
		{ key: "1", service: "salons", header: "Salon(s)", locations: [
			{ key: "s-0", id: "29d9c90d0c-0", service: "ds9fidsfidsof-0", logo: { photo: require('../../assets/salon-logo.jpeg'), width: 0, height: 0 }, name: "Hair Salon 0", radiusKm: 5 },
			{ key: "s-1", id: "29d9c90d0c-1", service: "ds9fidsfidsof-1", logo: { photo: require('../../assets/salon-logo.jpeg'), width: 0, height: 0 }, name: "Hair Salon 1", radiusKm: 5 },
			{ key: "s-2", id: "29d9c90d0c-2", service: "ds9fidsfidsof-2", logo: { photo: require('../../assets/salon-logo.jpeg'), width: 0, height: 0 }, name: "Hair Salon 2", radiusKm: 5 },
			{ key: "s-3", id: "29d9c90d0c-3", service: "ds9fidsfidsof-3", logo: { photo: require('../../assets/salon-logo.jpeg'), width: 0, height: 0 }, name: "Hair Salon 3", radiusKm: 5 },
			{ key: "s-4", id: "29d9c90d0c-4", service: "ds9fidsfidsof-4", logo: { photo: require('../../assets/salon-logo.jpeg'), width: 0, height: 0 }, name: "Hair Salon 4", radiusKm: 5 },
			{ key: "s-5", id: "29d9c90d0c-5", service: "ds9fidsfidsof-5", logo: { photo: require('../../assets/salon-logo.jpeg'), width: 0, height: 0 }, name: "Hair Salon 5", radiusKm: 5 }
		], loading: true }
	])
	const [openNotifications, setOpenNotifications] = useState(false)

	const getLocations = (type, index, start) => {
		let { locations } = services[index]
		let last_item = locations[locations.length - 1]
		let itemkey = parseInt(last_item.key.replace("s-", ""))
		let km = last_item.radiusKm

		for (let k = 1; k <= 10; k++) {
			itemkey += 1
			km += 5

			locations.push({
				key: "s-" + itemkey,
				id: "29d9c90d0c-" + itemkey,
				service: "ds9fidsfidsof-" + itemkey,
				logo: { 
					photo: '',
					width: 0, height: 0
				},
				name: type == "restaurants" ? "Tim Hortons " + itemkey : "Hair Salon " + itemkey,
				radiusKm: km
			})
		}

		services[index].locations = locations

		setServices(services)
	}

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={style.box}>
				<View style={style.header}>
					<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
						<TextInput style={style.searchInput} placeholder="Search any services"/>
						<TouchableOpacity style={style.notification} onPress={() => setOpenNotifications(true)}>
							<FontAwesome name="bell" size={30}/>
							<Text style={{ fontWeight: 'bold' }}>12</Text>
						</TouchableOpacity>
					</View>
				</View>

				<View style={style.body}>
					<FlatList
						style={{ height: height - 223 }}
						showsVerticalScrollIndicator={false}
						data={services}
						renderItem={({ item, index }) => 
							<View key={item.key} style={style.service}>
								<Text style={style.rowHeader}>{item.header} ({item.locations.length})</Text>

								<View style={style.row}>
									<FlatList
										ListFooterComponent={() => {
											if (item.loading) {
												return <ActivityIndicator style={{ marginVertical: 50 }} size="large"/>
											}

											return null
										}}
										horizontal
										onEndReached={() => getLocations(item.service, index, false)}
										onEndReachedThreshold={0}
										showsHorizontalScrollIndicator={false}
										data={item.locations}
										renderItem={({ item }) => 
											<TouchableOpacity style={style.location}>
												<View style={style.locationPhotoHolder}>
													<Image source={item.logo.photo} style={{ height: 80, width: 80 }}/>
												</View>

												<Text style={style.locationName}>{item.name}</Text>
											</TouchableOpacity>
										}
									/>
								</View>
							</View>
						}
					/>
				</View>

				<View style={style.bottomNavs}>
					<TouchableOpacity style={style.bottomNav} onPress={() => navigation.navigate("account")}>
						<FontAwesome5 name="user-circle" size={30}/>
					</TouchableOpacity>
					<TouchableOpacity style={style.bottomNav} onPress={() => navigation.navigate("recent")}>
						<FontAwesome name="history" size={30}/>
					</TouchableOpacity>
					<TouchableOpacity style={style.bottomNav} onPress={() => {
						AsyncStorage.clear()

						navigation.dispatch(
							CommonActions.reset({
								index: 1,
								routes: [{ name: 'login' }]
							})
						);
					}}>
						<Text style={style.bottomNavHeader}>Log-Out</Text>
					</TouchableOpacity>
				</View>
			</View>

			<Modal visible={openNotifications}><Notifications close={() => setOpenNotifications(false)}/></Modal>
		</SafeAreaView>
	)
}

const style = StyleSheet.create({
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	header: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: 70, justifyContent: 'space-between', padding: 5, width: '100%' },
	searchInput: { backgroundColor: '#EFEFEF', borderRadius: 5, fontSize: 15, margin: 10, padding: 10, width: width - 80 },
	notification: { flexDirection: 'row', marginRight: 10, marginVertical: 10 },

	service: { marginBottom: 10, marginHorizontal: 5 },
	rowHeader: { fontWeight: 'bold', margin: 10 },
	row: { flexDirection: 'row' },
	location: { alignItems: 'center', flexDirection: 'column', height: 100, justifyContent: 'space-between', margin: 5, width: 100 },
	locationPhotoHolder: { backgroundColor: 'rgba(127, 127, 127, 0.2)', height: 80, overflow: 'hidden', width: 80 },


	bottomNavs: { backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', height: 30, marginVertical: 5 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },
})
