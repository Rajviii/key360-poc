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

import { Checkbox } from "@progress/kendo-react-inputs";

interface ModuleToolbarProps {
    buttons: ToolbarButton[];
    onAction: (actionType: string) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedCount?: number;
    availableViews?: string[];
    activeView?: string;
    onViewChange?: (view: string) => void;
    repeatHeaders?: boolean;
    onRepeatHeadersChange?: (val: boolean) => void;
}

const getTooltip = (actionType: string, label: string) => {
    switch (actionType) {
        case "add":
            return "Add new record";
        case "refresh":
            return "Refresh table data";
        case "delete":
            return "Delete selected record(s)";
        case "export":
            return "Export data to Excel";
        case "exportPdf":
            return "Export grid report to PDF";
        default:
            return label;
    }
};

export default function ModuleToolbar({
    buttons,
    onAction,
    searchQuery,
    onSearchChange,
    selectedCount = 0,
    availableViews,
    activeView = "grid",
    onViewChange,
    repeatHeaders = true,
    onRepeatHeadersChange,
}: ModuleToolbarProps) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
            {/* Dynamic Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {buttons.map((btn) => {
                    const isDisabled = btn.actionType === "delete" && selectedCount === 0;
                    const tooltip = getTooltip(btn.actionType, btn.label);
                    const isPrimary = btn.actionType === "add";

                    return (
                        <React.Fragment key={btn.id}>
                            <Button
                                svgIcon={getIcon(btn.actionType)}
                                title={tooltip}
                                onClick={() => onAction(btn.actionType)}
                                disabled={isDisabled}
                                themeColor={isPrimary ? "primary" : undefined}
                                className={`font-semibold text-xs transition-all duration-200 cursor-pointer ${
                                    isPrimary ? "px-3 py-1.5" : "p-2"
                                }`}
                            >
                                {isPrimary && <span className="ml-1">{btn.label}</span>}
                                {btn.actionType === "delete" && selectedCount > 0 && (
                                    <span className="ml-1 text-xs font-bold bg-red-600 text-white px-1.5 py-0.5 rounded-full">
                                        {selectedCount}
                                    </span>
                                )}
                            </Button>

                            {btn.actionType === "exportPdf" && onRepeatHeadersChange && (
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs" title="Repeat column headers on exported PDF pages">
                                    <Checkbox
                                        id="toolbarRepeatHeaders"
                                        checked={repeatHeaders}
                                        onChange={() => onRepeatHeadersChange(!repeatHeaders)}
                                        label="Repeat headers"
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* View Switcher Toggle & Search Bar */}
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                {availableViews && availableViews.length > 1 && onViewChange && (
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                        <Button
                            type="button"
                            size="small"
                            fillMode={activeView === "grid" ? "solid" : "flat"}
                            themeColor={activeView === "grid" ? "primary" : "base"}
                            svgIcon={gridIcon}
                            title="Grid View"
                            onClick={() => onViewChange("grid")}
                            className="font-medium text-xs rounded-md cursor-pointer px-2.5 py-1"
                        >
                            <span className="hidden sm:inline ml-1">Grid</span>
                        </Button>
                        <Button
                            type="button"
                            size="small"
                            fillMode={activeView === "gantt" ? "solid" : "flat"}
                            themeColor={activeView === "gantt" ? "primary" : "base"}
                            svgIcon={chartLineIcon}
                            title="Gantt View"
                            onClick={() => onViewChange("gantt")}
                            className="font-medium text-xs rounded-md cursor-pointer px-2.5 py-1"
                        >
                            <span className="hidden sm:inline ml-1">Gantt</span>
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