"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import {
  plusIcon,
} from "@progress/kendo-svg-icons";
import { useNotification } from "@/context/NotificationContext";
import FormDialog from "@/components/dialogs/FormDialog";

export interface TaskCard {
  id: string | number;
  title: string;
  columnId: string;
  description?: string;
  assignee?: string;
  badgeColor?: string;
  illustrationType?: "landing" | "target" | "funnel" | "email" | "chat" | "cart" | "blog";
}

export interface TaskColumn {
  id: string;
  title: string;
  badgeColor: string;
}

const defaultColumns: TaskColumn[] = [
  { id: "todo", title: "To-Do", badgeColor: "bg-amber-500 text-white" },
  { id: "in-progress", title: "In Progress", badgeColor: "bg-blue-600 text-white" },
  { id: "done", title: "Done", badgeColor: "bg-emerald-600 text-white" },
];

const initialTasks: TaskCard[] = [
  {
    id: "1",
    title: "Create a new landing page for campaign",
    columnId: "todo",
    description: "Design responsive landing page with high-converting CTA sections",
    assignee: "Rajvi Test",
    illustrationType: "landing",
    badgeColor: "border-l-amber-500",
  },
  {
    id: "2",
    title: "Send newsletter & press release",
    columnId: "todo",
    description: "Broadcast monthly product feature updates to subscribers",
    assignee: "John Doe",
    illustrationType: "email",
    badgeColor: "border-l-amber-500",
  },
  {
    id: "3",
    title: "Review ads performance & metrics",
    columnId: "todo",
    description: "Analyze Q3 campaign spend vs conversion metrics",
    assignee: "Yash PM",
    illustrationType: "target",
    badgeColor: "border-l-amber-500",
  },
  {
    id: "4",
    title: "Funnel analysis & drop-off optimization",
    columnId: "in-progress",
    description: "Identify checkout step drop-offs and improve UX flow",
    assignee: "Rajvi Test",
    illustrationType: "funnel",
    badgeColor: "border-l-blue-500",
  },
  {
    id: "5",
    title: "Collaborate with designers on new banners",
    columnId: "in-progress",
    description: "Finalize SVG illustrations and promo banners",
    assignee: "Design Team",
    illustrationType: "target",
    badgeColor: "border-l-blue-500",
  },
  {
    id: "6",
    title: "Refine feedback from user interviews",
    columnId: "done",
    description: "Synthesize usability testing recordings into actionable backlog items",
    assignee: "UX Team",
    illustrationType: "chat",
    badgeColor: "border-l-emerald-500",
  },
  {
    id: "7",
    title: "Review shopping cart checkout experience",
    columnId: "done",
    description: "Audit payment gateway integrations and mobile responsiveness",
    assignee: "QA Team",
    illustrationType: "cart",
    badgeColor: "border-l-emerald-500",
  },
  {
    id: "8",
    title: "Publish new engineering blogpost",
    columnId: "done",
    description: "Technical write-up on Key360 real-time metadata engine",
    assignee: "Tech Writer",
    illustrationType: "blog",
    badgeColor: "border-l-emerald-500",
  },
];

