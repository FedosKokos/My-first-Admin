const params = new URLSearchParams(window.location.search);
const dbname = params.get('dbname');
const tablename = params.get('tablename');

const leftblock = document.getElementById('select-db-table-block');
const selecteddb = document.getElementById('selected-db');
const selectedtable = document.getElementById('selected-table');
selecteddb.innerText = dbname;
selectedtable.innerText = tablename;


const insertBtn = document.getElementById('insert-btn');
const deleteBtn = document.getElementById('delete-btn');
const changeBtn = document.getElementById('change-btn');
const importBtn = document.getElementById('import-btn');
const exportBtn = document.getElementById('export-btn');




insertBtn.addEventListener('click',  function() {
    window.location.href = `/insert?dbname=${dbname}&tablename=${tablename}`;
});
deleteBtn.addEventListener('click', function() {
    window.location.href = `/delete?dbname=${dbname}&tablename=${tablename}`;
});
changeBtn.addEventListener('click', function() {
    window.location.href = `/change?dbname=${dbname}&tablename=${tablename}`;
});
importBtn.addEventListener('click', function() {    
    window.location.href = `/import?dbname=${dbname}&tablename=${tablename}`;
});
exportBtn.addEventListener('click', function() {
    window.location.href = `/export?dbname=${dbname}&tablename=${tablename}`;
});
