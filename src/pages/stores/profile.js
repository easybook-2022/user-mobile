import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, Platform, ActivityIndicator, Dimensions, ScrollView, View, FlatList, Image, Text, 
  TextInput, TouchableOpacity, Linking, StyleSheet, Modal 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { socket, logo_url } from '../../../assets/info'
import { resizePhoto } from 'geottuse-tools'
import { getLocationProfile } from '../../apis/locations'
import { getMenus } from '../../apis/menus'
import { getNumCartItems } from '../../apis/carts'

import Orders from '../../components/orders'
import Userauth from '../../components/userauth'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}

export default function Profile(props) {
  const { locationid, refetch } = props.route.params
  const func = props.route.params

  const [logo, setLogo] = useState('')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phonenumber, setPhonenumber] = useState('')
  const [distance, setDistance] = useState(0)
  const [showAuth, setShowauth] = useState(false)
  const [userId, setUserid] = useState(null)
  const [showInfo, setShowinfo] = useState(false)
  
  const [productInfo, setProductinfo] = useState('')
  const [menuInfo, setMenuinfo] = useState({ list: [], photos: [], error: false })

  const [loaded, setLoaded] = useState(false)
  
  const [openOrders, setOpenorders] = useState(false)
  const [numCartItems, setNumcartitems] = useState(0)

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
            
          }
        })
    }
  }
  const getTheLocationProfile = async() => {
    const longitude = await AsyncStorage.getItem("longitude")
    const latitude = await AsyncStorage.getItem("latitude")
    const data = { locationid, longitude, latitude }

    getLocationProfile(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { name, logo, fullAddress, city, province, postalcode, phonenumber, distance } = res.info

          setLogo(logo)
          setName(name)
          setAddress(fullAddress)
          setPhonenumber(phonenumber)
          setDistance(distance)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          
        }
      })
  }
  const getAllMenus = async() => {
    setLoaded(false)

    getMenus(locationid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setMenuinfo({ ...menuInfo, list: res.list, photos: res.photos })
          setLoaded(true)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          
        }
      })
  }
  const initialize = () => {
    getTheNumCartItems()
    getTheLocationProfile()
    getAllMenus()
  }
  const displayList = info => {
    let { id, image, name, list, listType, left } = info
    let add = name ? true : false

    return (
      <View style={{ marginLeft: left }}>
        {name ?
          <View style={styles.menu}>
            <View style={{ flexDirection: 'row' }}>
              {image.name ? 
                <View style={styles.menuImageHolder}>
                  <Image style={resizePhoto(image, wsize(10))} source={{ uri: logo_url + image.name }}/>
                </View>
              : null }
              <View style={styles.column}>
                <Text style={styles.menuName}>{name} (Menu)</Text>
              </View>
            </View>
            {list.length > 0 && list.map((info, index) => (
              <View key={"list-" + index}>
                {info.listType == "list" ? 
                  displayList({ id: info.id, name: info.name, image: info.image, list: info.list, listType: info.listType, left: left + 10 })
                  :
                  <View style={styles.item}>
                    {info.image.name ? 
                      <View style={styles.itemImageHolder}>
                        <Image style={resizePhoto(info.image, wsize(10))} source={{ uri: logo_url + info.image.name }}/>
                      </View>
                    : null }
                    <View style={styles.column}>
                      <Text style={styles.itemHeader}>{info.name}</Text>
                    </View>
                    <View style={styles.column}>
                      <Text style={styles.itemHeader}>{info.price ? '$' + info.price : info.sizes.length + ' size(s)'}</Text>
                    </View>
                    <View style={styles.column}>
                      <TouchableOpacity style={styles.itemAction} onPress={() => props.navigation.navigate("itemprofile", { locationid, menuid: "", productid: info.id, productinfo: "", initialize: () => getAllMenus(), type: "store" })}>
                        <Text style={styles.itemActionHeader}>See / Buy</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                }
              </View>
            ))}
          </View>
          :
          list.map((info, index) => (
            <View key={"list-" + index}>
              {info.listType == "list" ? 
                displayList({ id: info.id, name: info.name, image: info.image, list: info.list, listType: info.listType, left: left + 10 })
                :
                <View style={styles.item}>
                  {info.image.name ? 
                    <View style={styles.itemImageHolder}>
                      <Image style={resizePhoto(info.image, wsize(10))} source={{ uri: logo_url + info.image.name }}/>
                    </View>
                  : null }
                  <View style={styles.column}>
                    <Text style={styles.itemHeader}>{info.name}</Text>
                  </View>
                  <View style={styles.column}>
                    <Text style={styles.itemHeader}>{info.price ? '$' + info.price : info.sizes.length + ' size(s)'}</Text>
                  </View>
                  <View style={styles.column}>
                    <TouchableOpacity style={styles.itemAction} onPress={() => props.navigation.navigate("itemprofile", { locationid, menuid: "", productid: info.id, productinfo: "", initialize: () => getAllMenus(), type: "store" })}>
                      <Text style={styles.itemActionHeader}>See / Buy</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              }
            </View>
          ))
        }
      </View>
    )
  }

  useEffect(() => {
    initialize()
  }, [])

  return (
    <SafeAreaView style={styles.profile}>
      {loaded ? 
        <View style={styles.box}>
          <View style={styles.profileInfo}>
            <View style={styles.column}>
              <TouchableOpacity style={styles.headerAction} onPress={() => setShowinfo(true)}>
                <Text style={styles.headerActionHeader}>View Info</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.column}>
              <TouchableOpacity style={styles.headerAction} onPress={() => getAllMenus()}>
                <Text style={styles.headerActionHeader}>Refresh menu</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.column}>
              <TouchableOpacity style={styles.headerAction} onPress={() => Linking.openURL('tel://' + phonenumber)}>
                <Text style={styles.headerActionHeader}>Call</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.body}>
            {(menuInfo.photos.length > 0 || menuInfo.list.length > 0) && (
              <>
                <View style={styles.menuInputBox}>
                  <TextInput style={styles.menuInput} type="text" placeholder="Enter product # or name" onChangeText={(info) => setProductinfo(info)} autoCorrect={false} autoCapitalize="none"/>
                  <View style={styles.menuInputActions}>
                    <TouchableOpacity style={styles.menuInputTouch} onPress={() => {
                      if (productInfo) {
                        props.navigation.navigate(
                          "itemprofile", 
                          { 
                            locationid, menuid: "", productid: "", 
                            productinfo: productInfo, initialize: () => getAllMenus(), 
                            type: "store"
                          }
                        )
                      } else {
                        setMenuinfo({ ...menuInfo, error: true })
                      }
                    }}>
                      <Text style={styles.menuInputTouchHeader}>Order item</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {menuInfo.error && <Text style={styles.menuInputError}>Your request is empty</Text>}
              </>
            )}

            <ScrollView style={{ height: '90%', width: '100%' }}>
              {menuInfo.photos.length > 0 && ( 
                menuInfo.photos[0].row && (
                  menuInfo.photos.map(info => (
                    info.row.map(item => (
                      (item.photo && item.photo.name) && (
                        <View key={item.key} style={[styles.menuPhoto, resizePhoto(item.photo, wsize(95))]}>
                          <Image style={{ height: '100%', width: '100%' }} source={{ uri: logo_url + item.photo.name }}/>
                        </View>
                      )
                    ))
                  ))
                )
              )}

              <View style={{ marginTop: 20 }}>
                {displayList({ id: "", name: "", image: "", list: menuInfo.list, left: 0 })}
              </View>
            </ScrollView>
          </View>

          <View style={styles.bottomNavs}>
            <View style={styles.bottomNavsRow}>
              {userId && (
                <TouchableOpacity style={styles.bottomNav} onPress={() => props.navigation.navigate("account")}>
                  <FontAwesome5 name="user-circle" size={wsize(7)}/>
                </TouchableOpacity>
              )}

              {userId && (
                <TouchableOpacity style={styles.bottomNav} onPress={() => setOpenorders(true)}>
                  <Entypo name="shopping-cart" size={wsize(7)}/>
                  {numCartItems > 0 && <Text style={styles.numCartItemsHeader}>{numCartItems}</Text>}
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.bottomNav} onPress={() => {
                props.navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: "main" }]
                  })
                )
              }}>
                <Entypo name="home" size={wsize(7)}/>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bottomNav} onPress={() => {
                if (userId) {
                  socket.emit("socket/user/logout", userId, () => {
                    AsyncStorage.clear()
                    setUserid(null)
                  })
                } else {
                  setShowauth(true)
                }
              }}>
                <Text style={styles.bottomNavHeader}>{userId ? 'Log-Out' : 'Log-In'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        :
        <View style={{ alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' }}>
          <ActivityIndicator color="black" size="large"/>
        </View>
      }

      {openOrders && <Modal><Orders showNotif={() => {
        setOpenorders(false)
        setTimeout(function () {
          props.navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "main", params: { showNotif: true } }]
            })
          )
        }, 1000)
      }} navigate={() => {
        setOpenorders(false)
        props.navigation.navigate("account", { required: "card" })
      }} close={() => {
        getTheNumCartItems()
        setOpenorders(false)
      }}/></Modal>}
      {showAuth && (
        <Modal transparent={true}>
          <Userauth close={() => setShowauth(false)} done={id => {
            setUserid(id)
            setShowauth(false)
          }} navigate={props.navigation.navigate}/>
        </Modal>
      )}
      {showInfo && (
        <Modal transparent={true}>
          <SafeAreaView style={styles.showInfoContainer}>
            <View style={styles.showInfoBox}>
              <TouchableOpacity style={styles.showInfoClose} onPress={() => setShowinfo(false)}>
                <AntDesign name="close" size={wsize(7)}/>
              </TouchableOpacity>

              <Text style={styles.showInfoHeader}>{name}</Text>
              <Text style={styles.showInfoHeader}>{address}</Text>
              <View style={{ alignItems: 'center' }}>
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity onPress={() => Linking.openURL('tel://' + phonenumber)}>
                    <AntDesign name="phone" size={wsize(7)}/>
                  </TouchableOpacity>
                  <Text style={styles.showInfoPhonenumber}>{phonenumber}</Text>
                </View>
              </View>
              <Text style={styles.showInfoHeader}>{distance}</Text>
            </View>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  profile: { backgroundColor: 'white', height: '100%', width: '100%' },
  box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },

  profileInfo: { flexDirection: 'row', height: '7%', justifyContent: 'space-around', width: '100%' },
  headerAction: { alignItems: 'center', borderRadius: 10, borderStyle: 'solid', borderWidth: 2, flexDirection: 'column', height: '90%', justifyContent: 'space-around', width: wsize(20) },
  headerActionHeader: { color: 'black', fontSize: wsize(3), textAlign: 'center' },

  body: { height: '83%' },

  menuInputBox: { alignItems: 'center', marginBottom: 5, width: '100%' },
  menuInput: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), padding: 10, width: '95%' },
  menuInputActions: { flexDirection: 'row', justifyContent: 'space-around' },
  menuInputTouch: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), margin: 5, padding: 10, width: '40%' },
  menuInputTouchHeader: { fontSize: wsize(4), textAlign: 'center' },
  menuInputError: { color: 'darkred', marginLeft: 10 },
  menuPhoto: { marginBottom: 10, marginHorizontal: width * 0.025, width: wsize(95) },

  menu: { backgroundColor: 'white', borderTopLeftRadius: 3, borderTopRightRadius: 3, padding: 3 },
  menuImageHolder: { borderRadius: wsize(10) / 2, flexDirection: 'column', height: wsize(10), justifyContent: 'space-around', overflow: 'hidden', width: wsize(10) },
  menuImage: { height: wsize(10), width: wsize(10) },
  menuName: { fontSize: wsize(6), fontWeight: 'bold', marginLeft: 5, marginTop: wsize(4) / 2, textDecorationLine: 'underline' },
  itemInfo: { fontSize: wsize(5), marginLeft: 10, marginVertical: 10 },
  item: { backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10, width: '100%' },
  itemImageHolder: { borderRadius: wsize(10) / 2, flexDirection: 'column', height: wsize(10), justifyContent: 'space-around', margin: 5, overflow: 'hidden', width: wsize(10) },
  itemImage: { height: wsize(10), width: wsize(10) },
  itemHeader: { fontSize: wsize(6) },
  itemActions: { flexDirection: 'row', marginTop: 0 },
  itemAction: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, marginLeft: 10, padding: 5 },
  itemActionHeader: { fontSize: wsize(4), textAlign: 'center' },

  bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
  bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', margin: 5 },
  bottomNavHeader: { fontSize: wsize(5), fontWeight: 'bold' },
  numCartItemsHeader: { fontSize: wsize(4), fontWeight: 'bold' },

  showInfoContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  showInfoBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-around', width: '80%' },
  showInfoClose: { alignItems: 'center', borderRadius: 20, borderStyle: 'solid', borderWidth: 2, width: 44 },
  showInfoHeader: { fontSize: wsize(5), fontWeight: 'bold', margin: 10, textAlign: 'center' },
  showInfoPhonenumber: { fontSize: wsize(5), fontWeight: 'bold', marginHorizontal: 10, marginVertical: 8, textAlign: 'center' },

  column: { flexDirection: 'column', justifyContent: 'space-around' },
})
