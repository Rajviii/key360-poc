import { useState, useCallback } from "react";

export interface PDFViewerState {
  zoom: number;
  rotation: number;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
  isSearching: boolean;
  searchResultsCount: number;
}

export function usePDFViewer(initialTotalPages = 3) {
  const [zoom, setZoom] = useState(1.0);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResultsCount, setSearchResultsCount] = useState(0);

  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.15, 2.5));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.15, 0.5));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1.0);
  }, []);

  const rotateClockwise = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const rotateCounterClockwise = useCallback(() => {
    setRotation((prev) => (prev - 90 + 360) % 360);
  }, []);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setIsSearching(false);
      setSearchResultsCount(0);
      return;
    }
    setIsSearching(true);
    // Simulated match count
    setSearchResultsCount(query.length > 2 ? 4 : 1);
  }, []);

  const triggerPrint = useCallback(() => {
    window.print();
  }, []);

  return {
    zoom,
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    rotation,
    setRotation,
    rotateClockwise,
    rotateCounterClockwise,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    nextPage,
    prevPage,
    goToPage,
    searchQuery,
    setSearchQuery,
    handleSearch,
    isSearching,
    searchResultsCount,
    triggerPrint,
  };
}
