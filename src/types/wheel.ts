export interface Metric {
  id: string;
  name: string;
  score: number; // 0-10
  subWheel?: SubWheel;
}

export interface SubWheel {
  metrics: Metric[];
}

export interface WheelData {
  mainWheel: {
    metrics: Metric[];
  };
}

