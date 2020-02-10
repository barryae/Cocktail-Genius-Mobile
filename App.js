import React from "react";
import { Text, View, YellowBox } from "react-native";
import { NativeRouter, Route, Link } from "react-router-native";
import { Camera } from "./views";

// omit the annoying warning about the debugger tab not being open
YellowBox.ignoreWarnings(["Remote debugger"]);

export default () => {
  return (
    <NativeRouter>
      <View style={{ paddingTop: 100 }}>
        <Link to="/camera">
          <Text>Camera</Text>
        </Link>
      </View>
      <Route path="/camera" component={Camera} />
    </NativeRouter>
  );
};
