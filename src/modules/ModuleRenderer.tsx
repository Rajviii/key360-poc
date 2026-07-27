"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import ContentLayout from "@/components/layout/ContentLayout";
import ModuleToolbar from "@/components/toolbar/ModuleToolbar";
import GenericGrid from "@/components/grid/GenericGrid";
import GenericGantt from "@/components/grid/GenericGantt";
import FormDialog from "@/components/dialogs/FormDialog";
import DynamicForm from "@/components/form/DynamicForm";
import TimesheetForm from "@/components/form/TimesheetForm"; // Kept for safety/parity reference
import { ModuleConfig } from "@/metadata/engine";

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

  // Modal dialog states
  const [dialogMode, setDialogMode] = useState<"none" | "add" | "edit">("none");

  // Load module data from generic service
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await service.getAll();
      if (config.views.includes("gantt") && config.defaultView === "gantt") {
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
    }
  };

  // Handle Edit Action on Row / Gantt item
  const handleEditInitiate = (item: any) => {
    if (!permissions.update) {
      alert("Permission Denied: You do not have permission to modify records.");
      return;
    }
    setSelectedItem(item);
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

  // Export grid data to CSV file format
  const handleExport = () => {
    if (data.length === 0) {
      alert("No data available to export.");
      return;
    }

    const fields = config.gridColumns.map(c => c.field);
    const headers = config.gridColumns.map(c => c.title);

    const getFlatRows = (nodes: any[]): any[] => {
      let flat: any[] = [];
      nodes.forEach((node) => {
        flat.push(node);
        if (node.children && node.children.length > 0) {
          flat = flat.concat(getFlatRows(node.children));
        }
      });
      return flat;
    };

    const isGantt = config.views.includes("gantt") && config.defaultView === "gantt";
    const rowsToExport = isGantt ? getFlatRows(data) : data;

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

    const getFlatData = (list: any[]): any[] => {
      let flat: any[] = [];
      list.forEach((item) => {
        flat.push(item);
        if (item.children && item.children.length > 0) {
          flat = flat.concat(getFlatData(item.children));
        }
      });
      return flat;
    };

    const isGantt = config.views.includes("gantt") && config.defaultView === "gantt";
    const flatData = isGantt ? getFlatData(data) : data;

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
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-xl shadow-sm border border-slate-100">
                    {stat.icon}
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

            {config.views.includes("gantt") && config.defaultView === "gantt" ? (
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
                data={data}
                columns={config.gridColumns}
                searchQuery={searchQuery}
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
      </ContentLayout>
    </AppLayout>
  );
}