import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import Recorder from './components/Recorder';
import TranscribedText from './components/TranscribedText';
import RNFetchBlob from 'rn-fetch-blob';

export default function App() {
  const [audioPath, setAudioPath] = useState(null);
  const [transcribedText, setTranscribedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('ru'); // 'pl' or 'en'

  const handleRecordingFinished = (path) => {
    console.log('[handleRecordingFinished] Audio recording finished. Path:', path);
    setAudioPath(path);
    transcribeAudio(path);
  };

  const transcribeAudio = async (path) => {
    console.log('[transcribeAudio] Using RNFetchBlob to upload:', path);
    setLoading(true);

    try {
      const response = await RNFetchBlob.fetch('POST', 'http://192.168.0.80:5000/transcribe', {
        'Content-Type': 'multipart/form-data',
      }, [
        {
          name: 'file',
          filename: 'audio.m4a',
          type: 'audio/m4a',
          data: RNFetchBlob.wrap(path),
        },
        {
          name: 'language',
          data: selectedLanguage,
        }
      ]);

      const data = JSON.parse(response.data);
      console.log('[transcribeAudio] Response:', data);
      setTranscribedText(data.text || '[пусто]');
    } catch (err) {
      console.error('[transcribeAudio] Error:', err.message, err);
      Alert.alert('Ошибка', 'Не удалось отправить аудио: ' + err.message);
    }

    setLoading(false);
  };

  const saveTranscription = async () => {
    console.log('[saveTranscription] Sending transcription to /save');
    try {
      const response = await fetch('http://192.168.0.80:5000/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_name: 'audio.m4a',
          text: transcribedText,
          language: selectedLanguage,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        console.log('[saveTranscription] Response:', result);
        Alert.alert('Успех', 'Текст успешно сохранён');
      } else {
        throw new Error(result.error || 'Ошибка при сохранении');
      }
    } catch (err) {
      console.error('[saveTranscription] Error:', err.message);
      Alert.alert('Ошибка', 'Не удалось сохранить: ' + err.message);
    }
  };

  const renderLanguageButton = (lang, label) => (
    <TouchableOpacity
      onPress={() => setSelectedLanguage(lang)}
      style={[
        styles.languageButton,
        selectedLanguage === lang && styles.languageButtonSelected
      ]}
    >
      <Text style={[
        styles.languageText,
        selectedLanguage === lang && styles.languageTextSelected
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.languageSelector}>
        {renderLanguageButton('pl', 'PL')}
        {renderLanguageButton('en', 'EN')}
      </View>

      <Recorder onFinish={handleRecordingFinished} />

      {loading && <ActivityIndicator size="large" />}

      <TranscribedText text={transcribedText} />

      {transcribedText ? (
        <Button title="Отправить текст" onPress={saveTranscription} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#ccc',
  },
  languageButtonSelected: {
    backgroundColor: '#007bff',
    transform: [{ scale: 1.1 }],
  },
  languageText: {
    fontSize: 16,
    color: '#000',
  },
  languageTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
