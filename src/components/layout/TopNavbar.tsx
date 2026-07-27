"use client";

import React from "react";
import Link from "next/link";

interface TopNavbarProps {
    onToggleSidebar: () => void;
}

export default function TopNavbar({ onToggleSidebar }: TopNavbarProps) {
    return (
        <header className="h-16 bg-gradient-to-r from-green-800 via-green-750 to-emerald-700 text-white flex items-center justify-between px-6 shadow-md z-10 flex-shrink-0">
            <div className="flex items-center gap-4">
                {/* Hamburger Icon */}
                <button 
                    onClick={onToggleSidebar}
                    className="hover:bg-green-800 rounded p-1.5 transition-colors cursor-pointer" 
                    aria-label="Toggle navigation"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 6h16M4 12h16M4 18h16"
                        ></path>
                    </svg>
                </button>

                {/* Brand & Context */}
                <div className="flex items-center gap-3">
                    <Link href="/" className="font-extrabold text-lg tracking-wider hover:opacity-90 transition-opacity">
                        KEY<span className="text-green-300">360</span>
                    </Link>
                    <span className="text-green-500 font-light">|</span>
                    <div className="text-xs md:text-sm text-green-100 hidden sm:block">
                        Training &bull; Demo Work &bull; <span className="font-semibold text-white">DIW001</span>
                    </div>
                </div>
            </div>

            {/* Global Actions */}
            <div className="flex items-center gap-4 text-sm font-medium">
                <button className="hover:text-green-200 transition-colors p-1 rounded hover:bg-green-800 cursor-pointer hidden md:flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    Search
                </button>

                <button className="hover:text-green-200 transition-colors p-1 rounded hover:bg-green-800 cursor-pointer flex items-center gap-1.5" onClick={() => window.location.reload()}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18"></path>
                    </svg>
                    Refresh
                </button>

                <div className="h-6 w-px bg-green-600 hidden sm:block"></div>

                {/* User Info */}
                <div className="flex items-center gap-2 cursor-pointer hover:bg-green-800 p-1.5 rounded transition-colors">
                    <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                        R
                    </div>
                    <span className="hidden sm:inline text-white font-semibold">Rajvi Test</span>
                </div>
            </div>
        </header>
    );
}