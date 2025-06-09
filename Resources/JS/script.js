console.log(JSON_DATA);

const POPULAR_ITEM_ID = 'popular-item-';
let POPULAR_ITEMS = {};
const POPULAR_ITEMS_COUNT = 6;

const CATEGORY_ENTRIES_COUNT = 5;
const CATEGORY_NAMES_COUNT = 10;

const SELECTION = document.querySelector('.item-category-selection');
const INPUT_ITEM_NAME = document.querySelector('.item-name-input');

function ComparePrices(category, name, returnOnlyOneVar = false, returnOnlyLink = false) {
    const ZHELEZA_PRICE = JSON_DATA[category][name].zheleza.price;
    const COMPDAY_PRICE = JSON_DATA[category][name].compday.price;
    const ZHELEZA_LINK = JSON_DATA[category][name].zheleza.url;
    const COMPDAY_LINK = JSON_DATA[category][name].compday.url;
        
    const PRICE = (ZHELEZA_PRICE < COMPDAY_PRICE ? ZHELEZA_PRICE : COMPDAY_PRICE).trim();
    const LINK = (ZHELEZA_PRICE < COMPDAY_PRICE ? ZHELEZA_LINK : COMPDAY_LINK).trim();

    if (returnOnlyOneVar) {
        return returnOnlyLink ? LINK : PRICE;
    }
    
    return [PRICE, LINK];
}

function RandomisePopularNames(maxNameLength = 44) {
    POPULAR_ITEMS = {};

    for (let i = 0; i < POPULAR_ITEMS_COUNT; i++) {
        let RANDOM_NAME = '';
        let RANDOM_CATEGORY_INDEX = 0;
        let RANDOM_NAME_INDEX = 0;
        let RANDOM_CATEGORY = '';

        do {
            RANDOM_CATEGORY_INDEX = Math.floor(Math.random() * CATEGORY_ENTRIES_COUNT );
            RANDOM_NAME_INDEX = Math.floor(Math.random() * CATEGORY_NAMES_COUNT);

            RANDOM_CATEGORY = Object.keys(JSON_DATA)[RANDOM_CATEGORY_INDEX];
            RANDOM_NAME = Object.keys(JSON_DATA[RANDOM_CATEGORY])[RANDOM_NAME_INDEX];
        } while( RANDOM_NAME.length > maxNameLength || Object.keys(POPULAR_ITEMS).includes(RANDOM_NAME) );

        POPULAR_ITEMS[RANDOM_NAME] = ComparePrices(RANDOM_CATEGORY, RANDOM_NAME, true, true);
    }
}

function SetPopularItems() {
    const POPULAR_ITEMS_LINKS = document.querySelectorAll('.popular-item');

    for (let i = 0; i < Object.keys(POPULAR_ITEMS).length; i++) {
        let populerItemId = `#${POPULAR_ITEM_ID}${i+1}`;
        let popularItem = document.querySelector(populerItemId);

        POPULAR_ITEMS_LINKS[i].href = Object.values(POPULAR_ITEMS)[i];
        popularItem.textContent = Object.keys(POPULAR_ITEMS)[i];
    }
}

RandomisePopularNames();
SetPopularItems();

///////////////////////

function CreateNewCard(name='', image='', price='', link='') {
    const CARDS_CONTAINER = document.querySelector('.catalogue-content');

    const NEW_CARD_CONTENT = document.createElement('div');
    NEW_CARD_CONTENT.setAttribute('class', 'catalogue-item');
    
    const NEW_CARD_IMAGE = document.createElement('img');
    NEW_CARD_IMAGE.setAttribute('class', 'catalogue-item-image');
    NEW_CARD_IMAGE.setAttribute('src', image);

    const NEW_CARD_NAME = document.createElement('p');
    NEW_CARD_NAME.setAttribute('class', 'catalogue-item-name');
    if (name.length < 40 ) {
        NEW_CARD_NAME.setAttribute('style', 'font-size: 24px;');
    }
    NEW_CARD_NAME.appendChild(document.createTextNode(name));

    const NEW_CARD_LINK = document.createElement('a');
    NEW_CARD_LINK.setAttribute('class', 'catalogue-item-buy-button');
    NEW_CARD_LINK.setAttribute('href', link);
    NEW_CARD_LINK.appendChild(document.createTextNode('Цена: ' + price));

    NEW_CARD_CONTENT.appendChild(NEW_CARD_IMAGE);
    NEW_CARD_CONTENT.appendChild(NEW_CARD_NAME);
    NEW_CARD_CONTENT.appendChild(NEW_CARD_LINK);

    CARDS_CONTAINER.appendChild(NEW_CARD_CONTENT);
}

