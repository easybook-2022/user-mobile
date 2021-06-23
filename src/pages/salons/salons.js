import React, { useState } from 'react'
import { AsyncStorage, SafeAreaView, ActivityIndicator, Dimensions, View, FlatList, Text, TextInput, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { CommonActions } from '@react-navigation/native';

import Notifications from '../../components/notifications'

const { height, width } = Dimensions.get('window')

import Ionicons from 'react-native-vector-icons/Ionicons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

export default function salons({ navigation }) {
	const [locations, setLocations] = useState([
		{ key: "l-row-0", row: [
			{ key: 'l-0', id: "d9df9dsfsdf-0", logo: { photo: require('../../../assets/salon-logo.jpeg'), width: 0, height: 0 }, name: "Salon 0", address: "547 Gerrard St", radiusKm: 1 },
			{ key: 'l-1', id: "d9df9dsfsdf-1", logo: { photo: require('../../../assets/salon-logo.jpeg'), width: 0, height: 0 }, name: "Salon 1", address: "547 Gerrard St", radiusKm: 2 },
			{ key: 'l-2', id: "d9df9dsfsdf-2", logo: { photo: require('../../../assets/salon-logo.jpeg'), width: 0, height: 0 }, name: "Salon 2", address: "547 Gerrard St", radiusKm: 3 }
		]},
		{ key: "l-row-1", row: [
			{ key: 'l-3', id: "d9df9dsfsdf-3", logo: { photo: require('../../../assets/salon-logo.jpeg'), width: 0, height: 0 }, name: "Salon 3", address: "547 Gerrard St", radiusKm: 4 },
			{ key: 'l-4', id: "d9df9dsfsdf-4", logo: { photo: require('../../../assets/salon-logo.jpeg'), width: 0, height: 0 }, name: "Salon 4", address: "547 Gerrard St", radiusKm: 5 },
			{ key: 'l-5', id: "d9df9dsfsdf-5", logo: { photo: require('../../../assets/salon-logo.jpeg'), width: 0, height: 0 }, name: "Salon 5", address: "547 Gerrard St", radiusKm: 6 }
		]},
		{ key: "l-row-2", row: [
			{ key: 'l-6', id: "d9df9dsfsdf-6", logo: { photo: require('../../../assets/salon-logo.jpeg'), width: 0, height: 0 }, name: "Salon 6", address: "547 Gerrard St", radiusKm: 7 },
			{ key: 'l-7', id: "d9df9dsfsdf-7", logo: { photo: require('../../../assets/salon-logo.jpeg'), width: 0, height: 0 }, name: "Salon 7", address: "547 Gerrard St", radiusKm: 8 },
			{ key: 'l-8', id: "d9df9dsfsdf-8", logo: { photo: require('../../../assets/salon-logo.jpeg'), width: 0, height: 0 }, name: "Salon 8", address: "547 Gerrard St", radiusKm: 9 }
		]},
		{ key: "l-row-3", row: [
			{ key: 'l-9', id: "d9df9dsfsdf-9", logo: { photo: require('../../../assets/salon-logo.jpeg'), width: 0, height: 0 }, name: "Salon 9", address: "547 Gerrard St", radiusKm: 10 },
			{ key: 'l-10' },
			{ key: 'l-11' }
		]}
	])
	const [loadingLocations, setLoadingLocations] = useState(true)
	const [openNotifications, setOpenNotifications] = useState(false)

	const getLocations = (start) => {
		let list = locations
		let newLocation, km = 0, itemkey = 0
		let last_row = list[list.length - 1]
		let rowkey = parseInt(last_row.key.replace("l-row-", ""))
		let row = last_row.row, rowfull = true
		let i

		row.forEach(function (item) {
			if (item.id) {
				itemkey = parseInt(item.key.replace("l-", ""))
				km = item.radiusKm
			} else {
				rowfull = false
			}
		})

		for (let k = 1; k <= 5; k++) {
			itemkey += 1
			km += 5

			newLocation = {
				id: "d9df9dsfsdf-" + itemkey,
				key: 'l-' + itemkey.toString(),
				logo: { photo: require('../../../assets/salon-logo.jpeg'), width: 0, height: 0 }, 
				name: "Salon " + itemkey, 
				address: "547 Gerrard St",
				radiusKm: km
			}

			if (rowfull) {
				rowkey += 1

				list.push({
					key: "l-row-" + rowkey,
					row: [
						newLocation,
						{ key: (itemkey + 1).toString() },
						{ key: (itemkey + 2).toString() }
					]
				})

				row = list[list.length - 1].row
				rowfull = false
			} else {
				for (i = 0; i <= 2; i++) {
					if (!row[i].id) {
						row[i] = newLocation

						break
					}
				}

				if (i == 2) {
					list[list.length - 1].row = row

					rowfull = true
				}
			}
		}

		setLocations(list)
	}

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={style.box}>
				<View style={style.header}>
					<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
						<TouchableOpacity style={{ marginVertical: 10 }} onPress={() => navigation.goBack()}>
							<Ionicons name="chevron-back" size={40}/>
						</TouchableOpacity>
						<TextInput style={style.searchInput} placeholder="Search any nail and hair salon"/>
						<TouchableOpacity style={style.notification} onPress={() => setOpenNotifications(true)}>
							<FontAwesome name="bell" size={30}/>
							<Text style={{ fontWeight: 'bold' }}>12</Text>
						</TouchableOpacity>
					</View>
				</View>

				<FlatList
					ListFooterComponent={() => {
						if (loadingLocations) {
							return <ActivityIndicator style={{ marginVertical: 50 }} size="large"/>
						}

						return null
					}}
					style={{ height: height - 245 }}
					onEndReached={() => getLocations(false)}
					onEndReachedThreshold={0}
					showsVerticalScrollIndicator={false}
					data={locations}
					renderItem={({ item }) => 
						<View key={item.key} style={style.row}>
							{item.row.map(info => (
								info.id ? 
									<TouchableOpacity key={info.key} style={style.salon} onPress={() => navigation.navigate("salonprofile", { name: info.name })}>
										<View style={style.salonInfo}>
											<Image style={style.salonLogo} source={info.logo.photo}/>
											<Text style={style.salonName}>{info.name}</Text>
											<Text style={style.radiusKm}>{info.radiusKm} km away</Text>
										</View>
										<Text style={style.salonAddress}>{info.address}</Text>
									</TouchableOpacity>
									:
									<View key={info.key} style={style.salonDisabled}></View>
							))}
						</View>
					}
				/>
			</View>

			<Modal visible={openNotifications}><Notifications close={() => setOpenNotifications(false)}/></Modal>
		</SafeAreaView>
	)
}

const style = StyleSheet.create({
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	header: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: 70, justifyContent: 'space-between', padding: 5, width: '100%' },
	searchInput: { backgroundColor: '#EFEFEF', borderRadius: 5, fontSize: 15, margin: 10, padding: 10, width: width - 110 },
	notification: { flexDirection: 'row', marginRight: 10, marginVertical: 10 },

	row: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },

	// nearest salons
	salon: { backgroundColor: 'white', margin: 5, padding: 5, width: '30%' },
	salonDisabled: { margin: 5, paddingVertical: 5, width: '30%' },
	salonInfo: { alignItems: 'center' },
	salonAddress: { fontWeight: 'bold', textAlign: 'center' },
	salonLogo: { height: 70, width: 70 },
	salonName: {  },
	radiusKm: { },
})
