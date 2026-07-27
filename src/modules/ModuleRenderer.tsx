"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import ContentLayout from "@/components/layout/ContentLayout";
import ModuleToolbar from "@/components/toolbar/ModuleToolbar";
import GenericGrid from "@/components/grid/GenericGrid";
import GenericGantt from "@/components/grid/GenericGantt";
import FormDialog from "@/components/dialogs/FormDialog";
import DynamicForm from "@/components/form/DynamicForm";
import TimesheetForm from "@/components/form/TimesheetForm";
import { ModuleConfig } from "@/types/metadata";

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
      if (config.viewType === "gantt") {
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

  // Handle actions triggered from the Toolbar
  const handleToolbarAction = async (actionType: string) => {
    if (actionType === "add") {
      setDialogMode("add");
    } else if (actionType === "refresh") {
      await fetchData();
    } else if (actionType === "delete") {
      if (selectedItem) {
        await handleDelete(selectedItem);
      }
    } else if (actionType === "export") {
      handleExport();
    }
  };

  // Handle Edit Action on Row / Gantt item
  const handleEditInitiate = (item: any) => {
    setSelectedItem(item);
    setDialogMode("edit");
  };

  // Handle Delete Action on Row
  const handleDelete = async (item: any) => {
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
    
    // Flat mapping function to handle nested task trees if it's Gantt data
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

    const rowsToExport = config.viewType === "gantt" ? getFlatRows(data) : data;

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

  return (
    <AppLayout>
      <ContentLayout
        title={config.title}
        breadcrumbItems={config.breadcrumbs}
      >
        <div className="space-y-6">
          {/* Metadata-driven Toolbar */}
          <ModuleToolbar
            buttons={config.toolbarButtons}
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

            {config.viewType === "gantt" ? (
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
          >
            {config.id === "timesheets" ? (
              <TimesheetForm
                initialValues={dialogMode === "edit" ? selectedItem : undefined}
                onSubmit={handleFormSubmit}
                onCancel={() => setDialogMode("none")}
              />
            ) : (
              <DynamicForm
                fields={config.formFields}
                initialValues={dialogMode === "edit" ? selectedItem : undefined}
                onSubmit={handleFormSubmit}
                onCancel={() => setDialogMode("none")}
              />
            )}
          </FormDialog>
        )}
      </ContentLayout>
    </AppLayout>
  );
}