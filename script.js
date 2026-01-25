// STATE
let elements = [];
let selectedId = null;


// Drag helpers
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let elementStart = { x: 0, y: 0 };

// Resize helpers
let isResizing = false;
let resizeStart = { x: 0, y: 0 };
let startSize = { w: 0, h: 0 };


// Snap to grid
let snapToGrid = false;
const GRID_SIZE = 20;

// DOM REFERENCES
const canvas = document.getElementById("canvas");
const addRectBtn = document.getElementById("add-rect");
const addTextBtn = document.getElementById("add-text");
const statusMsg = document.getElementById("status-msg");
const propertiesPanel = document.getElementById("properties-panel");
const layersList = document.getElementById("layers-list");
const saveBtn = document.getElementById("save-btn");
const exportJsonBtn = document.getElementById("export-json");
const exportHtmlBtn = document.getElementById("export-html");
const snapToggle = document.getElementById("snap-toggle");


// HELPERS
function setStatus(msg) {
    statusMsg.textContent = msg;
}

// SNAP TO GRID
snapToggle.addEventListener("change", () => {
    snapToGrid = snapToggle.checked;
});

function snap(value) {
    return snapToGrid
        ? Math.round(value / GRID_SIZE) * GRID_SIZE
        : value;
}


// ADD RECTANGLE
addRectBtn.addEventListener("click", () => {
    const rect = {
        id: Date.now(),
        type: "rect",
        x: 50,
        y: 50,
        width: 120,
        height: 80,
        color: "#0d99ff",
        zIndex: elements.length
    };

    elements.push(rect);
    selectedId = rect.id;
    render();
});

addTextBtn.addEventListener("click", () => {
    const textEl = {
        id: Date.now(),
        x: 60,
        y: 60,
        width: 160,
        height: 40,
        color: "#000000",
        text: "Double click to edit",
        type: "text",
        zIndex: elements.length
    };

    elements.push(textEl);
    selectedId = textEl.id;
    render();
});


// DESELECT ON CANVAS CLICK
canvas.addEventListener("click", () => {
    selectedId = null;
    render();
});


// MOUSE MOVE  (RESIZE FIRST, THEN DRAG)
window.addEventListener("mousemove", (e) => {

    // ----- RESIZE -----
    if (isResizing && selectedId !== null) {
        const el = elements.find(item => item.id === selectedId);
        if (!el) return;

        const dx = e.clientX - resizeStart.x;
        const dy = e.clientY - resizeStart.y;

        el.width = Math.max(40, snap(startSize.w + dx));
        el.height = Math.max(40, snap(startSize.h + dy));

        // Keep resize inside canvas
        el.width = Math.min(el.width, canvas.clientWidth - el.x);
        el.height = Math.min(el.height, canvas.clientHeight - el.y);

        setStatus("Resizing...");
        render();
        return;
    }


    // DRAGE 
    if (!isDragging || selectedId === null) return;

    const el = elements.find(item => item.id === selectedId);
    if (!el) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    el.x = snap(elementStart.x + dx);
    el.y = snap(elementStart.y + dy);

    // Keep inside canvas
    el.x = Math.max(0, Math.min(el.x, canvas.clientWidth - el.width));
    el.y = Math.max(0, Math.min(el.y, canvas.clientHeight - el.height));
    
    setStatus("Dragging...");
    render();
});

// STOP DRAG / RESIZE
window.addEventListener("mouseup", () => {
    isDragging = false;
    isResizing = false;
    setStatus("Ready");
});


// KEYBOARD CONTROLS
window.addEventListener("keydown", (e) => {
    if (selectedId === null) return;

    const el = elements.find(item => item.id === selectedId);
    if (!el) return;

    const step = snapToGrid ? GRID_SIZE : 5;

    // Delete element
    if (e.key === "Delete") {
        elements = elements.filter(item => item.id !== selectedId);
        selectedId = null;
        render();
        return;
    }

    // Move with arrow keys
    if (e.key === "ArrowLeft") el.x -= step;
    if (e.key === "ArrowRight") el.x += step;
    if (e.key === "ArrowUp") el.y -= step;
    if (e.key === "ArrowDown") el.y += step;

    el.x = Math.max(0, Math.min(el.x, canvas.clientWidth - el.width));
    el.y = Math.max(0, Math.min(el.y, canvas.clientHeight - el.height));

    render();
});

// SAVE & LOAD
function saveToLocalStorage() {
    localStorage.setItem("canvasElements", JSON.stringify(elements));
    setStatus("Project saved")
}

function loadFromLocalStorage() {
    const data = localStorage.getItem("canvasElements");
    if (data) {
        elements = JSON.parse(data);
        selectedId = null;
        render();
    }
}

// Save button
saveBtn.addEventListener("click", () => {
    saveToLocalStorage();
    alert("Project saved successfully!");
});


// EXPORT
exportJsonBtn.addEventListener("click", exportJSON);
exportHtmlBtn.addEventListener("click", exportHTML);

function exportJSON() {
    const blob = new Blob(
        [JSON.stringify(elements, null, 2)],
        { type: "application/json" }
    );
    downloadFile(blob, "design.json");
}

