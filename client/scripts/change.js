const params = new URLSearchParams(window.location.search);
const dbname = params.get('dbname');
const tablename = params.get('tablename');

const leftblock = document.getElementById('select-db-table-block');
const selecteddb = document.getElementById('selected-db');
const selectedtable = document.getElementById('selected-table');
selecteddb.innerText = dbname;
selectedtable.innerText = tablename;

const backBtn = document.getElementById('back-btn').addEventListener('click', function () {
    window.location.href = `/editdb?dbname=${dbname}&tablename=${tablename}`;
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



 




const rightBlock = document.getElementById('right-block-content');


async function drawTable() {
    const { tableData, tableColumnsData } = await fetchTableData();
    if (!tableData || !tableColumnsData) {
        rightBlock.innerHTML = '<p>Не удалось загрузить данные таблицы.</p>';
        return;
    }




// Проверка на наличие id
    let allRowsHaveId = true;
    for (let i = 0; i < tableData.length; i++) {
        if (tableData[i].id === undefined || tableData[i].id === null) {
            allRowsHaveId = false;
            break; // Выходим из цикла сразу, если нашли строку без id
        }
    }
    if (!allRowsHaveId) {
        window.alert('Нельзя изменять таблицу без id, Измените вручную!');
        console.error('Ошибка: Не у всех строк есть ID');
        window.location.href = `/editdb?dbname=${dbname}&tablename=${tablename}`;
    }





    // ========== Создание дива с скроллом для таблицы ==========
    const tableScroll = document.createElement('div');
    tableScroll.classList.add('table-scroll');
    rightBlock.appendChild(tableScroll);

    // ========== Создание таблицы ==========
    const table = document.createElement('table');
    const htmlform = document.createElement('form');
    htmlform.id = 'insert-form';
    htmlform.method = 'POST';
    htmlform.appendChild(table);
    table.classList.add('admin-table');
    tableScroll.appendChild(htmlform);

    // ========== Создание заголовка таблицы ==========
    const thead = document.createElement('thead');
    table.appendChild(thead);
    const theadRow = document.createElement('tr');
    thead.appendChild(theadRow);
    tableColumnsData.forEach($column => {
        const th = document.createElement('th');
        th.textContent = $column.Field;
        theadRow.appendChild(th);
    });




    // ========== Создание тела таблицы ==========
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    tableData.forEach($row => {
        const tr = document.createElement('tr');
        tbody.appendChild(tr);
        tableColumnsData.forEach($column => {
            const td = document.createElement('td');
            const input = document.createElement('input');
            const columnType = $column.Type.toLowerCase();
            const columnField = $column.Field.toLowerCase();


            if (columnType.includes('int') && columnField.includes('id')) {
                input.type = 'number';
                input.disabled = true;
            } else if (columnType.includes('int')) {
                input.type = 'number';
            } else {
                input.type = 'text';
            }
            input.className = 'table-input';
            input.required = true; // Добавляем обязательное поле
            input.value = $row[$column.Field];
            input.name = $column.Field;
            input.dataset.id = $row.id;
            td.appendChild(input);
            tr.appendChild(td);
        });
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


    htmlform.addEventListener('submit', function (event) {
        event.preventDefault();
        const inputsList = htmlform.getElementsByTagName('input');
        // ========== Делаем блокировку полей с айди ==========
        let filteredInputsArray = [];
        for (let $i = 0; $i < inputsList.length; $i++) {
            if (inputsList[$i].disabled !== true) {
                filteredInputsArray.push(inputsList[$i]);
            }
        }

        // ========== Делаем массив с обьектами, в каждом из них содержится информация о конкретном инпуте ==========
        let $rowArray = [];
        filteredInputsArray.forEach($element => {
            const elementKey = $element.name;
            const elementValue = $element.value;
            const elementId = $element.dataset.id;
            $rowArray.push({ key: elementKey, value: elementValue, id: elementId });
        });

        // ========== Делаем массив с неотфильтрованными (повторяющимися) айдишниками ==========
        let $idArray = [];
        $rowArray.forEach(row => {
            $idArray.push(Number(row.id));
        });





        // ========== Делаем массив с отфильтрованными (неповторяющимися) айдишниками ==========
        let $filteredIdArray = [];
        for (let $i = 0; $i < $idArray.length; $i++) {
            if ($idArray[$i - 1] !== $idArray[$i]) {
                $filteredIdArray.push($idArray[$i]);
            }
        }

        // ========== Собираем данные в $data, сначала делается цикл где собирается массив с изменениями в строке, потом его пихаем по циклу в $data ==========
        let $data = [];
        $filteredIdArray.forEach($id => {
            let $rowData = {};
            $rowArray.forEach($inputData => {
                if (Number($inputData.id) === Number($id)) {
                    const key = $inputData.key;
                    const value = $inputData.value;
                    $rowData[key] = value;
                }
            });
            $data.push({ id: $id, data: $rowData });
        });

        console.log($data);

        async function changeData($_data_) {
            try{
                const res = await fetch(`/changedata?dbname=${dbname}&tablename=${tablename}`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({data: $_data_})
                });
                const response = await res.json();
                if(response.error){
                    window.alert(response.error);
                }
                if(response.result){
                    window.alert(response.result);
                    window.location.href = `/editdb?dbname=${dbname}&tablename=${tablename}`;
                }
            }
            catch(err){
                console.log('Ошибка:', err);
            }
        }
        changeData($data);


    });
}

drawTable();