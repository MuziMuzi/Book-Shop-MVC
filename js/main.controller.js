'use strict'


var currLang = 'en'




function onInit() {
    createBooks()
    renderBooks()
    renderPageButtons()
    setLang()
    renderFilterByQueryStringParams()
    renderOpenBookByQueryStringParams()
}



function renderOperationModal(dataName) {
    var strHTML = ''
    const elModal = document.querySelector('.operation-modal')
    switch (dataName) {
        case ('add-new-book'):
            strHTML = `
            <form onsubmit="onAddBook(event)">
            <h2 data-trans="add-new-book"></h2>
            <input data-trans="new-book-name" type="text" name="book-name" placeholder="What is the new Book name?"
                oninput="onHandleInput()" />
            <input data-trans="new-book-price" type="text" name="book-price" placeholder="How much should it cost?"
                oninput="onHandleInput()" />
            <button data-trans="add-book" class="add-book-btn" disabled>Add</button>
        </form>` 
        break
        case ('sort'):
            strHTML = `<section class="book-sort">
            <h2 data-trans="sort">Sort</h2>
            <button data-trans="sort-by-price" onclick="onSortBy('PRICE')">Lowest Price First</button>
            <button data-trans="sort-by-txt" onclick="onSortBy('ABC')">Abc</button>
            <button data-trans="clear" onclick="onSortBy('CLEAR')"> Reset</button>
        </section>` 
        break
        case ('filter'):
            strHTML = `<section class="book-filter">
            <h2 data-trans="filter">Filter</h2>
            <input type="number" class="min-rating-input" min="0" max="10" placeholder="By minimum rating"
                oninput="onSetFilterBy({minRate: this.value})">
            <input type="number" class="max-price-input" min="0" placeholder="By maximum price"
                oninput="onSetFilterBy({maxPrice: this.value})">
        </section>` 
        break
        case ('search-engine'):
            strHTML = `<section>
            <h2 data-trans="search-engine">Search Engine</h2>
            <form onsubmit="onSearchBook(event)">
                <input type="text" name="search-res">
                <button data-trans="search-btn">Search</button>
            </form>
            <button data-trans="clear" class="Clean-search-btn" onclick="cleanSearch()">Clean Search</button>
        </section>` 
        break
    }
    strHTML += `<button class="exit-oper-modal" onclick="closeOperModal()">X</button>`
    elModal.innerHTML = strHTML

    elModal.classList.add('show-modal')
    setLang()
}

function closeOperModal(){
    const elModal = document.querySelector('.operation-modal')
    elModal.classList.remove('show-modal')
    elModal.innerHTML = ''

}

function setLang() {
    const elBody = document.body
    const elSelect = document.querySelector('select')
    var Lang = setCurrLang(elSelect.value)
    if (Lang === 'he') {
        elBody.classList.add('rtl')
    } else {
        elBody.classList.remove('rtl')
    }
    translatePage()
}

function translatePage() {
    const els = document.querySelectorAll('[data-trans]')
    const trans = getTrans()
    els.forEach((element) => {
        const elementData = element.dataset.trans
        element.innerText = trans[elementData][currLang]
        if (element.placeholder !== undefined) element.placeholder = gTrans[elementData][currLang]

    })
}

function renderOpenBookByQueryStringParams() {
    const queryStringParams = new URLSearchParams(window.location.search)
    const bookId = +queryStringParams.get('id')
    onClickRead(bookId)
}
function renderFilterByQueryStringParams() {
    const queryStringParams = new URLSearchParams(window.location.search)
    const filterBy = {
        minRate: +queryStringParams.get('minRate') || 0,
        maxPrice: +queryStringParams.get('maxPrice') || Infinity,
        // name: queryStringParams.get('name') || ''
    }

    if (!filterBy.minRate && !filterBy.maxPrice) return

    // document.querySelector('[name=search-res]').value = (filterBy.name === 'null') ? '' : filterBy.name
    document.querySelector('.min-rating-input').value = filterBy.minRate
    document.querySelector('.max-price-input').value = filterBy.maxPrice
    setFilterBy(filterBy)

}

function renderBooks() {
    const books = getBooksForDisplay()
    const strHTMLs = books.map((book) => {
        return `
        
        <tr>
        <td>${book.id}</td>
        <td>${book.name}</td>
        <td>${book.price}</td>
        <td> <button data-trans="read" class="read-btn" onclick="onClickRead('${book.id}')">Read</button>
        <button data-trans="update" class="update-btn" onclick="onClickUpdate('${book.id}')">Update</button>
        <button data-trans="remove" class="remove-btn" onclick="onClickRemove('${book.id}')">Remove</button></td>
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
    if (isDisable.prev) {
        elPrevBtn.disabled = true
        elNextBtn.disabled = false
    } else {
        elPrevBtn.disabled = false
    }
    if (isDisable.next) {
        elNextBtn.disabled = true
        elPrevBtn.disabled = false
    }
   
    renderBooks()
    setLang()
}

function renderPageButtons() {
    const pageCount = getPageCount()
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
    elPageNavigator.innerHTML += strHTML
}

function renderReadModal(book) {
    const elModal = document.querySelector('.read-book-modal')
    const strHTMLs = `
    <div>
    <p><span data-trans="name">Name</span>: ${book.name}</p>
    <p><span data-trans="price">Price</span>: ${book.price}</p>
    <p><span data-trans="book-rating">Rate</span>:${book.rating}</p>
    </div>`
    elModal.querySelector('img').src = book.imgUrl
    elModal.querySelector('.book-description').innerHTML = strHTMLs
    elModal.querySelector('.rating-button-container').innerHTML = `
    <form onsubmit="onRateBook(event,${book.id})">
    <input name="book-rating-input" min="0" max="10" type="number">
    <button data-trans="rate" >Rate</button>
    </form>`
    translatePage()
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
    setLang()
}
function onPrevPage(elPrevBtn) {
    const isDisabled = prevPage()
    const elNextBtn = document.querySelector('.next-page-btn')
    elNextBtn.disabled = (!isDisabled)
    if (isDisabled) elPrevBtn.disabled = true



    renderBooks()
    setLang()
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
    const elBlackScreen = document.querySelector('.black-screen')
    elBlackScreen.style.display = 'block'
    const elModal = document.querySelector('.read-book-modal')
    elModal.classList.remove('hide')
}

function closeReadModal() {
    const elBlackScreen = document.querySelector('.black-screen')
    elBlackScreen.style.display = 'none'
    const elModal = document.querySelector('.read-book-modal')
    setCurrBook(null)
    elModal.classList.add('hide')
}