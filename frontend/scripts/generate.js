import { saveToStorage } from "./data/sets.js";

async function getItems(file) {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", file.type);
    const response = await fetch("https://cyclrai.onrender.com/get-items", {
        method: "POST",
        body: formData
    });

    if (!response.ok) throw new Error("Failed to upload image");

    let stringResponse = await response.json();
    return stringResponse;
}

async function getImage(file) {
    let imageBase64String;
    const reader = new FileReader();
    const convertToString = new Promise((resolve, reject) => {
        reader.onload = event => resolve(event.target.result);
        reader.onerror = reject;
    });
    reader.readAsDataURL(file);
    imageBase64String = await convertToString;
    return imageBase64String;
}

function renderLoading() {
    document.querySelector('.upload-box').innerHTML = 
    `
        <div class="loading-text-big">
            Uploading your file...
        </div>
        <div class="loading-text-small">
            This may take a while depending on file size.
        </div>
        <div class="loading-spinner">
          <div class="bubble-one"></div>
          <div class="bubble-two"></div>
        </div>
    `
}

async function uploadFile(file) {
    renderLoading();
    let image = await getImage(file);
    let list = await getItems(file);
    const set = { list, image, items: [], isComplete: false };
    let id = saveToStorage(set);
    location.href = `analyser.html?id=${id}`;
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('uploadFileInput').addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (file)
            await uploadFile(file);
    });
    document.querySelector('.upload-box').addEventListener('dragover', (event) => {
        event.preventDefault();
    });
    document.querySelector('.upload-box').addEventListener('drop', async (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file)
            await uploadFile(file);
    });
});