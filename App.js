import { AR, Permissions, ScreenOrientation } from 'expo';
import { THREE } from 'expo-three';
import React from 'react';
import { Text, View } from 'react-native';
import { createStackNavigator } from 'react-navigation';

import Page from './components/Page';
import * as ThreeAR from './ThreeAR';

const Navigator = createStackNavigator({
  Page: {
    screen: Page,
  },
});

export default class App extends React.Component {
  state = {
    hasCameraPermission: null,
  };

  async componentWillMount() {
    ThreeAR.suppressWarnings(true);
    THREE.suppressExpoWarnings(true);
    ScreenOrientation.allow(ScreenOrientation.Orientation.ALL);
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }
  componentWillUnmount() {
    ThreeAR.suppressWarnings(false);
    THREE.suppressExpoWarnings(false);
    AR.stopAsync();
  }

  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <View style={{ flex: 1, backgroundColor: 'white' }} />;
    } else if (hasCameraPermission === false) {
      return <ErrorView>No access to camera</ErrorView>;
    } else if (!AR.isAvailable()) {
      return <ErrorView>ARKit isn't available!</ErrorView>;
    } else {
      return <Navigator />;
    }
  }
}

const ErrorView = ({ children }) => (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'red',
    }}>
    <Text style={{ fontSize: 24, color: 'white' }}>{children}</Text>
  </View>
);
