const express = require('express');
const MYSQL = require('mysql2/promise');
const path = require('path');
const fs = require('fs').promises;
const APP = express();
const PORT = 3000;


const pool = MYSQL.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    waitForConnection: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
});

APP.use(express.static(path.join(__dirname, '..')));
APP.use(express.static(path.join(__dirname, '..', 'client', 'scripts')))
APP.use(express.static(path.join(__dirname, '..', 'client', 'styles')));
APP.use(express.json());


async function main() {
    APP.get('/', function (req, res) {
        res.sendFile(path.join(__dirname, '..', 'client', 'main.html'));
    });




    async function mainRoutes() {


        APP.get('/databases', async function (req, res) {
            const [databases] = await pool.query('SHOW DATABASES');
            res.json(databases);
        });

        APP.post('/getdbtables', async function (req, res) {
            const dbname = req.body.dbname;
            try {
                const [tables] = await pool.execute(`SHOW TABLES IN \`${dbname}\``);
                res.json(tables);
            }
            catch (err) {
                console.error(err);
            }

        });

        APP.get('/editdb', function (req, res) {
            const dbname = req.query.dbname;
            const tablename = req.query.tablename;

            if (dbname && !tablename) {
                res.sendFile(path.join(__dirname, '..', 'client', 'editdb.html'));
            }

            if (dbname && tablename) {
                res.sendFile(path.join(__dirname, '..', 'client', 'edittable.html'));
            }
        })

        APP.get('/insert', function (req, res) {
            const dbname = req.query.dbname;
            const tablename = req.query.tablename;
            if (dbname && tablename) {
                res.sendFile(path.join(__dirname, '..', 'client', 'insert.html'));
            }
        });


        APP.get('/delete', function (req, res) {
            const dbname = req.query.dbname;
            const tablename = req.query.tablename;
            if (dbname && tablename) {
                res.sendFile(path.join(__dirname, '..', 'client', 'delete.html'));
            }
        });

        APP.get('/change', function (req, res) {
            const dbname = req.query.dbname;
            const tablename = req.query.tablename;
            if (dbname && tablename) {
                res.sendFile(path.join(__dirname, '..', 'client', 'change.html'));
            }
        });

        APP.get('/import', function (req, res) {
            const dbname = req.query.dbname;
            if (dbname) {
                res.sendFile(path.join(__dirname, '..', 'client', 'import.html'));
            }
        });

        APP.get('/export', function (req, res) {
            const dbname = req.query.dbname;
            if (dbname) {
                res.sendFile(path.join(__dirname, '..', 'client', 'export.html'));
            }
        });

        APP.get('/gettabledata', async function (req, res) {
            const dbname = req.query.dbname;
            const tablename = req.query.tablename;

            if (!dbname || !tablename) {
                return res.status(400).json({ error: 'Database name and table name are required' });
            }

            try {
                const [tableData] = await pool.query(`SELECT * FROM \`${dbname}\`.\`${tablename}\``);
                const [tableColumnsData] = await pool.execute(`DESCRIBE \`${dbname}\`.\`${tablename}\``);
                res.json({ tableData, tableColumnsData });
            } catch (error) {
                console.error('Error fetching table data:', error);
                res.status(500).json({ error: 'Failed to fetch table data' });
            }
        });

        APP.get('/sql', function(req, res){
            res.sendFile(path.join(__dirname, '..' ,'client', 'sql.html'));
        });

    }

    mainRoutes();





    async function operations() {

        APP.post('/insertdata', async function (req, res) {
            const dbname = req.query.dbname;
            const tablename = req.query.tablename;
            const data = req.body.data;



            let $keys = [];
            let $placeholders = [];
            let $values = [];


            for (let $key in data) {
                $keys.push($key);
                $placeholders.push('?');
                $values.push(data[$key]);
            }

            let $sql = `INSERT INTO \`${tablename}\`(`;
            $sql += `\`${$keys[0]}\``;
            for (let $i = 1; $i < $keys.length; $i++) {
                $sql += `,  \`${$keys[$i]}\``;
            }
            $sql += ') VALUES (';

            $sql += `${$placeholders[0]}`;

            for ($i = 1; $i < $placeholders.length; $i++) {
                $sql += `, ${$placeholders[$i]}`;
            }

            $sql += `)`;



            let $conn;
            try {
                $conn = await pool.getConnection();
                await $conn.query(`USE ${dbname}`);
                await $conn.query($sql, $values);
                res.json({ result: 'Вставка прошла успешно!' });


            }
            catch (err) {
                res.json({ error: `Ошибка при отправке: ${err}` });
            }
            finally {
                $conn.release();
            }
        });


        APP.delete('/deletedata', async function (req, res) {
            const dbname = req.query.dbname;
            const tablename = req.query.tablename;
            const id = req.body.id;
            if (!id) {
                return res.json({ error: 'У полей нет id, удалите вручную через ключеве слова' });

            }
            if (!/^[\w]+$/.test(dbname) || !/^[\w]+$/.test(tablename)) {
                return res.status(400).json({ error: 'Неверное имя базы данных или таблицы' });
            }

            let $conn;
            try {
                $conn = await pool.getConnection();
                await $conn.query(`USE ${dbname}`);
                await $conn.execute(`DELETE FROM \`${tablename}\` WHERE id = ?`, [id]);
                res.json({ result: 'Удаление прошло успешно!' });
            }
            catch (err) {
                console.error(err);
                res.status(500).json({ error: 'Нельзя удалить строку без id, удалите вручную!' });
            }
            finally {
                if ($conn) {
                    $conn.release();
                }
            }
        });


        APP.put('/changedata', async function (req, res) {
            try {
                const dbname = req.query.dbname;
                const tablename = req.query.tablename;
                const data = req.body.data;
                let $conn;

                if (!/^[\w]+$/.test(dbname) || !/^[\w]+$/.test(tablename)) {
                    return res.status(400).json({ error: 'Неверное имя базы данных или таблицы' });
                }


                let $sql = '';
                let $values = [];

                data.forEach($rowobj => {
                    // Id строки
                    const id = $rowobj.id;
                    // Данные строки
                    const row = $rowobj.data;



                    let $placeholders = [];
                    let $keys = [];
                    for (let $key in row) {
                        $keys.push($key);
                        $placeholders.push('?');
                        $values.push(row[$key]);
                    }
                    // Создание SQL, создает одну по одной строке по циклу, также добавляет значения в глобальную переменную $values
                    $sql += `UPDATE \`${tablename}\` SET `;
                    $sql += `\`${$keys[0]}\`=${$placeholders[0]}`;
                    // Создает дополнительные строки, если значений всего 1, то условие не выполнится
                    for (let $i = 1; $i < $keys.length; $i++) {
                        $sql += `, \`${$keys[$i]}\`=${$placeholders[$i]}`
                    }
                    $sql += ` WHERE id = ?; `;
                    $values.push(id);

                });


                $conn = await pool.getConnection();
                await $conn.query(`USE ${dbname}`);
                await $conn.query($sql, $values);
                res.json({ result: 'Данные успешно обновлены!' });

            }
            catch (err) {
                console.error(err);
                res.status(500).json({ error: err.message });
            }
            finally {
                if ($conn) {
                    $conn.release();
                }
            }
        });

        APP.post('/insertsql', async function(req, res){
            const dbname = req.query.dbname;
            const sql = req.body.sql;
            console.log(req.body.sql);
            if(!dbname || !sql){
                return res.status(400).json({ error: 'Не все данные пришли' });
            }
              if (!/^[\w]+$/.test(dbname)) {
                    return res.status(400).json({ error: 'Неверное имя базы данных или таблицы' });
                }

            let $conn;
            try{
                $conn = await pool.getConnection();
                await $conn.query(`USE \`${dbname}\``);
                await $conn.query(sql);

                res.json({ result: 'SQL успешно вставлен!' });

            }
            catch(err){
                console.error(err);
                res.status(500).json({ error: err.message });
            }finally{
                $conn.release();
            }

        });

    }
    operations();
}
main();

APP.listen(PORT, function () {
    console.log(`Запусчен сервер: http://localhost:${PORT}`);
})

