'use strict'


function onInit() {
    createBooks()
    renderBooks()
    renderPageButtons()
    renderFilterByQueryStringParams()
    renderOpenBookByQueryStringParams()
}



function renderOpenBookByQueryStringParams(){
    const queryStringParams = new URLSearchParams(window.location.search)
    const bookId = +queryStringParams.get('id')
    onClickRead(bookId)
}
function renderFilterByQueryStringParams() {
    const queryStringParams = new URLSearchParams(window.location.search)
    const filterBy = {
        minRate: +queryStringParams.get('minRate') || 0,
        maxPrice: +queryStringParams.get('maxPrice') || Infinity,
        name: queryStringParams.get('name') || ''
    }

    // if (!filterBy.minRate && !filterBy.maxPrice) return

    document.querySelector('[name=search-res]').value = (filterBy.name === 'null') ? '' : filterBy.name
    document.querySelector('.min-rating-input').value = filterBy.minRate
    document.querySelector('.max-price-input').value = filterBy.maxPrice
    setFilterBy(filterBy)

}

function renderBooks() {
    const books = getBooksForDisplay()
    const strHTMLs = books.map((book) => {
        return `<tr>
        <td>${book.id}</td>
        <td>${book.name}</td>
        <td>${book.price}</td>
        <td> <button class="read-btn" onclick="onClickRead('${book.id}')">Read</button>
        <button class="update-btn" onclick="onClickUpdate('${book.id}')">Update</button>
        <button class="remove-btn" onclick="onClickRemove('${book.id}')">Remove</button></td>
    </tr>`

    })
    const elTalbe = document.querySelector('.bookshop-display')
    elTalbe.innerHTML = strHTMLs

}

function onHandleInput() {
    const elBtn = document.querySelector('.add-book-btn')
    const elBookName = document.querySelector('[name=book-name]')
    const elBookPrice = document.querySelector('[name=book-price]')
    if (elBookName.value && elBookPrice.value) elBtn.disabled = false

}

function onClickUpdate(bookId) {
    const newPrice = prompt('How much should this book cost?') + '$'
    updatePrice(newPrice, bookId)
    renderBooks()

}

function onClickRead(bookId) {
    const book = getBookById(bookId)
    setCurrBook(bookId)
    const queryStringParams = `?id=${bookId}`
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + queryStringParams
    window.history.pushState({ path: newUrl }, '', newUrl)
    renderReadModal(book)
    showReadModal()
}

function onAddBook(ev) {
    ev.preventDefault()
    document.querySelector('.add-book-btn').disabled = true
    const elBookName = document.querySelector('[name=book-name]')
    const elBookPrice = document.querySelector('[name=book-price]')
    createBook(elBookName.value, elBookPrice.value)
    renderBooks()
    elBookName.value = ''
    elBookPrice.value = ''
}

function onSortBy(sortBy) {
    setSortBy(sortBy)
    renderBooks()
}

function onClickRemove(bookId) {
    removeBook(bookId)
    renderBooks()
}

function setPageIdx(Index) {
    const isDisable = changePageIndex(Index)
    console.log(isDisable)
    const elPrevBtn = document.querySelector('.prev-page-btn')
    const elNextBtn = document.querySelector('.next-page-btn')
    if (isDisable.prev){
        elPrevBtn.disabled = true
        elNextBtn.disabled = false
    }else{
        elPrevBtn.disabled = false
    }
    if (isDisable.next){
        elNextBtn.disabled = true
        elPrevBtn.disabled = false


    }
    // if (currIdx) {
    //     elPrevBtn.disabled = false
    //     // elNextBtn.disabled = true
    // } else{
    //     elNextBtn.disabled = false
    //     elPrevBtn.disabled = true

    // }
    renderBooks()
}

function renderPageButtons() {
    const pageCount = getPageCount()
    console.log(pageCount)
    if (pageCount <= 1) {
        const elNextBtn = document.querySelector('.next-page-btn')
        elNextBtn.disabled = true
        return
    }
    const elPageNavigator = document.querySelector('.page-navigator-btns')
    var strHTML = ''
    for (var i = 0; i < pageCount; i++) {
        const number = i + 1
        strHTML += `<button class="page-number${number}" onclick="setPageIdx(${i})">${number}</button>`
    }
    console.log(strHTML, pageCount)
    elPageNavigator.innerHTML += strHTML
}

function renderReadModal(book) {
    const elModal = document.querySelector('.read-book-modal')
    const strHTMLs = `Name: ${book.name}\nPrice: ${book.price}\nBook Rating: ${book.rating} `
    elModal.querySelector('img').src = book.imgUrl
    elModal.querySelector('.book-description').innerText = strHTMLs
    elModal.querySelector('.rating-button-container').innerHTML = `
    <form onsubmit="onRateBook(event,${book.id})">
    <input name="book-rating-input" min="0" max="10" type="number">
    <button>Rate</button>
    </form>`
}


function onSearchBook(ev) {
    ev.preventDefault()
    const elBookName = document.querySelector('[name=search-res]')
    onSetFilterBy({ name: elBookName.value })
    elBookName.value = ''
}

function onNextPage(elNextBtn) {
    const isDisable = nextPage()
    console.log(isDisable)
    const elPrevBtn = document.querySelector('.prev-page-btn')
    elPrevBtn.disabled = false
    if (isDisable) {
        elNextBtn.disabled = true
    }
    renderBooks()
}
function onPrevPage(elPrevBtn) {
    const isDisabled = prevPage()
    const elNextBtn = document.querySelector('.next-page-btn')
    elNextBtn.disabled = (!isDisabled)
    if (isDisabled) elPrevBtn.disabled = true



    renderBooks()
}

function onSetFilterBy(filterBy) {
    var filterBy = setFilterBy(filterBy)
    renderBooks()
    console.log(filterBy)

    const queryStringParams = `?minRate=${filterBy.minRate}&maxPrice=${filterBy.maxPrice}&name=${filterBy.name}`
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + queryStringParams
    window.history.pushState({ path: newUrl }, '', newUrl)

}

function cleanSearch() {
    onSetFilterBy({ name: null })

}

function onRateBook(ev, bookId) {
    ev.preventDefault()
    const elRating = document.querySelector('[name=book-rating-input]')
    if (!elRating.value) return
    changeRating(elRating.value, bookId)
    renderReadModal(getBookById(bookId))
    elRating.value = ''
}

function showReadModal() {
    const elModal = document.querySelector('.read-book-modal')
    elModal.classList.remove('hide')
}

function closeReadModal() {
    setCurrBook(null)
    const elModal = document.querySelector('.read-book-modal')
    elModal.classList.add('hide')
}