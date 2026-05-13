import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { TrackingData } from '../services/deliveryService';

// Fix leaflet icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const truckIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/709/709790.png',
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -19]
});

const originIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30]
});

const destinationIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/14090/14090382.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30]
});

interface LiveMapProps {
  data: TrackingData | TrackingData[];
  height?: string;
  zoom?: number;
}

const LiveMap: React.FC<LiveMapProps> = ({ data, height = '100%', zoom = 4 }) => {
  const isArray = Array.isArray(data);
  const items = isArray ? data : [data];
  
  // Use the first item's current location to center the map
  const initialCenter = items.length > 0 ? items[0].currentLocation.coordinates : [39.8283, -98.5795] as [number, number];
  const [mapCenter, setMapCenter] = useState<[number, number]>(initialCenter);

  useEffect(() => {
    if (items.length > 0 && !isArray) {
      setMapCenter(items[0].currentLocation.coordinates);
    }
  }, [data]);

  return (
    <div style={{ height: height, width: '100%', zIndex: 1, position: 'relative' }}>
      <MapContainer 
        center={mapCenter} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {items.map(item => (
          <React.Fragment key={item.trackingCode}>
            {/* Route Line */}
            <Polyline 
              positions={[item.origin.coordinates, item.destination.coordinates]} 
              color={item.status === 'delivered' ? '#10B981' : '#8B5CF6'} 
              weight={3} 
              dashArray="5, 10" 
              opacity={0.6}
            />

            {/* Destination Marker */}
            <Marker position={item.destination.coordinates} icon={destinationIcon}>
              <Popup><strong>Destination:</strong> {item.destination.city}</Popup>
            </Marker>

            {/* Current Location (Package/Truck) Marker - Combined with Origin Info */}
            <Marker position={item.currentLocation.coordinates} icon={truckIcon}>
              <Popup>
                <strong>{item.trackingCode}</strong><br/>
                Origin: {item.origin.city}<br/>
                Current Location: {item.currentLocation.city}<br/>
                Status: {item.statusText}
              </Popup>
            </Marker>
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
};

export default LiveMap;
