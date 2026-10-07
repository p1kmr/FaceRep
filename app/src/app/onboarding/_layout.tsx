import { Stack } from 'expo-router';

// First run: welcome → guide (only with two picture sets) → goal → safety → reminder → (tabs)
export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
