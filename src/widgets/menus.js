import { useEffect, useState, useCallback } from 'react'
import { SafeAreaView, Dimensions, View, ScrollView, Text, Image, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native'
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { resizePhoto } from 'geottuse-tools';
import { logo_url } from '../../assets/info'
import { getMenus } from '../apis/menus'

// widgets
import Loadingprogress from '../widgets/loadingprogress';

import AntDesign from 'react-native-vector-icons/AntDesign'

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}

export default function Menus(props) {
  const { locationid, refetchMenu, type } = props
  const [requestInfo, setRequestinfo] = useState({ show: false, search: '', error: false })
  const [menuInfo, setMenuinfo] = useState({ list: [], photos: [] })
  const [loaded, setLoaded] = useState(false)

  const getAllMenus = () => {
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
          const { errormsg, status } = err.response.data
        }
      })
  }
  const displayListItem = (id, info) => {
    return (
      <View style={styles.item}>
        <View style={styles.column}>
          <View style={{ alignItems: 'center' }}>
            {info.image.name && (
              <View style={styles.itemImageHolder}>
                <Image 
                  style={resizePhoto(info.image, wsize(20))} 
                  source={{ uri: logo_url + info.image.name }}
                />
              </View>
            )}
            <View style={styles.column}><Text style={styles.itemHeader}>{info.name}</Text></View>
          </View>
        </View>
        <View style={styles.column}>
          {info.sizes.length > 0 ? 
            info.sizes.length > 2 ? 
              <View>
                <Text style={{ fontSize: wsize(4.5) }}><Text style={{ fontWeight: 'bold' }}>{info.sizes[0].name}</Text>: $ {info.sizes[0].price}</Text>
                <Text style={{ fontSize: wsize(4.5) }}><Text style={{ fontWeight: 'bold' }}>{info.sizes[1].name}</Text>: $ {info.sizes[1].price}</Text>
                <Text style={{ fontSize: wsize(4.5) }}><Text style={{ fontWeight: 'bold' }}>{info.sizes[2].name}</Text>: $ {info.sizes[2].price}</Text>
                
                {info.sizes.length == 4 && <Text style={{ fontSize: wsize(4.5) }}><Text style={{ fontWeight: 'bold' }}>{info.sizes[3].name}</Text>: $ {info.sizes[3].price}</Text>}

                <Text style={{ fontWeight: 'bold' }}>({info.sizes.length}) sizes</Text>
              </View>
              :
              info.sizes.map((size, index) => <Text key={index} style={{ fontSize: wsize(4.5) }}><Text style={{ fontWeight: 'bold' }}>{size.name}</Text>$ {size.price}</Text>)
            :
            <View style={styles.column}><Text style={styles.itemHeader}>$ {info.price} (1 size)</Text></View>
          }
        </View>
        <View style={styles.column}>
          <TouchableOpacity style={styles.itemAction} onPress={() => {
            props.navigation.setParams({ initialize: true })

            if (type == "salon") {
              props.navigation.navigate(
                "booktime", 
                { locationid, menuid: "", serviceid: info.id, serviceInfo: "" }
              )
            } else if (type == "restaurant" || type == "store") {
              props.navigation.navigate(
                "itemprofile", 
                { locationid, menuid: "", productid: info.id, productinfo: "", type }
              )
            }
          }}>
            <Text style={styles.itemActionHeader}>
              {type == "store" || type == "restaurant" ? 
                "Order now" 
                : 
                <Text><Text style={{ fontWeight: 'bold' }}>Book</Text> {info.name}</Text>
              }
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
  const displayList = info => {
    let { id, image, name, list, show = true } = info

    return (
      <View>
        {name ?
          <View style={styles.menu}>
            <View style={{ flexDirection: 'row' }}>
              {image.name && (
                <View style={styles.menuImageHolder}>
                  <Image 
                    style={resizePhoto(image, wsize(10))} 
                    source={{ uri: logo_url + image.name }}
                  />
                </View>
              )}
              <View style={styles.column}><Text style={styles.menuName}>({list.length}) {name} (Menu)</Text></View>
              <View style={styles.column}>
                <TouchableOpacity style={styles.menuShow} onPress={() => {
                  const newList = [...menuInfo.list]

                  newList.forEach(function (info) {
                    if (info.id == id) {
                      info.show = !info.show
                    }
                  })

                  setMenuinfo({ ...menuInfo, list: newList })
                }}>
                  <Text style={styles.menuShowHeader}>{show ? "Hide" : "Show"}</Text>
                </TouchableOpacity>
              </View>
            </View>
            {list.length > 0 && list.map((info, index) => (
              <View key={"list-" + index}>
                {info.listType == "list" ? 
                  displayList({ id: info.id, name: info.name, image: info.image, list: info.list, listType: info.listType, show: info.show })
                  :
                  show && <View>{displayListItem(id, info)}</View>
                }
              </View>
            ))}
          </View>
          :
          list.map((info, index) => (
            <View key={"list-" + index}>
              {info.listType == "list" ? 
                displayList({ id: info.id, name: info.name, image: info.image, list: info.list, listType: info.listType, show: info.show })
                :
                show && <View>{displayListItem(id, info)}</View>
              }
            </View>
          ))
        }
      </View>
    )
  }

  useEffect(() => getAllMenus(), [refetchMenu])

  useFocusEffect(
    useCallback(() => {
      if (props.route.params) {
        const params = props.route.params

        if (params.initialize) getAllMenus()
      }

      props.navigation.setParams({ initialize: null })
    }, [useIsFocused()])
  )

  const header = type == "restaurant" && "meal" || 
                type == "store" && "product" || 
                type == "salon" && "service"

  return (
    <View style={styles.box}>
      {loaded ? 
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity style={styles.openInput} onPress={() => setRequestinfo({ ...requestInfo, show: true })}>
            <Text style={styles.openInputHeader}>Type in {header}</Text>
          </TouchableOpacity>
          <ScrollView style={{ height: '90%', width: '100%' }}>
            <View style={{ marginHorizontal: width * 0.025 }}>{displayList({ id: "", name: "", image: "", list: menuInfo.list })}</View>
          </ScrollView>
        </View>
        :
        <Loadingprogress/>
      }

      {loaded && requestInfo.show && (
        <Modal transparent={true}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.serviceInputBox}>
              <TouchableOpacity onPress={() => setRequestinfo({ ...requestInfo, show: false })}>
                <AntDesign color="white" name="closecircleo" size={30}/>
              </TouchableOpacity>

              {(menuInfo.photos.length > 0 || menuInfo.list.length > 0) && (
                <>
                  <View style={styles.menuInputBox}>
                    <TextInput 
                      style={styles.menuInput} type="text" 
                      placeholder={"Enter " + header + " # or name"} 
                      placeholderTextColor="rgba(0, 0, 0, 0.5)"
                      onChangeText={(info) => setRequestinfo({ ...requestInfo, search: info, error: false })} maxLength={37} autoCorrect={false} autoCapitalize="none"
                    />
                    <View style={styles.menuInputActions}>
                      <TouchableOpacity style={styles.menuInputTouch} onPress={() => {
                        if (requestInfo.search) {
                          setRequestinfo({ ...requestInfo, show: false })
                          props.navigation.setParams({ initialize: true })

                          if (type == "salon") {
                            props.navigation.navigate(
                              "booktime", 
                              { 
                                locationid, menuid: "", serviceid: "", 
                                serviceinfo: requestInfo.search, 
                                type: "salon"
                              }
                            )
                          } else {
                            props.navigation.navigate(
                              "itemprofile", 
                              { 
                                locationid, menuid: "", productid: "", 
                                productinfo: requestInfo.search, 
                                type
                              }
                            )
                          }
                        } else {
                          setRequestinfo({ ...requestInfo, error: true })
                        }
                      }}>
                        <Text style={styles.menuInputTouchHeader}>
                          {type == "salon" ? 
                            <Text>Book <Text style={{ fontWeight: 'bold' }}>{requestInfo.search + ' '}</Text>now</Text>
                            : 
                            "Order item"
                          }
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {requestInfo.error && <Text style={styles.menuInputError}>Your request is empty</Text>}
                </>
              )}

              <ScrollView style={{ height: '90%', width: '100%' }}>
                {menuInfo.photos.length > 0 && ( 
                  menuInfo.photos[0].row && (
                    menuInfo.photos.map(info => (
                      info.row.map(item => (
                        item.photo && item.photo.name && (
                          <View key={item.key} style={[styles.menuPhoto, resizePhoto(item.photo, wsize(95)), { borderRadius: wsize(95) / 2 }]}>
                            <Image 
                              style={{ width: '100%', height: '100%' }}
                              source={{ uri: logo_url + item.photo.name }}
                            />
                          </View>
                        )
                      ))
                    ))
                  )
                )}
              </ScrollView>
            </View>
          </SafeAreaView>
        </Modal>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  box: { height: '100%', width: '100%' },
  openInput: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), margin: 5, padding: 10, width: '40%' },
  openInputHeader: { fontSize: wsize(4), textAlign: 'center' },

  serviceInputBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)', height: '100%', width: '100%' },
  menuInputBox: { alignItems: 'center', marginBottom: 5, width: '100%' },
  menuInput: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), padding: 10, width: '95%' },
  menuInputActions: { flexDirection: 'row', justifyContent: 'space-around' },
  menuInputTouch: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), margin: 5, padding: 10, width: '40%' },
  menuInputTouchHeader: { fontSize: wsize(4), textAlign: 'center' },
  menuInputError: { color: 'darkred', marginLeft: 10 },
  menuPhoto: { marginBottom: 10, marginHorizontal: width * 0.025 },

  menu: { borderTopLeftRadius: 3, borderTopRightRadius: 3, marginBottom: 30, padding: 3 },
  menuImageHolder: { borderRadius: wsize(10) / 2, flexDirection: 'column', height: wsize(10), justifyContent: 'space-around', overflow: 'hidden' },
  menuName: { fontSize: wsize(5), fontWeight: 'bold', marginLeft: 5, marginTop: wsize(4) / 2, textDecorationLine: 'underline' },
  menuShow: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5 },
  menuShowHeader: { fontSize: wsize(4), textAlign: 'center' },
  itemInfo: { fontSize: wsize(5), marginLeft: 10, marginVertical: 10 },
  item: { backgroundColor: 'white', borderRadius: 3, flexDirection: 'row', justifyContent: 'space-between', marginVertical: 3, padding: 5, width: '100%' },
  itemImageHolder: { borderRadius: wsize(20) / 2, flexDirection: 'column', height: wsize(20), justifyContent: 'space-around', margin: 5, overflow: 'hidden', width: wsize(20) },
  itemHeader: { fontSize: wsize(5), fontWeight: 'bold' },
  itemActions: { flexDirection: 'row', marginTop: 0 },
  itemAction: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, padding: 5 },
  itemActionHeader: { fontSize: wsize(4), textAlign: 'center' },

  column: { flexDirection: 'column', justifyContent: 'space-around' },
})
