"use client";

import React from "react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const [sidebarExpanded, setSidebarExpanded] = React.useState(true);

    return (
        <div className="h-screen flex flex-col bg-slate-50 overflow-hidden text-slate-900">
            {/* Top Navigation Bar */}
            <TopNavbar onToggleSidebar={() => setSidebarExpanded(!sidebarExpanded)} />

            {/* Main Workspace Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Navigation Sidebar */}
                <Sidebar expanded={sidebarExpanded} />

                {/* Dynamic Content Panel */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}