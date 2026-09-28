/**
 * Pure permission state machine for the video call screen (WU5 / D-03).
 *
 * Extracted from the component so the decision is testable without mounting
 * `expo-camera` or rendering anything. The component owns the imperative
 * `requestPermission()` calls; this module only decides what the screen shows.
 */

export type CallPermissionState = 'loading' | 'granted' | 'denied';

export interface PermissionSnapshot {
  /** `useCameraPermissions()` has not resolved yet. */
  cameraLoading: boolean;
  cameraGranted: boolean;
  /** `useMicrophonePermissions()` has not resolved yet. */
  micLoading: boolean;
  micGranted: boolean;
}

/**
 * A video consult needs BOTH camera and microphone: the embedded LiveKit room
 * negotiates an audio and a video track separately, and a partial grant renders
 * a room the user cannot actually use.
 *
 * Still-loading is distinct from denied so the screen does not flash the
 * "permission denied" panel during the first frames, before the OS has even
 * answered.
 */
export function evaluateCallPermissions(snapshot: PermissionSnapshot): CallPermissionState {
  if (snapshot.cameraLoading || snapshot.micLoading) return 'loading';
  return snapshot.cameraGranted && snapshot.micGranted ? 'granted' : 'denied';
}
