import { useState, useCallback } from "react";
import { SignatureAnnotation } from "@/modules/document-management/types";

export function useSignature(initialSignatures: SignatureAnnotation[] = []) {
  const [signatures, setSignatures] = useState<SignatureAnnotation[]>(initialSignatures);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stagedSignatureDataUrl, setStagedSignatureDataUrl] = useState<string | null>(null);
  const [isPlacementActive, setIsPlacementActive] = useState(false);
  const [selectedSignatureId, setSelectedSignatureId] = useState<string | null>(null);

  // 1. Open signature dialog to draw
  const openSignatureDialog = useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  const closeSignatureDialog = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  // 2. Save drawn signature from canvas & enter placement mode
  const handleSaveSignature = useCallback((dataUrl: string) => {
    setStagedSignatureDataUrl(dataUrl);
    setIsDialogOpen(false);
    setIsPlacementActive(true);
  }, []);

  // 3. Click anywhere on PDF -> Place signature at coordinates
  const placeSignature = useCallback(
    (x: number, y: number, page = 1) => {
      if (!stagedSignatureDataUrl || !isPlacementActive) return;

      const newSig: SignatureAnnotation = {
        id: `sig-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        dataUrl: stagedSignatureDataUrl,
        x,
        y,
        width: 160,
        height: 70,
        page,
      };

      setSignatures((prev) => [...prev, newSig]);
      setSelectedSignatureId(newSig.id);
      setIsPlacementActive(false);
    },
    [stagedSignatureDataUrl, isPlacementActive]
  );

  // 4. Drag signature
  const updateSignaturePosition = useCallback((id: string, x: number, y: number) => {
    setSignatures((prev) =>
      prev.map((s) => (s.id === id ? { ...s, x, y } : s))
    );
  }, []);

  // 5. Resize signature
  const updateSignatureSize = useCallback((id: string, width: number, height: number) => {
    setSignatures((prev) =>
      prev.map((s) => (s.id === id ? { ...s, width, height } : s))
    );
  }, []);

  // 6. Delete signature
  const removeSignature = useCallback((id: string) => {
    setSignatures((prev) => prev.filter((s) => s.id !== id));
    setSelectedSignatureId((curr) => (curr === id ? null : curr));
  }, []);

  const cancelPlacement = useCallback(() => {
    setIsPlacementActive(false);
  }, []);

  return {
    signatures,
    setSignatures,
    isDialogOpen,
    openSignatureDialog,
    closeSignatureDialog,
    handleSaveSignature,
    stagedSignatureDataUrl,
    isPlacementActive,
    placeSignature,
    updateSignaturePosition,
    updateSignatureSize,
    removeSignature,
    selectedSignatureId,
    setSelectedSignatureId,
    cancelPlacement,
  };
}
