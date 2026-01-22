let elements = [];
let selectedId = null;

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

        canvas.appendChild(div);
    });
}
