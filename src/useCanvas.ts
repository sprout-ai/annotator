import { MutableRefObject, useCallback } from 'react';
import { fabric } from 'fabric-pure-browser';

export function useCanvas(canvas: MutableRefObject<fabric.Canvas>) {
  return useCallback((element: HTMLCanvasElement) => {
    if (!element) {
      return canvas.current?.dispose();
    }

    canvas.current = new fabric.Canvas(element, { backgroundColor: '#eee' });
  }, []);
}
