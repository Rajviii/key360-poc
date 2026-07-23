"use client";

import React from "react";
import Breadcrumb from "./Breadcrumb";

interface ContentLayoutProps {
    title: string;
    breadcrumbItems?: string[];
    children: React.ReactNode;
}

export default function ContentLayout({
    title,
    breadcrumbItems,
    children,
}: ContentLayoutProps) {
    return (
        <div className="space-y-5 w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-4">
                <div>
                    {breadcrumbItems && <Breadcrumb items={breadcrumbItems} />}
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        {title}
                    </h1>
                </div>
            </div>
            <div className="w-full">
                {children}
            </div>
        </div>
    );
}
