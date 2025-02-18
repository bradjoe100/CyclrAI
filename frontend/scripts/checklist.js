import { loadSetFromStorage, deleteIndexFromSet, removeFromStorage, changeExp } from "./data/sets.js";
import { incrementExp } from "./utility.js";

function renderItems() {
    const id = new URLSearchParams(window.location.search).get('id');
    const set = loadSetFromStorage(id);
    const { items, image } = set;
    let columns = getComputedStyle(document.querySelector('.item-grid')).getPropertyValue('grid-template-columns').split(' ').length;
    let itemsHTML = '';
    for (let i = 0; i < columns; i++) {
        itemsHTML += `<div class="item-column">`;
        for (let j = 0; j < Math.floor((items.length - i - 1) / columns + 1); j++) {
            const item = items[j * columns + i];
            itemsHTML += `
                <div class="item">
                    <div class="item-button-box">
                        <div id="item-button-${j*columns+i}" class="item-button">
                            <img src="${getStatusImage(item.status)}" class="item-button-image">
                        </div>
                    </div>
                    <div class="item-right">
                        <div class="item-title">${item.item}</div>
                        <div class="item-text">${item.description}</div>
                    </div>
                </div>
            `;
        }
        itemsHTML += `</div>`;
    }
    document.querySelector('.item-grid').innerHTML = itemsHTML;
    document.querySelector('.image').src = image;
    for (let i = 0; i < items.length; i++) {
        document.getElementById(`item-button-${i}`).addEventListener("click", () => {deleteIndexFromSet(id, i); incrementExp(); renderItems()});
    }

    const completeButton = document.querySelector('.complete-button') || document.querySelector('.gray-complete-button');
    if (completeButton)
        completeButton.className = items.length !== 0 ? 'link gray-complete-button' : 'link complete-button';
    completeButton.addEventListener("click", () => {removeFromStorage(id)});
}

function getStatusImage(status) {
    switch (status) {
        case 'recyclable':
            return 'images/recycling-symbol-white.png';
        case 'special':
            return 'images/spec-recycling-symbol-white.png';
        default:
            return 'images/none-white.png'
    }
}

renderItems();