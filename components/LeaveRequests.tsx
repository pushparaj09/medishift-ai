

import React, { useState } from 'react';
import { Check, X, Calendar, FileText, Clock, Plus, AlertCircle, ArrowRight } from 'lucide-react';
import { LeaveRequest, Employee, Role } from '../types';

interface LeaveRequestsProps {
  leaves: LeaveRequest[];
  employees: Employee[];
  setLeaves: React.Dispatch<React.SetStateAction<LeaveRequest[]>>;
  onNotify: (title: string, message: string, type: 'info' | 'warning' | 'success' | 'error') => void;
  onSendNotification: (targetUserId: string, title: string, message: string, type: 'system' | 'alert' | 'success') => void;
  currentUser: Employee;
}

const LeaveRequests: React.FC<LeaveRequestsProps> = ({ leaves, employees, setLeaves, onNotify, onSendNotification, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [requestReason, setRequestReason] = useState('');

  const filteredLeaves = currentUser.role === Role.ADMIN 
    ? leaves 
    : leaves.filter(l => l.employeeId === currentUser.id);

  const handleAction = (id: string, status: 'Approved' | 'Rejected') => {
    setLeaves(prev => prev.map(leave => 
      leave.id === id ? { ...leave, status } : leave
    ));

    const leave = leaves.find(l => l.id === id);
    if (leave) {
      // Notify the user who requested the leave
      if (status === 'Approved') {
        onSendNotification(
          leave.employeeId,
          "Leave Request Approved",
          `Your leave request from ${leave.startDate} to ${leave.endDate} has been approved.`,
          "success"
        );

        const emp = employees.find(e => e.id === leave.employeeId);
        if (emp && emp.role === Role.DOCTOR) {
          onNotify(
            "Alert: Doctor Unavailable", 
            `Dr. ${emp.name} is on approved leave from ${leave.startDate} to ${leave.endDate}.`, 
            "warning"
          );
        }
      } else {
        onSendNotification(
          leave.employeeId,
          "Leave Request Rejected",
          `Your leave request from ${leave.startDate} to ${leave.endDate} has been rejected.`,
          "alert"
        );
      }
    }
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !requestReason) {
        onNotify("Incomplete Request", "Please select start/end dates and provide a reason.", "error");
        return;
    }

    if (new Date(endDate) < new Date(startDate)) {
        onNotify("Invalid Date Range", "End date cannot be before start date.", "error");
        return;
    }

    const newRequest: LeaveRequest = {
        id: Math.random().toString(36).substr(2, 9),
        employeeId: currentUser.id,
        startDate: startDate,
        endDate: endDate,
        reason: requestReason,
        status: 'Pending'
    };

    setLeaves(prev => [newRequest, ...prev]);
    setIsModalOpen(false);
    setStartDate('');
    setEndDate('');
    setRequestReason('');
    onNotify("Request Submitted", "Your leave request has been submitted for approval.", "success");
  };

  const getEmployee = (id: string) => employees.find(e => e.id === id);

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto relative">
      {/* Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900">Request Leave</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">From Date</label>
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">To Date</label>
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate || new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Reason</label>
                        <textarea 
                            value={requestReason}
                            onChange={(e) => setRequestReason(e.target.value)}
                            placeholder="e.g., Medical Appointment, Personal Day..."
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all h-32 resize-none"
                        />
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button 
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 py-3 rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-colors"
                        >
                            Submit Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Leave Requests</h2>
            <p className="text-slate-500 mt-1 font-medium">Manage time off and approvals</p>
        </div>
        <div className="flex gap-3">
            <div className="hidden md:flex bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm text-sm font-bold text-slate-600 items-center">
                Pending: <span className="text-amber-600 ml-1">{filteredLeaves.filter(l => l.status === 'Pending').length}</span>
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5"
            >
                <Plus className="w-4 h-4" />
                New Request
            </button>
        </div>
      </div>

      <div className="space-y-4">
          {filteredLeaves.length === 0 && (
             <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 border-dashed">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900">All Caught Up</h3>
                <p className="text-slate-500">No pending leave requests at the moment.</p>
             </div>
          )}
          {filteredLeaves.map((leave) => {
            const emp = getEmployee(leave.employeeId);
            if (!emp) return null;
            const isPending = leave.status === 'Pending';
            const isAdmin = currentUser.role === Role.ADMIN;
            
            return (
              <div key={leave.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-blue-100 group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <img src={emp.avatar} alt={emp.name} className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-sm" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-slate-900 text-lg">{emp.name}</h4>
                          <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md uppercase tracking-wider">{emp.department}</span>
                      </div>
                      <p className="text-slate-500 text-sm font-medium">{emp.role}</p>
                    </div>
                  </div>

                  <div className="flex-1 md:px-8 border-l border-slate-100 md:ml-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mt-0.5">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Dates</span>
                                <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    {leave.startDate}
                                    {leave.startDate !== leave.endDate && (
                                        <> <ArrowRight className="w-3 h-3 text-slate-400" /> {leave.endDate}</>
                                    )}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                             <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg mt-0.5">
                                <FileText className="w-4 h-4" />
                            </div>
                             <div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Reason</span>
                                <span className="text-sm font-medium text-slate-700">{leave.reason}</span>
                            </div>
                        </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {isPending && isAdmin ? (
                      <>
                        <button 
                          onClick={() => handleAction(leave.id, 'Rejected')}
                          className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all"
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => handleAction(leave.id, 'Approved')}
                          className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-blue-600 shadow-lg shadow-slate-200 transition-all hover:-translate-y-0.5"
                        >
                          Approve
                        </button>
                      </>
                    ) : (
                      <span className={`px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${
                          leave.status === 'Approved' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : leave.status === 'Rejected'
                          ? 'bg-rose-50 text-rose-600 border border-rose-100'
                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                          {leave.status === 'Approved' && <Check className="w-4 h-4" />}
                          {leave.status === 'Rejected' && <X className="w-4 h-4" />}
                          {leave.status === 'Pending' && <Clock className="w-4 h-4" />}
                          {leave.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default LeaveRequests;
