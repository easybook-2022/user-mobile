import React, { useState } from 'react';
import { SafeAreaView, View, FlatList, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

import AntDesign from 'react-native-vector-icons/AntDesign'

export default function notifications(props) {
	const [items, setItems] = useState([
		{
			key: "0", 
			id: "1-x900d0d0d-0",
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
			],
			adder: { username: "good girl", profile: { photo: '', width: 0, height: 0 }}
		},
		{
			key: "1", 
			id: "1-x900d0d0d-1",
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
			],
			adder: { username: "good girl", profile: { photo: '', width: 0, height: 0 }}
		},
		{
			key: "2", 
			id: "1-x900d0d0d-2",
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
			],
			adder: { username: "good girl", profile: { photo: '', width: 0, height: 0 }}
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
				<Text style={style.boxHeader}>{items.length} Notification(s)</Text>

				<FlatList
					showsVerticalScrollIndicator={false}
					data={items}
					renderItem={({ item, index }) => 
						<View style={style.item} key={item.key}>
							<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
								<View style={style.itemImageHolder}>
									<Image source={require('../../assets/product-image.png')} style={{ height: 100, width: 100 }}/>
								</View>
								<View style={style.itemInfos}>
									{item.info.map((info, infoindex) => (
										<Text key={infoindex.toString()} style={style.itemInfo}><Text style={{ fontWeight: 'bold' }}>{info.header}:</Text> {info.selected}</Text>
									))}
								</View>
								<Text style={style.quantity}><Text style={{ fontWeight: 'bold' }}>quantity:</Text> {item.quantity}</Text>
							</View>
							<View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 }}>
								<View style={{ flexDirection: 'row' }}>
									<View style={style.adderInfo}>
										<View style={style.adderInfoProfile}>
											<Image source={require('../../assets/profile.jpeg')} style={{ height: 40, width: 40 }}/>
										</View>
										<Text style={style.adderInfoUsername}>{item.adder.username}</Text>
									</View>
									<Text style={style.adderInfoHeader}> added this item to your cart.</Text>
								</View>
							</View>
							
							<Text style={style.adderHeader}>Want to purchase this?</Text>
							<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
								<View style={style.adderActions}>
									<TouchableOpacity style={style.adderAction} onPress={() => {}}>
										<Text style={style.adderActionHeader}>No</Text>
									</TouchableOpacity>
									<TouchableOpacity style={style.adderAction} onPress={() => {}}>
										<Text style={style.adderActionHeader}>Yes</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					}
				/>
			</View>
		</SafeAreaView>
	);
}

const style = StyleSheet.create({
	box: { height: '100%', width: '100%' },
	close: { margin: 20 },
	boxHeader: { fontFamily: 'appFont', fontSize: 30, fontWeight: 'bold', marginTop: 10, textAlign: 'center' },

	item: { borderStyle: 'solid', borderBottomWidth: 0.5, borderTopWidth: 0.5, padding: 10 },
	itemImageHolder: { backgroundColor: 'rgba(0, 0, 0, 0.1)', height: 100, overflow: 'hidden', width: 100 },
	itemInfos: {  },
	itemInfo: { fontSize: 15 },
	quantity: { fontSize: 15 },
	adderInfo: { alignItems: 'center' },
	adderInfoProfile: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 20, height: 40, overflow: 'hidden', width: 40 },
	adderInfoHeader: { paddingVertical: 20 },
	adderHeader: { textAlign: 'center' },
	adderActions: { flexDirection: 'row', justifyContent: 'space-around' },
	adderAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 1, margin: 5, padding: 5, width: 100 },
	adderActionHeader: { textAlign: 'center' },
})
