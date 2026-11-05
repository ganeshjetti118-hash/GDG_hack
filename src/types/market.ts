export interface MandiRecord {
  id?: string;
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  minPrice: number; // in ₹ per Quintal
  maxPrice: number;
  modalPrice: number;
  priceDate: string;
}

export interface ProfitComparison {
  commodity: string;
  quantityQuintals: number;
  benchmarkModalPrice: number;
  middlemanOfferPrice: number;
  directBuyerPrice: number;
  middlemanRevenue: number;
  directGrossRevenue: number;
  transportBaggingCost: number;
  middlemanCommissionSaved: number;
  netDirectRevenue: number;
  extraProfit: number;
  percentGain: number;
}

export interface PriceTrendPoint {
  date: string;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
}

export interface MarketFilter {
  search: string;
  state: string;
  commodity: string;
  sortBy: 'modalPrice' | 'commodity' | 'market' | 'priceDate';
  sortOrder: 'asc' | 'desc';
}
