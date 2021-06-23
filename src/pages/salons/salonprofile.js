import React, { useState } from 'react'
import { Dimensions, SafeAreaView, View, FlatList, Image, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

const { height, width } = Dimensions.get('window')

export default function salonprofile(props) {
	let { name } = props.route.params

	const [locationName, setLocationname] = useState(name)
	const [address, setAddress] = useState('775 Britannia Rd W Unit 9, Mississauga, ON L5V 2Y1')
	const [phonenumber, setPhonenumber] = useState('905-858-2828')
	const [services, setServices] = useState([
		{ key: "r-0", items: [
			{ key: "s-0", image: require("../../../assets/nailsalon/footcare.jpeg"), name: "Foot Care" },
			{ key: "s-1", image: require("../../../assets/nailsalon/footmassage.jpeg"), name: "Foot Massage" }
		]},
		{ key: "r-1", items: [
			{ key: "s-2", image: require("../../../assets/nailsalon/nailenhancement.jpeg"), name: "Nail Enhancement" },
			{ key: "s-3", image: require("../../../assets/nailsalon/handcare.jpeg"), name: "Hand Care" }
		]},
		{ key: "r-2", items: [
			{ key: "s-4", image: require("../../../assets/nailsalon/child.jpeg"), name: "Children 10 years & under" },
			{ key: "s-5", image: require("../../../assets/nailsalon/facial.jpeg"), name: "Facial" }
		]},
		{ key: "r-3", items: [
			{ key: "s-6", image: require("../../../assets/nailsalon/eyelashextensions.jpeg"), name: "Eyelash Extensions" },
			{ key: "s-7", image: require("../../../assets/nailsalon/womenwaxing.jpeg"), name: "Waxing for women" },
			
		]},
		{ key: "r-4", items: [
			{ key: "s-8", image: require("../../../assets/nailsalon/menwaxing.jpeg"), name: "Waxing for men" },
			{ key: "s-9", image: require("../../../assets/nailsalon/relaxingmassages.jpeg"), name: "Relaxing Massages" }
		]},
	])

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={style.box}>
				<TouchableOpacity style={style.back} onPress={() => props.navigation.goBack()}>
					<Text style={style.backHeader}>Back</Text>
				</TouchableOpacity>
				<View style={style.headers}>
					<Text style={style.header}>{locationName}</Text>
					<Text style={style.header}>{address}</Text>
					<Text style={style.header}>5 km away</Text>
				</View>

				<View style={style.body}>
					<Text style={style.bodyHeader}>9 Service(s)</Text>

					<FlatList
						showsVerticalScrollIndicator={false}
						data={services}
						renderItem={({ item, index }) => 
							<View key={item.key} style={style.row}>
								{item.items.map(( service, index ) => (
									<TouchableOpacity key={service.key} style={style.service} onPress={() => props.navigation.navigate("serviceslist", { name: service.name })}>
										<View style={style.servicePhotoHolder}>
											<Image source={service.image} style={{ height: (width * 0.5) - 100, width: (width * 0.5) - 100 }}/>
										</View>
										<Text style={style.serviceHeader}>{service.name}</Text>
									</TouchableOpacity>
								))}
							</View>
						}
					/>
				</View>
			</View>
		</SafeAreaView>
	)
}

const style = StyleSheet.create({
	box: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, margin: 20, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: 20 },
	headers: { marginVertical: 20 },
	header: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold', marginVertical: 5, paddingHorizontal: 50, textAlign: 'center' },

	body: { alignItems: 'center' },
	bodyHeader: { fontSize: 20, fontWeight: 'bold' },
	row: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },

	service: { alignItems: 'center', height: width * 0.5, width: width * 0.5 },
	servicePhotoHolder: { borderRadius: ((width * 0.5) - 100) / 2, height: (width * 0.5) - 100, overflow: 'hidden', width: (width * 0.5) - 100 },
	serviceHeader: { fontFamily: 'appFont', fontSize: 20, marginVertical: 20 },
})
