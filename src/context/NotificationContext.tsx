"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Notification, NotificationGroup } from "@progress/kendo-react-notification";
import { Fade } from "@progress/kendo-react-animation";

export type NotificationStyle = "success" | "error" | "warning" | "info" | "none";

export interface NotificationItem {
  id: string;
  message: string;
  style: NotificationStyle;
  duration?: number;
}

interface NotificationContextType {
  showNotification: (message: string, style?: NotificationStyle, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Top-Center positioning style according to Kendo UI Guidelines
const topCenterPosition: React.CSSProperties = {
  position: "fixed",
  top: "16px",
  left: "50%",
  transform: "translateX(-50%)",
  alignItems: "center",
  zIndex: 999999,
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  pointerEvents: "none",
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showNotification = useCallback(
    (message: string, style: NotificationStyle = "info", duration: number = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newItem: NotificationItem = { id, message, style, duration };

      setNotifications((prev) => [...prev, newItem]);

      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }
    },
    [removeNotification]
  );

  const showSuccess = useCallback(
    (message: string, duration?: number) => showNotification(message, "success", duration),
    [showNotification]
  );

  const showError = useCallback(
    (message: string, duration?: number) => showNotification(message, "error", duration),
    [showNotification]
  );

  const showInfo = useCallback(
    (message: string, duration?: number) => showNotification(message, "info", duration),
    [showNotification]
  );

  const showWarning = useCallback(
    (message: string, duration?: number) => showNotification(message, "warning", duration),
    [showNotification]
  );

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        showSuccess,
        showError,
        showInfo,
        showWarning,
      }}
    >
      {children}

      <NotificationGroup style={topCenterPosition}>
        {notifications.map((item) => (
          <Fade key={item.id} enter={true} exit={true}>
            <div style={{ pointerEvents: "auto" }} className="shadow-lg rounded-lg overflow-hidden">
              <Notification
                type={{ style: item.style as any, icon: true }}
                closable={true}
                onClose={() => removeNotification(item.id)}
                className="font-medium text-xs py-2 px-4 shadow-md"
              >
                <span>{item.message}</span>
              </Notification>
            </div>
          </Fade>
        ))}
      </NotificationGroup>
    </NotificationContext.Provider>
  );
}

export function useNotification(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
