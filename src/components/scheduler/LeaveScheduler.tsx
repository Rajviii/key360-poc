"use client";

import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import ContentLayout from "@/components/layout/ContentLayout";
import { Calendar } from "@progress/kendo-react-dateinputs";
import { Button } from "@progress/kendo-react-buttons";
import { plusIcon, calendarIcon, clockIcon, checkCircleIcon } from "@progress/kendo-svg-icons";
import { useNotification } from "@/context/NotificationContext";
import FormDialog from "@/components/dialogs/FormDialog";

// Sample Leave Requests Data
const initialEvents = [
  {
    id: 1,
    title: "Rajvi Test - Annual Leave",
    startDate: "2026-07-20",
    endDate: "2026-07-24",
    type: "Vacation",
    personId: 1,
    status: "Approved",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  {
    id: 2,
    title: "John Doe - Sick Leave",
    startDate: "2026-07-22",
    endDate: "2026-07-22",
    type: "Sick",
    personId: 2,
    status: "Approved",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    id: 3,
    title: "Sarah Smith - Maternity Leave",
    startDate: "2026-07-25",
    endDate: "2026-07-30",
    type: "Parental",
    personId: 3,
    status: "Pending",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
  },
];

export default function LeaveScheduler() {
  const { showSuccess } = useNotification();
  const [date, setDate] = useState<Date>(new Date(2026, 6, 20));
  const [events, setEvents] = useState(initialEvents);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [leaveTitle, setLeaveTitle] = useState("");
  const [leaveEmployee, setLeaveEmployee] = useState("Rajvi Test");
  const [viewMode, setViewMode] = useState<"month" | "week" | "day" | "timeline">("month");

  const handleDateChange = (e: any) => {
    if (e.value) setDate(e.value);
  };

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedStart = date.toISOString().split("T")[0];
    const endDateObj = new Date(date);
    endDateObj.setDate(endDateObj.getDate() + 2);
    const formattedEnd = endDateObj.toISOString().split("T")[0];

    const newEvt = {
      id: events.length + 1,
      title: `${leaveEmployee} - ${leaveTitle || "Vacation Leave"}`,
      startDate: formattedStart,
      endDate: formattedEnd,
      type: "Vacation",
      personId: 1,
      status: "Pending Approval",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    };

    setEvents([...events, newEvt]);
    showSuccess("Leave Request submitted for Manager Approval.");
    setIsDialogOpen(false);
    setLeaveTitle("");
  };

  return (
    <AppLayout>
      <ContentLayout title="Leave Management Scheduler" breadcrumbItems={["Human Resources", "Leave Management"]}>
        <div className="space-y-4">
          {/* Header Action Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Key360 Employee Absence & Leave Scheduler</h3>
              <p className="text-xs text-slate-400">Interactive Calendar Scheduling & Time-Off Approvals</p>
            </div>
            <Button
              svgIcon={plusIcon}
              themeColor="primary"
              size="small"
              onClick={() => setIsDialogOpen(true)}
              className="font-bold text-xs cursor-pointer"
            >
              Request Leave
            </Button>
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar: Quick Calendar Selection & Employee Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Date Selector</h4>
              <div className="flex justify-center">
                <Calendar value={date} onChange={handleDateChange} />
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2">
                <h5 className="text-xs font-bold text-slate-600">Leave Categories</h5>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span>Annual / Vacation Leave</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span>Sick & Medical Leave</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                    <span>Parental / Special Leave</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Main Panel: Scheduler View */}
            <div className="lg:col-span-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
              {/* View Switcher Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Selected Date:</span>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    {date.toDateString()}
                  </span>
                </div>

                <div className="flex items-center bg-slate-100 p-1 rounded-lg gap-1 text-xs">
                  {(["month", "week", "day", "timeline"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`px-3 py-1 rounded-md font-semibold capitalize transition-all cursor-pointer ${viewMode === mode
                          ? "bg-white text-slate-800 shadow-xs"
                          : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Schedule Events View */}
              <div className="space-y-3 min-h-[400px]">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Leave Requests & Absence Events</h4>

                {events.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">No leave events scheduled for this period.</div>
                ) : (
                  <div className="space-y-2">
                    {events.map((evt) => (
                      <div
                        key={evt.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-xs transition-all flex items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-xs">{evt.title}</span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${evt.badgeColor}`}>
                              {evt.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500">
                            <span>📅 {evt.startDate} to {evt.endDate}</span>
                            <span>•</span>
                            <span>Category: {evt.type}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase block">Approval Status</span>
                          <span className="text-xs font-bold text-slate-700">{evt.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Leave Request Dialog */}
        {isDialogOpen && (
          <FormDialog
            title="Submit Employee Leave Request"
            onClose={() => setIsDialogOpen(false)}
            width={500}
          >
            <form onSubmit={handleCreateLeave} className="space-y-4 p-2 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Employee Name</label>
                <input
                  type="text"
                  value={leaveEmployee}
                  onChange={(e) => setLeaveEmployee(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Leave Reason / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Annual Family Vacation"
                  value={leaveTitle}
                  onChange={(e) => setLeaveTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button onClick={() => setIsDialogOpen(false)} size="small">Cancel</Button>
                <Button themeColor="primary" type="submit" size="small">Submit Request</Button>
              </div>
            </form>
          </FormDialog>
        )}
      </ContentLayout>
    </AppLayout>
  );
}
