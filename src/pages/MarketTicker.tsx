import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  TrendingUp, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Calculator, 
  DollarSign, 
  Sparkles, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Legend
} from 'recharts';
import type { MandiRecord, PriceTrendPoint } from '../types/market.js';

export const MarketTicker: React.FC = () => {
  const [allRecords, setAllRecords] = useState<MandiRecord[]>([]);
  const [commodityTrends, setCommodityTrends] = useState<Record<string, PriceTrendPoint[]>>({});
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [sortField, setSortField] = useState<'modalPrice' | 'commodity' | 'market'>('modalPrice');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Selected crop for trend chart
  const [trendCrop, setTrendCrop] = useState('Wheat');

  // Profit Calculator State
  const [calcCommodity, setCalcCommodity] = useState('Tomato');
  const [quantityQuintals, setQuantityQuintals] = useState<number>(50);
  const [benchmarkPrice, setBenchmarkPrice] = useState<number>(1250);
  const [middlemanCutPercent, setMiddlemanCutPercent] = useState<number>(25);
  const [directPremiumPercent, setDirectPremiumPercent] = useState<number>(5);
  const [transportCostPerQ, setTransportCostPerQ] = useState<number>(60);

  useEffect(() => {
    async function loadMarketData() {
      try {
        const res = await axios.get('/api/market');
        if (res.data?.success && res.data?.data) {
          const records = res.data.data.records || [];
          setAllRecords(records);
          const trends = res.data.data.commodityTrends || {};
          setCommodityTrends(trends);

          // Default trend crop
          const availableCrops = Object.keys(trends);
          if (availableCrops.length > 0) {
            setTrendCrop(availableCrops[0]);
          }

          // Initial calculator defaults
          if (records.length > 0) {
            const first = records[0];
            setCalcCommodity(first.commodity);
            setBenchmarkPrice(first.modalPrice);
          }
        }
      } catch (err) {
        console.error('Market data load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMarketData();
  }, []);

  // Filter states list
  const stateOptions = useMemo(() => {
    const set = new Set<string>();
    allRecords.forEach(r => { if (r.state) set.add(r.state); });
    return ['All', ...Array.from(set).sort()];
  }, [allRecords]);

  // Filtered & Sorted Mandi Records
  const filteredRecords = useMemo(() => {
    let result = allRecords.filter(r => {
      const matchSearch = searchTerm === '' ||
        r.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.market.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.district.toLowerCase().includes(searchTerm.toLowerCase());

      const matchState = selectedState === 'All' || r.state === selectedState;
      return matchSearch && matchState;
    });

    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'modalPrice') {
        comparison = a.modalPrice - b.modalPrice;
      } else if (sortField === 'commodity') {
        comparison = a.commodity.localeCompare(b.commodity);
      } else if (sortField === 'market') {
        comparison = a.market.localeCompare(b.market);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [allRecords, searchTerm, selectedState, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage]);

  // Chart data for selected trend crop
  const trendData = useMemo(() => {
    const list = commodityTrends[trendCrop] || [];
    return list.map((item, idx) => ({
      date: item.date || `Day ${idx + 1}`,
      modalPrice: item.modalPrice,
      minPrice: item.minPrice,
      maxPrice: item.maxPrice
    }));
  }, [commodityTrends, trendCrop]);

  // Handle row click to populate calculator
  const populateCalculatorFromRow = (item: MandiRecord) => {
    setCalcCommodity(item.commodity);
    setBenchmarkPrice(item.modalPrice);
    // Smooth scroll to calculator
    const el = document.getElementById('profit-calculator-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Calculator dynamic calculations
  const calcResults = useMemo(() => {
    const middlemanPricePerQ = Math.round(benchmarkPrice * (1 - middlemanCutPercent / 100));
    const middlemanGrossPayout = quantityQuintals * middlemanPricePerQ;

    const directPricePerQ = Math.round(benchmarkPrice * (1 + directPremiumPercent / 100));
    const directGrossRevenue = quantityQuintals * directPricePerQ;
    const totalTransportCost = quantityQuintals * transportCostPerQ;
    const netDirectRevenue = directGrossRevenue - totalTransportCost;

    const netExtraProfit = netDirectRevenue - middlemanGrossPayout;
    const percentGain = middlemanGrossPayout > 0 
      ? Math.round((netExtraProfit / middlemanGrossPayout) * 1000) / 10 
      : 0;

    return {
      middlemanPricePerQ,
      middlemanGrossPayout,
      directPricePerQ,
      directGrossRevenue,
      totalTransportCost,
      netDirectRevenue,
      netExtraProfit,
      percentGain
    };
  }, [quantityQuintals, benchmarkPrice, middlemanCutPercent, directPremiumPercent, transportCostPerQ]);

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Live Mandi Market Ticker & Profit Intelligence
          </h1>
          <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold">
            APMC Real Feed
          </span>
        </div>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Explore spot prices across {allRecords.length.toLocaleString()} verified Mandi listings, examine historical modal trends, and benchmark your fair direct margin.
        </p>
      </div>

      {/* SECTION 1: Interactive Direct vs. Middleman Profit Calculator */}
      <div id="profit-calculator-section" className="glass-card rounded-3xl p-6 md:p-8 border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-md shadow-amber-500/10">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Direct Buyer vs. Middleman Profit Calculator
              </h2>
              <p className="text-xs text-slate-400">
                See exactly how much more money reaches your pocket by bypassing middleman broker discounts.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold w-fit">
            RythuMitra Direct Advantage
          </span>
        </div>

        {/* Input Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Commodity Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Selected Crop / Commodity:</label>
            <input
              type="text"
              value={calcCommodity}
              onChange={(e) => setCalcCommodity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. Tomato, Wheat, Onion"
            />
          </div>

          {/* Quantity in Quintals */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-300">Quantity (Quintals):</label>
              <span className="text-emerald-400 font-bold font-mono">{quantityQuintals} Quintals ({quantityQuintals * 100} kg)</span>
            </div>
            <input
              type="range"
              min="5"
              max="500"
              step="5"
              value={quantityQuintals}
              onChange={(e) => setQuantityQuintals(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          {/* Benchmark Mandi Modal Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">APMC Mandi Modal Price (₹/Q):</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">₹</span>
              <input
                type="number"
                value={benchmarkPrice}
                onChange={(e) => setBenchmarkPrice(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
              />
            </div>
          </div>

          {/* Middleman Deduction Cut */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-300">Middleman Broker Cut:</label>
              <span className="text-rose-400 font-bold font-mono">{middlemanCutPercent}% deduction</span>
            </div>
            <input
              type="range"
              min="10"
              max="45"
              step="1"
              value={middlemanCutPercent}
              onChange={(e) => setMiddlemanCutPercent(Number(e.target.value))}
              className="w-full accent-rose-500"
            />
            <p className="text-[11px] text-slate-500">Brokers typically pay ₹{calcResults.middlemanPricePerQ}/Q</p>
          </div>

          {/* AgriBridge Direct Premium */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-300">Direct Buyer Incentive / Premium:</label>
              <span className="text-emerald-400 font-bold font-mono">+{directPremiumPercent}% premium</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="1"
              value={directPremiumPercent}
              onChange={(e) => setDirectPremiumPercent(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <p className="text-[11px] text-slate-500">Direct FPO/Processor pays ₹{calcResults.directPricePerQ}/Q</p>
          </div>

          {/* Transport / Bagging Cost */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Bagging & Transport Cost (₹/Q):</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">₹</span>
              <input
                type="number"
                value={transportCostPerQ}
                onChange={(e) => setTransportCostPerQ(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-500">Total freight deduction: ₹{calcResults.totalTransportCost.toLocaleString()}</p>
          </div>
        </div>

        {/* Comparison Result Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
          {/* Middleman Card */}
          <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Traditional Middleman</span>
              <span className="text-xs text-rose-400 font-mono">-{middlemanCutPercent}% cut</span>
            </div>
            <div className="text-2xl font-black text-rose-300">
              ₹{calcResults.middlemanGrossPayout.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 space-y-1">
              <p>• Effective rate: ₹{calcResults.middlemanPricePerQ}/Q</p>
              <p>• Heavy commission deductions</p>
              <p>• Delayed cash realization</p>
            </div>
          </div>

          {/* AgriBridge Direct Card */}
          <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-3 shadow-lg shadow-emerald-500/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">RythuMitra Direct Channel</span>
              <span className="text-xs text-emerald-400 font-mono">+{directPremiumPercent}% premium</span>
            </div>
            <div className="text-2xl font-black text-emerald-300">
              ₹{calcResults.netDirectRevenue.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 space-y-1">
              <p>• Gross: ₹{calcResults.directGrossRevenue.toLocaleString()} (₹{calcResults.directPricePerQ}/Q)</p>
              <p>• Bagging & transport: -₹{calcResults.totalTransportCost.toLocaleString()}</p>
              <p>• Direct UPI/Bank settlement</p>
            </div>
          </div>

          {/* Big Pocket Gain Hero */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-emerald-900/20 border border-amber-500/40 space-y-2 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Farmer's Extra Pocket Gain</span>
              </div>
              <div className="text-3xl font-black text-white mt-2">
                +₹{calcResults.netExtraProfit.toLocaleString()}
              </div>
              <div className="text-xs font-bold text-emerald-400 mt-1">
                +{calcResults.percentGain}% Higher Net Profit
              </div>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed pt-2 border-t border-slate-800">
              By selling {quantityQuintals} Quintals of {calcCommodity} directly through RythuMitra, you keep an extra ₹{calcResults.netExtraProfit.toLocaleString()} for your family.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: Daily Price Trends Interactive Chart */}
      <div className="glass-card rounded-3xl p-6 md:p-8 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>APMC Daily Mandi Price Trends</span>
            </h2>
            <p className="text-xs text-slate-400">
              Historical spot pricing fluctuations (Min, Max, and Modal Price)
            </p>
          </div>

          {/* Commodity Selector Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {Object.keys(commodityTrends).slice(0, 7).map((crop) => (
              <button
                key={crop}
                onClick={() => setTrendCrop(crop)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  trendCrop === crop
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {crop}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-72 w-full pt-2">
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="modalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="maxGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}/Q`]}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="modalPrice" name="Modal Price" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#modalGradient)" />
                <Area type="monotone" dataKey="maxPrice" name="Max Price" stroke="#f59e0b" strokeWidth={1.5} fillOpacity={1} fill="url(#maxGradient)" />
                <Area type="monotone" dataKey="minPrice" name="Min Price" stroke="#64748b" strokeWidth={1.5} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              No trend data available for this commodity.
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: Searchable Mandi Price Table */}
      <div className="glass-card rounded-3xl p-6 md:p-8 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Real-Time APMC Mandi Records ({filteredRecords.length.toLocaleString()} matching)
            </h2>
            <p className="text-xs text-slate-400">
              Click any commodity row to immediately calculate your direct profit advantage above.
            </p>
          </div>

          {/* Search & State Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Search crop, mandi, district..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={selectedState}
              onChange={(e) => { setSelectedState(e.target.value); setCurrentPage(1); }}
              className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {stateOptions.map((st) => (
                <option key={st} value={st}>{st === 'All' ? 'All States' : st}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3 cursor-pointer" onClick={() => { setSortField('commodity'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                  <div className="flex items-center space-x-1">
                    <span>Commodity</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer" onClick={() => { setSortField('market'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                  <div className="flex items-center space-x-1">
                    <span>Market & District</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">State</th>
                <th className="py-3 px-3">Variety / Grade</th>
                <th className="py-3 px-3 text-right">Min Price</th>
                <th className="py-3 px-3 text-right">Max Price</th>
                <th className="py-3 px-3 text-right cursor-pointer" onClick={() => { setSortField('modalPrice'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Modal Price</span>
                    <ArrowUpDown className="w-3 h-3 text-emerald-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedRecords.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-semibold text-white">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>{item.commodity}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    <div>{item.market}</div>
                    <div className="text-[11px] text-slate-500">{item.district}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-xs">{item.state}</td>
                  <td className="py-3 px-3 text-xs text-slate-400">
                    <span className="bg-slate-800 px-2 py-0.5 rounded-md font-mono">{item.variety}</span>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-400 text-xs">₹{item.minPrice.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right text-slate-400 text-xs">₹{item.maxPrice.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-400 text-sm">
                    ₹{item.modalPrice.toLocaleString()}/Q
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => populateCalculatorFromRow(item)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-xs font-semibold transition"
                    >
                      Calculate Cut
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length.toLocaleString()} entries
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-2 font-mono font-bold text-white">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
