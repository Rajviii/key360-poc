import { IDataProvider } from "./IDataProvider";
import { ModuleRegistry } from "@/metadata/registry";

/**
 * Generic HTTP REST Data Provider for dynamic API endpoints (e.g. /api/clients)
 */
export class GenericHttpDataProvider<T = any> implements IDataProvider<T> {
  private endpoint: string;

  constructor(endpoint: string) {
    // Ensure endpoint has leading slash
    this.endpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  }

  async getAll(): Promise<T[] | any> {
    try {
      const response = await fetch(this.endpoint);
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status} when fetching ${this.endpoint}`);
      }
      return await response.json();
    } catch (err) {
      console.warn(`GenericHttpDataProvider: Could not fetch from ${this.endpoint}. Defaulting to empty dataset.`, err);
      return [];
    }
  }

  async getById(id: string | number): Promise<T | undefined | any> {
    try {
      const response = await fetch(`${this.endpoint}/${id}`);
      if (!response.ok) return undefined;
      return await response.json();
    } catch (err) {
      console.error(`Failed to get record ${id} from ${this.endpoint}:`, err);
      return undefined;
    }
  }

  async create(record: any): Promise<any> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
    if (!response.ok) throw new Error(`HTTP Error ${response.status} on create`);
    return await response.json();
  }

  async update(id: string | number, updates: any): Promise<any> {
    const response = await fetch(`${this.endpoint}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error(`HTTP Error ${response.status} on update`);
    return await response.json();
  }

  async delete(id: string | number): Promise<boolean> {
    const response = await fetch(`${this.endpoint}/${id}`, {
      method: "DELETE",
    });
    return response.ok;
  }
}

/**
 * Universal Data Service Resolver
 * Resolves registered mock service or dynamically creates an HTTP data provider.
 */
export function getServiceForModule(moduleId: string, customEndpoint?: string): IDataProvider {
  // 1. Check if explicit service registered in ModuleRegistry (mock/cached data)
  const registeredService = ModuleRegistry.getService(moduleId);
  if (registeredService) {
    return registeredService;
  }

  // 2. Fall back to generic HTTP service targeting API endpoint
  const endpoint = customEndpoint || `/api/${moduleId}`;
  return new GenericHttpDataProvider(endpoint);
}
