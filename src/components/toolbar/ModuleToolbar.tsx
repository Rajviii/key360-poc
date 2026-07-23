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
    searchIcon,
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
}

export default function ModuleToolbar({
    buttons,
    onAction,
    searchQuery,
    onSearchChange,
    selectedCount = 0,
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
                            //   themeColor={btn.themeColor || "none"}
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

            {/* Global Search Bar */}
            <div className="w-full sm:w-72 relative">
                <Input
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.value as string)}
                    className="w-full rounded-lg border-slate-300 focus:border-green-500 focus:ring-green-500 text-sm shadow-sm"
                />
                <span className="absolute right-3 top-2.5 text-slate-400">
                    {/* Magnifying glass icon indicator */}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </span>
            </div>
        </div>
    );
}