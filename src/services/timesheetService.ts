import { Timesheet } from "@/types/timesheet";

// In-memory mock database populated with realistic entries
let mockTimesheets: Timesheet[] = [
  {
    id: "TS-001",
    employeeName: "Rajvi Test",
    date: "2026-07-20",
    projectCode: "DIW001",
    hours: 8.0,
    status: "Approved",
    taskDescription: "Implemented Phase 1: Reusable layout container shell including TopNavbar, Sidebar, and AppLayout integration.",
    comments: "Great start on the POC foundation! Layout is highly responsive.",
  },
  {
    id: "TS-002",
    employeeName: "Rajvi Test",
    date: "2026-07-21",
    projectCode: "PRJ-902",
    hours: 7.5,
    status: "Pending Approval",
    taskDescription: "Designed generic metadata interfaces and defined timesheets grid/form schemas. Prepared service-layer stubs.",
  },
  {
    id: "TS-003",
    employeeName: "John Doe",
    date: "2026-07-20",
    projectCode: "PRJ-504",
    hours: 8.5,
    status: "Approved",
    taskDescription: "Investigated Blazor 23k-line grid code to extract filtering and custom column rendering rules.",
    comments: "Approved by PM.",
  },
  {
    id: "TS-004",
    employeeName: "Alice Smith",
    date: "2026-07-21",
    projectCode: "OPS-100",
    hours: 4.0,
    status: "Draft",
    taskDescription: "Compiled documentation templates for standardizing metadata schemas across secondary operational modules.",
  },
  {
    id: "TS-005",
    employeeName: "John Doe",
    date: "2026-07-22",
    projectCode: "PRJ-902",
    hours: 8.0,
    status: "Rejected",
    taskDescription: "Debugged old caching system causing memory leaks during large datasets loads.",
    comments: "Please provide a more detailed task breakdown.",
  },
];

// Helper to simulate network latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const timesheetService = {
  // Fetch all records
  async getAll(): Promise<Timesheet[]> {
    await delay(300); // Simulate network latency
    // Return a copy to prevent accidental direct state mutations
    return [...mockTimesheets];
  },

  // Get a single record by ID
  async getById(id: string): Promise<Timesheet | undefined> {
    await delay(200);
    const item = mockTimesheets.find((ts) => ts.id === id);
    return item ? { ...item } : undefined;
  },

  // Create a new record
  async create(record: Omit<Timesheet, "id">): Promise<Timesheet> {
    await delay(400);
    const newRecord: Timesheet = {
      ...record,
      id: `TS-${Math.floor(100 + Math.random() * 900)}`, // Generate TS-XXX id
    };
    mockTimesheets = [newRecord, ...mockTimesheets]; // Insert at the beginning
    return { ...newRecord };
  },

  // Update an existing record
  async update(id: string, updates: Partial<Timesheet>): Promise<Timesheet> {
    await delay(400);
    let updatedRecord: Timesheet | null = null;

    mockTimesheets = mockTimesheets.map((ts) => {
      if (ts.id === id) {
        updatedRecord = { ...ts, ...updates } as Timesheet;
        return updatedRecord;
      }
      return ts;
    });

    if (!updatedRecord) {
      throw new Error(`Record with ID ${id} not found.`);
    }

    return updatedRecord;
  },

  // Delete a record
  async delete(id: string): Promise<boolean> {
    await delay(300);
    const originalLength = mockTimesheets.length;
    mockTimesheets = mockTimesheets.filter((ts) => ts.id !== id);
    return mockTimesheets.length < originalLength;
  },
};
