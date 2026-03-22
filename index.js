const express = require('express');
const app = express();
const mysql = require('mysql');
const moment = require('moment');

const PORT = 5000;

// DB CONNECTION
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gis_db'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// LOGGER
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - ${moment().format()}`);
    next();
});

// ================= AUTH =================

// REGISTER
app.post('/api/register', (req, res) => {
    const { username, password, fullname } = req.body;

    const sql = "INSERT INTO users (username, password, fullname) VALUES (?, ?, ?)";
    connection.query(sql, [username, password, fullname], (err, result) => {
        if (err) return res.send(err);
        res.send({ message: "User registered successfully" });
    });
});

// LOGIN
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
    connection.query(sql, [username, password], (err, result) => {
        if (err) return res.send(err);

        if (result.length > 0) {
            const token = Math.random().toString(36).substring(2);
            const updateSql = "UPDATE users SET token=? WHERE user_id=?";
            connection.query(updateSql, [token, result[0].user_id]);

            res.send({ message: "Login success", token });
        } else {
            res.send({ message: "Invalid credentials" });
        }
    });
});

// LOGOUT
app.post('/api/logout', (req, res) => {
    const { token } = req.body;

    const sql = "UPDATE users SET token=NULL WHERE token=?";
    connection.query(sql, [token], (err, result) => {
        if (err) return res.send(err);
        res.send({ message: "Logout success" });
    });
});

// ================= LOCATIONS =================

// CREATE LOCATION
app.post('/api/locations', (req, res) => {
    const { location, latitude, longitude } = req.body;

    const sql = "INSERT INTO locations (location, latitude, longitude) VALUES (?, ?, ?)";
    connection.query(sql, [location, latitude, longitude], (err, result) => {
        if (err) return res.send(err);
        res.send({ message: "Location added successfully" });
    });
});

// GET ALL LOCATIONS
app.get('/api/locations', (req, res) => {
    const sql = "SELECT * FROM locations";
    connection.query(sql, (err, result) => {
        if (err) return res.send(err);
        res.send(result);
    });
});

// GET ONE LOCATION
app.get('/api/locations/:id', (req, res) => {
    const id = req.params.id;

    const sql = "SELECT * FROM locations WHERE location_id=?";
    connection.query(sql, [id], (err, result) => {
        if (err) return res.send(err);
        res.send(result);
    });
});

// DELETE LOCATION
app.delete('/api/locations', (req, res) => {
    const { location_id } = req.body;

    const sql = "DELETE FROM locations WHERE location_id=?";
    connection.query(sql, [location_id], (err, result) => {
        if (err) return res.send(err);
        res.send({ message: "Location deleted successfully" });
    });
});

// UPDATE LOCATION
app.put('/api/locations', (req, res) => {
    const { location_id, location, latitude, longitude } = req.body;

    const sql = "UPDATE locations SET location=?, latitude=?, longitude=? WHERE location_id=?";
    connection.query(sql, [location, latitude, longitude, location_id], (err, result) => {
        if (err) return res.send(err);
        res.send({ message: "Location updated successfully" });
    });
});

// START SERVER
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});