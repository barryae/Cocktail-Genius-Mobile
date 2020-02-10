import React from "react";
import { Text, View, YellowBox } from "react-native";
import { NativeRouter, Route, Link } from "react-router-native";
import { Camera, Home } from "./views";

// omit the annoying warning about the debugger tab not being open
YellowBox.ignoreWarnings(["Remote debugger"]);

export default () => {
  return (
    <NativeRouter>
      <View style={{ height: 50, display: "flex", justifyContent: "center" }}>
        <Link to="/">
          <Text>Home</Text>
        </Link>
      </View>
      <Route exact path="/" component={Home} />
      <Route path="/camera" component={Camera} />
    </NativeRouter>
  );
};
