import {
  Item, Flow, Stage, Task, Note, Actor, Tool,
  ApiResponse, ApiListResponse, CreateFlowInput, UpdateFlowInput,
  CreateItemInput, ChangeStatusInput, CreateNoteInput, CreateTaskInput, UpdateStageInput
} from '../types';
import { INITIAL_ITEMS, FLOWS, ACTORS, TOOLS } from '../mockData';

// Shared internal state for the mock API
let dbItems: Item[] = [...INITIAL_ITEMS];
let dbFlows: Record<string, Flow> = { ...FLOWS };
let dbActors: Record<string, Actor> = { ...ACTORS };
let dbTools: Record<string, Tool> = { ...TOOLS };

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const success = <T>(data: T, warnings: string[] = []): ApiResponse<T> => ({ data, warnings });
const listSuccess = <T>(data: T[], warnings: string[] = []): ApiListResponse<T> => ({
  data,
  warnings,
  meta: { page: 1, pageSize: data.length, total: data.length }
});

export const mockApi = {
  flows: {
    async list(): Promise<ApiListResponse<Flow>> {
      await delay(200);
      return listSuccess(Object.values(dbFlows));
    },
    async get(id: string): Promise<ApiResponse<Flow>> {
      await delay(200);
      const flow = dbFlows[id];
      if (!flow) throw new Error(`Flow not found: ${id}`);
      return success(flow);
    },
    async create(input: CreateFlowInput): Promise<ApiResponse<Flow>> {
      await delay(300);
      if (!input.name.trim()) throw new Error('name is required');
      const id = `flow-${Date.now()}`;
      const stages: Stage[] = input.stages.map((s, i) => ({
        id: `ts-${Date.now()}-${i}`,
        itemId: '',
        flowId: id,
        name: s.name,
        stereo: s.stereo,
        status: 'todo',
        guideText: s.guideText,
        actionLabel: s.actionLabel || '작업 열기',
        actorId: s.actorId,
        toolId: s.toolId,
        dependencyStageIds: s.dependencyStageIds || [],
        isRequired: s.isRequired,
        order: s.order || i + 1,
        tasks: [],
        notes: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }));
      const newFlow: Flow = {
        id,
        name: input.name,
        description: input.description || '',
        stereo: input.stereo,
        stages,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      dbFlows[id] = newFlow;
      return success(newFlow);
    },
    async update(id: string, input: UpdateFlowInput): Promise<ApiResponse<Flow>> {
      await delay(300);
      const flow = dbFlows[id];
      if (!flow) throw new Error(`Flow not found: ${id}`);
      if (input.name !== undefined && !input.name.trim()) throw new Error('name cannot be empty');
      const updated = { ...flow, ...input, updatedAt: Date.now() };
      dbFlows[id] = updated;
      return success(updated);
    },
    async remove(id: string): Promise<ApiResponse<{ id: string }>> {
      await delay(300);
      delete dbFlows[id];
      return success({ id });
    },
    async apply(id: string, input: CreateItemInput): Promise<ApiResponse<Item>> {
      await delay(400);
      const flow = dbFlows[id];
      if (!flow) throw new Error(`Flow not found: ${id}`);
      if (!input.name.trim()) throw new Error('name is required');
      
      const itemId = `item-${Date.now()}`;
      const idMap = new Map<string, string>();
      flow.stages.forEach(s => {
        idMap.set(s.id, `s${s.order}-${Math.random().toString(36).substring(7)}`);
      });

      const newStages = flow.stages.map((tmpl) => ({
        ...tmpl,
        id: idMap.get(tmpl.id)!,
        itemId: itemId,
        flowId: id,
        status: 'todo' as const,
        dependencyStageIds: tmpl.dependencyStageIds.map(depId => idMap.get(depId)!).filter(Boolean),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }));

      const newItem: Item = {
        id: itemId,
        flowId: id,
        name: input.name,
        thumbnailUrl: input.thumbnailUrl || 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=200&h=200',
        stages: newStages,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      dbItems = [newItem, ...dbItems];
      return success(newItem);
    }
  },
  items: {
    async list(): Promise<ApiListResponse<Item>> {
      await delay(300);
      return listSuccess(dbItems);
    },
    async get(id: string): Promise<ApiResponse<Item>> {
      await delay(200);
      const item = dbItems.find(i => i.id === id);
      if (!item) throw new Error('Item not found');
      return success(item);
    },
    async create(input: CreateItemInput): Promise<ApiResponse<Item>> {
      await delay(300);
      const flow = dbFlows[input.flowId];
      if (!flow) throw new Error(`Flow not found: ${input.flowId}`);
      if (!input.name.trim()) throw new Error('name is required');
      
      const itemId = `item-${Date.now()}`;
      const idMap = new Map<string, string>();
      flow.stages.forEach(s => {
        idMap.set(s.id, `s${s.order}-${Math.random().toString(36).substring(7)}`);
      });

      const newStages = flow.stages.map((tmpl) => ({
        ...tmpl,
        id: idMap.get(tmpl.id)!,
        itemId: itemId,
        flowId: input.flowId,
        status: 'todo' as const,
        dependencyStageIds: tmpl.dependencyStageIds.map(depId => idMap.get(depId)!).filter(Boolean),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }));

      const newItem: Item = {
        id: itemId,
        flowId: input.flowId,
        name: input.name,
        thumbnailUrl: input.thumbnailUrl || 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=200&h=200',
        stages: newStages,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      dbItems = [newItem, ...dbItems];
      return success(newItem);
    },
    async update(id: string, input: Partial<Item>): Promise<ApiResponse<Item>> {
      await delay(300);
      const idx = dbItems.findIndex(i => i.id === id);
      if (idx === -1) throw new Error('Item not found');
      dbItems[idx] = { ...dbItems[idx], ...input, updatedAt: Date.now() };
      return success(dbItems[idx]);
    },
    async remove(id: string): Promise<ApiResponse<{ id: string }>> {
      await delay(300);
      dbItems = dbItems.filter(i => i.id !== id);
      return success({ id });
    }
  },
  stages: {
    async get(id: string): Promise<ApiResponse<Stage>> {
       await delay(100);
       for (const item of dbItems) {
         const stage = item.stages.find(s => s.id === id);
         if (stage) return success(stage);
       }
       throw new Error('Stage not found');
    },
    async update(id: string, input: UpdateStageInput): Promise<ApiResponse<Stage>> {
      await delay(200);
      for (const item of dbItems) {
         const idx = item.stages.findIndex(s => s.id === id);
         if (idx !== -1) {
           item.stages[idx] = { ...item.stages[idx], ...input, updatedAt: Date.now() };
           return success(item.stages[idx]);
         }
      }
      throw new Error('Stage not found');
    },
    async changeStatus(id: string, input: ChangeStatusInput): Promise<ApiResponse<Stage>> {
      await delay(200);
      const warnings: string[] = [];
      for (const item of dbItems) {
        const idx = item.stages.findIndex(s => s.id === id);
        if (idx !== -1) {
          const stage = item.stages[idx];
          if (input.status === 'done' || input.status === 'doing') {
            const deps = stage.dependencyStageIds.map(depId => item.stages.find(s => s.id === depId));
            const incompleteDeps = deps.filter(d => d && d.status !== 'done' && d.status !== 'skip');
            if (incompleteDeps.length > 0) {
              warnings.push(`선행 단계가 아직 완료되지 않았습니다: ${incompleteDeps.map(d => d?.name).join(', ')}`);
            }
          }
          if (input.status === 'done' && stage.notes.some(n => !n.isResolved)) {
            warnings.push('진행 중인 이슈(Note)가 있습니다.');
          }
          
          item.stages[idx] = { ...stage, status: input.status, updatedAt: Date.now() };
          return success(item.stages[idx], warnings);
        }
      }
      throw new Error('Stage not found');
    },
    async addNote(id: string, input: CreateNoteInput): Promise<ApiResponse<Note>> {
      await delay(200);
      const newNote: Note = {
        id: `note-${Date.now()}`,
        stageId: id,
        content: input.content,
        stereo: 'comment',
        actorId: input.authorId,
        isResolved: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      for (const item of dbItems) {
        const stage = item.stages.find(s => s.id === id);
        if (stage) {
          stage.notes = [newNote, ...stage.notes];
          stage.updatedAt = Date.now();
          return success(newNote);
        }
      }
      throw new Error('Stage not found');
    },
    async addTask(id: string, input: CreateTaskInput): Promise<ApiResponse<Task>> {
      await delay(200);
      const newTask: Task = {
        id: `task-${Date.now()}`,
        stageId: id,
        title: input.title,
        stereo: 'normal',
        status: 'todo',
        notes: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
       for (const item of dbItems) {
        const stage = item.stages.find(s => s.id === id);
        if (stage) {
          stage.tasks = [...stage.tasks, newTask];
          stage.updatedAt = Date.now();
          return success(newTask);
        }
      }
      throw new Error('Stage not found');
    }
  },
  actors: {
    async list(): Promise<ApiListResponse<Actor>> {
      await delay(100);
      return listSuccess(Object.values(dbActors));
    },
    async create(input: Partial<Actor>): Promise<ApiResponse<Actor>> {
      await delay(200);
      if (!input.name || !input.color || !input.stereo) throw new Error('Missing required fields');
      const warnings: string[] = [];
      if (Object.values(dbActors).some(a => a.name === input.name)) {
        warnings.push('중복된 이름의 담당자가 있습니다.');
      }
      const id = `actor-${Date.now()}`;
      const newActor: Actor = {
        id,
        name: input.name,
        color: input.color,
        stereo: input.stereo as 'person' | 'team' | 'vendor',
        memo: input.memo,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      dbActors[id] = newActor;
      return success(newActor, warnings);
    },
    async update(id: string, input: Partial<Actor>): Promise<ApiResponse<Actor>> {
      await delay(200);
      const actor = dbActors[id];
      if (!actor) throw new Error('Actor not found');
      const updated = { ...actor, ...input, stereo: actor.stereo, id: actor.id, updatedAt: Date.now() };
      dbActors[id] = updated;
      return success(updated);
    },
    async deactivate(id: string): Promise<ApiResponse<Actor>> {
      await delay(100);
      if (!dbActors[id]) throw new Error('Actor not found');
      dbActors[id].isActive = false;
      dbActors[id].updatedAt = Date.now();
      return success(dbActors[id]);
    },
    async activate(id: string): Promise<ApiResponse<Actor>> {
      await delay(100);
      if (!dbActors[id]) throw new Error('Actor not found');
      dbActors[id].isActive = true;
      dbActors[id].updatedAt = Date.now();
      return success(dbActors[id]);
    }
  },
  tools: {
    async list(): Promise<ApiListResponse<Tool>> {
      await delay(100);
      return listSuccess(Object.values(dbTools));
    },
    async create(input: Partial<Tool>): Promise<ApiResponse<Tool>> {
      await delay(200);
      if (!input.name || !input.stereo || !input.urlTemplate || !input.actionLabel) {
        throw new Error('Missing required fields');
      }
      const warnings: string[] = [];
      if (Object.values(dbTools).some(t => t.name === input.name)) {
        warnings.push('중복된 이름의 도구가 있습니다.');
      }
      const hasInvalidPlaceholder = input.urlTemplate.match(/\{(?!(itemId|itemName|stageId|stageName|taskId|taskTitle))\w+\}/);
      if (hasInvalidPlaceholder) {
        warnings.push('지원하지 않는 placeholder가 포함되어 있습니다.');
      }
      const id = `tool-${Date.now()}`;
      const newTool: Tool = {
        id,
        name: input.name,
        stereo: input.stereo as 'link' | 'embed' | 'flow',
        urlTemplate: input.urlTemplate,
        actionLabel: input.actionLabel,
        memo: input.memo,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      dbTools[id] = newTool;
      return success(newTool, warnings);
    },
    async update(id: string, input: Partial<Tool>): Promise<ApiResponse<Tool>> {
      await delay(200);
      const tool = dbTools[id];
      if (!tool) throw new Error('Tool not found');
      const warnings: string[] = [];
      if (input.urlTemplate) {
        const hasInvalidPlaceholder = input.urlTemplate.match(/\{(?!(itemId|itemName|stageId|stageName|taskId|taskTitle))\w+\}/);
        if (hasInvalidPlaceholder) {
          warnings.push('지원하지 않는 placeholder가 포함되어 있습니다.');
        }
      }
      const updated = { ...tool, ...input, stereo: tool.stereo, id: tool.id, updatedAt: Date.now() };
      dbTools[id] = updated;
      return success(updated, warnings);
    },
    async deactivate(id: string): Promise<ApiResponse<Tool>> {
      await delay(100);
      const tool = dbTools[id];
      if (!tool) throw new Error('Tool not found');
      tool.isActive = false;
      tool.updatedAt = Date.now();
      return success(tool);
    },
    async activate(id: string): Promise<ApiResponse<Tool>> {
      await delay(100);
      const tool = dbTools[id];
      if (!tool) throw new Error('Tool not found');
      tool.isActive = true;
      tool.updatedAt = Date.now();
      return success(tool);
    }
  }
};
