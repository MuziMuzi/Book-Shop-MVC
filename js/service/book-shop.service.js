'use strict'
const STORAGE_KEY = 'booksDB'
const PAGE_SIZE = 5
const gTrans = {
    header: {
        en: 'Welcome to the Book shop',
        he: 'ברוך הבא לחנות הספרים'
    },
    'add-new-book': {
        en: 'Add new book',
        he: 'הוסף ספר חדש'
    },
    'new-book-name': {
        en: 'What is the new Book name?',
        he: 'מה שם הספר החדש?'
    },
    'new-book-price': {
        en: 'How much should it cost?',
        he: 'כמה הוא צריך לעלות?'
    },
    'add-book': {
        en: 'Add',
        he: 'הוסף'
    },
    sort: {
        en: 'Sort',
        he: 'מיין'
    },
    'sort-by-price': {
        en: 'Lowest Price First',
        he: 'מהמחיר הנמוך ביותר'
    },
    'sort-by-txt': {
        en: 'text',
        he: 'על פי הטקסט'
    },
    clear: {
        en: 'clear',
        he: 'נקה'
    },
    filter: {
        en: 'Filter',
        he: 'סנן'
    },
    'filter-price': {
        en: 'By maximum price',
        he: 'על פי מחיר מקסימאלי'
    },
    'search-engine': {
        en: 'Search Engine',
        he: 'חפש על פי שם'
    },
    'search-btn': {
        en: 'Search',
        he: 'חפש'
    },
    id: {
        en: 'Id',
        he: 'איידי'
    },
    name: {
        en: 'Name',
        he: 'שם הספר'
    },
    price: {
        en: 'Price',
        he: 'מחיר'
    },
    actions: {
        en: 'Actions',
        he: 'פעולות'
    },
    'prev-btn': {
        en: 'Previous',
        he: 'הקודם'
    },
    'next-btn': {
        en: 'Next',
        he: 'הבא'
    },
    read: {
        en: 'Read',
        he: 'קרא'
    },
    update: {
        en: 'update',
        he: 'עדכן'
    },
    remove: {
        en: 'remove',
        he: 'הסר'
    },
    'book-rating': {
        en: 'Book Rating:',
        he: 'דירוג הספר:'
    },
    rate: {
        en: 'Rate',
        he: 'דרג'
    }

}
var currLang = 'en'


var gBooks
var gFilterBy = { minRate: 0, maxPrice: Infinity, name: null }
var gSearchBy
var gPageIdx = 0
var gSortBy = null
var gCurrBook





function createBooks() {
    var books = loadFromStorage(STORAGE_KEY)
    if (!books || !books.length) {
        books = [
            {
                id: makeId(),
                name: 'Book',
                price: getRandomIntInclusive(4, 15) + '$',
                imgUrl: "pictures/book1.jpg",
                rating: 3
            }
            , {
                id: makeId(),
                name: 'Comics',
                price: getRandomIntInclusive(4, 15) + '$',
                imgUrl: "pictures/book2.jpg",
                rating: 5
            }
            , {
                id: makeId(),
                name: 'Veg',
                price: getRandomIntInclusive(4, 15) + '$',
                imgUrl: "pictures/book3.jpg",
                rating: 7
            }
        ]
    }
    gBooks = books
    _saveBooksToStorage()

}

function changeRating(newRating, bookId) {
    const bookIdx = gBooks.findIndex((book) => book.id === String(bookId))
    gBooks[bookIdx].rating = +newRating
    _saveBooksToStorage()

}

function createBook(name, price) {
    var newBook = {
        id: makeId(),
        name,
        price: price + '$',
        imgUrl: `pictures/book${getRandomIntInclusive(1, 3)}.jpg`,
        rating: 0
    }
    gBooks.push(newBook)
    _saveBooksToStorage()

}

function removeBook(bookId) {
    gBooks = gBooks.filter((book) => book.id !== bookId)
    _saveBooksToStorage()
}

function updatePrice(newPrice, bookId) {
    gBooks.forEach((book, index, books) => {
        if (book.id === bookId)
            books[index].price = newPrice
    })
    _saveBooksToStorage()

}

function setFilterBy(filterBy) {
    if (filterBy.maxPrice !== undefined) gFilterBy.maxPrice = filterBy.maxPrice
    if (filterBy.minRate !== undefined) gFilterBy.minRate = filterBy.minRate
    gFilterBy.name = (filterBy.name && filterBy.name !== 'null') ? filterBy.name : null
    console.log(gFilterBy)
    return gFilterBy

}


function setSortBy(sortBy) {
    switch (sortBy) {
        case 'CLEAR':
            gSortBy = null;
            break
        case 'ABC':
            gSortBy = 'ABC'
            break
        case 'PRICE':
            gSortBy = 'PRICE'
            break

    }
}

function changePageIndex(Index) {
    gPageIdx = Index
    console.log(gPageIdx)
    return {
        prev: (gPageIdx === 0),
        next: (gPageIdx > gBooks.length / PAGE_SIZE - 1)
    }
}

function getPageCount() {
    return Math.floor(gBooks.length / PAGE_SIZE) + 1
}
function nextPage() {
    gPageIdx++
    return (gPageIdx <= gBooks.length / PAGE_SIZE)
}
function prevPage() {
    if (gPageIdx > 0) gPageIdx--
    return (gPageIdx === 0)

}

function setCurrLang(lang){
    currLang = lang
    return currLang
}

function getTrans(){
    return gTrans
}

function getBooksForDisplay() {
    var books = gBooks.filter(book => book.rating >= gFilterBy.minRate &&
        +book.price.slice(0, -1) <= gFilterBy.maxPrice)
    if (gFilterBy.name) {
        books = books.filter(book => book.name.includes(gFilterBy.name))
        // gFilterBy.name = null
    }
    switch (gSortBy) {
        case 'ABC':
            books = books.sort((book1, book2) => book1.name.localeCompare(book2.name))
            break
        case 'PRICE':
            books = books.sort((book1, book2) => +book1.price.slice(0, -1) - +book2.price.slice(0, -1))
            break
    }
    const startingIndex = gPageIdx * PAGE_SIZE
    books = books.slice(startingIndex, startingIndex + PAGE_SIZE)

    return books
}

function getBookById(id) {
    return gBooks.find((book) => book.id === String(id))
}

function _saveBooksToStorage() {
    saveToStorage(STORAGE_KEY, gBooks)
}

function setCurrBook(bookId) {
    gCurrBook = gBooks.find(book => book.id === bookId)

}