import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import DddScreen from './src/screens/DddScreen';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f2f2f2" />
      <DddScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
});