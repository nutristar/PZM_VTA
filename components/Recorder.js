import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Button,
  PermissionsAndroid,
  Platform,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';


const Recorder = ({ onFinish,  onStartRecording }) => {
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;
  const [isRecording, setIsRecording] = useState(false);
  const [recordPath, setRecordPath] = useState('');
  const blinkAnim = useRef(new Animated.Value(0)).current;

//  const requestPermissions = async () => {
//    if (Platform.OS === 'android') {
//      const result = await PermissionsAndroid.requestMultiple([
//        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
//      ]);
//      return Object.values(result).every(r => r === PermissionsAndroid.RESULTS.GRANTED);
//    }
//    return true;
//  };
//  const requestPermissions = async () => {
//    if (Platform.OS === 'android') {
//      try {
//        const result = await PermissionsAndroid.requestMultiple([
//          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
//        ]);
//        console.log('[Permissions] Запрошены:', result);
//
//        const allGranted = Object.entries(result).every(
//          ([key, value]) => {
//            console.log(`[Permissions] ${key} = ${value}`);
//            return value === PermissionsAndroid.RESULTS.GRANTED;
//          }
//        );
//
//        return allGranted;
//      } catch (err) {
//        console.error('[Permissions] Ошибка запроса разрешений:', err);
//        return false;
//      }
//    }
//    return true;
//  };
  const requestPermissions = async () => {
    if (Platform.OS !== 'android') return true;

    try {
      const permissionsToRequest = [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];

      if (Platform.Version < 29) {
        // Только если Android < 10 — добавляем старое разрешение
        permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      }

      const result = await PermissionsAndroid.requestMultiple(permissionsToRequest);
      console.log('[Permissions] Запрошены:', result);

      let allGranted = true;
      for (const [perm, value] of Object.entries(result)) {
        console.log(`[Permissions] ${perm} = ${value}`);
        if (value !== PermissionsAndroid.RESULTS.GRANTED) {
          allGranted = false;

          if (value === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            Alert.alert(
              'Разрешение отклонено',
              'Вы запретили доступ навсегда. Откройте настройки и включите разрешения вручную.',
              [
                { text: 'Отмена', style: 'cancel' },
                { text: 'Открыть настройки', onPress: () => Linking.openSettings() },
              ]
            );
          }
        }
      }

      return allGranted;
    } catch (err) {
      console.error('[Permissions] Ошибка запроса разрешений:', err);
      return false;
    }
  };


  const startBlinking = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopBlinking = () => {
    blinkAnim.stopAnimation();
  };


  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      const audioGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      const storageGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      console.log('[Permissions] CHECK audio:', audioGranted);
      console.log('[Permissions] CHECK storage:', storageGranted);
    }
  };

  // Где-то в вашем компоненте:
  useEffect(() => {
    checkPermissions(); // Вызываем при загрузке
  }, []);
  const onStart = async () => {
    const hasPermission = await requestPermissions();
    console.log("waiting for permisions")
    if (!hasPermission) return;
    console.log("permisions  recived successfully!!!!")

        // Вызываем callback из App.js
    if (onStartRecording) onStartRecording();

    const path = Platform.select({
      ios: 'audio.m4a',
      android: `${RNFS.ExternalDirectoryPath}/audio.m4a`,
    });

    await audioRecorderPlayer.startRecorder(path);
    audioRecorderPlayer.addRecordBackListener(() => {});
    setIsRecording(true);
    setRecordPath(path);
    startBlinking();
  };

  const onStop = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    setIsRecording(false);
    stopBlinking();
    onFinish(recordPath);
  };

  return (
    <View style={{ marginBottom: 20, alignItems: 'center' }}>
      <Button
        title={isRecording ? 'Zatrzymaj nagrywanie' : 'Zacznij nagrywać'}
        onPress={isRecording ? onStop : onStart}
      />

      {isRecording && (
        <Animated.View style={[styles.blinkingContainer, { opacity: blinkAnim }]}>
          <Text style={styles.blinkingText}>Nagrywanie w toku...</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  blinkingContainer: {
    marginTop: 12,
  },
  blinkingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'red',
  },
});

export default Recorder;

