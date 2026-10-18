import type { ReminderAction, RoutineAction } from '@/services/ai/types';

import type { ProposedAction } from './types';

/** A proposed reminder change (create, update, delete). */
export const isReminderProposal = (p: ProposedAction): p is ProposedAction & { action: ReminderAction } =>
  p.action.type === 'create' || p.action.type === 'update' || p.action.type === 'delete';

/** A proposed workout to start. */
export const isWorkoutProposal = (p: ProposedAction): p is ProposedAction & { action: RoutineAction } => p.action.type === 'routine';
