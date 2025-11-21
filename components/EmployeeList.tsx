
import React, { useState } from 'react';
import { Mail, Phone, MoreHorizontal, Shield, Activity, Stethoscope, Coffee, PhoneOff, CheckCircle2, Lock, Key, X, Save, UserPlus, Briefcase, Building2, User, Smartphone, Trash2, AlertTriangle, Edit, RefreshCw, Copy } from 'lucide-react';
import { Department, Employee, EmployeeStatus, Role } from '../types';

interface EmployeeListProps {
    employees: Employee[];
    currentUser: Employee;
    onUpdateCredentials?: (id: string, user: string, pass: string) => void;
    onAddEmployee?: (employee: Employee) => void;
    onRemoveEmployee?: (id: string) => void;
    onUpdateEmployee?: (employee: Employee) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ employees, currentUser, onUpdateCredentials, onAddEmployee, onRemoveEmployee, onUpdateEmployee }) => {
    const [credentialModalOpen, setCredentialModalOpen] = useState(false);
    const [addEmployeeModalOpen, setAddEmployeeModalOpen] = useState(false);
    const [editEmployeeModalOpen, setEditEmployeeModalOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    
    const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    
    // State for the three-dot dropdown menu
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    // Credentials State
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // Add Employee Form State
    const [addForm, setAddForm] = useState<{
        name: string;
        role: Role;
        department: Department;
        email: string;
        phoneNumber: string;
        username: string;
        password: string;
    }>({
        name: '',
        role: Role.NURSE,
        department: Department.GEN,
        email: '',
        phoneNumber: '',
        username: '',
        password: ''
    });

    // Edit Employee Form State
    const [editForm, setEditForm] = useState<Employee | null>(null);

    const openCredentialModal = (emp: Employee) => {
        setSelectedEmployee(emp);
        setNewUsername(emp.username || '');
        setNewPassword(emp.password || '');
        setCredentialModalOpen(true);
        setActiveMenuId(null);
    };

    const openEditModal = (emp: Employee) => {
        setEditForm(emp);
        setEditEmployeeModalOpen(true);
        setActiveMenuId(null);
    };

    const handleSaveCredentials = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedEmployee && onUpdateCredentials) {
            onUpdateCredentials(selectedEmployee.id, newUsername, newPassword);
            setCredentialModalOpen(false);
        }
    };

    const generateRandomPassword = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        let pass = "";
        for (let i = 0; i < 10; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setNewPassword(pass);
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onAddEmployee) {
            const newEmployee: Employee = {
                id: Math.random().toString(36).substr(2, 9),
                ...addForm,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(addForm.name)}&background=random`,
                currentStatus: EmployeeStatus.AVAILABLE,
                distanceFromHospital: 10 // Default distance
            };
            onAddEmployee(newEmployee);
            setAddEmployeeModalOpen(false);
            // Reset form
            setAddForm({
                name: '',
                role: Role.NURSE,
                department: Department.GEN,
                email: '',
                phoneNumber: '',
                username: '',
                password: ''
            });
        }
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onUpdateEmployee && editForm) {
            onUpdateEmployee(editForm);
            setEditEmployeeModalOpen(false);
            setEditForm(null);
        }
    };
    
    const handleDeleteClick = (emp: Employee) => {
        setEmployeeToDelete(emp);
        setDeleteConfirmOpen(true);
        setActiveMenuId(null);
    };

    const confirmDelete = () => {
        if (employeeToDelete && onRemoveEmployee) {
            onRemoveEmployee(employeeToDelete.id);
            setDeleteConfirmOpen(false);
            setEmployeeToDelete(null);
        }
    };

    const toggleMenu = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveMenuId(activeMenuId === id ? null : id);
    };

    // Close menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const getStatusIcon = (status: EmployeeStatus) => {
        switch(status) {
            case EmployeeStatus.AVAILABLE: return <CheckCircle2 className="w-3 h-3 text-white" />;
            case EmployeeStatus.IN_SURGERY: return <Stethoscope className="w-3 h-3 text-white" />;
            case EmployeeStatus.BUSY: return <Activity className="w-3 h-3 text-white" />;
            case EmployeeStatus.ON_BREAK: return <Coffee className="w-3 h-3 text-white" />;
            default: return <PhoneOff className="w-3 h-3 text-white" />;
        }
    };

    const getStatusColor = (status: EmployeeStatus) => {
        switch(status) {
            case EmployeeStatus.AVAILABLE: return 'bg-emerald-500';
            case EmployeeStatus.IN_SURGERY: return 'bg-rose-500 animate-pulse';
            case EmployeeStatus.BUSY: return 'bg-amber-500';
            case EmployeeStatus.ON_BREAK: return 'bg-yellow-500';
            default: return 'bg-slate-400';
        }
    };

    return (
        <div className="space-y-8 animate-slide-up max-w-7xl mx-auto relative pb-20">
             {/* Delete Confirmation Modal */}
             {deleteConfirmOpen && employeeToDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border-2 border-rose-100">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-rose-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Employee?</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-2">
                                You are about to permanently remove <span className="font-bold text-slate-800">{employeeToDelete.name}</span>.
                            </p>
                            <div className="p-3 bg-rose-50 rounded-lg text-rose-700 text-xs font-bold">
                                This action cannot be undone.
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 flex gap-3">
                            <button 
                                onClick={() => setDeleteConfirmOpen(false)}
                                className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-white transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDelete}
                                className="flex-1 py-3 rounded-xl bg-rose-600 font-bold text-white hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all"
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
             )}

             {/* Credential Management Modal */}
             {credentialModalOpen && selectedEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Update Credentials</h3>
                                <p className="text-xs text-slate-500 mt-1">Manage access for {selectedEmployee.name}</p>
                            </div>
                            <button onClick={() => setCredentialModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 bg-white rounded-full shadow-sm hover:shadow transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveCredentials} className="p-8 space-y-6">
                            <div className="flex justify-center mb-4">
                                <div className="relative">
                                    <img src={selectedEmployee.avatar} alt="avatar" className="w-20 h-20 rounded-full border-4 border-slate-100" />
                                    <div className="absolute bottom-0 right-0 bg-purple-500 text-white p-1.5 rounded-full border-2 border-white">
                                        <Key className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
                                    <input 
                                        type="text" 
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 flex justify-between">
                                        Password
                                        <button 
                                            type="button" 
                                            onClick={generateRandomPassword}
                                            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                        >
                                            <RefreshCw className="w-3 h-3" /> Generate Random
                                        </button>
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-mono"
                                            required
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => {navigator.clipboard.writeText(newPassword);}}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500"
                                            title="Copy to clipboard"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                                        <Lock className="w-3 h-3" />
                                        Visible for admin administration purposes only
                                    </p>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                className="w-full py-3.5 rounded-xl bg-purple-600 font-bold text-white hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Save New Credentials
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Employee Modal */}
            {addEmployeeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Onboard New Employee</h3>
                                <p className="text-xs text-slate-500 mt-1">Enter staff details and assign initial credentials</p>
                            </div>
                            <button onClick={() => setAddEmployeeModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 bg-white rounded-full shadow-sm hover:shadow transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="overflow-y-auto custom-scrollbar p-8">
                            <form onSubmit={handleAddSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Personal Details */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input 
                                                type="text" 
                                                value={addForm.name}
                                                onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                placeholder="Dr. Jane Doe"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Role</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <select 
                                                value={addForm.role}
                                                onChange={(e) => setAddForm({...addForm, role: e.target.value as Role})}
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                                            >
                                                {Object.values(Role).map(role => (
                                                    <option key={role} value={role}>{role}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Department</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <select 
                                                value={addForm.department}
                                                onChange={(e) => setAddForm({...addForm, department: e.target.value as Department})}
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                                            >
                                                {Object.values(Department).map(dept => (
                                                    <option key={dept} value={dept}>{dept}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input 
                                                type="email" 
                                                value={addForm.email}
                                                onChange={(e) => setAddForm({...addForm, email: e.target.value})}
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                placeholder="email@medishift.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                                        <div className="relative">
                                            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input 
                                                type="tel" 
                                                value={addForm.phoneNumber}
                                                onChange={(e) => setAddForm({...addForm, phoneNumber: e.target.value})}
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                placeholder="+1 (555) 000-0000"
                                            />
                                        </div>
                                    </div>

                                    {/* Credentials Divider */}
                                    <div className="md:col-span-2 pt-4 pb-2 border-t border-slate-100">
                                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-purple-600" />
                                            Login Credentials
                                        </h4>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
                                        <input 
                                            type="text" 
                                            value={addForm.username}
                                            onChange={(e) => setAddForm({...addForm, username: e.target.value})}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                            placeholder="j.doe"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Initial Password</label>
                                        <input 
                                            type="text" 
                                            value={addForm.password}
                                            onChange={(e) => setAddForm({...addForm, password: e.target.value})}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-mono"
                                            placeholder="password123"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setAddEmployeeModalOpen(false)}
                                        className="flex-1 py-3.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-[2] py-3.5 rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        Add Employee
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Employee Modal */}
            {editEmployeeModalOpen && editForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Edit Employee Details</h3>
                                <p className="text-xs text-slate-500 mt-1">Update information for {editForm.name}</p>
                            </div>
                            <button onClick={() => setEditEmployeeModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 bg-white rounded-full shadow-sm hover:shadow transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="overflow-y-auto custom-scrollbar p-8">
                            <form onSubmit={handleEditSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input 
                                                type="text" 
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Role</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <select 
                                                value={editForm.role}
                                                onChange={(e) => setEditForm({...editForm, role: e.target.value as Role})}
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                                            >
                                                {Object.values(Role).map(role => (
                                                    <option key={role} value={role}>{role}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Department</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <select 
                                                value={editForm.department}
                                                onChange={(e) => setEditForm({...editForm, department: e.target.value as Department})}
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                                            >
                                                {Object.values(Department).map(dept => (
                                                    <option key={dept} value={dept}>{dept}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input 
                                                type="email" 
                                                value={editForm.email || ''}
                                                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                                        <div className="relative">
                                            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input 
                                                type="tel" 
                                                value={editForm.phoneNumber || ''}
                                                onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})}
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setEditEmployeeModalOpen(false)}
                                        className="flex-1 py-3.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-[2] py-3.5 rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Staff Directory</h2>
                    <p className="text-slate-500 mt-1 font-medium">Manage your medical team</p>
                </div>
                {currentUser.role === Role.ADMIN && (
                    <button 
                        onClick={() => setAddEmployeeModalOpen(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <UserPlus className="w-4 h-4" />
                        Add Employee
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {employees.map((emp) => (
                    <div key={emp.id} className="group bg-white rounded-3xl shadow-sm border border-slate-100 overflow-visible hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 relative flex flex-col h-full">
                        {/* Cover Area */}
                        <div className="h-24 bg-gradient-to-r from-slate-100 to-slate-200 relative overflow-hidden rounded-t-3xl shrink-0">
                            <div className="absolute top-4 right-4 flex gap-2">
                                <div className="relative">
                                    <button 
                                        onClick={(e) => toggleMenu(emp.id, e)}
                                        className="p-2 bg-white/50 hover:bg-white rounded-full backdrop-blur-sm transition-colors text-slate-600"
                                    >
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                    
                                    {/* Dropdown Menu */}
                                    {activeMenuId === emp.id && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-20 animate-slide-up">
                                            {currentUser.role === Role.ADMIN && (
                                                <>
                                                    <button 
                                                        onClick={() => openEditModal(emp)}
                                                        className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2"
                                                    >
                                                        <Edit className="w-4 h-4" /> Edit Details
                                                    </button>
                                                    <button 
                                                        onClick={() => openCredentialModal(emp)}
                                                        className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-purple-600 flex items-center gap-2"
                                                    >
                                                        <Key className="w-4 h-4" /> Credentials
                                                    </button>
                                                    <div className="h-px bg-slate-100 my-1"></div>
                                                    <button 
                                                        onClick={() => handleDeleteClick(emp)}
                                                        className="w-full text-left px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                                    >
                                                        <Trash2 className="w-4 h-4" /> Remove
                                                    </button>
                                                </>
                                            )}
                                            {currentUser.role !== Role.ADMIN && (
                                                <div className="px-4 py-2 text-xs text-slate-400 italic text-center">
                                                    View Only Access
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Content */}
                        <div className="px-6 pb-6 -mt-12 relative z-10 flex-1 flex flex-col">
                            <div className="flex justify-between items-end">
                                <div className="relative">
                                    <img src={emp.avatar} alt={emp.name} className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md bg-white" />
                                    <div className={`absolute -bottom-2 -right-2 p-1.5 rounded-lg border-2 border-white ${getStatusColor(emp.currentStatus)} transition-colors`}>
                                        {getStatusIcon(emp.currentStatus)}
                                    </div>
                                </div>
                                <div className="mb-1 text-right">
                                    <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500">
                                        {emp.department}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="mt-3 flex-1">
                                <h3 className="text-lg font-bold text-slate-900">{emp.name}</h3>
                                <p className="text-blue-600 font-medium text-sm">{emp.role}</p>
                            </div>

                            <div className="mt-6 space-y-3">
                                <div className="flex items-center gap-3 pt-6 border-t border-slate-50">
                                    <a href={`mailto:${emp.email}`} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-50 text-slate-600 text-sm font-bold hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                        <Mail className="w-4 h-4" />
                                        Email
                                    </a>
                                    <a href={`tel:${emp.phoneNumber}`} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-50 text-slate-600 text-sm font-bold hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                        <Phone className="w-4 h-4" />
                                        Call
                                    </a>
                                </div>
                                
                                {/* Admin Specific Actions Toolbar - Explicitly Visible */}
                                {currentUser.role === Role.ADMIN && (
                                    <div className="flex items-center gap-2 pt-2">
                                        <button 
                                            onClick={() => openEditModal(emp)}
                                            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold transition-colors"
                                            title="Edit Details"
                                        >
                                            <Edit className="w-3 h-3" /> Edit
                                        </button>
                                        <button 
                                            onClick={() => openCredentialModal(emp)}
                                            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 text-xs font-bold transition-colors"
                                            title="Update Credentials"
                                        >
                                            <Key className="w-3 h-3" /> Access
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteClick(emp)}
                                            className="flex items-center justify-center p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                                            title="Delete Employee"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EmployeeList;
