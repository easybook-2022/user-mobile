import React, { useState } from 'react'
import { Dimensions, SafeAreaView, View, FlatList, Image, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

const { height, width } = Dimensions.get('window')

const items = {
	"Foot Care": [
		{ 
			key: "s-0", name: "Add On Shellac", 
			price: "$15"
		},
		{ 
			key: "s-1", name: "Shellac Removal", 
			price: "$10"
		},
		{ 
			key: "s-2", name: "Shellac Color Only", 
			price: "$25 +"
		},
		{ 
			key: "s-3", 
			name: "Express Pedicure", time: "30 Mins", 
			info: "Includes warm whirlpool soak, color removal, trimming and shaping nails, cuticles care and regular polish.", 
			price: "$30 +"
		},
		{ 
			key: "s-4", 
			name: "Spa Pedicure", time: "35 Mins", 
			info: "Includes warm whirlpool soak with Rock Sea Salt, nails, cuticles & callous care, a mini massage with oil, hot towel wrap, and application of regular polish. \n\n Add Paraffin:...", 
			price: "$45 +"
		},
		{
			key: "s-5",
			name: "Deluxe Pedicure", time: "45 Mins",
			info: "Includes warm whirlpool soak with Foaming Flower Soap; nails, cuticles & callous care, relaxing lotion massage, paraffin, and mint mask, finishing with hot towel wrap and regular polish.", 
			price: "$59 +"
		},
		{
			key: "s-6",
			name: "The One Lavender Pedicure", time: "55 Mins",
			info: "Enjoy the relaxing and anti-stress benefits of Lavender. This treatment starts with a gentle exfoliation consisting of Lavender Salt and scrubs to remove dry skin and improve skin's texture. The feet are wrapped in Lavender paraffin & a mask. Regular polish is included.", 
			price: "$69 +"
		},
		{
			key: "s-7",
			name: "The One Jell-ous Feet Treat", time: "60 Mins",
			info: "Translucent fluffy jelly provides the ultimate relief for stress and aching muscles. Exfoliates and hydrates dry skin.", 
			price: "$79 +"
		},
		{
			key: "s-8",
			name: "The One Organic Pedicure", time: "60 Mins",
			info: "Designed to brighten & lighten skin tone for a flawless, porcelain finish without the use of dangerous chemicals in purely natural & organic treatment. \n\n Your choice of fresh lemon & ginger/orange & ginger", 
			price: "$89 +"
		}
	],
	"Foot Massage": [
		{ key: "s-0", time: "10 Mins", price: "$20" },
		{ key: "s-1", time: "20 Mins", price: "$30" },
		{ key: "s-2", time: "15 Mins", price: "$25" },
	],
	"Nail Enhancement": [
		{ key: "s-0", name: "Manicure", price: "$10" },
		{ key: "s-1", name: "Repair 1 Nails", price: "$5" },
		{ key: "s-2", name: "Change Shape", price: "$10" },
		{ key: "s-3", name: "Dip Overlay", price: "$40 +" },
		{ key: "s-4", name: "Dip Overlay Full Set", price: "$45 +" },
		{ key: "s-5", name: "Dip Overlay Fill in", price: "$40 +" },
		{ key: "s-6", name: "Acrylic Full Set", price: "$35 +" },
		{ key: "s-7", name: "Acrylic Fill in", price: "$30 +" },
		{ key: "s-8", name: "UV Gel Full Set", price: "$45 +" },
		{ key: "s-9", name: "UV Gel Fill in", price: "$40" },
		{ key: "s-10", name: "Bio Gel Overlay", price: "$45" },
		{ key: "s-11", name: "Bio Gel Full Set", price: "$50" },
		{ key: "s-12", name: "Bio Gel Fill in", price: "$40" }
	],
	"Hand Care": [
		{ key: "s-0", name: "Shellac Removal only", price: "$10" },
		{ key: "s-1", name: "Shellac Color Only", price: "$20 +" },
		{ key: "s-2", name: "Shellac Removal", price: "$10" },
		{ key: "s-3", name: "Express Manicure", price: "$30 +" },
	],
	"Children 10 years & under": [
		{ key: "s-0", name: "Manicure", price: "$10" },
		{ key: "s-1", name: "Pedicure", price: "$20 +" },
		{ key: "s-2", name: "Combo", price: "$10" }
	],
	"Facial": [
		{ key: "s-0", name: "Basic Facial", price: "$50 +" },
		{ key: "s-1", name: "Deep Cleaning", price: "$65 +" },
		{ key: "s-2", name: "Teen Facial", price: "$40" },
		{ key: "s-3", name: "Acne Facial Treatment", price: "$75 +" },
		{ key: "s-4", name: "Aqua Peeling Head", price: "$20 +" },
		{ key: "s-5", name: "RF Eyes Pen", price: "$10 +" },
		{ key: "s-6", name: "Oxygen Spayer", price: "$15 +" },
	],
	"Eyelash Extensions": [
		{ key: "s-0", name: "Single Mink Lashes", price: "$145 +" },
		{ key: "s-1", name: "Refill", time: "2 weeks", price: "$60 +" },
	],

	"Waxing for women": [
		{ key: "s-0", name: "Bikini Line", price: "$25 +" },
		{ key: "s-1", name: "Brazilian", price: "$45 +" },
		{ key: "s-2", name: "Eyebrow", price: "$9 +" },
		{ key: "s-3", name: "Lip", price: "$6" },
		{ key: "s-4", name: "Chin", price: "$9" },
		{ key: "s-5", name: "Full Face", price: "$35" },
		{ key: "s-6", name: "Sideburns", price: "$12 +" },
		{ key: "s-7", name: "Half Arms", price: "$25" },
		{ key: "s-8", name: "Full Arms", price: "$35 +" },
		{ key: "s-9", name: "Half Leg", price: "$25 +" },
		{ key: "s-10", name: "Full Legs", price: "$45 +" },
		{ key: "s-11", name: "Under arms", price: "$20 +" },
		{ key: "s-12", name: "Threading Eyebrow", price: "$10" }
	],
	"Waxing for men": [
		{ key: "s-0", name: "Back", price: "$50" },
		{ key: "s-1", name: "Chest", price: "$35" },
	],
	"Relaxing Massages": [
		{ key: "s-0", name: "Half Body 30 Mins", price: "$45" },
		{ key: "s-1", name: "Full Body Massage 60 Mins", price: "$70" },
		{ key: "s-2", name: "Hot Stone Massage 30 Mins", price: "$50" },
		{ key: "s-3", name: "Hot Stone Massage 60 Mins", price: "$90" },
		{ key: "s-4", name: "Leg Massage 20 Mins", price: "$30" },
		{ key: "s-5", name: "Shoulders & Neck 30 Mins", price: "$45" },
		{ key: "s-6", name: "Foot Massage 20 Mins", price: "$30" },
	]
}

export default function serviceslist(props) {
	let { name } = props.route.params
	let [services, setServices] = useState(items[name])

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={style.box}>
				<TouchableOpacity style={style.back} onPress={() => props.navigation.goBack()}>
					<Text style={style.backHeader}>Back</Text>
				</TouchableOpacity>

				<View style={style.body}>
					<Text style={style.bodyHeader}>{services.length} {name} service(s)</Text>

					<FlatList
						data={services}
						renderItem={({ item, index }) => 
							<View key={item.key} style={style.service}>
								<Text style={style.serviceName}>{item.name}</Text>
								{item.info && <Text style={style.serviceInfo}>{item.info}</Text>}

								<View style={{ flexDirection: 'row' }}>
									<Text style={style.serviceDetail}>{item.price}</Text>
									<Text style={style.serviceDetail}>{item.time}</Text>
								</View>
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

	body: { height: height - 149 },
	bodyHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 50, textAlign: 'center' },

	service: { marginBottom: 50, marginHorizontal: 10 },
	serviceName: { fontSize: 20, fontWeight: 'bold' },
	serviceInfo: { fontSize: 15 },
	serviceDetail: { fontSize: 15, marginHorizontal: 10, marginVertical: 20 },
})
