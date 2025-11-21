import React, { useState } from 'react';
import { FileCode, Download, Database, Server, Copy, Check, Globe } from 'lucide-react';
import { Employee, Shift } from '../types';

interface SettingsProps {
  employees: Employee[];
  shifts: Shift[];
  onNotify: (title: string, message: string, type: 'info' | 'warning' | 'success' | 'error') => void;
}

const Settings: React.FC<SettingsProps> = ({ employees, shifts, onNotify }) => {
  const [copied, setCopied] = useState(false);

  const generateJavaEntities = () => {
    const date = new Date().toISOString().split('T')[0];
    
    return `/* 
 * MediShift Enterprise Integration
 * Generated: ${date}
 * Target: Java Spring Boot 3.x
 */

package com.medishift.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

/**
 * Employee Entity
 * Mapped from TypeScript interface: Employee
 */
@Entity
@Data
@Table(name = "employees")
public class Employee {
    
    @Id
    private String id;
    
    @Column(nullable = false)
    private String name;
    
    @Enumerated(EnumType.STRING)
    private Role role;
    
    @Enumerated(EnumType.STRING)
    private Department department;
    
    @Column(name = "avatar_url")
    private String avatar;
    
    @Enumerated(EnumType.STRING)
    private EmployeeStatus currentStatus;

    // Enum Definitions
    public enum Role { DOCTOR, NURSE, ADMIN, TECH }
    public enum Department { ER, ICU, PEDS, SURG, GEN }
    public enum EmployeeStatus { AVAILABLE, IN_SURGERY, ON_BREAK, BUSY, OFF_DUTY }
}

/**
 * Shift Entity
 * Mapped from TypeScript interface: Shift
 */
@Entity
@Data
@Table(name = "shifts")
public class Shift {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @Enumerated(EnumType.STRING)
    private ShiftType type;

    public enum ShiftType { MORNING, AFTERNOON, NIGHT, OFF }
}

/*
 * Current Data Snapshot (JSON for Seeding)
 */
// Total Employees: ${employees.length}
// Total Scheduled Shifts: ${shifts.length}
`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateJavaEntities());
    setCopied(true);
    onNotify("Code Copied", "Java entity classes copied to clipboard.", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([generateJavaEntities()], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "MediShiftDomain.java";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    onNotify("Download Started", "MediShiftDomain.java is downloading.", "success");
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-xl">
                <FileCode className="w-6 h-6 text-orange-600" />
            </div>
            System Settings
          </h2>
          <p className="text-slate-500 mt-2 font-medium ml-14">Configuration & Enterprise Integration</p>
        </div>
        <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 text-sm font-bold flex items-center gap-2">
            <Globe className="w-4 h-4" />
            System Online
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Integration Panel */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Database className="w-4 h-4 text-slate-500" />
                            Java Backend Integration
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Generate JPA Entities for Spring Boot</p>
                    </div>
                    <div className="flex gap-2">
                         <button 
                            onClick={handleCopy}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Copy Code"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button 
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            <Download className="w-3 h-3" />
                            Download .java
                        </button>
                    </div>
                </div>
                <div className="bg-[#1e1e1e] text-blue-100 p-6 overflow-x-auto custom-scrollbar">
                    <pre className="font-mono text-xs leading-relaxed">
                        <code>{generateJavaEntities()}</code>
                    </pre>
                </div>
            </div>
        </div>

        {/* Connection Status */}
        <div className="space-y-6">
             <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Server className="w-4 h-4 text-slate-400" />
                    Server Status
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-slate-700">React Frontend</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Active</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span className="text-sm font-medium text-slate-700">Java Middleware</span>
                        </div>
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md">Ready to Export</span>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mt-4">
                        <p className="text-xs text-blue-700 font-medium leading-relaxed">
                            <span className="font-bold block mb-1">Integration Note:</span>
                            Use the generated Java classes to map the current frontend state to your Hibernate/JPA persistence layer.
                        </p>
                    </div>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;