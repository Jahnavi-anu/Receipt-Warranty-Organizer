const dropArea = document.getElementById("drop-area");
const fileinput = document.getElementById("fileInput");
const uploadFiles = document.getElementById("uploadFiles");
const fileName = document.getElementById("fileName");
const category = document.getElementById("category");
const desp = document.getElementById("desp");
const btnUpload = document.getElementById("btnUpload");
const filesList = document.getElementById("filesList");

let selectedFiles = null;

//click to upload
dropArea.addEventListener("click",()=>{
    fileinput.click();
});

//Handle file selection
fileinput.addEventListener("change",(event)=>{
    selectedFiles = event.target.files[0];
    if(selectedFiles){
        fileName.textContent =`Selected: ${selectedFiles.name}`
    }
});

//Drag & Drop handlers

dropArea.addEventListener("dragover",(event)=>{
    event.preventDefault();
    dropArea.classList.add("ready");
});

dropArea.addEventListener("dragleave", ()=>{
  dropArea.classList.remove("ready");
});

dropArea.addEventListener("drop",(event)=>{
    event.preventDefault();
    dropArea.classList.remove("ready");

    selectedFiles = event.dataTransfer.files[0];
    if(selectedFiles){
        fileName.textContent  =`Dropped:${selectedFiles.name}`;
    }
         

});

function resetUploadFields(){
    category.selectedIndex =0;
    desp.value ="";
    fileinput.value ="";
    dropArea.classList.remove("");
    
}
//Handle Upload button
btnUpload.addEventListener("click",(e)=>{
    e.preventDefault();
    const file = selectedFiles || fileinput.files[0];
    if(!file){
        alert("Please select a file first!");
        return;
    }
 
    const reader = new FileReader();
    reader.onload = function(event){
            const url = event.target.result;
            const card = document.createElement("div");
            card.classList.add("reciept-card");
            card.innerHTML =`${file.type.startsWith("image")?`<div class="reciept"> <img src="${url}" alt="Reciept Preview">`
                                                              :`<embed src="${url}" width="100px" height="700px"> <div>`
                                  }`;
                                  uploadFiles.appendChild(card);
    }
reader.readAsDataURL(file);
    const selectedcategory = category.value;
    const despcription = desp.value;

    if(selectedcategory === ""){
        alert("Please select a category");
        return;
    }

    //Add to Uploaded list
    const li = document.createElement("li");
    li.textContent =`${selectedcategory} -${selectedFiles.name} ((${despcription}))`;
    filesList.appendChild(li);

    //Reset fields
    selectedFiles = null;
    fileinput.value ="";
    despcription.value ="";
    fileName.textContent ="";
 resetUploadFields();
});

const notfy = document.getElementById("notify-bell");
const notifyslide = document.querySelector(".Notification-bar");
const closeBtn = document.getElementById("closeBtn");

notfy.addEventListener("click",()=>{
     notifyslide.classList.toggle("active");
});
closeBtn.addEventListener("click",()=>{
    notifyslide.classList.remove("active");
});

const loginBtn = document.getElementById("login-btn");
loginBtn.addEventListener("click",()=>{
    window.location.href = "Login.html";
})