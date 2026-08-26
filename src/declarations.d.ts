declare module '@svg-maps/india' {
  export interface SVGMapLocation {
    id: string;
    name: string;
    path: string;
  }

  export interface SVGMap {
    viewBox: string;
    locations: SVGMapLocation[];
    label: string;
  }

  const India: SVGMap;
  export default India;
}
