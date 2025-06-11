import React, { useRef, useState } from 'react';
import { View, Button, PermissionsAndroid, Platform } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';

const Recorder = ({ onFinish }) => {
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;
  const [isRecording, setIsRecording] = useState(false);
  const [recordPath, setRecordPath] = useState('');

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);
      return Object.values(result).every(r => r === PermissionsAndroid.RESULTS.GRANTED);
    }
    return true;
  };

  const onStart = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const path = Platform.select({
      ios: 'audio.m4a',
      android: `${RNFS.ExternalDirectoryPath}/audio.m4a`,
    });

    await audioRecorderPlayer.startRecorder(path);
    audioRecorderPlayer.addRecordBackListener(() => {});
    setIsRecording(true);
    setRecordPath(path);
  };

  const onStop = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    setIsRecording(false);
    onFinish(recordPath);
  };

  return (
    <View style={{ marginBottom: 20 }}>
      <Button
        title={isRecording ? 'Остановить запись' : 'Начать запись'}
        onPress={isRecording ? onStop : onStart}
      />
    </View>
  );
};

export default Recorder;
