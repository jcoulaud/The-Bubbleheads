export interface Position {
  x: number;
  y: number;
}

export interface HelmetConfig {
  position: Position;
  scale: number;
}

export interface CanvasRenderOptions {
  userImage: string;
  helmetPosition: Position;
  helmetScale: number;
  useBackground: boolean;
  canvas: HTMLCanvasElement;
  containerSize?: number;
}

export interface ImageDimensions {
  width: number;
  height: number;
}
