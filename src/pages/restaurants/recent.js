import React, { useState } from 'react';
import { SafeAreaView, FlatList, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function recent({ navigation }) {
	const [items, setItems] = useState([
		{
			key: "r-0", 
			id: "19x9c-c9c9c9c-0",
			name: "Roasted milk tea", 
			info: [
				{ header: 'Size', selected: 'small' },
				{ header: 'Sugar', selected: 3 },
				{ header: 'Cream', selected: 3 }
			], 
			quantity: 4, price: 5.49,
			date: "Tue, Jan 18, 2021 at 9:30 AM"
		},
		{
			key: "r-1", 
			id: "19x9c-c9c9c9c-0",
			name: "Roasted milk tea", 
			info: [
				{ header: 'Size', selected: 'small' },
				{ header: 'Sugar', selected: 3 },
				{ header: 'Cream', selected: 3 }
			], 
			quantity: 4, price: 5.49,
			date: "Tue, Jan 17, 2021 at 9:30 AM"
		},
		{
			key: "r-2", 
			id: "19x9c-c9c9c9c-0",
			name: "Roasted milk tea", 
			info: [
				{ header: 'Size', selected: 'small' },
				{ header: 'Sugar', selected: 3 },
				{ header: 'Cream', selected: 3 }
			], 
			quantity: 4, price: 5.49,
			date: "Tue, Jan 15, 2021 at 9:30 AM"
		},
		{
			key: "r-3", 
			id: "19x9c-c9c9c9c-0",
			name: "Roasted milk tea", 
			info: [
				{ header: 'Size', selected: 'small' },
				{ header: 'Sugar', selected: 3 },
				{ header: 'Cream', selected: 3 }
			], 
			quantity: 4, price: 5.49,
			date: "Tue, Jan 13, 2021 at 9:30 AM"
		}
	])

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={style.box}>
				<TouchableOpacity style={style.back} onPress={() => navigation.goBack()}>
					<Text style={style.backHeader}>Back</Text>
				</TouchableOpacity>
				<Text style={style.boxHeader}>Recent</Text>

				<FlatList
					showsVerticalScrollIndicator={false}
					data={items}
					renderItem={({ item, index }) => 
						<View style={style.item} key={item.key}>
							<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
								<View style={style.itemImageHolder}>
									<Image source={require("../../../assets/product-image.png")} style={{ height: 100, width: 100 }}/>
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

							<Text style={style.dateHeader}><Text style={{ fontWeight: 'bold' }}>Date:</Text> {item.date}</Text>
						</View>
					}
				/>
			</View>
		</SafeAreaView>
	);
}

const style = StyleSheet.create({
	box: { height: '100%', width: '100%' },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, margin: 20, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: 20 },
	boxHeader: { fontFamily: 'appFont', fontSize: 30, fontWeight: 'bold', marginTop: 10, textAlign: 'center' },

	item: { borderStyle: 'solid', borderBottomWidth: 0.5, borderTopWidth: 0.5, padding: 10 },
	itemImageHolder: { backgroundColor: 'rgba(0, 0, 0, 0.1)', height: 100, overflow: 'hidden', width: 100 },
	itemInfos: {  },
	itemInfo: { fontSize: 15 },
	header: { fontSize: 15 },
	dateHeader: { marginTop: 10 },
})
