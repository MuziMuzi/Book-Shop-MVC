'use strict'
const STORAGE_KEY = 'booksDB'
const PAGE_SIZE = 5


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
        next: (gPageIdx > gBooks.length / PAGE_SIZE -1)
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