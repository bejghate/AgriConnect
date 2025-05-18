// mocks/react-native-maps.js
import React from 'react';
import { View, Text } from 'react-native';

// Mock components for react-native-maps
const MockMapView = (props) => {
  return (
    <View style={[{ backgroundColor: '#e0e0e0', alignItems: 'center', justifyContent: 'center' }, props.style]}>
      <Text>Map View (Web Mock)</Text>
      {props.children}
    </View>
  );
};

const MockMarker = (props) => {
  return (
    <View style={{ margin: 5, padding: 5, backgroundColor: '#f0f0f0', borderRadius: 5 }}>
      <Text>Marker: {props.title || 'Unnamed'}</Text>
      {props.children}
    </View>
  );
};

const MockCallout = (props) => {
  return (
    <View style={{ padding: 5, backgroundColor: '#ffffff', borderRadius: 5 }}>
      {props.children}
    </View>
  );
};

const MockCircle = (props) => {
  return (
    <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(0, 0, 255, 0.2)' }}>
      {props.children}
    </View>
  );
};

const MockPolygon = (props) => {
  return (
    <View style={{ width: 30, height: 30, backgroundColor: 'rgba(0, 255, 0, 0.2)' }}>
      {props.children}
    </View>
  );
};

const MockPolyline = (props) => {
  return (
    <View style={{ width: 50, height: 2, backgroundColor: 'rgba(255, 0, 0, 0.5)' }}>
      {props.children}
    </View>
  );
};

// Export mock components
export default {
  __esModule: true,
  default: MockMapView,
  MapView: MockMapView,
  Marker: MockMarker,
  Callout: MockCallout,
  Circle: MockCircle,
  Polygon: MockPolygon,
  Polyline: MockPolyline,
  PROVIDER_GOOGLE: 'google',
  PROVIDER_DEFAULT: 'default',
  MAP_TYPES: {
    STANDARD: 'standard',
    SATELLITE: 'satellite',
    HYBRID: 'hybrid',
    TERRAIN: 'terrain',
    NONE: 'none',
  },
  Animated: {
    Region: class {},
  },
};
