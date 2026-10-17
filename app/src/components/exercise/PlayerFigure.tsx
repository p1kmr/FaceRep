import type { ExerciseId } from '@/constants/exercises';

import { ExerciseClip, useExerciseClip } from './ExerciseClip';
import { ExerciseFrames } from './ExerciseFrames';

interface PlayerFigureProps {
  id: ExerciseId;
  /** Squeeze (hold) or release, from the rep counter. */
  squeeze: boolean;
  /** Before the exercise starts (get ready, next up): its clip shows the move once. */
  preview: boolean;
  paused: boolean;
  label: string;
}

/**
 * The figure in the workout player. Before each exercise its clip plays (when it has one); during the reps the two
 * drawings switch in time with the counter, because a clip has a fixed timing (docs/videos.md).
 */
export function PlayerFigure({ id, squeeze, preview, paused, label }: PlayerFigureProps) {
  const clip = useExerciseClip(id);
  if (preview && clip) return <ExerciseClip key={id} id={id} clip={clip} label={label} paused={paused} fill />;
  return <ExerciseFrames id={id} squeeze={squeeze} label={label} fill />;
}
