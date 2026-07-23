export interface Timesheet {
  id: string;
  employeeName: string;
  date: string;
  hours: number;
  taskDescription: string;
  status: "Draft" | "Pending Approval" | "Approved" | "Rejected";
  comments?: string;
  projectCode: string;
}
