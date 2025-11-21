import React from 'react';
import { X, Bell, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationsProps {
  notifications: AppNotification[];
  removeNotification: (id: string) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ notifications, removeNotification }) => {
  if (notifications.length === 0) return null;

  const getStyles = (type: string) => {
    switch (type) {
      case 'warning': return { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' };
      case 'success': return { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' };
      case 'error': return { icon: X, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' };
      default: return { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' };
    }
  };

  return (
    <div className="fixed top-6 right-6 z-[60] space-y-4 w-full max-w-md pointer-events-none">
      {notifications.map((notification) => {
        const style = getStyles(notification.type);
        const Icon = style.icon;
        
        return (
        <div
          key={notification.id}
          className={`pointer-events-auto bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border ${style.border} p-4 transform transition-all duration-300 ease-in-out flex gap-4 animate-slide-in-right`}
        >
          <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${style.color}`} />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h4 className="text-sm font-bold text-slate-900">{notification.title}</h4>
            <p className="text-sm text-slate-500 mt-1 font-medium leading-relaxed">{notification.message}</p>
            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Just now</p>
          </div>
          <button 
            onClick={() => removeNotification(notification.id)}
            className="flex-shrink-0 text-slate-300 hover:text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )})}
    </div>
  );
};

export default Notifications;