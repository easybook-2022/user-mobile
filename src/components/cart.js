import React, { useState } from 'react';
import { SafeAreaView, View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';

import AntDesign from 'react-native-vector-icons/AntDesign'

export default function cart(props) {
	const [items, setItems] = useState([
		{ 
			key: "0", 
			id: "1d9s-sdid-s-0",
			name: "Roasted milk tea", 
			info: [
				{ header: 'Size', selected: 'small' },
				{ header: 'Sugar', selected: 3 },
				{ header: 'Cream', selected: 3 }
			], 
			quantity: 4, price: 5.49,
			orderers: [
				{ key: "0-0", username: "good girl", profile: { photo: "", width: 0, height: 0 }},
				{ key: "0-1", username: "good girl", profile: { photo: "", width: 0, height: 0 }},
				{ key: "0-2", username: "good girl", profile: { photo: "", width: 0, height: 0 }},
				{ key: "0-3", username: "good girl", profile: { photo: "", width: 0, height: 0 }}
			]
		},
		{ 
			key: "1", 
			id: "1d9s-sdid-s-0",
			name: "Roasted milk tea", 
			info: [
				{ header: 'Size', selected: 'small' },
				{ header: 'Sugar', selected: 3 },
				{ header: 'Cream', selected: 3 }
			], 
			quantity: 4, price: 5.49,
			orderers: [
				{ key: "1-0", username: "good girl", profile: { photo: "", width: 0, height: 0 }},
				{ key: "1-1", username: "good girl", profile: { photo: "", width: 0, height: 0 }},
				{ key: "1-2", username: "good girl", profile: { photo: "", width: 0, height: 0 }},
				{ key: "1-3", username: "good girl", profile: { photo: "", width: 0, height: 0 }}
			]
		},
		{ 
			key: "2", 
			id: "1d9s-sdid-s-0",
			name: "Roasted milk tea", 
			info: [
				{ header: 'Size', selected: 'small' },
				{ header: 'Sugar', selected: 3 },
				{ header: 'Cream', selected: 3 }
			], 
			quantity: 4, price: 5.49,
			orderers: [
				{ key: "2-0", username: "good girl", profile: { photo: "", width: 0, height: 0 }},
				{ key: "2-1", username: "good girl", profile: { photo: "", width: 0, height: 0 }},
				{ key: "2-2", username: "good girl", profile: { photo: "", width: 0, height: 0 }},
				{ key: "2-3", username: "good girl", profile: { photo: "", width: 0, height: 0 }}
			]
		},
		{
			key: "3", 
			id: "1d9s-sdid-s-0",
			name: "Roasted milk tea", 
			info: [
				{ header: 'Size', selected: 'small' },
				{ header: 'Sugar', selected: 3 },
				{ header: 'Cream', selected: 3 }
			], 
			quantity: 4, price: 5.49,
			orderers: [
				{ key: "3-0", username: "good girl", profile: { photo: "", width: 0, height: 0 }},
				{ key: "3-1", username: "good girl", profile: { photo: "", width: 0, height: 0 }},
				{ key: "3-2", username: "good girl", profile: { photo: "", width: 0, height: 0 }},
				{ key: "3-3", username: "good girl", profile: { photo: "", width: 0, height: 0 }}
			]
		},
		{
			key: "4", 
			id: "1d9s-sdid-s-0",
			name: "Roasted milk tea", 
			info: [
				{ header: 'Size', selected: 'small' },
				{ header: 'Sugar', selected: 3 },
				{ header: 'Cream', selected: 3 }
			], 
			quantity: 4, price: 5.49,
			orderers: [
				{ key: "4-0", username: "good girl", profile: { photo: "", width: 0, height: 0 }},
				{ key: "4-1", username: "good girl", profile: { photo: "", width: 0, height: 0 }},
				{ key: "4-2", username: "good girl", profile: { photo: "", width: 0, height: 0 }},
				{ key: "4-3", username: "good girl", profile: { photo: "", width: 0, height: 0 }}
			]
		},
		{
			key: "5", 
			id: "1d9s-sdid-s-0",
			name: "Roasted milk tea", 
			info: [
				{ header: 'Size', selected: 'small' },
				{ header: 'Sugar', selected: 3 },
				{ header: 'Cream', selected: 3 }
			], 
			quantity: 4, price: 5.49,
			orderers: [
				{ key: "5-0", username: "good girl", profile: { photo: "", width: 0, height: 0 }},
				{ key: "5-1", username: "good girl", profile: { photo: "", width: 0, height: 0 }},
				{ key: "5-2", username: "good girl", profile: { photo: "", width: 0, height: 0 }},
				{ key: "5-3", username: "good girl", profile: { photo: "", width: 0, height: 0 }}
			]
		}
	])

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={style.box}>
				<View style={{ alignItems: 'center', width: '100%' }}>
					<TouchableOpacity style={style.close} onPress={() => props.close()}>
						<AntDesign name="closecircleo" size={30}/>
					</TouchableOpacity>
				</View>
				<Text style={style.boxHeader}>Cart</Text>

				<FlatList
					showsVerticalScrollIndicator={false}
					data={items}
					renderItem={({ item, index }) => 
						<View style={style.item} key={item.key}>
							<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
								<View style={style.itemImageHolder}>
								</View>
								<View style={style.itemInfos}>
									{item.info.map((info, infoindex) => (
										<Text key={infoindex.toString()} style={style.itemInfo}><Text style={{ fontWeight: 'bold' }}>{info.header}:</Text> {info.selected}</Text>
									))}
								</View>
								<View>
									<Text style={style.header}><Text style={{ fontWeight: 'bold' }}>quantity:</Text> {item.quantity}</Text>
									<Text style={style.header}><Text style={{ fontWeight: 'bold' }}>price:</Text> ${item.price}</Text>
								</View>
							</View>
							<View style={style.orderersContainer}>
								<Text style={style.orderersHeader}>Ordering for</Text>

								<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
									<View style={style.orderers}>
										{item.orderers.map(orderer => (
											<View key={orderer.key} style={style.orderer}>
												<View style={style.ordererProfile}>
												</View>
												<Text style={style.ordererHeader}>{orderer.username}</Text>
											</View>
										))}
									</View>
								</View>
							</View>
						</View>
					}
				/>

				<View style={{ alignItems: 'center' }}>
					<TouchableOpacity style={style.checkout} onPress={() => props.close()}>
						<Text style={style.checkoutHeader}>Checkout</Text>
					</TouchableOpacity>
				</View>
			</View>
		</SafeAreaView>
	);
}

const style = StyleSheet.create({
	box: { height: '100%', width: '100%' },
	close: { margin: 20 },
	boxHeader: { fontFamily: 'appFont', fontSize: 30, fontWeight: 'bold', marginTop: 10, textAlign: 'center' },

	item: { borderStyle: 'solid', borderBottomWidth: 0.5, borderTopWidth: 0.5, padding: 10 },
	itemImageHolder: { backgroundColor: 'rgba(0, 0, 0, 0.1)', height: 100, width: 100 },
	itemInfos: {  },
	itemInfo: { fontSize: 15 },
	header: { fontSize: 15 },
	orderersContainer: { backgroundColor: 'rgba(127, 127, 127, 0.5)', borderRadius: 5, marginVertical: 10, padding: 5 },
	orderersHeader: { fontWeight: 'bold', textAlign: 'center' },
	orderers: { flexDirection: 'row' },
	orderer: { alignItems: 'center', margin: 10 },
	ordererProfile: { backgroundColor: 'white', borderRadius: 20, height: 40, width: 40 },
	ordererHeader: {  },

	checkout: { borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, marginVertical: 20, padding: 10 },
	checkoutHeader: { },
})
