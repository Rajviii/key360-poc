"use client";

import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import ContentLayout from "@/components/layout/ContentLayout";
import {
  Splitter,
  SplitterPaneProps,
  PanelBar,
  PanelBarItem,
  Stepper,
} from "@progress/kendo-react-layout";
import { TreeView } from "@progress/kendo-react-treeview";
import { userIcon, lockIcon, gearIcon, checkIcon } from "@progress/kendo-svg-icons";
import { useNotification } from "@/context/NotificationContext";

// TreeView Navigation Structure
const treeData = [
  {
    text: "System Administration",
    expanded: true,
    items: [
      { text: "Users & Accounts", id: "users" },
      { text: "Roles & Security Groups", id: "roles" },
      { text: "Granular Permissions Engine", id: "permissions" },
      { text: "Approval Workflows", id: "workflow" },
      { text: "Enterprise Integrations", id: "integrations" },
    ],
  },
];

const stepperSteps = [
  { label: "Select Role", svgIcon: userIcon },
  { label: "Assign Permissions", svgIcon: lockIcon },
  { label: "Configure Workflows", svgIcon: gearIcon },
  { label: "Deploy & Activate", svgIcon: checkIcon },
];

export default function SystemPreferencesContainer() {
  const { showSuccess } = useNotification();
  const [selectedNode, setSelectedNode] = useState<string>("Users & Accounts");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [panes, setPanes] = useState<SplitterPaneProps[]>([
    { size: "260px", min: "200px", max: "400px", resizable: true },
    { resizable: true },
  ]);

  const handleItemClick = (e: any) => {
    if (e.item.text) {
      setSelectedNode(e.item.text);
    }
  };

  return (
    <AppLayout>
      <ContentLayout title="System Preferences & Governance" breadcrumbItems={["System", "System Preferences"]}>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Key360 Enterprise Governance Architecture</h3>
              <p className="text-xs text-slate-400">TreeView Navigation, Stepper Wizards & Splitter Panes</p>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
              KENDO PREMIUM NAVIGATION SUITE
            </span>
          </div>

          {/* Splitter Container */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[550px]">
            <Splitter panes={panes} onChange={(e) => setPanes(e.newState)} style={{ height: 550 }}>
              {/* Left Pane: TreeView Navigation */}
              <div className="p-4 bg-slate-50 border-r border-slate-200 h-full overflow-y-auto space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">System Tree Navigation</h4>
                <TreeView
                  data={treeData}
                  onItemClick={handleItemClick}
                  textField="text"
                  expandField="expanded"
                />
              </div>

              {/* Right Pane: Detail PanelBar & Stepper Workflow */}
              <div className="p-6 space-y-6 overflow-y-auto">
                {/* Stepper Workflow Header */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Role & Security Provisioning Wizard ({selectedNode})
                  </h4>
                  <Stepper
                    items={stepperSteps}
                    value={currentStep}
                    onChange={(e) => setCurrentStep(e.value)}
                  />
                </div>

                {/* PanelBar Accordion */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {selectedNode} - Configuration Panels
                  </h4>
                  <PanelBar>
                    <PanelBarItem title="1. Access Control Matrix & Permission Flags" expanded={true}>
                      <div className="p-4 text-xs text-slate-600 space-y-2 bg-slate-50/50">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                          <span>Module Access (Read/Write/Delete)</span>
                          <span className="font-bold text-emerald-600">FULL ACCESS</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                          <span>Metadata Schema Editing</span>
                          <span className="font-bold text-blue-600">ADMINISTRATOR ONLY</span>
                        </div>
                      </div>
                    </PanelBarItem>
                    <PanelBarItem title="2. Automated Approval Workflows">
                      <div className="p-4 text-xs text-slate-600 space-y-2 bg-slate-50/50">
                        <p>Timesheet Approvals: Multi-level Manager sign-off enabled.</p>
                        <p>Asset Decommissioning: Requires Enterprise Auditor digital stamp.</p>
                      </div>
                    </PanelBarItem>
                    <PanelBarItem title="3. External Integrations & Webhooks">
                      <div className="p-4 text-xs text-slate-600 space-y-2 bg-slate-50/50">
                        <p>REST API Endpoint: <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">https://api.key360.io/v2/webhooks</code></p>
                        <p>OAuth2 Authentication Status: Active</p>
                      </div>
                    </PanelBarItem>
                  </PanelBar>
                </div>
              </div>
            </Splitter>
          </div>
        </div>
      </ContentLayout>
    </AppLayout>
  );
}
