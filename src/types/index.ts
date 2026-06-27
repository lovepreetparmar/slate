export interface Task {
  id: string;
  userId: string;
  title: string;
  note: string | null;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
  taskDate: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  id?: string;
  title: string;
  note?: string;
  taskDate?: string;
}

export interface UpdateTaskInput {
  title?: string;
  note?: string | null;
  completed?: boolean;
  taskDate?: string;
}

export interface CarryOverTask extends Task {
  isCarryOver: true;
}

export type SyncAction =
  | { type: "create"; payload: CreateTaskInput & { id: string; taskDate: string } }
  | { type: "update"; payload: { id: string } & UpdateTaskInput }
  | { type: "delete"; payload: { id: string } }
  | {
      type: "carryOver";
      payload: {
        action: "keep" | "delete" | "keep_all" | "delete_all";
        taskIds?: string[];
      };
    };
