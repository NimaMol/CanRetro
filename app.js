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
    } else if (shape.type === "rect") {
      ctx.rect(shape.x, shape.y, shape.width, shape.height);
      ctx.fill();
      ctx.stroke();
    } else if (shape.type === "text") {
      ctx.font = "16px Arial";
      ctx.fillText(shape.text, shape.x, shape.y);
    }

    // Highlight the selected shape
    if (shape === selectedShape) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = "red";
      ctx.stroke();
      ctx.lineWidth = 1;
    }
  }
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

canvas.addEventListener("mousedown", e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (mode === "draw") {
    shapes.push({ type: "circle", x, y, radius: 30, color: currentColor });
    draw();
  } else if (mode === "drawRect") {
    shapes.push({ type: "rect", x, y, width: 100, height: 60, color: currentColor });
    draw();
  } else if (mode === "select") {
    const shape = getShapeAt(x, y);
    if (shape) {
      selectedShape = shape;
    } else {
      selectedShape = null;
    }
    draw();
  }
});

canvas.addEventListener("mousemove", e => {
  if (selectedShape && mode === "select") {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedShape.type === "circle") {
      selectedShape.x = x;
      selectedShape.y = y;
    } else if (selectedShape.type === "rect") {
      selectedShape.x = x - selectedShape.width / 2;
      selectedShape.y = y - selectedShape.height / 2;
    }

    draw();
  }
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
});
