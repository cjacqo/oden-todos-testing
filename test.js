// GLOBAL FUNCTIONS
//          + Handles creation of a classnames array that helps
//            set global css class names of flex, and col
function createClassNamesList(name, isFlex, isCol) {
    let arr = []
    arr.push(name)
    if (isFlex) {
        arr.push('flex')
    } 
    if (isCol) {
        arr.push('col')
    }
    return arr
}
//          + TEST: Just used to add data to the database to test
function createItemObject(value) {
    switch(value) {
        case 'folder':
            return Folder('Folder Item Add Test')
        case 'todo':
            return ToDo('ToDo Item Add Test', '11-1-2023', 1)
        case 'note':
            return Note('Note Item Add Test', 'This is the text of the note')
        case 'checklist':
            return CheckList('Checklist Item Add Test')
    }
}

// MODELS
const Item = (title) => {
    const getTitle = () => {return title}
    return {getTitle}
}

const ToDo = (title, duedate, num) => {
    const {getTitle}    = Item(title)
    const priority      = ['low', 'high']
    const getDueDate    = () => {return duedate}
    const getPriority   = () => { if (!num) {return} return priority[num] }
    return {getTitle, getDueDate, getPriority}
}

const Note = (title, text) => {
    const {getTitle}    = Item(title)
    const getText       = () => {return text}
    return {getTitle, getText}
}

const CheckList = (title, items) => {
    const {getTitle}    = Item(title)
    const getItems      = () => {return items}
    const getIncomplete = () => {return items.filter(item => item.getComplete === false)}
    const checkComplete = () => {return getIncomplete.length > 0}
    return {getTitle, getItems, getIncomplete, checkComplete}
}

const CheckListItem = (text) => {
    const getText       = () => {return text}
    const complete      = false
    const getComplete   = () => {return complete}
    return {getText, getComplete}
}

const Folder = (title, items) => {
    const dateCreated    = new Date()
    const {getTitle}     = Item(title)
    const getItems       = () => {return items}
    const getDateCreated = () => {return dateCreated}
    return {getTitle, getItems, getDateCreated}
}

const DatabaseModel = (tables) => {
    const arr = []
    for (let i = 0; i < tables; i++) {
        arr[i] = []
    }
    return arr
}

// CONTROLLERS
//          + Database Controller
const Database = (function() {
    let _db      = []
    let _folders = []

    function _isEmpty() {
        return _db.length === 0
    }
    function _getSubData(index) {
        if (_isEmpty) {
            return
        }
        return _db[index].length !== 0 ? _db[index] : 'Empty'
    }
    function _getTableIndexByTableName(name) {return DatabaseView.getTables().indexOf(name)}
    
    // --- manipulate the tables
    function _addItem(payload, tableIndex) {_db[tableIndex].push(payload)}
    function _addFolder(payload)           {_folders.push(payload)}
    function _removeItem(payload, tableIndex) {
        const temp      = _db[tableIndex][payload]
        _db[tableIndex] = _db[tableIndex].filter(obj => obj !== temp)
    }
    function _removeFolder(payload) {
        const temp = _folders.indexOf(payload)
        _folders   = _folders.filter(folder => folder !== temp)
    }

    const _init = (function()   {return _db = DatabaseModel(3)})()

    function getDatabase()      {return _db}
    function getFolders()       {return _folders}
    function getToDos()         {return _getSubData(0)}
    function getNotes()         {return _getSubData(1)}
    function getCheckList()     {return _getSubData(2)}

    function handleAction(payload, e, index) {
        const { value, name } = e.target
        const table    = _getTableIndexByTableName(value)
        if (name.includes('add')) {
            value === 'folder' ? _addFolder(payload) : _addItem(payload, table)
        }
        if (name.includes('delete')) {
            _removeItem(payload, index)
        }
        DatabaseView.render()
    }

    return {
        getDatabase: getDatabase,
        getFolders: getFolders,
        getToDos: getToDos,
        getNotes: getNotes,
        getCheckList: getCheckList,
        handleAction: handleAction
    }
})()

//          + Database View Controller
const DatabaseView = (function() {
    let _currentView
    let _views                  = ['Folders', 'Items']
    let _tables                 = ['todo', 'note', 'checklist']
    // Parent Containers
    let _viewContainer          = document.createElement('div')
    let _folderContainer        = document.createElement('div')
    let _dataContainer          = document.createElement('div')
    // Parent Container Ids
    const _viewId               = 'databaseTableContainer'
    const _foldersViewId        = 'foldersTableContainer'
    let _children              // container for table of item tables

    // --- handle the data that is appended to the DOM
    function _updateDataView() {
        _children = []
        let count = 0
        Database.getDatabase().forEach(table => {
            _children.push(tableElement(table, count, _tables[count]))
            count++
            return
        })
        _children.forEach(element => {
            _dataContainer.appendChild(element)
        })
    }
    function _changeCurrentView() {
        _viewContainer.childNodes.forEach(el => {
            const viewElementValue = parseInt(el.getAttribute('value'))
            if (viewElementValue !== _currentView) {
                el.classList.add('toggle-out')
            } else {
                el.classList.remove('toggle-out')
            }
        })
    }

    // --- 

    const _init = (function()   {
        _currentView = 0
        _viewContainer.classList.add('table-parent')
        _folderContainer.classList.add('databse-table-container', 'folders-container')
        _dataContainer.classList.add('database-table-container', 'database-container', 'toggle-out')
        _folderContainer.setAttribute('id', _foldersViewId)
        _dataContainer.setAttribute('id', _viewId)
        _folderContainer.setAttribute('value', 0)
        _dataContainer.setAttribute('value', 1)
        _viewContainer.appendChild(_folderContainer)
        _viewContainer.appendChild(_dataContainer)
    })()

    function getViewId() {return _viewId}
    function getView()   {return _viewContainer}
    function getTables() {return _tables}
    function getViews()  {return _views}

    function toggleView(index) {
        const value = parseInt(index)
        if (_currentView !== value) {
            _currentView = value
            _changeCurrentView()
        }
        return
    }

    function render() {
        _dataContainer.innerHTML = ''
        _updateDataView()
    }

    return {
        getViewId: getViewId,
        getView: getView,
        getTables: getTables,
        getViews: getViews,
        toggleView: toggleView,
        render: render
    }
})()

