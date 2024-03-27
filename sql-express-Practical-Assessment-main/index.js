const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on');
require('dotenv').config();
const { createConnection } = require('mysql2/promise');

let app = express();
app.set('view engine', 'hbs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

wax.on(hbs.handlebars);
wax.setLayoutPath('./views/layouts');

let connection;

async function main() {
    connection = await createConnection({
        'host': process.env.DB_HOST,
        'user': process.env.DB_USER,
        'database': process.env.DB_NAME,
        'password': process.env.DB_PASSWORD
    })

    app.get('/lecturer', async (req, res) => {
        let [lecturer] = await connection.execute(`
        Select * from lecturer
       `);
        res.render('lecturer', {
            'lecturer': lecturer
            
        })
    });

    app.post('/lecturer', async (req,res)=>{
        const {searchSpecialization,searchYoexp} = req.body;
        const query = `SELECT * FROM lecturer WHERE specialization LIKE ? AND years_of_experience LIKE ?`;
        const [results] =await connection.execute(query,[`%${searchSpecialization}%`,`%${searchYoexp}%`])
        let [lecturer] = await connection.execute(`
        Select * from lecturer
       `);
        res.render('lecturer', {
            'lecturer': lecturer,
             results
            }); 
    })

    app.get('/create-lecturer', async function (req, res) {
        const [lecturer] = await connection.execute("SELECT * FROM lecturer");
        res.render('create-lecturer', {
            lecturer,
        });
    })

    app.post('/create-lecturer', async function (req, res) {
        const { full_name, gender, email, phone_number, department, specialization, years_of_experience } = req.body;
        const query = `INSERT INTO lecturer (full_name, gender, email, phone_number,department,specialization,years_of_experience)
        VALUES (?,?,?,?,?,?,?)`;
        const [response] = await connection.execute(query, [full_name, gender, email, phone_number, department, specialization, years_of_experience]);
        console.log(response);
        res.redirect('/lecturer');
    })

    app.get("/delete-lecturer/:lecturer_id", async function (req, res) {
        const { lecturer_id } = req.params; // same as `const lecturer_id = req.params.lecturer_id`
        const query = `SELECT * FROM lecturer WHERE lecturer_id = ?`;

        // connection.execute with a SELECT statement 
        // you always get an array as a result even if there ONLY one possible result
        const [lecturers] = await connection.execute(query, [lecturer_id]);
        console.log(lecturers);
        const lecturerToDelete = lecturers[0];
        console.log(lecturerToDelete)

        res.render('delete-lecturer', {
            'lecturer': lecturerToDelete
        })

    })

    app.post("/delete-lecturer/:lecturer_id", async function (req, res) {
        const query = `DELETE FROM lecturer WHERE lecturer_id = ?`;
        const [response] = await connection.execute(query, [req.params.lecturer_id])
        console.log(response)
        res.redirect('/lecturer')

    })

    app.get("/update-lecturer/:lecturer_id", async function (req, res) {
        const { lecturer_id } = req.params;// same as `const lecturer_id = req.params.lecturer_id`
        const query = `SELECT * FROM lecturer WHERE lecturer_id = ?`;
        const [lecturers] = await connection.execute(query, [lecturer_id]);
        const wantedLecturer = lecturers[0];
        console.log("this is wanted lectuter", wantedLecturer)
        res.render('update-lecturer', {
            "L": wantedLecturer,
        })

    })

    app.post("/update-lecturer/:lecturer_id", async function (req, res) {
        console.log("post upadate is here")
        const { lecturer_id } = req.params;
        const { full_name, gender, email, phone_number, department, specialization, years_of_experience } = req.body;
        console.log("code is inside post route")
        const query = `UPDATE lecturer SET full_name = ?,
                        gender = ?,
                        email = ?,
                        phone_number = ?,
                        department = ?,
                        specialization = ?,
                        years_of_experience= ?
                       WHERE lecturer_id = ?;`

        const [respone] = await connection.execute(query,[full_name, gender, email, phone_number, department, specialization, years_of_experience,lecturer_id] );
        console.log(respone)
        res.redirect('/lecturer');
    })

    app.listen(3000, () => {
        console.log('Server is running')
    });
}

main();
