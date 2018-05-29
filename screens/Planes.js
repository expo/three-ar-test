import { AR } from 'expo';
import ExpoTHREE, { THREE } from 'expo-three';
import React from 'react';

import GraphicsView from '../components/GraphicsView';
import * as ThreeAR from '../ThreeAR';
import { Planes } from '../ar-utils';

export default class App extends React.Component {
  render() {
    const config = AR.TrackingConfigurations.World;
    return (
      <GraphicsView
        style={{ flex: 1 }}
        onContextCreate={this.onContextCreate}
        onRender={this.onRender}
        onResize={this.onResize}
        trackingConfiguration={config}
        arEnabled
      />
    );
  }

  onContextCreate = async event => {
    this.arSetup();
    this.commonSetup(event);
  };

  arSetup = () => {
    AR.setPlaneDetection(AR.PlaneDetectionTypes.Horizontal);
  };

  commonSetup = ({ gl, scale, width, height }) => {
    this.renderer = ExpoTHREE.renderer({ gl });
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0xffffff, 1.0);

    this.scene = new THREE.Scene();
    this.scene.background = ThreeAR.createARBackgroundTexture(this.renderer);
    this.camera = ThreeAR.createARCamera(width, height, 0.01, 1000);

    this.planes = new Planes();
    this.scene.add(this.planes);
  };

  onResize = ({ x, y, scale, width, height }) => {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width, height);
  };

  onRender = () => {
    this.planes.update();
    this.renderer.render(this.scene, this.camera);
  };
}
