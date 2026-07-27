"use client";

import React from "react";
import ModuleRenderer from "@/modules/ModuleRenderer";
import { ModuleRegistry } from "@/metadata/registry";

export default function ProjectPlanningPage() {
  const config = ModuleRegistry.getModule("project-planning");
  const service = ModuleRegistry.getService("project-planning");

  if (!config || !service) {
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        Error: Project Planning module not registered in Framework Registry.
      </div>
    );
  }

  return <ModuleRenderer config={config} service={service} />;
}
