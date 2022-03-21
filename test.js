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
/* --- Database Items */
const Item = (title) => {
    const getTitle    = () => {return title}
    let inputConfig = {
        title: {type: 'text'}
    }
    return {getTitle, inputConfig}
}

const ToDo = (title, duedate, num) => {
    const {getTitle}     = Item(title)
    const _priority      = ['low', 'high']
    const getDueDate     = () => {return duedate}
    const getPriority    = () => { if (!num) {return} return _priority[num] }
    const getInputConfig = () => {
        let temp = Item().inputConfig
        temp.duedate  = {type: 'date'}
        temp.priority = {type: 'checkbox', options: _priority}
        return temp
    }
    return {getTitle, getDueDate, getPriority, getInputConfig}
}

const Note = (title, text) => {
    const {getTitle}    = Item(title)
    const getText       = () => {return text}
    const getInputConfig = () => {
        let temp  = Item().inputConfig
        temp.text = {type: 'textarea'}
        return temp
    }
    return {getTitle, getText, getInputConfig}
}

const CheckList = (title, items, quantity) => {
    const {getTitle}    = Item(title)
    const getItems      = () => {return items}
    const getQuantity   = () => {return getItems().length}
    const getIncomplete = () => {return items.filter(item => item.getComplete === false)}
    const checkComplete = () => {return getIncomplete.length > 0}
    const getInputConfig = () => {
        let temp       = Item().inputConfig
        temp.quantity  = {type: 'number'}
        return temp
    }
    return {getTitle, getItems, getQuantity, getIncomplete, checkComplete, getInputConfig}
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

/* --- Database Tables */
const DatabaseModel = (tables) => {
    const arr = []
    for (let i = 0; i < tables; i++) {
        arr[i] = []
    }
    return arr
}

/* --- Modal */
const Modal = (type) => {
    const getType = () => {return type}
    const getForm = (questions) => {
        const formContainer = document.createElement('div')
        const formElement   = document.createElement('form')
        formContainer.classList.add('modal-container')
        questions.forEach(question => {
            formElement.appendChild(question)
        })
        formContainer.appendChild(formElement)
        return formContainer
    }
    return {getType, getForm}
}

const FormModal = (title) => {
    const {getTitle}    = Modal(title)
    return {getTitle}
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
                        const value  = e.target.value
                        const action = e.target.name
                        ModalsController.handleSelection(value, action)
                        //@TEST
                        // const createdObject = createItemObject(value)
                        // Database.handleAction(createdObject, e)
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
//          + Modal View Controller
const ModalsController = (function() {
    const _modalContainer  = document.createElement('div')
    let _contentContainer
    let _currentModal      = null
    let _modalOpen         = false
    let _modalTypes        = DatabaseView.getTables()
    let _modalElements     = []
    const _modalObj        = { type: String, element: Element }

    function _createModalElements(configObj, className) {
        let formControlArr = []
        for (const [key, value] of Object.entries(configObj)) {
            const container   = document.createElement('div')
            const label       = document.createElement('label')
            const input       = document.createElement('input')

            if (value.options) {
                value.options.forEach(option => {
                    let tempLabel = label
                    let tempInput = input
                    tempLabel.setAttribute('for', value.option)
                    tempInput.setAttribute('type', value.type)
                    tempInput.setAttribute('value', option)
                    tempInput.setAttribute('name', key)
                    tempLabel.innerText = option
                    tempInput.addEventListener('click', (e) => {
                        e.stopPropagation()
                    })
                    container.appendChild(tempLabel)
                    container.appendChild(tempInput)
                })
            } else {
                let tempLabel = label
                let tempInput = input
                tempLabel.setAttribute('for', key)
                tempInput.setAttribute('type', value.type)
                tempInput.setAttribute('name', key)
                tempLabel.innerText = key.charAt(0).slice(1).toUpperCase()
                tempInput.addEventListener('click', (e) => {
                    e.stopPropagation()
                })
                container.appendChild(tempLabel)
                container.appendChild(tempInput)
            }
            container.classList.add(`form-control` ,`${className}-form-control`)
            input.classList.add(`modal-input`, `${className}-input`)
            input.setAttribute('type', `${value.type}`)
            formControlArr.push(container)
        }
        return formControlArr
    }

    function _handleClose() {
        _modalContainer.classList.toggle('closed-modal')
        _modalContainer.removeChild(_contentContainer)
        _currentModal = null
        _modalOpen = false
    }
    function _handleOpen(type) {
        _currentModal = _modalElements.filter(el => {return el.type === type})
        _modalOpen = true
        _toggleModal()
    }
    function _toggleModal() {
        _modalContainer.classList.toggle('closed-modal')
    }
    function _render(action) {
        if (action === 'add-item') {
            _contentContainer = document.createElement('form')
            _contentContainer.classList.add('modal-content-wrapper')
            _contentContainer.appendChild(_currentModal[0].elements)
            _modalContainer.appendChild(_contentContainer)
        }
    }

    const _init = (function() {
        const todoModel       = ToDo()
        const noteModel       = Note()
        const checklistModel  = CheckList()
        const todoConfig      = todoModel.getInputConfig()
        const noteConfig      = noteModel.getInputConfig()
        const checklistConfig = checklistModel.getInputConfig()
        _modalTypes.forEach(modalType => {
            let formControls = []
            const fieldSet = document.createElement('fieldset')
            fieldSet.classList.add('form-controls-container', `${modalType}-form-controls-container`)
            fieldSet.setAttribute('id', `${modalType}FieldSet`)
            if (modalType === 'todo') {
                formControls = _createModalElements(todoConfig, modalType)
            }
            if (modalType === 'note') {
                formControls = _createModalElements(noteConfig, modalType)
            }
            if (modalType === 'checklist') {
                formControls = _createModalElements(checklistConfig, modalType)
            }
            formControls.forEach(cntrl => {
                fieldSet.appendChild(cntrl)
            })
            _modalElements.push({type: modalType, elements: fieldSet})
        })
        _modalContainer.classList.add('modal-container', 'closed-modal')
        _modalContainer.addEventListener('click', (e) => {
            e.preventDefault()
            e.stopPropagation()
            e.stopImmediatePropagation()
            _handleClose()
        })
        const content = document.getElementById('content')
        content.appendChild(_modalContainer)
    })()

    function handleSelection(itemType, action) {
        if (_modalOpen) {
            if (_currentModal[0].type === itemType) {
                _handleClose()
            } else {
                _handleClose()
                _handleOpen(itemType)
            }
        } else {
            _handleOpen(itemType)
        }
        _render(action)
        return
    }

    return {
        handleSelection: handleSelection
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
const folderElement = (name, value, title) => {
    const button = document.createElement('button')
    button.classList.add('folder-element-button')
    button.setAttribute('name', name)
    button.addEventListener('click', (e) => {
        console.log("Folder Clicked")
    })
    return button
}
//          + Form Element
const formElement = () => {
    const formContainer = document.createElement('form')

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