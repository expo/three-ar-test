import { AR } from 'expo';
import ExpoTHREE, { THREE } from 'expo-three';
import React from 'react';
import { NativeModules } from 'react-native';

import * as ARUtils from '../ar-utils';
import GraphicsView from '../components/GraphicsView';
import * as ThreeAR from '../ThreeAR';

const { ExponentAR } = NativeModules;

class RawData extends React.Component {
  handleAnchor = (anchor, eventType) => {
    if (eventType === AR.AnchorEventTypes.Add) {
      // Something added!
    } else if (eventType === AR.AnchorEventTypes.Remove) {
      // Now it's changed
    } else if (eventType === AR.AnchorEventTypes.Update) {
      // Now it's gone...
    }
  };

  handlePlane = (anchor, eventType) => {
    if (eventType === AR.AnchorEventTypes.Add) {
      // Something added!
    } else if (eventType === AR.AnchorEventTypes.Remove) {
      // Now it's changed
    } else if (eventType === AR.AnchorEventTypes.Update) {
      // Now it's gone...
    }
  };

  // When the provided image is found in real life, it'll be shown here.
  handleImage = (anchor, eventType) => {
    const { identifier, image, transform } = anchor;
    console.log('Do something with discovered image');
    if (eventType === AR.AnchorEventTypes.Add) {
      // Something added!
    } else if (eventType === AR.AnchorEventTypes.Remove) {
      // Now it's changed
    } else if (eventType === AR.AnchorEventTypes.Update) {
      // Now it's gone...
    }
  };

  handleFace = (anchor, eventType) => {
    if (eventType === AR.AnchorEventTypes.Add) {
      // Something added!
    } else if (eventType === AR.AnchorEventTypes.Remove) {
      // Now it's changed
    } else if (eventType === AR.AnchorEventTypes.Update) {
      // Now it's gone...
    }
  };

  async componentWillMount() {
    AR.onFrameDidUpdate(() => {
      if (!this.arSession) {
        return;
      }
      const { lightEstimation, rawFeaturePoints, capturedDepthData, anchors } = AR.getCurrentFrame({
        lightEstimation: true,
        rawFeaturePoints: true,
        capturedDepthData: true,
        anchors: {},
      });

      if (lightEstimation && this.light) {
        // const {
        //   ambientIntensity,
        //   ambientColorTemperature,
        //   // These will only be returned with front facing AR
        //   primaryLightDirection,
        //   primaryLightIntensity,
        // } = lightEstimation;

        this.light.data = lightEstimation;
      }
      // This is the depth info from the iPhoneX front camera
      if (capturedDepthData) {
        const {
          depthDataQuality,
          depthDataAccuracy,
          depthDataFiltered,
          cameraCalibrationData,
        } = capturedDepthData;

        const {
          intrinsicMatrix,
          intrinsicMatrixReferenceDimensions, // {width, height}
          extrinsicMatrix,
          pixelSize,
          lensDistortionLookupTable,
          inverseLensDistortionLookupTable,
          lensDistortionCenter, // {x, y}
        } = cameraCalibrationData;
      }

      if (Array.isArray(anchors) && this.planes) {
        const planes = anchors.filter(({ type }) => type === 'ARPlaneAnchor');
        this.planes.data = planes;
      }

      // Really not much to do with raw feature points, so here's this pretty dot visualizer...
      if (this.points) {
        this.points.data = rawFeaturePoints;
      }
      // console.log('A: isLightEstimationEnabled', AR.getAutoFocusEnabled());
      // AR.getAutoFocusEnabled(false);
    });

    AR.onDidFailWithError(({ error }) => {
      console.error(error);
    });

    AR.onAnchorsDidUpdate(({ anchors, eventType }) => {
      // console.log('anchors did update');
      for (let anchor of anchors) {
        // console.log('handle anchor:', anchor.type);
        switch (anchor.type) {
          case AR.AnchorTypes.Anchor:
            this.handleAnchor(anchor, eventType);
            break;
          case AR.AnchorTypes.Plane:
            this.handlePlane(anchor, eventType);
            break;
          case AR.AnchorTypes.Face:
            this.handleFace(anchor, eventType);
            break;
          case AR.AnchorTypes.Image:
            this.handleImage(anchor, eventType);
            break;
          default:
            break;
        }
      }
    });

    AR.onCameraDidChangeTrackingState(({ trackingState, trackingStateReason }) => {});

    AR.onSessionWasInterrupted(() => {
      console.log('Backgrounded App: Session was interrupted');
    });

    AR.onSessionInterruptionEnded(() => {
      console.log('Foregrounded App: Session is no longer interrupted');
    });
  }

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

