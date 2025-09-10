const dropOverlay = document.getElementById('drop-overlay');
const mainContent = document.querySelector(".mainContent");
const ListFiles = document.querySelector(".ListFiles");
const DisplayCorner = document.querySelector(".DisplayCorner");


let uploadFiles = JSON.parse(localStorage.getItem("uploadedFiles")) || [];

function saveToLocalStorage(fileData){
    uploadFiles.push(fileData);
    localStorage.setItem("uploadedFiles",JSON.stringify(uploadFiles));
}
// Event listeners for the main drop zone (mainContent)
mainContent.addEventListener("dragenter", (e) => {
    e.preventDefault();
    dropOverlay.classList.add("active");
});

mainContent.addEventListener("dragover", (e) => {
    e.preventDefault();
});

mainContent.addEventListener("dragleave", (e) => {
    e.preventDefault();
    dropOverlay.classList.remove("active");
});

mainContent.addEventListener("drop", (e) => {
    e.preventDefault();
    dropOverlay.classList.remove("active");

    const files = e.dataTransfer.files;
    if (!files.length) return;

    [...files].forEach((file) => {
        const reader = new FileReader();

        reader.onload = function (event) {
            const url = event.target.result;
            const fileData = {
                name:file.name,
                type:file.type,
                data:url
            };
           // Save to localStorage
    saveToLocalStorage(fileData);

    // Render in UI
    renderFile(fileData);
    renderSuggestedFile(fileData)
           
        };

        reader.readAsDataURL(file);
    });
});

