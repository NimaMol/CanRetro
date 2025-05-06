const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const RESIZE_HANDLE_SIZE = 8;
let selectedShape = null;
let resizing = false;
let resizeHandle = null;
let shapes = [];
let currentColor = '#000000'; // Default stroke color
let currentFillColor = 'transparent'; // Default fill color
let mode = 'draw'; // 'draw', 'select', 'text'
let currentShape = 'circle'; // Default shape to draw

// Draw all shapes on the canvas
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  for (const shape of shapes) {
    ctx.beginPath();
    ctx.strokeStyle = shape.color || currentColor;
    ctx.fillStyle = shape.fill || currentFillColor;
    
    if (shape.type === "circle") {
      ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      drawResizeHandle(shape); // Draw resize handle for circle
    } else if (shape.type === "rect") {
      ctx.rect(shape.x, shape.y, shape.width, shape.height);
      ctx.fill();
      ctx.stroke();
      drawResizeHandle(shape); // Draw resize handle for rectangle
    } else if (shape.type === "text") {
      ctx.fillText(shape.text, shape.x, shape.y);
    }
  }
}

// Draw resize handle at the bottom-right corner of the shape
function drawResizeHandle(shape) {
  ctx.beginPath();
  ctx.rect(shape.x + shape.width - RESIZE_HANDLE_SIZE, shape.y + shape.height - RESIZE_HANDLE_SIZE, RESIZE_HANDLE_SIZE, RESIZE_HANDLE_SIZE);
  ctx.fillStyle = 'black';
  ctx.fill();
}

// Detect if mouse is over a shape
function getShapeAt(x, y) {
  return shapes.find(s => {
    if (s.type === "circle") {
      return Math.hypot(s.x - x, s.y - y) < s.radius;
    } else if (s.type === "rect") {
      return x >= s.x && x <= s.x + s.width && y >= s.y && y <= s.y + s.height;
    } else if (s.type === "text") {
      return x >= s.x && x <= s.x + ctx.measureText(s.text).width && y >= s.y - 16 && y <= s.y;
    }
    return false;
  });
}

// Check if the mouse is over the resize handle
function isOverResizeHandle(x, y, shape) {
  return (
    x >= shape.x + shape.width - RESIZE_HANDLE_SIZE &&
    x <= shape.x + shape.width &&
    y >= shape.y + shape.height - RESIZE_HANDLE_SIZE &&
    y <= shape.y + shape.height
  );
}

// Mouse event listeners for drawing, selecting, and resizing
canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (mode === "draw" || mode === "text") {
    if (currentShape === "circle") {
      shapes.push({
        type: "circle",
        x: x,
        y: y,
        radius: 0,
        color: currentColor,
        fill: currentFillColor
      });
    } else if (currentShape === "rect") {
      shapes.push({
        type: "rect",
        x: x,
        y: y,
        width: 0,
        height: 0,
        color: currentColor,
        fill: currentFillColor
      });
    }
  } else if (mode === "select") {
    const shape = getShapeAt(x, y);
    if (shape) {
      selectedShape = shape;
      if (isOverResizeHandle(x, y, shape)) {
        resizing = true;
        resizeHandle = "bottom-right";
      }
    } else {
      selectedShape = null;
    }
  }
});

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (resizing && selectedShape) {
    // Resize logic
    if (selectedShape.type === "rect") {
      selectedShape.width = x - selectedShape.x;
      selectedShape.height = y - selectedShape.y;
    } else if (selectedShape.type === "circle") {
      selectedShape.radius = Math.hypot(x - selectedShape.x, y - selectedShape.y);
    }
    draw();
  } else if (selectedShape && mode === "select") {
    // Moving the selected shape logic
    selectedShape.x = x;
    selectedShape.y = y;
    draw();
  }
});

canvas.addEventListener("mouseup", () => {
  resizing = false;
  resizeHandle = null;
});

// Toolbar buttons and color picker
document.getElementById('drawCircle').addEventListener('click', () => {
  currentShape = 'circle';
  mode = 'draw';
});
document.getElementById('drawRect').addEventListener('click', () => {
  currentShape = 'rect';
  mode = 'draw';
});
document.getElementById('selectShape').addEventListener('click', () => {
  mode = 'select';
});
document.getElementById('addText').addEventListener('click', () => {
  mode = 'text';
  canvas.addEventListener("mousedown", (e) => {
    if (mode === "text") {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const text = prompt("Enter your text:");
      if (text) {
        shapes.push({
          type: "text",
          x: x,
          y: y,
          text: text,
          color: currentColor
        });
        draw();
      }
    }
  });
});

// Color picker for line color
document.getElementById('colorPicker').addEventListener('input', (e) => {
  currentColor = e.target.value;
});

// Clear canvas button
document.getElementById('clearCanvas').addEventListener('click', () => {
  shapes = [];
  draw();
});

// Initial draw
draw();
