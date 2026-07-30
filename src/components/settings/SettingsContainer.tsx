"use client";

import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import ContentLayout from "@/components/layout/ContentLayout";
import { TabStrip, TabStripTab, ExpansionPanel } from "@progress/kendo-react-layout";
import { Switch, Input } from "@progress/kendo-react-inputs";
import { Upload } from "@progress/kendo-react-upload";
import { Button } from "@progress/kendo-react-buttons";
import { saveIcon } from "@progress/kendo-svg-icons";
import { useNotification } from "@/context/NotificationContext";

export default function SettingsContainer() {
  const { showSuccess } = useNotification();
  const [selectedTab, setSelectedTab] = useState(0);

  // Settings State
  const [general, setGeneral] = useState({
    systemName: "Key360 Enterprise Portal",
    timezone: "UTC+05:30 (India Standard Time)",
    currency: "USD ($)",
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: true,
    smsAlerts: false,
    weeklyReport: true,
  });

  const [security, setSecurity] = useState({
    twoFactor: true,
    sessionTimeout: "30 mins",
    ipRestrict: "192.168.1.*",
  });

  const [expandedSection, setExpandedSection] = useState(true);

  const handleSaveSettings = () => {
    showSuccess("Enterprise Settings updated successfully.");
  };

  return (
    <AppLayout>
      <ContentLayout title="System Settings" breadcrumbItems={["Settings", "General Settings"]}>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Key360 Enterprise Configuration Center</h3>
              <p className="text-xs text-slate-400">Manage System Preferences, Security, and Integrations</p>
            </div>
            <Button
              svgIcon={saveIcon}
              themeColor="primary"
              size="small"
              onClick={handleSaveSettings}
              className="font-bold text-xs cursor-pointer"
            >
              Save Configuration
            </Button>
          </div>

          {/* Kendo TabStrip Component */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-4">
            <TabStrip selected={selectedTab} onSelect={(e) => setSelectedTab(e.selected)}>
              {/* Tab 1: General */}
              <TabStripTab title="General">
                <div className="p-4 space-y-4 max-w-xl text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">System Portal Title</label>
                    <Input
                      value={general.systemName}
                      onChange={(e) => setGeneral({ ...general, systemName: e.value as string })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Default Timezone</label>
                    <Input value={general.timezone} onChange={(e) => setGeneral({ ...general, timezone: e.value as string })} className="w-full" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Operating Currency</label>
                    <Input value={general.currency} onChange={(e) => setGeneral({ ...general, currency: e.value as string })} className="w-full" />
                  </div>
                </div>
              </TabStripTab>

              {/* Tab 2: Appearance */}
              <TabStripTab title="Appearance">
                <div className="p-4 space-y-4 text-xs max-w-xl">
                  <h4 className="font-bold text-slate-800">UI Theme & Branding</h4>
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-700">Dark Mode Navigation Bar</span>
                    <Switch defaultChecked={true} />
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-700">High-Contrast Accessibility Grids</span>
                    <Switch defaultChecked={false} />
                  </div>
                </div>
              </TabStripTab>

              {/* Tab 3: Notifications */}
              <TabStripTab title="Notifications">
                <div className="p-4 space-y-3 text-xs max-w-xl">
                  <h4 className="font-bold text-slate-800">Notification Triggers</h4>
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-700">Email System Alerts</span>
                    <Switch
                      checked={notifications.emailAlerts}
                      onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.value })}
                    />
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-700">Browser Push Notifications</span>
                    <Switch
                      checked={notifications.pushNotifications}
                      onChange={(e) => setNotifications({ ...notifications, pushNotifications: e.value })}
                    />
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-700">SMS Urgent Warnings</span>
                    <Switch
                      checked={notifications.smsAlerts}
                      onChange={(e) => setNotifications({ ...notifications, smsAlerts: e.value })}
                    />
                  </div>
                </div>
              </TabStripTab>

              {/* Tab 4: Security */}
              <TabStripTab title="Security">
                <div className="p-4 space-y-4 text-xs max-w-xl">
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div>
                      <span className="font-bold text-slate-800 block">Enforce Two-Factor Authentication (2FA)</span>
                      <span className="text-[11px] text-slate-400">Require 2FA for all administrative accounts</span>
                    </div>
                    <Switch
                      checked={security.twoFactor}
                      onChange={(e) => setSecurity({ ...security, twoFactor: e.value })}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Session Inactivity Timeout</label>
                    <Input value={security.sessionTimeout} onChange={(e) => setSecurity({ ...security, sessionTimeout: e.value as string })} className="w-full" />
                  </div>
                </div>
              </TabStripTab>

              {/* Tab 5: API & Upload */}
              <TabStripTab title="API & Uploads">
                <div className="p-4 space-y-4 text-xs max-w-xl">
                  <div>
                    <h4 className="font-bold text-slate-800 mb-2">Company Branding Logo Upload</h4>
                    <Upload
                      batch={false}
                      multiple={false}
                      defaultFiles={[]}
                      withCredentials={false}
                      saveUrl="https://demos.telerik.com/kendo-ui/service-v4/upload/save"
                      removeUrl="https://demos.telerik.com/kendo-ui/service-v4/upload/remove"
                    />
                  </div>
                </div>
              </TabStripTab>

              {/* Tab 6: Advanced (ExpansionPanel) */}
              <TabStripTab title="Advanced">
                <div className="p-4 space-y-4">
                  <ExpansionPanel
                    title="Database Caching & Performance Tuning"
                    expanded={expandedSection}
                    onAction={() => setExpandedSection(!expandedSection)}
                  >
                    <div className="p-3 text-xs text-slate-600 bg-slate-50 space-y-2">
                      <p>Active Caching Provider: <strong>CachingDataProvider (120s TTL)</strong></p>
                      <p>Database Query Diagnostics: <strong>Enabled</strong></p>
                      <p>Kendo Virtualization Threshold: <strong>500+ records</strong></p>
                    </div>
                  </ExpansionPanel>
                </div>
              </TabStripTab>
            </TabStrip>
          </div>
        </div>
      </ContentLayout>
    </AppLayout>
  );
}
