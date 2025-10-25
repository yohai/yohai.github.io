const canvas1 = document.getElementById("canvas1sqrt");
const canvas2 = document.getElementById("canvas2sqrt");
const branchAngles ={
    mpi_pi: -Math.PI,
    mpi1_pi1: -Math.PI + 1,
    zero_2pi: 0
  }
const domainAngles ={
    mpi_pi: Math.PI/2,
    mpi1_pi1: -(-Math.PI + 1)/2,
    zero_2pi: 2 * Math.PI 
  }
const radius = 8.5;

// Parameters per canvas
const canvasParams = {
  canvas1: {
    canvas: canvas1,
    ctx: canvas1.getContext("2d"),
    ticks:  [-4, -3, -2, -1, 0, 1, 2, 3, 4],
    labels:  [-4, -3, -2, -1, 0, 1, 2, 3, 4].map(n => n.toString()),
    center: { x: 0, y: 0 },
    toCanvasCoords: null,
    fromCanvasCoords: null,
    logicalWidth: 2.1 * 2,
  },
  canvas2: {
    canvas: canvas2,
    ctx: canvas2.getContext("2d"),
    ticks:  [-4, -3, -2, -1, 0, 1, 2, 3, 4],
    labels:  [-4, -3, -2, -1, 0, 1, 2, 3, 4].map(n => n.toString()),
    center: { x: 0, y: 0 },
    toCanvasCoords: null,
    fromCanvasCoords: null,
    logicalWidth: 8.2  },
  gridMode: 'cartesian',
  sqrtMode: 'multivalued',
  thetaRange: 'mpi_pi',
};

// Shared state
let z = {
    x: 1.5,
    y: 0
};

function resizeCanvas(p) {
  const rect = p.canvas.getBoundingClientRect();
  p.canvas.width = rect.width;
  p.canvas.height = rect.height;
  p.center = { x: rect.width / 2, y: rect.height / 2 };
  p.scale = p.canvas.width / p.logicalWidth;

  p.toCanvasCoords = (z) => ({
    x: p.center.x + z.x * p.scale,
    y: p.center.y - z.y * p.scale
  });

  p.fromCanvasCoords = (pt) => ({
    x: (pt.x - p.center.x) / p.scale,
    y: (p.center.y - pt.y) / p.scale
  });
}

