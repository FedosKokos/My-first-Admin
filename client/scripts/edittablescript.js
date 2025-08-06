const params = new URLSearchParams(window.location.search);
const dbname = params.get('dbname');
const tablename = params.get('tablename');

const leftblock = document.getElementById('select-db-table-block');
const selecteddb = document.getElementById('selected-db');
const selectedtable = document.getElementById('selected-table');
selecteddb.innerText = dbname;
selectedtable.innerText = tablename;

document.getElementById('back-to-tables-btn').addEventListener('click', function(){
    location.href = `/editdb?dbname=${dbname}`;
});


const updateBtn = document.getElementById('update-btn').addEventListener('click', function() {
    window.location.reload();
});
const insertBtn = document.getElementById('insert-btn').addEventListener('click',  function() {
    window.location.href = `/insert?dbname=${dbname}&tablename=${tablename}`;
});
const deleteBtn = document.getElementById('delete-btn').addEventListener('click', function() {
    window.location.href = `/delete?dbname=${dbname}&tablename=${tablename}`;
});
const changeBtn = document.getElementById('change-btn').addEventListener('click', function() {
    window.location.href = `/change?dbname=${dbname}&tablename=${tablename}`;
});
const sqlBtn = document.getElementById('sql-btn').addEventListener('click', function(){
    window.location.href = `/sql?dbname=${dbname}&tablename=${tablename}`;
});
const importBtn = document.getElementById('import-btn').addEventListener('click', function() {    
    window.location.href = `/import?dbname=${dbname}&tablename=${tablename}`;
});
const exportBtn = document.getElementById('export-btn').addEventListener('click', function() {
    window.location.href = `/export?dbname=${dbname}&tablename=${tablename}`;
});











async function fetchTableData() {
    try{
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
            td.textContent = $row[$column.Field];
            tr.appendChild(td);
        });
    });
}

drawTable();