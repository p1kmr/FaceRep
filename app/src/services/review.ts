import * as StoreReview from 'expo-store-review';

/** Apple's own rating sheet (Apple decides if it actually shows; never more than 3 times a year). */
export async function requestReview(): Promise<void> {
  try {
    if (await StoreReview.hasAction()) await StoreReview.requestReview();
  } catch {
    // Not available (web, simulator): ignore.
  }
}
