"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { PanelBar, PanelBarItem } from "@progress/kendo-react-layout";

interface SidebarProps {
    expanded?: boolean;
}

export default function Sidebar({ expanded = true }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    // Route select handler
    const handleSelect = (event: any) => {
        const route = event.target.props.route;
        const disabled = event.target.props.disabled;

        if (route && route !== "#" && !disabled) {
            router.push(route);
        }
    };

    return (
        <aside className={`bg-slate-900 border-slate-800 text-slate-300 flex flex-col h-full flex-shrink-0 font-sans select-none transition-all duration-300 ease-in-out ${expanded ? "w-64 border-r" : "w-0 overflow-hidden border-r-0"}`}>
            <div className="flex-1 overflow-y-auto py-6 px-4 min-w-[16rem]">
                <div className="panelbar-wrapper w-full">
                    <PanelBar onSelect={handleSelect} className="bg-transparent border-none">
                        {/* 1. Core Section */}
                        <PanelBarItem
                            title="Core"
                            expanded={true}
                            className="text-slate-300 font-semibold"
                        >
                            <PanelBarItem
                                title="Dashboard"
                                route="/"
                                selected={pathname === "/"}
                                className={`text-slate-400 font-medium ${pathname === "/" ? "text-green-400 font-bold" : ""}`}
                            />
                        </PanelBarItem>

                        {/* 2. Human Resources Section */}
                        <PanelBarItem
                            title="Human Resources"
                            expanded={pathname?.startsWith("/timesheet") || pathname === "/timesheet"}
                            className="text-slate-300 font-semibold"
                        >
                            <PanelBarItem
                                title="Timesheets"
                                route="/timesheet"
                                selected={pathname === "/timesheet" || pathname?.startsWith("/timesheet")}
                                className={`text-slate-400 font-medium ${pathname === "/timesheet" ? "text-green-400 font-bold" : ""}`}
                            />
                            <PanelBarItem
                                title="Leave Management"
                                route="#"
                                disabled={true}
                                className="text-slate-600 font-medium cursor-not-allowed opacity-50"
                            />
                            <PanelBarItem
                                title="Employee Master"
                                route="#"
                                disabled={true}
                                className="text-slate-600 font-medium cursor-not-allowed opacity-50"
                            />
                            <PanelBarItem
                                title="Attendance"
                                route="#"
                                disabled={true}
                                className="text-slate-600 font-medium cursor-not-allowed opacity-50"
                            />
                        </PanelBarItem>

                        {/* 3. Project Management Section */}
                        <PanelBarItem
                            title="Project Management"
                            expanded={pathname?.startsWith("/project-planning") || pathname === "/project-planning"}
                            className="text-slate-300 font-semibold"
                        >
                            <PanelBarItem
                                title="Projects"
                                route="#"
                                disabled={true}
                                className="text-slate-600 font-medium cursor-not-allowed opacity-50"
                            />
                            <PanelBarItem
                                title="Project Planning (Gantt)"
                                route="/project-planning"
                                selected={pathname === "/project-planning" || pathname?.startsWith("/project-planning")}
                                className={`text-slate-400 font-medium ${pathname === "/project-planning" ? "text-green-400 font-bold" : ""}`}
                            />
                        </PanelBarItem>

                        {/* 4. Operations Section */}
                        <PanelBarItem
                            title="Operations (Future)"
                            className="text-slate-300 font-semibold"
                        >
                            <PanelBarItem
                                title="Assets"
                                route="#"
                                disabled={true}
                                className="text-slate-600 font-medium cursor-not-allowed opacity-50"
                            />
                            <PanelBarItem
                                title="Vendors"
                                route="#"
                                disabled={true}
                                className="text-slate-600 font-medium cursor-not-allowed opacity-50"
                            />
                            <PanelBarItem
                                title="Work Orders"
                                route="#"
                                disabled={true}
                                className="text-slate-600 font-medium cursor-not-allowed opacity-50"
                            />
                        </PanelBarItem>
                    </PanelBar>
                </div>
            </div>

            {/* Sidebar Footer Context Info */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-500 flex flex-col gap-1">
                <div>Logged in as: <span className="font-semibold text-slate-400">Rajvi</span></div>
                <div>Tenant: <span className="font-semibold text-slate-400">DIW001</span></div>
                <div>Version: <span className="font-semibold text-slate-400">v2.0 (React POC)</span></div>
            </div>
        </aside>
    );
}