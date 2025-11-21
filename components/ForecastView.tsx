
import React, { useState, useCallback } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, RefreshCw, BarChart3 } from 'lucide-react';
import { Department, ForecastResponse } from '../types';
import { generateStaffingForecast } from '../services/geminiService';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const ForecastView: React.FC = () => {
  const [selectedDept, setSelectedDept] = useState<Department>(Department.ER);
  const [isLoading, setIsLoading] = useState(false);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);

  const handleGenerateForecast = useCallback(async () => {
    setIsLoading(true);
    const today = new Date().toISOString().split('T')[0];
    try {
      const data = await generateStaffingForecast(selectedDept, today);
      setForecast(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDept]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-xl">
                <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            AI Forecast
          </h2>
          <p className="text-slate-500 mt-2 font-medium ml-14">Predictive analytics & resource optimization engine</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
          <select 
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value as Department)}
            className="px-4 py-2.5 rounded-xl bg-slate-50 border-transparent hover:bg-slate-100 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer"
          >
            {Object.values(Department).map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <button
            onClick={handleGenerateForecast}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 disabled:opacity-70 shadow-lg shadow-purple-200 transition-all hover:-translate-y-0.5"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isLoading ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </div>
      </div>

      {!forecast && !isLoading && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-16 flex flex-col items-center justify-center text-center h-[500px] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-50"></div>
          <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mb-8 relative z-10 animate-bounce-slow">
            <BarChart3 className="w-10 h-10 text-purple-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3 relative z-10">Ready to Forecast</h3>
          <p className="text-slate-500 max-w-md font-medium relative z-10">
            Select a department above to generate an AI-powered staffing prediction based on historical data and trends.
          </p>
        </div>
      )}

      {isLoading && (
         <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-16 flex flex-col items-center justify-center text-center h-[500px]">
            <div className="relative">
                <div className="w-20 h-20 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin mb-8"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Crunching Numbers</h3>
            <p className="text-slate-500 mt-2 font-medium">Analyzing patient flow for {selectedDept}...</p>
         </div>
      )}

      {forecast && !isLoading && (
        <div className="space-y-8 animate-slide-up">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Analysis Card */}
            <div className="lg:col-span-3 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl shadow-xl shadow-indigo-200 p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-10 transform rotate-12 scale-150">
                <Sparkles className="w-64 h-64" />
              </div>
              <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                        <Sparkles className="w-5 h-5 text-white" /> 
                    </div>
                    <h3 className="text-xl font-bold">AI Strategic Insight</h3>
                  </div>
                  <p className="text-indigo-50 leading-relaxed text-lg font-medium max-w-4xl">
                    {forecast.analysis}
                  </p>
              </div>
            </div>

            {/* Charts */}
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-bold text-slate-900">Demand vs Capacity</h3>
                 <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="flex items-center gap-1 text-purple-600"><div className="w-2 h-2 rounded-full bg-purple-600"></div> Demand</span>
                    <span className="flex items-center gap-1 text-slate-400"><div className="w-2 h-2 rounded-full bg-slate-400"></div> Baseline</span>
                 </div>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecast.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                        dataKey="date" 
                        stroke="#94a3b8" 
                        fontSize={12} 
                        tickMargin={10}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', {weekday: 'short'})} 
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                      labelStyle={{ color: '#1e293b', fontWeight: 'bold', marginBottom: '5px' }}
                      cursor={{stroke: '#e2e8f0'}}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="predictedDemand" 
                        stroke="#8b5cf6" 
                        strokeWidth={4} 
                        dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#8b5cf6' }} 
                        activeDot={{ r: 8, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 3 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-8">Staffing Gaps</h3>
              <div className="h-[350px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={forecast.data} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                        dataKey="date" 
                        stroke="#94a3b8" 
                        fontSize={12} 
                        tickMargin={10}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', {weekday: 'short'})} 
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                         cursor={{fill: '#f8fafc'}}
                         contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                     />
                    <Bar dataKey="requiredStaff" name="Required" fill="#3b82f6" radius={[6, 6, 6, 6]} />
                    <Bar dataKey="currentScheduled" name="Scheduled" fill="#e2e8f0" radius={[6, 6, 6, 6]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Table View */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="px-8 py-6 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Daily Breakdown</h3>
             </div>
             <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs">
                    <tr>
                        <th className="px-8 py-4">Date</th>
                        <th className="px-8 py-4">Demand Index</th>
                        <th className="px-8 py-4">Required Staff</th>
                        <th className="px-8 py-4">Scheduled</th>
                        <th className="px-8 py-4">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {forecast.data.map((day, i) => {
                        const gap = day.requiredStaff - day.currentScheduled;
                        return (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-5 font-bold text-slate-700">
                                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 bg-slate-100 rounded-full h-1.5">
                                            <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${day.predictedDemand}%` }}></div>
                                        </div>
                                        <span className="text-slate-600 font-medium">{day.predictedDemand}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-slate-600 font-medium">{day.requiredStaff}</td>
                                <td className="px-8 py-5 text-slate-600 font-medium">{day.currentScheduled}</td>
                                <td className="px-8 py-5">
                                    {gap > 0 ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-600">
                                            <AlertTriangle className="w-3 h-3" />
                                            Shortage (-{gap})
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-600">
                                            Optimal
                                        </span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
             </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForecastView;