// helper: convert dataURL to Uint8Array
function dataURLToUint8Array(dataURL) {
  const base64 = dataURL.split(',')[1];
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// generate thumbnail for PDF fileData.data (dataURL), return Promise<imgSrc>
function generatePdfThumbnail(dataUrl, previewWidth = 400) {
  return new Promise((resolve, reject) => {
    try {
      const pdfData = dataURLToUint8Array(dataUrl);
      pdfjsLib.getDocument({ data: pdfData }).promise.then(pdf => {
        return pdf.getPage(1).then(page => {
          // compute scale so page width fits previewWidth
          const viewport = page.getViewport({ scale: 1 });
          const scale = previewWidth / viewport.width;
          const renderViewport = page.getViewport({ scale });

          const canvas = document.createElement('canvas');
          canvas.width = Math.round(renderViewport.width);
          canvas.height = Math.round(renderViewport.height);
          const ctx = canvas.getContext('2d');

          page.render({ canvasContext: ctx, viewport: renderViewport }).promise.then(() => {
            const imgSrc = canvas.toDataURL('image/png');
            resolve(imgSrc);
          }).catch(err => reject(err));
        });
      }).catch(err => reject(err));
    } catch (err) {
      reject(err);
    }
  });
}
function dataURLtoBlob(dataURL) {
  const byteString = atob(dataURL.split(",")[1]);
  const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

function renderFile(fileData, index) {
  // ---- All Files Section ----
  const fileBox = document.createElement("div");
  fileBox.classList.add("file-item");

  let fileContentHTML = "";

  if (fileData.type.startsWith("image")) {
    fileContentHTML = `
      <div class="file-card">
        <div class="card">
          <div class="card-preview">
            <img class="preview-img" src="${fileData.data}" alt="${fileData.name}">
          </div>
        </div>
        <div class="card-details">
        <p>${fileData.name}</p>
      </div> 
      </div>
     
      <div class="file-actions">
        <button class="share-btn">Share</button>
        <button class="link-btn"><i class="fa-solid fa-link"></i></button>
        <button class="more-btn" data-index="${index}">:</button>
      </div>
    `;
  } else if (fileData.type === "application/pdf") {
    fileContentHTML = `
      <div class="file-card">
        <div class="card">
          <div class="card-preview">
            <img class="preview-img" src="pdf-placeholder.png" alt="PDF File">
          </div>
        </div>
         <div class="card-details">
        <p>${fileData.name}</p>
      </div>
      </div>
     
      <div class="file-actions">
        <button class="share-btn">Share</button>
        <button class="link-btn"><i class="fa-solid fa-link"></i></button>
        <button class="more-btn" data-index="${index}">:</button>
      </div>
    `;
  }

  fileBox.innerHTML = fileContentHTML;
  ListFiles.appendChild(fileBox);

  // ---- Photo Gallery Section ----
  const photoBox = fileBox.cloneNode(true);
  DisplayCorner.appendChild(photoBox);

  // Generate thumbnail for PDFs
  if (fileData.type === "application/pdf") 
    {
    const imgEl = fileBox.querySelector(".preview-img");
    const imgEl2 = photoBox.querySelector(".preview-img");

    generatePdfThumbnail(fileData.data, 400).then(imgSrc => {
      imgEl.src = imgSrc;
      imgEl2.src = imgSrc;
    }).catch(err => console.error("Thumbnail error:", err));
  }

  // Open file on click
  fileBox.querySelector(".file-card").addEventListener("click", (e) => {
    if (e.target.closest(".file-actions")) return;
    const blob = dataURLtoBlob(fileData.data);
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank");
  });
}

window.addEventListener("DOMContentLoaded",()=>{
     if (uploadFiles.length > 0) {
    uploadFiles.forEach((fileData, index) => renderFile(fileData, index));
    renderSuggestedFile(uploadFiles[uploadFiles.length - 1]);
  }
})

const uploadOrdrop = document.querySelector(".uploadOrdrop");
const uploadMenu = document.getElementById("uploadMenu");
const lock = document.getElementById("lock");

uploadOrdrop.addEventListener("click",()=>{
       uploadMenu.classList.toggle("hidden");
});

lock.addEventListener("click",()=>{
    lock.classList.add("hidden");
});

document.addEventListener("click",(e)=>{
    if(e.target.classList.contains("share-btn")){
        alert("You clicked share for:");
    }
    if(e.target.classList.contains("link-btn")){
        alert("Get link action");
        
    }
    if(e.target.classList.contains("more-btn")){

        //toggle dropdown or extra menu

        const dropdown = document.createElement("div");
        dropdown.classList.add("option-dropdown");
        dropdown.innerHTML =`
        <p class="delete-option">Delete</p>`;

        e.target.parentNode.appendChild(dropdown);
    }
})


//PhotoGallary Section

const contentWrapper = document.querySelector(".content-wrapper");
const PhotoCategory = document.querySelector(".PhotoCategory");
const photos = document.getElementById("photos");
const allFielesLink = document.getElementById("allFielesLink");
const photosLink = document.getElementById("photosLink");

allFielesLink.addEventListener("click",(e)=>{
    e.preventDefault();
    mainContent.style.display="block";
    
    PhotoCategory.style.display="none";
})

photosLink.addEventListener("click",(e)=>{
    e.preventDefault();
    mainContent.style.display="none";
    PhotoCategory.style.display="block";
    selectitems.classList.add("active");
})

document.addEventListener("click",(e)=>
  {
    if(e.target.classList.contains("delete-option"))
      {
        const index = parseInt(e.target.dataset.index,10);
        uploadFiles.splice(index,1);
        localStorage.setItem("uploadedFiles",JSON.stringify(uploadFiles));
        //Render all files
        ListFiles.innerHTML ="";
        DisplayCorner.innerHTML="";
        uploadFiles.forEach((file,newIndex)=> renderFile(file,newIndex));
    }
})



document.querySelectorAll('.homebtns .bghover').forEach(icon =>{
            icon.parentElement.addEventListener('click',function(){
                    document.querySelectorAll('.ibg').forEach(btn=> 
                    {
                      btn.classList.remove('active');
                     
                    
                    });
                      
                    document.querySelectorAll('.homebtns .bghover').forEach(i =>{
                        i.classList.remove('fa-solid');
                        i.classList.add('fa-regular');
                      
                    });
                    this.classList.add('active');
                    icon.classList.remove('fa-regular');
                    icon.classList.add('fa-solid');
                    
            });
        });



const selectitems = document.querySelectorAll(".select");


selectitems.forEach(item =>{
    item.addEventListener("click",function(e){
        e.preventDefault();
        //Remove the active and reset the icons
        selectitems.forEach(n => {
              n.classList.remove("active");
              n.classList.remove("select-bg");
              const icon = n.querySelector("i");
              if(icon){
                icon.classList.remove("fa-solid");
                icon.classList.add("fa-regular");
                icon.classList.remove("icon-bg");
              }
        });

        //add active to the clicked one
        this.classList.add("active");
        this.classList.add("select-bg")
        const clickedicon = this.querySelector("i");
        if(clickedicon){
            clickedicon.classList.remove("fa-regular");
            clickedicon.classList.add("fa-solid");
            icon.classList.add("icon-bg");
        }
          
    })
})

function renderSuggestedFile(fileData) {
  ListFiles.innerHTML = "";

  const fileBox = document.createElement("div");

  fileBox.innerHTML = `
    <div class="file-card">
      <div class="card">
        <div class="card-preview">
          ${fileData.type.startsWith("image")
            ? `<img src="${fileData.data}" alt="${fileData.name}" class="preview-img">`
            : `<img class="preview-img" src="pdf-placeholder.png" alt="PDF File">`}
        </div>
      </div>
      <div class="card-details">
      <p>${fileData.name}</p>
    </div>
    </div>
    
    <div class="file-actions">
      <button class="share-btn">Share</button>
      <button class="link-btn"><i class="fa-solid fa-link"></i></button>
      <button class="more-btn">:</button>
    </div>
  `;

  ListFiles.appendChild(fileBox);

  if (fileData.type === "application/pdf") {
    const imgEl = fileBox.querySelector(".preview-img");
    generatePdfThumbnail(fileData.data, 400).then(imgSrc => {
      imgEl.src = imgSrc;
    }).catch(err => console.error("Thumbnail error:", err));
  }
}


const fold = document.querySelector("#fold");
const home = document.querySelector("#home");
const FolderSelect = document.querySelector(".Folder-Select"); 
const  Homemid = document.querySelector(".Home-mid");

Homemid.style.display = "block";
FolderSelect.style.display = "none";
fold.addEventListener("click",()=>{

  Homemid.style.display="none";
       FolderSelect.style.display ="flex";
})
home.addEventListener("cick",()=>{
      Homemid.style.display="block";
       FolderSelect.style.display ="none";
})

const show = document.querySelector("#show");
const hide = document.querySelector("#hide");



show .addEventListener("click",()=>{
 hide.style.display="block";
 show.style.display="none";
  ListFiles.style.display ="none";
})
 hide .addEventListener("click",()=>{
 hide.style.display="none";
 show.style.display="block";
   ListFiles.style.display ="block";
})
const photobtn = document.querySelectorAll(".photobtn");
photobtn.forEach(btn =>{
  btn.addEventListener("click",()=>{
      photobtn.forEach(b =>{
        b.classList.remove("active","photobtnbg");
      });
      btn.classList.add("active","photobtnbg");
  });
});