"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import ContentLayout from "@/components/layout/ContentLayout";
import GenericGantt from "@/components/grid/GenericGantt";
import { projectPlanningService, GanttTask } from "@/services/projectPlanningService";
import { projectPlanningModuleConfig } from "@/metadata/projectPlanning";
import { Splitter, SplitterPaneProps } from "@progress/kendo-react-layout";
import { Button } from "@progress/kendo-react-buttons";
import { SvgIcon } from "@progress/kendo-react-common";
import { plusIcon, arrowRotateCwIcon, filterIcon } from "@progress/kendo-svg-icons";
import { useNotification } from "@/context/NotificationContext";
import FormDialog from "@/components/dialogs/FormDialog";
import DynamicForm from "@/components/form/DynamicForm";

import TaskBoardView from "@/components/taskboard/TaskBoardView";

export default function ProjectPlanningView() {
  const { showSuccess, showInfo } = useNotification();
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [dependencies, setDependencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<GanttTask | null>(null);
  const [activeView, setActiveView] = useState<"gantt" | "taskboard">("gantt");

  const [panes, setPanes] = useState<SplitterPaneProps[]>([
    { size: "280px", min: "200px", max: "450px", resizable: true },
    { resizable: true },
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await projectPlanningService.getAll();
      setTasks(res.tasks || []);
      setDependencies(res.dependencies || []);
    } catch (err) {
      console.error("Failed to load project tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTask = async (formData: Record<string, any>) => {
    try {
      await projectPlanningService.create({
        title: formData.title || "New Task",
        start: new Date(formData.start || Date.now()),
        end: new Date(formData.end || Date.now() + 86400000 * 5),
        percentComplete: Number(formData.percentComplete) / 100 || 0,
        parentId: formData.parentId ? Number(formData.parentId) : null,
      });
      showSuccess("New project task created successfully.");
      setIsAddOpen(false);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (task: GanttTask) => {
    if (confirm(`Delete project task "${task.title}"?`)) {
      await projectPlanningService.delete(task.id);
      showSuccess(`Task "${task.title}" deleted.`);
      await loadData();
    }
  };

  // Helper to count total tasks recursively
  const countTasks = (list: GanttTask[]): number => {
    let count = 0;
    list.forEach((t) => {
      count++;
      if (t.children) count += countTasks(t.children);
    });
    return count;
  };

  return (
    <AppLayout>
      <ContentLayout
        title="Project Planning (Gantt)"
        breadcrumbItems={["Project Management", "Project Planning (Gantt)"]}
      >
        <div className="space-y-4">
          {/* Header Action Bar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="bg-emerald-50 text-emerald-700 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-200">
                FLAGSHIP GANTT ENGINE
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                Total Scheduled Tasks: <strong className="text-slate-800">{countTasks(tasks)}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* View Switcher Toggle */}
              <div className="flex items-center bg-slate-100 p-1 rounded-lg gap-1 text-xs">
                <button
                  onClick={() => setActiveView("gantt")}
                  className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    activeView === "gantt"
                      ? "bg-white text-slate-800 shadow-xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  📊 Gantt View
                </button>
                <button
                  onClick={() => setActiveView("taskboard")}
                  className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    activeView === "taskboard"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  📋 Task Board
                </button>
              </div>

              <Button
                svgIcon={plusIcon}
                themeColor="primary"
                size="small"
                onClick={() => setIsAddOpen(true)}
                className="font-bold text-xs cursor-pointer"
              >
                Add Task
              </Button>
              <Button
                svgIcon={arrowRotateCwIcon}
                size="small"
                onClick={loadData}
                className="text-xs font-semibold cursor-pointer"
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Conditional View Rendering */}
          {activeView === "taskboard" ? (
            <TaskBoardView />
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px] relative">
              {loading && (
                <div className="absolute inset-0 bg-slate-50/60 backdrop-blur-[1px] flex items-center justify-center z-50">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold text-slate-600">Loading Gantt Hierarchy...</span>
                  </div>
                </div>
              )}

              <Splitter panes={panes} onChange={(e) => setPanes(e.newState)} style={{ height: 600 }}>
                {/* Left Pane: Project Task Hierarchy & Resource Summary */}
                <div className="p-4 bg-slate-50 border-r border-slate-200 h-full overflow-y-auto space-y-4">
                  <div className="border-b border-slate-200 pb-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Project Summary</h4>
                    <p className="text-[11px] text-slate-400">Key360 Enterprise Architecture</p>
                  </div>

                  <div className="space-y-2">
                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs shadow-xs space-y-1">
                      <span className="text-slate-400 font-medium block text-[10px] uppercase">Active Project</span>
                      <span className="font-extrabold text-slate-800 text-xs block">Key360 Cloud Platform V2</span>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: "68%" }}></div>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold block text-right">68% Overall Progress</span>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs shadow-xs space-y-2">
                      <span className="text-slate-400 font-medium block text-[10px] uppercase">Resource Allocation</span>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between font-semibold">
                          <span className="text-slate-600">John Doe (Dev Lead)</span>
                          <span className="text-slate-800 font-bold">100%</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span className="text-slate-600">Rajvi Test (UX Lead)</span>
                          <span className="text-slate-800 font-bold">85%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Pane: Full Interactive Kendo Gantt Chart */}
                <div className="p-2 h-full overflow-hidden">
                  <GenericGantt
                    data={tasks}
                    dependencies={dependencies}
                    columns={projectPlanningModuleConfig.gridColumns || []}
                    taskModelFields={projectPlanningModuleConfig.ganttConfig?.taskModelFields as any}
                    dependencyModelFields={projectPlanningModuleConfig.ganttConfig?.dependencyModelFields as any}
                    onDelete={handleDeleteTask}
                    onRowClick={(task) => setSelectedTask(task)}
                  />
                </div>
              </Splitter>
            </div>
          )}
        </div>

        {/* Create Task Dialog */}
        {isAddOpen && (
          <FormDialog
            title="Create New Project Task"
            onClose={() => setIsAddOpen(false)}
            width={600}
          >
            <DynamicForm
              fields={projectPlanningModuleConfig.formFields || []}
              onSubmit={handleCreateTask}
              onCancel={() => setIsAddOpen(false)}
            />
          </FormDialog>
        )}
      </ContentLayout>
    </AppLayout>
  );
}
