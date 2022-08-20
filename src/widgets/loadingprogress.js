import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

export default function Loadingprogress(props) {
  return (
    <View style={styles.box}>
      <ActivityIndicator color="black" size="large"/>
    </View>
  )
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' }
})
