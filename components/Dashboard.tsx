
import React, { useState, useEffect, useRef } from 'react';
import { Users, Clock, AlertCircle, CheckCircle2, TrendingUp, TrendingDown, ArrowRight, Activity, Stethoscope, Coffee, PhoneOff, Bell, Mail, Info } from 'lucide-react';
import { Department, Employee, LeaveRequest, Shift, ShiftType, EmployeeStatus, Role, UserNotification } from '../types';

interface DashboardProps {
  employees: Employee[];
  shifts: Shift[];
  leaves: LeaveRequest[];
  currentUser: Employee;
  notifications?: UserNotification[];
  onMarkAsRead?: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ employees, shifts, leaves, currentUser, notifications = [], onMarkAsRead }) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Quick stats calculation
  const today = new Date().toISOString().split('T')[0];
  const staffOnDuty = shifts.filter(s => s.date === today && s.type !== ShiftType.OFF).length;
  const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
  const totalStaff = employees.length;
  const coverageRate = Math.round((staffOnDuty / totalStaff) * 100);

  // Notification Logic
  const myNotifications = notifications.filter(n => n.targetUserId === currentUser.id).sort((a, b) => b.timestamp - a.timestamp);
  const unreadCount = myNotifications.filter(n => !n.isRead).length;

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Real-time status counts
  const statusCounts = {
    [EmployeeStatus.AVAILABLE]: employees.filter(e => e.currentStatus === EmployeeStatus.AVAILABLE).length,
    [EmployeeStatus.IN_SURGERY]: employees.filter(e => e.currentStatus === EmployeeStatus.IN_SURGERY).length,
    [EmployeeStatus.ON_BREAK]: employees.filter(e => e.currentStatus === EmployeeStatus.ON_BREAK).length,
    [EmployeeStatus.BUSY]: employees.filter(e => e.currentStatus === EmployeeStatus.BUSY).length,
    [EmployeeStatus.OFF_DUTY]: employees.filter(e => e.currentStatus === EmployeeStatus.OFF_DUTY).length,
  };

  const allStats = [
    { 
      label: 'Staff On Duty', 
      value: staffOnDuty, 
      total: totalStaff, 
      icon: Users, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      trend: '+2 from yesterday', 
      trendUp: true 
    },
    { 
      label: 'Coverage Rate', 
      value: `${coverageRate}%`, 
      sub: 'Daily Target: 85%', 
      icon: Activity, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50',
      trend: '-4% from avg', 
      trendUp: false 
    },
    { 
      label: 'Pending Leaves', 
      value: pendingLeaves, 
      sub: 'Requires Attention', 
      icon: Clock, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50',
      trend: 'No change', 
      trendUp: true 
    },
    { 
      label: 'Critical Gaps', 
      value: '2', 
      sub: 'ICU Night Shift', 
      icon: AlertCircle, 
      color: 'text-rose-600', 
      bg: 'bg-rose-50',
      trend: '+1 new alert', 
      trendUp: true 
    },
  ];

  // Filter stats for non-admin users
  const stats = currentUser.role === Role.ADMIN 
    ? allStats 
    : allStats.filter(stat => stat.label !== 'Pending Leaves');

  return (
    <div className="space-y-8 animate-slide-up max-w-7xl mx-auto relative pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200/60">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
          <p className="text-slate-500 mt-1 font-medium">Welcome back, {currentUser.name}</p>
        </div>
        <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
                <button 
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all relative"
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                            {unreadCount}
                        </span>
                    )}
                </button>
                
                {/* Notification Dropdown */}
                {isNotifOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 z-50 overflow-hidden animate-slide-up">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">Notifications</h3>
                            <span className="text-xs font-bold text-slate-400">{unreadCount} unread</span>
                        </div>
                        <div className="max-h-80 overflow-y-auto custom-scrollbar">
                            {myNotifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                                    <Mail className="w-8 h-8 mb-2 opacity-20" />
                                    <p className="text-sm font-medium">No new notifications</p>
                                </div>
                            ) : (
                                myNotifications.map(notif => (
                                    <div 
                                        key={notif.id} 
                                        onClick={() => onMarkAsRead && onMarkAsRead(notif.id)}
                                        className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group ${notif.isRead ? 'opacity-60' : 'bg-blue-50/30'}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`mt-1 p-1.5 rounded-lg flex-shrink-0 ${notif.type === 'alert' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {notif.type === 'alert' ? <AlertCircle className="w-3 h-3" /> : <Info className="w-3 h-3" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className={`text-sm font-bold ${notif.isRead ? 'text-slate-600' : 'text-slate-900'}`}>{notif.title}</h4>
                                                    {!notif.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>}
                                                </div>
                                                <p className="text-xs text-slate-500 leading-relaxed">{notif.message}</p>
                                                <p className="text-[10px] text-slate-400 mt-2 font-medium">
                                                    {new Date(notif.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-slate-200/60">
                <CalendarIcon />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${currentUser.role === Role.ADMIN ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-md group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3.5 rounded-xl ${stat.bg} ${stat.color} transition-colors group-hover:scale-110 duration-300`}>
                <stat.icon className="w-6 h-6" />
              </div>
              {stat.trendUp ? (
                  <div className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.trend}
                  </div>
              ) : (
                   <div className="flex items-center text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    {stat.trend}
                  </div>
              )}
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
              <p className="text-slate-500 font-medium text-sm mt-1">{stat.label}</p>
              {stat.sub && <p className="text-xs text-slate-400 mt-2 font-medium">{stat.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Live Status Widget */}
      <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-slate-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              Live Floor Status
            </h3>
            <p className="text-sm text-slate-500 mt-1">Real-time activity across all departments</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 hover:shadow-md transition-all cursor-default">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Available</span>
            </div>
            <span className="text-2xl font-bold text-slate-900">{statusCounts[EmployeeStatus.AVAILABLE]}</span>
          </div>
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 hover:shadow-md transition-all cursor-default">
            <div className="flex items-center gap-3 mb-2">
              <Stethoscope className="w-5 h-5 text-rose-600 animate-pulse" />
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Surgery</span>
            </div>
            <span className="text-2xl font-bold text-slate-900">{statusCounts[EmployeeStatus.IN_SURGERY]}</span>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 hover:shadow-md transition-all cursor-default">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-amber-600" />
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Busy</span>
            </div>
            <span className="text-2xl font-bold text-slate-900">{statusCounts[EmployeeStatus.BUSY]}</span>
          </div>
          <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-100 hover:shadow-md transition-all cursor-default">
            <div className="flex items-center gap-3 mb-2">
              <Coffee className="w-5 h-5 text-yellow-600" />
              <span className="text-xs font-bold text-yellow-700 uppercase tracking-wider">On Break</span>
            </div>
            <span className="text-2xl font-bold text-slate-900">{statusCounts[EmployeeStatus.ON_BREAK]}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition-all cursor-default">
            <div className="flex items-center gap-3 mb-2">
              <PhoneOff className="w-5 h-5 text-slate-400" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Off Duty</span>
            </div>
            <span className="text-2xl font-bold text-slate-900">{statusCounts[EmployeeStatus.OFF_DUTY]}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Department Status */}
        <div className={`${currentUser.role === Role.ADMIN ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-slate-100 p-8`}>
          <div className="flex items-center justify-between mb-8">
            <div>
                <h3 className="text-xl font-bold text-slate-900">Department Loads</h3>
                <p className="text-sm text-slate-500 mt-1">Staffing capacity vs current active shifts</p>
            </div>
            <button className="text-sm text-blue-600 font-bold hover:text-blue-700 flex items-center gap-1 transition-all hover:gap-2">
                View Details <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-6">
            {[
                { name: Department.ER, filled: 8, total: 10, color: 'bg-blue-500' },
                { name: Department.ICU, filled: 12, total: 15, color: 'bg-purple-500' },
                { name: Department.SURG, filled: 5, total: 5, color: 'bg-emerald-500' },
                { name: Department.PEDS, filled: 6, total: 8, color: 'bg-amber-500' }
            ].map((dept) => {
                const percentage = (dept.filled / dept.total) * 100;
                return (
                <div key={dept.name} className="group">
                    <div className="flex justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${dept.color}`}></div>
                            <span className="font-semibold text-slate-700">{dept.name}</span>
                        </div>
                        <div className="text-sm font-medium text-slate-500">
                            <span className="text-slate-900 font-bold">{dept.filled}</span>/{dept.total} Staffed
                        </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                            className={`${dept.color} h-2.5 rounded-full transition-all duration-1000 ease-out group-hover:opacity-80`} 
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                </div>
            )})}
          </div>
        </div>

        {/* Today's Highlights - ADMIN ONLY */}
        {currentUser.role === Role.ADMIN && (
          <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-slate-100 p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Highlights</h3>
            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              
              <div className="relative flex items-start gap-4 group">
                <div className="absolute left-0 md:left-0 ml-1 mt-1.5 -translate-x-1/2 translate-y-0 h-3 w-3 rounded-full border-2 border-white bg-rose-500 ring-4 ring-rose-50"></div>
                <div className="ml-6">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">Critical</span>
                  <p className="text-sm font-bold text-slate-800 mt-1 group-hover:text-rose-600 transition-colors">Shortage in Pediatrics</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">Night shift requires 2 more nurses. Consider floating staff from General Ward.</p>
                </div>
              </div>

              <div className="relative flex items-start gap-4 group">
                <div className="absolute left-0 md:left-0 ml-1 mt-1.5 -translate-x-1/2 translate-y-0 h-3 w-3 rounded-full border-2 border-white bg-amber-500 ring-4 ring-amber-50"></div>
                <div className="ml-6">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">Request</span>
                  <p className="text-sm font-bold text-slate-800 mt-1 group-hover:text-amber-600 transition-colors">Dr. Watson Leave</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">Requested next Friday off for "Medical Conference". Approval pending.</p>
                </div>
              </div>

              <div className="relative flex items-start gap-4 group">
                <div className="absolute left-0 md:left-0 ml-1 mt-1.5 -translate-x-1/2 translate-y-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 ring-4 ring-emerald-50"></div>
                <div className="ml-6">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">Update</span>
                  <p className="text-sm font-bold text-slate-800 mt-1 group-hover:text-emerald-600 transition-colors">Shift Swap Approved</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">Nurse John & Nurse Sarah successfully swapped Tuesday shifts.</p>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Footer Logo */}
      <div className="flex justify-end items-center pt-8 mt-4 border-t border-slate-200">
         <div className="flex items-center gap-3 px-4 py-2 bg-white/50 rounded-xl border border-slate-100 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Developed by</span>
            <img 
              src="data:image/png;base64,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" 
              alt="iSteer" 
              className="h-10 w-auto object-contain" 
            />
         </div>
      </div>

    </div>
  );
};

const CalendarIcon = () => (
    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export default Dashboard;