export default function TaskBoardView() {
  const { showSuccess, showInfo } = useNotification();
  const [columns, setColumns] = useState<TaskColumn[]>(defaultColumns);
  const [tasks, setTasks] = useState<TaskCard[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal / Add state
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [targetColumnForNewTask, setTargetColumnForNewTask] = useState<string>("todo");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("Rajvi Test");

  // Editing Column Title
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingColumnTitle, setEditingColumnTitle] = useState("");

  // Active Menu card ID
  const [activeMenuCardId, setActiveMenuCardId] = useState<string | number | null>(null);

  // Drag & Drop State
  const [draggedTaskId, setDraggedTaskId] = useState<string | number | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  // Handle Drag & Drop Task to Column
  const handleDropCard = (targetColId: string) => {
    if (!draggedTaskId) return;

    const taskToMove = tasks.find((t) => t.id === draggedTaskId);
    if (!taskToMove || taskToMove.columnId === targetColId) {
      setDraggedTaskId(null);
      setDragOverColumnId(null);
      return;
    }

    const targetCol = columns.find((c) => c.id === targetColId);
    let border = "border-l-purple-500";
    if (targetColId === "todo") border = "border-l-amber-500";
    else if (targetColId === "in-progress") border = "border-l-blue-500";
    else if (targetColId === "done") border = "border-l-emerald-500";

    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === draggedTaskId ? { ...t, columnId: targetColId, badgeColor: border } : t
      )
    );

    setDraggedTaskId(null);
    setDragOverColumnId(null);
    showSuccess(`Moved task to "${targetCol?.title || targetColId}".`);
  };

  // Filter tasks by search query
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.assignee && t.assignee.toLowerCase().includes(q))
    );
  }, [tasks, searchQuery]);

  // Handle Add Column
  const handleAddColumnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;
    const colId = `col-${Date.now()}`;
    const newCol: TaskColumn = {
      id: colId,
      title: newColumnTitle.trim(),
      badgeColor: "bg-purple-600 text-white",
    };
    setColumns([...columns, newCol]);
    setNewColumnTitle("");
    setIsAddColumnOpen(false);
    showSuccess(`Added new column "${newCol.title}".`);
  };

  // Handle Save Column Edit
  const handleSaveColumnEdit = (colId: string) => {
    if (!editingColumnTitle.trim()) return;
    setColumns(
      columns.map((c) => (c.id === colId ? { ...c, title: editingColumnTitle.trim() } : c))
    );
    setEditingColumnId(null);
    setEditingColumnTitle("");
    showSuccess("Column title updated.");
  };

  // Handle Delete Column
  const handleDeleteColumn = (colId: string) => {
    const col = columns.find((c) => c.id === colId);
    setColumns(columns.filter((c) => c.id !== colId));
    setTasks(tasks.filter((t) => t.columnId !== colId));
    showInfo(`Removed column "${col?.title || colId}".`);
  };

  // Handle Add Task
  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const illustrations: ("landing" | "target" | "funnel" | "email" | "chat" | "cart" | "blog")[] = [
      "landing",
      "target",
      "funnel",
      "email",
      "chat",
      "cart",
      "blog",
    ];
    const randomIllustration = illustrations[Math.floor(Math.random() * illustrations.length)];

    const newTask: TaskCard = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      columnId: targetColumnForNewTask,
      description: newTaskDesc.trim() || undefined,
      assignee: newTaskAssignee,
      illustrationType: randomIllustration,
      badgeColor:
        targetColumnForNewTask === "done"
          ? "border-l-emerald-500"
          : targetColumnForNewTask === "in-progress"
          ? "border-l-blue-500"
          : "border-l-amber-500",
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
    setNewTaskDesc("");
    setIsAddTaskOpen(false);
    showSuccess("New task added to TaskBoard.");
  };

  // Move Task to Next / Previous Column
  const moveTask = (taskId: string | number, direction: "next" | "prev") => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (t.id !== taskId) return t;
        const currentColIdx = columns.findIndex((c) => c.id === t.columnId);
        if (currentColIdx === -1) return t;

        const nextColIdx = direction === "next" ? currentColIdx + 1 : currentColIdx - 1;
        if (nextColIdx < 0 || nextColIdx >= columns.length) return t;

        const nextCol = columns[nextColIdx];
        let border = "border-l-purple-500";
        if (nextCol.id === "todo") border = "border-l-amber-500";
        else if (nextCol.id === "in-progress") border = "border-l-blue-500";
        else if (nextCol.id === "done") border = "border-l-emerald-500";

        return { ...t, columnId: nextCol.id, badgeColor: border };
      })
    );
    setActiveMenuCardId(null);
  };

  // Delete Task
  const deleteTask = (taskId: string | number) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
    setActiveMenuCardId(null);
    showInfo("Task removed.");
  };

  // Render SVG Illustrations for Cards
  const renderCardIllustration = (type?: string) => {
    switch (type) {
      case "landing":
        return (
          <div className="w-full h-24 bg-amber-50/60 rounded-lg flex items-center justify-center p-2 border border-amber-100/50">
            <svg className="w-20 h-16 text-amber-500/80" fill="none" stroke="currentColor" viewBox="0 0 100 80">
              <rect x="5" y="5" width="90" height="70" rx="8" strokeWidth="3" fill="#fff" />
              <rect x="15" y="15" width="30" height="25" rx="4" strokeWidth="2" stroke="#f59e0b" fill="#fef3c7" />
              <rect x="55" y="15" width="30" height="25" rx="4" strokeWidth="2" stroke="#f59e0b" fill="#fef3c7" />
              <line x1="15" y1="50" x2="85" y2="50" strokeWidth="3" stroke="#f59e0b" strokeDasharray="4 4" />
              <circle cx="20" cy="62" r="4" fill="#f59e0b" />
              <line x1="30" y1="62" x2="70" y2="62" strokeWidth="2" stroke="#d97706" />
            </svg>
          </div>
        );
      case "email":
        return (
          <div className="w-full h-24 bg-rose-50/60 rounded-lg flex items-center justify-center p-2 border border-rose-100/50">
            <svg className="w-20 h-16 text-rose-500/80" fill="none" stroke="currentColor" viewBox="0 0 100 80">
              <rect x="10" y="15" width="80" height="50" rx="6" strokeWidth="3" fill="#fff" />
              <path d="M10 20 L50 48 L90 20" strokeWidth="3" stroke="#f43f5e" />
              <circle cx="75" cy="55" r="10" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="2" />
              <path d="M71 55 L74 58 L79 52" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        );
      case "target":
        return (
          <div className="w-full h-24 bg-blue-50/60 rounded-lg flex items-center justify-center p-2 border border-blue-100/50">
            <svg className="w-20 h-16 text-blue-500/80" fill="none" stroke="currentColor" viewBox="0 0 100 80">
              <circle cx="50" cy="40" r="30" strokeWidth="3" stroke="#3b82f6" fill="#fff" />
              <circle cx="50" cy="40" r="20" strokeWidth="3" stroke="#93c5fd" fill="#dbeafe" />
              <circle cx="50" cy="40" r="10" strokeWidth="3" stroke="#1d4ed8" fill="#2563eb" />
              <path d="M55 20 L75 10 M70 10 L75 10 L75 15" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        );
      case "funnel":
        return (
          <div className="w-full h-24 bg-indigo-50/60 rounded-lg flex items-center justify-center p-2 border border-indigo-100/50">
            <svg className="w-20 h-16 text-indigo-500/80" fill="none" stroke="currentColor" viewBox="0 0 100 80">
              <polygon points="15,10 85,10 60,50 60,70 40,75 40,50" strokeWidth="3" stroke="#6366f1" fill="#e0e7ff" />
              <line x1="25" y1="22" x2="75" y2="22" stroke="#6366f1" strokeWidth="2" />
              <line x1="35" y1="36" x2="65" y2="36" stroke="#6366f1" strokeWidth="2" />
            </svg>
          </div>
        );
      case "chat":
        return (
          <div className="w-full h-24 bg-purple-50/60 rounded-lg flex items-center justify-center p-2 border border-purple-100/50">
            <svg className="w-20 h-16 text-purple-500/80" fill="none" stroke="currentColor" viewBox="0 0 100 80">
              <path d="M15 20 Q15 10 30 10 L70 10 Q85 10 85 20 L85 45 Q85 55 70 55 L35 55 L20 68 L22 55 Q15 55 15 45 Z" strokeWidth="3" stroke="#a855f7" fill="#fff" />
              <line x1="30" y1="26" x2="70" y2="26" stroke="#c084fc" strokeWidth="3" strokeLinecap="round" />
              <line x1="30" y1="38" x2="55" y2="38" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        );
      case "cart":
        return (
          <div className="w-full h-24 bg-emerald-50/60 rounded-lg flex items-center justify-center p-2 border border-emerald-100/50">
            <svg className="w-20 h-16 text-emerald-500/80" fill="none" stroke="currentColor" viewBox="0 0 100 80">
              <path d="M15 15 L25 15 L35 50 L80 50 L90 25 L30 25" strokeWidth="3" stroke="#10b981" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="42" cy="63" r="6" stroke="#10b981" strokeWidth="3" fill="#fff" />
              <circle cx="75" cy="63" r="6" stroke="#10b981" strokeWidth="3" fill="#fff" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Bar: Add Column & Real-Time Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            svgIcon={plusIcon}
            onClick={() => setIsAddColumnOpen(true)}
            className="font-bold text-xs bg-slate-800 text-white hover:bg-slate-900 px-3.5 py-2 rounded-lg cursor-pointer"
          >
            Add Column
          </Button>

          <Button
            svgIcon={plusIcon}
            onClick={() => {
              setTargetColumnForNewTask(columns[0]?.id || "todo");
              setIsAddTaskOpen(true);
            }}
            className="font-bold text-xs bg-emerald-700 text-white hover:bg-emerald-800 px-3.5 py-2 rounded-lg cursor-pointer"
          >
            New Task
          </Button>
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-64">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.value as string)}
            placeholder="Search tasks..."
            className="w-full text-xs"
          />
        </div>
      </div>

      {/* Main TaskBoard Grid Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5 min-h-[600px] items-start overflow-x-auto pb-4">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.columnId === col.id);

          return (
            <div
              key={col.id}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (dragOverColumnId !== col.id) setDragOverColumnId(col.id);
              }}
              onDragLeave={(e) => {
                if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                setDragOverColumnId(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDropCard(col.id);
              }}
              className={`rounded-2xl border p-3.5 flex flex-col max-h-[750px] transition-all duration-200 ${
                dragOverColumnId === col.id
                  ? "bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-400/80 shadow-lg scale-[1.01]"
                  : "bg-slate-100/80 border-slate-200/80 shadow-xs"
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3 mb-3 px-1">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs ${col.badgeColor}`}
                  >
                    {colTasks.length}
                  </span>

                  {editingColumnId === col.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editingColumnTitle}
                        onChange={(e) => setEditingColumnTitle(e.target.value)}
                        className="text-xs font-bold text-slate-800 px-1.5 py-0.5 rounded border border-slate-300 w-28 bg-white"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveColumnEdit(col.id)}
                        className="text-emerald-600 hover:text-emerald-800 p-0.5 cursor-pointer"
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <h3 className="font-bold text-sm text-slate-800 tracking-tight">
                      {col.title}
                    </h3>
                  )}
                </div>

                {/* Column Actions */}
                <div className="flex items-center gap-1 text-slate-400">
                  <button
                    title="Edit column name"
                    onClick={() => {
                      setEditingColumnId(col.id);
                      setEditingColumnTitle(col.title);
                    }}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>

                  <button
                    title="Add task to this column"
                    onClick={() => {
                      setTargetColumnForNewTask(col.id);
                      setIsAddTaskOpen(true);
                    }}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>

                  <button
                    title="Delete column"
                    onClick={() => handleDeleteColumn(col.id)}
                    className="p-1 hover:bg-rose-100 hover:text-rose-600 rounded text-slate-400 transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Column Tasks List */}
              <div className="space-y-3 overflow-y-auto pr-1 flex-1 min-h-[150px]">
                {colTasks.length === 0 ? (
                  <div className="h-32 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400 bg-white/40">
                    Drop tasks here
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", String(task.id));
                        setDraggedTaskId(task.id);
                      }}
                      onDragEnd={() => {
                        setDraggedTaskId(null);
                        setDragOverColumnId(null);
                      }}
                      className={`bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-2.5 relative border-l-4 cursor-grab active:cursor-grabbing ${
                        task.badgeColor || "border-l-slate-400"
                      } ${draggedTaskId === task.id ? "opacity-40 scale-95 ring-2 ring-emerald-400" : "opacity-100"}`}
                    >
                      {/* Card Title & Context Menu */}
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-800 leading-snug">
                          {task.title}
                        </h4>

                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveMenuCardId(activeMenuCardId === task.id ? null : task.id)
                            }
                            className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>

                          {/* Card Dropdown Menu */}
                          {activeMenuCardId === task.id && (
                            <div className="absolute right-0 top-6 w-36 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-30 text-[11px] font-semibold text-slate-700">
                              <button
                                onClick={() => moveTask(task.id, "prev")}
                                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                              >
                                <span>← Move Prev</span>
                              </button>
                              <button
                                onClick={() => moveTask(task.id, "next")}
                                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                              >
                                <span>Move Next →</span>
                              </button>
                              <div className="my-1 border-b border-slate-100" />
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-600 flex items-center gap-1.5 cursor-pointer"
                              >
                                <span>Delete Task</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Graphic Illustration */}
                      {renderCardIllustration(task.illustrationType)}

                      {/* Card Description */}
                      {task.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Card Footer Info */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                          👤 {task.assignee || "Unassigned"}
                        </span>
                        <span className="text-slate-400 font-medium uppercase tracking-wider">
                          Key360 Card
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Column Dialog */}
      {isAddColumnOpen && (
        <FormDialog
          title="Add New TaskBoard Column"
          onClose={() => setIsAddColumnOpen(false)}
          width={450}
        >
          <form onSubmit={handleAddColumnSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Column Title</label>
              <Input
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.value as string)}
                placeholder="e.g., Code Review, QA Testing, Backlog"
                className="w-full"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                onClick={() => setIsAddColumnOpen(false)}
                className="font-bold text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                themeColor="primary"
                className="font-bold text-xs cursor-pointer"
              >
                Create Column
              </Button>
            </div>
          </form>
        </FormDialog>
      )}

      {/* Add Task Dialog */}
      {isAddTaskOpen && (
        <FormDialog
          title="Create New Task Card"
          onClose={() => setIsAddTaskOpen(false)}
          width={500}
        >
          <form onSubmit={handleAddTaskSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Task Title *</label>
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.value as string)}
                placeholder="Enter task headline / title"
                className="w-full"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Task Description</label>
              <textarea
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                placeholder="Enter task details..."
                rows={3}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assignee</label>
                <Input
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.value as string)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Column</label>
                <select
                  value={targetColumnForNewTask}
                  onChange={(e) => setTargetColumnForNewTask(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md bg-white font-semibold"
                >
                  {columns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button onClick={() => setIsAddTaskOpen(false)} className="font-bold text-xs">
                Cancel
              </Button>
              <Button type="submit" themeColor="primary" className="font-bold text-xs cursor-pointer">
                Add Task Card
              </Button>
            </div>
          </form>
        </FormDialog>
      )}
    </div>
  );
}
