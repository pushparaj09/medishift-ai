
import React, { useState } from 'react';
import { LayoutDashboard, CalendarDays, Users, FileText, TrendingUp, Activity, Settings, X, LogOut, UserCircle } from 'lucide-react';
import { Employee, Role } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  currentUser: Employee | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose, currentUser, onLogout }) => {
  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'schedule', label: 'Shift Schedule', icon: CalendarDays },
    { id: 'employees', label: 'Staff Directory', icon: Users },
    { id: 'leaves', label: 'Leave Requests', icon: FileText },
    { id: 'forecast', label: 'AI Forecast', icon: TrendingUp },
    { id: 'profile', label: 'My Profile', icon: UserCircle },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  // Filter menu items based on role
  const menuItems = allMenuItems.filter(item => {
    if (currentUser?.role !== Role.ADMIN) {
        return item.id !== 'forecast' && item.id !== 'settings';
    }
    return true;
  });

  // Swipe Logic State
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum distance to trigger swipe action
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); 
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    if (isLeftSwipe) {
      onClose();
    }
  };

  if (!currentUser) return null;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={onClose}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white shadow-2xl border-r border-slate-800
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:block
        `}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="p-6 md:p-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">MediShift<span className="text-blue-400">AI</span></h1>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-0.5">
                    {currentUser.role === Role.ADMIN ? 'Admin Portal' : 'Staff Portal'}
                </p>
              </div>
            </div>
            {/* Close Button (Mobile Only) */}
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white md:hidden"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
            <div className="text-xs font-bold text-slate-500 px-4 mb-2 uppercase tracking-wider">Main Menu</div>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose(); // Close sidebar on mobile when item clicked
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                {activeTab === item.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/30 rounded-r-full blur-[1px]"></div>
                )}
                <item.icon className={`w-5 h-5 transition-colors ${activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className="font-medium tracking-wide text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-4 m-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 overflow-hidden mb-3">
              <div className="relative shrink-0">
                <img src={currentUser.avatar} alt="Profile" className="w-10 h-10 rounded-full border-2 border-slate-600/50 object-cover" />
                <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-slate-800 rounded-full ${currentUser.currentStatus === 'Available' ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-400 truncate">{currentUser.role} - {currentUser.department}</p>
              </div>
            </div>
            
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-800 hover:bg-red-900/30 hover:text-red-400 text-slate-400 text-xs font-bold transition-all border border-slate-700 hover:border-red-900/50"
            >
              <LogOut className="w-3 h-3" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
