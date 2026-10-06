import { requireOptionalNativeModule } from 'expo';

interface FaceRepDeviceCheck {
  getTokenAsync(): Promise<string | null>;
}

// The native side is the local module in modules/device-check. Missing on web, in Expo Go and in builds made before this module existed.
const native = requireOptionalNativeModule<FaceRepDeviceCheck>('FaceRepDeviceCheck');

/** A fresh Apple DeviceCheck token, or undefined when this device or build can't make one. */
export async function getDeviceCheckToken(): Promise<string | undefined> {
  try {
    return (await native?.getTokenAsync()) ?? undefined;
  } catch {
    return undefined;
  }
}
