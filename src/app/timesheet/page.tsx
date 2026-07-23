"use client";

import ModuleRenderer from "@/modules/ModuleRenderer";
import { timesheetModuleConfig } from "@/metadata/timesheet";
import { timesheetService } from "@/services/timesheetService";

export default function Page() {
    return <ModuleRenderer config={timesheetModuleConfig} service={timesheetService} />;
}