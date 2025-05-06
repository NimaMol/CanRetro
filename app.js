const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const shapes = [];
let selectedShape = null;
let mode = "draw";
let currentColor = "#000000";
let isDrawingText = false;

function setMode(m) {
  mode = m;
  selectedShape = null;
  draw();
}

function changeColor(color) {
  currentColor = color;
}

function addText() {
  isDrawingText = true;
  setMode('select'); // Ensure we can select the shape after drawing
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  for (const shape of shapes) {
    ctx.beginPath();
    ctx.strokeStyle = shape.color || currentColor;
    ctx.fillStyle = shape.fill || "transparent";
    
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
    }
  }
}

function drawResizeHandle(shape) {
  // Draw a resize handle at the bottom-right corner
  ctx.beginPath();
  ctx.rect(shape.x + shape.width - RESIZE_HANDLE_SIZE, shape.y + shape.height - RESIZE_HANDLE_SIZE, RESIZE_HANDLE_SIZE, RESIZE_HANDLE_SIZE);
  ctx.fillStyle = 'black';
  ctx.fill();
}

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

canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (mode === "select") {
    const shape = getShapeAt(x, y);
    if (shape) {
      selectedShape = shape;
      if (isOverResizeHandle(x, y, shape)) {
        resizing = true;
        resizeHandle = "bottom-right";  // Start resizing from the bottom-right corner
      }
    } else {
      selectedShape = null;
    }
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (resizing && selectedShape) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedShape.type === "rect" || selectedShape.type === "circle") {
      // Resize the selected shape
      if (selectedShape.type === "rect") {
        selectedShape.width = x - selectedShape.x;
        selectedShape.height = y - selectedShape.y;
      } else if (selectedShape.type === "circle") {
        selectedShape.radius = Math.hypot(x - selectedShape.x, y - selectedShape.y);
      }
    }
    draw();  // Redraw canvas after resizing
  }
});

canvas.addEventListener("mouseup", () => {
  resizing = false;
  resizeHandle = null;
});

canvas.addEventListener("mouseup", () => {
  selectedShape = null;
});

function deleteSelected() {
  if (selectedShape) {
    const index = shapes.indexOf(selectedShape);
    shapes.splice(index, 1);
    selectedShape = null;
    draw();
  }
}

function exportShapes() {
  const data = JSON.stringify(shapes);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "diagram.json";
  a.click();
}

function importShapes(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const imported = JSON.parse(e.target.result);
    shapes.length = 0;
    for (const shape of imported) {
      shapes.push(shape);
    }
    draw();
  };
  reader.readAsText(file);
}

// Add text on click
canvas.addEventListener("click", (e) => {
  if (isDrawingText) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const text = prompt("Enter text for the shape:");
    if (text) {
      shapes.push({ type: "text", x, y, text, color: currentColor });
      draw();
    }
    isDrawingText = false; // Stop adding text
  }

  function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  for (const shape of shapes) {
    ctx.beginPath();
    ctx.strokeStyle = shape.color || currentColor;
    ctx.fillStyle = shape.fill || "transparent";
    
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
    }
  }
}

function drawResizeHandle(shape) {
  // Draw a resize handle at the bottom-right corner
  ctx.beginPath();
  ctx.rect(shape.x + shape.width - RESIZE_HANDLE_SIZE, shape.y + shape.height - RESIZE_HANDLE_SIZE, RESIZE_HANDLE_SIZE, RESIZE_HANDLE_SIZE);
  ctx.fillStyle = 'black';
  ctx.fill();
}
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

function isOverResizeHandle(x, y, shape) {
  return (
    x >= shape.x + shape.width - RESIZE_HANDLE_SIZE &&
    x <= shape.x + shape.width &&
    y >= shape.y + shape.height - RESIZE_HANDLE_SIZE &&
    y <= shape.y + shape.height
  );
}
});
