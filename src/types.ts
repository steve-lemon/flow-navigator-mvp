export type Status = 'todo' | 'doing' | 'done' | 'hold' | 'skip';

export interface Actor {
  id: string;
  name: string;
  color: string;
  stereo: 'person' | 'team' | 'vendor';
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  memo?: string;
}

export interface TaskTemplate {
  id: string;
  title: string;
  guideText?: string;
  actionLabel?: string;
  toolId?: string;
  order: number;
}

export interface Tool {
  id: string;
  name: string;
  stereo: 'link' | 'embed' | 'flow';
  urlTemplate?: string;
  actionLabel: string;
  taskTemplates?: TaskTemplate[];
  memo?: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Flow {
  id: string;
  name: string;
  description: string;
  stereo: 'linear' | 'flexible';
  stages: Stage[];
  createdAt: number;
  updatedAt: number;
}

export interface Item {
  id: string;
  flowId: string;
  name: string;
  thumbnailUrl: string;
  stages: Stage[];
  memo?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Stage {
  id: string;
  itemId: string;
  flowId: string;
  name: string;
  stereo: 'simple' | 'iterative' | 'flow';
  status: Status;
  actorId?: string;
  guideText?: string;
  actionLabel?: string;
  toolId?: string;
  dependencyStageIds: string[];
  isRequired: boolean;
  order: number;
  tasks: Task[];
  notes: Note[];
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  completedByActorId?: string;
}

export interface Task {
  id: string;
  stageId: string;
  title: string;
  stereo: 'normal' | 'review' | 'revision';
  status: Status;
  actorId?: string;
  toolId?: string;
  guideText?: string;
  actionLabel?: string;
  notes: Note[];
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  completedByActorId?: string;
}

export interface Note {
  id: string;
  stageId?: string;
  taskId?: string;
  content: string;
  stereo: 'comment' | 'issue' | 'request';
  actorId?: string;
  targetActorId?: string;
  isResolved: boolean;
  createdAt: number;
  updatedAt: number;
  resolvedAt?: number;
  resolvedByActorId?: string;
}

// API Types

export interface CreateFlowInput {
  name: string;
  description: string;
  stereo: 'linear' | 'flexible';
  stages: CreateStageInput[];
}

export interface UpdateFlowInput {
  name?: string;
  description?: string;
  stages?: Stage[];
}

export interface CreateStageInput {
  name: string;
  stereo: 'simple' | 'iterative' | 'flow';
  guideText?: string;
  actionLabel?: string;
  actorId?: string;
  toolId?: string;
  isRequired: boolean;
  dependencyStageIds?: string[];
  order: number;
}

export interface UpdateStageInput {
  name?: string;
  guideText?: string;
  actionLabel?: string;
  actorId?: string;
  toolId?: string;
  isRequired?: boolean;
  dependencyStageIds?: string[];
  order?: number;
  tasks?: Task[];
  notes?: Note[];
}

export interface CreateItemInput {
  name: string;
  thumbnailUrl: string;
  flowId: string;
}

export interface ChangeStatusInput {
  status: Status;
  actorId?: string;
}

export interface CreateNoteInput {
  content: string;
  authorId: string;
}

export interface CreateTaskInput {
  title: string;
  authorId?: string;
}

export interface ApiResponse<T> {
  data: T;
  warnings?: string[];
  meta?: any;
}

export interface ApiListResponse<T> {
  data: T[];
  warnings?: string[];
  meta?: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: string[];
  };
}