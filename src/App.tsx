import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Grid, Stack, TextField, Typography } from '@mui/material';
import { fabric } from 'fabric';

import { Canvas } from './Canvas';
import exampleImage from './example-paper.png';

const SCALE_STEP = 0.1;

function App() {
  const [count, setCount] = useState(0);
  const canvasRef = useRef<fabric.Canvas>();
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;

    function setCurrentDimensions() {
      canvas.setHeight(canvasContainerRef.current!.clientHeight - 32 || 0);
      canvas.setWidth(canvasContainerRef.current!.clientWidth - 32 || 0);
      canvas.renderAll();
    }

    function setBackgroundImage() {
      fabric.Image.fromURL(exampleImage, function (img) {
        img.scaleToWidth(canvasContainerRef.current!.clientWidth - 32);
        img.scaleToHeight(canvasContainerRef.current!.clientHeight - 32);
        img.set('selectable', false);

        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
          originX: 'left',
          originY: 'top'
        });
      });
    }

    function resizeCanvas() {
      setCurrentDimensions();
      setBackgroundImage();
    }

    setCurrentDimensions();
    setBackgroundImage();

    window.addEventListener('resize', resizeCanvas, false);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;

    canvas.on('mouse:wheel', function (opt) {
      const delta = opt.e.deltaY;
      let zoom = canvas.getZoom();

      zoom *= 0.999 ** delta;

      if (zoom > 20) {
        zoom = 20;
      }

      if (zoom < 0.01) {
        zoom = 0.01;
      }

      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);

      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    canvas.on('mouse:down', function (opt) {
      const event = opt.e;
      // @ts-ignore
      const _this = this;

      if (event.altKey) {
        _this.isDragging = true;
        _this.selection = false;
        _this.lastPosX = event.clientX;
        _this.lastPosY = event.clientY;
      }
    });

    canvas.on('mouse:move', function (opt) {
      // @ts-ignore
      const _this = this;

      if (_this.isDragging) {
        const event = opt.e;
        let vpt = _this.viewportTransform;
        vpt[4] += event.clientX - _this.lastPosX;
        vpt[5] += event.clientY - _this.lastPosY;
        _this.requestRenderAll();
        _this.lastPosX = event.clientX;
        _this.lastPosY = event.clientY;
      }
    });

    canvas.on('mouse:up', function (opt) {
      // on mouse up we want to recalculate new interaction
      // for all objects, so we call setViewportTransform
      // @ts-ignore
      const _this = this;
      _this.setViewportTransform(_this.viewportTransform);
      _this.isDragging = false;
      _this.selection = true;
    });
  }, []);

  function zoomIn() {
    const zoom = canvasRef.current?.getZoom();
    canvasRef.current?.setZoom(zoom! + SCALE_STEP);
  }

  function zoomOut() {
    const zoom = canvasRef.current?.getZoom();
    canvasRef.current?.setZoom(zoom! - SCALE_STEP);
  }

  function addBox() {
    const maxWidth = canvasContainerRef.current?.clientWidth;
    const maxHeight = canvasContainerRef.current?.clientHeight;

    canvasRef.current
      ?.getObjects()
      .forEach((obj) => canvasRef.current?.remove(obj));

    for (let i = 0; i < count; i++) {
      canvasRef.current?.add(
        new fabric.Rect({
          top: Math.floor(Math.random() * (maxHeight! - 20)),
          left: Math.floor(Math.random() * (maxWidth! - 100)),
          width: 100,
          height: 20,
          fill: 'transparent',
          selectable: false,
          stroke: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
          strokeWidth: 1
        })
      );
    }
  }

  return (
    <Grid container sx={{ minHeight: '100vh' }}>
      <Grid item md={8}>
        <Box
          ref={canvasContainerRef}
          sx={{
            borderRightColor: ({ palette }) => palette.grey[300],
            borderRightStyle: 'solid',
            borderRightWidth: 1,
            height: 1,
            padding: 2,
            width: 1
          }}
        >
          <Canvas canvas={canvasRef} />
        </Box>
      </Grid>
      <Grid item md={4}>
        <Box sx={{ padding: 2 }}>
          <Stack spacing={2}>
            <Typography variant="body1">
              Hold [Alt] Key to drag the document around.
            </Typography>
            <Typography variant="body1">
              Use the mouse wheel to zoom in and out.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button onClick={zoomOut} variant="outlined">
                Zoom Out
              </Button>
              <Button onClick={zoomIn} variant="outlined">
                Zoom In
              </Button>
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                id="numOfBoxes"
                label="No. of Bounding Boxes"
                type="number"
                value={count}
                variant="outlined"
                onChange={(event) => setCount(Number(event.target.value))}
              />
              <Button onClick={addBox} variant="outlined">
                Add Box
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Grid>
    </Grid>
  );
}

export default App;
