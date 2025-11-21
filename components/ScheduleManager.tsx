
import React, { useState } from 'react';
import { Shift, Employee, Department, ShiftType } from '../types';
import { Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

interface ScheduleManagerProps {
  shifts: Shift[];
  staff: Employee[];
  onAddShift: (shift: Omit<Shift, 'id'>) => void;
}

const ScheduleManager: React.FC<ScheduleManagerProps> = ({ shifts, staff, onAddShift }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterDept, setFilterDept] = useState<string>('All');

  const daysInWeek = 7;
  const weekStart = new Date(selectedDate);
  weekStart.setDate(selectedDate.getDate() - selectedDate.getDay()); // Start Sunday

  const weekDays = Array.from({ length: daysInWeek }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const getShiftsForDate = (dateStr: string) => {
    return shifts.filter(s => {
        const employee = staff.find(e => e.id === s.employeeId);
        return s.date === dateStr && 
            (filterDept === 'All' || employee?.department === filterDept);
    });
  };

  const handlePrevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-slate-900">Weekly Schedule</h2>
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
                <button onClick={handlePrevWeek} className="p-1 hover:bg-white rounded shadow-sm transition-all"><ChevronLeft size={16} className="text-slate-600"/></button>
                <span className="px-3 text-sm font-medium text-slate-700">
                    {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <button onClick={handleNextWeek} className="p-1 hover:bg-white rounded shadow-sm transition-all"><ChevronRight size={16} className="text-slate-600"/></button>
            </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="relative">
              <Filter size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <select 
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
              >
                <option value="All">All Departments</option>
                {Object.values(Department).map(d => (
                    <option key={d} value={d}>{d}</option>
                ))}
              </select>
           </div>
           <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
             <Plus size={16} />
             Add Shift
           </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-x-auto">
        <div className="min-w-[1000px]">
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                {weekDays.map((day, i) => (
                    <div key={i} className="p-4 text-center border-r border-slate-200 last:border-r-0">
                        <p className="text-xs font-semibold text-slate-500 uppercase">{day.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                        <p className={`text-lg font-bold mt-1 ${day.toDateString() === new Date().toDateString() ? 'text-blue-600 bg-blue-50 inline-block w-8 h-8 rounded-full leading-8' : 'text-slate-900'}`}>
                            {day.getDate()}
                        </p>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 h-[600px]">
                {weekDays.map((day, i) => {
                    const dateStr = day.toISOString().split('T')[0];
                    const dayShifts = getShiftsForDate(dateStr);
                    return (
                        <div key={i} className="border-r border-slate-200 last:border-r-0 p-2 space-y-2 bg-white overflow-y-auto custom-scrollbar">
                            {dayShifts.map(shift => {
                                const person = staff.find(s => s.id === shift.employeeId);
                                const typeColor = shift.type === ShiftType.MORNING ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                                                  shift.type === ShiftType.AFTERNOON ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                                  'bg-indigo-50 text-indigo-700 border-indigo-200';
                                
                                return (
                                    <div key={shift.id} className={`p-2 rounded border ${typeColor} text-xs cursor-pointer hover:opacity-80 transition-opacity`}>
                                        <div className="font-semibold">{shift.type}</div>
                                        <div className="mt-1 flex items-center gap-1">
                                            <img src={person?.avatar} className="w-4 h-4 rounded-full" alt=""/>
                                            <span className="truncate">{person?.name.split(' ')[0]}</span>
                                        </div>
                                        <div className="mt-1 opacity-75 text-[10px]">{person?.department}</div>
                                    </div>
                                )
                            })}
                            {dayShifts.length === 0 && (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-slate-300 text-xs italic">No shifts</p>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleManager;
