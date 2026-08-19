// Ambient declarations for globals injected by vendor scripts.
//
// MapLibre is vendored at /vendor/maplibre-gl.js and loaded by a plain <script>
// tag rather than bundled, so esbuild leaves `maplibregl` alone and the bundle
// stays small. These declarations give TypeScript the types anyway.

declare const maplibregl: typeof import('maplibre-gl');
// Namespace merges with the const so `maplibregl.Foo` works in type positions.
declare namespace maplibregl {
  type Map = import('maplibre-gl').Map;
  type GeoJSONSource = import('maplibre-gl').GeoJSONSource;
  type Marker = import('maplibre-gl').Marker;
  type NavigationControl = import('maplibre-gl').NavigationControl;
  type Popup = import('maplibre-gl').Popup;
}
