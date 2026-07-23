import { initialProjectTasks, initialProjectDependencies } from "@/metadata/projectPlanning";

// Helper type for hierarchy flattening and searching
export interface GanttTask {
  id: number;
  title: string;
  start: Date;
  end: Date;
  percentComplete: number;
  isRollup?: boolean;
  isExpanded?: boolean;
  isInEdit?: boolean;
  children?: GanttTask[];
  parentId?: number | null;
}

export interface GanttDependency {
  id: number;
  fromId: number;
  toId: number;
  type: number;
}

let mockTasks: GanttTask[] = [...initialProjectTasks];
let mockDependencies: GanttDependency[] = [...initialProjectDependencies];

// Helper to simulate network latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to find a task recursively in a tree and update it
const updateTaskInTree = (tasks: GanttTask[], id: number, updates: Partial<GanttTask>): { updated: boolean; list: GanttTask[] } => {
  let updated = false;
  const list = tasks.map((task) => {
    if (task.id === id) {
      updated = true;
      return { ...task, ...updates } as GanttTask;
    }
    if (task.children && task.children.length > 0) {
      const childResult = updateTaskInTree(task.children, id, updates);
      if (childResult.updated) {
        updated = true;
        return { ...task, children: childResult.list };
      }
    }
    return task;
  });
  return { updated, list };
};

// Helper function to delete a task recursively in a tree
const deleteTaskInTree = (tasks: GanttTask[], id: number): { deleted: boolean; list: GanttTask[] } => {
  let deleted = false;
  const filtered = tasks.filter((task) => {
    if (task.id === id) {
      deleted = true;
      return false; // Remove this node
    }
    return true;
  });

  if (deleted) {
    return { deleted, list: filtered };
  }

  // If not deleted from root levels, check children
  const list = tasks.map((task) => {
    if (task.children && task.children.length > 0) {
      const childResult = deleteTaskInTree(task.children, id);
      if (childResult.deleted) {
        deleted = true;
        return { ...task, children: childResult.list };
      }
    }
    return task;
  });

  return { deleted, list };
};

// Helper function to find a task by ID recursively
const findTaskInTree = (tasks: GanttTask[], id: number): GanttTask | undefined => {
  for (const task of tasks) {
    if (task.id === id) {
      return task;
    }
    if (task.children && task.children.length > 0) {
      const found = findTaskInTree(task.children, id);
      if (found) return found;
    }
  }
  return undefined;
};

// Deep copy helper for tree structure to avoid react state mutations
const cloneTasks = (tasks: GanttTask[]): GanttTask[] => {
  return tasks.map((t) => ({
    ...t,
    start: new Date(t.start),
    end: new Date(t.end),
    children: t.children ? cloneTasks(t.children) : undefined,
  }));
};

export const projectPlanningService = {
  // Fetch all tasks and dependencies
  async getAll(): Promise<{ tasks: GanttTask[]; dependencies: GanttDependency[] }> {
    await delay(300); // Simulate network latency
    return {
      tasks: cloneTasks(mockTasks),
      dependencies: [...mockDependencies],
    };
  },

  // Get a single task by ID
  async getById(id: number): Promise<GanttTask | undefined> {
    await delay(200);
    const task = findTaskInTree(mockTasks, id);
    return task ? { ...task, start: new Date(task.start), end: new Date(task.end) } : undefined;
  },

  // Create a new task (e.g. at the root level for simplification)
  async create(record: Omit<GanttTask, "id">): Promise<GanttTask> {
    await delay(400);
    // Find maximum ID
    let maxId = 0;
    const findMaxId = (tasks: GanttTask[]) => {
      tasks.forEach((t) => {
        if (t.id > maxId) maxId = t.id;
        if (t.children) findMaxId(t.children);
      });
    };
    findMaxId(mockTasks);

    const newRecord: GanttTask = {
      ...record,
      id: maxId + 1,
      start: new Date(record.start),
      end: new Date(record.end),
    };
    
    // Add to the top-level tasks
    mockTasks = [...mockTasks, newRecord];
    return { ...newRecord };
  },

  // Update an existing task
  async update(id: number, updates: Partial<GanttTask>): Promise<GanttTask> {
    await delay(400);
    // Handle date object conversions if strings are passed in
    const normalizedUpdates = { ...updates };
    if (updates.start) normalizedUpdates.start = new Date(updates.start);
    if (updates.end) normalizedUpdates.end = new Date(updates.end);

    const result = updateTaskInTree(mockTasks, id, normalizedUpdates);
    if (!result.updated) {
      throw new Error(`Task with ID ${id} not found.`);
    }
    mockTasks = result.list;
    const updatedTask = findTaskInTree(mockTasks, id)!;
    return { ...updatedTask };
  },

  // Delete a task
  async delete(id: number): Promise<boolean> {
    await delay(400);
    const result = deleteTaskInTree(mockTasks, id);
    if (result.deleted) {
      mockTasks = result.list;
      // Also delete any dependencies related to this task
      mockDependencies = mockDependencies.filter(
        (dep) => dep.fromId !== id && dep.toId !== id
      );
      return true;
    }
    return false;
  },
};
