import React, { useState } from "react";
import { Button, CameraRoll, Text, View, Image } from "react-native";
import { Link } from "react-router-native";

export const Home = () => {
  const [photos, setPhotos] = useState([]);

  const albumPressHandler = () => {
    CameraRoll.getPhotos({
      first: 20,
      assetType: "Photos"
    })
      .then(r => {
        setPhotos(r.edges);
      })
      .catch(err => {
        //Error Loading Images
      });
  };

  return (
    <View>
      <Text>Cocktail Genius</Text>
      <Text>How it works:</Text>
      <Link to="/camera">
        <Text>Camera</Text>
      </Link>
      <Button title="album" onPress={albumPressHandler}>
        <Text>Album</Text>
      </Button>
      {photos.map((el, i) => (
        // these aren't showing?
        <Image source={{ uri: el.node.image.uri }} key={i} />
      ))}
    </View>
  );
};
