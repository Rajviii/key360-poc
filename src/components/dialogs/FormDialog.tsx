"use client";

import React from "react";
import { Dialog } from "@progress/kendo-react-dialogs";

interface FormDialogProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}

export default function FormDialog({
  title,
  onClose,
  children,
  width = 700,
}: FormDialogProps) {
  return (
    <Dialog
      title={title}
      onClose={onClose}
      width={width}
      className="p-0 rounded-xl overflow-hidden shadow-2xl border border-slate-200"
    >
      <div className="p-6 bg-slate-50 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      </div>
      <div className="p-6 bg-white max-h-[75vh] overflow-y-auto">
        {children}
      </div>
    </Dialog>
  );
}
