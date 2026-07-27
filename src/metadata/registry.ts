import { ModuleConfig } from "./engine";

// Interfaces for Extensibility Plugins
export type ViewPluginRenderer = React.ComponentType<any>;
export type WidgetPluginRenderer = React.ComponentType<any>;
export type CustomCellRenderer = (props: any) => React.ReactNode;
export type FieldValidator = (value: any, formValues?: any) => string | undefined;

class PluginManagerClass {
  private viewPlugins = new Map<string, ViewPluginRenderer>();
  private widgetPlugins = new Map<string, WidgetPluginRenderer>();
  private cellRenderers = new Map<string, CustomCellRenderer>();
  private validators = new Map<string, FieldValidator>();

  registerView(type: string, renderer: ViewPluginRenderer) {
    this.viewPlugins.set(type, renderer);
  }

  getView(type: string): ViewPluginRenderer | undefined {
    return this.viewPlugins.get(type);
  }

  registerWidget(type: string, renderer: WidgetPluginRenderer) {
    this.widgetPlugins.set(type, renderer);
  }

  getWidget(type: string): WidgetPluginRenderer | undefined {
    return this.widgetPlugins.get(type);
  }

  registerCellRenderer(field: string, renderer: CustomCellRenderer) {
    this.cellRenderers.set(field, renderer);
  }

  getCellRenderer(field: string): CustomCellRenderer | undefined {
    return this.cellRenderers.get(field);
  }

  registerValidator(name: string, validator: FieldValidator) {
    this.validators.set(name, validator);
  }

  getValidator(name: string): FieldValidator | undefined {
    return this.validators.get(name);
  }
}

export const PluginManager = new PluginManagerClass();

// Module Registry Class
class ModuleRegistryClass {
  private modules = new Map<string, ModuleConfig>();
  private navigationGroups = new Map<string, string[]>();
  private routeMappings = new Map<string, string>();
  private featureFlags = new Map<string, boolean>();
  private services = new Map<string, any>();

  registerService(moduleId: string, service: any) {
    this.services.set(moduleId, service);
  }

  getService(moduleId: string): any | undefined {
    return this.services.get(moduleId);
  }

  registerModule(config: ModuleConfig, route = "") {
    this.modules.set(config.id, config);
    
    // Auto-discover breadcrumb category and assign module mapping
    const category = config.breadcrumbs[0] || "General";
    const existing = this.navigationGroups.get(category) || [];
    if (!existing.includes(config.id)) {
      existing.push(config.id);
      this.navigationGroups.set(category, existing);
    }

    if (route) {
      this.routeMappings.set(config.id, route);
    } else {
      this.routeMappings.set(config.id, `/${config.id}`);
    }
  }

  getModule(id: string): ModuleConfig | undefined {
    return this.modules.get(id);
  }

  getAllModules(): ModuleConfig[] {
    return Array.from(this.modules.values());
  }

  getNavigationGroups(): Map<string, string[]> {
    return this.navigationGroups;
  }

  getRoute(id: string): string {
    return this.routeMappings.get(id) || `/${id}`;
  }

  // Feature flag manager
  setFeatureFlag(name: string, enabled: boolean) {
    this.featureFlags.set(name, enabled);
  }

  isFeatureEnabled(name: string): boolean {
    return this.featureFlags.get(name) ?? true;
  }
}

export const ModuleRegistry = new ModuleRegistryClass();

// Import concrete module configs
import { timesheetModuleConfig } from "./timesheet";
import { projectPlanningModuleConfig } from "./projectPlanning";
import { physicalItemsModuleConfig } from "./physicalItems";
import { employeeModuleConfig } from "./employees";
import { resolveModuleConfig } from "./engine";
import { timesheetService } from "@/services/timesheetService";
import { projectPlanningService } from "@/services/projectPlanningService";
import { physicalItemsService } from "@/services/physicalItemsService";
import { cachedEmployeeService } from "@/services/employeeService";

// Register default business modules
ModuleRegistry.registerModule(timesheetModuleConfig, "/timesheet");
ModuleRegistry.registerModule(projectPlanningModuleConfig, "/project-planning");
ModuleRegistry.registerModule(physicalItemsModuleConfig, "/physical-items");
ModuleRegistry.registerModule(employeeModuleConfig, "/employees");

// Register concrete services wrapped in the caching layer
import { CachingDataProvider } from "@/services/caching";
ModuleRegistry.registerService("timesheets", new CachingDataProvider(timesheetService, "timesheets_cache", 120));
ModuleRegistry.registerService("project-planning", new CachingDataProvider(projectPlanningService, "project_planning_cache", 120));
ModuleRegistry.registerService("physical-items", new CachingDataProvider(physicalItemsService, "physical_items_cache", 120));
ModuleRegistry.registerService("employees", cachedEmployeeService);

// Register demo placeholder modules to showcase high-efficiency metadata scaling
ModuleRegistry.registerModule(resolveModuleConfig({
  id: "assets",
  extends: "base",
  title: "Assets",
  breadcrumbs: ["Operations (Future)", "Assets"],
  endpoint: "assets",
  columnRefs: ["id", "title"],
  fieldRefs: ["title"],
}), "#");

ModuleRegistry.registerModule(resolveModuleConfig({
  id: "vendors",
  extends: "base",
  title: "Vendors",
  breadcrumbs: ["Operations (Future)", "Vendors"],
  endpoint: "vendors",
  columnRefs: ["id", "title"],
  fieldRefs: ["title"],
}), "#");

ModuleRegistry.registerModule(resolveModuleConfig({
  id: "work-orders",
  extends: "base",
  title: "Work Orders",
  breadcrumbs: ["Operations (Future)", "Work Orders"],
  endpoint: "work-orders",
  columnRefs: ["id", "title"],
  fieldRefs: ["title"],
}), "#");

