import { MutableRefObject, useCallback } from 'react';
import type { fabric } from 'fabric';

export function useCanvas(canvas: MutableRefObject<fabric.Canvas>) {
  return useCallback((element: HTMLCanvasElement) => {
    if (!element) {
      return canvas.current?.dispose();
    }

    canvas.current = new window.fabric.Canvas(element);
  }, []);
}
