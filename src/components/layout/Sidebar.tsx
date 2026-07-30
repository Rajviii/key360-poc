"use client";

import React, { useMemo, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PanelBar, PanelBarItem } from "@progress/kendo-react-layout";

import { ModuleRegistry } from "@/metadata/registry";

interface SidebarProps {
    expanded?: boolean;
}

// Group Headers SVG Icons
const groupIcons: Record<string, React.ReactNode> = {
    "Core": (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
    ),
    "Favorites": (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.969 0 1.371 1.24.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.176 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.97-2.883c-.783-.57-.38-1.81.588-1.81h4.906a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
    ),
    "Human Resources": (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
    "Project Management": (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
    ),
    "Operations": (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    "Document Management": (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
    ),
    "Reports": (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2" />
        </svg>
    ),
    "Settings": (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
    )
};

// Child Link Icons
const childIcons: Record<string, React.ReactNode> = {
    "Dashboard": (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    ),
    "Timesheets": (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    "Employees": (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    ),
    "Leave Management": (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 00-2 2z" />
        </svg>
    ),
    "Approvals": (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    ),
    "Projects": (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
    ),
    "Project Planning (Gantt)": (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2" />
        </svg>
    ),
    "Tasks": (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
    ),
    "Assets": (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
    ),
    "Work Orders": (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
    ),
    "Vendors": (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
    "Physical Items Register": (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
    ),
    "Reports": (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    "Analytics": (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
    ),
    "Settings": (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    "System Preferences": (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
    )
};

interface SidebarItem {
    title: string;
    route: string;
    disabled?: boolean;
    isFavorite?: boolean;
}

interface SidebarCategory {
    name: string;
    icon: React.ReactNode;
    items: SidebarItem[];
}

// Persistent expanded state across Next.js client-side route transitions
const globalExpandedState: Record<string, boolean> = {
    "Core": false,
    "Favorites": false,
    "Human Resources": false,
    "Project Management": false,
    "Operations": false,
    "Document Management": false,
    "Reports": false,
    "Settings": false,
};

export default function Sidebar({ expanded = true }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const [expandedStates, setExpandedStates] = useState<Record<string, boolean>>(() => {
        const init = { ...globalExpandedState };
        if (pathname === "/") init["Core"] = true;
        return init;
    });

    // Helper to update both React state and module-level persistent state
    const updateExpanded = (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => {
        setExpandedStates((prev) => {
            const next = updater(prev);
            Object.assign(globalExpandedState, next);
            return next;
        });
    };

    // Categories list dynamically matched against registered modules
    const categoriesList: SidebarCategory[] = useMemo(() => {
        const getModuleRoute = (id: string, defaultRoute = "#"): { route: string; disabled: boolean } => {
            const mod = ModuleRegistry.getModule(id);
            if (mod) {
                const route = ModuleRegistry.getRoute(id);
                return { route: route && route !== "#" ? route : `/${id}`, disabled: false };
            }
            return { route: defaultRoute, disabled: defaultRoute === "#" };
        };

        const assetsMeta = getModuleRoute("assets");
        const workOrdersMeta = getModuleRoute("work-orders");
        const vendorsMeta = getModuleRoute("vendors");

        return [
            {
                name: "Favorites",
                icon: groupIcons["Favorites"],
                items: [
                    { title: "Timesheets", route: "/timesheet", isFavorite: true },
                ]
            },
            {
                name: "Human Resources",
                icon: groupIcons["Human Resources"],
                items: [
                    { title: "Timesheets", route: "/timesheet" },
                    { title: "Employees", route: "/employees" },
                    { title: "Leave Management", route: "/leave-management" },
                ]
            },
            {
                name: "Project Management",
                icon: groupIcons["Project Management"],
                items: [
                    { title: "Project Planning & Task Board", route: "/project-planning" },
                ]
            },
            {
                name: "Operations",
                icon: groupIcons["Operations"],
                items: [
                    { title: "Physical Items Register", route: "/physical-items" }
                ]
            },
            {
                name: "Document Management",
                icon: groupIcons["Document Management"],
                items: [
                    { title: "Agreement Documents", route: "/agreements" },
                    { title: "PDF Forms", route: "/pdf-forms" },
                ]
            },
            {
                name: "Reports",
                icon: groupIcons["Reports"],
                items: [
                    { title: "Reports", route: "/reports" },
                    { title: "Analytics", route: "/analytics" }
                ]
            },
            {
                name: "Settings",
                icon: groupIcons["Settings"],
                items: [
                    { title: "Settings", route: "/settings" },
                    { title: "System Preferences", route: "/system-preferences" }
                ]
            }
        ];
    }, []);

    // Ensure category containing the active route is expanded without closing previously opened categories
    useEffect(() => {
        updateExpanded((prev) => {
            const updated = { ...prev };
            if (pathname === "/") {
                updated["Core"] = true;
            }
            categoriesList.forEach((category) => {
                const hasActiveChild = category.items.some(
                    (item) => item.route !== "#" && (pathname === item.route || pathname?.startsWith(item.route))
                );
                if (hasActiveChild) {
                    updated[category.name] = true;
                }
            });
            return updated;
        });
    }, [pathname, categoriesList]);

    // Handle panel selection & toggles
    const handleSelect = (event: any) => {
        const itemProps = event?.item?.props || event?.target?.props || event?.item || {};
        const route = itemProps.route;
        const disabled = itemProps.disabled;
        const categoryName = itemProps.categoryName;

        if (route && route !== "#" && !disabled) {
            router.push(route);
        } else if (categoryName) {
            updateExpanded((prev) => ({
                ...prev,
                [categoryName]: !prev[categoryName]
            }));
        }
    };

    return (
        <aside className={`bg-[#052e25] border-r border-[#042820] text-slate-300 flex flex-col h-full flex-shrink-0 font-sans select-none transition-all duration-300 ease-in-out ${expanded ? "w-64" : "w-0 overflow-hidden"}`}>
            {/* Sidebar Logo Header */}
            <div className="p-4 border-b border-[#042820] bg-[#03231c]/80 flex items-center gap-3">
                <img src="/api/logo" alt="KEY360 Platform Logo" className="w-7 h-7 object-contain" />
                <div>
                    <div className="font-extrabold text-sm text-white tracking-wide">KEY360</div>
                    <div className="text-[10px] text-[#7ea198] font-medium uppercase tracking-wider">Enterprise Suite</div>
                </div>
            </div>

            {/* Scrollable Navigation Area */}
            <div className="flex-1 overflow-y-auto py-4 px-3 min-w-[16rem]">
                <div className="panelbar-wrapper w-full">
                    <PanelBar expandMode="multiple" onSelect={handleSelect} className="bg-transparent border-none">

                        {/* 1. Core Section (Standalone Dashboard link) */}
                        <PanelBarItem
                            categoryName="Core"
                            title={
                                <span className="flex items-center gap-2.5 text-xs uppercase tracking-wider font-semibold py-1 text-[#7ea198]">
                                    {groupIcons["Core"]}
                                    <span>Core</span>
                                </span>
                            }
                            expanded={expandedStates["Core"]}
                            className="panelbar-header-group"
                        >
                            <PanelBarItem
                                title={
                                    <span className="flex items-center gap-2.5">
                                        {childIcons["Dashboard"]}
                                        <span>Dashboard</span>
                                    </span>
                                }
                                route="/"
                                selected={pathname === "/"}
                                className="panelbar-child-item"
                            />
                        </PanelBarItem>

                        {/* 2. Collapsible Category Sections */}
                        {categoriesList.map((category) => (
                            <PanelBarItem
                                key={category.name}
                                categoryName={category.name}
                                title={
                                    <span className="flex items-center gap-2.5 text-xs uppercase tracking-wider font-semibold py-1 text-[#7ea198]">
                                        {category.icon}
                                        <span>{category.name}</span>
                                    </span>
                                }
                                expanded={expandedStates[category.name]}
                                className="panelbar-header-group"
                            >
                                {category.items.map((item) => {
                                    const isSelected = item.route !== "#" && (pathname === item.route || pathname?.startsWith(item.route));
                                    const isDisabled = item.disabled;

                                    return (
                                        <PanelBarItem
                                            key={item.title}
                                            title={
                                                <span className="flex items-center justify-between w-full">
                                                    <span className="flex items-center gap-2.5">
                                                        {childIcons[item.title] || childIcons["Dashboard"]}
                                                        <span>{item.title}</span>
                                                    </span>
                                                    {item.isFavorite && (
                                                        <svg className={`w-3.5 h-3.5 ${isSelected ? "text-[#052e25] fill-[#052e25]" : "text-amber-400 fill-amber-400"}`} viewBox="0 0 24 24">
                                                            <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192z" />
                                                        </svg>
                                                    )}
                                                </span>
                                            }
                                            route={item.route}
                                            disabled={isDisabled}
                                            selected={isSelected}
                                            className="panelbar-child-item"
                                        />
                                    );
                                })}
                            </PanelBarItem>
                        ))}

                        {/* 3. Settings Section */}
                        {/* <PanelBarItem
                            categoryName="Settings"
                            title={
                                <span className="flex items-center gap-2.5 text-xs uppercase tracking-wider font-semibold py-1 text-[#7ea198]">
                                    {groupIcons["Settings"]}
                                    <span>Settings</span>
                                </span>
                            }
                            expanded={!!expandedStates["Settings"]}
                            className="panelbar-header-group"
                        >
                            <PanelBarItem
                                title={
                                    <span className="flex items-center gap-2.5">
                                        {groupIcons["Settings"]}
                                        <span>General Settings</span>
                                    </span>
                                }
                                route="#"
                                disabled={true}
                                className="panelbar-child-item"
                            />
                            <PanelBarItem
                                title={
                                    <span className="flex items-center gap-2.5">
                                        {groupIcons["Settings"]}
                                        <span>System Preferences</span>
                                    </span>
                                }
                                route="#"
                                disabled={true}
                                className="panelbar-child-item"
                            />
                        </PanelBarItem> */}
                    </PanelBar>
                </div>
            </div>

            {/* High-Fidelity Profile Footer Card */}
            <div className="p-4 border-t border-[#042820] bg-[#03231c]/60 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <img src="/api/logo" alt="Profile Logo" className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 p-1 object-contain" />
                        <div>
                            <div className="font-semibold text-xs text-white">Rajvi Test</div>
                            <div className="text-[10px] text-[#7ea198] font-medium">Administrator</div>
                        </div>
                    </div>
                    <svg className="w-4 h-4 text-[#7ea198] cursor-pointer hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                    </svg>
                </div>
                <div className="text-[10px] text-[#7ea198]/80 space-y-0.5 border-t border-[#053329] pt-2">
                    <div>Tenant: <span className="font-semibold text-white">DIW001</span></div>
                    <div>Version: <span className="font-semibold text-white">v2.0 (React POC)</span></div>
                </div>
            </div>
        </aside>
    );
}