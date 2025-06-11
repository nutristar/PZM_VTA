import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TranscribedText = ({ text }) => {
  if (!text) return null;
  return (
    <View style={styles.box}>
      <Text style={styles.title}>Распознанный текст:</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    marginVertical: 20,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
  },
});

export default TranscribedText;
