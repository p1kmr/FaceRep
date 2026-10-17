import type { LogAction, ReminderAction, RoutineAction } from '@/services/ai/types';

import type { ProposedAction } from './types';

/** A proposed reminder change (create, update, delete). */
export const isReminderProposal = (p: ProposedAction): p is ProposedAction & { action: ReminderAction } =>
  p.action.type === 'create' || p.action.type === 'update' || p.action.type === 'delete';

/** A proposed workout to save or to start. */
export const isWorkoutProposal = (p: ProposedAction): p is ProposedAction & { action: LogAction | RoutineAction } =>
  p.action.type === 'log' || p.action.type === 'routine';
