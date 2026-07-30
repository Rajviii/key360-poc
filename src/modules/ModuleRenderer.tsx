"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import ContentLayout from "@/components/layout/ContentLayout";
import ModuleToolbar from "@/components/toolbar/ModuleToolbar";
import GenericGrid, { GenericGridRef } from "@/components/grid/GenericGrid";
import GenericGantt from "@/components/grid/GenericGantt";
import TaskBoardView from "@/components/taskboard/TaskBoardView";
import FormDialog from "@/components/dialogs/FormDialog";
import DynamicForm from "@/components/form/DynamicForm";
import TimesheetForm from "@/components/form/TimesheetForm"; // Kept for safety/parity reference
import { ModuleConfig } from "@/metadata/engine";
import { PDFViewer as CustomPDFViewer } from "@/components/pdf/PDFViewer";
import { StandardPDFLibViewer } from "@/components/pdf/StandardPDFLibViewer";
import { SvgIcon } from "@progress/kendo-react-common";
import { useNotification } from "@/context/NotificationContext";

interface ModuleRendererProps {
  config: ModuleConfig;
  service: any;
  onCustomAction?: (action: string, item: any) => void;
}

export default function ModuleRenderer({ config, service, onCustomAction }: ModuleRendererProps) {
  const { showSuccess, showError, showInfo, showWarning } = useNotification();
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

  // KPI Visualization mode: "compact" (default - saves ~140px vertical height), "cards" (expanded), or "hidden"
  const [kpiMode, setKpiMode] = useState<"compact" | "cards" | "hidden">("compact");

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
    return (config.toolbarButtons || []).filter((btn) => {
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
        showWarning("Permission Denied: You cannot create new entries.");
        return;
      }
      setDialogMode("add");
    } else if (actionType === "refresh") {
      await fetchData();
      showInfo("Table data refreshed.");
    } else if (actionType === "delete") {
      if (!permissions.delete) {
        showWarning("Permission Denied: You cannot delete records.");
        return;
      }
      if (selectedItem) {
        await handleDelete(selectedItem);
      } else {
        showInfo("Please select a record to delete.");
      }
    } else if (actionType === "export") {
      showInfo("Exporting dataset to Excel...");
      handleExport();
    } else if (actionType === "exportPdf") {
      if (gridPdfRef.current) {
        showInfo("Generating PDF document export...");
        gridPdfRef.current.exportPDF();
      }
    }
  };

  // Handle Edit Action on Row / Gantt item
  const handleEditInitiate = (item: any) => {
    if (!permissions.update) {
      showWarning("Permission Denied: You do not have permission to modify records.");
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
      showWarning("Permission Denied: You do not have permission to delete records.");
      return;
    }
    const displayName = item.employeeName || item.title || item.id;
    if (confirm(`Are you sure you want to delete this record (${displayName})?`)) {
      setLoading(true);
      try {
        const success = await service.delete(item.id);
        if (success) {
          showSuccess(`Record (${displayName}) deleted successfully.`);
          await fetchData();
        } else {
          showError(`Failed to delete record (${displayName}).`);
        }
      } catch (err) {
        console.error("Failed to delete record:", err);
        showError("An error occurred while deleting the record.");
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
        showSuccess("New record added successfully.");
      } else if (dialogMode === "edit" && selectedItem) {
        await service.update(selectedItem.id, payload);
        showSuccess("Record updated successfully.");
      }
      setDialogMode("none");
      await fetchData();
    } catch (err) {
      console.error("Failed to save record:", err);
      showError("Failed to save record. Please check inputs.");
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

    const fields = (config.gridColumns || []).map(c => c.field);
    const headers = (config.gridColumns || []).map(c => c.title);
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

          {/* Dynamic Module-specific KPI Bar / Cards */}
          {stats && kpiMode !== "hidden" && (
            kpiMode === "compact" ? (
              /* Compact Horizontal Summary Strip (Saves ~140px vertical space for grid) */
              <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-5 flex-wrap divide-x divide-slate-100">
                  {stats.map((stat, i) => (
                    <div key={i} className={`flex items-center gap-2.5 ${i > 0 ? "pl-5" : ""}`}>
                      <div className="w-7 h-7 rounded-md bg-slate-50 flex items-center justify-center text-sm shadow-xs border border-slate-100 text-slate-700">
                        {typeof stat.icon === "string" ? stat.icon : <SvgIcon icon={stat.icon} size="small" />}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {stat.label}:
                        </span>
                        <span className={`text-sm font-extrabold tracking-tight ${stat.color}`}>
                          {stat.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setKpiMode("cards")}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                    title="Expand to large cards"
                  >
                    <span>Cards</span> 🗂️
                  </button>
                  <button
                    onClick={() => setKpiMode("hidden")}
                    className="text-[11px] font-bold text-slate-400 hover:text-slate-600 px-1.5 py-1 cursor-pointer"
                    title="Hide KPI bar"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              /* Expanded Cards Grid View */
              <div className="space-y-2 animate-fade-in">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Performance Metrics</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setKpiMode("compact")}
                      // className="text-xs font-semibold text-white hover:text-green-800 bg-green-600 px-2.5 py-1 rounded-md border border-green-200 transition-colors cursor-pointer"
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                    >
                      ⚡ Compact Bar
                    </button>
                    <button
                      onClick={() => setKpiMode("hidden")}
                      className="text-xs font-bold text-slate-400 hover:text-slate-600 px-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </div>
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
              </div>
            )
          )}

          {/* Show KPIs toggle if hidden */}
          {stats && kpiMode === "hidden" && (
            <div className="flex justify-end -mb-4">
              <button
                onClick={() => setKpiMode("compact")}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-3 py-1 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>📊 Show KPI Metrics</span>
              </button>
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

            {activeView === "taskboard" ? (
              <TaskBoardView />
            ) : activeView === "gantt" ? (
              <GenericGantt
                data={data}
                dependencies={dependencies}
                columns={config.gridColumns || []}
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
                columns={config.gridColumns || []}
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
                onViewPdf={(item) => {
                  if (onCustomAction) {
                    onCustomAction("view", item);
                  } else {
                    setActivePdfItem(item);
                  }
                }}
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
            width={config.formLayout === "split-cards" || (config.formFields?.length ?? 0) > 8 ? 950 : 700}
          >
            <DynamicForm
              fields={config.formFields || []}
              initialValues={dialogMode === "edit" ? selectedItem : undefined}
              onSubmit={handleFormSubmit}
              onCancel={() => setDialogMode("none")}
              formLayout={config.formLayout}
              formSections={config.formSections}
              formWidgets={config.formWidgets}
            />
          </FormDialog>
        )}

        {/* PDF Viewer & Signature Modal */}
        {activePdfItem && (
          config.id === "agreements" || config.id === "pdf-forms" ? (
            <CustomPDFViewer
              isOpen={!!activePdfItem}
              onClose={() => setActivePdfItem(null)}
              documentItem={{
                id: activePdfItem.id,
                title: activePdfItem.title || activePdfItem.name || `Document #${activePdfItem.id}`,
                type: config.id === "agreements" ? "agreement" : "pdf-form",
                status: activePdfItem.status || "Draft",
                vendor: activePdfItem.vendor,
                createdDate: activePdfItem.createdDate,
                documentPdf: activePdfItem.documentPdf,
                signatures: activePdfItem.signatures || [],
                texts: activePdfItem.texts || [],
                highlights: activePdfItem.highlights || [],
                comments: activePdfItem.comments || [],
                formValues: activePdfItem,
              }}
              viewerOptions={(config as any).viewerOptions}
              editorOptions={(config as any).editorOptions}
              formOptions={(config as any).formOptions}
              onSaveDocument={async (id, updates) => {
                try {
                  await service.update(id, updates);
                  showSuccess("Document annotations and signature updated successfully.");
                  await fetchData();
                } catch (err) {
                  console.error("Failed to save document updates:", err);
                }
              }}
            />
          ) : (
            <StandardPDFLibViewer
              isOpen={!!activePdfItem}
              onClose={() => setActivePdfItem(null)}
              item={activePdfItem}
              moduleTitle={config.title}
            />
          )
        )}
      </ContentLayout>
    </AppLayout>
  );
}