

export enum Department {
  ER = 'Emergency Room',
  ICU = 'Intensive Care Unit',
  PEDS = 'Pediatrics',
  SURG = 'Surgery',
  GEN = 'General Ward',
  ONCOLOGY = 'Oncology'
}

export enum Role {
  DOCTOR = 'Doctor',
  NURSE = 'Nurse',
  ADMIN = 'Administrator',
  TECH = 'Technician',
  INTERN = 'Intern'
}

export enum ShiftType {
  MORNING = 'Morning', // 06:00 - 14:00
  AFTERNOON = 'Afternoon', // 14:00 - 22:00
  NIGHT = 'Night', // 22:00 - 06:00
  OFF = 'Off'
}

export enum EmployeeStatus {
  AVAILABLE = 'Available',
  IN_SURGERY = 'In Surgery',
  ON_BREAK = 'On Break',
  BUSY = 'Busy',
  OFF_DUTY = 'Off Duty'
}

export enum LeaveStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export interface Employee {
  id: string;
  name: string;
  role: Role;
  department: Department;
  avatar: string;
  currentStatus: EmployeeStatus;
  distanceFromHospital: number; // Distance in km
  email?: string;
  phoneNumber?: string;
  username?: string;
  password?: string;
}

export interface Shift {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  type: ShiftType;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface ShiftSwapRequest {
  id: string;
  requestingEmployeeId: string;
  targetEmployeeId: string;
  requestingDate: string;
  targetDate: string;
  requestingShiftType: ShiftType;
  targetShiftType: ShiftType;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface ForecastDataPoint {
  date: string;
  predictedDemand: number; // 0-100 scale of hospital load
  requiredStaff: number;
  currentScheduled: number;
}

export interface ForecastResponse {
  analysis: string;
  data: ForecastDataPoint[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: number;
}

export interface UserNotification {
  id: string;
  targetUserId: string;
  title: string;
  message: string;
  type: 'system' | 'alert' | 'success';
  timestamp: number;
  isRead: boolean;
}