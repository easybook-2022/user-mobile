import React, { useState, useEffect } from 'react'
import { SafeAreaView, ActivityIndicator, Platform, Dimensions, ScrollView, View, FlatList, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { resizePhoto } from 'geottuse-tools';
import * as Speech from 'expo-speech';
import { socket, logo_url, useSpeech } from '../../assets/info'
import { seeOrders } from '../apis/carts'

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}

export default function Seeorders(props) {
  const { ordernumber } = props.route.params

  const [userId, setUserid] = useState(null)
  const [orders, setOrders] = useState([])
  const [loaded, setLoaded] = useState(true)
  const [showDisabledScreen, setShowdisabledscreen] = useState(false)
  
  const seeTheOrders = async() => {
    const userid = await AsyncStorage.getItem("userid")

    seeOrders(ordernumber)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          socket.emit("socket/user/login", userid, () => {
            setUserid(userid)
            setOrders(res.orders)
            setLoaded(true)
          })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const startWebsocket = () => {
    socket.on("updateSeeorders", data => {
      if (data.type == "orderDone") {
        if (Constants.isDevice && useSpeech == true) Speech.speak("Order #: " + data.ordernumber + " is done. You can pick it up now")

        props.navigation.goBack()
      } else if (data.type == "setWaitTime") {
        if (Constants.isDevice && useSpeech == true) Speech.speak("Order #: " + data.ordernumber + " will be ready in " + data.waitTime + (data.waitTime.includes("minute") ? "" : " minute"), { rate: 0.7 })
      }
    })
    socket.io.on("open", () => {
      if (userId !== null) {
        socket.emit("socket/user/login", userId, () => setShowdisabledscreen(false))
      }
    })
    socket.io.on("close", () => userId != null ? setShowdisabledscreen(true) : {})
  }

  useEffect(() => {
    startWebsocket()
    seeTheOrders()

    return () => {
      socket.off("updateSeeorders")
    }
  }, [orders.length])
  
  return (
    <SafeAreaView style={[styles.seeorders, { opacity: !loaded ? 0.5 : 1 }]}>
      {loaded ? 
        <View style={styles.box}>
          <FlatList
            data={orders}
            renderItem={({ item, index }) => 
              <View style={styles.item} key={item.key}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={styles.itemImageHolder}>
                    <Image 
                      source={item.image.name ? { uri: logo_url + item.image.name } : require("../../assets/noimage.jpeg")} 
                      style={resizePhoto(item.image, wsize(30))}
                    />
                  </View>

                  <View style={styles.itemInfos}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.header}><Text style={{ fontWeight: 'bold' }}>Quantity:</Text> {item.quantity}</Text>

                    {item.sizes.map((size) => (
                      size.selected && ( 
                        <Text key={size.key} style={styles.itemInfo}>
                          <Text style={{ fontWeight: 'bold' }}>Size: </Text>
                          <Text>{size.name}</Text>
                        </Text>
                      )
                    ))}

                    {item.quantities.map((quantity) => (
                      quantity.selected && (
                        <Text key={quantity.key} style={styles.itemInfo}>
                          <Text style={{ fontWeight: 'bold' }}>Quantity: </Text>
                          <Text>{quantity.input}</Text>
                        </Text>
                      )
                    ))}

                    {item.percents.map((percent) => (
                      percent.selected && (
                        <Text key={percent.key} style={styles.itemInfo}>
                          <Text style={{ fontWeight: 'bold' }}>Percentage: </Text>
                          <Text>{percent.input}</Text>
                        </Text>
                      )
                    ))}

                    <Text style={styles.header}><Text style={{ fontWeight: 'bold' }}>Cost:</Text>$ {item.cost}</Text>
                  </View>
                </View>

                {item.note ? 
                  <View style={{ alignItems: 'center' }}>
                    <View style={styles.note}>
                      <Text style={styles.noteHeader}><Text style={{ fontWeight: 'bold' }}>Customer's note:</Text> {'\n' + item.note}</Text>
                    </View>
                  </View>
                : null }
              </View>
            }
          />
        </View>
        :
        <View style={styles.loading}>
          <ActivityIndicator color="black" size="large"/>
        </View>
      }

      {showDisabledScreen && (
        <Modal transparent={true}>
          <Disable 
            close={() => socket.emit("socket/user/login", userId, () => setShowdisabledscreen(false))}
          />
        </Modal>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  seeorders: { backgroundColor: 'white', height: '100%', width: '100%' },
  box: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },

  item: { borderStyle: 'solid', borderBottomWidth: 0.5, borderTopWidth: 0.5, padding: 10 },
  itemImageHolder: { backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: wsize(30) / 2, height: wsize(30), overflow: 'hidden' },
  itemInfos: {  },
  itemName: { fontSize: wsize(5), marginBottom: 10 },
  itemInfo: { fontSize: wsize(4) },
  header: { fontSize: wsize(4) },
  note: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 5, marginVertical: 10, padding: 5, width: wsize(50) },
  noteHeader: { fontSize: wsize(4), textAlign: 'center' },
  orderersEdit: { flexDirection: 'row' },
  orderersEditHeader: { fontWeight: 'bold', marginRight: 10, marginTop: 7, textAlign: 'center' },
  orderersNumHolder: { backgroundColor: 'black', padding: 5 },
  orderersNumHeader: { color: 'white', fontWeight: 'bold' },

  disabled: { backgroundColor: 'black', flexDirection: 'column', justifyContent: 'space-around', height: '100%', opacity: 0.8, width: '100%' },
  disabledContainer: { alignItems: 'center', width: '100%' },
  disabledHeader: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  disabledClose: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 50, padding: 10 },

  loading: { flexDirection: 'column', height: '100%', justifyContent: 'space-around' },
})
