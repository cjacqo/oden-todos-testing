// FACTORY FUNCTIONS
// --- Action Factory
const ActionFactory = () => {}

// --- HTML Elements
const HtmlConfigObj = (type, classesArr, id, heirarchy) => {
    const _defaultClasses = ['page-section-parent', 'inner-section-wrapper', 'component-container', 'inner-component-wrapper', 'text-container', 'text-item']
    const createElement   = () => {
        const element = document.createElement(`${type}`)
        element.classList.add(`${_defaultClasses[heirarchy]}`)
        element.setAttribute('id', `${id}`)
        classesArr.forEach(cn => {
            element.classList.add(`${cn}`)
        })
        return element
    }
    return {createElement}
}
const textBox = (type, className) => {
    const textItem = document.createElement(`${type}`)
    textItem.classList.add('text-item', `${className}`)
    return textItem
}
const buttonElement = (btnType, content, className, id, value, name) => {
    // const button       = document.createElement('button')
    // const className    = title.replace(/\s+/g, '-').toLowerCase()
    // const idName       = title.replace(/\s+/g, '').toLowerCase()
    // button.classList.add(`${actionType}-btn`,`${className}-btn`)
    // button.setAttribute('id', `${idName}Btn`)
    // button.setAttribute('value', `${actionType === 'add-item' ? idName : value}`)
    // button.setAttribute('name', `${actionType}`)
    // button.setAttribute('type', `button`)
    // button.innerHTML = title
    // return button
}
// --- Form Inputs Factory
const ItemInputs = (type, properties) => {
    // - Type can be: folder, todo, note, checklist
    const getInputs = () => {
        let inputs = [{type: 'text', question: 'title'}]
        if (properties) {
            properties.forEach(prop => {
                inputs.push(prop)
            })
        }
        return inputs
    }
    const getType = () => {return type}
    return {getType, getInputs}
}
// --- Database Objects
const DatabaseItem = (type, data) => {
    const getType = () => {return type}
    const getTitle = () => {return data.title}
    const createObj = () => {
        switch(type) {
            case 'folder':
                return FolderItem(type, data)
            case 'todo':
                return ToDoItem(type, data)
            case 'note':
                return NoteItem(type, data)
            case 'checklist':
                return CheckList(type,data)
        }
    }
    return {getType, getTitle, createObj}
}
const FolderItem = (type, data) => {
    const prototype = DatabaseItem(type, data)
    const getItems = () => {return data.items}
    return Object.assign({}, prototype, {getItems})
}
const ToDoItem = (type, data) => {
    const prototype = DatabaseItem(type, data)
    const getDueDate = () => {return data.duedate}
    const getPriority = () => {return data.priority}
    return Object.assign({}, prototype, {getDueDate, getPriority})
}
const NoteItem = (type, data) => {
    const prototype = DatabaseItem(type, data)
    const getNote = () => {return data.note}
    return Object.assign({}, prototype, {getNote})
}
const CheckList = (type, data) => {
    const prototype = DatabaseItem(type, data)
    const getItems      = () => {return data.items}
    const getQuantity   = () => {return getItems().length}
    const getIncomplete = () => {return data.items.filter(item => item.getComplete === false)}
    const checkComplete = () => {return getIncomplete.length > 0}
    return Object.assign({}, prototype, {getItems, getQuantity, getIncomplete, checkComplete})
}
const FolderObject = (title, items, canDelete) => {
    const getTitle = () => {return title}
    const getItems = () => {return items}
    const getCanDelete = () => {return canDelete}
    return {getTitle, getItems, getCanDelete}
}
/* --- Action Factories */
const ActionElement = (action) => {
    const getAction = () => {return action}
    return {getAction}
}
const ToggleElement = (action, content, className, id, name) => {
    const {getAction} = ActionElement(action)
    const getElement = () => {
        const toggle = document.createElement('input')
        toggle.classList.add(`toggler-input`, `${className}`)
        toggle.setAttribute('id', `${id}`)
        toggle.setAttribute('name', `${name}`)
        toggle.setAttribute('type', 'checkbox')
        toggle.innerHTML = content
        return toggle
    }
    return {getAction, getElement}
}
const BackNavigationElement = (action, content, className, id, currentPage) => {
    const {getAction} = ActionElement(action)
    return {getAction}
}
// --- Modals Factory
const Modal = (type) => {
    const getType = () => {return type}
    return {getType}
}
const EditSettingsModal = (type) => {
    const prototype = Modal(type)
    const editActions = [
        {action: 'scan', icon: 'PaperIcon'},
        {action: 'pin', icon: 'TackIcon'},
        {action: 'lock', icon: 'PadLockIcon'},
        {action: 'delete', icon: 'TrashCanIcon'},
        {action: 'share', icon: 'UserIcon'},
        {action: 'sendCopy', icon: 'ArrowBoxIcon'},
        {action: 'findInNote', icon: 'MagnifyingGlassIcon'},
        {action: 'moveNote', icon: 'FolderIcon'},
        {action: 'setLinesAndGrids', icon: 'GridLayoutIcon'},
        {action: 'print', icon: 'PrinterIcon'},
        {action: 'toggleTheme', icon: 'ContrastCircleIcon'}
    ]
}

