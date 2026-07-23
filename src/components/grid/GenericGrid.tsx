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
} from "@progress/kendo-react-grid";
import { process, State } from "@progress/kendo-data-query";
import { GridColumn } from "@/types/metadata";
import { Button } from "@progress/kendo-react-buttons";
import { CustomColumnMenu } from "./CustomColumnMenu";

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
} from "@progress/kendo-svg-icons";

interface GenericGridProps {
  data: any[];
  columns: GridColumn[];
  searchQuery?: string;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
  onRowClick?: (item: any) => void;
  dataItemKey?: string;
}

export default function GenericGrid({
  data,
  columns,
  searchQuery = "",
  onEdit,
  onDelete,
  onRowClick,
  dataItemKey = "id",
}: GenericGridProps) {
  // Premium Chart Integration states & refs
  const gridRef = useRef<GridHandle>(null);
  const offset = useRef({ left: 0, top: 0 });

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
  // Grid Data State: sorting, filtering, paging, grouping
  const [gridState, setGridState] = useState<State>({
    skip: 0,
    take: 10,
    sort: [],
    filter: { logic: "and", filters: [] },
    group: [],
  });

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
    let filtered = [...data];

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
  }, [data, searchQuery, gridState]);

  // Handle data state changes (sort, page, filter)
  const handleDataStateChange = (e: GridDataStateChangeEvent) => {
    setGridState(e.dataState);
  };

  // Toggle column visibility
  const toggleColumn = (field: string) => {
    setVisibleFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Status Badge Renderer
  const StatusCell = (props: any) => {
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
    const val = props.dataItem[props.field];
    return (
      <td {...props.tdProps} className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-slate-800 ${props.tdProps?.className || ""}`}>
        {val !== undefined ? val.toFixed(1) : ""}
      </td>
    );
  };

  // Action Buttons Renderer
  const ActionsCell = (props: any) => {
    const item = props.dataItem;
    return (
      <td className="px-6 py-3 text-right text-sm font-medium space-x-2 actions-cell">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(item);
          }}
          className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-2 py-1 rounded transition-colors cursor-pointer"
        >
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item);
          }}
          className="text-rose-600 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded transition-colors cursor-pointer"
        >
          Delete
        </button>
      </td>
    );
  };

  return (
    <div className="relative bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible">
      {/* Column Chooser Bar */}
      <div className="flex justify-end p-3 border-b border-slate-100 bg-slate-50/50">
        <div className="relative">
          <Button
            onClick={() => setShowColumnChooser(!showColumnChooser)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Columns
          </Button>

          {showColumnChooser && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-2 text-sm text-slate-700">
              <div className="px-3 py-1 font-semibold text-xs text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                Toggle Columns
              </div>
              <div className="max-h-60 overflow-y-auto px-1">
                {columns.map((col) => (
                  <label
                    key={col.field}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 rounded cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={!!visibleFields[col.field]}
                      onChange={() => toggleColumn(col.field)}
                      className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                    />
                    <span>{col.title}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Kendo Grid Component */}
      <Grid
        ref={gridRef}
        style={{ height: "500px" }}
        data={processedData}
        dataItemKey={dataItemKey}
        selectable={{
          enabled: true,
          drag: true,
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
        {gridColumns
          .filter((col) => visibleFields[col.field])
          .map((col) => {
            let cellRenderer = undefined;
            if (col.type === "badge") {
              cellRenderer = StatusCell;
            } else if (col.type === "date") {
              cellRenderer = DateCell;
            } else if (col.type === "number") {
              cellRenderer = NumberCell;
            }

            return (
              <Column
                key={col.field}
                field={col.field}
                title={col.title}
                width={col.width}
                filter={col.filter}
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
