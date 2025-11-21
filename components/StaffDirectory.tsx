
import React from 'react';
import { Employee } from '../types';
import { Mail, Stethoscope } from 'lucide-react';

interface StaffDirectoryProps {
    staff: Employee[];
}

const StaffDirectory: React.FC<StaffDirectoryProps> = ({ staff }) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Staff Directory</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Add New Staff
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staff.map((person) => (
                    <div key={person.id} className="bg-white rounded-xl border border-slate-100 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                        <div className="relative mb-4">
                            <img src={person.avatar} alt={person.name} className="w-20 h-20 rounded-full object-cover ring-4 ring-slate-50" />
                            <span className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-4 border-white ${person.currentStatus === 'Available' ? 'bg-green-500' : person.currentStatus === 'On Break' ? 'bg-amber-500' : 'bg-slate-300'}`}></span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg">{person.name}</h3>
                        <p className="text-blue-600 font-medium text-sm mb-1">{person.role}</p>
                        <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-4">{person.department}</p>
                        
                        <div className="w-full border-t border-slate-100 pt-4 flex justify-around">
                             <button className="text-slate-400 hover:text-blue-600 transition-colors">
                                 <Mail size={20} />
                             </button>
                             <button className="text-slate-400 hover:text-blue-600 transition-colors">
                                 <Stethoscope size={20} />
                             </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default StaffDirectory;