// MODELS
// --- Database Model
const Database = (function() {
    let _db
    let _folders
    let _items
    let _pinned
    let _objectFormInputsModel

    const _init = (function() {
        _folders        = []
        _items          = {todos: [], notes: [], checklists: []}
        const defaultFolders = ['all', 'todos', 'notes', 'checklists']
        defaultFolders.forEach(folder => {
            let temp = FolderObject(folder, false)
            if (folder !== 'all') {
                let _f = _grabTable(folder)
                _f.push(temp)
            }
            _folders.push(temp)
        })

        _testInsertFolder(80)
        
        _objectFormInputsModel   = {
            folder: ItemInputs('folder'),
            todo: ItemInputs('todo', [{type: 'date', quesiton: 'duedate'}, {type: 'radio', question: 'priority', options: ['low', 'high']}]), 
            note: ItemInputs('note', [{type: 'textarea', question: 'note'}]), 
            checklist: ItemInputs('checklist')
        }

        _db = {folders: _folders, items: _items, pinned: []}
        console.log(_db)
    })()

    function _testInsertFolder(n) {
        for (let i = 0; i < n; i++) {
            let testDisplayFolders = FolderObject(`Test Folder ${i}`, true)
            _folders.push(testDisplayFolders)
        }
    }

    function _grabTable(type) {
        switch(type) {
            case 'folders':
                return _folders
            case 'items':
                return _items
            case 'todos':
                return _items.todos
            case 'notes':
                return _items.notes
            case 'checklists':
                return _items.checklists
            default:
                return _db
        }
    }

    function _isEmpty(dbTable) {
        let count = _grabTable(dbTable).length
        return count === 0
    }

    function _addItem(payload) {console.log("ADD ITEM")}
    function _deleteItem(payload) {console.log("DELETE ITEM")}
    function _editItem(payload) {console.log("EDIT ITEM")}
    function _findItem(payload) {console.log("FIND ITEM")}

    function getDb() {return _db}
    function getDatabase(type) {return _grabTable(type)}
    function getFolders() {return _folders}
    function getObjectInputModels() {return _objectFormInputsModel}

    function handleAction(action, payload) {
        switch(action) {
            case 'add':
                _addItem(payload)
                return
            case 'delete':
                _deleteItem(payload)
                return
            case 'edit':
                _editItem(payload)
            case 'find':
                _findItem(payload)
                return
            case 'pin':
                _pinItems(payload)
                return
        }
    }

    return {
        getDb: getDb,
        getDatabase: getDatabase,
        getFolders: getFolders,
        getObjectInputModels: getObjectInputModels,
        handleAction: handleAction
    }
})()

