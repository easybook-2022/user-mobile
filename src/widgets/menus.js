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
  const displayListItem = info => {
    return (
      <View style={styles.item}>
        {type == "restaurant" ? 
          <>
            <View style={[styles.column, { width: '40%' }]}>
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
                <View style={styles.column}><Text style={styles.itemMiniHeader}>{info.description}</Text></View>
              </View>
            </View>
            <View style={{ width: '40%' }}>
              {info.price ? 
                <Text style={styles.itemHeader}>$ {info.price} (1 size)</Text>
                :
                <>
                  {info.sizes.length > 0 && (
                    <>
                      {info.sizes.map(size => <Text key={size.key} style={styles.itemHeader}>{size.name}: ${size.price}</Text>)}
                      <Text style={[styles.itemHeader]}>({info.sizes.length}) sizes</Text> 
                    </>
                  )}

                  {info.quantities.length > 0 && info.quantities.map(quantity => 
                    <Text 
                      key={quantity.key} 
                      style={styles.itemHeader}
                    >
                      {quantity.input}: ${quantity.price}
                    </Text>
                  )}
                </>
              }

              {info.percents.map(percent => <Text key={percent.key} style={styles.itemHeader}>{percent.input}: ${percent.price}</Text>)}
            </View>
            <View style={[styles.column, { width: '20%' }]}>
              <TouchableOpacity style={[styles.itemAction, { width: '100%' }]} onPress={() => {
                props.navigation.setParams({ initialize: true })

                props.navigation.navigate(
                  "itemprofile", 
                  { locationid, menuid: "", productid: info.id, productinfo: "", type }
                )
              }}>
                <Text style={styles.itemActionHeader}>Order now</Text>
              </TouchableOpacity>
            </View>
          </>
          :
          <>
            <View style={{ flexDirection: 'row', width: '100%' }}>
              {info.image.name && (
                <View style={{ width: '25%' }}>
                  <View style={styles.itemImageHolder}>
                    <Image 
                      style={resizePhoto(info.image, wsize(20))} 
                      source={{ uri: logo_url + info.image.name }}
                    />
                  </View>
                </View>
              )}
              
              <View style={{ width: '80%' }}>
                <Text style={styles.itemHeader}>{info.name}</Text>
                <Text style={styles.itemMiniHeader}>{info.description}</Text>
                <Text style={styles.itemHeader}>$ {info.price}</Text>
                <TouchableOpacity style={styles.itemAction} onPress={() => {
                  props.navigation.setParams({ initialize: true })

                  props.navigation.navigate(
                    "booktime", 
                    { locationid, menuid: "", serviceid: info.id, serviceInfo: "" }
                  )
                }}>
                  <Text style={styles.itemActionHeader}>Book</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        }
      </View>
    )
  }
  const displayList = info => {
    let { id, image, name, list, show = true, parentId = "" } = info

    return (
      <View>
        {name ?
          <View style={styles.menu} >
            <TouchableOpacity style={styles.menuRow} onPress={() => {
              const newList = [...menuInfo.list]

              const toggleMenu = list => {
                list.forEach(function (item) {
                  if (item.parentId == parentId) {
                    item.show = false
                  }

                  if (item.id == id) {
                    item.show = show ? false : true
                  } else if (item.list) {
                    toggleMenu(item.list)
                  }
                })
              }

              toggleMenu(newList)

              setMenuinfo({ ...menuInfo, list: newList })
            }}>
              {image.name && (
                <View style={styles.menuImageHolder}>
                  <Image 
                    style={resizePhoto(image, wsize(10))} 
                    source={{ uri: logo_url + image.name }}
                  />
                </View>
              )}
              <View style={styles.column}><Text style={styles.menuName}>{name} (Menu)</Text></View>
            </TouchableOpacity>
            {list.length > 0 && list.map((info, index) => (
              <View key={"list-" + index}>
                {show && (
                  info.listType == "list" ? 
                    displayList({ id: info.id, name: info.name, image: info.image, list: info.list, listType: info.listType, show: info.show, parentId: info.parentId })
                    :
                    <View>{displayListItem(info)}</View>
                )}
              </View>
            ))}
          </View>
          :
          list.map((info, index) => (
            <View key={"list-" + index}>
              {show && (
                info.listType == "list" ? 
                  displayList({ id: info.id, name: info.name, image: info.image, list: info.list, listType: info.listType, show: info.show, parentId: info.parentId })
                  :
                  <View>{displayListItem(info)}</View>
              )}
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
  menuRow: { flexDirection: 'row' },
  menuImageHolder: { borderRadius: wsize(10) / 2, flexDirection: 'column', height: wsize(10), justifyContent: 'space-around', overflow: 'hidden' },
  menuName: { fontSize: wsize(5), fontWeight: 'bold', marginLeft: 5, marginTop: wsize(4) / 2 },
  itemInfo: { fontSize: wsize(5), marginLeft: 10, marginVertical: 10 },
  item: { backgroundColor: 'white', borderRadius: 3, flexDirection: 'row', justifyContent: 'space-between', marginVertical: 3, padding: 5, width: '100%' },
  itemImageHolder: { borderRadius: wsize(20) / 2, flexDirection: 'column', height: wsize(20), justifyContent: 'space-around', margin: 5, overflow: 'hidden', width: wsize(20) },
  itemHeader: { fontSize: wsize(5), fontWeight: 'bold' },
  itemMiniHeader: { fontSize: wsize(4) },
  itemActions: { flexDirection: 'row' },
  itemAction: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, padding: 5, width: '50%' },
  itemActionHeader: { fontSize: wsize(4), textAlign: 'center' },

  column: { flexDirection: 'column', justifyContent: 'space-around' },
})
