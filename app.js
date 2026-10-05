const express = require('express');
const app = express();
const mysql = require('mysql2/promise');

// Set of login creds, change for sql as necessary
const pool = mysql.createPool({
    host: 'localhost',
    user: 'exam1user',
    password: 'exam1pass',
    database: 'exam1Practice'
});

// "Middleware"
app.use(express.json());


// Request and Responses
app.get('/api/orders', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM Orders');
    res.json(rows);
});

app.get('/api/orders/:id', async (req, res) => {
    try{
        console.log(req.params.id);
        const [rows] = await pool.query('SELECT * FROM Orders WHERE orderID = ?', [req.params.id]);
        if (rows.length === 0){
            return res.status(404).json({error: 'Order not found'})
        }
        res.json(rows[0]);
    } catch (err){
        res.status(500).json({error: 'Database error'});
    }
});

app.post('/api/orders', async (req, res) => {
    const{ customerName: name, customerEmail: email, itemCategory: cat, itemDescription: desc, quantity: quan, unitPrice: price, orderStatus: stat, orderDate: date } = req.body;
    if (!name || !quan){
        return res.status(400).json({error: 'customerName and quantity are required.'})
    }

    try{
        const [result] = await pool.execute('INSERT INTO Orders (customerName, customerEmail, itemCategory, itemDescription, quantity, unitPrice, orderStatus, orderDate) values (?,?,?,?,?,?,?,?)',
            [name, email ?? null, cat ?? null, desc ?? null, quan, price ?? null, stat ?? null, date ?? null]
        );
        res.status(201).json({orderID: result.insertId});
    }catch (err){
        res.status(500).json({error: 'Database error'});
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});