import { useCallback, useEffect, useRef, useState } from 'react';
import type { NativeSyntheticEvent } from 'react-native';

import { SCAN } from '@/constants/faceScan';
import {
  createScanRun,
  scanReadings,
  scanRunReducer,
  scanRunView,
  scanSample,
  type ScanRunState,
  type ScanRunView,
} from '@/services/faceScan/engine';
import type { RawScan } from '@/services/faceScan/score';
import { createSimulatedFace } from '@/services/faceScan/simulatedFace';
import { deleteScanPhoto, faceScanMode, takeScanPhoto, type NativeFaceEvent } from '@/services/faceTracking';

interface ScanRunOptions {
  /** The camera runs and samples count (false on the intro and while saving). A new run starts each time it turns on. */
  running: boolean;
  /** The scan's id: its photo is "<id>.jpg". */
  id: string;
  /** Save a progress photo during the relaxed face (the user said yes to scan photos). */
  photo: boolean;
  /** Once, at the end: the readings (null when too few moves could be read) and the photo's file name. */
  onDone: (readings: RawScan | null, photo: string | null) => void;
}

const sameView = (a: ScanRunView, b: ScanRunView) =>
  a.stage === b.stage &&
  a.step === b.step &&
  a.issue === b.issue &&
  a.countdown === b.countdown &&
  Math.abs(a.progress - b.progress) < 0.02;

/**
 * Runs a face scan (services/faceScan/engine.ts): the camera's samples, or the Simulator's pretend face, go into the
 * engine; the screen gets what to show. The engine lives in a ref (15 samples a second) and the screen re-renders
 * only when something it shows changes. The progress photo is taken halfway through the relaxed face, while the face
 * is still and looking at the screen.
 */
export function useScanRun({ running, id, photo, onDone }: ScanRunOptions) {
  const engine = useRef<ScanRunState>(createScanRun());
  const [view, setView] = useState<ScanRunView>(() => scanRunView(createScanRun()));
  const [photoSaved, setPhotoSaved] = useState(false);
  /** ARKit's error code when the camera stopped for good (no permission, camera taken). */
  const [failed, setFailed] = useState<number | null>(null);
  const photoTask = useRef<Promise<string | null> | null>(null);
  const finished = useRef(false);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  const feed = useCallback((raw: NativeFaceEvent) => {
    if (finished.current) return;
    engine.current = scanRunReducer(engine.current, scanSample(raw));
    const next = scanRunView(engine.current);
    setView((prev) => (sameView(prev, next) ? prev : next));
  }, []);

  const onFace = useCallback(
    (event: NativeSyntheticEvent<NativeFaceEvent>) => {
      if (event.nativeEvent.error !== undefined) setFailed(event.nativeEvent.error);
      else feed(event.nativeEvent);
    },
    [feed],
  );

  // A new run each time the camera turns on.
  useEffect(() => {
    if (!running) return;
    engine.current = createScanRun();
    photoTask.current = null;
    finished.current = false;
    setView(scanRunView(engine.current));
    setPhotoSaved(false);
    setFailed(null);
  }, [running, id]);

  // The Simulator has no camera: the pretend face answers whatever the scan asks.
  useEffect(() => {
    if (!running || faceScanMode !== 'simulated') return;
    const face = createSimulatedFace();
    const timer = setInterval(() => feed(face(Date.now() / 1000, engine.current.stage, engine.current.step)), 1000 / SCAN.sampleHz);
    return () => clearInterval(timer);
  }, [running, id, feed]);

  useEffect(() => {
    if (!running || !photo || photoTask.current) return;
    if (view.stage !== 'hold' || view.step !== 0 || view.progress < SCAN.photoAt || view.issue) return;
    photoTask.current = takeScanPhoto(id)
      .then((name) => {
        setPhotoSaved(true);
        return name;
      })
      .catch(() => null);
  }, [running, photo, id, view]);

  useEffect(() => {
    if (view.stage !== 'done' || finished.current) return;
    finished.current = true;
    const readings = scanReadings(engine.current);
    (photoTask.current ?? Promise.resolve(null)).then((name) => onDoneRef.current(readings, name));
  }, [view.stage]);

  /** The scan was left before the end: its photo, if one was taken, is deleted. */
  const discard = useCallback(() => {
    finished.current = true;
    photoTask.current?.then((name) => (name ? deleteScanPhoto(name) : undefined)).catch(() => {});
    photoTask.current = null;
  }, []);

  return { view, onFace, photoSaved, failed, discard };
}
