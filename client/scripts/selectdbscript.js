const dataBaseChoose = document.getElementById('select-db-block');

async function fetchDataBases() {
  try {
    const res = await fetch('/databases');
    if (!res.ok) throw new Error('Ошибка сети');
    const response = await res.json();
    return response;
  } catch (error) {
    console.error('Ошибка при получении баз:', error);
    return [];
  }
}

async function renderDataBases() {
  const databases = await fetchDataBases();
  databases.forEach(db => {
    const button = document.createElement('button');
    button.textContent = db.Database;
    button.onclick = function () {
      // location.href = `/db/dataBase?name=${db.Database}`; // перенаправление на страницу базы данных
      const dataBaseName = db.Database;
        location.href = `/editdb?dbname=${dataBaseName}`;
      }
    
    dataBaseChoose.appendChild(button);
  });
}

renderDataBases();