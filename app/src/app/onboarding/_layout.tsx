import { Stack } from 'expo-router';

// First run: welcome → guide (only with two picture sets) → goal → (tabs). Safety lives in Settings and the workout player.
export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
