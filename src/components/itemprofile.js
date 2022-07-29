import React, { useState, useEffect } from 'react';
import { SafeAreaView, Platform, Dimensions, ScrollView, View, FlatList, Image, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import Constants from 'expo-constants';
import { resizePhoto } from 'geottuse-tools';
import { socket, logo_url } from '../../assets/info'
import { getProductInfo } from '../apis/products'
import { getNumCartItems, addItemtocart } from '../apis/carts'

// components
import Orders from '../components/orders'

// widgets
import Loadingprogress from '../widgets/loadingprogress'
import Userauth from '../widgets/userauth'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}

export default function Itemprofile(props) {
	const { locationid, productid, productinfo, type } = props.route.params
	const func = props.route.params

	const [itemName, setItemname] = useState('')
	const [itemNote, setItemnote] = useState('')
	const [itemImage, setItemimage] = useState({ name: "", height: 0, width: 0 })
	const [itemPrice, setItemprice] = useState(0)
	const [sizes, setSizes] = useState([])
  const [quantities, setQuantities] = useState([])
  const [percents, setPercents] = useState([])
	const [quantity, setQuantity] = useState(1)
	const [cost, setCost] = useState(0)
	const [errorMsg, setErrormsg] = useState('')
	const [showNotifyUser, setShownotifyuser] = useState({ show: false, userid: 0, username: "" })
	const [showAuth, setShowauth] = useState({ show: false, addcart: false })
	const [userId, setUserid] = useState(null)
  const [loaded, setLoaded] = useState(false)

	const [orderingItem, setOrderingitem] = useState({ name: "", image: "", sizes: [], quantity: 0, cost: 0 })

	const [openOrders, setOpenorders] = useState(false)
	const [numCartItems, setNumcartitems] = useState(2)

	const getTheNumCartItems = async() => {
		const userid = await AsyncStorage.getItem("userid")

		if (userid) {
			getNumCartItems(userid)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						setUserid(userid)
						setNumcartitems(res.numCartItems)
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
            const { errormsg, status } = err.response.data
					}
				})
		}
	}
	const selectOption = (index, option) => {
		let newCost = cost, newOptions

    switch (option) {
      case "size":
        newOptions = [...sizes]

        newOptions.forEach(function (option) {
          if (option.selected) {
            option.selected = false

            newCost -= parseFloat(option.price)
          }
        })

        newOptions[index].selected = true
        newCost = quantity * parseFloat(newOptions[index].price)

        setSizes(newOptions)

        break;
      case "quantity":
        newOptions = [...quantities]

        newOptions.forEach(function (option) {
          if (option.selected) {
            option.selected = false

            newCost -= parseFloat(option.price)
          }
        })

        newOptions[index].selected = true
        newCost = quantity * parseFloat(newOptions[index].price)

        setQuantities(newOptions)

        break;
      case "percent":
        newOptions = [...percents]

        newOptions.forEach(function (option) {
          if (option.selected) {
            option.selected = false

            newCost -= parseFloat(option.price)
          }
        })

        newOptions[index].selected = true
        newCost = quantity * parseFloat(newOptions[index].price)

        setPercents(newOptions)

        break;
      default:
    }

		setCost(newCost)
	}
	const changeQuantity = action => {
		let newQuantity = quantity
		let newCost = 0

		newQuantity = action == "+" ? newQuantity + 1 : newQuantity - 1

		if (newQuantity < 1) {
			newQuantity = 1
		}

    if (itemPrice) {
      newCost += newQuantity * parseFloat(itemPrice)
    } else {
      if (sizes.length > 0) {
        sizes.forEach(function (size) {
          if (size.selected) {
            newCost += newQuantity * parseFloat(size.price)
          }
        })
      } else {
        quantities.forEach(function (quantity) {
          if (quantity.selected) {
            newCost += newQuantity * parseFloat(quantity.price)
          }
        })
      }
    }

		setQuantity(newQuantity)
		setCost(newCost)
	}
	const addCart = async id => {
		if (userId || id) {
      setShowauth({ ...showAuth, show: false })

			let callfor = [], receiver = []
			const newSizes = [], newQuantities = [], newPercents = []
			let size = "", price = 0
      
			if (!productinfo) {
        if (itemPrice) {
          price = itemPrice * quantity
        } else {
          sizes.forEach(function (info) {
            if (info.selected) {
              newSizes.push(info.name)

              price += parseFloat(info.price) * quantity
            }
          })

          quantities.forEach(function (info) {
            if (info.selected) {
              newQuantities.push(info.input)

              price += parseFloat(info.price) * quantity
            }
          })
          percents.forEach(function (info) {
            if (info.selected) {
              newPercents.push(info.input)

              price += parseFloat(info.price) * quantity
            }
          })
        }
			}
      
			if (price || productinfo) {
				const data = { 
					userid: userId || id, locationid, 
					productid: productid ? productid : -1, 
					productinfo: productinfo ? productinfo : "", 
					quantity, 
					callfor, 
					sizes: newSizes, quantities: newQuantities, percents: newPercents, 
					note: itemNote ? itemNote : "", type, 
					receiver
				}

				addItemtocart(data)
					.then((res) => {
						if (res.status == 200) {
							return res.data
						}
					})
					.then((res) => {
						if (res) {
							socket.emit("socket/addItemtocart", data, () => showOrders())
						}
					})
					.catch((err) => {
						if (err.response && err.response.status == 400) {
							const { errormsg, status } = err.response.data
						}
					})
			} else {
				setErrormsg("Please choose a size")
			}
		} else {
			setShowauth({ ...showAuth, show: true, addcart: true })
		}
	}
	const showOrders = () => {
		setOpenorders(true)
		setNumcartitems(numCartItems + 1)
	}
	const getTheProductInfo = async() => {
		getProductInfo(productid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { productImage, name, sizes, quantities, percents, price, cost } = res.productInfo

					setItemname(name)
					setItemimage(productImage)
					setItemprice(price)
					setSizes(sizes)
          setQuantities(quantities)
          setPercents(percents)
					setCost(cost)
          setLoaded(true)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data
				}
			})
	}
	const initialize = () => {
		getTheNumCartItems()

		if (productid) {
      getTheProductInfo()
    } else {
      setItemimage({ ...itemImage, height: 360, width: 360 })
      setLoaded(true)
    }
	}

	useEffect(() => initialize(), [])

	return (
		<SafeAreaView style={styles.itemprofile}>
      {loaded ? 
  			<View style={styles.box}>
  				<ScrollView style={{ height: '100%' }}>
  					<View style={{ alignItems: 'center', marginTop: 20 }}>
    					{itemImage.name && (
                <View style={styles.imageHolder}>
                  <Image 
                    source={{ uri: logo_url + itemImage.name }} 
                    style={resizePhoto(itemImage, wsize(40))}
                  />
                </View>
              )}
  					</View>

  					<Text style={styles.boxHeader}>{itemName ? itemName : productinfo}</Text>

  					{sizes.length > 0 && (
  						<View style={styles.sizesBox}>
  							<Text style={styles.sizesHeader}>Select a Size</Text>

  							<View style={styles.sizes}>
  								{sizes.map((size, index) => (
  									<View key={size.key} style={styles.size}>
  										<TouchableOpacity style={size.selected ? styles.sizeTouchDisabled : styles.sizeTouch} onPress={() => selectOption(index, "size")}>
  											<Text style={size.selected ? styles.sizeTouchHeaderDisabled : styles.sizeTouchHeader}>{size.name}</Text>
  										</TouchableOpacity>
  										<Text style={styles.sizePrice}>$ {size.price}</Text>
  									</View>
  								))}
  							</View>
  						</View>
  					)}

            {quantities.length > 0 && (
              <View style={styles.sizesBox}>
                <Text style={styles.sizesHeader}>Select a quantity</Text>

                <View style={styles.sizes}>
                  {quantities.map((quantity, index) => (
                    <View key={quantity.key} style={styles.size}>
                      <TouchableOpacity style={quantity.selected ? styles.sizeTouchDisabled : styles.sizeTouch} onPress={() => selectOption(index, "quantity")}>
                        <Text style={quantity.selected ? styles.sizeTouchHeaderDisabled : styles.sizeTouchHeader}>{quantity.input}</Text>
                      </TouchableOpacity>
                      <Text style={styles.sizePrice}>$ {quantity.price}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {percents.length > 0 && (
              <View style={styles.sizesBox}>
                <Text style={styles.sizesHeader}>Select a percentage (Optional)</Text>

                <View style={styles.sizes}>
                  {percents.map((percent, index) => (
                    <View key={percent.key} style={styles.size}>
                      <TouchableOpacity style={percent.selected ? styles.sizeTouchDisabled : styles.sizeTouch} onPress={() => selectOption(index, "percent")}>
                        <Text style={quantity.selected ? styles.sizeTouchHeaderDisabled : styles.sizeTouchHeader}>{percent.input}</Text>
                      </TouchableOpacity>
                      <Text style={styles.sizePrice}>$ {percent.price}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

  					{!productinfo ? 
  						<View style={styles.note}>
  							<TextInput 
  								style={styles.noteInput} multiline textAlignVertical="top" 
  								placeholderTextColor="rgba(127, 127, 127, 0.8)" placeholder="Leave a note if you want" 
  								maxLength={100} onChangeText={(note) => setItemnote(note)} 
  								autoCorrect={false} autoCapitalize="none"
  							/>
  						</View>
  						:
  						<View style={styles.note}>
  							<Text style={styles.noteHeader}>Add some instruction if you want ?</Text>
  							<TextInput 
  								style={styles.noteInput} multiline textAlignVertical="top" 
  								placeholderTextColor="rgba(127, 127, 127, 0.8)" placeholder={"example: " + (type == "store" ? "make it medium size" : "add 2 cream and 1 sugar")}
  								maxLength={100} onChangeText={(note) => setItemnote(note)} 
  								autoCorrect={false} autoCapitalize="none"
  							/>
  						</View>
  					}

  					<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
  						<View style={styles.quantity}>
                <View style={styles.column}>
                  <Text style={styles.quantityHeader}>Quantity:</Text>
                </View>
                <View style={styles.column}>
                  <TouchableOpacity style={styles.quantityAction} onPress={() => changeQuantity("-")}>
                    <Text style={styles.quantityActionHeader}>-</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.column}>
                  <Text style={styles.quantityHeader}>{quantity}</Text>
                </View>
                <View style={styles.column}>
                  <TouchableOpacity style={styles.quantityAction} onPress={() => changeQuantity("+")}>
                    <Text style={styles.quantityActionHeader}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
  					</View>

  					{!productinfo ? <Text style={styles.price}>Cost: $ {cost.toFixed(2)}</Text> : null}

  					{errorMsg ? <Text style={styles.errorMsg}>{errorMsg}</Text> : null}

  					<View style={styles.itemActions}>
  						<View style={{ flexDirection: 'row' }}>
  							<TouchableOpacity style={styles.itemAction} onPress={() => addCart()}>
  								<Text style={styles.itemActionHeader}>Order <Text style={{ fontWeight: 'bold' }}>{quantity}</Text> item</Text>
  							</TouchableOpacity>
  						</View>
  					</View>
  				</ScrollView>

  				<View style={styles.bottomNavs}>
  					<View style={styles.bottomNavsRow}>
  						{userId && (
  							<TouchableOpacity style={styles.bottomNav} onPress={() => props.navigation.navigate("account")}>
  								<FontAwesome5 name="user-circle" size={30}/>
  							</TouchableOpacity>
  						)}

  						{userId && (
  							<TouchableOpacity style={styles.bottomNav} onPress={() => setOpenorders(true)}>
  								<Entypo name="shopping-cart" size={30}/>
  								{numCartItems > 0 && <Text style={styles.numCartItemsHeader}>{numCartItems}</Text>}
  							</TouchableOpacity>
  						)}

  						<TouchableOpacity style={styles.bottomNav} onPress={() => props.navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "main" }]}))}>
  							<Entypo name="home" size={30}/>
  						</TouchableOpacity>

  						<TouchableOpacity style={styles.bottomNav} onPress={() => {
  							if (userId) {
  								socket.emit("socket/user/logout", userId, () => {
                    AsyncStorage.clear()
                    setUserid(null)
                  })
  							} else {
  								setShowauth({ ...showAuth, show: true, action: false })
  							}
  						}}>
  							<Text style={styles.bottomNavHeader}>{userId ? 'Log-Out' : 'Log-In'}</Text>
  						</TouchableOpacity>
  					</View>
  				</View>

  				{openOrders && <Modal><Orders navigate={() => {
            setOpenorders(false)
            props.navigation.navigate("account")
          }} showNotif={() => {
  					setOpenorders(false)
  					setTimeout(function () {
              props.navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "main", params: { showNotif: true }}]}))
  					}, 1000)
  				}} close={() => {
  					getTheNumCartItems()
  					setOpenorders(false)
  				}}/></Modal>}
  				{showAuth.show && (
  					<Modal transparent={true}>
  						<Userauth close={() => setShowauth({ ...showAuth, show: false })} done={id => {
  							socket.emit("socket/user/login", "user" + id, () => {
                  setUserid(id)

                  if (showAuth.addcart == true) {
                    addCart(id)
                  } else {
                    setShowauth({ ...showAuth, show: false })
                  }
                })
  						}} navigate={props.navigation.navigate}/>
  					</Modal>
  				)}
  			</View>
        :
        <Loadingprogress/>
      }
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	itemprofile: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },

	imageHolder: { borderRadius: wsize(40) / 2, overflow: 'hidden', width: wsize(40) },
	boxHeader: { fontSize: wsize(7), fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },

	info: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 30, paddingHorizontal: 5 },
	infoHeader: { fontWeight: 'bold', marginVertical: 7, marginRight: 20 },

	// amount
	amount: { flexDirection: 'row', justifyContent: 'space-between', width: 100 },
	amountAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, height: 35, paddingTop: 8, width: 35 },
	amountHeader: { fontSize: wsize(4), fontWeight: 'bold', padding: 10 },

	// percentage
	percentage: { flexDirection: 'row', justifyContent: 'space-between', width: 100 },
	percentageAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, height: 35, paddingTop: 8, width: 35 },
	percentageHeader: { fontSize: wsize(4), fontWeight: 'bold', padding: 10 },

	// sizes
	sizesBox: { alignItems: 'center', marginVertical: 20 },
	sizesHeader: { fontWeight: 'bold' },
	sizes: { marginVertical: 20 },
	size: { flexDirection: 'row', marginVertical: 5 },
	sizeTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, padding: 10 },
	sizeTouchDisabled: { backgroundColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, padding: 10 },
	sizeTouchHeader: { textAlign: 'center' },
	sizeTouchHeaderDisabled: { color: 'white', textAlign: 'center' },
	sizePrice: { fontWeight: 'bold', margin: 10 },

	// note
	noteHeader: { fontSize: wsize(5), fontWeight: 'bold' },
	note: { alignItems: 'center', marginBottom: 20 },
	noteInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), height: 100, padding: 5, width: '80%' },

	// quantity
	quantity: { flexDirection: 'row', justifyContent: 'space-around' },
	quantityAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, marginHorizontal: 10, padding: 10 },
  quantityActionHeader: { fontSize: wsize(5) },
	quantityHeader: { fontSize: wsize(5), fontWeight: 'bold', padding: 5 },

	price: { fontSize: wsize(5), fontWeight: 'bold', marginTop: 20, textAlign: 'center' },

	itemActions: { flexDirection: 'row', justifyContent: 'space-around' },
	itemAction: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, marginHorizontal: 10, marginVertical: 30, padding: 10, width: wsize(30) },
	itemActionHeader: { fontSize: wsize(4), textAlign: 'center' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
	bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', justifyContent: 'space-around', margin: 5 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },
	numCartItemsHeader: { fontWeight: 'bold' },

  column: { flexDirection: 'column', justifyContent: 'space-around' },
	errorMsg: { color: 'darkred', fontSize: wsize(4), textAlign: 'center' },
})
