const btnAdd = document.querySelectorAll(".btn--add--task");
const dragItems = document.getElementsByClassName("drag-item");
const dragsContainer = document.querySelectorAll(".drag-items");
const iconsEdit = document.getElementsByClassName("icon-edit");
const iconsTrash = document.getElementsByClassName("icon-trash");
const drags = document.getElementsByClassName("drag");
const dragMark = document.getElementsByClassName("drag--mark");

// class Kanban {
//   constructor() {}
// }
//
const arrayToTask = [];

function funAddToTask(item, title) {
  const Task = {
    id: Date.now(),
    title: title,
    content: item,
  };

  arrayToTask.push(Task);
}

let mark;
btnAdd.forEach(btn => {
  let i = 0;

  btn.addEventListener("click", e => {
    // const titleDrag = e.target.parentElement.firstElementChild.textContent;
    const titleDrag = e.target.parentElement.firstElementChild;

    const dragContainer = e.target.closest(".drag");

    if (dragContainer === drags[0]) {
      mark = "❌";
    } else if (dragContainer === drags[1]) {
      mark = "📝";
    } else {
      mark = "✅";
    }

    // Create Elements
    let dragItem = document.createElement("div");
    dragItem.classList.add("drag-item");
    dragItem.setAttribute("draggable", "true");
    dragItem.setAttribute("data-id", Date.now());

    let dragSpan = document.createElement("span");
    dragSpan.classList.add("drag--mark");
    dragSpan.textContent = mark;

    let dragPara = document.createElement("p");
    dragPara.classList.add("drag-text");
    dragPara.textContent = `task ${String(i).padStart(2, 0)}`;

    let dragDivIcon = document.createElement("div");
    dragDivIcon.classList.add("icons");

    let iconEdit = document.createElement("ion-icon");
    iconEdit.classList.add("icon");
    iconEdit.classList.add("icon-edit");
    iconEdit.setAttribute("name", "create-outline");

    let iconTrash = document.createElement("ion-icon");
    iconTrash.classList.add("icon");
    iconTrash.classList.add("icon-trash");
    iconTrash.setAttribute("name", "trash-outline");

    let kanbanDropZone = document.createElement("div");
    kanbanDropZone.classList.add("kanban__dropZone");

    dragDivIcon.appendChild(iconEdit);
    dragDivIcon.appendChild(iconTrash);

    dragItem.appendChild(dragSpan);
    dragItem.appendChild(dragPara);
    dragItem.appendChild(dragDivIcon);

    // Update array
    funAddToTask(dragItem, titleDrag);

    e.target.previousElementSibling.appendChild(dragItem);
    localStorage.setItem("listOne", JSON.stringify(arrayToTask));

    getDragging();
    edit();
    focusInput();

    i++;
  });
});

let drag = null;
function getDragging() {
  [...dragItems].forEach(item => {
    item.addEventListener("dragstart", () => {
      drag = item;
      item.classList.add("dragging");
    });

    item.addEventListener("dragend", e => {
      e.preventDefault();
      // drag = null;
      item.classList.remove("dragging");
    });
  });
}
getDragging();

///////////////////////////////////////////

dragsContainer.forEach(container => {
  let afterElement;
  container.addEventListener("dragover", e => {
    e.preventDefault();
    afterElement = getDragAfterElement(container, e.clientY);
    const draggable = document.querySelector(".dragging");
    const dragItem = draggable.closest(".drag");

    if (dragItem === drags[0]) {
      mark = "❌";
    } else if (dragItem === drags[1]) {
      mark = "📝";
    } else {
      mark = "✅";
    }

    if (afterElement == null) {
      container.appendChild(drag);
      draggable.firstElementChild.textContent = mark;
    } else {
      draggable.firstElementChild.textContent = mark;
      container.insertBefore(drag, afterElement);
    }
  });

  container.addEventListener("dragleave", e => {
    afterElement = getDragAfterElement(container, e.clientY);
  });
});

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".drag-item:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

function localStorageItem(item) {
  localStorage.setItem("dragItem", JSON.stringify(item));
  const data = JSON.parse(localStorage.getItem("dragItem"));
  // if (!data) return;
  console.log(data[0]);
}

// localStorage.removeItem("dragItem");
function edit() {
  [...iconsEdit].forEach(icon => {
    icon.addEventListener("click", e => {
      const item = e.target.closest(".drag-item").querySelector("p");
      item.setAttribute("contenteditable", "true");
      item.focus();
      window.getSelection().selectAllChildren(item);
    });
  });
}

function focusInput(e) {
  document.querySelectorAll(".drag-text").forEach(dragText => {
    dragText.addEventListener("focusout", e => {
      const item = e.target.closest(".drag-item").querySelector("p");

      if (!item.textContent) {
        item.parentElement.classList.add("complete");
        item.focus();
      } else {
        item.parentElement.classList.remove("complete");
        item.setAttribute("contenteditable", "false");
      }
    });
  });
}
localStorage.setItem("listOne", JSON.stringify(arrayToTask));