function exportHTML() {
    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>CanvasCraft Export</title>
</head>
<body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;background:#111;">
<div style="position:relative;width:800px;height:600px;background:#fff;">
${elements.map(el => `
<div style="
position:absolute;
left:${el.x}px;
top:${el.y}px;
width:${el.width}px;
height:${el.height}px;
background:${el.type === "text" ? "transparent" : el.color};
color:${el.color};
display:flex;
align-items:center;
justify-content:center;
z-index:${el.zIndex};
">${el.type === "text" ? el.text : ""}
</div>
`).join("")}
</div>
</body>
</html>
    `;
    downloadFile(new Blob([html], { type: "text/html" }), "design.html");
}

function downloadFile(blob, filename) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
}


// RENDER 
function render() {
    canvas.innerHTML = "";

    elements.forEach(el => {
        const div = document.createElement("div");
        div.className = "element";

        div.style.left = el.x + "px";
        div.style.top = el.y + "px";
        div.style.width = el.width + "px";
        div.style.height = el.height + "px";
        div.style.zIndex = el.zIndex;


        if (el.type === "rect") {
            div.style.background = el.color;
        } else {
            div.style.background = "transparent";
            div.style.color = el.color;
            div.style.display = "flex";
            div.style.alignItems = "center";
            div.style.justifyContent = "center";
            div.textContent = el.text;

            div.addEventListener("dblclick", (e) => {
                e.stopPropagation();
                const newText = prompt("Edit text:", el.text);
                if (newText !== null) {
                    el.text = newText;
                    render();
                }
            });
        }

        // Selection border
        if (el.id === selectedId) {
            div.classList.add("selected");

            // Resize handle
            const handle = document.createElement("div");
            handle.className = "resize-handle";

            handle.addEventListener("mousedown", (e) => {
                e.stopPropagation();
                isResizing = true;

                resizeStart.x = e.clientX;
                resizeStart.y = e.clientY;
                startSize.w = el.width;
                startSize.h = el.height;
            });

            div.appendChild(handle);

        }

        //select element
        div.addEventListener("click", (e) => {
            e.stopPropagation();
            selectedId = el.id;
            render();
        });


        // Mouse down to start drag
        div.addEventListener("mousedown", (e) => {
            e.stopPropagation();

            if (el.id !== selectedId) return;

            isDragging = true;
            dragStart.x = e.clientX;
            dragStart.y = e.clientY;

            elementStart.x = el.x;
            elementStart.y = el.y;
        });


        canvas.appendChild(div);
    });

    updatePropertiesPanel();
    renderLayersPanel();
}


// PROPERTIES PANEL

function updatePropertiesPanel() {

    if (selectedId === null) {
        propertiesPanel.innerHTML = `<p>Select an element to edit properties</p>`;
        return;
    }

    const el = elements.find(item => item.id === selectedId);

    let textField = "";
    if (el.type === "text") {
        textField = `
            <div class="prop-row">
                <span>Text</span>
                <input type="text" id="prop-text" value="${el.text}">
            </div>`;
    }

    propertiesPanel.innerHTML = `
        <div class="prop-row">
            <span>Width</span>
            <input type="number" id="prop-width" value="${el.width}">
        </div>

        <div class="prop-row">
            <span>Height</span>
            <input type="number" id="prop-height" value="${el.height}">
        </div>

        <div class="prop-row">
            <span>Color</span>
            <input type="color" id="prop-color" value="${el.color}">
        </div>
        ${textField}

    `;

    document.getElementById("prop-width").addEventListener("input", (e) => {
        el.width = Math.max(40, Number(e.target.value));
        render();
    });

    document.getElementById("prop-height").addEventListener("input", (e) => {
        el.height = Math.max(40, Number(e.target.value));
        render();
    });

    document.getElementById("prop-color").addEventListener("input", (e) => {
        el.color = e.target.value;
        render();
    });

    if (el.type === "text") {
        document.getElementById("prop-text").oninput = e => {
            el.text = e.target.value;
            render();
        };
    }
}

// LAYERS PANEl 

function renderLayersPanel() {
    layersList.innerHTML = "";

    [...elements]
        .sort((a, b) => b.zIndex - a.zIndex)
        .forEach(el => {
            const item = document.createElement("div");
            item.className = "layer-item";
            if (el.id === selectedId) item.classList.add("active");

            item.innerHTML = `
            <span>${el.type === "text" ? "Text" : "Rectangle"} ${el.id.toString().slice(-4)}</span>
            <div>
                    <button>↑</button>
                    <button>↓</button>
                </div>
            `;

            item.onclick = () => {
                selectedId = el.id;
                render();
            };

            item.querySelectorAll("button")[0].onclick = e => {
                e.stopPropagation();
                moveLayer(el.id, 1);
            };

            item.querySelectorAll("button")[1].onclick = e => {
                e.stopPropagation();
                moveLayer(el.id, -1);
            };

            layersList.appendChild(item);
        });
}

function moveLayer(id, direction) {
    const index = elements.findIndex(el => el.id === id);
    const target = index + direction;

    if (target < 0 || target >= elements.length) return;

    const temp = elements[index].zIndex;
    elements[index].zIndex = elements[target].zIndex;
    elements[target].zIndex = temp;

    render();
}

//AUTO LOAD
loadFromLocalStorage();
setStatus("Ready");