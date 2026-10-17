import { requireNativeView, requireOptionalNativeModule } from 'expo';
import type { ComponentType } from 'react';
import type { NativeSyntheticEvent, ViewProps } from 'react-native';

/**
 * Apple's face tracking for the workout mirror (docs/face-tracking.md). The only import of the local module in
 * modules/face-tracking, which is missing on web, in Expo Go and in builds made before it existed.
 */
interface FaceRepFaceTracking {
  isSupported(): boolean;
}

/** About 15 times a second while a face may be in view: ARKit's blend shapes and the head's rotation. */
export interface NativeFaceEvent {
  tracked?: boolean;
  t?: number;
  shapes?: Record<string, number>;
  rotation?: number[];
  /** ARKit's error code when the session stopped for good (the mirror then falls back to the plain camera). */
  error?: number;
}

export interface FaceTrackingViewProps extends ViewProps {
  /** Runs the camera and the tracking; off in the background. */
  active: boolean;
  onFace?: (event: NativeSyntheticEvent<NativeFaceEvent>) => void;
}

const native = requireOptionalNativeModule<FaceRepFaceTracking>('FaceRepFaceTracking');

function supported(): boolean {
  try {
    return native?.isSupported() === true;
  } catch {
    return false;
  }
}

/** True when this iPhone can follow a face (TrueDepth camera or an A12 chip and later) and the build has the module. */
export const faceTrackingSupported = supported();

/** The mirror with face tracking (front camera, mirrored); null where it isn't supported. */
export const FaceTrackingView: ComponentType<FaceTrackingViewProps> | null = faceTrackingSupported
  ? requireNativeView<FaceTrackingViewProps>('FaceRepFaceTracking')
  : null;
