export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Detection {
  id: string;
  label: string;
  confidence: number;
  bbox: BoundingBox;
}

export interface ModelState {
  status: 'loading' | 'loaded' | 'error';
  error?: string;
}
