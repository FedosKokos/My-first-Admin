const params = new URLSearchParams(window.location.search);
const dbname = params.get('dbname');
const tablename = params.get('tablename');

const leftblock = document.getElementById('select-db-table-block');
const selecteddb = document.getElementById('selected-db');
const selectedtable = document.getElementById('selected-table');
selecteddb.innerText = dbname;
selectedtable.innerText = tablename;


const backBtn = document.getElementById('back-btn').addEventListener('click', function(){
    window.location.href = `/editdb?dbname=${dbname}&tablename=${tablename}`
});
const insertBtn = document.getElementById('insert-btn').addEventListener('click', function () {
    window.location.href = `/insert?dbname=${dbname}&tablename=${tablename}`;
});
const deleteBtn = document.getElementById('delete-btn').addEventListener('click', function () {
    window.location.href = `/delete?dbname=${dbname}&tablename=${tablename}`;
});
const changeBtn = document.getElementById('change-btn').addEventListener('click', function () {
    window.location.href = `/change?dbname=${dbname}&tablename=${tablename}`;
});
const importBtn = document.getElementById('import-btn').addEventListener('click', function () {
    window.location.href = `/import?dbname=${dbname}&tablename=${tablename}`;
});
const exportBtn = document.getElementById('export-btn').addEventListener('click', function () {
    window.location.href = `/export?dbname=${dbname}&tablename=${tablename}`;
});


async function fetchTableData() {
    try {
        const res = await fetch(`/gettabledata?dbname=${dbname}&tablename=${tablename}`);
        if (!res.ok) {
            throw new Error('Network response was not ok');
        }
        const response = await res.json();
        const tableData = response.tableData;
        const tableColumnsData = response.tableColumnsData;
        return {
            tableData,
            tableColumnsData
        };
    }
    catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

const rightBlockContent = document.getElementById('right-block-content');

async function renderInsertBlock() {
    const { tableData, tableColumnsData } = await fetchTableData();
    if (!tableData || !tableColumnsData) {
        rightBlockContent.innerHTML = '<p>Ошибка при получении данных таблицы.</p>';
        return;
    }
    // ========== Создание фильтрации без создании нового массива ==========
    // for (let $i = 0; $i < tableColumnsData.length; $i++) {
    // if (tableColumnsData[$i].Field === 'id') {
    //     console.log(`Вы удалили колонку с именем: ${tableColumnsData[$i].Field}`);
    //     tableColumnsData.splice($i, 1);
    //     $i--; //чтобы не пропустить следующий элемент
    // }
    // }



    // ========== Модный синтаксис, создание фильтрации с новым массивом ==========
    
    const filteredTableColumnsData = [];
    for(let $i = 0; $i < tableColumnsData.length; $i++){
        const columnField = tableColumnsData[$i].Field.toLowerCase();
        if(!columnField.includes('id')){
            filteredTableColumnsData.push(tableColumnsData[$i]);
        }
    }





    // ========== Создаем прокрутку таблицы ==========
    const tableScroll = document.createElement('div');
    tableScroll.className = 'table-scroll';
    rightBlockContent.appendChild(tableScroll);

    // ========== Создаем форму для вставки данных ==========
    const htmlform = document.createElement('form');
    htmlform.id = 'insert-form';
    htmlform.method = 'POST';


    // ========== Создаем таблицу ==========
    const table = document.createElement('table');
    table.className = 'admin-table';
    htmlform.appendChild(table);
    tableScroll.appendChild(htmlform);

    // ========== Создаем заголовок таблицы ==========
    const thead = document.createElement('thead');
    table.appendChild(thead);
    const headerRow = document.createElement('tr');
    thead.appendChild(headerRow);
    filteredTableColumnsData.forEach(column => {
        const th = document.createElement('th');
        th.textContent = column.Field;
        headerRow.appendChild(th);
    });


    // ========== Создаем тело таблицы ==========
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);

    // ========== Создаем строку для ввода данных ==========
    const inputRow = document.createElement('tr');
    tbody.appendChild(inputRow);
    filteredTableColumnsData.forEach($column => {
        const td = document.createElement('td');
        const inputField = document.createElement('input');
        const columnType = $column.Type.toLowerCase();
        if(columnType.includes('int')){
            inputField.type = 'number';
        } else{
            inputField.type = 'text';
        }
        
        inputField.className = 'table-input';
        inputField.required = true; // Добавляем обязательное поле
        inputField.name = $column.Field; // Используем имя столбца как имя поля ввода
        inputField.placeholder = `Введите ${$column.Field}`;
        td.appendChild(inputField);
        inputRow.appendChild(td);
    });



    // ========== Создаем кнопку для отправки формы ==========

    const submitButtonBlock = document.createElement('div');
    submitButtonBlock.className = 'submit-button-block';
    htmlform.appendChild(submitButtonBlock);
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Вставить данные';
    submitButton.className = 'main-btn';
    submitButtonBlock.appendChild(submitButton);




    // ========== Обработчик отправки формы ==========
    const form = document.getElementById('insert-form')
    form.addEventListener('submit', async function (event) {
        event.preventDefault(); // Отменяем стандартное поведение формы


        const inputsArray = form.getElementsByTagName('input');
        let data = {};

        for (let $i = 0; $i < inputsArray.length; $i++) {
            const inputName = inputsArray[$i].name.trim();
            const inputValue = inputsArray[$i].value.trim();
            data[inputName] = inputValue;
        };

        async function insertData() {
            try {
                const res = await fetch(`/insertdata?dbname=${dbname}&tablename=${tablename}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data: data })
                });
                const response = await res.json();
                window.location.href = (`/editdb?dbname=${dbname}&tablename=${tablename}`);
            }
            catch (err) {
                console.log("Ошибка при отправке данных: " + err);
            }
        }
        insertData();
    });


}
renderInsertBlock()