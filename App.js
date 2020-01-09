import React, { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components'
import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera';

// styled-components is a clean way of using css/scss and creating declarative
// names for tags when placing into our return statement
// https://www.styled-components.com/docs/basics#getting-started
const Container = styled.View`
align-items: center;
flex: 1;
justify-content: center;
`

const CaptureBtn = styled.TouchableOpacity`
background: white;
border-radius: 100;
bottom: 0;
height: 60;
position: absolute;
width: 60;
`

const CapturedImage = styled.Image`
height: 100%;
width: 100%;
`

export default function App() {
  // using hooks instead of this.state
  // https://reactjs.org/docs/hooks-intro.html
  const [hasCameraPermission, setCameraPermission] = useState(null);
  let camera = null
  const [photo, setPhoto] = useState(null)

  // had to abstract this outside of useEffect because react doesn't like
  // having an async function passed into useEffect
  const getCameraPermission = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    setCameraPermission(status === 'granted')
  }

  // using useEffect instead of componentDidMount
  // https://reactjs.org/docs/hooks-effect.html
  useEffect(() => {
    getCameraPermission()
  }, [])

  const caputureHandler = async () => {
    const photo = await camera.takePictureAsync();
    setPhoto(photo)
  }

  return (
    <Container>
      {hasCameraPermission
        ? photo
          ? <CapturedImage source={{ uri: photo.uri }} />
          : <>
            <Camera
              ref={cameraRef => camera = cameraRef}
              style={{ height: '100%', width: '100%' }}
              type={Camera.Constants.Type.back} />
            <CaptureBtn
              onPress={caputureHandler} />
          </>
        : <Text>Please give access to camera</Text>

      }
    </Container>
  )
}