"use client";

import React, { useRef } from "react";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Button } from "@progress/kendo-react-buttons";
import { SignatureCanvas, SignatureCanvasHandle } from "./SignatureCanvas";

interface SignatureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
}

export function SignatureDialog({ isOpen, onClose, onSave }: SignatureDialogProps) {
  const canvasRef = useRef<SignatureCanvasHandle>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    if (canvasRef.current && !canvasRef.current.isEmpty()) {
      const dataUrl = canvasRef.current.toDataURL();
      onSave(dataUrl);
    } else {
      alert("Please draw your signature before saving.");
    }
  };

  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
  };

  return (
    <Dialog title="Digital Signature Capture" onClose={onClose} width={560}>
      <div className="space-y-3 p-1">
        <p className="text-xs text-slate-500 font-medium">
          Draw your official digital signature below. Once saved, click anywhere on the document sheet to position your signature.
        </p>

        <SignatureCanvas ref={canvasRef} width={515} height={200} />

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Supported: Mouse / Touch Screen</span>
          <span>Security Audit: 256-bit Encrypted Hash</span>
        </div>
      </div>

      <DialogActionsBar>
        <Button onClick={handleClear} fillMode="flat">
          Clear Signature
        </Button>
        <Button onClick={onClose} fillMode="flat">
          Cancel
        </Button>
        <Button onClick={handleSave} themeColor="primary">
          Save & Place Signature
        </Button>
      </DialogActionsBar>
    </Dialog>
  );
}
