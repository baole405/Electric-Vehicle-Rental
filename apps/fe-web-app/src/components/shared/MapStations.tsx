import { useCallback, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { TStation } from '@/schema/station.schema';
import { Button } from '../shadcn/ui/button';

// Fix Leaflet default icon issue with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom markers for different station statuses
const stationIcons = {
  active: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  maintenance: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  closed: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
};

// User location marker
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface LatLng {
  lat: number;
  lng: number;
}

interface MapStationsProps {
  stations: TStation[];
  selectedStationId?: string;
  onSelectStation: (stationId: string) => void;
  className?: string;
}

// Calculate distance between two points in kilometers
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

// Component to handle map view updates
function MapUpdater({ stations, userLocation }: { stations: TStation[], userLocation?: LatLng }) {
  const map = useMap();

  useEffect(() => {
    if (!stations.length) return;

    const bounds = new L.LatLngBounds(
      stations
        .filter(station => station.lat && station.lng)
        .map(station => [station.lat!, station.lng!])
    );

    if (userLocation) {
      bounds.extend([userLocation.lat, userLocation.lng]);
    }

    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, stations, userLocation]);

  return null;
}

export default function MapStations({ stations, selectedStationId, onSelectStation, className = '' }: MapStationsProps) {
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [nearestStation, setNearestStation] = useState<TStation | null>(null);
  const [error, setError] = useState<string>('');

  const findNearestStation = useCallback(() => {
    if (!userLocation) {
      setError('Vui lòng cho phép truy cập vị trí của bạn');
      return;
    }

    const validStations = stations.filter(station => station.lat && station.lng);
    if (!validStations.length) {
      setError('Không tìm thấy trạm nào có tọa độ hợp lệ');
      return;
    }

    const nearest = validStations.reduce((nearest, station) => {
      const distance = getDistanceFromLatLonInKm(
        userLocation.lat,
        userLocation.lng,
        station.lat!,
        station.lng!
      );

      if (!nearest || distance < nearest.distance) {
        return { station, distance };
      }
      return nearest;
    }, { station: null as TStation | null, distance: Infinity });

    setNearestStation(nearest.station);
    if (nearest.station) {
      onSelectStation(nearest.station._id);
    }
  }, [userLocation, stations, onSelectStation]);

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Trình duyệt của bạn không hỗ trợ Geolocation');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setError('');
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError('Không thể lấy vị trí của bạn. Vui lòng cho phép truy cập vị trí.');
      }
    );
  }, []);

  // Center and bounds calculations for valid stations
  const validStations = stations.filter(station => station.lat && station.lng);
  const defaultCenter = validStations.length > 0
    ? { lat: validStations[0].lat!, lng: validStations[0].lng! }
    : { lat: 10.8231, lng: 106.6297 }; // Default to Ho Chi Minh City center

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="flex justify-between items-center gap-2">
        <Button
          onClick={getUserLocation}
          variant="outline"
          className="flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Lấy vị trí của bạn
        </Button>

        <Button
          onClick={findNearestStation}
          variant="default"
          disabled={!userLocation}
          className="flex items-center gap-2"
        >
          Tìm trạm gần nhất
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="h-[500px] rounded-lg overflow-hidden border border-gray-200">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapUpdater stations={stations} userLocation={userLocation || undefined} />

          {/* Render station markers */}
          {validStations.map((station) => (
            <Marker
              key={station._id}
              position={[station.lat!, station.lng!]}
              icon={stationIcons[station.status as keyof typeof stationIcons]}
            >
              <Popup>
                <div className="flex flex-col gap-2">
                  <h3 className="font-bold text-lg">{station.name}</h3>
                  {station.address && (
                    <p className="text-sm text-gray-600">{station.address}</p>
                  )}
                  <Button
                    onClick={() => onSelectStation(station._id)}
                    className="w-full mt-2"
                    variant={selectedStationId === station._id ? "default" : "outline"}
                  >
                    {selectedStationId === station._id ? 'Đã chọn' : 'Chọn trạm này'}
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Render user location if available */}
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">Vị trí của bạn</p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {nearestStation && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <p className="font-semibold">Trạm gần nhất: {nearestStation.name}</p>
          {nearestStation.address && (
            <p className="text-sm mt-1">{nearestStation.address}</p>
          )}
        </div>
      )}
    </div>
  );
}