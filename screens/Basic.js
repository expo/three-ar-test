import { AR } from 'expo';
import ExpoTHREE, { THREE } from 'expo-three';
import React from 'react';

import GraphicsView from '../components/GraphicsView';
import * as ThreeAR from '../ThreeAR';
import { View, Text } from 'react-native';
export default class App extends React.Component {
  render() {
    const config = AR.TrackingConfigurations.World;
    return (
      <View style={{ flex: 1 }}>
        <GraphicsView
          style={{ flex: 2 }}
          onContextCreate={this.onContextCreate}
          onRender={this.onRender}
          onResize={this.onResize}
          trackingConfiguration={config}
          arEnabled
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>😮 Works with any size viewport</Text>
        </View>
      </View>
    );
  }

  onContextCreate = async event => {
    AR.setPlaneDetection(AR.PlaneDetectionTypes.Horizontal);

    this.commonSetup(event);
  };

  commonSetup = ({ gl, scale, width, height }) => {
    this.renderer = ExpoTHREE.renderer({ gl });
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0xffffff, 1.0);

    this.scene = new THREE.Scene();
    this.scene.background = ThreeAR.createARBackgroundTexture(this.renderer);
    this.camera = ThreeAR.createARCamera(width, height, 0.01, 1000);
  };

  onResize = ({ x, y, scale, width, height }) => {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width, height);
  };

  onRender = () => {
    this.renderer.render(this.scene, this.camera);
  };
}
