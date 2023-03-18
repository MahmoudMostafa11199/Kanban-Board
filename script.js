const btnNoStart = document.getElementById("1");
const btnProgress = document.getElementById("2");
const btnComplete = document.getElementById("3");
const drags = document.getElementsByClassName("drag");
const iconsEdit = document.getElementsByClassName("icon-edit");
const iconsTrash = document.getElementsByClassName("icon-trash");

let columnOne = JSON.parse(localStorage.getItem("columnOne")) || [];
let columnTwo = JSON.parse(localStorage.getItem("columnTwo")) || [];
let columnThree = JSON.parse(localStorage.getItem("columnThree")) || [];

let mark;
let i = 0;

function renderTask(tasksObj, parentId) {
  tasksObj.forEach(task => {
    const containerList = document.getElementById(parentId);
    const taskId = task.id;
    const taskItem = createTask(taskId, parentId);
    const dropZone = createDropZone(taskId);
    taskItem.querySelector(".drag-text").textContent = task.content;

    if (!taskItem.querySelector(".drag-text").textContent) {
      updateArrayToLocalStorage(taskId);
      updateLocalStorage();
      return;
    }
    containerList.appendChild(taskItem);
    taskItem.after(dropZone);
  });
}

function render() {
  renderTask(columnOne, "not__started");
  renderTask(columnTwo, "in__progress");
  renderTask(columnThree, "complete");
}
render();

function createTask(id, parentId) {
  i++;
  console.log(i);
  const taskId = id || Date.now();

  // Add Mark
  const dragContainer = document.getElementById(parentId).closest(".drag");
  if (dragContainer === drags[0]) {
    mark = "❌";
  } else if (dragContainer === drags[1]) {
    mark = "📝";
  } else {
    mark = "✅";
  }

  let dragItem = document.createElement("div");
  dragItem.classList.add("drag-item");
  dragItem.id = taskId;
  dragItem.draggable = true;

  // add mark task
  let dragSpan = document.createElement("span");
  dragSpan.classList.add("drag--mark");
  dragSpan.textContent = mark;

  // add content task
  let dragPara = document.createElement("p");
  dragPara.classList.add("drag-text");
  dragPara.textContent = `task ${String(i).padStart(2, 0)}`;
  dragPara.setAttribute("onfocusout", "focusoutTask(event)");

  // add container icon
  let dragDivIcon = document.createElement("div");
  dragDivIcon.classList.add("icons");

  // add icon edit
  let iconEdit = document.createElement("ion-icon");
  iconEdit.classList.add("icon");
  iconEdit.classList.add("icon-edit");
  iconEdit.setAttribute("name", "create-outline");
  iconEdit.setAttribute("onclick", "editTask(event)");

  // add icon delete
  let iconTrash = document.createElement("ion-icon");
  iconTrash.classList.add("icon");
  iconTrash.classList.add("icon-trash");
  iconTrash.setAttribute("name", "trash-outline");
  iconTrash.setAttribute("onclick", "removeTask(event)");

  dragDivIcon.appendChild(iconEdit);
  dragDivIcon.appendChild(iconTrash);
  dragItem.appendChild(dragSpan);
  dragItem.appendChild(dragPara);
  dragItem.appendChild(dragDivIcon);

  dragPara.addEventListener("input", e => {
    updatetask(dragItem.id, dragPara.textContent, dragItem.parentElement.id);
  });

  dragItem.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text/plain", e.target.id);
    e.dataTransfer.effectAllowed = "move";
  });

  dragAndDrop();

  return dragItem;
}

function createDropZone(id) {
  const dropZone = document.createElement("div");
  dropZone.classList.add("kanban__dropZone");
  dropZone.id = id;
  return dropZone;
}

function dragAndDrop() {
  const dropZones = document.querySelectorAll(".kanban__dropZone");
  dropZones.forEach(dropZone => {
    dropZone.addEventListener("dragover", e => {
      e.preventDefault();
      dropZone.classList.add("kanban__dropZone--active");
    });
  });

  dropZones.forEach(dropZone => {
    dropZone.addEventListener("dragleave", () => {
      dropZone.classList.remove("kanban__dropZone--active");
    });

    dropZone.addEventListener("drop", e => {
      e.preventDefault();
      dropZone.classList.remove("kanban__dropZone--active");
      // Get the ID of the dragged element
      const dragTaskId = e.dataTransfer.getData("text");

      // Get the dragged task element
      const dragTask = document.getElementById(dragTaskId);

      const dragContainer = e.target
        .closest(".drag")
        .querySelector(".drag-title").textContent;

      if (dragContainer === "Not Started") {
        dragTask.querySelector("span").textContent = "❌";
      } else if (dragContainer === "In progress") {
        dragTask.querySelector("span").textContent = "📝";
      } else {
        dragTask.querySelector("span").textContent = "✅";
      }

      if (dragTask.classList.contains("kanban__dropZone")) {
        return;
      }
      // Insert the dragged task element after the drop zone element
      dropZone.after(dragTask);

      const taskContent = dragTask.querySelector(".drag-text");

      const dropZoneArr = [...dropZones];
      const dropZoneIndex = dropZoneArr.indexOf(dropZone);

      const taskObj = {
        id: dragTaskId,
        content: taskContent.textContent,
        status: dragTask.parentElement.id,
        dropzone: dropZone.id,
      };

      // remove the dragged task from it's array
      updateArrayToLocalStorage(dragTaskId);

      // adding the dragged task to the new array
      if (taskObj.status === "not__started") {
        columnOne.splice(dropZoneIndex, 0, taskObj);
      }

      if (taskObj.status === "in__progress") {
        columnTwo.splice(dropZoneIndex, 0, taskObj);
      }

      if (taskObj.status === "complete") {
        columnThree.splice(dropZoneIndex, 0, taskObj);
      }

      updateLocalStorage();
    });
  });
}

