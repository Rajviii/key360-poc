"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import ContentLayout from "@/components/layout/ContentLayout";
import ModuleToolbar from "@/components/toolbar/ModuleToolbar";
import GenericGrid, { GenericGridRef } from "@/components/grid/GenericGrid";
import GenericGantt from "@/components/grid/GenericGantt";
import FormDialog from "@/components/dialogs/FormDialog";
import DynamicForm from "@/components/form/DynamicForm";
import TimesheetForm from "@/components/form/TimesheetForm"; // Kept for safety/parity reference
import { ModuleConfig } from "@/metadata/engine";
import { PDFViewer } from "@progress/kendo-react-pdf-viewer";
import { SvgIcon } from "@progress/kendo-react-common";

interface ModuleRendererProps {
  config: ModuleConfig;
  service: any;
}

export default function ModuleRenderer({ config, service }: ModuleRendererProps) {
  const [data, setData] = useState<any[]>([]);
  const [dependencies, setDependencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // Active view state (e.g., 'grid' vs 'gantt')
  const [activeView, setActiveView] = useState<string>(config.defaultView || config.views?.[0] || "grid");

  // Modal dialog states
  const [dialogMode, setDialogMode] = useState<"none" | "add" | "edit">("none");
  const [activePdfItem, setActivePdfItem] = useState<any | null>(null);
  const [loadMetrics, setLoadMetrics] = useState<{ loadTimeMs: number; cacheHit: boolean }>({ loadTimeMs: 0, cacheHit: false });
  const [repeatHeaders, setRepeatHeaders] = useState(true);

  // Reset activeView if module config changes
  useEffect(() => {
    setActiveView(config.defaultView || config.views?.[0] || "grid");
  }, [config.id, config.defaultView]);

  // Load module data from generic service
  const fetchData = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const response = await service.getAll();
      const duration = Math.round(performance.now() - start);
      const isHit = duration < 120;
      setLoadMetrics({ loadTimeMs: duration, cacheHit: isHit });

      if (response && typeof response === "object" && "tasks" in response) {
        setData(response.tasks || []);
        setDependencies(response.dependencies || []);
      } else {
        setData(response || []);
      }
      setSelectedItem(null);
    } catch (err) {
      console.error(`Failed to load records for module ${config.id}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [config.id, service]);

  // Enforce localized Permission Engine checks
  const permissions = React.useMemo(() => {
    return config.permissions || { read: true, create: true, update: true, delete: true };
  }, [config.permissions]);

  // Filter toolbar buttons based on access control permissions
  const allowedButtons = React.useMemo(() => {
    return config.toolbarButtons.filter((btn) => {
      if (btn.actionType === "add" && !permissions.create) return false;
      if (btn.actionType === "delete" && !permissions.delete) return false;
      return true;
    });
  }, [config.toolbarButtons, permissions]);

  const gridPdfRef = React.useRef<GenericGridRef>(null);

  // Handle actions triggered from the Toolbar
  const handleToolbarAction = async (actionType: string) => {
    if (actionType === "add") {
      if (!permissions.create) {
        alert("Permission Denied: You cannot create new entries.");
        return;
      }
      setDialogMode("add");
    } else if (actionType === "refresh") {
      await fetchData();
    } else if (actionType === "delete") {
      if (!permissions.delete) {
        alert("Permission Denied: You cannot delete records.");
        return;
      }
      if (selectedItem) {
        await handleDelete(selectedItem);
      }
    } else if (actionType === "export") {
      handleExport();
    } else if (actionType === "exportPdf") {
      if (gridPdfRef.current) {
        gridPdfRef.current.exportPDF();
      }
    }
  };

  // Handle Edit Action on Row / Gantt item
  const handleEditInitiate = (item: any) => {
    if (!permissions.update) {
      alert("Permission Denied: You do not have permission to modify records.");
      return;
    }
    const itemWithParent = { ...item };
    if (itemWithParent.parentId === undefined) {
      const findParentId = (list: any[], targetId: any, currentParentId: any = ""): any => {
        for (const node of list) {
          if (node.id === targetId) return currentParentId;
          if (node.children && node.children.length > 0) {
            const res = findParentId(node.children, targetId, node.id);
            if (res !== undefined) return res;
          }
        }
        return undefined;
      };
      const foundParentId = findParentId(data, item.id);
      itemWithParent.parentId = foundParentId !== undefined ? foundParentId : "";
    }
    setSelectedItem(itemWithParent);
    setDialogMode("edit");
  };

  // Handle Delete Action on Row
  const handleDelete = async (item: any) => {
    if (!permissions.delete) {
      alert("Permission Denied: You do not have permission to delete records.");
      return;
    }
    const displayName = item.employeeName || item.title || item.id;
    if (confirm(`Are you sure you want to delete this record (${displayName})?`)) {
      setLoading(true);
      try {
        const success = await service.delete(item.id);
        if (success) {
          await fetchData();
        }
      } catch (err) {
        console.error("Failed to delete record:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle Form Submission (Add or Edit)
  const handleFormSubmit = async (formData: Record<string, any>) => {
    setLoading(true);
    try {
      const payload = { ...formData };

      // Parse numeric types
      if (payload.hours) payload.hours = Number(payload.hours);
      if (payload.percentComplete) payload.percentComplete = Number(payload.percentComplete);
      if (payload.parentId !== undefined && payload.parentId !== "") {
        payload.parentId = Number(payload.parentId);
      }

      if (dialogMode === "add") {
        await service.create(payload);
      } else if (dialogMode === "edit" && selectedItem) {
        await service.update(selectedItem.id, payload);
      }
      setDialogMode("none");
      await fetchData();
    } catch (err) {
      console.error("Failed to save record:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to flatten hierarchical tree data (for Grid View & CSV export)
  const getFlatRows = (nodes: any[]): any[] => {
    if (!Array.isArray(nodes)) return [];
    let flat: any[] = [];
    nodes.forEach((node) => {
      flat.push(node);
      if (node.children && node.children.length > 0) {
        flat = flat.concat(getFlatRows(node.children));
      }
    });
    return flat;
  };

  // Compute flattened dataset for Grid View when data has tree structure
  const gridData = React.useMemo(() => {
    const hasTreeData = data.some((item) => item && item.children && item.children.length > 0);
    return hasTreeData ? getFlatRows(data) : data;
  }, [data]);

  // Export grid data to CSV file format
  const handleExport = () => {
    if (data.length === 0) {
      alert("No data available to export.");
      return;
    }

    const fields = config.gridColumns.map(c => c.field);
    const headers = config.gridColumns.map(c => c.title);
    const rowsToExport = gridData;

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [
        headers.join(","),
        ...rowsToExport.map((row) =>
          fields.map((f) => {
            const val = row[f];
            if (val === null || val === undefined) return "";
            return `"${String(val).replace(/"/g, '""')}"`;
          }).join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `key360_${config.id}_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSelectedItemDisplayName = () => {
    if (!selectedItem) return "";
    return selectedItem.employeeName || selectedItem.title || `ID: ${selectedItem.id}`;
  };

  // Dynamic Module KPIs using resolved config specifications
  const stats = React.useMemo(() => {
    if (!data || data.length === 0 || !config.kpis) return null;
    const flatData = gridData;

    const evaluateFilter = (item: any, filter?: any): boolean => {
      if (!filter) return true;
      return Object.keys(filter).every((key) => {
        const val = item[key];
        const criteria = filter[key];
        if (criteria && typeof criteria === "object") {
          return Object.keys(criteria).every((op) => {
            const limit = criteria[op];
            if (op === "gte") return Number(val) >= Number(limit);
            if (op === "gt") return Number(val) > Number(limit);
            if (op === "lte") return Number(val) <= Number(limit);
            if (op === "lt") return Number(val) < Number(limit);
            if (op === "eq") return val === limit;
            return false;
          });
        }
        return val === criteria;
      });
    };

    return config.kpis.map((kpi: any) => {
      let value: any = 0;
      const isTree = kpi.type.endsWith("-tree");
      const targetData = isTree ? flatData : data;

      if (kpi.type === "sum" || kpi.type === "sum-tree") {
        const filtered = targetData.filter((item) => evaluateFilter(item, kpi.filter));
        const sum = filtered.reduce((acc, item) => acc + (Number(item[kpi.field]) || 0), 0);
        value = kpi.suffix ? `${sum.toFixed(1)}${kpi.suffix}` : sum.toFixed(1);
      } else if (kpi.type === "count" || kpi.type === "count-tree") {
        const filtered = targetData.filter((item) => evaluateFilter(item, kpi.filter));
        value = filtered.length;
      } else if (kpi.type === "average" || kpi.type === "average-tree") {
        const filtered = targetData.filter((item) => evaluateFilter(item, kpi.filter));
        const sum = filtered.reduce((acc, item) => acc + (Number(item[kpi.field]) || 0), 0);
        const avg = sum / (filtered.length || 1);
        value = kpi.format === "percent" ? `${(avg * 100).toFixed(0)}%` : avg.toFixed(1);
      }

      return {
        label: kpi.label,
        value,
        color: kpi.color || "text-slate-900",
        subtext: kpi.subtext || (isTree ? "Hierarchical breakdowns" : "Total logs recorded"),
        icon: kpi.icon || "📊",
      };
    });
  }, [data, config.kpis, config.defaultView, config.views]);

  return (
    <AppLayout>
      <ContentLayout
        title={config.title}
        breadcrumbItems={config.breadcrumbs}
      >
        <div className="space-y-6">
          {/* Metadata-Driven Framework Diagnostics Panel */}
          {/* {config.performance?.diagnostics && (
            <div className="bg-slate-900 text-slate-100 rounded-xl p-4 shadow-md border border-slate-800 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <h4 className="font-bold uppercase tracking-wider text-slate-200 text-xs">Framework Diagnostics</h4>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-semibold">Metadata Engine Active</span>
                </div>
                <span className="text-slate-400 text-[11px]">POC Demonstration Metrics</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                  <span className="text-slate-400 text-[10px] uppercase block mb-1">Dataset Size</span>
                  <span className="font-extrabold text-sm text-emerald-400">{data.length.toLocaleString()}+</span>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                  <span className="text-slate-400 text-[10px] uppercase block mb-1">Records Rendered</span>
                  <span className="font-extrabold text-sm text-blue-400">
                    {config.performance?.virtualization ? "~20 Visible (DOM)" : `${data.length.toLocaleString()} Rows`}
                  </span>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                  <span className="text-slate-400 text-[10px] uppercase block mb-1">Page Size</span>
                  <span className="font-extrabold text-sm text-purple-400">{config.performance?.pageSize || 10}</span>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                  <span className="text-slate-400 text-[10px] uppercase block mb-1">Virtual Scrolling</span>
                  <span className="font-extrabold text-sm text-emerald-400">{config.performance?.virtualization ? "Enabled" : "Disabled"}</span>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                  <span className="text-slate-400 text-[10px] uppercase block mb-1">Cache Status</span>
                  <span className={`font-extrabold text-xs ${loadMetrics.cacheHit ? "text-emerald-400" : "text-amber-400"}`}>
                    {loadMetrics.cacheHit ? "Cache Hit" : "Cache Miss"}
                  </span>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                  <span className="text-slate-400 text-[10px] uppercase block mb-1">Response Time</span>
                  <span className="font-extrabold text-sm text-indigo-400">{loadMetrics.loadTimeMs}ms</span>
                </div>
              </div>
            </div>
          )} */}

          {/* Dynamic Module-specific KPI Stats Row */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-200">
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      {stat.label}
                    </span>
                    <h3 className={`text-2xl font-extrabold tracking-tight ${stat.color}`}>
                      {stat.value}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {stat.subtext}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-xl shadow-sm border border-slate-100 text-slate-700">
                    {typeof stat.icon === "string" ? (
                      stat.icon
                    ) : (
                      <SvgIcon icon={stat.icon} size="medium" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Metadata-driven Toolbar */}
          <ModuleToolbar
            buttons={allowedButtons}
            onAction={handleToolbarAction}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCount={selectedItem ? 1 : 0}
            availableViews={config.views}
            activeView={activeView}
            onViewChange={setActiveView}
            repeatHeaders={repeatHeaders}
            onRepeatHeadersChange={setRepeatHeaders}
          />

          {/* Table Grid / Gantt Chart / Loading Overlay */}
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-[1px] flex items-center justify-center z-40 rounded-xl">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-semibold text-slate-600 animate-pulse">
                    Processing Data...
                  </span>
                </div>
              </div>
            )}

            {activeView === "gantt" ? (
              <GenericGantt
                data={data}
                dependencies={dependencies}
                columns={config.gridColumns}
                taskModelFields={config.ganttConfig?.taskModelFields || ({} as any)}
                dependencyModelFields={config.ganttConfig?.dependencyModelFields || ({} as any)}
                onEdit={handleEditInitiate}
                onDelete={handleDelete}
                onRowClick={(item) => setSelectedItem(item.id === selectedItem?.id ? null : item)}
              />
            ) : (
              <GenericGrid
                ref={gridPdfRef}
                pdfFileName={`key360_${config.id}_export.pdf`}
                data={gridData}
                columns={config.gridColumns}
                performance={config.performance}
                searchQuery={searchQuery}
                repeatHeaders={repeatHeaders}
                onEdit={handleEditInitiate}
                onDelete={handleDelete}
                onRowClick={(item) => setSelectedItem(item.id === selectedItem?.id ? null : item)}
                onSave={async (id, payload) => {
                  if (!permissions.update) {
                    alert("Permission Denied: You do not have permission to modify records.");
                    return;
                  }
                  setLoading(true);
                  try {
                    if (payload.hours) payload.hours = Number(payload.hours);
                    if (payload.percentComplete) payload.percentComplete = Number(payload.percentComplete);

                    await service.update(id, payload);
                    await fetchData();
                  } catch (err) {
                    console.error("Failed to save inline edit:", err);
                  } finally {
                    setLoading(false);
                  }
                }}
                onViewPdf={setActivePdfItem}
              />
            )}

            {/* Row selected indicator footer */}
            {selectedItem && (
              <div className="bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-lg text-sm text-slate-700 flex justify-between items-center mt-4 animate-fade-in">
                <div>
                  Item selected: <span className="font-semibold text-slate-900">{getSelectedItemDisplayName()}</span>
                </div>
                <button
                  className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
                  onClick={() => setSelectedItem(null)}
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Modal Dialog */}
        {dialogMode !== "none" && (
          <FormDialog
            title={dialogMode === "add" ? `Add ${config.title} Entry` : `Modify ${config.title} Entry`}
            onClose={() => setDialogMode("none")}
            width={config.formLayout === "split-cards" || config.formFields.length > 8 ? 950 : 700}
          >
            <DynamicForm
              fields={config.formFields}
              initialValues={dialogMode === "edit" ? selectedItem : undefined}
              onSubmit={handleFormSubmit}
              onCancel={() => setDialogMode("none")}
              formLayout={config.formLayout}
              formSections={config.formSections}
              formWidgets={config.formWidgets}
            />
          </FormDialog>
        )}

        {/* PDF Viewer Modal */}
        {activePdfItem && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col h-[85vh]">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-rose-100 text-rose-700 rounded">
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">
                      PDF Document Viewer
                    </h2>
                    <p className="text-[10px] text-slate-400">
                      Item: {activePdfItem.name || activePdfItem.itemName || activePdfItem.id} ({activePdfItem.customId || activePdfItem.physicalItemId || "No Code"})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActivePdfItem(null)}
                  className="text-slate-400 hover:text-slate-650 font-bold p-1 bg-slate-150 hover:bg-slate-200 rounded-full w-6 h-6 flex items-center justify-center cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 bg-slate-100 overflow-auto p-4 flex justify-center items-center">
                {activePdfItem.documentPdf ? (
                  <div className="w-full h-full bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
                    <PDFViewer
                      data={activePdfItem.documentPdf}
                      style={{ width: "100%", height: "100%", minHeight: "550px" }}
                    />
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <svg className="w-12 h-12 text-slate-350 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm font-semibold text-slate-500">No PDF Document Attached</p>
                    <p className="text-xs text-slate-400">You can upload a PDF by editing this item record.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </ContentLayout>
    </AppLayout>
  );
}