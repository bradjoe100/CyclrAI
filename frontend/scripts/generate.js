import { saveToStorage } from "./data/sets.js";

async function getItems(file) {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", file.type);
    const response = await fetch("http://localhost:3000/get-items", {
        method: "POST",
        body: formData
    });

    if (!response.ok) throw new Error("Failed to upload image");

    let stringResponse = await response.json();
    console.log(stringResponse);
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

document.addEventListener("DOMContentLoaded", () => {
    const uploadFileInput = document.getElementById('uploadFileInput');
    if (uploadFileInput) {
        uploadFileInput.addEventListener("change", async (event) => {
            const file = event.target.files[0];
            if (file) {
                let image = await getImage(file);
                let list = await getItems(file);
                const set = { list, image, isComplete: false };
                console.log(file);
                let id = saveToStorage(set);
                location.href = `analyser.html?id=${id}`;
            }
        });
    }
});