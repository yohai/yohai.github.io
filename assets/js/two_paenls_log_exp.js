const canvas1 = document.getElementById("canvas1");
const canvas2 = document.getElementById("canvas2");

function resizeCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}

resizeCanvas(canvas1);
resizeCanvas(canvas2);

const ctx1 = canvas1.getContext("2d");
const ctx2 = canvas2.getContext("2d");

// Update these after resizing
const width = canvas1.width;
const height = canvas1.height;
let center = { x: width / 2, y: height / 2 };
const radius = 8.5;
const scale = 30;

const intTicks = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6];
const intLabels = intTicks.map(n => n.toString());
const piTicks = [-2 * Math.PI, -Math.PI, 0, Math.PI, 2 * Math.PI];
const piLabels = ["-2π", "-π", "0", "π", "2π"];

let z = { x: 1, y: 1 };
function drawGrid(ctx, values, labels) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.save();

    // 1. Full-range grid lines at integer steps
    ctx.strokeStyle = "#eee";
    ctx.lineWidth = 1;
    ctx.beginPath();

    const xStart = -Math.ceil(center.x / scale);
    const xEnd = Math.ceil((ctx.canvas.width - center.x) / scale);
    for (let i = xStart; i <= xEnd; i++) {
        const x = center.x + i * scale;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ctx.canvas.height);
    }

    const yStart = -Math.ceil(center.y / scale);
    const yEnd = Math.ceil((ctx.canvas.height - center.y) / scale);
    for (let i = yStart; i <= yEnd; i++) {
        const y = center.y + i * scale;
        ctx.moveTo(0, y);
        ctx.lineTo(ctx.canvas.width, y);
    }

    ctx.stroke();

    // 2. Axes
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, center.y);
    ctx.lineTo(ctx.canvas.width, center.y);
    ctx.moveTo(center.x, 0);
    ctx.lineTo(center.x, ctx.canvas.height);
    ctx.stroke();

    // 3. Tick marks at given values
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < values.length; i++) {
        const x = center.x + values[i] * scale;
        ctx.moveTo(x, center.y - 5);
        ctx.lineTo(x, center.y + 5);

        const y = center.y + values[i] * scale;
        ctx.moveTo(center.x - 5, y);
        ctx.lineTo(center.x + 5, y);
    }
    ctx.stroke();

    // 4. Labels
    // X-axis labels (centered below tick)
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let i = 0; i < values.length; i++) {
        const x = center.x + values[i] * scale;
        if (Math.abs(values[i]) < 1e-6) continue;
        ctx.fillText(labels[i], x, center.y + 8);
    }

    // Y-axis labels (vertically centered)
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    for (let i = 0; i < values.length; i++) {
        const y = center.y - values[i] * scale;
        if (Math.abs(values[i]) < 1e-6) continue;
        ctx.fillText(labels[i], center.x + 8, y);
    }

    ctx.restore();
}


function toCanvasCoords(z) {
    return {
    x: center.x + z.x * scale,
    y: center.y - z.y * scale,
    };
}

function fromCanvasCoords(p) {
    return {
    x: (p.x - center.x) / scale,
    y: (center.y - p.y) / scale,
    };
}

function drawPoint(ctx, z, color = "red") {
    const p = toCanvasCoords(z);
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}

function expMap(z) {
    const r = Math.exp(z.x);
    return {
    x: r * Math.cos(z.y),
    y: r * Math.sin(z.y),
    };
}

function logMap(w) {
    const r = Math.sqrt(w.x * w.x + w.y * w.y);
    const theta = Math.atan2(w.y, w.x);
    return {
    x: Math.log(r),
    y: theta,
    };
}

function redraw() {
    // Recalculate center in case canvas size changed
    center = { x: canvas1.width / 2, y: canvas1.height / 2 };
    drawGrid(ctx2, intTicks, intLabels);
    drawGrid(ctx1, piTicks, piLabels);

    drawPoint(ctx1, z, "red");
    drawPoint(ctx2, expMap(z), "blue");
}

function isInsidePoint(p, z) {
    const zCanvas = toCanvasCoords(z);
    const dx = p.x - zCanvas.x;
    const dy = p.y - zCanvas.y;
    return dx * dx + dy * dy <= radius * radius;
}

let dragging = false;
let dragSource = null;

function setupDragging(canvas, getZ, setZ) {
    canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (isInsidePoint(mouse, getZ())) {
        dragging = true;
        dragSource = { canvas, setZ };
    }
    });

    canvas.addEventListener("mousemove", (e) => {
    if (!dragging || dragSource.canvas !== canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const value = fromCanvasCoords(mouse);
    dragSource.setZ(value);
    redraw();
    });

    canvas.addEventListener("mouseup", () => dragging = false);
    canvas.addEventListener("mouseleave", () => dragging = false);
}

setupDragging(canvas1,
    () => z,
    (value) => { z = value; });

setupDragging(canvas2,
    () => expMap(z),
    (value) => { z = logMap(value); });

window.addEventListener("resize", () => {
    resizeCanvas(canvas1);
    resizeCanvas(canvas2);
    redraw();
});

redraw();