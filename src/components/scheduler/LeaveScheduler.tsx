"use client";

import React, { useState, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import ContentLayout from "@/components/layout/ContentLayout";
import { Calendar } from "@progress/kendo-react-dateinputs";
import { Button } from "@progress/kendo-react-buttons";
import { useNotification } from "@/context/NotificationContext";
import FormDialog from "@/components/dialogs/FormDialog";

export interface LeaveEvent {
  id: number;
  employeeName: string;
  department: string;
  avatarColor: string;
  title: string;
  type: "Vacation" | "Sick" | "Parental" | "Remote" | "Unpaid";
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: "Approved" | "Pending" | "Rejected";
  reason: string;
  approverNotes?: string;
  halfDay?: boolean;
}

// Comprehensive Initial Leave Requests & Absences
const INITIAL_EVENTS: LeaveEvent[] = [
  {
    id: 1,
    employeeName: "Rajvi Test",
    department: "Engineering",
    avatarColor: "bg-emerald-600",
    title: "Annual Summer Break",
    type: "Vacation",
    startDate: "2026-07-20",
    endDate: "2026-07-24",
    status: "Approved",
    reason: "Family vacation to Europe",
  },
  {
    id: 2,
    employeeName: "John Doe",
    department: "Product Management",
    avatarColor: "bg-blue-600",
    title: "Flu Recovery",
    type: "Sick",
    startDate: "2026-07-22",
    endDate: "2026-07-23",
    status: "Approved",
    reason: "Medical leave for seasonal fever",
  },
  {
    id: 3,
    employeeName: "Sarah Smith",
    department: "Human Resources",
    avatarColor: "bg-purple-600",
    title: "Parental Care Leave",
    type: "Parental",
    startDate: "2026-07-25",
    endDate: "2026-07-30",
    status: "Pending",
    reason: "New child registration and parental duties",
  },
  {
    id: 4,
    employeeName: "Michael Chen",
    department: "Engineering",
    avatarColor: "bg-teal-600",
    title: "Remote Work & Travel",
    type: "Remote",
    startDate: "2026-07-14",
    endDate: "2026-07-17",
    status: "Approved",
    reason: "Working remotely from London branch",
  },
  {
    id: 5,
    employeeName: "Emma Watson",
    department: "Design & UX",
    avatarColor: "bg-pink-600",
    title: "Personal Leave",
    type: "Unpaid",
    startDate: "2026-07-28",
    endDate: "2026-07-29",
    status: "Pending",
    reason: "Relocation and home moving",
  },
  {
    id: 6,
    employeeName: "David Miller",
    department: "Finance",
    avatarColor: "bg-amber-600",
    title: "Annual Vacation",
    type: "Vacation",
    startDate: "2026-07-06",
    endDate: "2026-07-10",
    status: "Approved",
    reason: "Beach trip",
  },
  {
    id: 7,
    employeeName: "Priya Sharma",
    department: "Engineering",
    avatarColor: "bg-indigo-600",
    title: "Medical Checkup",
    type: "Sick",
    startDate: "2026-07-20",
    endDate: "2026-07-20",
    status: "Approved",
    reason: "Hospital appointment",
  },
];

const DEPARTMENTS = ["All Departments", "Engineering", "Product Management", "Human Resources", "Design & UX", "Finance"];
const LEAVE_TYPES: Array<LeaveEvent["type"]> = ["Vacation", "Sick", "Parental", "Remote", "Unpaid"];

// Color map helper for leave types
const CATEGORY_COLORS: Record<LeaveEvent["type"], { bg: string; text: string; border: string; dot: string; barBg: string }> = {
  Vacation: {
    bg: "bg-emerald-50 text-emerald-800",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    barBg: "bg-emerald-500 text-white",
    text: "text-emerald-700",
  },
  Sick: {
    bg: "bg-amber-50 text-amber-800",
    border: "border-amber-200",
    dot: "bg-amber-500",
    barBg: "bg-amber-500 text-white",
    text: "text-amber-700",
  },
  Parental: {
    bg: "bg-purple-50 text-purple-800",
    border: "border-purple-200",
    dot: "bg-purple-500",
    barBg: "bg-purple-500 text-white",
    text: "text-purple-700",
  },
  Remote: {
    bg: "bg-sky-50 text-sky-800",
    border: "border-sky-200",
    dot: "bg-sky-500",
    barBg: "bg-sky-500 text-white",
    text: "text-sky-700",
  },
  Unpaid: {
    bg: "bg-rose-50 text-rose-800",
    border: "border-rose-200",
    dot: "bg-rose-500",
    barBg: "bg-rose-500 text-white",
    text: "text-rose-700",
  },
};

const STATUS_BADGES: Record<LeaveEvent["status"], string> = {
  Approved: "bg-emerald-100 text-emerald-800 border-emerald-300",
  Pending: "bg-amber-100 text-amber-800 border-amber-300 animate-pulse",
  Rejected: "bg-slate-100 text-slate-600 border-slate-300 line-through",
};

export default function LeaveScheduler() {
  const { showSuccess, showInfo } = useNotification();

  // Core State
  const [date, setDate] = useState<Date>(new Date(2026, 6, 20)); // July 20, 2026
  const [events, setEvents] = useState<LeaveEvent[]>(INITIAL_EVENTS);
  const [viewMode, setViewMode] = useState<"month" | "week" | "day" | "timeline">("month");

  // Filtering State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Dialog State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState<LeaveEvent | null>(null);

  // Form State
  const [formEmployee, setFormEmployee] = useState("Rajvi Test");
  const [formDept, setFormDept] = useState("Engineering");
  const [formType, setFormType] = useState<LeaveEvent["type"]>("Vacation");
  const [formStart, setFormStart] = useState("2026-07-20");
  const [formEnd, setFormEnd] = useState("2026-07-24");
  const [formReason, setFormReason] = useState("");

  // Helper date conversions
  const formatDateString = (d: Date) => d.toISOString().split("T")[0];
  const selectedDateStr = formatDateString(date);

  // Synchronized Calendar Date Change
  const handleDateChange = (e: any) => {
    if (e.value) {
      setDate(new Date(e.value));
    }
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() - 1);
    setDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + 1);
    setDate(newDate);
  };

  const handleToday = () => {
    setDate(new Date(2026, 6, 20));
  };

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchesSearch =
        evt.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.reason.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = selectedDept === "All Departments" || evt.department === selectedDept;
      const matchesCategory = selectedCategory === "all" || evt.type === selectedCategory;
      const matchesStatus = selectedStatus === "all" || evt.status === selectedStatus;

      return matchesSearch && matchesDept && matchesCategory && matchesStatus;
    });
  }, [events, searchQuery, selectedDept, selectedCategory, selectedStatus]);

  // Executive KPI Calculations
  const activeAbsencesToday = useMemo(() => {
    return events.filter(
      (evt) => evt.status === "Approved" && evt.startDate <= selectedDateStr && evt.endDate >= selectedDateStr
    );
  }, [events, selectedDateStr]);

  const pendingApprovalsCount = useMemo(() => {
    return events.filter((evt) => evt.status === "Pending").length;
  }, [events]);

  const totalApprovedDaysThisMonth = useMemo(() => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return events
      .filter((evt) => evt.status === "Approved")
      .reduce((sum, evt) => {
        const start = new Date(evt.startDate);
        const end = new Date(evt.endDate);
        if (start.getMonth() === month || end.getMonth() === month) {
          const diffTime = Math.abs(end.getTime() - start.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          return sum + diffDays;
        }
        return sum;
      }, 0);
  }, [events, date]);

  // Workflow Handlers
  const handleApprove = (id: number) => {
    setEvents((prev) =>
      prev.map((evt) => (evt.id === id ? { ...evt, status: "Approved" } : evt))
    );
    const item = events.find((e) => e.id === id);
    showSuccess(`Leave request for ${item?.employeeName || "Employee"} approved.`);
    if (selectedEventDetails && selectedEventDetails.id === id) {
      setSelectedEventDetails((prev) => (prev ? { ...prev, status: "Approved" } : null));
    }
  };

  const handleReject = (id: number) => {
    setEvents((prev) =>
      prev.map((evt) => (evt.id === id ? { ...evt, status: "Rejected" } : evt))
    );
    const item = events.find((e) => e.id === id);
    showInfo(`Leave request for ${item?.employeeName || "Employee"} rejected.`);
    if (selectedEventDetails && selectedEventDetails.id === id) {
      setSelectedEventDetails((prev) => (prev ? { ...prev, status: "Rejected" } : null));
    }
  };

  const handleOpenRequestModal = (initialDate?: string) => {
    if (initialDate) {
      setFormStart(initialDate);
      setFormEnd(initialDate);
    } else {
      setFormStart(selectedDateStr);
      setFormEnd(selectedDateStr);
    }
    setIsRequestModalOpen(true);
  };

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvt: LeaveEvent = {
      id: Date.now(),
      employeeName: formEmployee,
      department: formDept,
      avatarColor: "bg-indigo-600",
      title: `${formType} Leave Request`,
      type: formType,
      startDate: formStart,
      endDate: formEnd,
      status: "Pending",
      reason: formReason || `${formType} leave requested`,
    };

    setEvents([newEvt, ...events]);
    showSuccess("Leave request submitted for approval.");
    setIsRequestModalOpen(false);
    setFormReason("");
  };

  // Dates with active leaves mapping for Calendar highlighting
  const eventDatesMap = useMemo(() => {
    const map: Record<string, LeaveEvent["type"][]> = {};
    events.forEach((evt) => {
      const cur = new Date(evt.startDate);
      const end = new Date(evt.endDate);
      while (cur <= end) {
        const dateKey = formatDateString(cur);
        if (!map[dateKey]) map[dateKey] = [];
        if (!map[dateKey].includes(evt.type)) {
          map[dateKey].push(evt.type);
        }
        cur.setDate(cur.getDate() + 1);
      }
    });
    return map;
  }, [events]);

  // Calendar Cell Renderer to show visual dots for leave dates
  const CustomCalendarCell = (props: any) => {
    const cellDateStr = props.value ? formatDateString(props.value) : "";
    const typesOnDate = eventDatesMap[cellDateStr] || [];

    return (
      <td
        title={props.title}
        className={`${props.className} relative cursor-pointer hover:bg-emerald-50/50 transition-colors`}
        onClick={props.onClick}
      >
        <div className="flex flex-col items-center justify-center p-1">
          <span className="text-xs font-semibold">{props.value.getDate()}</span>
          {typesOnDate.length > 0 && (
            <div className="flex items-center gap-0.5 mt-0.5">
              {typesOnDate.slice(0, 3).map((t, idx) => (
                <span
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full ${CATEGORY_COLORS[t]?.dot || "bg-slate-400"}`}
                />
              ))}
            </div>
          )}
        </div>
      </td>
    );
  };

  // Helper for generating Days of Current Month View Grid
  const monthGridDays = useMemo(() => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Get day of week for 1st of month (0 = Sun, convert so Mon = 0)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days: Array<{ dateObj: Date; dateStr: string; isCurrentMonth: boolean }> = [];

    // Leading days from previous month
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        dateObj: prevDate,
        dateStr: formatDateString(prevDate),
        isCurrentMonth: false,
      });
    }

    // Days of current month
    for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
      const curDate = new Date(year, month, d);
      days.push({
        dateObj: curDate,
        dateStr: formatDateString(curDate),
        isCurrentMonth: true,
      });
    }

    // Trailing days for complete grid (fill to 35 or 42)
    const totalCells = days.length > 35 ? 42 : 35;
    const remainingCells = totalCells - days.length;
    for (let j = 1; j <= remainingCells; j++) {
      const nextDate = new Date(year, month + 1, j);
      days.push({
        dateObj: nextDate,
        dateStr: formatDateString(nextDate),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [date]);

  // Helper for generating Days of Current Week
  const weekDays = useMemo(() => {
    const cur = new Date(date);
    const dayOfWeek = cur.getDay(); // 0 is Sun
    const diffToMon = cur.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const mon = new Date(cur.setDate(diffToMon));

    const week: Array<{ dateObj: Date; dateStr: string; dayName: string }> = [];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    for (let i = 0; i < 7; i++) {
      const d = new Date(mon);
      d.setDate(mon.getDate() + i);
      week.push({
        dateObj: d,
        dateStr: formatDateString(d),
        dayName: dayNames[i],
      });
    }
    return week;
  }, [date]);

  return (
    <AppLayout>
      <ContentLayout title="Leave Management Scheduler" breadcrumbItems={["Human Resources", "Leave Management"]}>
        <div className="space-y-6">
          {/* Header Dashboard Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 rounded-2xl border border-slate-800 text-white shadow-xl flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Key360 HR Suite
                </span>
                <span className="text-xs text-slate-400">• Interactive Calendar & Absence Control</span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">Leave Scheduler & Time-Off Roster</h2>
              <p className="text-xs text-slate-300">
                Manage leave approvals, visualize team absences across flexible timeline views, and monitor workforce coverage in real-time.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                themeColor="primary"
                size="large"
                onClick={() => handleOpenRequestModal()}
                className="font-bold text-xs bg-emerald-500 hover:bg-emerald-600 border-none shadow-lg cursor-pointer px-4 py-2.5 rounded-xl flex items-center gap-2"
              >
                <span>+ Request Leave</span>
              </Button>
            </div>
          </div>

          {/* Executive KPI Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">On Leave Today</span>
                <span className="text-2xl font-black text-slate-800">{activeAbsencesToday.length}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">{date.toDateString()}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold">
                🏖️
              </div>
            </div>

            <div
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-amber-300 transition-colors"
              onClick={() => setSelectedStatus(selectedStatus === "Pending" ? "all" : "Pending")}
            >
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Pending Approvals</span>
                <span className="text-2xl font-black text-amber-600">{pendingApprovalsCount}</span>
                <span className="text-[11px] text-amber-600/80 font-semibold block mt-0.5">
                  {selectedStatus === "Pending" ? "Filter active (Click to reset)" : "Click to filter pending"}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-bold">
                ⏳
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Approved Monthly Days</span>
                <span className="text-2xl font-black text-indigo-600">{totalApprovedDaysThisMonth} Days</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">In {date.toLocaleString("default", { month: "long" })}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold">
                📅
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Workforce Active</span>
                <span className="text-2xl font-black text-emerald-600">
                  {Math.max(0, 100 - Math.round((activeAbsencesToday.length / 15) * 100))}%
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Coverage Rate</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold">
                👥
              </div>
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column: Interactive Date Selector & Filters */}
            <div className="space-y-6">
              {/* Date Selector Card */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span>📅</span> Date Selector
                  </h4>
                  <button
                    onClick={handleToday}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded cursor-pointer border border-emerald-200"
                  >
                    Today
                  </button>
                </div>

                <div className="flex justify-center leave-calendar-wrapper">
                  <Calendar value={date} onChange={handleDateChange} cell={CustomCalendarCell} />
                </div>

                <div className="text-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-medium block">Selected Date Focus:</span>
                  <span className="text-xs font-black text-emerald-700">{date.toDateString()}</span>
                </div>
              </div>

              {/* Category & Status Filters Card */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span>⚡</span> Quick Filters
                </h4>

                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search employee or leave..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                  />
                  <span className="absolute left-2.5 top-2 text-slate-400 text-xs">🔍</span>
                </div>

                {/* Department Filter */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Department</label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 font-medium"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Legend & Filter */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Leave Categories</label>
                  <div className="space-y-1 text-xs">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between font-semibold transition-all cursor-pointer ${selectedCategory === "all"
                          ? "bg-slate-800 text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                      <span>All Categories</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-200">{events.length}</span>
                    </button>

                    {LEAVE_TYPES.map((type) => {
                      const count = events.filter((e) => e.type === type).length;
                      const colors = CATEGORY_COLORS[type];
                      const isSelected = selectedCategory === type;
                      return (
                        <button
                          key={type}
                          onClick={() => setSelectedCategory(isSelected ? "all" : type)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between font-semibold transition-all cursor-pointer ${isSelected
                              ? `${colors.bg} ${colors.border} border shadow-xs`
                              : "text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                            <span>{type} Leave</span>
                          </div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200/60">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Approval Status</label>
                  <div className="flex flex-wrap gap-1">
                    {["all", "Approved", "Pending", "Rejected"].map((st) => (
                      <button
                        key={st}
                        onClick={() => setSelectedStatus(st)}
                        className={`text-[11px] px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer capitalize ${selectedStatus === st
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Scheduler Views */}
            <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              {/* Navigation & View Switcher Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                {/* Date Month Selector Controls */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                    <button
                      onClick={handlePrevMonth}
                      title="Previous Month"
                      className="p-1.5 hover:bg-white rounded text-slate-700 cursor-pointer font-extrabold text-xs"
                    >
                      ◀
                    </button>
                    <button
                      onClick={handleNextMonth}
                      title="Next Month"
                      className="p-1.5 hover:bg-white rounded text-slate-700 cursor-pointer font-extrabold text-xs"
                    >
                      ▶
                    </button>
                  </div>
                  <h3 className="text-base font-black text-slate-800 tracking-tight">
                    {date.toLocaleString("default", { month: "long", year: "numeric" })}
                  </h3>
                </div>

                {/* View Tabs */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 text-xs">
                  {(
                    [
                      { id: "month", label: "Month Grid", icon: "🗓️" },
                      { id: "week", label: "Week Schedule", icon: "📋" },
                      { id: "day", label: "Day Roster", icon: "🔍" },
                      { id: "timeline", label: "Timeline Gantt", icon: "📊" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setViewMode(tab.id)}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${viewMode === tab.id
                          ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                          : "text-slate-500 hover:text-slate-800"
                        }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* View Container */}
              <div className="min-h-[480px]">
                {/* VIEW A: MONTH GRID */}
                {viewMode === "month" && (
                  <div className="space-y-2">
                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 gap-1 text-center font-black text-slate-500 text-xs py-2 bg-slate-50 rounded-lg uppercase tracking-wider">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>

                    {/* Month Grid Cells */}
                    <div className="grid grid-cols-7 gap-1.5">
                      {monthGridDays.map(({ dateObj, dateStr, isCurrentMonth }, idx) => {
                        const isSelectedDay = dateStr === selectedDateStr;
                        const isToday = dateStr === formatDateString(new Date(2026, 6, 20));

                        // Filter events active on this date
                        const dayEvents = filteredEvents.filter(
                          (e) => e.startDate <= dateStr && e.endDate >= dateStr
                        );

                        return (
                          <div
                            key={idx}
                            onClick={() => setDate(dateObj)}
                            className={`min-h-[90px] p-1.5 rounded-xl border transition-all flex flex-col justify-between cursor-pointer group ${isSelectedDay
                                ? "border-emerald-500 bg-emerald-50/40 shadow-xs ring-2 ring-emerald-500/20"
                                : isCurrentMonth
                                  ? "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-2xs"
                                  : "border-slate-100 bg-slate-50/50 text-slate-400 opacity-60"
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-xs font-black w-6 h-6 rounded-full flex items-center justify-center ${isToday
                                    ? "bg-emerald-600 text-white shadow-xs"
                                    : isSelectedDay
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "text-slate-700"
                                  }`}
                              >
                                {dateObj.getDate()}
                              </span>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenRequestModal(dateStr);
                                }}
                                title="Request Leave on this date"
                                className="opacity-0 group-hover:opacity-100 text-[10px] bg-slate-100 hover:bg-emerald-500 hover:text-white px-1.5 py-0.5 rounded font-bold transition-all"
                              >
                                + Add
                              </button>
                            </div>

                            {/* Events list inside cell */}
                            <div className="space-y-1 my-1 overflow-hidden">
                              {dayEvents.slice(0, 2).map((evt) => {
                                const colors = CATEGORY_COLORS[evt.type];
                                return (
                                  <div
                                    key={evt.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedEventDetails(evt);
                                    }}
                                    className={`text-[10px] p-1 rounded-md border font-semibold truncate transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-between ${colors.bg} ${colors.border}`}
                                  >
                                    <span className="truncate">{evt.employeeName}</span>
                                    {evt.status === "Pending" && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                                    )}
                                  </div>
                                );
                              })}
                              {dayEvents.length > 2 && (
                                <div className="text-[9px] font-extrabold text-slate-500 bg-slate-100 px-1 py-0.5 rounded text-center">
                                  +{dayEvents.length - 2} more
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* VIEW B: WEEK SCHEDULE */}
                {viewMode === "week" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-600">
                        Week Overview: <span className="text-emerald-700 font-extrabold">{weekDays[0].dateStr}</span> to{" "}
                        <span className="text-emerald-700 font-extrabold">{weekDays[6].dateStr}</span>
                      </span>
                      <span className="text-xs text-slate-500">Showing 7-day absence distribution</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                      {weekDays.map(({ dateObj, dateStr, dayName }) => {
                        const isSelectedDay = dateStr === selectedDateStr;
                        const dayEvts = filteredEvents.filter((e) => e.startDate <= dateStr && e.endDate >= dateStr);

                        return (
                          <div
                            key={dateStr}
                            onClick={() => setDate(dateObj)}
                            className={`p-3 rounded-xl border space-y-2 cursor-pointer transition-all ${isSelectedDay
                                ? "border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20"
                                : "border-slate-200 bg-white hover:border-slate-300"
                              }`}
                          >
                            <div className="text-center border-b border-slate-100 pb-2">
                              <span className="text-[11px] font-extrabold text-slate-400 uppercase block">{dayName}</span>
                              <span className="text-sm font-black text-slate-800">{dateObj.getDate()}</span>
                            </div>

                            <div className="space-y-2 min-h-[220px]">
                              {dayEvts.length === 0 ? (
                                <div className="text-[11px] text-slate-400 text-center py-6">All Available</div>
                              ) : (
                                dayEvts.map((evt) => {
                                  const colors = CATEGORY_COLORS[evt.type];
                                  return (
                                    <div
                                      key={evt.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedEventDetails(evt);
                                      }}
                                      className={`p-2 rounded-lg border text-xs space-y-1 ${colors.bg} ${colors.border}`}
                                    >
                                      <div className="font-bold text-slate-800 truncate">{evt.employeeName}</div>
                                      <div className="text-[10px] opacity-80 flex items-center justify-between">
                                        <span>{evt.type}</span>
                                        <span className={`px-1 py-0.2 rounded font-extrabold ${STATUS_BADGES[evt.status]}`}>
                                          {evt.status}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* VIEW C: DAY ROSTER */}
                {viewMode === "day" && (
                  <div className="space-y-5">
                    {/* Selected Day Banner */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-black text-slate-800">
                          Roster Breakdown for {date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                        </h4>
                        <p className="text-xs text-slate-500">Overview of absent personnel and active duty staff</p>
                      </div>
                      <Button themeColor="primary" size="small" onClick={() => handleOpenRequestModal(selectedDateStr)}>
                        + Request Leave for this Day
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Absent Staff Column */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <h5 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                            <span>Staff Away / On Leave ({activeAbsencesToday.length})</span>
                          </h5>
                        </div>

                        {activeAbsencesToday.length === 0 ? (
                          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                            🎉 Full Workforce Available! No scheduled leaves on this date.
                          </div>
                        ) : (
                          activeAbsencesToday.map((evt) => {
                            const colors = CATEGORY_COLORS[evt.type];
                            return (
                              <div
                                key={evt.id}
                                className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3 hover:border-slate-300 transition-all"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-9 h-9 rounded-full ${evt.avatarColor} text-white flex items-center justify-center font-bold text-xs shadow-xs`}
                                    >
                                      {evt.employeeName.charAt(0)}
                                    </div>
                                    <div>
                                      <h6 className="text-xs font-extrabold text-slate-900">{evt.employeeName}</h6>
                                      <span className="text-[11px] text-slate-500">{evt.department}</span>
                                    </div>
                                  </div>
                                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${colors.bg} ${colors.border}`}>
                                    {evt.type} Leave
                                  </span>
                                </div>

                                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                                  <div className="flex justify-between">
                                    <span className="font-semibold text-slate-500">Period:</span>
                                    <span className="font-bold text-slate-800">{evt.startDate} to {evt.endDate}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-semibold text-slate-500">Reason:</span>
                                    <span className="font-medium text-slate-700">{evt.reason}</span>
                                  </div>
                                </div>

                                {evt.status === "Pending" && (
                                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                                    <button
                                      onClick={() => handleReject(evt.id)}
                                      className="px-3 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                                    >
                                      Reject
                                    </button>
                                    <button
                                      onClick={() => handleApprove(evt.id)}
                                      className="px-3 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
                                    >
                                      Approve Leave
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Active Roster Coverage Column */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <h5 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <span>Active Personnel On Duty</span>
                          </h5>
                        </div>

                        <div className="space-y-2">
                          {[
                            { name: "Alex Rivera", dept: "Engineering", role: "Senior Developer" },
                            { name: "Jessica Taylor", dept: "Product Management", role: "Product Manager" },
                            { name: "David Kim", dept: "Design & UX", role: "UI/UX Designer" },
                            { name: "Sophia Martinez", dept: "Finance", role: "Financial Analyst" },
                          ].map((emp, i) => (
                            <div
                              key={i}
                              className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-700 text-white font-bold flex items-center justify-center text-xs">
                                  {emp.name.charAt(0)}
                                </div>
                                <div>
                                  <span className="font-extrabold text-slate-800 block">{emp.name}</span>
                                  <span className="text-[10px] text-slate-500">{emp.role} • {emp.dept}</span>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                On Duty
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* VIEW D: TIMELINE GANTT */}
                {viewMode === "timeline" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-700">
                        Monthly Gantt Absence Timeline ({date.toLocaleString("default", { month: "long", year: "numeric" })})
                      </span>
                      <span className="text-xs text-slate-500">Horizontal Multi-Day Duration Bars</span>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                            <th className="p-3 text-left w-48 font-black border-r border-slate-200">Employee</th>
                            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                              <th
                                key={d}
                                className={`p-1 text-center w-8 font-bold border-r border-slate-200/60 ${d === date.getDate() ? "bg-emerald-200 text-emerald-900" : ""
                                  }`}
                              >
                                {d}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredEvents.map((evt) => {
                            const startDay = new Date(evt.startDate).getDate();
                            const endDay = new Date(evt.endDate).getDate();
                            const colors = CATEGORY_COLORS[evt.type];

                            return (
                              <tr key={evt.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                                <td className="p-3 font-bold text-slate-800 border-r border-slate-200">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-6 h-6 rounded-full ${evt.avatarColor} text-white font-bold text-[10px] flex items-center justify-center`}
                                    >
                                      {evt.employeeName.charAt(0)}
                                    </div>
                                    <div className="truncate">
                                      <span className="block truncate">{evt.employeeName}</span>
                                      <span className="text-[9px] text-slate-400 block font-normal">{evt.type}</span>
                                    </div>
                                  </div>
                                </td>

                                {Array.from({ length: 31 }, (_, i) => i + 1).map((dayNum) => {
                                  const isInRange = dayNum >= startDay && dayNum <= endDay;
                                  const isStart = dayNum === startDay;
                                  const isEnd = dayNum === endDay;

                                  return (
                                    <td key={dayNum} className="p-0 border-r border-slate-100 text-center relative h-10">
                                      {isInRange && (
                                        <div
                                          onClick={() => setSelectedEventDetails(evt)}
                                          title={`${evt.employeeName}: ${evt.type} (${evt.startDate} to ${evt.endDate})`}
                                          className={`h-7 my-1 text-[9px] font-bold flex items-center justify-center cursor-pointer transition-all hover:brightness-110 shadow-xs ${colors.barBg
                                            } ${isStart ? "rounded-l-md" : ""} ${isEnd ? "rounded-r-md" : ""}`}
                                        >
                                          {isStart && <span className="truncate px-1">{evt.type}</span>}
                                        </div>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* REQUEST LEAVE DIALOG */}
        {isRequestModalOpen && (
          <FormDialog title="Submit Leave Request" onClose={() => setIsRequestModalOpen(false)} width={520}>
            <form onSubmit={handleCreateLeave} className="space-y-4 p-2 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Employee Name</label>
                  <input
                    type="text"
                    value={formEmployee}
                    onChange={(e) => setFormEmployee(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-medium text-xs focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Department</label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-medium text-xs focus:ring-1 focus:ring-emerald-500"
                  >
                    {DEPARTMENTS.filter((d) => d !== "All Departments").map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Leave Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as LeaveEvent["type"])}
                    className="w-full p-2 border border-slate-300 rounded-lg font-medium text-xs focus:ring-1 focus:ring-emerald-500"
                  >
                    {LEAVE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">End Date</label>
                  <input
                    type="date"
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Reason / Description</label>
                <textarea
                  rows={3}
                  placeholder="Provide reason for time-off..."
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button onClick={() => setIsRequestModalOpen(false)} size="small">
                  Cancel
                </Button>
                <Button themeColor="primary" type="submit" size="small" className="bg-emerald-600 border-none font-bold">
                  Submit Request
                </Button>
              </div>
            </form>
          </FormDialog>
        )}

        {/* EVENT DETAILS DIALOG */}
        {selectedEventDetails && (
          <FormDialog title="Leave Request Details" onClose={() => setSelectedEventDetails(null)} width={500}>
            <div className="space-y-4 p-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${selectedEventDetails.avatarColor} text-white font-bold flex items-center justify-center text-sm`}
                  >
                    {selectedEventDetails.employeeName.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-slate-900">{selectedEventDetails.employeeName}</h5>
                    <span className="text-slate-500">{selectedEventDetails.department}</span>
                  </div>
                </div>
                <span
                  className={`text-xs font-extrabold px-3 py-1 rounded-full border ${STATUS_BADGES[selectedEventDetails.status]
                    }`}
                >
                  {selectedEventDetails.status}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">Leave Category:</span>
                  <span className="font-bold text-slate-800">{selectedEventDetails.type} Leave</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">Duration:</span>
                  <span className="font-bold text-slate-800">
                    {selectedEventDetails.startDate} to {selectedEventDetails.endDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">Reason:</span>
                  <span className="font-medium text-slate-700">{selectedEventDetails.reason}</span>
                </div>
              </div>

              {selectedEventDetails.status === "Pending" && (
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleReject(selectedEventDetails.id)}
                    className="px-4 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedEventDetails.id)}
                    className="px-4 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
                  >
                    Approve Leave
                  </button>
                </div>
              )}
            </div>
          </FormDialog>
        )}
      </ContentLayout>
    </AppLayout>
  );
}
