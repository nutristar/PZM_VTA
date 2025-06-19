// PermissionsChecker.js
import React, { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';

const PermissionsChecker = () => {
  useEffect(() => {
    const checkAndRequestPermissions = async () => {
      if (Platform.OS !== 'android') return;

      // AUDIO
      const audioPermission = await check(PERMISSIONS.ANDROID.RECORD_AUDIO);
      if (audioPermission === RESULTS.DENIED) {
        await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
      } else if (audioPermission === RESULTS.BLOCKED) {
        Alert.alert(
          'Разрешение на микрофон',
          'Пожалуйста, включите доступ к микрофону в настройках приложения.',
          [
            { text: 'Отмена', style: 'cancel' },
            { text: 'Открыть настройки', onPress: () => openSettings() },
          ]
        );
      }

      // STORAGE
      const storagePermission = await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
      if (storagePermission === RESULTS.DENIED) {
        await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
      } else if (storagePermission === RESULTS.BLOCKED) {
        Alert.alert(
          'Разрешение на хранилище',
          'Пожалуйста, включите доступ к файлам в настройках приложения.',
          [
            { text: 'Отмена', style: 'cancel' },
            { text: 'Открыть настройки', onPress: () => openSettings() },
          ]
        );
      }
    };

    checkAndRequestPermissions();
  }, []);

  return null; // Ничего не отображаем, только проверяем пермишены
};

export default PermissionsChecker;
