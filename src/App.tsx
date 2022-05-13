import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from 'fabric/fabric-impl';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField
} from '@mui/material';

import { annotator } from './annotator';

const CANVAS_ID = 'annotate-document';

function App() {
  const canvas = useRef<Canvas>();
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setOpen] = useState(false);

  function handleOpenDialog() {
    setOpen(true);
  }

  function handleCloseDialog() {
    setOpen(false);
  }

  useEffect(() => {
    const c = annotator(canvasContainerRef.current!, {
      openDialog: handleOpenDialog
    });
    canvas.current = c;
    console.log(c);
  }, []);

  return (
    <>
      <Grid container sx={{ minHeight: '100vh' }}>
        <Grid item md={8} ref={canvasContainerRef}>
          <canvas id={CANVAS_ID} />
        </Grid>
        <Grid item md={4}>
          Right
        </Grid>
      </Grid>
      <Dialog open={isOpen} onClose={handleCloseDialog}>
        <DialogTitle>Hello</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            id="testing-input"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleCloseDialog();
            }}
          >
            Delete
          </Button>
          <Button onClick={handleCloseDialog}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default App;
