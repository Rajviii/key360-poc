import { IDataProvider } from "./IDataProvider";
import { CachingDataProvider } from "./caching";

export interface EmployeeItem {
  id: number;
  empId: string;
  employeeName: string;
  department: string;
  designation: string;
  manager: string;
  status: string;
  email: string;
  phone: string;
  joinDate: string;
  salaryGrade: string;
  location: string;
}

const FIRST_NAMES = ["Alex", "Jordan", "Taylor", "Morgan", "Sam", "Chris", "Pat", "Riley", "Casey", "Dakota", "Avery", "Reese", "Quinn", "Skyler", "Rowan", "Peyton", "Emerson", "Finley", "Hayden", "Kendall"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
const DEPARTMENTS = ["Engineering", "Product Management", "Human Resources", "Finance & Accounting", "Sales & Marketing", "Operations & Logistics", "Legal & Compliance", "Customer Success"];
const DESIGNATIONS = ["Senior Software Engineer", "Product Manager", "HR Business Partner", "Financial Analyst", "Account Executive", "Operations Lead", "Compliance Specialist", "Support Specialist", "Engineering Manager", "VP of Operations"];
const MANAGERS = ["Yash Viradia", "Rajvi Test", "Sarah Jenkins", "Michael Scott", "Elena Rostova", "David Chen", "Amanda Hugg"];
const STATUSES = ["Active", "Active", "Active", "Active", "Active", "On Leave", "Probation"];
const LOCATIONS = ["New York, USA", "London, UK", "Austin, TX", "Singapore", "Berlin, Germany", "Toronto, Canada", "Sydney, Australia"];
const SALARY_GRADES = ["E-1", "E-2", "E-3", "M-1", "M-2", "D-1", "VP-1"];

export function generateEmployees(count = 100000): EmployeeItem[] {
  const employees: EmployeeItem[] = new Array(count);
  
  for (let i = 0; i < count; i++) {
    const fn = FIRST_NAMES[i % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i * 3) % LAST_NAMES.length];
    const dept = DEPARTMENTS[i % DEPARTMENTS.length];
    const desig = DESIGNATIONS[(i * 2) % DESIGNATIONS.length];
    const mgr = MANAGERS[i % MANAGERS.length];
    const status = STATUSES[i % STATUSES.length];
    const loc = LOCATIONS[i % LOCATIONS.length];
    const grade = SALARY_GRADES[i % SALARY_GRADES.length];
    
    // Deterministic dates between 2020-01-01 and 2026-06-30
    const dayOffset = (i * 7) % 2300;
    const dateObj = new Date(2020, 0, 1 + dayOffset);
    const joinDate = dateObj.toISOString().split("T")[0];

    const empIdNum = 100001 + i;
    const empId = `EMP-${empIdNum}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i % 100}@key360.com`;
    const phone = `+1-555-${String((i * 13) % 9000 + 1000)}`;

    employees[i] = {
      id: i + 1,
      empId,
      employeeName: `${fn} ${ln}`,
      department: dept,
      designation: desig,
      manager: mgr,
      status,
      email,
      phone,
      joinDate,
      salaryGrade: grade,
      location: loc,
    };
  }

  return employees;
}

let mockEmployeesData: EmployeeItem[] | null = null;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const employeeService: IDataProvider<EmployeeItem> = {
  async getAll(): Promise<EmployeeItem[]> {
    if (!mockEmployeesData) {
      mockEmployeesData = generateEmployees(100000);
    }
    // Simulate network delay for initial fetch
    await delay(750);
    return mockEmployeesData;
  },

  async getById(id: string | number): Promise<EmployeeItem | undefined> {
    if (!mockEmployeesData) {
      mockEmployeesData = generateEmployees(100000);
    }
    await delay(200);
    const numericId = Number(id);
    return mockEmployeesData.find((e) => e.id === numericId || e.empId === String(id));
  },

  async create(record: Omit<EmployeeItem, "id">): Promise<EmployeeItem> {
    if (!mockEmployeesData) {
      mockEmployeesData = generateEmployees(100000);
    }
    await delay(300);
    const newId = mockEmployeesData.length + 1;
    const newRecord: EmployeeItem = {
      ...record,
      id: newId,
      empId: record.empId || `EMP-${100000 + newId}`,
    };
    mockEmployeesData.unshift(newRecord);
    return newRecord;
  },

  async update(id: string | number, updates: Partial<EmployeeItem>): Promise<EmployeeItem> {
    if (!mockEmployeesData) {
      mockEmployeesData = generateEmployees(100000);
    }
    await delay(300);
    const numericId = Number(id);
    const idx = mockEmployeesData.findIndex((e) => e.id === numericId || e.empId === String(id));
    if (idx === -1) {
      throw new Error(`Employee with ID ${id} not found.`);
    }
    mockEmployeesData[idx] = { ...mockEmployeesData[idx], ...updates };
    return mockEmployeesData[idx];
  },

  async delete(id: string | number): Promise<boolean> {
    if (!mockEmployeesData) {
      mockEmployeesData = generateEmployees(100000);
    }
    await delay(300);
    const numericId = Number(id);
    const initialLen = mockEmployeesData.length;
    mockEmployeesData = mockEmployeesData.filter((e) => e.id !== numericId && e.empId !== String(id));
    return mockEmployeesData.length < initialLen;
  },
};

export const cachedEmployeeService = new CachingDataProvider<EmployeeItem>(
  employeeService,
  "employee_service_cache",
  300
);
