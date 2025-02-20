import { idList, loadSetFromStorage } from './data/sets.js';

function loadItems() {
    let itemsHTML = '';
    for (let id of idList) {
        const set = loadSetFromStorage(id);
        const { items, isComplete } = set;
        if (isComplete)
            itemsHTML +=
            `
                <a href="checklist.html?id=${id}" class="file link">
                    <div class="file-title">${set.title || 'Unnamed List'}</div>
                    <div class="file-bottom">
                        <div class="items-tag">
                            <img src="images/item.png" class="items-tag-icon">
                            <div class="items-tag-text">${items.length} items left</div>
                        </div>
                    </div>
                </a>
            `;
        else
            itemsHTML +=
            `
                <a href="analyser.html?id=${id}" class="file link">
                    <div class="file-title">(Draft)</div>
                    <div class="file-bottom">
                    </div>
                </a>
            `;
        document.querySelector('.file-grid').innerHTML = itemsHTML;
    }
}

loadItems();