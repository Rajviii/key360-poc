"use client";

import { useQuery } from "@/lib/react-query";
import { getServiceForModule } from "@/services/serviceResolver";

export function useModuleData<T = any>(moduleId: string) {
  const service = getServiceForModule(moduleId);

  return useQuery<T[]>({
    queryKey: ["module-data", moduleId],
    queryFn: async () => {
      if (!service) return [];
      return service.getAll();
    },
    staleTime: Infinity, // Keep static mock data cached in memory indefinitely
  });
}
