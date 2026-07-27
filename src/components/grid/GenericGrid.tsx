"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  Grid,
  GridColumn as Column,
  GridDataStateChangeEvent,
  GridGroupExpandChangeEvent,
  GridContextMenuEvent,
  GridHandle,
  GridSelectionChangeEvent,
  GridToolbar,
  GridToolbarAIAssistant,
  GridToolbarSpacer,
  handleAIResponse,
} from "@progress/kendo-react-grid";
import type { GridToolbarAIAssistantHandle } from "@progress/kendo-react-grid";
import { process, State } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { Popup } from "@progress/kendo-react-popup";
import { CustomColumnMenu } from "./CustomColumnMenu";
import { GridColumn } from "@/types/metadata";

// Premium Chart Integration imports
import {
  ChartWizard,
  ChartWizardDataRow,
  ChartWizardDefaultState,
  getWizardDataFromGridSelection,
} from "@progress/kendo-react-chart-wizard";
import { ContextMenu, MenuItem, MenuSelectEvent } from "@progress/kendo-react-layout";
import {
  tableBodyIcon,
  tableUnmergeIcon,
  tableRowGroupsIcon,
  gridIcon,
  chartAreaStackedIcon,
  chartBarStackedIcon,
  chartBarClusteredIcon,
  chartBarStacked100Icon,
  chartPieIcon,
  chartColumnStackedIcon,
  chartColumnClusteredIcon,
  chartColumnStacked100Icon,
  chartLineStackedIcon,
  chartLineIcon,
  chartLineStacked100Icon,
  chartScatterIcon,
  arrowRotateCcwIcon,
  pencilIcon,
  trashIcon,
  saveIcon,
  cancelIcon,
  hyperlinkOpenIcon,
} from "@progress/kendo-svg-icons";

interface GenericGridProps {
  data: any[];
  columns: GridColumn[];
  searchQuery?: string;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
  onRowClick?: (item: any) => void;
  dataItemKey?: string;
  onSave?: (id: any, item: any) => Promise<void>;
  onViewPdf?: (item: any) => void;
}

