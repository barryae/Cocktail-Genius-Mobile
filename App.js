import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components'
import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera';

// styled-components is a clean way of using css/scss and creating declarative
// names for tags when placing into our return statement
// https://www.styled-components.com/docs/basics#getting-started
const Container = styled.View`
align-items: center;
background: white;
flex: 1;
justify-content: center;
`

export default function App() {
  // using hooks instead of this.state
  // https://reactjs.org/docs/hooks-intro.html
  const [hasCameraPermission, setCameraPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);

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
  })

  // everything below is boilerplate code from the expo camera docs
  // https://docs.expo.io/versions/v35.0.0/sdk/camera/
  if (hasCameraPermission === null) {
    return <Container><Text>Waiting for permission</Text></Container>
  } else if (hasCameraPermission === false) {
    return <Container><Text>No access to camera</Text></Container>;
  } else {
    return (
      <View style={{ flex: 1 }}>
        <Camera style={{ flex: 1 }} type={type}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              flexDirection: 'row',
            }}>
            <TouchableOpacity
              style={{
                flex: 0.1,
                alignSelf: 'flex-end',
                alignItems: 'center',
              }}
              onPress={() => {
                setType(
                  type === Camera.Constants.Type.back
                    ? Camera.Constants.Type.front
                    : Camera.Constants.Type.back,
                )
              }}>
              <Text style={{ fontSize: 18, marginBottom: 10, color: 'white' }}> Flip </Text>
            </TouchableOpacity>
          </View>
        </Camera>
      </View>
    )
  }
}