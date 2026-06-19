// Automatic mock for react-map-gl/maplibre. Renders lightweight DOM so map
// components can be tested in jsdom, and exposes a clickable surface that
// fires `onClick` with a synthetic MapLibre event (`lngLat`).
import type { ReactNode, Ref } from "react";

type MapProps = {
  children?: ReactNode;
  onClick?: (event: { lngLat: { lng: number; lat: number } }) => void;
  // React 19 passes ref as a regular prop — no forwardRef needed.
  ref?: Ref<HTMLDivElement>;
};

export default function Map({ children, onClick, ref }: MapProps) {
  return (
    <div ref={ref} data-testid="map">
      <button
        type="button"
        data-testid="map-click"
        onClick={() => onClick?.({ lngLat: { lng: -58.38, lat: -34.6 } })}
      >
        map
      </button>
      {children}
    </div>
  );
}

export function Marker({ children }: { children?: React.ReactNode }) {
  return <div data-testid="marker">{children}</div>;
}

export function Popup({ children }: { children?: React.ReactNode }) {
  return <div data-testid="popup">{children}</div>;
}

export function NavigationControl() {
  return <div data-testid="nav-control" />;
}

export function Source({ children }: { children?: React.ReactNode }) {
  return <div data-testid="source">{children}</div>;
}

export function Layer() {
  return <div data-testid="layer" />;
}
