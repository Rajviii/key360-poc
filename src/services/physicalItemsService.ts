// In-memory mock database populated with realistic physical item records
let mockPhysicalItems: any[] = [
  {
    id: "ITEM-001",
    physicalItemId: "PI-20093",
    copyChildItemsFrom: "PI-Template-Valves",
    commodity: "Mechanical - Valves",
    customId: "FCV-901-A",
    name: "Flow Control Globe Valve 4-inch",
    serialNo: "SN-9827364-G",
    totalStock: 14,
    batchNo: "B-2026-VALV",
    revision: "B",
    version: "2.1",
    type: "Globe Valve",
    class: "ANSI Class 300",
    category: "Piping Components",
    software: "N/A",
    lastStatusComment: "Calibration verified and certified by third-party inspector.",
    nextDueDate: "2026-10-24",
    nextResponsiblePerson: "Rajvi Test",
    statusHistory: "Draft -> Pending -> Inspected",
  },
  {
    id: "ITEM-002",
    physicalItemId: "PI-40192",
    copyChildItemsFrom: "PI-Template-Pumps",
    commodity: "Rotary Equipment",
    customId: "PMP-102-B",
    name: "Centrifugal Water Pump 15HP",
    serialNo: "SN-4432109-P",
    totalStock: 3,
    batchNo: "B-2025-PUMP",
    revision: "A",
    version: "1.0",
    type: "Centrifugal Pump",
    class: "Heavy Duty",
    category: "Pumps / Motors",
    software: "Siemens Motor Controller v4",
    lastStatusComment: "Scheduled maintenance completed. Vibration levels normal.",
    nextDueDate: "2026-08-30",
    nextResponsiblePerson: "Yash Patel",
    statusHistory: "Draft -> Active",
  },
  {
    id: "ITEM-003",
    physicalItemId: "PI-11204",
    copyChildItemsFrom: "N/A",
    commodity: "Instrumentation - Flow",
    customId: "FIT-304",
    name: "Electromagnetic Flow Transmitter",
    serialNo: "SN-1092834-E",
    totalStock: 8,
    batchNo: "B-2026-INST",
    revision: "C",
    version: "3.2",
    type: "Transmitter",
    class: "IP67 Rated",
    category: "Instruments",
    software: "HART Protocol Configurator v2.1",
    lastStatusComment: "Zero-point adjustment performed in the calibration lab.",
    nextDueDate: "2026-11-15",
    nextResponsiblePerson: "John Doe",
    statusHistory: "Received -> Calibrated -> Staged",
  },
  {
    id: "ITEM-004",
    physicalItemId: "PI-99801",
    copyChildItemsFrom: "PI-Template-Structures",
    commodity: "Structural Steel",
    customId: "BM-A572-12",
    name: "Structural I-Beam A572 Grade 50",
    serialNo: "SN-N/A-STEEL",
    totalStock: 120,
    batchNo: "B-2026-S1",
    revision: "A",
    version: "1.0",
    type: "Steel Beam",
    class: "Grade 50",
    category: "Structural Material",
    software: "N/A",
    lastStatusComment: "Visual inspections for surface rust completed. Clear coating applied.",
    nextDueDate: "2027-01-10",
    nextResponsiblePerson: "Alice Smith",
    statusHistory: "Raw -> Blasted -> Coated",
  }
];

// Helper to simulate network latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const physicalItemsService = {
  // Fetch all items
  async getAll(): Promise<any[]> {
    await delay(300);
    return [...mockPhysicalItems];
  },

  // Get single item by ID
  async getById(id: string): Promise<any | undefined> {
    await delay(200);
    const item = mockPhysicalItems.find((pi) => pi.id === id);
    return item ? { ...item } : undefined;
  },

  // Create new physical item
  async create(record: any): Promise<any> {
    await delay(400);
    const newRecord: any = {
      ...record,
      id: `ITEM-${Math.floor(100 + Math.random() * 900)}`,
      totalStock: record.totalStock ? Number(record.totalStock) : 0,
    };
    mockPhysicalItems = [newRecord, ...mockPhysicalItems];
    return { ...newRecord };
  },

  // Update existing physical item
  async update(id: string, updates: Partial<any>): Promise<any> {
    await delay(400);
    let updatedRecord: any = null;

    mockPhysicalItems = mockPhysicalItems.map((pi) => {
      if (pi.id === id) {
        updatedRecord = { 
          ...pi, 
          ...updates,
          totalStock: updates.totalStock !== undefined ? Number(updates.totalStock) : pi.totalStock
        };
        return updatedRecord;
      }
      return pi;
    });

    if (!updatedRecord) {
      throw new Error(`Physical Item with ID ${id} not found.`);
    }

    return updatedRecord;
  },

  // Delete a physical item
  async delete(id: string): Promise<boolean> {
    await delay(300);
    const originalLength = mockPhysicalItems.length;
    mockPhysicalItems = mockPhysicalItems.filter((pi) => pi.id !== id);
    return mockPhysicalItems.length < originalLength;
  },
};