// Update task content in localStorage during change
function updatetask(id, content, parentId) {
  const taskNotStarted = columnOne.find(item => item.id === id);
  const taskInProgress = columnTwo.find(item => item.id === id);
  const taskComplete = columnThree.find(item => item.id === id);

  if (parentId === "not__started") {
    taskNotStarted.content = content;
    setLocalStorage("columnOne", columnOne);
  }

  if (parentId === "in__progress") {
    taskInProgress.content = content;
    setLocalStorage("columnTwo", columnTwo);
  }

  if (parentId === "complete") {
    taskComplete.content = content;
    setLocalStorage("columnThree", columnThree);
  }
}

// Display Taskto UI
function displayTask(parentId) {
  const containerList = document.getElementById(parentId);
  const taskItem = createTask(undefined, parentId);
  const taskPara = taskItem.querySelector("p");
  const taskId = taskItem.id;
  const dropZone = createDropZone(taskId);
  containerList.appendChild(taskItem);
  taskItem.after(dropZone);
  taskPara.setAttribute("contenteditable", "true");
  taskPara.focus();
  window.getSelection().selectAllChildren(taskPara);

  // add task object to list array and save it to local storage
  const taskObj = {
    id: taskId,
    content: taskPara.textContent,
    status: parentId,
    dropzone: dropZone.id,
  };

  if (taskObj.status === "not__started") {
    columnOne.push(taskObj);
    setLocalStorage("columnOne", columnOne);
  }

  if (taskObj.status === "in__progress") {
    columnTwo.push(taskObj);
    setLocalStorage("columnTwo", columnTwo);
  }

  if (taskObj.status === "complete") {
    columnThree.push(taskObj);
    setLocalStorage("columnThree", columnThree);
  }
}

// Edit Task
function editTask(e) {
  const item = e.target || e;
  const taskIContent = item.closest(".drag-item").querySelector("p");
  taskIContent.setAttribute("contenteditable", true);
  taskIContent.focus();
  window.getSelection().selectAllChildren(taskIContent);
}

// Delete Task
function removeTask(e) {
  const itemId = e.target.closest(".drag-item").id;
  const taskItem = document.getElementById(itemId);
  const dropZone = document.getElementById(itemId);
  taskItem.remove();
  dropZone.remove();

  // Remove task and dropzone from local storage
  updateArrayToLocalStorage(itemId);

  // Update Local Storage
  updateLocalStorage();
}

//
function focusoutTask(e) {
  const item = e.target;

  if (!item.textContent) {
    item.parentElement.classList.add("complete");
    item.focus();
  } else {
    item.parentElement.classList.remove("complete");
    item.setAttribute("contenteditable", false);
  }
}

// Update Change LocalStorage
function updateLocalStorage() {
  setLocalStorage("columnOne", columnOne);
  setLocalStorage("columnTwo", columnTwo);
  setLocalStorage("columnThree", columnThree);
}

// Update Array to LocalStorage
function updateArrayToLocalStorage(itemId) {
  columnOne = columnOne.filter(task => task.id !== itemId);
  columnTwo = columnTwo.filter(task => task.id !== itemId);
  columnThree = columnThree.filter(task => task.id !== itemId);
}

// Save data in LocalStorage
function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

btnNoStart.addEventListener("click", displayTask.bind(null, "not__started"));
btnProgress.addEventListener("click", displayTask.bind(null, "in__progress"));
btnComplete.addEventListener("click", displayTask.bind(null, "complete"));

// let it = document.createElement("div");
// it.classList.add("drag-item");
// it.draggable = true;
// let ip = document.createElement("p");
// ip.classList.add("drag-text");
// ip.textContent = "task 00";
// it.appendChild(ip);
// document.querySelector(".container").appendChild(it);

// it.addEventListener("touchstart", () => {
//   console.log("Touch Mouse");
// });
// it.addEventListener("touchend", () => {
//   console.log("Touch End");
// });
// it.addEventListener("touchcancel", () => {
//   console.log("Touch Cancel");
// });
// it.addEventListener("touchleave", () => {
//   console.log("Touch Leave");
// });
// it.addEventListener("touchmove", () => {
//   console.log("Touch Move");
// });