// CONTROLLERS
// --- Actions
const ActionController = (function() {
    // let _buttons = {toggle: Array, add: Array, delete: Array, find: Array, close: Array, back: Array}
    let _buttons = []

    function getButtons() {return _buttons}
    function getButtonsByType(type) {return _buttons.filter(btn => {return btn.actionType === type})}

    return {
        getButtons: getButtons,
        getButtonsByType: getButtonsByType
    }

})()
// --- Data Controller
const DataController = (function() {
    let _theDatabase

    const _init = (function() {
        _theDatabase = Database.getDb()
    })()

    function getTheDatabases() {return _theDatabase}

    function getTables() {
        const {folders, items: { todos, notes, checklists }, pinned} = _theDatabase
        return {folders, todos, notes, checklists, pinned}
    }
    
    function handleDataChange() {
        console.log('Handle Data Change')
    }

    
    return {
        getTheDatabases: getTheDatabases,
        getTables: getTables,
        handleDataChange: handleDataChange
    }
})()
// --- Events Controller
const EventsController = (function() {
    function handleNavigate(selectedIndex) {
        return selectedIndex
    }

    function handleScroll(scroll) {
        let header = PageView.renderHeader()
        let footer = PageView.renderFooter()
        let ulList = PageView.renderMain()
        if (scroll >= 115) {
            ulList.classList.add('translate-up')
            header.classList.add('glass-bg')
        }
        
        if (scroll > 2200) {
            footer.classList.remove('glass-bg')
        }
        if (scroll < 2200) {
            footer.classList.add('glass-bg')
        }
        if (scroll < 115) {
            ulList.classList.remove('translate-up')
            header.classList.remove('glass-bg')

        }
    }

    return {
        handleNavigate: handleNavigate,
        handleScroll: handleScroll
    }
})()

