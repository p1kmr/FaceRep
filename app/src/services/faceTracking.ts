import { requireNativeView, requireOptionalNativeModule } from 'expo';
import type { ComponentType } from 'react';
import type { NativeSyntheticEvent, ViewProps } from 'react-native';

/**
 * Apple's face tracking for the workout mirror (docs/face-tracking.md) and the face scan (docs/face-scan.md). The only
 * import of the local module in modules/face-tracking, which is missing on web, in Expo Go and in builds made before
 * it existed (the photo functions came with the face scan).
 */
interface FaceRepFaceTracking {
  isSupported(): boolean;
  isSimulator?: boolean;
  simulatorCamera?(name: string): string | null;
  photosDirectory?(): string;
  takePhoto?(name: string): Promise<{ name: string; width: number; height: number }>;
  deletePhoto?(name: string): Promise<void>;
  deleteAllPhotos?(): Promise<void>;
}

/** About 15 times a second while a face may be in view: ARKit's blend shapes and the head's rotation. */
export interface NativeFaceEvent {
  tracked?: boolean;
  t?: number;
  shapes?: Record<string, number>;
  rotation?: number[];
  /** Degrees between where the face points and the camera (0 = looking straight at it). */
  turn?: number;
  /** Metres from the camera to the face. */
  distance?: number;
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

/**
 * How the face scan runs here: the camera on an iPhone with face tracking, a pretend face in the iOS Simulator (it has
 * no camera; for trying the screens), or not at all (web, Expo Go, older iPhones, builds without the photo functions).
 */
export const faceScanMode: 'camera' | 'simulated' | null = !native?.takePhoto
  ? null
  : faceTrackingSupported
    ? 'camera'
    : native.isSimulator === true
      ? 'simulated'
      : null;

/** True in the iOS Simulator. */
export const isSimulator = native?.isSimulator === true;

/**
 * The Simulator has no camera. For the store screenshots a picture copied into the app's
 * Documents/SimulatorCamera/<name>.jpg stands in for it (docs/screenshots.md §4): `scan` in the face scan (and its
 * photo), `mirror` in the workout mirror. Always null on an iPhone, and in the Simulator without the file.
 */
export function simulatorCamera(name: 'scan' | 'mirror'): string | null {
  if (!isSimulator) return null;
  try {
    return native?.simulatorCamera?.(name) ?? null;
  } catch {
    return null;
  }
}

let photosDirectory: string | null | undefined;

/** The file URL of a saved scan photo (its folder is looked up once). Null without the module. */
export function scanPhotoUri(name: string): string | null {
  if (photosDirectory === undefined) {
    try {
      photosDirectory = native?.photosDirectory?.() ?? null;
    } catch {
      photosDirectory = null;
    }
  }
  return photosDirectory ? `${photosDirectory}${name}` : null;
}

/** Saves what the scan's camera shows now as `<id>.jpg`, on this iPhone only; returns the file name. */
export async function takeScanPhoto(id: string): Promise<string> {
  if (!native?.takePhoto) throw new Error('no camera');
  const { name } = await native.takePhoto(`${id}.jpg`);
  return name;
}

export async function deleteScanPhoto(name: string): Promise<void> {
  await native?.deletePhoto?.(name);
}

export async function deleteAllScanPhotos(): Promise<void> {
  await native?.deleteAllPhotos?.();
}
