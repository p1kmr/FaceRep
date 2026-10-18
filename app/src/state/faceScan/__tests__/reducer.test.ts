import type { FaceScan } from '@/services/faceScan/scansRepo';

import { hydrateFaceScans, resetFaceScans, scanAdded, scanDeleted, scanPhotoRemoved } from '../actions';
import { faceScanReducer, initialFaceScanState } from '../reducer';
import { selectFreeScansLeft, selectPhotoScans, selectScanDue, selectScoredScans } from '../selectors';

const scan = (id: string, takenAt: string, photo: string | null = null): FaceScan => ({
  id,
  takenAt,
  day: takenAt.slice(0, 10),
  moves: { smile: { l: 0.45, r: 0.36 }, lipPucker: { c: 0.45 }, cheekPuff: { c: 0.35 }, eyeSquint: { l: 0.35, r: 0.35 } },
  photo,
});

describe('faceScanReducer', () => {
  it('hydrates newest first and never counts fewer used than saved', () => {
    const st = faceScanReducer(initialFaceScanState, hydrateFaceScans([scan('a', '2026-10-01T10:00:00Z'), scan('b', '2026-10-08T10:00:00Z')], 1));
    expect(st.hydrated).toBe(true);
    expect(st.scans.map((s) => s.id)).toEqual(['b', 'a']);
    expect(st.used).toBe(2);
    expect(faceScanReducer(initialFaceScanState, hydrateFaceScans([], -3)).used).toBe(0);
  });

  it('adds a scan once and counts it; deleting it keeps the count', () => {
    let st = faceScanReducer(initialFaceScanState, hydrateFaceScans([], 0));
    st = faceScanReducer(st, scanAdded(scan('a', '2026-10-01T10:00:00Z', 'a.jpg')));
    expect(faceScanReducer(st, scanAdded(scan('a', '2026-10-01T10:00:00Z')))).toBe(st);
    st = faceScanReducer(st, scanAdded(scan('b', '2026-10-08T10:00:00Z', 'b.jpg')));
    expect(st.scans.map((s) => s.id)).toEqual(['b', 'a']);
    expect(st.used).toBe(2);
    st = faceScanReducer(st, scanDeleted('b'));
    expect(st.scans.map((s) => s.id)).toEqual(['a']);
    expect(st.used).toBe(2);
  });

  it('forgets one photo or every photo, and resets like a new install', () => {
    let st = faceScanReducer(initialFaceScanState, hydrateFaceScans([scan('a', '2026-10-01T10:00:00Z', 'a.jpg'), scan('b', '2026-10-08T10:00:00Z', 'b.jpg')], 2));
    st = faceScanReducer(st, scanPhotoRemoved('a'));
    expect(st.scans.map((s) => s.photo)).toEqual(['b.jpg', null]);
    expect(selectPhotoScans(st).map((s) => s.id)).toEqual(['b']);
    st = faceScanReducer(st, scanPhotoRemoved(null));
    expect(st.scans.every((s) => s.photo === null)).toBe(true);
    expect(faceScanReducer(st, resetFaceScans())).toEqual({ hydrated: true, scans: [], used: 0 });
  });
});

describe('face scan selectors', () => {
  const st = (used: number, scans: FaceScan[] = []) => ({ hydrated: true, scans, used });

  it('counts the free scans left; Premium has no limit', () => {
    expect(selectFreeScansLeft(st(0), false)).toBe(3);
    expect(selectFreeScansLeft(st(2), false)).toBe(1);
    expect(selectFreeScansLeft(st(5), false)).toBe(0);
    expect(selectFreeScansLeft(st(5), true)).toBe(Infinity);
  });

  it('is due with no scan yet, or a week after the last one', () => {
    expect(selectScanDue(st(0), '2026-10-19')).toBe(true);
    const last = [scan('a', '2026-10-12T10:00:00Z')];
    expect(selectScanDue(st(1, last), '2026-10-18')).toBe(false);
    expect(selectScanDue(st(1, last), '2026-10-19')).toBe(true);
  });

  it('scores every scan', () => {
    const [s] = selectScoredScans(st(1, [scan('a', '2026-10-12T10:00:00Z')]));
    expect(s.score.movement).toBe(49); // (45 + 50 + 50 + 50) / 4
    expect(s.score.balance).toBe(90);
  });
});
