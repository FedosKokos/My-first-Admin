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










const rightBlockContent = document.getElementById('right-block-content');
const sqlTextarea = document.getElementById('sql-query');

let $tableColumnsData

async function fetchTableData() {
    try {
        const res = await fetch(`/gettabledata?dbname=${dbname}&tablename=${tablename}`);
        if (!res.ok) {
            throw new Error('Network response was not ok');
        }
        const response = await res.json();
        $tableColumnsData = response.tableColumnsData;

    }
    catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}
fetchTableData();


// ========== INSERT ==========
const clientInsertBtn = document.getElementById('run-insert-btn').addEventListener('click', function () {
    const tableColumnsData = $tableColumnsData;
    if (tableColumnsData) {
        // Заполняем $keys и $placeholders для дальнейшей работы
        let $keys = [];
        let $placeholders = [];
        for (let $i = 0; $i < tableColumnsData.length; $i++) {
            const key = tableColumnsData[$i].Field;
            const placeholder = `[value-${$i + 1}]`;

            $keys.push(key);
            $placeholders.push(placeholder);
        }
        // Создаем SQL
        let $sql = '';
        $sql += `INSERT INTO \`${tablename}\`(\`${$keys[0]}\``;
        for (let $i = 1; $i < $keys.length; $i++) {
            $sql += `, \`${$keys[$i]}\``;
        }
        $sql += ') VALUES (';
        $sql += `\'${$placeholders[0]}\'`;
        for (let $i = 1; $i < $placeholders.length; $i++) {
            $sql += `, \'${$placeholders[$i]}\'`;
        }
        $sql += ');';
        //Вставляем готовую строку
        sqlTextarea.value = '';
        sqlTextarea.value = $sql
    }
});


// ========== UPDATE ==========
const clientUpdateBtn = document.getElementById('run-update-btn').addEventListener('click', function () {
    const tableColumnsData = $tableColumnsData;
    if (tableColumnsData) {
        // Заполняем $keys и $placeholders для дальнейшей работы
        let $keys = [];
        let $placeholders = [];
        for (let $i = 0; $i < tableColumnsData.length; $i++) {
            const key = tableColumnsData[$i].Field;
            const placeholder = `[value-${$i + 1}]`;

            $keys.push(key);
            $placeholders.push(placeholder);
        }
        // Создаем SQL
        let $sql = '';
        $sql += `UPDATE \`${tablename}\` SET `;
        $sql += `\`${$keys[0]}\`=\'${$placeholders[0]}\'`;
        for (let $i = 1; $i < $keys.length; $i++) {
            $sql += `, \`${$keys[$i]}\`=\'${$placeholders[$i]}\'`;
        }
        $sql += ' WHERE 1';
        //Вставляем готовую строку
        sqlTextarea.value = '';
        sqlTextarea.value = $sql
    }
});


// ========== DELETE ==========
const clientDeleteBtn = document.getElementById('run-delete-btn').addEventListener('click', function () {
    const tableColumnsData = $tableColumnsData;
    if (tableColumnsData) {
        // Создаем SQL
        let $sql = `DELETE FROM \`${tablename}\` WHERE 1`;
        //Вставляем готовую строку
        sqlTextarea.value = '';
        sqlTextarea.value = $sql
    }
});


// ========== CLEAN OUT ==========
const clientClearButton = document.getElementById('run-clear-btn').addEventListener('click', function () {
    sqlTextarea.value = '';
});


// ========== FETCH SQL ==========
const cliendSqlButton = document.getElementById('run-sql-btn').addEventListener('click', function () {
    const tableColumnsData = $tableColumnsData;
    if (tableColumnsData) {
        const sql = sqlTextarea.value;
        if(sql.length < 5){
            return window.alert('Введите SQL команду!');
        }
        async function fetchSql() {
            try {
                const res = await fetch(`/insertsql?dbname=${dbname}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sql: sql})
                });
                const response = await res.json();
                if(response && response.error){
                    window.alert(response.error);
                };
                if(response.result){
                    window.alert(response.result);
                    window.location.href = `/editdb?dbname=${dbname}&tablename=${tablename}`;
                }

            }
            catch (err) {
                return console.log(err);
            }
        }
        fetchSql();
    }
});