// VIEWS
const PageView = (function() {
    let _pages
    let _currentPageTitle
    let _currentPageIndex
    let _previousePageTitle
    let _header
    let _main
    let _currentTable
    let _footer
    let _modal

    const _marginWrapper = () => {
        const container = document.createElement('div')
        container.classList.add('margin-wrapper')
        return container        
    }

    const _ListItem = (data, type) => {
        const getData = () => {return data}
        const getElement = () => {
            const li = document.createElement('li')
            const folderIcon  = document.createElement('i')
            const rightContainer = document.createElement('div')
            const folderTitle = document.createElement('p')
            const folderItemCount = document.createElement('p')
            const chevronIcon  = document.createElement('i')
            
            li.classList.add('flex')
            folderIcon.classList.add('fa-solid', 'fa-folder', 'accent-text')
            chevronIcon.classList.add('fa-solid', 'fa-chevron-right')
            folderTitle.classList.add('text-item', 'main-text')
            rightContainer.classList.add('right-container', 'flex')
            folderIcon.classList.add('fa-solid', 'fa-folder')

            const text = data.getTitle()

            folderTitle.innerText = text.charAt(0).toUpperCase() + text.slice(1)
            // HERE IS WHERE THE COUNT OF ITEMS IN EACH FOLDER WILL BE APPENDED
            // folderItemCount.innerText = getData().length

            rightContainer.appendChild(folderTitle)
            rightContainer.appendChild(folderItemCount)
            rightContainer.appendChild(chevronIcon)
            li.appendChild(folderIcon)
            li.appendChild(rightContainer)
            return li
        }
        return {getData, getElement}
    }

    const _ListContainer = (table, id) => {
        const getType = () => {return id}
        const getData = () => {return table}
        const getElement = () => {
            const ul = document.createElement('ul')
            ul.classList.add('list-container')
            ul.setAttribute('id', `${id}Table`)
            table.forEach(item => {
                let li = _ListItem(item).getElement()
                ul.appendChild(li)
            })
            return ul
        }
        return {getType, getData, getElement}
    }

    // --- Header View
    //          + creates elements for...
    //                  | --> header title
    //                  | --> navigation string (Folder > 'Folder Name')
    //                  | --> edit table button
    const _HeaderView = (function() {
        function _createHeaderElement() {
            // --- create the parent container
            const header = document.createElement('header')
            header.classList.add('header-container', 'flex')
            // --- create two elements
            //          1) the page title text element
            //          2) the back button navigation from previous page title (default class of hidden)
            _titleElement = _createTitleContainer()
            header.appendChild(_titleElement)
            if (_currentPageIndex > 0 && _currentPageIndex < _pages.length) {
                _navTitleElement = _createTitleContainer()

                header.appendChild(_navTitleElement)
            }
            _header = header
        }

        function _createTitleContainer() {
            const container = document.createElement('div')
            container.classList.add('page-title-container')
            const textEl = textBox('h1', 'page-title', 'active')

            textEl.innerHTML = _title
            return textEl
        }

        function _createBackButtonContainer() {
            const container = document.createElement('div')
            container.classList.add('navigation-title-container')
            const textEl = textBox('h1', 'navigation-title', 'inactive')

            textEl.innerHTML = _previousePageTitle
            return textEl
        }

        function _createToggleButton() {
            const buttonWrapper = document.createElement('div')
            buttonWrapper.classList.add('button-wrapper', 'action-wrapper', 'toggle-wrapper', 'absolute')
            const button = ToggleElement('toggle', 'Edit', 'edit-toggler', 'headerEditToggler', 'toggle-edit')
            console.log(button.getElement())
            buttonWrapper.appendChild(button.getElement())
            _editToggler = buttonWrapper
        }

        function _createBackButton() {
            const getTitleElement = document.querySelector('.page-title')
            // const text = getTitleElement.textContent
            console.log(getTitleElement)
        }

        function _handlePageTitle() {
            const [current, previous] = getCurrentPageTitle()
            _title = current.charAt(0).toUpperCase() + current.slice(1)
            if (previous) {
                _backNavTitle = previous.charAt(0).toUpperCase() + current.slice(1)
            } else {
                _backNavTitle = ''
            }
        }

        function renderHeader() {
            _handlePageTitle()
            _createHeaderElement()
            return _header
        }
        
        function getHeader()     {return _header}
        function getEditButton() {return _editToggler}

        return {
            renderHeader: renderHeader,
            getHeader: getHeader
        }
    })()
    // --- Main View
    //          + Handles the main content displayed on the page
    const _MainView = (function() {
        let _tableElements = []

        function _createDisplay() {
            const marginWrapper = _marginWrapper()
            marginWrapper.addEventListener('scroll', (e) => {
                e.stopPropagation()
                EventsController.handleScroll(e.target.scrollTop)
            })
            marginWrapper.appendChild(_currentTable[0])
            _main.appendChild(marginWrapper)
        }
        
        function _createMainElement() {
            const main = document.createElement('main')
            main.classList.add('main-container', 'flex', 'col')
            const table = _tableElements.filter(_tb => {
                return _tb.id.includes(_currentPageTitle)
            })
            _currentTable = table
            _main = main
        }

        function _createTableElements() {
            const tempDataObjects = DataController.getTables()
            const {folders, todos, notes, checklists, pinned} = tempDataObjects

            let foldersTable = _ListContainer(folders, 'folders').getElement()
            let todosTable = _ListContainer(todos, 'todos').getElement()
            let notesTable = _ListContainer(notes, 'notes').getElement()
            let checkListsTable = _ListContainer(checklists, 'checklists').getElement()
            let pinnedTable = _ListContainer(pinned, 'pinned').getElement()

            _tableElements.push(foldersTable)
            _tableElements.push(todosTable)
            _tableElements.push(notesTable)
            _tableElements.push(checkListsTable)
            _tableElements.push(pinnedTable)
        }

        function renderMain() {
            _createTableElements()
            _createMainElement()
            _createDisplay()
            return _main
        }
        
        function getMain() {return _main}

        return {
            renderMain: renderMain,
            getMain: getMain
        }
    })()
    // --- Footer View
    //          + creates elemenets for...
    //                  | --> actions/buttons container
    //                  | --> count of items in database/folder
    const _FooterView = (function() {
        let _actionsContainer

        function _createFooterElement() {
            // --- create the parent container
            const footer = document.createElement('footer')
            footer.classList.add('footer-container', 'flex', 'glass-bg')
            // _createActionContainers()
            _footer = footer
        }

        function _createActionContainers(actions) {
            const actionsContainer = document.createElement('div')
        }
        
        function renderFooter() {
            _createFooterElement()
            return _footer
        }

        function getFooter() {return _footer}

        return {
            renderFooter: renderFooter,
            getFooter: getFooter
        }
    })()

    function _init() {
        _header = _HeaderView.renderHeader()
        _main   = _MainView.renderMain()
        _footer = _FooterView.renderFooter()
    }

    function load(pages) {
        _pages = pages
        _currentPageIndex = 0
        _init()
    }

    function getCurrentPageTitle() {
        _currentPageTitle = (_pages[_currentPageIndex].page)
        if (_currentPageIndex > 0) {
            _previousePageTitle = (_pages[_currentPageIndex - 1].page)
        } else {
            _previousePageTitle = ''
        }
        return [_currentPageTitle, _previousePageTitle]
    }
    function getPages() {return _pages}
    function renderHeader() {return _header}
    function renderMain() {return _main}
    function renderFooter() {return _footer}

    return {
        load: load,
        getCurrentPageTitle: getCurrentPageTitle,
        getPages: getPages,
        renderHeader: renderHeader,
        renderMain: renderMain,
        renderFooter: renderFooter
    }
})()