  onContextCreate = async ({ gl, arSession, scale, width, height }) => {
    if (!arSession) {
      console.error("Couldn't start AR Session!");
      return;
    }
    this.arSession = arSession;

    AR.setWorldAlignment(AR.WorldAlignmentTypes.Gravity);
    AR.setPlaneDetection(AR.PlaneDetectionTypes.Horizontal);

    console.log('Version: ', AR.getVersion());
    console.log('ARFaceTrackingConfiguration: ', ExponentAR.ARFaceTrackingConfiguration);
    console.log(
      'AROrientationTrackingConfiguration: ',
      ExponentAR.AROrientationTrackingConfiguration
    );
    console.log('ARWorldTrackingConfiguration: ', ExponentAR.ARWorldTrackingConfiguration);

    if (AR.getVersion() === '1.5') {
      AR.setAutoFocusEnabled(true);
      console.log('A: is Auto Focus Enabled', AR.getAutoFocusEnabled());
      AR.setAutoFocusEnabled(false);
      console.log('B: is Auto Focus Enabled', AR.getAutoFocusEnabled());

      AR.setLightEstimationEnabled(true);
      console.log('A: isLightEstimationEnabled', AR.getLightEstimationEnabled());
      AR.setLightEstimationEnabled(false);
      console.log('B: isLightEstimationEnabled', AR.getLightEstimationEnabled());

      console.log('FaceTrackingVideoFormats:', ExponentAR.FaceTrackingVideoFormats);
      console.log('WorldTrackingVideoFormats:', ExponentAR.WorldTrackingVideoFormats);
      console.log('OrientationTrackingVideoFormats:', ExponentAR.OrientationTrackingVideoFormats);

      AR.setProvidesAudioData(true);
      console.log('A: Provides Audio Data', AR.getProvidesAudioData());
      AR.setProvidesAudioData(false);
      console.log('B: Provides Audio Data', AR.getProvidesAudioData());

      Object.keys(AR.PlaneDetectionTypes).forEach(key => {
        const planeDetectionType = AR.PlaneDetectionTypes[key];
        AR.setPlaneDetection(planeDetectionType);
        console.log('Plane Detection: ', key, planeDetectionType, AR.getPlaneDetection());
      });

      Object.keys(AR.WorldAlignmentTypes).forEach(key => {
        const worldAlignmentType = AR.WorldAlignmentTypes[key];
        AR.setWorldAlignment(worldAlignmentType);
        console.log('World Alignment: ', key, AR.getWorldAlignment());
      });

      console.log('isFrontCameraAvailable:', AR.isFrontCameraAvailable());
      console.log('isRearCameraAvailable:', AR.isRearCameraAvailable());

      Object.keys(AR.TrackingConfigurations).forEach(key => {
        const trackingConfiguration = AR.TrackingConfigurations[key];
        // AR.setConfigurationAsync(trackingConfiguration);
        console.log(
          'isConfigurationAvailable:',
          key,
          AR.isConfigurationAvailable(trackingConfiguration)
        );
      });
    }

    try {
      AR.setWorldOriginAsync(new THREE.Matrix4().toArray());
    } catch (error) {
      console.warn('Error:setWorldOriginAsync: ', error);
    }
    this.renderer = ExpoTHREE.renderer({ gl });
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0xffffff);

    this.scene = new THREE.Scene();
    this.scene.background = ThreeAR.createARBackgroundTexture(this.renderer);

    /// AR Camera
    this.camera = ThreeAR.createARCamera(width, height, 0.01, 1000);

    this.setupARUtils();
  };

  setupARUtils = () => {
    this.points = new ARUtils.Points();
    this.scene.add(this.points);
    this.light = new ARUtils.Light(0x222222);
    this.scene.add(this.light);
    this.planes = new ARUtils.Planes();
    this.scene.add(this.planes);
  };

  onResize = ({ x, y, scale, width, height }) => {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width, height);
  };

  onRender = delta => {
    this.renderer.render(this.scene, this.camera);
  };
}
export default RawData;
