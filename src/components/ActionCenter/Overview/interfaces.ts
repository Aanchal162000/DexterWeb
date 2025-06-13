export interface KPICardProps {
  title: string;
  todayValue: number;
  todayChange: number;
  allTimeValue: number;
  isCurrency?: boolean;
}

export interface ChartDataPoint {
  date: string;
  volume: number;
  virgenPoints: number;
  transactions: number;
}

export interface KPIData {
  title: string;
  todayValue: number;
  todayChange: number;
  allTimeValue: number;
  isCurrency?: boolean;
}

export interface OverviewData {
  volumeData: KPIData;
  virgenPointsData: KPIData;
  chartData: ChartDataPoint[];
}