function drawPoint(p, z, color) {
  const pt = p.toCanvasCoords(z);
  const ctx = p.ctx;
  ctx.beginPath();
  ctx.arc(pt.x, pt.y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawBranchCut(){
  // Draw branch cut on canvas2
  const ctx2 = canvasParams.canvas2.ctx;
  ctx2.strokeStyle = "#008F00";
  ctx2.lineWidth = 6;
  ctx2.setLineDash([15, 3]);
  ctx2.beginPath();

  const origin = canvasParams.canvas2.toCanvasCoords({ x: 0, y: 0 });
  const angle = branchAngles[canvasParams.thetaRange];
  const pt = canvasParams.canvas2.toCanvasCoords({
    x: Math.cos(angle) * canvasParams.canvas2.logicalWidth * 2,
    y: Math.sin(angle) * canvasParams.canvas2.logicalWidth * 2,
  })
  ctx2.moveTo(origin.x, origin.y);
  ctx2.lineTo(pt.x, pt.y);
  ctx2.stroke();
  
  // Draw the available domain on canvas1
  const ctx1 = canvasParams.canvas1.ctx;
  ctx1.fillStyle = "#008F0022";
  ctx1.strokeStyle = "#008F00";
  ctx1.setLineDash([12, 3]);
  ctx1.lineWidth = 1;
  
  
  const origin1 = canvasParams.canvas1.toCanvasCoords({ x: 0, y: 0 });
  const big = 3*canvasParams.canvas1.canvas.width;
  const tcc = canvasParams.canvas1.toCanvasCoords;

  const domainAngle = domainAngles[canvasParams.thetaRange];
  ctx1.save();
  ctx1.translate(origin1.x, origin1.y);
  ctx1.rotate(domainAngle);
  ctx1.rect(-big, 0, 2 * big, -big);
  ctx1.fill();
  ctx1.stroke();
  ctx1.restore();

}

function squareMap(z) {
  return { x: z.x **2 - z.y ** 2, y: 2 * z.x * z.y };
}

function sqrtMap(w) {
  const r = Math.sqrt(Math.sqrt(w.x ** 2 + w.y ** 2));
  let theta = Math.atan2(w.y, w.x);
  switch (canvasParams.thetaRange) {
    case 'mpi_pi':
      break;
    case 'mpi1_pi1':
        if (theta < -Math.PI + 1) {
            theta += 2 * Math.PI;
        }
        break;
    case 'zero_2pi':
      if (theta < 0) { 
        theta += 2 * Math.PI;
        }
        break;
    }
  const proposed_z = { x: r * Math.cos(theta / 2), y: r * Math.sin(theta / 2) }
  if (canvasParams.sqrtMode === 'branchcut') {
    return proposed_z;
  } else if (canvasParams.sqrtMode === 'multivalued') {
    const d1 = Math.hypot(proposed_z.x - z.x, proposed_z.y - z.y);
    const d2 = Math.hypot(-proposed_z.x - z.x, -proposed_z.y - z.y);
    if (d1 < d2) {
      return proposed_z;
    } else {
      return { x: -proposed_z.x, y: -proposed_z.y };
    }
  }
}

function redraw() {
  resizeCanvas(canvasParams.canvas1);
  resizeCanvas(canvasParams.canvas2);
  drawGrid(canvasParams.canvas1);
  drawGrid(canvasParams.canvas2);
   if (canvasParams.sqrtMode === 'branchcut') {
    drawBranchCut();
  }
  drawPoint(canvasParams.canvas1, z, "red");
  drawPoint(canvasParams.canvas2, squareMap(z), "blue");
}

function isPointInCanvas(p, getZ, mouse) {
  const pt = p.toCanvasCoords(getZ());
  const dx = mouse.x - pt.x;
  const dy = mouse.y - pt.y;
  return dx * dx + dy * dy <= radius * radius;
}

function setupDragging(p, setZ) {
  const canvas = p.canvas;
  let dragging = false;

  function getMouse(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  canvas.addEventListener("mousedown", e => {
    const mouse = getMouse(e);
    dragging = true;
  });

  canvas.addEventListener("mousemove", e => {
    if (!dragging) return;
    const mouse = getMouse(e);
    const value = p.fromCanvasCoords(mouse);
    setZ(value);
    redraw();
  });

  canvas.addEventListener("mouseup", () => dragging = false);
  canvas.addEventListener("mouseleave", () => dragging = false);

  // Click support
  canvas.addEventListener("click", e => {
    const mouse = getMouse(e);
    const value = p.fromCanvasCoords(mouse);
    setZ(value);
    redraw();  
  });

  // Touch support
  canvas.addEventListener("touchstart", e => {
  e.preventDefault();  // important: prevent scrolling
  dragging = true;
  });

  canvas.addEventListener("touchmove", e => {
    if (!dragging) return;
    const touch = e.touches[0];
    const mouse = getMouse(touch);
    const value = p.fromCanvasCoords(mouse);
    setZ(value);
    redraw();
  });
  
  canvas.addEventListener("touchend", () => dragging = false);
  canvas.addEventListener("touchcancel", () => dragging = false);
}

setupDragging(canvasParams.canvas1, val => z = val);
setupDragging(canvasParams.canvas2, val => z = sqrtMap(val));

window.addEventListener("resize", redraw);
document.querySelectorAll('input[name="gridMode"]').forEach(radio => {
  radio.addEventListener("change", (e) => {
    canvasParams.gridMode = e.target.value;
    redraw();
  });
});

const thetaGroup = document.getElementById('theta-group-sqrt');
const thetaInputs = thetaGroup.querySelectorAll('input');
const thetaLabels = thetaGroup.querySelectorAll('label');

document.querySelectorAll('input[name="thetaRangeSqrt"]').forEach(radio => {
  radio.addEventListener("change", (e) => {
    canvasParams.thetaRange = e.target.value;
    redraw();
  });
});

document.querySelectorAll('input[name="sqrtMode"]').forEach(radio => {
  radio.addEventListener("change", (e) => {
    canvasParams.sqrtMode = e.target.value;

    if (canvasParams.sqrtMode === 'multivalued') {
      thetaInputs.forEach(input => input.disabled = true);
      thetaLabels.forEach(label => {
        label.classList.remove('btn-outline-success');
        label.classList.add('btn-outline-secondary', 'disabled');
      });
    } else {
      thetaInputs.forEach(input => input.disabled = false);
      thetaLabels.forEach(label => {
        label.classList.remove('btn-outline-secondary', 'disabled');
        label.classList.add('btn-outline-success');
      });
    }
    redraw();
  });
});
redraw();

/////////////////////////////////////////////
///////////// Grids, ticks, etc /////////////
/////////////////////////////////////////////

function drawGrid(p) {
  const ctx = p.ctx;
  ctx.clearRect(0, 0, p.canvas.width, p.canvas.height);
  ctx.save();

  // Light grid lines
  ctx.strokeStyle = "#aaa";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < p.ticks.length; i++) {
      const x = p.center.x + p.ticks[i] * p.scale;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, p.canvas.height);
      
      const y = p.center.y - p.ticks[i] * p.scale;
      ctx.moveTo(0, y);
      ctx.lineTo(p.canvas.width, y);
    }
  ctx.stroke();

  // Axes
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, p.center.y);
  ctx.lineTo(p.canvas.width, p.center.y);
  ctx.moveTo(p.center.x, 0);
  ctx.lineTo(p.center.x, p.canvas.height);
  ctx.stroke();

  drawTicks(p, ctx);
  ctx.restore();
}

