import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Create custom colored markers with SVG icons
const createCustomIcon = (color, label = '') => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: 11px;
          font-weight: bold;
          font-family: sans-serif;
        ">
          ${label}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -28],
  });
};

const donorIcon = createCustomIcon('#16A34A', '🍲');
const receiverIcon = createCustomIcon('#2563EB', '🏠');
const partnerIcon = createCustomIcon('#D97706', '🛵');
const activeDeliveryIcon = createCustomIcon('#059669', '📦');

export function MapView({
  center = [22.7244, 75.8824], // Indore center
  zoom = 13,
  markers = [],
  routeCoordinates = [],
  height = '400px',
  className = '',
  interactive = true,
}) {
  return (
    <div
      style={{ height }}
      className={`w-full rounded-2xl overflow-hidden border border-surface-border shadow-soft relative z-10 ${className}`}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={interactive}
        dragging={interactive}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route Polyline if provided */}
        {routeCoordinates && routeCoordinates.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{ color: '#16A34A', weight: 4, dashArray: '6, 8', opacity: 0.8 }}
          />
        )}

        {/* Markers */}
        {markers.map((m, idx) => {
          if (!m.coords || m.coords.length < 2) return null;
          // Leaflet expects [lat, lon], while GeoJSON stores [lon, lat]
          const latLng = [m.coords[1], m.coords[0]];
          const icon =
            m.type === 'DONOR'
              ? donorIcon
              : m.type === 'RECEIVER'
              ? receiverIcon
              : m.type === 'DELIVERY'
              ? activeDeliveryIcon
              : partnerIcon;

          return (
            <Marker key={idx} position={latLng} icon={icon}>
              <Popup>
                <div className="p-1 max-w-[200px] text-left">
                  <span className="text-[10px] uppercase font-bold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">
                    {m.type}
                  </span>
                  <h5 className="font-bold text-sm text-content-primary mt-1">{m.title}</h5>
                  <p className="text-xs text-content-secondary mt-0.5">{m.description}</p>
                  {m.badge && (
                    <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {m.badge}
                    </span>
                  )}
                  {m.isMasked && (
                    <p className="text-[10px] text-content-light italic mt-1">
                      🔒 Approximate location (privacy protected)
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
