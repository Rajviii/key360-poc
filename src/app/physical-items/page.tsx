"use client";

import React from "react";
import ModuleRenderer from "@/modules/ModuleRenderer";
import { ModuleRegistry } from "@/metadata/registry";

export default function PhysicalItemsPage() {
  const config = ModuleRegistry.getModule("physical-items");
  const service = ModuleRegistry.getService("physical-items");

  if (!config || !service) {
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        Error: Physical Items module not registered.
      </div>
    );
  }

  return <ModuleRenderer config={config} service={service} />;
}
