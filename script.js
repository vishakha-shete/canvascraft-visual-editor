let elements = [];
let selectedId = null;

let isDragging = false;
let dragStart = { x: 0, y: 0 };
let elementStart = { x: 0, y: 0 };


const canvas = document.getElementById("canvas");
const addRectBtn = document.getElementById("add-rect");

addRectBtn.addEventListener("click", () => {
    const rect = {
        id: Date.now(),
        x: 50,
        y: 50,
        width: 120,
        height: 80,
        type: "rect"
    };

    elements.push(rect);
    selectedId = rect.id;
    render();
});

canvas.addEventListener("click", () => {
    selectedId = null;
    render();
});


window.addEventListener("mousemove", (e) => {
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


window.addEventListener("mouseup", () => {
    isDragging = false;
});



function render() {
    canvas.innerHTML = "";

    elements.forEach(el => {
        const div = document.createElement("div");
        div.className = "element";
        div.style.left = el.x + "px";
        div.style.top = el.y + "px";
        div.style.width = el.width + "px";
        div.style.height = el.height + "px";
        div.style.background = "#0d99ff";

        if (el.id === selectedId) {
            div.style.outline = "2px solid #0d99ff";
        }

        div.addEventListener("click", (e) => {
            e.stopPropagation();
            selectedId = el.id;
            render();
        });

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
}
