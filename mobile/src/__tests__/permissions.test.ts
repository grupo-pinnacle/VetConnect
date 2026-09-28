import { evaluateCallPermissions } from '../lib/callPermissions';

/**
 * Exercises the real production helper in `src/lib/callPermissions.ts`. The
 * previous version of this file defined its own `checkPermissions` arrow
 * function inside the `it()` body and asserted on that local function.
 */
describe('video call permission state machine', () => {
  const granted = { cameraLoading: false, cameraGranted: true, micLoading: false, micGranted: true };

  it('reports granted only when camera AND microphone are both granted', () => {
    expect(evaluateCallPermissions(granted)).toBe('granted');
  });

  it('reports denied when only the camera is granted', () => {
    expect(evaluateCallPermissions({ ...granted, micGranted: false })).toBe('denied');
  });

  it('reports denied when only the microphone is granted', () => {
    expect(evaluateCallPermissions({ ...granted, cameraGranted: false })).toBe('denied');
  });

  it('reports denied when both are denied', () => {
    expect(
      evaluateCallPermissions({
        cameraLoading: false,
        cameraGranted: false,
        micLoading: false,
        micGranted: false,
      })
    ).toBe('denied');
  });

  it('reports loading while the camera hook has not resolved', () => {
    expect(evaluateCallPermissions({ ...granted, cameraLoading: true, cameraGranted: false })).toBe(
      'loading'
    );
  });

  it('reports loading while the microphone hook has not resolved', () => {
    expect(evaluateCallPermissions({ ...granted, micLoading: true, micGranted: false })).toBe(
      'loading'
    );
  });

  it('never reports denied before both hooks have answered', () => {
    // Guards the flash of the "permission denied" panel on the first frames.
    expect(
      evaluateCallPermissions({
        cameraLoading: true,
        cameraGranted: false,
        micLoading: true,
        micGranted: false,
      })
    ).toBe('loading');
  });
});
