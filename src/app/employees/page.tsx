"use client";

import React from "react";
import ModuleRenderer from "@/modules/ModuleRenderer";
import { ModuleRegistry } from "@/metadata/registry";
import { getServiceForModule } from "@/services/serviceResolver";

export default function EmployeesPage() {
  const config = ModuleRegistry.getModule("employees");
  const service = getServiceForModule("employees");

  if (!config) {
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        Error: Employees module not registered in Framework Registry.
      </div>
    );
  }

  return <ModuleRenderer config={config} service={service} />;
}
