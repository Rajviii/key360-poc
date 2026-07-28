"use client";

import React from "react";
import ModuleRenderer from "@/modules/ModuleRenderer";
import { ModuleRegistry } from "@/metadata/registry";
import { getServiceForModule } from "@/services/serviceResolver";

export default function PhysicalItemsPage() {
  const config = ModuleRegistry.getModule("physical-items");
  const service = getServiceForModule("physical-items");

  if (!config) {
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        Error: Physical Items module not registered.
      </div>
    );
  }

  return <ModuleRenderer config={config} service={service} />;
}
