"use client";

import React from "react";
import { useParams } from "next/navigation";
import ModuleRenderer from "@/modules/ModuleRenderer";
import { ModuleRegistry } from "@/metadata/registry";
import { getServiceForModule } from "@/services/serviceResolver";

export default function DynamicModulePage() {
  const params = useParams();
  const rawModuleId = params?.moduleId;
  const moduleId = Array.isArray(rawModuleId) ? rawModuleId[0] : (rawModuleId as string) || "";

  if (!moduleId) {
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        Error: No module ID specified.
      </div>
    );
  }

  // 1. Resolve module configuration dynamically
  const config = ModuleRegistry.getModule(moduleId);

  // 2. Resolve service dynamically (uses mock cache service if available, or HTTP provider targeting /api/{moduleId})
  const service = getServiceForModule(moduleId, config?.endpoint);

  if (!config) {
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        Error: Unable to resolve metadata configuration for module "{moduleId}".
      </div>
    );
  }

  return <ModuleRenderer config={config} service={service} />;
}
