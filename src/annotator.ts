import { fabric } from 'fabric-pure-browser';
import exampleImage from './example.png';
import { IEvent } from 'fabric/fabric-impl';

export function annotator(
  element: HTMLElement,
  { openDialog }: { openDialog: VoidFunction }
): fabric.Canvas {
  const canvas = new fabric.Canvas('annotate-document');
  const { height, width } = element.getBoundingClientRect();

  fabric.Image.fromURL(exampleImage, function (img) {
    img.scaleToWidth(width);
    img.scaleToHeight(height);
    img.set('selectable', false);
    canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
      originX: 'left',
      originY: 'top'
    });
  });

  canvas.setDimensions({ height, width });

  function getNewBoundingBox() {
    let newXMin = Math.max(0, Math.min(canvas.width!, xmin));
    let newXMax = Math.max(0, Math.min(canvas!.width!, xmax));
    let newYMin = Math.max(0, Math.min(canvas!.height!, ymin));
    let newYMax = Math.max(0, Math.min(canvas!.height!, ymax));

    if (newXMin > newXMax) {
      const x = [newXMax, newXMin];
      newXMin = x[0];
      newXMax = x[1];
    }

    if (newYMin > newYMax) {
      const y = [newYMax, newYMin];
      newYMin = y[0];
      newYMax = y[1];
    }
    return { xmin: newXMin, xmax: newXMax, ymin: newYMin, ymax: newYMax };
  }

  function newRectangle(e: {
    data: any;
    top: number;
    left: number;
    width: number;
    height: number;
    stroke: string;
    strokeWidth: number;
  }) {
    return new fabric.Rect(
      Object.assign(
        {
          cornerColor: '#16abff',
          fill: 'transparent',
          lockRotation: false,
          noScaleCache: false
        },
        e
      )
    );
  }

  function stackObjects() {
    canvas
      .getObjects()
      .sort(
        (e, t) =>
          t.getScaledHeight() * t.getScaledWidth() -
          e.getScaledHeight() * e.getScaledWidth()
      )
      .forEach(function (e, t) {
        e.moveTo(t);
      });
    canvas.requestRenderAll();
  }

  function removeEmptyObjects() {
    const e = canvas;
    let t = !1;
    e.forEachObject(function (n) {
      // @ts-ignore
      if (n.data && 'annotation' === n.data.type && !n.label) {
        e.remove(n);
        t = !0;
      }
    });
    // t &&
    // (a.props.appStore.openAlert({
    //   message: 'Removed objects without label',
    //   level: 'info'
    // }),
    canvas.requestRenderAll();
  }

  function addField() {
    const bBox = getNewBoundingBox();
    const left = bBox.xmin;
    const top = bBox.ymin;
    const width = bBox.xmax - left;
    const height = bBox.ymax - top;
    // r = getBoundingBoxText(e).text,
    // s = 1 === props.labels.length ? props.labels[0] : '',
    // l = On()(),
    const rect = newRectangle({
      top,
      left,
      width,
      height,
      stroke: '#ffc107',
      strokeWidth: 1,
      data: { id: 'test-rect' }
      // label: s,
      // ocr_text: r,
      // fileId: props.fileId,
      // pageIndex: props.pageIndex,
      // data: { id: l, type: 'annotation' }
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    openDialog();
    stackObjects();
    // if (s) {
    //   var d = getOriginalBoundingBox(bBox),
    //     u = (0, j.Z)(
    //       (0, j.Z)({}, d),
    //       {},
    //       {
    //         id: l,
    //         fileId: props.fileId,
    //         label: s,
    //         ocr_text: r,
    //         status: 'moderated',
    //         score: 1
    //       }
    //     );
    //   props.updateObject('add', u);
    // }
  }

  function addObject() {
    addField();
  }

  function isNearBorder(e: IEvent<MouseEvent>) {
    const target = e.target!;
    const pointer = target.getLocalPointer(e.e);

    return (
      Math.abs(pointer.x) < 4 ||
      Math.abs(pointer.y) < 4 ||
      Math.abs(pointer.x - target.getScaledWidth()) < 4 ||
      Math.abs(pointer.y - target.getScaledHeight()) < 4
    );
  }

  function openBoundingBoxDialog() {}

  let isDrawing = false;
  let xmin = 0;
  let xmax = 0;
  let ymin = 0;
  let ymax = 0;

  canvas.on('mouse:down', (e) => {
    isDrawing = true;

    const target = e.target;
    const pointer = canvas.getPointer(e.e);
    const { x, y } = pointer;
    xmin = x;
    ymin = y;

    // TODO: remove empty objects
    if (
      null === target ||
      (target && target.data && 'roi' === target.data.type)
    ) {
      removeEmptyObjects();
    }
  });

  canvas.on('mouse:move', (e) => {
    const target = e.target;

    if (target?.type === 'rect') {
      const i = isNearBorder(e);
      // canvas.getActiveObject() === target
      //   ? (target.hoverCursor = 'move')
      //   : (target.hoverCursor = i ? 'pointer' : 'default');
    }
  });

  canvas.on('mouse:up', (e) => {
    const origIsDrawing = isDrawing;
    isDrawing = false;
    let n;
    let i;
    let o;
    let r;
    const target = e.target!;
    const pointer = canvas.getPointer(e.e, !0);
    const x = pointer.x;
    const y = pointer.y;
    xmax = x;
    ymax = y;
    if (xmin === xmax && ymin === ymax) {
      if (null === target) {
        // props.closeBoundingBoxDialog(),
        //   props.updateCurrent(ma);
      } else if (
        'rect' === target.type &&
        'roi' === (null === (n = target.data) || void 0 === n ? void 0 : n.type)
      ) {
        if (isNearBorder(e)) {
          // props.openBoundingBoxDialog()
          canvas.setActiveObject(target);
        } else {
          // props.closeBoundingBoxDialog()
          //   props.updateCurrent(ma)
          canvas.discardActiveObject();
        }
        canvas.requestRenderAll();
      } else {
        (('rect' === target.type &&
          'annotation' ===
            (null === (i = target.data) || void 0 === i ? void 0 : i.type)) ||
          ('rect' === target.type &&
            'cell' ===
              (null === (o = target.data) || void 0 === o ? void 0 : o.type)) ||
          ('rect' === target.type &&
            'table' ===
              (null === (r = target.data) || void 0 === r
                ? void 0
                : r.type))) &&
          openBoundingBoxDialog();
      }
    } else if (xmin !== xmax && ymin !== ymax && origIsDrawing) {
      return addObject();
    }
  });

  canvas.on('object:scaling', (e) => {
    const target = e.target;
    isDrawing = false;
  });

  canvas.on('object:moving', (e) => {
    const target = e.target;
    isDrawing = false;
  });

  canvas.on('object:rotating', (e) => {
    const target = e.target;
    isDrawing = false;
  });

  canvas.on('mouse:wheel', (opt) => {
    const delta = opt.e.deltaY;
    let zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    canvas.setZoom(zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
  });

  // canvas.on('mouse:down', ({ e }) => {
  //   if (canvas.getActiveObject()) {
  //     return false;
  //   }
  //
  //   const pointer = canvas.getPointer(e);
  //   isDrawing = true;
  //   origX = pointer.x;
  //   origY = pointer.y;
  //
  //   const rect = new fabric.Rect({
  //     fill: 'transparent'
  //   });
  //
  //   canvas.setActiveObject(rect);
  //   canvas.add(rect);
  //   canvas.renderAll();
  // });
  //
  // canvas.on('mouse:move', ({ e }) => {
  //   if (!isDrawing) {
  //     return false;
  //   }
  // });
  //
  // canvas.on('mouse:up', ({ e }) => {
  //   if (isDrawing) {
  //     isDrawing = false;
  //   }
  //
  //   const pointer = canvas.getPointer(e);
  //   const rect = canvas.getActiveObject();
  //   const left = Math.min(pointer.x, origX);
  //   const top = Math.min(pointer.y, origY);
  //   const height = Math.abs(pointer.y - origY);
  //   const width = Math.abs(pointer.x - origX);
  //
  //   rect.set({
  //     height,
  //     left,
  //     stroke: '#ffc107',
  //     strokeWidth: 1,
  //     top,
  //     width
  //   });
  //
  //   // const rect = new fabric.Rect({
  //   //   fill: 'transparent',
  //   //   height,
  //   //   left,
  //   //   stroke: '#ffc107',
  //   //   strokeWidth: 1,
  //   //   top,
  //   //   width
  //   // });
  //
  //   // if user has accidentally left clicked mouse then don't add a rect
  //   if (origX === pointer.x && origY === pointer.y) {
  //     canvas.remove(rect);
  //   } else {
  //     canvas.add(rect);
  //     origX = 0;
  //     origY = 0;
  //   }
  //
  //   canvas.renderAll();
  // });

  return canvas;
}
