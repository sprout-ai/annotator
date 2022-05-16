import React from 'react';

import { useCanvas } from './useCanvas';

interface CanvasProps {
  canvas: any;
}

export function Canvas({ canvas }: CanvasProps) {
  const canvasRef = useCanvas(canvas);

  return <canvas ref={canvasRef} />;
}
