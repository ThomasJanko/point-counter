import { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardEvent, Platform, View } from 'react-native';

/**
 * How many dp of the given view are covered by the software keyboard.
 *
 * Why not rely on android:windowSoftInputMode="adjustResize"? Since the app
 * targets SDK 35+, Android 15+ enforces edge-to-edge and adjustResize no
 * longer shrinks the window: the keyboard is simply drawn over the app. On
 * older Android versions adjustResize still works. Measuring the real
 * overlap (view bottom vs keyboard top) covers both cases — when the
 * window was resized the overlap is 0 and no extra padding is added, so
 * nothing is applied twice.
 *
 * Usage: put the returned ref + onLayout on the screen root and add the
 * returned value as paddingBottom on it.
 */
export function useKeyboardOverlap() {
  const viewRef = useRef<View>(null);
  const keyboardTopRef = useRef<number | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [overlap, setOverlap] = useState(0);

  const recompute = useCallback(() => {
    const kbTop = keyboardTopRef.current;
    if (kbTop === null) {
      setOverlap(0);
      return;
    }
    viewRef.current?.measureInWindow((_x, y, _w, h) => {
      // Re-check: the keyboard may have closed while we were measuring.
      if (keyboardTopRef.current === null) return;
      const next = Math.max(0, Math.round(y + h - kbTop));
      setOverlap(prev => (Math.abs(prev - next) < 2 ? prev : next));
    });
  }, []);

  useEffect(() => {
    const onShow = (e: KeyboardEvent) => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
      keyboardTopRef.current = e.endCoordinates.screenY;
      recompute();
    };
    const onHide = () => {
      // Moving focus from one cell to the next unmounts one TextInput and
      // mounts another; on some Android devices the keyboard briefly reports
      // "hidden" in between. Debounce so the table doesn't jump.
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => {
        hideTimer.current = null;
        keyboardTopRef.current = null;
        setOverlap(0);
      }, 120);
    };

    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const subs = [
      Keyboard.addListener(showEvt, onShow),
      Keyboard.addListener(hideEvt, onHide),
      // iOS: keyboard height can change (QuickType bar, emoji...).
      ...(Platform.OS === 'ios' ? [Keyboard.addListener('keyboardWillChangeFrame', onShow)] : []),
    ];
    return () => {
      subs.forEach(s => s.remove());
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [recompute]);

  // Re-measure whenever the root re-lays out: on devices where adjustResize
  // still works, the window shrinks a moment after the keyboard event, and
  // this brings the overlap back to 0 instead of double-padding.
  const onLayout = useCallback(() => {
    if (keyboardTopRef.current !== null) recompute();
  }, [recompute]);

  return { viewRef, onLayout, keyboardOverlap: overlap };
}
