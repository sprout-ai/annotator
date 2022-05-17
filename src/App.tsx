import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Grid, Stack, TextField, Typography } from '@mui/material';
import { fabric } from 'fabric';

import { Canvas } from './Canvas';
import exampleImage from './example-paper.png';

const SCALE_STEP = 0.1;
const PADDING = 32; // 2 x 8 x 2 (default padding for mui is 8 and both sides)

function App() {
  const [count, setCount] = useState(0);
  const canvasRef = useRef<fabric.Canvas>();
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const documentWidth = useRef<number>();
  const documentHeight = useRef<number>();

  // display document and resize canvas
  useEffect(() => {
    const canvas = canvasRef.current!;

    function setCurrentDimensions() {
      canvas.setHeight(canvasContainerRef.current!.clientHeight - PADDING || 0);
      canvas.setWidth(canvasContainerRef.current!.clientWidth - PADDING || 0);
      canvas.renderAll();
    }

    function setBackgroundImage() {
      fabric.Image.fromURL(exampleImage, function (img) {
        img.scaleToWidth(canvasContainerRef.current!.clientWidth - PADDING);
        img.scaleToHeight(canvasContainerRef.current!.clientHeight - PADDING);
        img.set('selectable', false);

        if (img) {
          // get size of scaled document and resize canvas dimensions
          // @ts-ignore
          const adjustedWidth = img.width * img.scaleX;
          // @ts-ignore
          const adjustedHeight = img.height * img.scaleY;
          documentWidth.current = adjustedWidth;
          documentHeight.current = adjustedHeight;

          canvas.setDimensions({
            width: adjustedWidth,
            height: adjustedHeight
          });
        }

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

      if (zoom > 5) {
        zoom = 5;
      }

      if (zoom < 0.5) {
        zoom = 0.5;
      }

      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);

      opt.e.preventDefault();
      opt.e.stopPropagation();

      // @ts-ignore
      const _this = this;
      const vpt = _this.viewportTransform;
      const maxPanWidth = documentWidth.current!;
      const maxPanHeight = documentHeight.current!;

      if (zoom < maxPanHeight / maxPanHeight) {
        vpt[4] = maxPanWidth / 2 - (maxPanWidth * zoom) / 2;
        vpt[5] = maxPanHeight / 2 - (maxPanHeight * zoom) / 2;
      } else {
        if (vpt[4] >= 0) {
          vpt[4] = 0;
        } else if (vpt[4] < canvas.getWidth() - maxPanWidth * zoom) {
          vpt[4] = canvas.getWidth() - maxPanWidth * zoom;
        }
        if (vpt[5] >= 0) {
          vpt[5] = 0;
        } else if (vpt[5] < canvas.getHeight() - maxPanHeight * zoom) {
          vpt[5] = canvas.getHeight() - maxPanHeight * zoom;
        }
      }
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
    const maxWidth = documentWidth.current!;
    const maxHeight = documentHeight.current!;

    canvasRef.current
      ?.getObjects()
      .forEach((obj) => canvasRef.current?.remove(obj));

    for (let i = 0; i < count; i++) {
      const rect = new fabric.Rect({
        top: Math.floor(Math.random() * (maxHeight! - 20)),
        left: Math.floor(Math.random() * (maxWidth! - 100)),
        width: 100,
        height: 20,
        fill: 'transparent',
        selectable: false,
        stroke: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        strokeWidth: 1
      });
      canvasRef.current?.add(rect);
    }

    canvasRef.current?.renderAll();
  }

  return (
    <Grid container sx={{ minHeight: '100vh' }}>
      <Grid item md={8}>
        <Box
          ref={canvasContainerRef}
          sx={{
            backgroundColor: ({ palette }) => palette.grey[100],
            borderRightColor: ({ palette }) => palette.grey[300],
            borderRightStyle: 'solid',
            borderRightWidth: 1,
            display: 'flex',
            justifyContent: 'center',
            height: 1,
            padding: 2
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
