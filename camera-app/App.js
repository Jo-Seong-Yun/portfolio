import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useRef, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [photo, setPhoto] = useState(null);
  const [facing, setFacing] = useState('back');
  const cameraRef = useRef(null);

  if (!cameraPermission || !mediaPermission) {
    return <View style={styles.container} />;
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>카메라 권한이 필요합니다</Text>
        <TouchableOpacity style={styles.button} onPress={requestCameraPermission}>
          <Text style={styles.buttonText}>권한 허용</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;
    const result = await cameraRef.current.takePictureAsync({ quality: 0.9 });
    setPhoto(result.uri);
  };

  const savePicture = async () => {
    if (!mediaPermission.granted) {
      await requestMediaPermission();
    }
    await MediaLibrary.saveToLibraryAsync(photo);
    setPhoto(null);
    alert('사진이 저장되었습니다!');
  };

  const discardPicture = () => setPhoto(null);

  const toggleFacing = () =>
    setFacing((f) => (f === 'back' ? 'front' : 'back'));

  if (photo) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photo }} style={styles.preview} />
        <View style={styles.row}>
          <TouchableOpacity style={[styles.button, styles.secondary]} onPress={discardPicture}>
            <Text style={styles.buttonText}>다시 찍기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={savePicture}>
            <Text style={styles.buttonText}>저장</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.controls}>
          <TouchableOpacity style={styles.flipButton} onPress={toggleFacing}>
            <Text style={styles.flipText}>전환</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shutterOuter} onPress={takePicture}>
            <View style={styles.shutterInner} />
          </TouchableOpacity>
          <View style={{ width: 60 }} />
        </View>
      </CameraView>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  flipButton: {
    width: 60,
    alignItems: 'center',
  },
  flipText: {
    color: '#fff',
    fontSize: 16,
  },
  preview: {
    width: '100%',
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 20,
    padding: 20,
    backgroundColor: '#000',
  },
  button: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondary: {
    backgroundColor: '#444',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  permissionText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
  },
});