//          + Actions View Controller
const ActionsController = (function() {
    let _details    = { type: String, actions: [] }
    let _buttons    = []
    let _containers = []
    let _container

    function _createElements(controllerDetails) {
        const { type, actions } = controllerDetails
        const container = containerElement(createClassNamesList(`${type}-actions`, true, false))
        let btnsArr     = []
        actions.forEach(action => {
            const value = actions.indexOf(action)
            const button = buttonElement(action, type, value)
            btnsArr.push(button)
            container.appendChild(button)
        })
        _containers.push(container)
        return btnsArr
    }
    function _addListeners(controllerDetails, btnsArr) {
        const { type, actions } = controllerDetails
        btnsArr.map(btn => {
            const value = btn.getAttribute('value')
            switch (type) {
                case 'toggle-views':
                    btn.addEventListener('click', (e) => {
                        DatabaseView.toggleView(e.target.value)
                    })
                    return
                case 'add-item':
                    btn.addEventListener('click', (e) => {
                        const value = e.target.value
                        const createdObject = createItemObject(value)
                        Database.handleAction(createdObject, e)
                    })
                    return
                case 'delete':
                    console.log(btn)
            }
        })
    }
    function _appendElements() {
        _buttons.forEach(el => {
            _container.appendChild(el)
        })
        return
    }

    function _init(controllerDetails) {
        const btnsArr = _createElements(controllerDetails)
        _addListeners(controllerDetails, btnsArr)
        _appendElements()
        return
    }

    function createActionController(controllerType, actionsArr) {
        const temp   = _details
        temp.type    = controllerType
        temp.actions = actionsArr
        _init(temp)
    }

    function createDeleteButton(title, type, index, tableType) {
        console.log(tableType)
    }

    function getContainer(index) {return _containers[index]}
    
    return {
        createActionController: createActionController,
        createDeleteButton: createDeleteButton,
        getContainer: getContainer
    }
    
})()

// ELEMENTS
//          + Container
const containerElement = (classNames) =>  {
    const container = document.createElement('div')
    classNames.forEach(name => {
        if (name === 'flex' || name === 'col') {
            container.classList.add(`${name}`)
        } else {
            container.classList.add(`${name}-container`)
        }
    })
    return container
}
//          + Button
const buttonElement = (title, actionType, value) => {
    const button       = document.createElement('button')
    const className    = title.replace(/\s+/g, '-').toLowerCase()
    const idName       = title.replace(/\s+/g, '').toLowerCase()
    button.classList.add(`${actionType}-btn`,`${className}-btn`)
    button.setAttribute('id', `${idName}Btn`)
    button.setAttribute('value', `${actionType === 'add-item' ? idName : value}`)
    button.setAttribute('name', `${actionType}`)
    button.setAttribute('type', `button`)
    button.innerHTML = title
    return button
}
//          + Table Element
const tableElement = (tableArr, tableIndex, tableType) => {
    const tableContainer = containerElement(createClassNamesList('table', true, true))
    tableContainer.setAttribute('id', `${tableType}Table`)
    for (let i = 0; i < tableArr.length; i++) {
        const itemContainer = containerElement(createClassNamesList('table-item', true, false))
        const itemElement   = document.createElement('p')
        const button        = buttonElement('Delete', 'delete-item', i)
        button.addEventListener('click', (e) => {
            e.stopPropagation()
            Database.handleAction(i, e, tableIndex)
        })
        itemElement.innerHTML = tableArr[i].getTitle()
        itemContainer.appendChild(itemElement)
        itemContainer.appendChild(button)
        tableContainer.appendChild(itemContainer)
    }
    return tableContainer
}
//          + Folder Element
const folderElement = () => {

}

// MAIN IIFE FOR APP START
const ToDoApp = (function() {
    const container = document.getElementById('content')

    const p = document.createElement('p')
    p.innerText = 'Hello'
    container.appendChild(p)

    // --- CREATE ELEMENTS VIA CONTROLLERS
    //          + Action Controllers
    ActionsController.createActionController('toggle-views', DatabaseView.getViews())
    ActionsController.createActionController('add-item', ['Folder', 'ToDo', 'Note', 'Checklist'])
    const toggleControllerContainer     = ActionsController.getContainer(0)
    const addItemsControllerContainer   = ActionsController.getContainer(1)
    
    container.appendChild(toggleControllerContainer)
    container.appendChild(addItemsControllerContainer)
    // --- database table
    container.appendChild(DatabaseView.getView())
})()