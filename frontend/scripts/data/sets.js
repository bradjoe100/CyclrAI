/** sets.js - handles local storage for the CyclrAI website
 * 
 *  @author Grant Zhou
 *  @since February 8, 2025
 */

export let idList;
export let exp;
loadExp();
loadIdList();

function loadIdList() {
    idList = JSON.parse(localStorage.getItem('id-list')) || [];
}

function saveIdListToStorage() {
    localStorage.setItem('id-list', JSON.stringify(idList));
}

export function loadSetFromStorage(id) {
    return JSON.parse(localStorage.getItem(`set-${id}`)) || [];
}

export function saveToStorage(set) {
    let id = generateId();
    localStorage.setItem(`set-${id}`, JSON.stringify(set));
    idList.push(id);
    saveIdListToStorage();
    return id;
}

export function deleteIndexFromSet(id, index) {
    const set = loadSetFromStorage(id);
    const { items } = set;
    items.splice(index, 1);
    setSetAtId(id, set);
} 

export function setSetAtId(id, set) {
    localStorage.setItem(`set-${id}`, JSON.stringify(set));
}

export function removeFromStorage(id) {
    removeId(id);
    localStorage.removeItem(`set-${id}`);
}

function generateId() {
    while (true) {
        let id = Math.random().toString(36).substring(2, 11);
        if (containsID(id) === false)
            return id;
    }
}

function containsID(id) {
    for (let listId in idList)
        if (listId === id)
            return true;
    return false;
}

function removeId(id) {
    idList = idList.filter(element => element !== id);
    saveIdListToStorage();
}

function loadExp() {
    exp = JSON.parse(localStorage.getItem('exp')) || 0;
}

function saveExpToStorage() {
    localStorage.setItem('exp', JSON.stringify(exp));
}

export function setExp(num) {
    exp = num;
    saveExpToStorage();
}

export function changeExp(dif) {
    exp += dif;
    saveExpToStorage();
}