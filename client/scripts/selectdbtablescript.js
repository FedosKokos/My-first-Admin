const params = new URLSearchParams(window.location.search);
const dbname = params.get('dbname');
const selecteddb = document.getElementById('selected-db');
const leftblock = document.getElementById('select-db-tableBlock');
if(dbname){
selecteddb.innerText = dbname;
async function getdbtables() {
    const res = await fetch('/getdbtables', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({dbname: dbname})    
    });
    const response = await res.json();
    const key = `Tables_in_${dbname}`
    response.forEach($tableObj => {
        const tableName = $tableObj[key];
        const button = document.createElement('button');
        button.innerText = tableName;
        button.onclick = function(){
            location.href = `/editdb?dbname=${dbname}&tablename=${tableName}`;
        }
        leftblock.appendChild(button);
    });
}
getdbtables()
}