export interface ViewerOptions {
  zoom?: boolean;
  rotate?: boolean;
  search?: boolean;
  download?: boolean;
  print?: boolean;
  signature?: boolean;
  annotations?: boolean;
  highlight?: boolean;
  comments?: boolean;
  export?: boolean;
}

export interface EditorOptions {
  enableSign?: boolean;
  enableText?: boolean;
  enableHighlight?: boolean;
  enableComments?: boolean;
  enableSave?: boolean;
  enableExport?: boolean;
}

export type FormFieldType =
  | "text"
  | "number"
  | "date"
  | "select"
  | "radio"
  | "checkbox"
  | "textarea"
  | "signature";

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormFieldDef {
  id: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  options?: FormFieldOption[];
  defaultValue?: any;
  placeholder?: string;
  page?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface FormOptions {
  enableFormFilling?: boolean;
  fields?: FormFieldDef[];
}

export interface SignatureAnnotation {
  id: string;
  dataUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

export interface TextAnnotation {
  id: string;
  text: string;
  x: number;
  y: number;
  color?: string;
  fontSize?: number;
  page: number;
}

export interface HighlightAnnotation {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  page: number;
}

export interface PDFComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  x: number;
  y: number;
  page: number;
}

export interface DocumentItem {
  id: string | number;
  title: string;
  name?: string;
  type?: string;
  vendor?: string;
  department?: string;
  status: string;
  createdDate?: string;
  pdfDataUri?: string;
  documentPdf?: string;
  formValues?: Record<string, any>;
  signatures?: SignatureAnnotation[];
  texts?: TextAnnotation[];
  highlights?: HighlightAnnotation[];
  comments?: PDFComment[];
}
