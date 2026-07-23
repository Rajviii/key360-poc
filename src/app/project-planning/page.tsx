"use client";

import ModuleRenderer from "@/modules/ModuleRenderer";
import { projectPlanningModuleConfig } from "@/metadata/projectPlanning";
import { projectPlanningService } from "@/services/projectPlanningService";

export default function ProjectPlanningPage() {
  return (
    <ModuleRenderer
      config={projectPlanningModuleConfig}
      service={projectPlanningService}
    />
  );
}
