
import React, { useState } from 'react';
import { Activity, ShieldCheck, Lock, UserCircle, Eye, EyeOff, ArrowRight, KeyRound, MessageSquare, ArrowLeft, Mail } from 'lucide-react';
import { Employee, Role } from '../types';

interface LoginScreenProps {
  employees: Employee[];
  onLogin: (employee: Employee) => void;
  onUpdateCredentials: (id: string, username: string, pass: string) => void;
}

type LoginView = 'LOGIN' | 'FORGOT_IDENTIFY' | 'FORGOT_OTP' | 'FORGOT_NEW_PASS';

const LoginScreen: React.FC<LoginScreenProps> = ({ employees, onLogin, onUpdateCredentials }) => {
  const [view, setView] = useState<LoginView>('LOGIN');
  const [loginType, setLoginType] = useState<'STAFF' | 'ADMIN'>('STAFF');
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Forgot Password State
  const [resetIdentifier, setResetIdentifier] = useState(''); // Email or Username
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [targetUser, setTargetUser] = useState<Employee | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [simulatedMessage, setSimulatedMessage] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = employees.find(emp => 
      emp.username === username && 
      emp.password === password
    );

    if (user) {
      if (loginType === 'ADMIN' && user.role !== Role.ADMIN) {
        setError("Access Denied: You do not have administrator privileges.");
        return;
      }
      onLogin(user);
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  const handleIdentifySubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      
      // Try to find by email first, then username
      const user = employees.find(emp => 
          emp.email?.toLowerCase() === resetIdentifier.toLowerCase() || 
          emp.username?.toLowerCase() === resetIdentifier.toLowerCase()
      );

      if (user) {
          const code = Math.floor(100000 + Math.random() * 900000).toString();
          setGeneratedOtp(code);
          setTargetUser(user);
          
          // Simulate OTP Sending
          setSimulatedMessage(`SIMULATION: OTP ${code} sent to ${user.phoneNumber} & ${user.email}`);
          setView('FORGOT_OTP');
      } else {
          setError("We couldn't find an account with that information.");
      }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (otp === generatedOtp) {
          setView('FORGOT_NEW_PASS');
          setSimulatedMessage('');
      } else {
          setError("Invalid OTP. Please try again.");
      }
  };

  const handlePasswordResetSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (newPassword.length < 6) {
          setError("Password must be at least 6 characters.");
          return;
      }

      if (newPassword !== confirmPassword) {
          setError("Passwords do not match.");
          return;
      }

      if (targetUser && targetUser.username) {
          onUpdateCredentials(targetUser.id, targetUser.username, newPassword);
          // Reset flow
          alert("Password updated successfully! Please login with your new credentials.");
          resetFlow();
      }
  };

  const resetFlow = () => {
    setView('LOGIN');
    setResetIdentifier('');
    setOtp('');
    setGeneratedOtp('');
    setTargetUser(null);
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSimulatedMessage('');
  };

  const demoFill = (role: 'STAFF' | 'ADMIN') => {
      if (role === 'ADMIN') {
          setUsername('admin');
          setPassword('admin');
      } else {
          setUsername('sarah');
          setPassword('password');
      }
      setLoginType(role);
      setError('');
  };

  const renderLoginForm = () => (
      <>
        <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
            <p className="text-slate-500 mt-2">Select your portal to continue</p>
        </div>

        {/* Login Type Selection */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            <button
                onClick={() => demoFill('STAFF')}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    loginType === 'STAFF' 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-slate-100 hover:border-slate-300'
                }`}
            >
                <div className={`p-2 rounded-lg w-fit mb-3 ${loginType === 'STAFF' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <UserCircle className="w-6 h-6" />
                </div>
                <div className="font-bold text-slate-900">Staff Portal</div>
                <div className="text-xs text-slate-500 mt-1">Doctors, Nurses & Techs</div>
            </button>

            <button
                onClick={() => demoFill('ADMIN')}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    loginType === 'ADMIN' 
                    ? 'border-purple-600 bg-purple-50' 
                    : 'border-slate-100 hover:border-slate-300'
                }`}
            >
                <div className={`p-2 rounded-lg w-fit mb-3 ${loginType === 'ADMIN' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Lock className="w-6 h-6" />
                </div>
                <div className="font-bold text-slate-900">Admin Portal</div>
                <div className="text-xs text-slate-500 mt-1">System Administrators</div>
            </button>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
                <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Enter your username"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Enter your password"
                        required
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <div className="flex justify-end">
                <button 
                    type="button"
                    onClick={() => { setError(''); setView('FORGOT_IDENTIFY'); }}
                    className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                    Forgot Password?
                </button>
            </div>

            <button 
                type="submit"
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 ${
                    loginType === 'ADMIN' 
                    ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200' 
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                }`}
            >
                Sign In to Portal
                <ArrowRight className="w-5 h-5" />
            </button>
        </form>
      </>
  );

  const renderIdentifyForm = () => (
      <div className="space-y-6 animate-slide-in-right">
          <div className="mb-6">
             <button onClick={resetFlow} className="flex items-center text-slate-400 hover:text-slate-600 text-sm font-bold mb-4 transition-colors">
                 <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
             </button>
             <h2 className="text-2xl font-bold text-slate-900">Reset Password</h2>
             <p className="text-slate-500 mt-1">Enter your email or username to receive a verification code.</p>
          </div>

          <form onSubmit={handleIdentifySubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email or Username</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        value={resetIdentifier}
                        onChange={(e) => setResetIdentifier(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="e.g. sarah.chen@medishift.com"
                        required
                    />
                </div>
            </div>
            <button 
                type="submit"
                className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold shadow-lg hover:bg-slate-800 transition-all"
            >
                Send OTP
            </button>
          </form>
      </div>
  );

  const renderOtpForm = () => (
    <div className="space-y-6 animate-slide-in-right">
        <div className="mb-6">
            <button onClick={() => setView('FORGOT_IDENTIFY')} className="flex items-center text-slate-400 hover:text-slate-600 text-sm font-bold mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>
            <h2 className="text-2xl font-bold text-slate-900">Verify OTP</h2>
            <p className="text-slate-500 mt-1">Enter the 6-digit code sent to your registered email/mobile.</p>
        </div>

        {simulatedMessage && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-mono mb-4 break-words">
                {simulatedMessage}
            </div>
        )}

        <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">One-Time Password</label>
                <div className="relative">
                    <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all tracking-widest"
                        placeholder="123456"
                        required
                    />
                </div>
            </div>
            <button 
                type="submit"
                className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold shadow-lg hover:bg-slate-800 transition-all"
            >
                Verify & Proceed
            </button>
        </form>
    </div>
  );

  const renderNewPassForm = () => (
    <div className="space-y-6 animate-slide-in-right">
        <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Create New Password</h2>
            <p className="text-slate-500 mt-1">Secure your account with a new strong password.</p>
        </div>

        <form onSubmit={handlePasswordResetSubmit} className="space-y-6">
             <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        required
                    />
                </div>
            </div>
             <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        required
                    />
                </div>
            </div>
            <button 
                type="submit"
                className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
            >
                Reset Password
            </button>
        </form>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 z-0"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
             </svg>
        </div>
        
        <div className="relative z-10 text-white max-w-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-900/50 mb-8">
                <Activity className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight mb-6">MediShift<span className="text-blue-400">AI</span></h1>
            <p className="text-xl text-slate-300 leading-relaxed mb-8">
                Next-generation hospital workforce management powered by artificial intelligence. 
                Optimize schedules, forecast demand, and manage emergencies in real-time.
            </p>
            
            <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                    <ShieldCheck className="w-6 h-6 text-emerald-400 mb-2" />
                    <h3 className="font-bold text-lg">Secure Access</h3>
                    <p className="text-sm text-slate-400">Role-based permissions</p>
                </div>
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                    <Activity className="w-6 h-6 text-blue-400 mb-2" />
                    <h3 className="font-bold text-lg">Real-time Sync</h3>
                    <p className="text-sm text-slate-400">Live status updates</p>
                </div>
            </div>
        </div>
      </div>

      {/* Right Side - Dynamic Forms */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-16 bg-white">
        <div className="max-w-md mx-auto w-full">
            
            {error && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold flex items-center gap-2 animate-fade-in">
                    <ShieldCheck className="w-4 h-4" />
                    {error}
                </div>
            )}

            {view === 'LOGIN' && renderLoginForm()}
            {view === 'FORGOT_IDENTIFY' && renderIdentifyForm()}
            {view === 'FORGOT_OTP' && renderOtpForm()}
            {view === 'FORGOT_NEW_PASS' && renderNewPassForm()}
            
            {view === 'LOGIN' && (
                <div className="pt-6 border-t border-slate-100 text-center space-y-2 mt-8">
                    <p className="text-xs text-slate-400">
                        Protected by MediShift Enterprise Security. 
                        <br/>Authorized personnel only.
                    </p>
                    <p className="text-[10px] text-slate-300">
                        Demo Users: "admin/admin" or "sarah/password"
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
