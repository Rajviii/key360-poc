"use client";

import React from "react";
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { ToolbarButton } from "@/types/metadata";
import {
    plusIcon,
    arrowRotateCwIcon,
    trashIcon,
    fileExcelIcon,
    filePdfIcon,
    gridIcon,
    chartLineIcon,
} from "@progress/kendo-svg-icons";

// Map actionType or button ID to Kendo SVG Icons
const getIcon = (actionType: string) => {
    switch (actionType) {
        case "add":
            return plusIcon;
        case "refresh":
            return arrowRotateCwIcon;
        case "delete":
            return trashIcon;
        case "export":
            return fileExcelIcon;
        case "exportPdf":
            return filePdfIcon;
        default:
            return undefined;
    }
};

interface ModuleToolbarProps {
    buttons: ToolbarButton[];
    onAction: (actionType: string) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedCount?: number;
    availableViews?: string[];
    activeView?: string;
    onViewChange?: (view: string) => void;
}

export default function ModuleToolbar({
    buttons,
    onAction,
    searchQuery,
    onSearchChange,
    selectedCount = 0,
    availableViews,
    activeView = "grid",
    onViewChange,
}: ModuleToolbarProps) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Dynamic Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                {buttons.map((btn) => {
                    // Disable delete button if no rows are selected/processed or handle action accordingly
                    const isDisabled = btn.actionType === "delete" && selectedCount === 0;

                    return (
                        <Button
                            key={btn.id}
                            svgIcon={getIcon(btn.actionType)}
                            onClick={() => onAction(btn.actionType)}
                            disabled={isDisabled}
                            className="font-semibold text-sm transition-all duration-200 cursor-pointer"
                        >
                            {btn.label}
                            {btn.actionType === "delete" && selectedCount > 0 && ` (${selectedCount})`}
                        </Button>
                    );
                })}
            </div>

            {/* View Switcher Toggle & Search Bar */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {availableViews && availableViews.length > 1 && onViewChange && (
                    <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <Button
                            type="button"
                            size="small"
                            fillMode={activeView === "grid" ? "solid" : "flat"}
                            themeColor={activeView === "grid" ? "primary" : "base"}
                            svgIcon={gridIcon}
                            onClick={() => onViewChange("grid")}
                            className="font-medium text-xs rounded-md cursor-pointer"
                        >
                            Grid View
                        </Button>
                        <Button
                            type="button"
                            size="small"
                            fillMode={activeView === "gantt" ? "solid" : "flat"}
                            themeColor={activeView === "gantt" ? "primary" : "base"}
                            svgIcon={chartLineIcon}
                            onClick={() => onViewChange("gantt")}
                            className="font-medium text-xs rounded-md cursor-pointer"
                        >
                            Gantt View
                        </Button>
                    </div>
                )}

                {/* Global Search Bar */}
                <div className="w-full sm:w-64 relative">
                    <Input
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.value as string)}
                        className="w-full rounded-lg border-slate-300 focus:border-green-500 focus:ring-green-500 text-sm shadow-sm"
                    />
                    <span className="absolute right-3 top-2.5 text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </span>
                </div>
            </div>
        </div>
    );
}