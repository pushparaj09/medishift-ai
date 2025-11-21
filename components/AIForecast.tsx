
import React, { useEffect, useState } from 'react';
import { Shift, Employee, ForecastDataPoint, Department } from '../types';
import { generateStaffingForecast } from '../services/geminiService';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Brain, Sparkles, Loader2, TrendingUp } from 'lucide-react';

interface AIForecastProps {
  shifts: Shift[];
  staff: Employee[];
}

const AIForecast: React.FC<AIForecastProps> = ({ shifts, staff }) => {
  const [forecast, setForecast] = useState<ForecastDataPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true);
      try {
        // Using ER as default department for the demo component
        const today = new Date().toISOString().split('T')[0];
        const response = await generateStaffingForecast(Department.ER, today);
        setForecast(response.data);
      } catch (err) {
        console.error("Failed to fetch forecast", err);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
           <Brain size={150} />
        </div>
        <div className="relative z-10 max-w-2xl">
           <div className="flex items-center gap-2 mb-2">
             <Sparkles className="text-yellow-300" size={20} />
             <span className="text-blue-100 font-medium tracking-wide text-sm uppercase">MediShift Intelligence</span>
           </div>
           <h2 className="text-3xl font-bold mb-3">Staffing Demand Forecast</h2>
           <p className="text-blue-100 text-lg">
             AI-driven predictions for the upcoming week to help you optimize resource allocation and prevent shortages.
           </p>
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-100">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
          <p className="text-slate-500">Analyzing historical patterns & generating prediction...</p>
        </div>
      ) : (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-blue-600"/>
                        Predicted Patient Load & Staffing Needs
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={forecast} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorStaff" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} stroke="#94a3b8" fontSize={12} />
                                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} />
                                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} />
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Legend />
                                <Area yAxisId="left" type="monotone" dataKey="predictedDemand" name="Predicted Load Index" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLoad)" strokeWidth={3} />
                                <Area yAxisId="right" type="monotone" dataKey="requiredStaff" name="Rec. Staff Count" stroke="#10b981" fillOpacity={1} fill="url(#colorStaff)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Daily Data Points</h3>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {forecast.map((day, idx) => (
                            <div key={idx} className="p-4 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-semibold text-slate-700 text-sm">{day.date}</span>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${day.predictedDemand > 75 ? 'bg-red-100 text-red-700' : day.predictedDemand > 50 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                        {day.predictedDemand > 75 ? 'High Load' : day.predictedDemand > 50 ? 'Moderate' : 'Low Load'}
                                    </span>
                                </div>
                                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 font-medium">
                                    <span>Req Staff: {day.requiredStaff}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
      )}
    </div>
  );
};

export default AIForecast;
