import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Disable(props) {
  const { close } = props.route.params

  return (
    <SafeAreaView style={styles.disabled}>
      <View style={styles.disabledContainer}>
        <Text style={styles.disabledHeader}>
          There is an update to the app{'\n'}
          Please wait a moment{'\n'}
          Or tap 'Close'
        </Text>

        <TouchableOpacity style={styles.disabledClose} onPress={close}>
          <Text style={styles.disabledCloseHeader}>Close</Text>
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
