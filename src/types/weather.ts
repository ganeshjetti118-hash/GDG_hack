export type RiskType = 'fungal' | 'heatwave' | 'drought' | 'flood' | 'frost' | 'pest' | 'wind';
export type RiskSeverity = 'low' | 'moderate' | 'high' | 'critical';

export interface MicroClimateRecord {
  id?: string;
  date: string;
  city: string;
  state: string;
  tempMax: number;
  tempMin: number;
  tempAvg: number;
  humidity: number; // %
  rainfall: number; // mm
  windSpeed: number; // km/h
  aqi: number;
  aqiCategory: string;
  pressure: number; // hPa
  cloudCover: number; // %
  soilMoisture: number; // 0-10cm (%)
}

export interface WeatherForecastDay {
  date: string;
  dayOfWeek: string;
  tempMax: number;
  tempMin: number;
  tempAvg: number;
  humidity: number;
  rainfall: number;
  soilMoisture: number;
  condition: string;
  iconName: string;
}

export interface AgriRiskAlert {
  id: string;
  type: RiskType;
  title: string;
  severity: RiskSeverity;
  description: string;
  actionableAdvice: string[];
  affectedCrops: string[];
  issuedAt: string;
  location: string;
}
