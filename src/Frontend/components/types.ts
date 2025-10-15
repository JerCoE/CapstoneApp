// src/Frontend/components/types.ts
export type LeaveType = 'Vacation' | 'Sick' | 'Personal' | 'Unpaid' | 'Holiday' | 'Maternity';

export type SavedLeaveRequest = {
  id: string;
  user?: string;
  type: LeaveType;
  from: string;       // ISO date (yyyy-mm-dd)
  to: string;         // ISO date
  reason: string;
  days: number;
  submittedAt: string; // ISO datetime
};