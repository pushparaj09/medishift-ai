
import React, { useState, useCallback } from 'react';
import { Menu, Activity } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ScheduleGrid from './components/ScheduleGrid';
import ForecastView from './components/ForecastView';
import LeaveRequests from './components/LeaveRequests';
import EmployeeList from './components/EmployeeList';
import Notifications from './components/Notifications';
import Settings from './components/Settings';
import LoginScreen from './components/LoginScreen';
import ProfileSettings from './components/ProfileSettings';
import { Employee, Role, Department, Shift, ShiftType, LeaveRequest, AppNotification, ShiftSwapRequest, EmployeeStatus, UserNotification } from './types';

// Mock Data Initialization
const MOCK_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Dr. Sarah Chen', role: Role.DOCTOR, department: Department.ER, avatar: 'https://picsum.photos/200/200?random=1', currentStatus: EmployeeStatus.AVAILABLE, distanceFromHospital: 3.5, email: 'sarah.chen@medishift.com', phoneNumber: '+1 (555) 010-1010', username: 'sarah', password: 'password' },
  { id: '2', name: 'James Wilson', role: Role.NURSE, department: Department.ER, avatar: 'https://picsum.photos/200/200?random=2', currentStatus: EmployeeStatus.BUSY, distanceFromHospital: 12.1, email: 'j.wilson@medishift.com', phoneNumber: '+1 (555) 020-2020', username: 'james', password: 'password' },
  { id: '3', name: 'Dr. Emily Watson', role: Role.DOCTOR, department: Department.PEDS, avatar: 'https://picsum.photos/200/200?random=3', currentStatus: EmployeeStatus.OFF_DUTY, distanceFromHospital: 1.2, email: 'emily.w@medishift.com', phoneNumber: '+1 (555) 030-3030', username: 'emily', password: 'password' },
  { id: '4', name: 'Michael Brown', role: Role.TECH, department: Department.ICU, avatar: 'https://picsum.photos/200/200?random=4', currentStatus: EmployeeStatus.AVAILABLE, distanceFromHospital: 8.7, email: 'm.brown@medishift.com', phoneNumber: '+1 (555) 040-4040', username: 'michael', password: 'password' },
  { id: '5', name: 'Lisa Ray', role: Role.NURSE, department: Department.ICU, avatar: 'https://picsum.photos/200/200?random=5', currentStatus: EmployeeStatus.ON_BREAK, distanceFromHospital: 5.4, email: 'lisa.ray@medishift.com', phoneNumber: '+1 (555) 050-5050', username: 'lisa', password: 'password' },
  { id: '6', name: 'Dr. John Doe', role: Role.DOCTOR, department: Department.SURG, avatar: 'https://picsum.photos/200/200?random=6', currentStatus: EmployeeStatus.IN_SURGERY, distanceFromHospital: 15.0, email: 'j.doe@medishift.com', phoneNumber: '+1 (555) 060-6060', username: 'john', password: 'password' },
  { id: '7', name: 'Patricia Lee', role: Role.ADMIN, department: Department.GEN, avatar: 'https://picsum.photos/200/200?random=7', currentStatus: EmployeeStatus.AVAILABLE, distanceFromHospital: 22.3, email: 'admin.lee@medishift.com', phoneNumber: '+1 (555) 070-7070', username: 'admin', password: 'admin' },
  { id: '8', name: 'Robert Taylor', role: Role.NURSE, department: Department.ER, avatar: 'https://picsum.photos/200/200?random=8', currentStatus: EmployeeStatus.BUSY, distanceFromHospital: 4.1, email: 'r.taylor@medishift.com', phoneNumber: '+1 (555) 080-8080', username: 'robert', password: 'password' },
];

const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

const MOCK_SHIFTS: Shift[] = [
  { id: 's1', employeeId: '1', date: today, type: ShiftType.MORNING },
  { id: 's2', employeeId: '2', date: today, type: ShiftType.NIGHT },
  { id: 's3', employeeId: '3', date: today, type: ShiftType.AFTERNOON },
  { id: 's4', employeeId: '1', date: tomorrow, type: ShiftType.OFF },
  { id: 's5', employeeId: '2', date: tomorrow, type: ShiftType.MORNING },
];

const MOCK_LEAVES: LeaveRequest[] = [
    { id: 'l1', employeeId: '3', startDate: '2023-11-10', endDate: '2023-11-12', reason: 'Medical Conference', status: 'Pending' },
    { id: 'l2', employeeId: '5', startDate: '2023-11-15', endDate: '2023-11-20', reason: 'Family Vacation', status: 'Approved' },
    { id: 'l3', employeeId: '6', startDate: '2023-11-05', endDate: '2023-11-06', reason: 'Personal', status: 'Rejected' },
];

