import { changeExp, exp } from './data/sets.js';

export function incrementExp(amount = 1) {
    changeExp(amount);
    renderHeader();
}

function renderHeader() {
    document.querySelector('.exp-icon-text').innerHTML = exp;
}

renderHeader();