function drawPolarGrid(p) {
  const ctx = p.ctx;
  ctx.clearRect(0, 0, p.canvas.width, p.canvas.height);
  ctx.save();

  // Radial circles
  ctx.strokeStyle = "#aaa";
  ctx.lineWidth = 1;

  const maxR = p.logicalWidth / 1.414;
  const step = 3;

  for (let r = step; r < maxR; r += step) {
    ctx.beginPath();
    ctx.arc(p.center.x, p.center.y, r*p.scale, 0, 2 * Math.PI);
    ctx.stroke();
  }

  // Radial lines
  for (let angle = 0; angle < 360; angle += 30) {
    const rad = angle * Math.PI / 180;
    const x = (p.center.x + Math.cos(rad) * maxR * p.scale);
    const y = (p.center.y - Math.sin(rad) * maxR * p.scale);
    ctx.beginPath();
    ctx.moveTo(p.center.x, p.center.y);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  // Axes
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, p.center.y);
  ctx.lineTo(p.canvas.width, p.center.y);
  ctx.moveTo(p.center.x, 0);
  ctx.lineTo(p.center.x, p.canvas.height);
  ctx.stroke();
    
  drawTicks(p, ctx);

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  for (let i = 0; i < p.ticks.length; i++) {
    const y = p.center.y - p.ticks[i] * p.scale;
    if (Math.abs(p.ticks[i]) < 1e-6) continue;
    ctx.fillText(p.labels[i], p.center.x + 8, y);
  }

  ctx.restore();
}

function drawTicks(p, ctx) {
    // Ticks
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < p.ticks.length; i++) {
    const x = p.center.x + p.ticks[i] * p.scale;
    ctx.moveTo(x, p.center.y - 5);
    ctx.lineTo(x, p.center.y + 5);

    const y = p.center.y - p.ticks[i] * p.scale;
    ctx.moveTo(p.center.x - 5, y);
    ctx.lineTo(p.center.x + 5, y);
  }
  ctx.stroke();

  // Labels
  ctx.fillStyle = "black";
  ctx.font = "12px Arial";

  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (let i = 0; i < p.ticks.length; i++) {
    const x = p.center.x + p.ticks[i] * p.scale;
    if (Math.abs(p.ticks[i]) < 1e-6) continue;
    ctx.fillText(p.labels[i], x, p.center.y + 8);
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  for (let i = 0; i < p.ticks.length; i++) {
    const y = p.center.y - p.ticks[i] * p.scale;
    if (Math.abs(p.ticks[i]) < 1e-6) continue;
    ctx.fillText(p.labels[i], p.center.x + 8, y);
  }
}