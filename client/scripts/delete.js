const params = new URLSearchParams(window.location.search);
const dbname = params.get('dbname');
const tablename = params.get('tablename');

const leftblock = document.getElementById('select-db-table-block');
const selecteddb = document.getElementById('selected-db');
const selectedtable = document.getElementById('selected-table');
selecteddb.innerText = dbname;
selectedtable.innerText = tablename;


const backBtn = document.getElementById('back-btn').addEventListener('click', function () {
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


const rightBlock = document.getElementById('right-block-content');


async function drawTable() {
    const { tableData, tableColumnsData } = await fetchTableData();
    if (!tableData || !tableColumnsData) {
        window.alert('Не удалось загрузить данные таблицы.');
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
        return;
    }
    // ========== Создание дива с скроллом для таблицы ==========
    const tableScroll = document.createElement('div');
    tableScroll.classList.add('table-scroll');
    rightBlock.appendChild(tableScroll);

    // ========== Создание таблицы ==========
    const table = document.createElement('table');
    table.classList.add('admin-table');
    tableScroll.appendChild(table);

    // ========== Создание заголовка таблицы ==========
    const thead = document.createElement('thead');
    table.appendChild(thead);
    const theadRow = document.createElement('tr');
    thead.appendChild(theadRow);
    const deleteTh = document.createElement('th');
    deleteTh.innerText = 'Удаление';
    deleteTh.classList.add('delete-th', 'red-th'); // добавляем класс для красного цвета
    theadRow.appendChild(deleteTh);
    tableColumnsData.forEach($column => {
        const th = document.createElement('th');
        th.textContent = $column.Field;
        theadRow.appendChild(th);
    });

    // ========== Создание тела таблицы ==========
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    console.log(tableData)
    tableData.forEach($row => {
        const tr = document.createElement('tr');
        tbody.appendChild(tr);
        const td = document.createElement('td');
        tr.appendChild(td);
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Удалить';
        deleteBtn.dataset.id = $row.id;
        deleteBtn.classList.add('delete-btn-fixed'); // фиксированная ширина
        td.appendChild(deleteBtn);

        tableColumnsData.forEach($column => {
            const td = document.createElement('td');
            td.textContent = $row[$column.Field];
            tr.appendChild(td);
        });
    });



    tbody.addEventListener('click', function (event) {
        const button = event.target.closest('button');
        if (!button || !tbody.contains(button)) {
            return
        }
        let id = button.dataset.id;
        console.log(`Ты нажал на кнопку с айди: ${id}`);

        async function deleteRow($_id_) {
            try {
                const res = await fetch(`/deletedata?dbname=${dbname}&tablename=${tablename}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: $_id_ })
                });
                const response = await res.json();
                if (response.error) {
                    window.alert(response.error);
                }
                if (response.result) {
                    console.log(response.result);
                    location.reload();
                }
            }
            catch (err) {
                console.log(`Ошибка при запросе на сервер: ${err}`);
            }
        }
        deleteRow(id);
    });








}

drawTable();