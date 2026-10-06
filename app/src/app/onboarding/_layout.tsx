import { Stack } from 'expo-router';

// First run: welcome → goal → safety → reminder → (tabs)
export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