// MAIN IIFE FOR APP START
const ToDoApp = (function() {
    // --- Pages
    const appPages = [
        {
            page: 'folders',
            actions: {
                createFolder: true,
                createItem: true,
                toggleEditCells: 
                [true, 'Cells display buttons to edit and drag/drop', {toggleEditFolderModal: true, dragDropFolders: true}],
                search: true
            }
        },
        {
            page: 'subfolder',
            actions: {
                createItem: true,
                toggleEditModal: 
                [true, 'Edit the gallery view of subfolders'],
                search: true,
                backNavigation: true
            }
        },
        {
            page: 'selected-item',
            actions: {
                createItem: true,
                markup: true,
                toggleEditNoteModal: 
                [true, 'Modal as icons and list with other actions on it', {scanItem: true, pinItem: true, lockItem: true, deleteItem: true, others: true}] ,
                backNavigation: true
            }
        },
        {
            page: 'create-item',
            actions: {
                markup: true,
                backNavigation: true,
                // IF the item being created is a note...
                toggleEditNoteView:
                [true, 'IF the item being created is a note, a modal to toggle line-grids on page']
            }
        }
    ]
    const container = document.getElementById('content')

    function start() {
        Database.getObjectInputModels()
        console.log(Database.getFolders())
        console.log(Database.getDatabase('todos'))
        PageView.load(appPages)
        container.appendChild(PageView.renderHeader())
        container.appendChild(PageView.renderMain())
        container.appendChild(PageView.renderFooter())
    }

    return {
        start: start
    }
})()

ToDoApp.start()



// magnifying glass = fa-solid fa-magnifying-glass
// folder           = fa-solid fa-folder
// add folder       = fa-solid fa-folder-plus
// chevron          = fa-solid fa-chevron-right
// bars             = fa-solid fa-bars
// times            = fa-solid fa-times
// ellipsis         = fa-solid fa-ellipsis-vertical
// pen and paper    = fa-solid fa-pen-to-square
// trash            = fa-solid fa-trash-can
// check list       = fa-solid fa-list-ul
// camera           = fa-solid fa-camera
// pen              = fa-solid fa-pen
// gallery          = fa-solid fa-table-cells-large
// circle check     = fa-solid fa-circle-check
// passing arrows   = fa-solid fa-arrow-right-arrow-left
// paper click      = fa-solid fa-paperclip
// pin              = fa-solid fa-map-pin
// lock             = fa-solid fa-lock
// lock open        = fa-solid fa-lock-open
// share            = fa-solid fa-arrow-up-right-from-square
// plus user share  = fa-solid fa-user-plus
// printer          = fa-solid fa-print
// microphone       = fa-solid fa-microphone
// half fill circle = fa-solid fa-circle-half-stroke













// const folderTest = DatabaseItem('folder', {title: 'folder item', items: 'array of items'}).createObj()
// const todoTest = DatabaseItem('todo', {title: 'todo item', duedate: '11-1-2023', priority: 'low'}).createObj()
// const noteTest = DatabaseItem('note', {title: 'note item', note: 'This is the note'}).createObj()
// const checkListTest = DatabaseItem('checklist', {title: 'test item'}).createObj()
// console.log(folderTest.getTitle())
// console.log(folderTest.getItems())

// console.log(todoTest.getTitle())
// console.log(todoTest.getPriority())

// console.log(noteTest.getTitle())
// console.log(noteTest.getNote())