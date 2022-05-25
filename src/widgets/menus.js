import { useEffect, useState } from 'react'
import { Dimensions, View, ScrollView, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { resizePhoto } from 'geottuse-tools';
import { logo_url } from '../../assets/info'
import { getMenus } from '../apis/menus'

// widgets
import Loadingprogress from '../widgets/loadingprogress';

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}

export default function Menus(props) {
  const { locationid, refetchMenu, type } = props
  const [requestInfo, setRequestinfo] = useState({ search: '', error: false })
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
  const displayList = info => {
    let { id, image, name, list, listType, left } = info

    return (
      <View style={{ marginLeft: left }}>
        {name ?
          <View style={styles.menu}>
            <View style={{ flexDirection: 'row' }}>
              <View style={styles.menuImageHolder}>
                <Image 
                  style={resizePhoto(image, wsize(10))} 
                  source={image.name ? { uri: logo_url + image.name } : require("../../assets/noimage.jpeg")}
                />
              </View>
              <View style={styles.column}><Text style={styles.menuName}>{name} (Menu)</Text></View>
            </View>
            {list.length > 0 && list.map((info, index) => (
              <View key={"list-" + index}>
                {info.listType == "list" ? 
                  displayList({ id: info.id, name: info.name, image: info.image, list: info.list, listType: info.listType, left: left + 10 })
                  :
                  <View style={styles.item}>
                    <View style={styles.itemImageHolder}>
                      <Image 
                        style={resizePhoto(info.image, wsize(10))} 
                        source={info.image.name ? { uri: logo_url + info.image.name } : require("../../assets/noimage.jpeg")}
                      />
                    </View>
                    <View style={styles.column}><Text style={styles.itemHeader}>{info.name}</Text></View>
                    <View style={styles.column}><Text style={styles.itemHeader}>{info.price ? '$' + info.price : info.sizes.length + ' size(s)'}</Text></View>
                    <View style={styles.column}>
                      <TouchableOpacity style={styles.itemAction} onPress={() => {
                        if (type == "salon") {
                          props.navigation.navigate(
                            "booktime", 
                            { locationid, menuid: "", serviceid: info.id, serviceInfo: "", initialize: () => getAllMenus() }
                          )
                        } else if (type == "restaurant" || type == "store") {
                          props.navigation.navigate(
                            "itemprofile", 
                            { locationid, menuid: "", productid: info.id, productinfo: "", initialize: () => getAllMenus(), type }
                          )
                        }
                      }}>
                        <Text style={styles.itemActionHeader}>{type == "store" || type == "restaurant" ? "See/Buy" : "Book a time"}</Text>
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
                displayList({ id: info.id, name: info.name, image: info.image, list: info.list, listType: info.listType, left: left == 0 ? left : left + 10 })
                :
                <View style={styles.item}>
                  <View style={styles.itemImageHolder}>
                    <Image 
                      style={resizePhoto(info.image, wsize(10))} 
                      source={info.image.name ? { uri: logo_url + info.image.name } : require("../../assets/noimage.jpeg")}
                    />
                  </View>
                  <View style={styles.column}><Text style={styles.itemHeader}>{info.name}</Text></View>
                  <View style={styles.column}><Text style={styles.itemHeader}>{info.price ? '$' + info.price : info.sizes.length + ' size(s)'}</Text></View>
                  <View style={styles.column}>
                    <TouchableOpacity style={styles.itemAction} onPress={() => {
                      if (type == "salon") {
                        props.navigation.navigate(
                          "booktime", 
                          { locationid, menuid: "", serviceid: info.id, serviceInfo: "", initialize: () => getAllMenus() }
                        )
                      } else if (type == "restaurant" || type == "store") {
                        props.navigation.navigate(
                          "itemprofile", 
                          { locationid, menuid: "", productid: info.id, productinfo: "", initialize: () => getAllMenus(), type }
                        )
                      }
                    }}>
                      <Text style={styles.itemActionHeader}>{type == "store" || type == "restaurant" ? "See/Buy" : "Book a time"}</Text>
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

  useEffect(() => getAllMenus(), [refetchMenu])

  return (
    loaded ? 
      <>
        {(menuInfo.photos.length > 0 || menuInfo.list.length > 0) && (
          <>
            <View style={styles.menuInputBox}>
              <TextInput 
                style={styles.menuInput} type="text" 
                placeholder={
                  "Enter " + 
                  (type == "restaurant" && "meal" || type == "store" && "product" || type == "salon" && "service") 
                  + " # or name"
                } 
                onChangeText={(info) => setRequestinfo({ ...requestInfo, search: info, error: false })} autoCorrect={false} autoCapitalize="none"
              />
              <View style={styles.menuInputActions}>
                <TouchableOpacity style={styles.menuInputTouch} onPress={() => {
                  if (requestInfo.search) {
                    if (type == "salon") {
                      props.navigation.navigate(
                        "booktime", 
                        { 
                          locationid, menuid: "", serviceid: "", 
                          serviceinfo: requestInfo.search, initialize: () => getAllMenus(), 
                          type: "salon"
                        }
                      )
                    } else {
                      props.navigation.navigate(
                        "itemprofile", 
                        { 
                          locationid, menuid: "", productid: "", 
                          productinfo: requestInfo.search, initialize: () => getAllMenus(), 
                          type
                        }
                      )
                    }
                  } else {
                    setRequestinfo({ ...requestInfo, error: true })
                  }
                }}>
                  <Text style={styles.menuInputTouchHeader}>{type == "salon" ? "Book now" : "Order item"}</Text>
                </TouchableOpacity>
              </View>
            </View>
            {requestInfo.error && <Text style={styles.menuInputError}>Your request is empty</Text>}
          </>
        )}

        <ScrollView style={{ height: '90%', width: '100%' }}>
          <View style={{ marginHorizontal: width * 0.025 }}>{displayList({ id: "", name: "", image: "", list: menuInfo.list, left: 0 })}</View>

          {menuInfo.photos.length > 0 && ( 
            menuInfo.photos[0].row && (
              menuInfo.photos.map(info => (
                info.row.map(item => (
                  item.photo && item.photo.name != "" && (
                    <View key={item.key} style={[styles.menuPhoto, resizePhoto(item.photo, wsize(95)), { borderRadius: wsize(95) / 2 }]}>
                      <Image style={{ height: '100%', width: '100%' }} source={{ uri: logo_url + item.photo.name }}/>
                    </View>
                  )
                ))
              ))
            )
          )}
        </ScrollView>
      </>
    :
    <Loadingprogress/>
  )
}

const styles = StyleSheet.create({
  menuInputBox: { alignItems: 'center', marginBottom: 5, width: '100%' },
  menuInput: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), padding: 10, width: '95%' },
  menuInputActions: { flexDirection: 'row', justifyContent: 'space-around' },
  menuInputTouch: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), margin: 5, padding: 10, width: '40%' },
  menuInputTouchHeader: { fontSize: wsize(4), textAlign: 'center' },
  menuInputError: { color: 'darkred', marginLeft: 10 },
  menuPhoto: { marginBottom: 10, marginHorizontal: width * 0.025 },

  menu: { backgroundColor: 'white', borderTopLeftRadius: 3, borderTopRightRadius: 3, padding: 3 },
  menuImageHolder: { borderRadius: wsize(10) / 2, flexDirection: 'column', height: wsize(10), justifyContent: 'space-around', overflow: 'hidden' },
  menuName: { fontSize: wsize(6), fontWeight: 'bold', marginLeft: 5, marginTop: wsize(4) / 2, textDecorationLine: 'underline' },
  itemInfo: { fontSize: wsize(5), marginLeft: 10, marginVertical: 10 },
  item: { backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', marginVertical: 3, width: '100%' },
  itemImageHolder: { borderRadius: wsize(10) / 2, flexDirection: 'column', height: wsize(10), justifyContent: 'space-around', margin: 5, overflow: 'hidden' },
  itemHeader: { fontSize: wsize(6) },
  itemActions: { flexDirection: 'row', marginTop: 0 },
  itemAction: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, marginLeft: 10, padding: 5 },
  itemActionHeader: { fontSize: wsize(4), textAlign: 'center' },

  column: { flexDirection: 'column', justifyContent: 'space-around' },
})