function RemoveCards() {
    const CARDS = document.querySelectorAll('.catalogue-item');
    CARDS.forEach( card => card.remove());
}

function InitializeCatalogue() {
    for (let category in JSON_DATA) {

        for (let itemName in JSON_DATA[category]) {
            const ITEM_IMAGE = JSON_DATA[category][itemName]['image'];
            const [ITEM_PRICE, ITEM_LINK] = ComparePrices(category, itemName);

            CreateNewCard(itemName, ITEM_IMAGE, ITEM_PRICE + ' ₽', ITEM_LINK);
        }
    }
}

InitializeCatalogue();

/////////

function CreateEmptyCatalogueText() {
    const CARDS_CONTAINER = document.querySelector('.catalogue-content');

    const EMPTY_P = document.createElement('p');
    EMPTY_P.setAttribute('class', 'catalogue-empty-text');
    EMPTY_P.appendChild(document.createTextNode('Не найдено :('));

    CARDS_CONTAINER.appendChild(EMPTY_P);
}

function RemoveEmptyCatalogueText() {
    document.querySelector('.catalogue-empty-text').remove();
}

SELECTION.addEventListener('change', function() {
    const SELECTION_VALUE = SELECTION.value;

    if (INPUT_ITEM_NAME.value == '')
        ChangeCatalogue(SELECTION_VALUE);
    else
        SearchByItemName(INPUT_ITEM_NAME.value, SELECTION_VALUE);
});

function ChangeCatalogue(category = null, name = null, data = JSON_DATA, newData = false) {
    if (!category && !name && !newData) return;

    RemoveCards();

    if (category == 'all') {
        InitializeCatalogue();
        return;
    }

    if (name != null) {
        const ITEM_IMAGE = data[category][name]['image'];
        const [ITEM_PRICE, ITEM_LINK] = ComparePrices(category, name);
        CreateNewCard(name, ITEM_IMAGE, ITEM_PRICE + ' ₽', ITEM_LINK);
        return;
    }

    if (newData) {
        for (let category in data) {

            for (let itemName in data[category]) {
                const ITEM_IMAGE = data[category][itemName]['image'];
                const [ITEM_PRICE, ITEM_LINK] = ComparePrices(category, itemName);

                CreateNewCard(itemName, ITEM_IMAGE, ITEM_PRICE + ' ₽', ITEM_LINK);
            }
        }
        return;
    }

    for (let itemName in data[category]) {
        const ITEM_IMAGE = data[category][itemName]['image'];
        const [ITEM_PRICE, ITEM_LINK] = ComparePrices(category, itemName);

        CreateNewCard(itemName, ITEM_IMAGE, ITEM_PRICE + ' ₽', ITEM_LINK);
    }
}

/////////

function SearchByItemName(name, categ= null) {
    let items = {};

    console.log(categ);
    if (categ != 'all') {
        console.log('Entered categ');
        for ( let key of Object.keys(JSON_DATA[categ]) ) {
                let upperKey = key.toUpperCase();
                if (upperKey.includes(name.toUpperCase())) {
                    if (!Object.keys(items).includes(categ)) {
                        items[categ] = { [key] : JSON_DATA[categ][key] };
                    }
                }
            }
    }
    else {
        for (let category in JSON_DATA) {
            for ( let key of Object.keys(JSON_DATA[category]) ) {
                let upperKey = key.toUpperCase();
                if (upperKey.includes(name.toUpperCase())) {
                    if (!Object.keys(items).includes(category)) {
                        items[category] = { [key] : JSON_DATA[category][key] };
                    }
                }
            }
        }
    }

    if (Object.keys(items).length != 0) {
        if (document.querySelector('.catalogue-empty-text')) RemoveEmptyCatalogueText(); 
        ChangeCatalogue(null, null, items, true);
    }
    else if (!document.querySelector('.catalogue-empty-text')){
        RemoveCards();
        CreateEmptyCatalogueText();
    }
}

INPUT_ITEM_NAME.addEventListener('keyup', function() {
    const INPUT_NAME = INPUT_ITEM_NAME.value;

    if (INPUT_NAME == '') {
        RemoveCards();
        InitializeCatalogue();
        return;
    }

    SearchByItemName('' + INPUT_NAME.trim(), SELECTION.value);
})