

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Moon, Sun, Sunrise, Wand2, ArrowRightLeft, Search, Filter, Siren, Calendar, Activity, ChevronDown, Stethoscope, MapPin, X, Navigation, Phone } from 'lucide-react';
import { Employee, Shift, ShiftType, Role, ShiftSwapRequest, Department, EmployeeStatus } from '../types';

interface ScheduleGridProps {
  employees: Employee[];
  shifts: Shift[];
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
  swapRequests: ShiftSwapRequest[];
  setSwapRequests: React.Dispatch<React.SetStateAction<ShiftSwapRequest[]>>;
  onNotify: (title: string, message: string, type: 'info' | 'warning' | 'success' | 'error') => void;
  onSendNotification: (targetUserId: string, title: string, message: string, type: 'system' | 'alert' | 'success') => void;
  onStatusChange: (id: string, status: EmployeeStatus) => void;
  currentUser: Employee;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ 
  employees, 
  shifts, 
  setShifts, 
  swapRequests, 
  setSwapRequests, 
  onNotify,
  onSendNotification,
  onStatusChange,
  currentUser
}) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [isSwapMode, setIsSwapMode] = useState(false);
  const [swapSource, setSwapSource] = useState<{employeeId: string, date: string, type: ShiftType} | null>(null);
  
  // Emergency Modal State
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<Role | 'All'>('All');
  const [filterDept, setFilterDept] = useState<Department | 'All'>('All');

  const getDaysOfWeek = (startDate: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() - startDate.getDay() + 1 + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getDaysOfWeek(currentWeekStart);

  // Memoized Filters for Performance
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'All' || emp.role === filterRole;
        const matchesDept = filterDept === 'All' || emp.department === filterDept;
        return matchesSearch && matchesRole && matchesDept;
      });
  }, [employees, searchTerm, filterRole, filterDept]);

  // Live Status Stats for Summary Bar
  const statusStats = useMemo(() => {
    return {
        available: employees.filter(e => e.currentStatus === EmployeeStatus.AVAILABLE).length,
        surgery: employees.filter(e => e.currentStatus === EmployeeStatus.IN_SURGERY).length,
        break: employees.filter(e => e.currentStatus === EmployeeStatus.ON_BREAK).length,
    };
  }, [employees]);

  const handleEmergencyBroadcast = () => {
     setIsEmergencyModalOpen(true);
  };

  // Calculate Emergency Staff Logic
  const emergencyAvailableStaff = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return employees
        .filter(emp => {
            // Find staff who are NOT in surgery and NOT busy
            // Or staff who are OFF today
            const shiftToday = shifts.find(s => s.employeeId === emp.id && s.date === todayStr);
            const isWorking = shiftToday && shiftToday.type !== ShiftType.OFF;
            
            // Eligibility: 
            // 1. Off duty today OR
            // 2. Working but marked as 'Available'
            if (emp.currentStatus === EmployeeStatus.IN_SURGERY) return false;
            
            return !isWorking || emp.currentStatus === EmployeeStatus.AVAILABLE;
        })
        .sort((a, b) => a.distanceFromHospital - b.distanceFromHospital); // Sort by distance
  }, [employees, shifts]);

  const handleAutoFill = () => {
    let tempShifts = [...shifts];
    let filledCount = 0;
    let coverageWarnings: string[] = [];

    weekDays.forEach(day => {
      const dateStr = day.toISOString().split('T')[0];
      const doctors = employees.filter(e => e.role === Role.DOCTOR);
      
      const doctorsOff = doctors.filter(d => {
        const s = tempShifts.find(shift => shift.employeeId === d.id && shift.date === dateStr);
        return s?.type === ShiftType.OFF;
      });

      let doctorsWorking = doctors.filter(d => {
        const s = tempShifts.find(shift => shift.employeeId === d.id && shift.date === dateStr);
        return s && s.type !== ShiftType.OFF;
      });

      let availableDoctors = doctors.filter(d => {
        return !tempShifts.find(shift => shift.employeeId === d.id && shift.date === dateStr);
      });

      if (doctorsWorking.length === 0) {
        if (availableDoctors.length > 0) {
            const docToAssign = availableDoctors[0];
            const newShift: Shift = {
                id: Math.random().toString(36).substr(2, 9),
                employeeId: docToAssign.id,
                date: dateStr,
                type: ShiftType.MORNING
            };
            tempShifts.push(newShift);
            filledCount++;
            availableDoctors = availableDoctors.filter(d => d.id !== docToAssign.id);
            doctorsWorking.push(docToAssign);
        } else if (doctorsOff.length > 0 || doctors.length > 0) {
             coverageWarnings.push(dateStr);
        }
      }

      const employeesWithoutShift = employees.filter(e => 
        !tempShifts.find(s => s.employeeId === e.id && s.date === dateStr)
      );

      employeesWithoutShift.forEach(emp => {
        const types = [ShiftType.MORNING, ShiftType.AFTERNOON, ShiftType.NIGHT];
        const typeIndex = (emp.name.length + day.getDate()) % 3;
        
        tempShifts.push({
            id: Math.random().toString(36).substr(2, 9),
            employeeId: emp.id,
            date: dateStr,
            type: types[typeIndex]
        });
        filledCount++;
      });
    });

    setShifts(tempShifts);

    if (coverageWarnings.length > 0) {
        const dates = coverageWarnings.map(d => new Date(d).toLocaleDateString('en-US', {weekday: 'short', month: 'numeric', day: 'numeric'})).join(', ');
        onNotify(
            "Coverage Alert", 
            `Insufficient doctor coverage for: ${dates}. All available doctors are marked OFF.`, 
            "error"
        );
    } else if (filledCount > 0) {
        onNotify("Schedule Optimized", `Auto-filled ${filledCount} shifts. Priority given to filling doctor shortages.`, "success");
    } else {
        onNotify("No Changes", "Schedule is already fully populated.", "info");
    }
  };

  const handleShiftChange = (employeeId: string, date: string, newType: ShiftType) => {
    setShifts(prev => {
      const filtered = prev.filter(s => !(s.employeeId === employeeId && s.date === date));
      return [...filtered, { id: Math.random().toString(36), employeeId, date, type: newType }];
    });

    if (newType === ShiftType.OFF) {
      const emp = employees.find(e => e.id === employeeId);
      if (emp && emp.role === Role.DOCTOR) {
        onNotify(
          "Schedule Alert: Doctor Unavailable",
          `Dr. ${emp.name} has been marked OFF for ${date}. Please ensure shift coverage.`,
          "warning"
        );
      }
    }
  };

  const handleCellClick = (employeeId: string, date: string, type: ShiftType) => {
    if (!isSwapMode) return;

    if (!swapSource) {
      setSwapSource({ employeeId, date, type });
      onNotify("Swap Source Selected", "Now select the target shift to propose a swap.", "info");
    } else {
      if (swapSource.employeeId === employeeId && swapSource.date === date) {
        setSwapSource(null);
        onNotify("Selection Cancelled", "Swap source selection cleared.", "info");
        return;
      }

      const newRequest: ShiftSwapRequest = {
        id: Math.random().toString(36).substr(2, 9),
        requestingEmployeeId: swapSource.employeeId,
        targetEmployeeId: employeeId,
        requestingDate: swapSource.date,
        targetDate: date,
        requestingShiftType: swapSource.type,
        targetShiftType: type,
        status: 'Pending'
      };

      setSwapRequests(prev => [...prev, newRequest]);
      setSwapSource(null);
      setIsSwapMode(false);
      onNotify("Swap Proposed", "Shift swap request has been created and is pending approval.", "success");
    }
  };

  const handleApproveSwap = (request: ShiftSwapRequest) => {
    const newShifts = shifts.filter(s => 
      !(s.employeeId === request.requestingEmployeeId && s.date === request.requestingDate) &&
      !(s.employeeId === request.targetEmployeeId && s.date === request.targetDate)
    );

    const addShift = (empId: string, date: string, type: ShiftType) => {
        newShifts.push({ id: Math.random().toString(36), employeeId: empId, date: date, type: type });
    };

    addShift(request.requestingEmployeeId, request.targetDate, request.targetShiftType);
    addShift(request.targetEmployeeId, request.requestingDate, request.requestingShiftType);

    setShifts(newShifts);
    setSwapRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'Approved' } : r));
    
    // Get details for notification
    const reqEmp = employees.find(e => e.id === request.requestingEmployeeId);
    const targetEmp = employees.find(e => e.id === request.targetEmployeeId);

    onNotify("Swap Approved", "Shifts have been successfully exchanged.", "success");

    // Send persistent notification ONLY to the staff members (Admin doesn't see these as toasts)
    if (reqEmp) {
        onSendNotification(
            reqEmp.id,
            "Shift Swap Approved",
            `Your swap request with ${targetEmp?.name} for ${request.requestingDate} has been approved.`,
            "success"
        );
    }
    if (targetEmp) {
        onSendNotification(
            targetEmp.id,
            "Shift Swap Approved",
            `Your shift on ${request.targetDate} has been swapped with ${reqEmp?.name}.`,
            "success"
        );
    }
  };

  const handleRejectSwap = (id: string) => {
    setSwapRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
  };

  const getShiftForDay = (employeeId: string, date: string) => {
    return shifts.find(s => s.employeeId === employeeId && s.date === date)?.type || ShiftType.OFF;
  };

  const getShiftColor = (type: ShiftType) => {
    switch (type) {
      case ShiftType.MORNING: return 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200';
      case ShiftType.AFTERNOON: return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
      case ShiftType.NIGHT: return 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200';
      default: return 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100';
    }
  };

  const getShiftIcon = (type: ShiftType) => {
    switch (type) {
      case ShiftType.MORNING: return <Sunrise className="w-3.5 h-3.5" />;
      case ShiftType.AFTERNOON: return <Sun className="w-3.5 h-3.5" />;
      case ShiftType.NIGHT: return <Moon className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  const getStatusColor = (status: EmployeeStatus) => {
    switch(status) {
      case EmployeeStatus.AVAILABLE: return 'bg-emerald-500 ring-emerald-200';
      case EmployeeStatus.IN_SURGERY: return 'bg-rose-500 ring-rose-200';
      case EmployeeStatus.BUSY: return 'bg-amber-500 ring-amber-200';
      case EmployeeStatus.ON_BREAK: return 'bg-yellow-400 ring-yellow-100';
      default: return 'bg-slate-300 ring-slate-100';
    }
  };

  const pendingSwaps = swapRequests.filter(r => r.status === 'Pending');

  return (
    <div className="space-y-4 h-[calc(100vh-6rem)] flex flex-col animate-fade-in relative">
      {/* Emergency Modal */}
      {isEmergencyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-6 bg-rose-600 text-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl animate-pulse">
                            <Siren className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Emergency Response Protocol</h2>
                            <p className="text-rose-100 text-sm">Locating nearest eligible staff...</p>
                        </div>
                    </div>
                    <button onClick={() => setIsEmergencyModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-4 bg-rose-50 border-b border-rose-100 text-rose-800 text-sm font-medium flex gap-2 items-center shrink-0">
                    <Activity className="w-4 h-4" />
                    Found {emergencyAvailableStaff.length} available staff members sorted by proximity to hospital.
                </div>

                <div className="overflow-y-auto p-6 space-y-3 custom-scrollbar">
                    {emergencyAvailableStaff.map((emp) => (
                        <div key={emp.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-rose-200 hover:shadow-md transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <img src={emp.avatar} alt={emp.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" />
                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${getStatusColor(emp.currentStatus)}`}></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">{emp.name}</h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <span className="font-medium text-slate-700">{emp.role}</span>
                                        <span>•</span>
                                        <span>{emp.department}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className={`flex items-center justify-end gap-1.5 font-bold text-lg ${emp.distanceFromHospital < 5 ? 'text-emerald-600' : emp.distanceFromHospital < 15 ? 'text-amber-600' : 'text-rose-600'}`}>
                                        <MapPin className="w-4 h-4" />
                                        {emp.distanceFromHospital} km
                                    </div>
                                    <div className="flex items-center justify-end gap-1 text-xs font-medium text-slate-400">
                                        <Navigation className="w-3 h-3" />
                                        ETA: ~{Math.ceil(emp.distanceFromHospital * 1.5 + 5)} mins
                                    </div>
                                </div>
                                <button 
                                    onClick={() => {
                                        onNotify("Dispatch Sent", `Emergency alert sent to ${emp.name}.`, "success");
                                        onSendNotification(emp.id, "URGENT: EMERGENCY ALERT", "Immediate assistance required. Please report to station.", "alert");
                                    }}
                                    className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-rose-600 hover:text-white transition-colors shadow-sm"
                                >
                                    <Phone className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                    <button onClick={() => setIsEmergencyModalOpen(false)} className="px-6 py-2.5 font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                        Cancel
                    </button>
                    <button 
                        onClick={() => {
                            const topStaff = emergencyAvailableStaff.slice(0, 3);
                            topStaff.forEach(emp => {
                                onSendNotification(
                                    emp.id,
                                    "URGENT: EMERGENCY DISPATCH",
                                    "You have been identified as nearest available staff. Report immediately.",
                                    "alert"
                                );
                            });
                            onNotify("Mass Alert Sent", `Dispatched alerts to top ${topStaff.length} nearest staff members.`, "error");
                            setIsEmergencyModalOpen(false);
                        }}
                        className="px-6 py-2.5 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-lg shadow-rose-200 transition-colors animate-pulse-soft"
                    >
                        Dispatch Nearest 3
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-4 flex-shrink-0 bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60">
        {/* Top Row: Date & Main Actions */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full lg:w-auto">
                <div className="p-3 bg-indigo-50 rounded-xl hidden md:block">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-slate-900">Schedule</h2>
                        {/* Live Status Summary Pill */}
                        <div className="hidden md:flex items-center gap-3 bg-slate-100 px-3 py-1 rounded-full text-xs font-medium text-slate-600 border border-slate-200">
                            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>{statusStats.available} Available</span>
                            <span className="w-px h-3 bg-slate-300"></span>
                            <span className="flex items-center gap-1.5 text-rose-600"><div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>{statusStats.surgery} In Surgery</span>
                            <span className="w-px h-3 bg-slate-300"></span>
                            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-500"></div>{statusStats.break} On Break</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mt-1">
                        <button onClick={() => setCurrentWeekStart(new Date(currentWeekStart.setDate(currentWeekStart.getDate() - 7)))} className="hover:text-indigo-600 transition-colors p-1 hover:bg-slate-100 rounded-md">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="min-w-[140px] text-center font-bold text-slate-700">
                            {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <button onClick={() => setCurrentWeekStart(new Date(currentWeekStart.setDate(currentWeekStart.getDate() + 7)))} className="hover:text-indigo-600 transition-colors p-1 hover:bg-slate-100 rounded-md">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="flex gap-3 w-full lg:w-auto flex-wrap lg:flex-nowrap">
                <button 
                onClick={handleEmergencyBroadcast}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-sm font-bold hover:bg-rose-600 hover:text-white shadow-sm hover:shadow-rose-200 transition-all duration-300 animate-pulse-soft hover:animate-none"
                >
                <Siren className="w-4 h-4" />
                Emergency
                </button>
                <button
                onClick={() => { setIsSwapMode(!isSwapMode); setSwapSource(null); }}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    isSwapMode 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 scale-105' 
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200'
                }`}
                >
                <ArrowRightLeft className="w-4 h-4" />
                {isSwapMode ? 'Exit Swap' : 'Swap Shifts'}
                </button>
                
                {currentUser.role === Role.ADMIN && (
                  <button 
                  onClick={handleAutoFill}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 hover:-translate-y-0.5 transition-all duration-300"
                  >
                  <Wand2 className="w-4 h-4" />
                  Auto-Fill
                  </button>
                )}
            </div>
        </div>

        {/* Bottom Row: Filters */}
        <div className="flex flex-col md:flex-row gap-3 pt-3 border-t border-slate-100">
            <div className="flex-1 relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search employee..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-slate-400 focus:bg-white"
                />
            </div>
            <div className="flex gap-3">
                <div className="relative min-w-[140px]">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select 
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value as Role | 'All')}
                        className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all appearance-none cursor-pointer focus:bg-white"
                    >
                        <option value="All">All Roles</option>
                        {Object.values(Role).map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                </div>
                <div className="relative min-w-[160px]">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select 
                        value={filterDept}
                        onChange={(e) => setFilterDept(e.target.value as Department | 'All')}
                        className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all appearance-none cursor-pointer focus:bg-white"
                    >
                        <option value="All">All Departments</option>
                        {Object.values(Department).map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                </div>
            </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col relative">
        {isSwapMode && (
          <div className="absolute top-0 left-0 right-0 bg-purple-600/95 backdrop-blur text-white py-3 px-6 text-center text-sm font-semibold z-20 shadow-md flex items-center justify-center gap-2 animate-slide-up">
            <ArrowRightLeft className="w-4 h-4" />
            {swapSource 
              ? "Select the target shift to complete the swap." 
              : "Select the first shift you want to swap."}
          </div>
        )}
        
        {/* Grid Header */}
        <div className="grid grid-cols-[200px_1fr] border-b border-slate-200 bg-slate-50/80 backdrop-blur z-10 sticky top-0 shadow-sm">
          <div className="p-5 font-bold text-slate-500 text-xs uppercase tracking-wider border-r border-slate-200/60 flex items-center">
             Staff Member
          </div>
          <div className="grid grid-cols-7">
            {weekDays.map((day, i) => {
                const isToday = day.toDateString() === new Date().toDateString();
                return (
                    <div key={i} className={`p-3 text-center border-r border-slate-200/60 last:border-r-0 flex flex-col items-center justify-center transition-colors ${isToday ? 'bg-blue-50/50' : ''}`}>
                        <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                            {day.toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm transition-all ${isToday ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-700'}`}>
                            {day.getDate()}
                        </div>
                    </div>
                )
            })}
          </div>
        </div>

        {/* Grid Body */}
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {filteredEmployees.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Search className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-medium">No staff members match your search.</p>
             </div>
          ) : (
            filteredEmployees.map(emp => (
                <div key={emp.id} className="grid grid-cols-[200px_1fr] border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors group">
                <div className="p-4 flex items-center gap-3 border-r border-slate-200/60 bg-white group-hover:bg-slate-50/50 transition-colors sticky left-0 z-0">
                    <div className="relative">
                      <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-full bg-slate-200 object-cover border-2 border-white shadow-sm" />
                      {/* Status Indicator with Pulse */}
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full transition-all duration-300 ${getStatusColor(emp.currentStatus)} ${emp.currentStatus === EmployeeStatus.IN_SURGERY ? 'animate-pulse-soft shadow-lg shadow-rose-200' : ''}`}></div>
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-slate-800 truncate">{emp.name}</div>
                      <div className="text-xs text-slate-500 truncate font-medium mb-1.5">{emp.role}</div>
                      {/* Status Dropdown */}
                      <div className="relative inline-block group/status">
                         <select
                           value={emp.currentStatus}
                           onChange={(e) => onStatusChange(emp.id, e.target.value as EmployeeStatus)}
                           className={`appearance-none pl-2 pr-4 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border border-slate-200 bg-white/50 cursor-pointer hover:border-blue-300 hover:bg-white outline-none focus:ring-2 focus:ring-blue-100 text-slate-600 transition-all`}
                         >
                           {Object.values(EmployeeStatus).map(status => (
                             <option key={status} value={status}>{status}</option>
                           ))}
                         </select>
                         <ChevronDown className="absolute right-0.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-slate-400 pointer-events-none group-hover/status:text-blue-500 transition-colors" />
                      </div>
                    </div>
                </div>
                <div className="grid grid-cols-7">
                    {weekDays.map((day, i) => {
                        const dateStr = day.toISOString().split('T')[0];
                        const currentShift = getShiftForDay(emp.id, dateStr);
                        const isSelected = isSwapMode && swapSource?.employeeId === emp.id && swapSource?.date === dateStr;

                        return (
                        <div key={i} className="p-2 border-r border-slate-100 last:border-r-0 relative">
                            {isSwapMode ? (
                                <div 
                                    onClick={() => handleCellClick(emp.id, dateStr, currentShift)}
                                    className={`w-full h-full min-h-[3rem] rounded-xl cursor-pointer flex flex-col items-center justify-center gap-1 transition-all duration-200 border-2 ${
                                        isSelected 
                                        ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200 shadow-inner' 
                                        : 'border-transparent hover:border-purple-300 hover:bg-purple-50/30'
                                    } ${currentShift !== ShiftType.OFF && !isSelected ? getShiftColor(currentShift) + ' opacity-50' : ''}`}
                                >
                                    {currentShift !== ShiftType.OFF && (
                                        <>
                                            {getShiftIcon(currentShift)}
                                            <span className="text-[10px] font-bold uppercase tracking-wider">{currentShift}</span>
                                        </>
                                    )}
                                </div>
                            ) : (
                                currentUser.role === Role.ADMIN ? (
                                    <div className="relative h-full w-full group/cell transform transition-transform active:scale-95 duration-75">
                                        <select
                                            value={currentShift}
                                            onChange={(e) => handleShiftChange(emp.id, dateStr, e.target.value as ShiftType)}
                                            className={`w-full h-full min-h-[3rem] appearance-none cursor-pointer text-xs font-bold border rounded-xl text-center transition-all outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 ${getShiftColor(currentShift)}`}
                                        >
                                            <option value={ShiftType.OFF}>OFF</option>
                                            <option value={ShiftType.MORNING}>Morning</option>
                                            <option value={ShiftType.AFTERNOON}>Afternoon</option>
                                            <option value={ShiftType.NIGHT}>Night</option>
                                        </select>
                                        {currentShift !== ShiftType.OFF && (
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60">
                                                {getShiftIcon(currentShift)}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className={`w-full h-full min-h-[3rem] rounded-xl flex items-center justify-center gap-1 border ${getShiftColor(currentShift)} cursor-default`}>
                                         {currentShift !== ShiftType.OFF ? (
                                            <>
                                                {getShiftIcon(currentShift)}
                                                <span className="text-[10px] font-bold uppercase tracking-wider">{currentShift}</span>
                                            </>
                                        ) : (
                                            <span className="text-xs font-bold opacity-50">OFF</span>
                                        )}
                                    </div>
                                )
                            )}
                        </div>
                        );
                    })}
                </div>
                </div>
            ))
          )}
        </div>
      </div>
      
      {/* Swap Requests Panel */}
      {pendingSwaps.length > 0 && (
        <div className="absolute bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-purple-100 p-5 animate-slide-in-right z-30">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <div className="p-1.5 bg-purple-100 rounded-lg text-purple-600">
                        <ArrowRightLeft className="w-4 h-4" />
                    </div>
                    Swap Requests
                </h3>
                <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm shadow-purple-200">{pendingSwaps.length} new</span>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {pendingSwaps.map(req => {
                    const reqEmp = employees.find(e => e.id === req.requestingEmployeeId);
                    const targetEmp = employees.find(e => e.id === req.targetEmployeeId);
                    if (!reqEmp || !targetEmp) return null;

                    return (
                        <div key={req.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-purple-200 transition-colors">
                            <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                    <img src={reqEmp.avatar} className="w-8 h-8 rounded-full border border-white shadow-sm" alt="" />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-700">{req.requestingShiftType}</span>
                                        <span className="text-[10px] text-slate-400 font-mono">{req.requestingDate}</span>
                                    </div>
                                </div>
                                <ArrowRightLeft className="w-3 h-3 text-slate-300" />
                                <div className="flex items-center gap-2 flex-row-reverse text-right">
                                    <img src={targetEmp.avatar} className="w-8 h-8 rounded-full border border-white shadow-sm" alt="" />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-700">{req.targetShiftType}</span>
                                        <span className="text-[10px] text-slate-400 font-mono">{req.targetDate}</span>
                                    </div>
                                </div>
                            </div>
                            {currentUser.role === Role.ADMIN ? (
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleRejectSwap(req.id)}
                                        className="flex-1 py-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200 hover:border-rose-200"
                                    >
                                        Reject
                                    </button>
                                    <button 
                                        onClick={() => handleApproveSwap(req)}
                                        className="flex-1 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-sm shadow-purple-200"
                                    >
                                        Approve
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full py-1.5 text-xs font-bold text-center text-amber-600 bg-amber-50 rounded-lg border border-amber-100">
                                    Waiting for Admin Approval
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleGrid;