export default function GenericGrid({
  data,
  columns,
  searchQuery = "",
  onEdit,
  onDelete,
  onRowClick,
  dataItemKey = "id",
  onSave,
  onViewPdf,
}: GenericGridProps) {
  // Premium Chart Integration states & refs
  const gridRef = useRef<GridHandle>(null);
  const columnsBtnRef = useRef<any>(null);
  const offset = useRef({ left: 0, top: 0 });
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const [select, setSelect] = useState<Record<string | number, boolean | number[]>>({});
  const [showChartWizard, setShowChartWizard] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuItem, setContextMenuItem] = useState<any>(null);
  const [chartWizardDefaultState, setChartWizardDefaultState] = useState<ChartWizardDefaultState>({});

  const chartWizardData: ChartWizardDataRow[] = useMemo(() => {
    if (!showChartWizard || !gridRef.current) return [];
    return getWizardDataFromGridSelection({
      grid: gridRef.current,
      data: data,
      selectedState: select,
      dataItemKey: dataItemKey
    });
  }, [showChartWizard, data, select, dataItemKey]);

  const closeChartWizard = useCallback(() => {
    setShowChartWizard(false);
  }, []);

  const openChartWizard = useCallback(() => {
    setShowChartWizard(true);
  }, []);

  const onSelectionChange = useCallback(
    (event: GridSelectionChangeEvent) => {
      setSelect(event.select);
    },
    []
  );

  const handleContextMenuOpen = useCallback(
    (e: React.MouseEvent, dataItem: any, field?: string) => {
      e.preventDefault();
      offset.current = { left: e.pageX, top: e.pageY };
      setShowContextMenu(true);
      setContextMenuItem(dataItem);
    },
    []
  );

  const handleCloseMenu = useCallback(() => {
    setShowContextMenu(false);
  }, []);

  const handleSelectRow = useCallback(() => {
    if (contextMenuItem) {
      setSelect({
        [contextMenuItem[dataItemKey]]: true
      });
    }
  }, [contextMenuItem, dataItemKey]);

  const handleSelectAllRows = useCallback(() => {
    setSelect(data.reduce((acc, item) => ({ ...acc, [item[dataItemKey]]: true }), {}));
  }, [data, dataItemKey]);

  const handleClearSelection = useCallback(() => {
    setSelect({});
  }, []);

  const handleContextMenu = useCallback(
    (event: GridContextMenuEvent) => {
      handleContextMenuOpen(event.syntheticEvent, event.dataItem, event.field);
    },
    [handleContextMenuOpen]
  );

  const handleOnSelect = useCallback((e: MenuSelectEvent) => {
    const action = e.item.data?.action;
    if (!action) return;

    switch (action) {
      case 'selectRow':
        handleSelectRow();
        break;
      case 'selectAllRows':
        handleSelectAllRows();
        break;
      case 'clearSelection':
        handleClearSelection();
        break;
      case 'bar':
        setChartWizardDefaultState({ seriesType: 'bar' });
        openChartWizard();
        break;
      case 'stackedBar':
        setChartWizardDefaultState({ seriesType: 'bar', stack: { type: 'normal' } });
        openChartWizard();
        break;
      case 'stacked100Bar':
        setChartWizardDefaultState({ seriesType: 'bar', stack: { type: '100%' } });
        openChartWizard();
        break;
      case 'pie':
        setChartWizardDefaultState({ seriesType: 'pie' });
        openChartWizard();
        break;
      case 'column':
        setChartWizardDefaultState({ seriesType: 'column' });
        openChartWizard();
        break;
      case 'stackedColumn':
        setChartWizardDefaultState({ seriesType: 'column', stack: { type: 'normal' } });
        openChartWizard();
        break;
      case 'stacked100Column':
        setChartWizardDefaultState({ seriesType: 'column', stack: { type: '100%' } });
        openChartWizard();
        break;
      case 'line':
        setChartWizardDefaultState({ seriesType: 'line' });
        openChartWizard();
        break;
      case 'stackedLine':
        setChartWizardDefaultState({ seriesType: 'line', stack: { type: 'normal' } });
        openChartWizard();
        break;
      case 'stacked100Line':
        setChartWizardDefaultState({ seriesType: 'line', stack: { type: '100%' } });
        openChartWizard();
        break;
      case 'scatter':
        setChartWizardDefaultState({ seriesType: 'scatter' });
        openChartWizard();
        break;
      default:
    }
    setShowContextMenu(false);
  }, [
    handleSelectRow,
    handleSelectAllRows,
    handleClearSelection,
    openChartWizard,
  ]);

  // Helper to map date strings to Date objects for Kendo inputs
  const mapDataDates = useCallback((items: any[]) => {
    if (!items) return [];
    return items.map((item) => {
      const newItem = { ...item };
      columns.forEach((col) => {
        if (col.type === "date" && newItem[col.field]) {
          const parsedDate = new Date(newItem[col.field]);
          if (!isNaN(parsedDate.getTime())) {
            newItem[col.field] = parsedDate;
          }
        }
      });
      return newItem;
    });
  }, [columns]);

  // Grid Data State: sorting, filtering, paging, grouping
  const [gridState, setGridState] = useState<State>({
    skip: 0,
    take: 10,
    sort: [],
    filter: { logic: "and", filters: [] },
    group: [],
  });

  // Local state for the grid's data (needed for inline editing)
  const [gridData, setGridData] = useState<any[]>(() => mapDataDates(data));

  // Keep gridData in sync if parent data prop changes
  React.useEffect(() => {
    setGridData(mapDataDates(data));
  }, [data, mapDataDates]);


  // Manage columns list as state to allow dynamic reordering & resizing
  const [gridColumns, setGridColumns] = useState<GridColumn[]>(() => columns);

  // Keep gridColumns in sync if parent columns prop changes
  React.useEffect(() => {
    setGridColumns(columns);
  }, [columns]);

  // Track expanded groups
  const [groupExpand, setGroupExpand] = useState<any[]>([]);

  // Dialog state for Reorder modal
  const [isReorderOpen, setIsReorderOpen] = useState(false);
  const [selectedColumnForReorder, setSelectedColumnForReorder] = useState<any>(null);

  // Dialog state for Resize modal
  const [isResizeOpen, setIsResizeOpen] = useState(false);
  const [selectedColumnForResize, setSelectedColumnForResize] = useState<any>(null);
  const [tempWidth, setTempWidth] = useState<number>(150);

  // Local state for column visibility toggles
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    columns.forEach((col) => {
      initial[col.field] = true;
    });
    return initial;
  });

  const [showColumnChooser, setShowColumnChooser] = useState(false);

  // AI Toolbar Assistant Ref & Helpers
  const gridToolbarAIAssistantRef = useRef<GridToolbarAIAssistantHandle>(null);

  const getColumnValues = useCallback((field: string) => {
    if (!data) return [];
    const values = data
      .map((item) => item[field])
      .filter((val) => val !== undefined && val !== null && val !== "");
    return Array.from(new Set(values));
  }, [data]);

  const addColumnsValues = useCallback((columnsList: any[]) => {
    return columnsList.map((column) => {
      const colMeta = gridColumns.find((c) => c.field === column.field);
      return {
        ...column,
        title: column.title || colMeta?.title || "",
        values: getColumnValues(column.field),
      };
    });
  }, [getColumnValues, gridColumns]);

  // Dynamic Suggestions for AI Assistant
  const suggestions = useMemo(() => {
    const list: string[] = [];
    if (gridColumns && gridColumns.length > 0) {
      const filterableCols = gridColumns.filter(
        (c) => c.field !== "actions" && c.field !== "id"
      );
      if (filterableCols.length > 0) {
        const firstCol = filterableCols[0];
        list.push(`Sort by ${firstCol.title} descending`);
      }
      const groupableCols = gridColumns.filter(
        (c) => c.field !== "actions" && c.field !== "id" && c.type !== "date"
      );
      if (groupableCols.length > 0) {
        list.push(`Group by ${groupableCols[0].title.toLowerCase()}`);
      }
      const badgeCol = gridColumns.find((c) => c.type === "badge");
      if (badgeCol && data && data.length > 0) {
        const values = getColumnValues(badgeCol.field);
        if (values.length > 0) {
          list.push(`Filter only the ${String(values[0]).toLowerCase()} entries`);
        }
      }
    }
    list.push("Clear sorting and filtering");
    return list;
  }, [gridColumns, data, getColumnValues]);

  const handleReset = useCallback(() => {
    setGridState({
      skip: 0,
      take: 10,
      sort: [],
      filter: { logic: "and", filters: [] },
      group: [],
    });
  }, []);

  const handleOpenReorder = (column: any) => {
    setSelectedColumnForReorder(column);
    setIsReorderOpen(true);
  };

  const handleOpenResize = (column: any) => {
    setSelectedColumnForResize(column);
    // Find current column's width (default to 150 if not specified)
    const colObj = gridColumns.find((c) => c.field === column.field);
    setTempWidth(colObj?.width || 150);
    setIsResizeOpen(true);
  };

  const moveColumn = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= gridColumns.length) return;

    const newCols = [...gridColumns];
    const temp = newCols[index];
    newCols[index] = newCols[targetIndex];
    newCols[targetIndex] = temp;
    setGridColumns(newCols);
  };

  const handleGroupExpandChange = (e: GridGroupExpandChangeEvent) => {
    setGroupExpand(e.groupExpand);
  };

  // Apply global search filter and Kendo Grid filters
  const processedData = useMemo(() => {
    let filtered = [...gridData];

    // 1. Apply global search across text fields if query exists
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((row) => {
        return Object.keys(row).some((key) => {
          const value = row[key];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(q);
        });
      });
    }

    // 2. Apply grid specific filtering, sorting, paging
    return process(filtered, gridState);
  }, [gridData, searchQuery, gridState]);

  // Handle data state changes (sort, page, filter)
  const handleDataStateChange = (e: GridDataStateChangeEvent) => {
    setGridState(e.dataState);
  };

  // Inline Editing Event Handlers
  const handleItemChange = useCallback((e: any) => {
    const updatedData = gridData.map((item) =>
      item[dataItemKey] === e.dataItem[dataItemKey]
        ? { ...item, [e.field]: e.value }
        : item
    );
    setGridData(updatedData);
  }, [gridData, dataItemKey]);

  const handleInlineEdit = useCallback((itemToEdit: any) => {
    const updatedData = gridData.map((item) =>
      item[dataItemKey] === itemToEdit[dataItemKey]
        ? { ...item, inEdit: true }
        : { ...item, inEdit: false }
    );
    setGridData(updatedData);
  }, [gridData, dataItemKey]);

  const handleInlineCancel = useCallback((itemToCancel: any) => {
    const originalItem = data.find((item) => item[dataItemKey] === itemToCancel[dataItemKey]);
    if (!originalItem) return;
    const mappedOriginal = mapDataDates([originalItem])[0];
    const updatedData = gridData.map((item) =>
      item[dataItemKey] === itemToCancel[dataItemKey]
        ? { ...mappedOriginal, inEdit: false }
        : item
    );
    setGridData(updatedData);
  }, [data, gridData, dataItemKey, mapDataDates]);

  const handleInlineSave = useCallback(async (itemToSave: any) => {
    if (onSave) {
      const { inEdit, ...payload } = itemToSave;

      // Convert Date objects back to YYYY-MM-DD format string before saving
      columns.forEach((col) => {
        if (col.type === "date" && payload[col.field] instanceof Date) {
          const dateObj = payload[col.field] as Date;
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          payload[col.field] = `${year}-${month}-${day}`;
        }
      });

      await onSave(itemToSave[dataItemKey], payload);
    }
    const updatedData = gridData.map((item) =>
      item[dataItemKey] === itemToSave[dataItemKey]
        ? { ...item, inEdit: false }
        : item
    );
    setGridData(updatedData);
  }, [gridData, dataItemKey, onSave, columns]);

  // Derive the edit state descriptor from gridData for KendoReact Grid v15+
  const editState = useMemo(() => {
    const state: Record<string | number, boolean> = {};
    gridData.forEach((item) => {
      if (item.inEdit) {
        state[item[dataItemKey]] = true;
      }
    });
    return state;
  }, [gridData, dataItemKey]);

  // Toggle column visibility
  const toggleColumn = (field: string) => {
    setVisibleFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Status Badge Renderer
  const StatusCell = (props: any) => {
    if (props.rowType === "edit" || props.dataItem.inEdit) {
      return (
        <td {...props.tdProps} className={`px-6 py-4 whitespace-nowrap text-sm ${props.tdProps?.className || ""}`}>
          {props.children}
        </td>
      );
    }

    const status = props.dataItem[props.field] || "";
    let badgeClass = "bg-slate-100 text-slate-700 border-slate-300";

    if (status === "Approved") {
      badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
    } else if (status === "Pending Approval") {
      badgeClass = "bg-amber-50 text-amber-700 border-amber-200";
    } else if (status === "Rejected") {
      badgeClass = "bg-rose-50 text-rose-700 border-rose-200";
    }

    return (
      <td {...props.tdProps} className={`px-6 py-4 whitespace-nowrap text-sm ${props.tdProps?.className || ""}`}>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeClass}`}>
          {status}
        </span>
      </td>
    );
  };

  // Date Cell Renderer
  const DateCell = (props: any) => {
    if (props.rowType === "edit" || props.dataItem.inEdit) {
      return (
        <td {...props.tdProps} className={`px-6 py-4 whitespace-nowrap text-sm ${props.tdProps?.className || ""}`}>
          {props.children}
        </td>
      );
    }

    const rawVal = props.dataItem[props.field];
    if (!rawVal) return <td {...props.tdProps}></td>;
    const formatted = new Date(rawVal).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    return (
      <td {...props.tdProps} className={`px-6 py-4 whitespace-nowrap text-sm text-slate-600 ${props.tdProps?.className || ""}`}>
        {formatted}
      </td>
    );
  };

  // Numbers Cell Renderer
  const NumberCell = (props: any) => {
    if (props.rowType === "edit" || props.dataItem.inEdit) {
      return (
        <td {...props.tdProps} className={`px-6 py-4 whitespace-nowrap text-sm text-right ${props.tdProps?.className || ""}`}>
          {props.children}
        </td>
      );
    }

    const val = props.dataItem[props.field];
    return (
      <td {...props.tdProps} className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-slate-800 ${props.tdProps?.className || ""}`}>
        {val !== undefined ? val.toFixed(1) : ""}
      </td>
    );
  };

  // PDF Cell Renderer
  const PdfCell = (props: any) => {
    if (props.rowType === "edit" || props.dataItem.inEdit) {
      return (
        <td {...props.tdProps} className={`px-6 py-4 whitespace-nowrap text-sm ${props.tdProps?.className || ""}`}>
          {props.children}
        </td>
      );
    }

    const pdfData = props.dataItem[props.field];
    const hasPdf = !!pdfData;

    return (
      <td {...props.tdProps} className={`px-6 py-4 whitespace-nowrap text-sm ${props.tdProps?.className || ""}`}>
        {hasPdf ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              if (onViewPdf) onViewPdf(props.dataItem);
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-250 cursor-pointer transition-colors shadow-sm"
          >
            <svg className="w-3.5 h-3.5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            PDF Attached
          </span>
        ) : (
          <span className="text-slate-400 text-xs italic">No Document</span>
        )}
      </td>
    );
  };

  // Custom Eye Icon SVG for view PDF button
  const eyeIconCustom = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  // Action Buttons Renderer
  const ActionsCell = (props: any) => {
    const item = props.dataItem;
    const isInEdit = item.inEdit;

    if (isInEdit) {
      return (
        <td className="px-6 py-3 text-right text-sm font-medium space-x-2 actions-cell">
          <Button
            svgIcon={saveIcon}
            title="Update changes"
            onClick={(e) => {
              e.stopPropagation();
              handleInlineSave(item);
            }}
            className="p-1.5 hover:bg-emerald-50 rounded text-emerald-600 hover:text-emerald-800 border-none bg-transparent cursor-pointer"
          />
          <Button
            svgIcon={cancelIcon}
            title="Cancel changes"
            onClick={(e) => {
              e.stopPropagation();
              handleInlineCancel(item);
            }}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 border-none bg-transparent cursor-pointer"
          />
        </td>
      );
    }

    const hasPdfField = columns.some((col) => col.type === "pdf");

    return (
      <td className="px-6 py-3 text-right text-sm font-medium space-x-2 actions-cell">
        {hasPdfField && onViewPdf && (
          <Button
            title="View Attached PDF Document"
            onClick={(e) => {
              e.stopPropagation();
              onViewPdf(item);
            }}
            className="p-1.5 hover:bg-rose-50 rounded text-rose-600 hover:text-rose-800 border-none bg-transparent cursor-pointer"
          >
            {eyeIconCustom}
          </Button>
        )}
        <Button
          svgIcon={hyperlinkOpenIcon}
          title="Edit Record (Popup)"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(item);
          }}
          className="p-1.5 hover:bg-green-50 rounded text-green-600 hover:text-green-800 border-none bg-transparent cursor-pointer"
        />
        <Button
          svgIcon={pencilIcon}
          title="Quick Edit (Inline)"
          onClick={(e) => {
            e.stopPropagation();
            handleInlineEdit(item);
          }}
          className="p-1.5 hover:bg-indigo-50 rounded text-indigo-600 hover:text-indigo-800 border-none bg-transparent cursor-pointer"
        />
        <Button
          svgIcon={trashIcon}
          title="Delete Record"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item);
          }}
          className="p-1.5 hover:bg-rose-50 rounded text-rose-600 hover:text-rose-800 border-none bg-transparent cursor-pointer"
        />
      </td>
    );
  };

  return (
    <div className="relative bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible">
      {/* Kendo Grid Component */}
      <Grid
        ref={gridRef}
        style={{ height: "500px" }}
        data={processedData}
        dataItemKey={dataItemKey}
        edit={editState}
        editable={true}
        onItemChange={handleItemChange}
        selectable={{
          mode: "multiple",
        }}
        navigatable={true}
        select={select}
        onSelectionChange={onSelectionChange}
        onContextMenu={handleContextMenu}
        {...gridState}
        onDataStateChange={handleDataStateChange}
        groupExpand={groupExpand}
        onGroupExpandChange={handleGroupExpandChange}
        groupable={true}
        pageable={{
          buttonCount: 5,
          info: true,
          type: "numeric",
          pageSizes: [5, 10, 20, 50],
        }}
        sortable={true}
        filterable={true}
        resizable={true}
        reorderable={true}
        className="k-grid-flat border-none"
        onRowClick={(e) => {
          const target = e.syntheticEvent.target as HTMLElement;
          if (target.closest('.actions-cell') || target.tagName === 'BUTTON') {
            return;
          }
          if (onRowClick && !e.dataItem.items) {
            onRowClick(e.dataItem);
          }
        }}
      >
        <GridToolbar>
          {mounted && (
            <GridToolbarAIAssistant
              ref={gridToolbarAIAssistantRef}
              requestUrl="/api/ai/grid"
              onPromptRequest={(event) => {
                event.columns = addColumnsValues(event.columns);
              }}
              onResponseSuccess={(event) => {
                const result = handleAIResponse(event, gridState, gridRef.current);
                if (result.state) {
                  setGridState(result.state);
                }
                gridToolbarAIAssistantRef.current?.hide();
              }}
              promptPlaceHolder="Filter, sort or group with AI"
              suggestionsList={suggestions}
              enableSpeechToText={true}
            />
          )}
          <GridToolbarSpacer />

          <div className="flex gap-2">
            <Button
              ref={columnsBtnRef}
              onClick={() => setShowColumnChooser((prev) => !prev)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Columns
            </Button>

            <Button
              svgIcon={arrowRotateCcwIcon}
              title="Reset changes"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Reset changes
            </Button>
          </div>
        </GridToolbar>
        {gridColumns
          .filter((col) => visibleFields[col.field])
          .map((col) => {
            let cellRenderer = undefined;
            let editorType: "text" | "numeric" | "date" | "boolean" = "text";

            if (col.type === "badge") {
              cellRenderer = StatusCell;
            } else if (col.type === "date") {
              cellRenderer = DateCell;
              editorType = "date";
            } else if (col.type === "number") {
              cellRenderer = NumberCell;
              editorType = "numeric";
            } else if (col.type === "pdf") {
              cellRenderer = PdfCell;
            }

            return (
              <Column
                key={col.field}
                field={col.field}
                title={col.title}
                width={col.width}
                filter={col.filter}
                editor={editorType}
                sortable={col.sortable !== false}
                resizable={col.resizable !== false}
                reorderable={col.reorderable !== false}
                cells={cellRenderer ? { data: cellRenderer } : undefined}
                columnMenu={(props) => (
                  <CustomColumnMenu
                    {...props}
                    columns={gridColumns}
                    setColumns={setGridColumns}
                    onOpenReorderWindow={handleOpenReorder}
                    onOpenResizeWindow={handleOpenResize}
                    data={data}
                  />
                )}
              />
            );
          })}
        {/* Actions Column */}
        <Column
          field="actions"
          title="Actions"
          width={160}
          filterable={false}
          sortable={false}
          cells={{ data: ActionsCell }}
        />
      </Grid>

      {/* Column Chooser Dropdown (Kendo React Popup Component) */}
      <Popup
        anchor={columnsBtnRef.current?.element || columnsBtnRef.current}
        show={showColumnChooser}
        anchorAlign={{ horizontal: "right", vertical: "bottom" }}
        popupAlign={{ horizontal: "right", vertical: "top" }}
        onMouseDownOutside={() => setShowColumnChooser(false)}
      >
        <div className="bg-white border border-slate-200 rounded-lg shadow-xl p-3.5 w-60 text-slate-700 font-sans z-[99999]">
          <div className="font-semibold text-slate-800 text-sm mb-2.5 border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>Show/Hide Columns:</span>
            <button
              onClick={() => setShowColumnChooser(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {columns.map((col) => (
              <label
                key={col.field}
                className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-slate-50 rounded-md cursor-pointer select-none border border-transparent hover:border-slate-100 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={!!visibleFields[col.field]}
                  onChange={() => toggleColumn(col.field)}
                  className="rounded border-slate-300 text-green-600 focus:ring-green-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-sm font-medium text-slate-700">{col.title}</span>
              </label>
            ))}
          </div>
        </div>
      </Popup>

      {/* Reorder Columns Modal */}
      {isReorderOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-bold text-slate-800">Reorder Columns</h2>
              <button
                onClick={() => setIsReorderOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-2">
              <p className="text-xs text-slate-500 mb-3">Adjust the column order using Up/Down buttons, or toggle their visibility using the checkboxes.</p>
              {gridColumns.map((col, index) => (
                <div key={col.field} className="flex items-center justify-between p-2 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={!!visibleFields[col.field]}
                      onChange={() => toggleColumn(col.field)}
                      className="rounded border-slate-300 text-green-600 focus:ring-green-500 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-slate-700">{col.title}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={index === 0}
                      onClick={() => moveColumn(index, "up")}
                      className="p-1 px-2 text-xs font-semibold bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      ▲
                    </button>
                    <button
                      disabled={index === gridColumns.length - 1}
                      onClick={() => moveColumn(index, "down")}
                      className="p-1 px-2 text-xs font-semibold bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
              <Button onClick={() => setIsReorderOpen(false)} className="text-sm font-semibold cursor-pointer">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Resize Column Modal */}
      {isResizeOpen && selectedColumnForResize && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-bold text-slate-800">Resize Column</h2>
              <button
                onClick={() => setIsResizeOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Column</label>
                <div className="text-sm font-bold text-slate-700">{selectedColumnForResize.title}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Width (pixels)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="60"
                    max="500"
                    value={tempWidth}
                    onChange={(e) => setTempWidth(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                  <input
                    type="number"
                    min="60"
                    max="500"
                    value={tempWidth}
                    onChange={(e) => setTempWidth(Number(e.target.value))}
                    className="w-20 px-2 py-1 text-center font-bold text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
              <button
                onClick={() => setIsResizeOpen(false)}
                className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const newCols = gridColumns.map((c) => {
                    if (c.field === selectedColumnForResize.field) {
                      return { ...c, width: tempWidth };
                    }
                    return c;
                  });
                  setGridColumns(newCols);
                  setIsResizeOpen(false);
                }}
                className="px-4 py-1.5 text-sm font-semibold text-white bg-green-700 hover:bg-green-800 rounded shadow-sm transition-colors cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Chart Integration Components */}
      <ContextMenu
        show={showContextMenu}
        offset={offset.current}
        onSelect={handleOnSelect}
        onClose={handleCloseMenu}
      >
        <MenuItem text="Select" svgIcon={tableBodyIcon} cssStyle={{ borderBottom: "1px solid #ddd" }}>
          <MenuItem text="Row" svgIcon={tableRowGroupsIcon} data={{ action: "selectRow" }} />
          <MenuItem text="All rows" svgIcon={gridIcon} data={{ action: "selectAllRows" }} />
          <MenuItem text="Clear selection" svgIcon={tableUnmergeIcon} data={{ action: "clearSelection" }} />
        </MenuItem>
        <MenuItem
          text="Generate chart"
          svgIcon={chartAreaStackedIcon}
          disabled={Object.keys(select).length === 0}
        >
          <MenuItem text="Bar chart" svgIcon={chartBarClusteredIcon}>
            <MenuItem text="Bar" svgIcon={chartBarClusteredIcon} data={{ action: "bar" }} />
            <MenuItem text="Stacked bar" svgIcon={chartBarStackedIcon} data={{ action: "stackedBar" }} />
            <MenuItem
              text="100% Stacked bar"
              svgIcon={chartBarStacked100Icon}
              data={{ action: "stacked100Bar" }}
            />
          </MenuItem>
          <MenuItem text="Pie chart" svgIcon={chartPieIcon} data={{ action: "pie" }} />
          <MenuItem text="Column chart" svgIcon={chartColumnClusteredIcon}>
            <MenuItem text="Column" svgIcon={chartColumnClusteredIcon} data={{ action: "column" }} />
            <MenuItem
              text="Stacked column"
              svgIcon={chartColumnStackedIcon}
              data={{ action: "stackedColumn" }}
            />
            <MenuItem
              text="100% Stacked column"
              svgIcon={chartColumnStacked100Icon}
              data={{ action: "stacked100Column" }}
            />
          </MenuItem>
          <MenuItem text="Line chart" svgIcon={chartLineIcon}>
            <MenuItem text="Line" svgIcon={chartLineIcon} data={{ action: "line" }} />
            <MenuItem text="Stacked line" svgIcon={chartLineStackedIcon} data={{ action: "stackedLine" }} />
            <MenuItem
              text="100% Stacked line"
              svgIcon={chartLineStacked100Icon}
              data={{ action: "stacked100Line" }}
            />
          </MenuItem>
          <MenuItem text="Scatter chart" svgIcon={chartScatterIcon} data={{ action: "scatter" }} />
        </MenuItem>
      </ContextMenu>

      {showChartWizard && (
        <ChartWizard
          data={chartWizardData}
          onClose={closeChartWizard}
          defaultState={chartWizardDefaultState}
        />
      )}
    </div>
  );
}
