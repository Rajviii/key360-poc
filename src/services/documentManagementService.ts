import { IDataProvider } from "./IDataProvider";
import { DocumentItem } from "@/modules/document-management/types";

const INITIAL_AGREEMENTS: DocumentItem[] = [
  {
    id: "AGR-2026-001",
    title: "Master Subcontractor Equipment Rental Agreement",
    vendor: "Caterpillar Heavy Machinery Ltd.",
    status: "Pending Sign",
    createdDate: "2026-07-15",
    formValues: {},
    signatures: [],
    texts: [
      { id: "txt-1", text: "Approved by Asset Mgr", x: 120, y: 720, page: 1, fontSize: 12 }
    ],
    highlights: [],
    comments: [
      {
        id: "c-1",
        author: "Sarah Jenkins (Legal)",
        text: "Please verify section 4.2 liability clauses before final sign-off.",
        timestamp: "2026-07-16 10:30 AM",
        x: 450,
        y: 200,
        page: 1,
      },
    ],
  },
  {
    id: "AGR-2026-002",
    title: "Key360 Enterprise Software SLA & Vendor Maintenance",
    vendor: "Key360 Systems Inc.",
    status: "Fully Executed",
    createdDate: "2026-06-20",
    formValues: {},
    signatures: [],
    texts: [],
    highlights: [],
    comments: [],
  },
  {
    id: "AGR-2026-003",
    title: "Industrial HVAC System Servicing Contract",
    vendor: "Trane Climate Solutions",
    status: "Draft",
    createdDate: "2026-07-28",
    formValues: {},
    signatures: [],
    texts: [],
    highlights: [],
    comments: [],
  },
  {
    id: "AGR-2026-004",
    title: "Solar Turbine Preventive Maintenance Agreement",
    vendor: "Solar Turbines International",
    status: "Pending Sign",
    createdDate: "2026-07-22",
    formValues: {},
    signatures: [],
    texts: [],
    highlights: [],
    comments: [],
  },
];

const INITIAL_PDF_FORMS: DocumentItem[] = [
  {
    id: "FRM-INSP-101",
    title: "Heavy Equipment Safety & Operational Inspection Form",
    department: "Engineering & Maintenance",
    status: "Draft",
    createdDate: "2026-07-29",
    formValues: {
      employeeName: "Alexander Wright",
      designation: "Senior Lead Inspector",
      department: "Engineering & Maintenance",
      inspectionDate: "2026-07-29",
      complianceStatus: "Compliant",
      checkPassed: true,
      comments: "All hydraulic valves, pressure gauges, and emergency shut-offs passed 100% threshold safety audit.",
    },
    signatures: [],
    texts: [],
    highlights: [],
    comments: [],
  },
  {
    id: "FRM-HSE-202",
    title: "Hazardous Chemical Handling & PPE Audit Checklist",
    department: "Health, Safety & Environment",
    status: "Filled",
    createdDate: "2026-07-27",
    formValues: {
      employeeName: "Elena Rostova",
      designation: "Safety Officer",
      department: "Health, Safety & Environment",
      inspectionDate: "2026-07-27",
      complianceStatus: "Requires Maintenance",
      checkPassed: false,
      comments: "Secondary containment bund requires sealant patch on east wall.",
    },
    signatures: [],
    texts: [],
    highlights: [],
    comments: [],
  },
  {
    id: "FRM-QA-303",
    title: "Turbine Alignment & Vibration Diagnostic Sheet",
    department: "Quality Assurance",
    status: "Approved",
    createdDate: "2026-07-18",
    formValues: {
      employeeName: "Michael Scott",
      designation: "Quality Specialist",
      department: "Quality Assurance",
      inspectionDate: "2026-07-18",
      complianceStatus: "Compliant",
      checkPassed: true,
      comments: "Laser alignment verified within 0.02mm tolerance.",
    },
    signatures: [],
    texts: [],
    highlights: [],
    comments: [],
  },
];

class DocumentServiceStore {
  private agreements: DocumentItem[] = [...INITIAL_AGREEMENTS];
  private pdfForms: DocumentItem[] = [...INITIAL_PDF_FORMS];

