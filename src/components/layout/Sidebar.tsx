"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { PanelBar, PanelBarItem } from "@progress/kendo-react-layout";
import { ModuleRegistry } from "@/metadata/registry";

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

    // Get dynamic navigation groups from Module Registry
    const navigationGroups = React.useMemo(() => {
        return ModuleRegistry.getNavigationGroups();
    }, []);

    return (
        <aside className={`bg-gradient-to-r from-green-800 via-green-750 to-emerald-700 text-white flex flex-col h-full flex-shrink-0 font-sans select-none transition-all duration-300 ease-in-out ${expanded ? "w-64 border-r" : "w-0 overflow-hidden border-r-0"}`}>
            <div className="flex-1 overflow-y-auto py-6 px-4 min-w-[16rem]">
                <div className="panelbar-wrapper w-full">
                    <PanelBar onSelect={handleSelect} className="bg-transparent border-none">
                        {/* 1. Core Dashboard (Always present) */}
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

                        {/* 2. Dynamically rendered Module Groups */}
                        {Array.from(navigationGroups.entries()).map(([groupName, moduleIds]) => {
                            // Expand group if active route lies inside it
                            const isGroupActive = moduleIds.some((id) => {
                                const route = ModuleRegistry.getRoute(id);
                                return route !== "#" && (pathname === route || pathname?.startsWith(route));
                            });

                            return (
                                <PanelBarItem
                                    key={groupName}
                                    title={groupName}
                                    expanded={isGroupActive}
                                    className="text-slate-300 font-semibold"
                                >
                                    {moduleIds.map((id) => {
                                        const moduleConfig = ModuleRegistry.getModule(id);
                                        if (!moduleConfig) return null;

                                        const route = ModuleRegistry.getRoute(id);
                                        const isSelected = route !== "#" && (pathname === route || pathname?.startsWith(route));
                                        const isDisabled = route === "#";

                                        return (
                                            <PanelBarItem
                                                key={id}
                                                title={moduleConfig.title}
                                                route={route}
                                                selected={isSelected}
                                                disabled={isDisabled}
                                                className={`font-medium ${isDisabled
                                                    ? "text-slate-600 cursor-not-allowed opacity-50"
                                                    : isSelected
                                                        ? "text-green-400 font-bold"
                                                        : "text-slate-400 hover:text-white"
                                                    }`}
                                            />
                                        );
                                    })}
                                </PanelBarItem>
                            );
                        })}
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