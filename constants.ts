
import { Department, Role, Employee, Shift, ShiftType, LeaveStatus, LeaveRequest, EmployeeStatus } from './types';

export const MOCK_STAFF: Employee[] = [
  { id: 's1', name: 'Dr. Sarah Chen', role: Role.DOCTOR, department: Department.ER, avatar: 'https://picsum.photos/100/100?random=1', currentStatus: EmployeeStatus.AVAILABLE, distanceFromHospital: 5, email: 'sarah.chen@medishift.com', phoneNumber: '+1 (555) 123-4567', username: 'sarah', password: 'password' },
  { id: 's2', name: 'James Wilson', role: Role.NURSE, department: Department.ICU, avatar: 'https://picsum.photos/100/100?random=2', currentStatus: EmployeeStatus.BUSY, distanceFromHospital: 12, email: 'j.wilson@medishift.com', phoneNumber: '+1 (555) 234-5678', username: 'james', password: 'password' },
  { id: 's3', name: 'Dr. Emily Davis', role: Role.DOCTOR, department: Department.SURG, avatar: 'https://picsum.photos/100/100?random=3', currentStatus: EmployeeStatus.OFF_DUTY, distanceFromHospital: 3, email: 'emily.davis@medishift.com', phoneNumber: '+1 (555) 345-6789', username: 'emily', password: 'password' },
  { id: 's4', name: 'Michael Brown', role: Role.INTERN, department: Department.ER, avatar: 'https://picsum.photos/100/100?random=4', currentStatus: EmployeeStatus.AVAILABLE, distanceFromHospital: 8, email: 'm.brown@medishift.com', phoneNumber: '+1 (555) 456-7890', username: 'michael', password: 'password' },
  { id: 's5', name: 'Linda Martinez', role: Role.NURSE, department: Department.PEDS, avatar: 'https://picsum.photos/100/100?random=5', currentStatus: EmployeeStatus.ON_BREAK, distanceFromHospital: 6, email: 'l.martinez@medishift.com', phoneNumber: '+1 (555) 567-8901', username: 'linda', password: 'password' },
  { id: 's6', name: 'Dr. Robert Taylor', role: Role.DOCTOR, department: Department.ONCOLOGY, avatar: 'https://picsum.photos/100/100?random=6', currentStatus: EmployeeStatus.AVAILABLE, distanceFromHospital: 15, email: 'r.taylor@medishift.com', phoneNumber: '+1 (555) 678-9012', username: 'robert', password: 'password' },
  { id: 's7', name: 'Susan Clark', role: Role.NURSE, department: Department.ER, avatar: 'https://picsum.photos/100/100?random=7', currentStatus: EmployeeStatus.AVAILABLE, distanceFromHospital: 2, email: 's.clark@medishift.com', phoneNumber: '+1 (555) 789-0123', username: 'susan', password: 'password' },
  { id: 's8', name: 'David Miller', role: Role.INTERN, department: Department.GEN, avatar: 'https://picsum.photos/100/100?random=8', currentStatus: EmployeeStatus.OFF_DUTY, distanceFromHospital: 20, email: 'd.miller@medishift.com', phoneNumber: '+1 (555) 890-1234', username: 'david', password: 'password' },
];

// Helper to generate some shifts for the current week
const today = new Date();
const generateShifts = (): Shift[] => {
  const shifts: Shift[] = [];
  const days = [-2, -1, 0, 1, 2, 3, 4]; // Past 2 days and next 4
  
  days.forEach((dayOffset, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);
    const dateStr = date.toISOString().split('T')[0];
    
    // Assign random staff to shifts
    shifts.push({
      id: `sh-${i}-1`,
      employeeId: 's1',
      date: dateStr,
      type: ShiftType.MORNING,
    });
    
    shifts.push({
      id: `sh-${i}-2`,
      employeeId: 's2',
      date: dateStr,
      type: ShiftType.AFTERNOON,
    });
    
    shifts.push({
      id: `sh-${i}-3`,
      employeeId: 's7',
      date: dateStr,
      type: ShiftType.NIGHT,
    });
  });
  return shifts;
};

export const MOCK_SHIFTS: Shift[] = generateShifts();

export const MOCK_LEAVES: LeaveRequest[] = [
  { id: 'l1', employeeId: 's5', startDate: '2023-10-25', endDate: '2023-10-28', reason: 'Flu', status: LeaveStatus.APPROVED },
  { id: 'l2', employeeId: 's3', startDate: '2023-11-01', endDate: '2023-11-05', reason: 'Conference', status: LeaveStatus.PENDING },
  { id: 'l3', employeeId: 's8', startDate: '2023-10-30', endDate: '2023-10-31', reason: 'Family Emergency', status: LeaveStatus.REJECTED },
];