  // Agreement Methods
  async getAgreements(): Promise<DocumentItem[]> {
    return this.agreements;
  }

  async getAgreementById(id: string | number): Promise<DocumentItem | undefined> {
    return this.agreements.find((a) => String(a.id) === String(id));
  }

  async updateAgreement(id: string | number, updates: Partial<DocumentItem>): Promise<DocumentItem> {
    const idx = this.agreements.findIndex((a) => String(a.id) === String(id));
    if (idx !== -1) {
      this.agreements[idx] = { ...this.agreements[idx], ...updates };
      return this.agreements[idx];
    }
    throw new Error(`Agreement ${id} not found`);
  }

  async createAgreement(item: Partial<DocumentItem>): Promise<DocumentItem> {
    const newItem: DocumentItem = {
      id: `AGR-2026-${String(this.agreements.length + 1).padStart(3, "0")}`,
      title: item.title || "Untitled Agreement",
      vendor: item.vendor || "External Vendor",
      status: item.status || "Draft",
      createdDate: item.createdDate || new Date().toISOString().split("T")[0],
      signatures: [],
      texts: [],
      highlights: [],
      comments: [],
      formValues: {},
    };
    this.agreements.unshift(newItem);
    return newItem;
  }

  async deleteAgreement(id: string | number): Promise<boolean> {
    this.agreements = this.agreements.filter((a) => String(a.id) !== String(id));
    return true;
  }

  // PDF Form Methods
  async getPDFForms(): Promise<DocumentItem[]> {
    return this.pdfForms;
  }

  async getPDFFormById(id: string | number): Promise<DocumentItem | undefined> {
    return this.pdfForms.find((f) => String(f.id) === String(id));
  }

  async updatePDFForm(id: string | number, updates: Partial<DocumentItem>): Promise<DocumentItem> {
    const idx = this.pdfForms.findIndex((f) => String(f.id) === String(id));
    if (idx !== -1) {
      this.pdfForms[idx] = { ...this.pdfForms[idx], ...updates };
      return this.pdfForms[idx];
    }
    throw new Error(`PDF Form ${id} not found`);
  }

  async createPDFForm(item: Partial<DocumentItem>): Promise<DocumentItem> {
    const newItem: DocumentItem = {
      id: `FRM-2026-${String(this.pdfForms.length + 1).padStart(3, "0")}`,
      title: item.title || "Untitled Inspection Form",
      department: item.department || "Engineering & Maintenance",
      status: item.status || "Draft",
      createdDate: item.createdDate || new Date().toISOString().split("T")[0],
      formValues: {
        employeeName: "Default Inspector",
        designation: "Inspector",
        department: item.department || "Engineering & Maintenance",
        inspectionDate: new Date().toISOString().split("T")[0],
        complianceStatus: "Compliant",
        checkPassed: true,
        comments: "",
      },
      signatures: [],
      texts: [],
      highlights: [],
      comments: [],
    };
    this.pdfForms.unshift(newItem);
    return newItem;
  }

  async deletePDFForm(id: string | number): Promise<boolean> {
    this.pdfForms = this.pdfForms.filter((f) => String(f.id) !== String(id));
    return true;
  }
}

export const documentStore = new DocumentServiceStore();

// IDataProvider adaptors for ModuleRegistry
export const agreementsService: IDataProvider<DocumentItem> = {
  getAll: () => documentStore.getAgreements(),
  getById: (id) => documentStore.getAgreementById(id),
  create: (record) => documentStore.createAgreement(record),
  update: (id, updates) => documentStore.updateAgreement(id, updates),
  delete: (id) => documentStore.deleteAgreement(id),
};

export const pdfFormsService: IDataProvider<DocumentItem> = {
  getAll: () => documentStore.getPDFForms(),
  getById: (id) => documentStore.getPDFFormById(id),
  create: (record) => documentStore.createPDFForm(record),
  update: (id, updates) => documentStore.updatePDFForm(id, updates),
  delete: (id) => documentStore.deletePDFForm(id),
};
