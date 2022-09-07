let addBtn = document.querySelector(".add-btn");
let removeBtn = document.querySelector(".remove-btn");
let modalCont = document.querySelector(".modal-cont");
let mainCont = document.querySelector(".main-cont");
let textareaCont = document.querySelector(".textarea-cont");
let allPriorityColors = document.querySelectorAll(".priority-color");
let toolBoxColors = document.querySelectorAll(".color");

let colors = ["lightpink", "lightblue", "lightgreen", "black"];
let modalPriorityColor = colors[colors.length - 1];

let addFlag = false;
let removeFlag = false;

let lockClass = "fa-lock";
let unlockClass = "fa-lock-open";

let NotesArr = [];

if (localStorage.getItem("sticky_notes")) {
    // Retrieve and display notes
    NotesArr = JSON.parse(localStorage.getItem("sticky_notes"));
    NotesArr.forEach((noteObj) => {
        createNote(noteObj.noteColor, noteObj.noteTask, noteObj.noteID);
    })
}

for (let i = 0; i < toolBoxColors.length; i++) {
    toolBoxColors[i].addEventListener("click", (e) => {
        let currentToolBoxColor = toolBoxColors[i].classList[0];

        let filteredNotes = NotesArr.filter((noteObj, idx) => {
            return currentToolBoxColor === noteObj.noteColor;
        })

        // Remove previous notes
        let allNotesCont = document.querySelectorAll(".note-cont");
        for (let i = 0; i < allNotesCont.length; i++) {
            allNotesCont[i].remove();
        }
        // Display new filtered notes
        filteredNotes.forEach((noteObj, idx) => {
            createNote(noteObj.noteColor, noteObj.noteTask, noteObj.noteID);
        })
    })

    toolBoxColors[i].addEventListener("dblclick", (e) => {
        // Remove previous notes
        let allNotesCont = document.querySelectorAll(".note-cont");
        for (let i = 0; i < allNotesCont.length; i++) {
            allNotesCont[i].remove();
        }

        NotesArr.forEach((noteObj, idx) => {
            createNote(noteObj.noteColor, noteObj.noteTask, noteObj.noteID);
        })
    })
}

// Listener for modal priority coloring
allPriorityColors.forEach((colorElem, idx) => {
    colorElem.addEventListener("click", (e) => {
        allPriorityColors.forEach((priorityColorElem, idx) => {
            priorityColorElem.classList.remove("border");
        })
        colorElem.classList.add("border");

        modalPriorityColor = colorElem.classList[0];
    })
})

addBtn.addEventListener("click", (e) => {
    // Display Modal
    // Generate note

    // AddFlag, true -> Modal Display
    // AddFlag, False -> Modal None
    addFlag = !addFlag;
    if (addFlag) {
        modalCont.style.display = "flex";
    }
    else {
        modalCont.style.display = "none";
    }
})
removeBtn.addEventListener("click", (e) => {
    removeFlag = !removeFlag;
    console.log(removeFlag);
})


modalCont.addEventListener("keydown", (e) => {
    let key = e.key;
    if (key === "Shift") {
        createNote(modalPriorityColor, textareaCont.value);
        addFlag = false;
        setModalToDefault();
    }
})

function createNote(noteColor, noteTask, noteID) {
    let id = noteID || shortid();
    let noteCont = document.createElement("div");
    noteCont.setAttribute("class", "note-cont");
    noteCont.innerHTML = `
        <div class="note-color ${noteColor}"></div>
        <div class="note-id">#${id}</div>
        <div class="task-area">${noteTask}</div>
        <div class="note-lock">
            <i class="fas fa-lock"></i>
        </div>
    `;
    mainCont.appendChild(noteCont);

    // Create object of note and add to array
    if (!noteID) {
        NotesArr.push({ noteColor, noteTask, noteID: id });
        localStorage.setItem("sticky_notes", JSON.stringify(NotesArr));
    }
    console.log(NotesArr);
    handleRemoval(noteCont, id);
    handleLock(noteCont, id);
    handleColor(noteCont, id);
}

function handleRemoval(note, id) {
    // removeFlag -> true -> remove
    note.addEventListener("click", (e) => {
        if (!removeFlag) return;

        let idx = getNoteIdx(id);

        // DB removal
        NotesArr.splice(idx, 1);
        let strNotesArr = JSON.stringify(NotesArr);
        localStorage.setItem("sticky_notes", strNotesArr);

        note.remove(); //UI removal
    })
}

function handleLock(note, id) {
    let noteLockElem = note.querySelector(".note-lock");
    let noteLock = noteLockElem.children[0];
    let noteTaskArea = note.querySelector(".task-area");
    noteLock.addEventListener("click", (e) => {
        let noteIDx = getNoteIdx(id);

        if (noteLock.classList.contains(lockClass)) {
            noteLock.classList.remove(lockClass);
            noteLock.classList.add(unlockClass);
            noteTaskArea.setAttribute("contenteditable", "true");
        }
        else {
            noteLock.classList.remove(unlockClass);
            noteLock.classList.add(lockClass);
            noteTaskArea.setAttribute("contenteditable", "false");
        }

        // Modify data in localStorage (note Task)
        NotesArr[noteIDx].noteTask = noteTaskArea.innerText;
        localStorage.setItem("sticky_notes", JSON.stringify(NotesArr));
    })
}

function handleColor(note, id) {
    let noteColor = note.querySelector(".note-color");
    noteColor.addEventListener("click", (e) => {
        // Get noteIDx from the notes array
        let noteIDx = getNoteIdx(id);

        let currentnoteColor = noteColor.classList[1];
        // Get note color idx
        let currentnoteColorIdx = colors.findIndex((color) => {
            return currentnoteColor === color;
        })
        console.log(currentnoteColor, currentnoteColorIdx);
        currentnoteColorIdx++;
        let newnoteColorIdx = currentnoteColorIdx % colors.length;
        let newnoteColor = colors[newnoteColorIdx];
        noteColor.classList.remove(currentnoteColor);
        noteColor.classList.add(newnoteColor);

        // Modify data in localStorage (priority color change)
        NotesArr[noteIDx].noteColor = newnoteColor;
        localStorage.setItem("sticky_notes", JSON.stringify(NotesArr));
    })
}

function getNoteIdx(id) {
    let noteIDx = NotesArr.findIndex((noteObj) => {
        return noteObj.noteID === id;
    })
    return noteIDx;
}

function setModalToDefault() {
    modalCont.style.display = "none";
    textareaCont.value = "";
    modalPriorityColor = colors[colors.length - 1];
    allPriorityColors.forEach((priorityColorElem, idx) => {
        priorityColorElem.classList.remove("border");
    })
    allPriorityColors[allPriorityColors.length - 1].classList.add("border");
}