const MOCK_NOTIFICATIONS: UserNotification[] = [
    { id: 'n1', targetUserId: '1', title: 'Shift Update', message: 'Your shift on Monday has been changed to Morning.', type: 'system', timestamp: Date.now() - 10000000, isRead: false },
    { id: 'n2', targetUserId: '1', title: 'Policy Update', message: 'New hygiene protocols are in effect.', type: 'alert', timestamp: Date.now() - 20000000, isRead: true },
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [shifts, setShifts] = useState<Shift[]>(MOCK_SHIFTS);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(MOCK_LEAVES);
  const [swapRequests, setSwapRequests] = useState<ShiftSwapRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [toasts, setToasts] = useState<AppNotification[]>([]);
  const [userNotifications, setUserNotifications] = useState<UserNotification[]>(MOCK_NOTIFICATIONS);

  // Swipe to Open State
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  // Toast Notification (Transient)
  const addToast = useCallback((title: string, message: string, type: 'info' | 'warning' | 'success' | 'error' = 'info') => {
    const newToast: AppNotification = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      type,
      timestamp: Date.now()
    };
    setToasts(prev => [newToast, ...prev]);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      removeToast(newToast.id);
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(n => n.id !== id));
  };

  // Persistent User Notification
  const sendNotification = useCallback((targetUserId: string, title: string, message: string, type: 'system' | 'alert' | 'success' = 'system') => {
    const newNotif: UserNotification = {
      id: Math.random().toString(36).substr(2, 9),
      targetUserId,
      title,
      message,
      type,
      timestamp: Date.now(),
      isRead: false
    };
    setUserNotifications(prev => [newNotif, ...prev]);
  }, []);

  const markNotificationAsRead = (id: string) => {
    setUserNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleStatusChange = (id: string, status: EmployeeStatus) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === id ? { ...emp, currentStatus: status } : emp
    ));
    addToast("Status Updated", `Employee status changed to ${status}`, "success");
  };

  const handleUpdateProfile = (updatedEmployee: Employee) => {
    setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
    setCurrentUser(updatedEmployee);
  };
  
  const handleUpdateCredentials = (id: string, username: string, password: string) => {
      setEmployees(prev => prev.map(emp => 
          emp.id === id ? { ...emp, username, password } : emp
      ));
      addToast("Credentials Updated", "User access details have been updated successfully.", "success");
  };

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
    addToast("Employee Updated", `${updatedEmployee.name}'s details have been updated.`, "success");
  };

  const handleAddEmployee = (newEmployee: Employee) => {
    setEmployees(prev => [...prev, newEmployee]);
    addToast("Employee Onboarded", `${newEmployee.name} has been successfully added to the system.`, "success");
  };

  const handleRemoveEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    addToast("Employee Removed", "Staff member has been permanently removed from the system.", "success");
  };

  const handleLogin = (employee: Employee) => {
    setCurrentUser(employee);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  // Swipe Handlers for Opening Sidebar (Edge Swipe)
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    if (e.targetTouches[0].clientX < 40) {
      setTouchStart(e.targetTouches[0].clientX);
    } else {
      setTouchStart(null);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart !== null) {
       setTouchEnd(e.targetTouches[0].clientX);
    }
  };

  const onTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;
    const distance = touchEnd - touchStart;
    const isRightSwipe = distance > minSwipeDistance;
    if (isRightSwipe) {
      setIsSidebarOpen(true);
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const renderContent = () => {
    if (!currentUser) return null;

    switch (activeTab) {
      case 'dashboard':
        return (
            <Dashboard 
                employees={employees} 
                shifts={shifts} 
                leaves={leaves} 
                currentUser={currentUser} 
                notifications={userNotifications}
                onMarkAsRead={markNotificationAsRead}
            />
        );
      case 'schedule':
        return (
          <ScheduleGrid 
            employees={employees} 
            shifts={shifts} 
            setShifts={setShifts} 
            swapRequests={swapRequests}
            setSwapRequests={setSwapRequests}
            onNotify={addToast}
            onSendNotification={sendNotification}
            onStatusChange={handleStatusChange}
            currentUser={currentUser}
          />
        );
      case 'employees':
        return (
            <EmployeeList 
                employees={employees} 
                currentUser={currentUser} 
                onUpdateCredentials={handleUpdateCredentials}
                onAddEmployee={handleAddEmployee}
                onRemoveEmployee={handleRemoveEmployee}
                onUpdateEmployee={handleUpdateEmployee}
            />
        );
      case 'leaves':
        return (
          <LeaveRequests 
            leaves={leaves} 
            employees={employees} 
            setLeaves={setLeaves} 
            onNotify={addToast} 
            onSendNotification={sendNotification}
            currentUser={currentUser} 
          />
        );
      case 'forecast':
        return <ForecastView />;
      case 'settings':
        return <Settings employees={employees} shifts={shifts} onNotify={addToast} />;
      case 'profile':
        return <ProfileSettings currentUser={currentUser} onSave={handleUpdateProfile} onNotify={addToast} />;
      default:
        return <Dashboard employees={employees} shifts={shifts} leaves={leaves} currentUser={currentUser} notifications={userNotifications} onMarkAsRead={markNotificationAsRead} />;
    }
  };

  if (!currentUser) {
    return (
      <LoginScreen 
        employees={employees} 
        onLogin={handleLogin} 
        onUpdateCredentials={handleUpdateCredentials} // Pass the prop here
      />
    );
  }

  return (
    <div 
      className="flex min-h-screen bg-slate-50 text-slate-900 relative"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      
      <Notifications notifications={toasts} removeNotification={removeToast} />

      <div className="flex-1 flex flex-col min-h-screen md:ml-72 transition-all duration-300">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
               <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">MediShift AI</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar h-[calc(100vh-65px)] md:h-screen">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
