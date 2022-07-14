import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, View, Text, TouchableOpacity } from 'react-native';
import { tr } from '../../assets/translate'

export default function Disable(props) {
  const { ownerId, close } = props.route.params
  const [language, setLanguage] = useState('')

  const initialize = () => {
    tr.locale = await AsyncStorage.getItem("language")

    setLanguage(await AsyncStorage.getItem("language"))
  }

  useEffect(() => {
    initialize()
  }, [])

  return (
    <SafeAreaView style={styles.disabled}>
      <View style={styles.disabledContainer}>
        <Text style={styles.disabledHeader}>{tr.t("disableHeader")}</Text>

        <TouchableOpacity style={styles.disabledClose} onPress={close}>
          <Text style={styles.disabledCloseHeader}>{tr.t("buttons.close")}</Text>
        </TouchableOpacity>

        <ActivityIndicator size="large"/>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  disabled: { backgroundColor: 'black', flexDirection: 'column', justifyContent: 'space-around', height: '100%', opacity: 0.8, width: '100%' },
  disabledContainer: { alignItems: 'center', width: '100%' },
  disabledHeader: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  disabledClose: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 50, padding: 10 },
})
