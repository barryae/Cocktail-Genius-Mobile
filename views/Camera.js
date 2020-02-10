import React, { useEffect, useState } from "react";
import { Button, Image, Text, TouchableOpacity, View } from "react-native";
import styled from "styled-components";
import * as Permissions from "expo-permissions";
import { Camera as ExpoCamera } from "expo-camera";
import * as FileSystem from "expo-file-system";

const Container = styled.View`
  align-items: center;
  flex: 1;
  justify-content: center;
`;

const CaptureBtn = styled.TouchableOpacity`
  background: white;
  border-radius: 100;
  bottom: 0;
  height: 60;
  position: absolute;
  width: 60;
`;

const CapturedImage = styled.Image`
  height: 100%;
  width: 100%;
`;

const ConfirmImage = styled.View`
  align-items: center;
  background: white;
  bottom: 0;
  height: 50;
  position: absolute;
  width: 100%;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-around;
`;

export const Camera = () => {
  let camera = null;
  const [hasCameraPermission, setCameraPermission] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [photoBase64, setphotoBase64] = useState(false);
  //

  // had to abstract this outside of useEffect because react doesn't like
  // having an async function passed into useEffect
  const getCameraPermission = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    setCameraPermission(status === "granted");
  };

  useEffect(() => {
    getCameraPermission();
  }, []);

  const caputureHandler = async () => {
    const photo = await camera.takePictureAsync();
    setPhoto(photo); // = {uri: string, width: number, height: number}
  };

  const acceptPhoto = () => {
    // encode photo uri to base64
    FileSystem.readAsStringAsync(photo.uri, {
      encoding: FileSystem.EncodingType.Base64
    }).then(res => setphotoBase64(res));
  };

  const rejectPhoto = () => {
    setPhoto(null);
  };

  return (
    <Container>
      {hasCameraPermission ? (
        photoBase64 ? (
          // this will become a redirect the the enocding passed forward
          <Text>Photo encoded!</Text>
        ) : photo ? (
          <>
            <CapturedImage source={{ uri: photo.uri }} />
            <ConfirmImage>
              <Text>Use this image?</Text>
              <ButtonContainer>
                <Button title="Yes" onPress={acceptPhoto}>
                  Yes
                </Button>
                <Button title="No" onPress={rejectPhoto}>
                  No
                </Button>
              </ButtonContainer>
            </ConfirmImage>
          </>
        ) : (
          <>
            <ExpoCamera
              ref={cameraRef => (camera = cameraRef)}
              style={{ height: "100%", width: "100%" }}
              type={ExpoCamera.Constants.Type.back}
            />
            <CaptureBtn onPress={caputureHandler} />
          </>
        )
      ) : (
        // may want to move these permissions to App.js and handle them at the root level
        <Text>Please give access to camera</Text>
      )}
    </Container>
  );
};
