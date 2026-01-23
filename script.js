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

// DOM REFERENCES
const canvas = document.getElementById("canvas");
const addRectBtn = document.getElementById("add-rect");
const propertiesPanel = document.getElementById("properties-panel");

// ADD RECTANGLE
addRectBtn.addEventListener("click", () => {
    const rect = {
        id: Date.now(),
        x: 50,
        y: 50,
        width: 120,
        height: 80,
        color: "#0d99ff"
    };

    elements.push(rect);
    selectedId = rect.id;
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

        el.width = Math.max(40, startSize.w + dx);
        el.height = Math.max(40, startSize.h + dy);

        // Keep resize inside canvas
        el.width = Math.min(el.width, canvas.clientWidth - el.x);
        el.height = Math.min(el.height, canvas.clientHeight - el.y);

        render();
        return;
    }


    // DRAGE
    if (!isDragging || selectedId === null) return;

    const el = elements.find(item => item.id === selectedId);
    if (!el) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    el.x = elementStart.x + dx;
    el.y = elementStart.y + dy;

    // Keep inside canvas
    el.x = Math.max(0, Math.min(el.x, canvas.clientWidth - el.width));
    el.y = Math.max(0, Math.min(el.y, canvas.clientHeight - el.height));

    render();
});

// STOP DRAG / RESIZE
window.addEventListener("mouseup", () => {
    isDragging = false;
    isResizing = false;
});


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
        div.style.background = el.color;

        // Selection border
        if (el.id === selectedId) {
            div.style.outline = "2px solid #0d99ff";


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
}


// PROPERTIES PANEL

function updatePropertiesPanel() {

    if (selectedId === null) {
        propertiesPanel.innerHTML = `<p>Select an element to edit properties</p>`;
        return;
    }

    const el = elements.find(item => item.id === selectedId);
    if (!el) return;

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
}