const express = require('express');
const { body, param, validationResult } = require('express-validator');
const mariadb = require('mariadb');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const axios = require('axios');

const app = express();
const port = 3000;
app.use(cors());

// const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'sample',
    port: 3306,
    connectionLimit: 5
});

// Middleware for parsing JSON requests
app.use(express.json());

// Swagger setup
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'Sample API',
            version: '1.0.0',
            description: 'API documentation for the Sample application',
        },
        servers: [
            {
                url: `http://206.81.7.233:${port}`,
            },
        ],
    },
    apis: ['./server.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//Swagger file for getting all customers
/**
 * @swagger
 * /customers:
 *   get:
 *     summary: Get all customers
 *     responses:
 *       200:
 *         description: A list of customers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   CUST_CODE:
 *                     type: string
 *                   CUST_NAME:
 *                     type: string
 *                   CUST_CITY:
 *                     type: string
 *                   WORKING_AREA:
 *                     type: string
 *                   CUST_COUNTRY:
 *                     type: string
 *                   GRADE:
 *                     type: number
 *                   OPENING_AMT:
 *                     type: number
 *                   RECEIVE_AMT:
 *                     type: number
 *                   PAYMENT_AMT:
 *                     type: number
 *                   OUTSTANDING_AMT:
 *                     type: number
 *                   PHONE_NO:
 *                     type: string
 *                   AGENT_CODE:
 *                     type: string
 *       404:
 *         description: Customers not found
 *       500:
 *         description: Internal server error
 */

// Endpoint to get all customers with use of cache
app.get('/customers', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const rows = await connection.query("SELECT * FROM customer");

        if (rows.length === 0) {
            return res.status(404).json({ error: 'CUSTOMERS not found' });
        }

        res.setHeader('Content-Type', 'application/json');
        // Add caching headers
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) {
            connection.end();
        }
    }
});

//Swagger file for getting all foods
/**
 * @swagger
 * /foods:
 *   get:
 *     summary: Get all food items
 *     responses:
 *       200:
 *         description: A list of food items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   price:
 *                     type: number
 *       404:
 *         description: Food items not found
 *       500:
 *         description: Internal server error
 */

// Endpoint to get foods with the use of cache
app.get('/foods', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const rows = await connection.query("SELECT * FROM foods");

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Food Items not found' });
        }

        res.setHeader('Content-Type', 'application/json');
        // Add caching headers
        res.setHeader('Cache-Control', 'public, max-age=60'); // Cache for 60 seconds
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) {
            connection.end();
        }
    }
});

//Swagger file for getting all orders
/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders
 *     responses:
 *       200:
 *         description: A list of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   orderId:
 *                     type: integer
 *                   customerId:
 *                     type: string
 *                   orderDate:
 *                     type: string
 *                     format: date-time
 *                   totalAmount:
 *                     type: number
 *       404:
 *         description: No orders found
 *       500:
 *         description: Internal server error
 */

// Endpoint to get orders with the use of cache
app.get('/orders', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const rows = await connection.query("SELECT * FROM orders");

        if (rows.length === 0) {
            return res.status(404).json({ error: 'No orders are found' });
        }

        res.setHeader('Content-Type', 'application/json');
        // Add caching headers
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) {
            connection.end();
        }
    }
});

// PUT request to update a customer
/**
 * @swagger
 * /customers/{CUST_CODE}:
 *   put:
 *     summary: Update a customer
 *     parameters:
 *       - in: path
 *         name: CUST_CODE
 *         required: true
 *         description: Customer code
 *         schema:
 *           type: string
 *       - in: body
 *         name: customer
 *         description: The customer to update
 *         schema:
 *           type: object
 *           properties:
 *             CUST_NAME:
 *               type: string
 *             CUST_CITY:
 *               type: string
 *             WORKING_AREA:
 *               type: string
 *             CUST_COUNTRY:
 *               type: string
 *             GRADE:
 *               type: number
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *       404:
 *         description: Customer not found
 *       400:
 *         description: Invalid input
 */
app.put('/customers/:CUST_CODE', [
    param('CUST_CODE').isString().withMessage('Customer code must be a string'),
    body('CUST_NAME').isString().trim().withMessage('Name must be a string'),
    body('CUST_CITY').optional().isString().trim().withMessage('City must be a string'),
    body('WORKING_AREA').isString().trim().withMessage('Working area must be a string'),
    body('CUST_COUNTRY').isString().trim().withMessage('Country must be a string'),
    body('GRADE').optional().isFloat({ min: 0 }).withMessage('Grade must be a number')
], async (req, res) => {
    console.log('Validated Request Body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const customerCode = req.params.CUST_CODE;
    const { CUST_NAME, CUST_CITY, WORKING_AREA, CUST_COUNTRY, GRADE } = req.body;
    let connection;

    try {
        connection = await pool.getConnection();
        const result = await connection.query("UPDATE customer SET CUST_NAME = ?, CUST_CITY = ?, WORKING_AREA = ?, CUST_COUNTRY = ?, GRADE = ? WHERE CUST_CODE = ?", [CUST_NAME, CUST_CITY, WORKING_AREA, CUST_COUNTRY, GRADE, customerCode]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.status(200).json({ message: 'Customer updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) {
            connection.end();
        }
    }
});



// PATCH request to partially update a customer's phone number
/**
 * @swagger
 * /customers/{CUST_CODE}/phone:
 *   patch:
 *     summary: Update a customer's phone number
 *     parameters:
 *       - in: path
 *         name: CUST_CODE
 *         required: true
 *         description: Customer code
 *         schema:
 *           type: string
 *       - in: body
 *         name: phone
 *         description: The phone number to update
 *         schema:
 *           type: object
 *           properties:
 *             PHONE_NO:
 *               type: string
 *     responses:
 *       200:
 *         description: Customer phone updated successfully
 *       404:
 *         description: Customer not found
 *       400:
 *         description: Invalid input
 */
app.patch('/customers/:CUST_CODE/phone', [
    param('CUST_CODE').isString().withMessage('Customer code must be a string'),
    body('PHONE_NO').isString().trim().withMessage('Phone number must be a string')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const customerCode = req.params.CUST_CODE;
    const { PHONE_NO } = req.body;
    let connection;

    try {
        connection = await pool.getConnection();
        const result = await connection.query("UPDATE customer SET PHONE_NO = ? WHERE CUST_CODE = ?", [PHONE_NO, customerCode]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.status(200).json({ message: 'Customer phone updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) {
            connection.end();
        }
    }
});

// DELETE request to remove a customer
/**
 * @swagger
 * /customers/{CUST_CODE}:
 *   delete:
 *     summary: Delete a customer
 *     parameters:
 *       - in: path
 *         name: CUST_CODE
 *         required: true
 *         description: Customer code
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 *       404:
 *         description: Customer not found
 *       400:
 *         description: Invalid input
 */
app.delete('/customers/:CUST_CODE', [
    param('CUST_CODE').isString().withMessage('Customer code must be a string')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const customerCode = req.params.CUST_CODE;
    let connection;

    try {
        connection = await pool.getConnection();
        const result = await connection.query("DELETE FROM customer WHERE CUST_CODE = ?", [customerCode]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) {
            connection.end();
        }
    }
});

// POST request to create a new customer
/**
 * @swagger
 * /customers:
 *   post:
 *     summary: Create a new customer
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Customer object that needs to be added
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             CUST_CODE:
 *               type: string
 *               example: "1"
 *             CUST_NAME:
 *               type: string
 *               example: "John Doe"
 *             CUST_CITY:
 *               type: string
 *               example: "New York"
 *             WORKING_AREA:
 *               type: string
 *               example: "Area 51"
 *             CUST_COUNTRY:
 *               type: string
 *               example: "USA"
 *             GRADE:
 *               type: number
 *               example: 5
 *             OPENING_AMT:
 *               type: number
 *               example: 1000
 *             RECEIVE_AMT:
 *               type: number
 *               example: 500
 *             PAYMENT_AMT:
 *               type: number
 *               example: 200
 *             OUTSTANDING_AMT:
 *               type: number
 *               example: 300
 *             PHONE_NO:
 *               type: string
 *               example: "12345"
 *             AGENT_CODE:
 *               type: string
 *               example: "AG1"
 *     responses:
 *       201:
 *         description: Customer created successfully
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Customer created successfully"
 *             customerId:
 *               type: number
 *               example: 1
 *       400:
 *         description: Invalid input
 */

app.post('/customers', [
    body('CUST_CODE').isString().trim().withMessage('Customer code must be a string'),
    body('CUST_NAME').isString().trim().withMessage('Name must be a string'),
    body('CUST_CITY').optional().isString().trim().withMessage('City must be a string'),
    body('WORKING_AREA').isString().trim().withMessage('Working area must be a string'),
    body('CUST_COUNTRY').isString().trim().withMessage('Country must be a string'),
    body('GRADE').optional().isFloat({ min: 0 }).withMessage('Grade must be a positive number'),
    body('OPENING_AMT').isFloat({ min: 0 }).withMessage('Opening amount must be a positive number'),
    body('RECEIVE_AMT').isFloat({ min: 0 }).withMessage('Receive amount must be a positive number'),
    body('PAYMENT_AMT').isFloat({ min: 0 }).withMessage('Payment amount must be a positive number'),
    body('OUTSTANDING_AMT').isFloat({ min: 0 }).withMessage('Outstanding amount must be a positive number'),
    body('PHONE_NO').isString().trim().withMessage('Phone number must be a string'),
    body('AGENT_CODE').optional().isString().trim().withMessage('Agent code must be a string')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        CUST_CODE, CUST_NAME, CUST_CITY, WORKING_AREA,
        CUST_COUNTRY, GRADE, OPENING_AMT, RECEIVE_AMT,
        PAYMENT_AMT, OUTSTANDING_AMT, PHONE_NO, AGENT_CODE
    } = req.body;

    let connection;
    try {
        connection = await pool.getConnection();
        const result = await connection.query(
            "INSERT INTO customer (CUST_CODE, CUST_NAME, CUST_CITY, WORKING_AREA, CUST_COUNTRY, GRADE, OPENING_AMT, RECEIVE_AMT, PAYMENT_AMT, OUTSTANDING_AMT, PHONE_NO, AGENT_CODE) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [CUST_CODE, CUST_NAME, CUST_CITY, WORKING_AREA, CUST_COUNTRY, GRADE, OPENING_AMT, RECEIVE_AMT, PAYMENT_AMT, OUTSTANDING_AMT, PHONE_NO, AGENT_CODE]
        );

        // Convert BigInt insertId to string
        res.status(201).json({ 
            message: 'Customer created successfully',
            customerId: CUST_CODE
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) {
            connection.end();
        }
    }
});

const express = require('express');
const { body, param, validationResult } = require('express-validator');
const mariadb = require('mariadb');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const axios = require('axios');
const app = express();
const port = 3000;
app.use(cors());

// const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'sample',
    port: 3306,
    connectionLimit: 5
});

// Middleware for parsing JSON requests
app.use(express.json());

// Swagger setup
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'Sample API',
            version: '1.0.0',
            description: 'API documentation for the Sample application',
        },
        servers: [
            {
                url: `http://206.81.7.233:${port}`,
            },
        ],
    },
    apis: ['./server.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//Swagger file for getting all customers
/**
 * @swagger
 * /customers:
 *   get:
 *     summary: Get all customers
 *     responses:
 *       200:
 *         description: A list of customers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   CUST_CODE:
 *                     type: string
 *                   CUST_NAME:
 *                     type: string
 *                   CUST_CITY:
 *                     type: string
 *                   WORKING_AREA:
 *                     type: string
 *                   CUST_COUNTRY:
 *                     type: string
 *                   GRADE:
 *                     type: number
 *                   OPENING_AMT:
 *                     type: number
 *                   RECEIVE_AMT:
 *                     type: number
 *                   PAYMENT_AMT:
 *                     type: number
 *                   OUTSTANDING_AMT:
 *                     type: number
 *                   PHONE_NO:
 *                     type: string
 *                   AGENT_CODE:
 *                     type: string
 *       404:
 *         description: Customers not found
 *       500:
 *         description: Internal server error
 */

// Endpoint to get all customers with use of cache
app.get('/customers', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const rows = await connection.query("SELECT * FROM customer");

        if (rows.length === 0) {
            return res.status(404).json({ error: 'CUSTOMERS not found' });
        }

        res.setHeader('Content-Type', 'application/json');
        // Add caching headers
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) {
            connection.end();
        }
    }
});

//Swagger file for getting all foods
/**
 * @swagger
 * /foods:
 *   get:
 *     summary: Get all food items
 *     responses:
 *       200:
 *         description: A list of food items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   price:
 *                     type: number
 *       404:
 *         description: Food items not found
 *       500:
 *         description: Internal server error
 */

// Endpoint to get foods with the use of cache
app.get('/foods', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const rows = await connection.query("SELECT * FROM foods");

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Food Items not found' });
        }

        res.setHeader('Content-Type', 'application/json');
        // Add caching headers
        res.setHeader('Cache-Control', 'public, max-age=60'); // Cache for 60 seconds
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) {
            connection.end();
        }
    }
});

//Swagger file for getting all orders
/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders
 *     responses:
 *       200:
 *         description: A list of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   orderId:
 *                     type: integer
 *                   customerId:
 *                     type: string
 *                   orderDate:
 *                     type: string
 *                     format: date-time
 *                   totalAmount:
 *                     type: number
 *       404:
 *         description: No orders found
 *       500:
 *         description: Internal server error
 */

// Endpoint to get orders with the use of cache
app.get('/orders', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const rows = await connection.query("SELECT * FROM orders");

        if (rows.length === 0) {
            return res.status(404).json({ error: 'No orders are found' });
        }

        res.setHeader('Content-Type', 'application/json');
        // Add caching headers
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) {
            connection.end();
        }
    }
});

// PUT request to update a customer
/**
 * @swagger
 * /customers/{CUST_CODE}:
 *   put:
 *     summary: Update a customer
 *     parameters:
 *       - in: path
 *         name: CUST_CODE
 *         required: true
 *         description: Customer code
 *         schema:
 *           type: string
 *       - in: body
 *         name: customer
 *         description: The customer to update
 *         schema:
 *           type: object
 *           properties:
 *             CUST_NAME:
 *               type: string
 *             CUST_CITY:
 *               type: string
 *             WORKING_AREA:
 *               type: string
 *             CUST_COUNTRY:
 *               type: string
 *             GRADE:
 *               type: number
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *       404:
 *         description: Customer not found
 *       400:
 *         description: Invalid input
 */
app.put('/customers/:CUST_CODE', [
    param('CUST_CODE').isString().withMessage('Customer code must be a string'),
    body('CUST_NAME').isString().trim().withMessage('Name must be a string'),
    body('CUST_CITY').optional().isString().trim().withMessage('City must be a string'),
    body('WORKING_AREA').isString().trim().withMessage('Working area must be a string'),
    body('CUST_COUNTRY').isString().trim().withMessage('Country must be a string'),
    body('GRADE').optional().isFloat({ min: 0 }).withMessage('Grade must be a number')
], async (req, res) => {
    console.log('Validated Request Body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const customerCode = req.params.CUST_CODE;
    const { CUST_NAME, CUST_CITY, WORKING_AREA, CUST_COUNTRY, GRADE } = req.body;
    let connection;

    try {
        connection = await pool.getConnection();
        const result = await connection.query("UPDATE customer SET CUST_NAME = ?, CUST_CITY = ?, WORKING_AREA = ?, CUST_COUNTRY = ?, GRADE = ? WHERE CUST_CODE = ?", [CUST_NAME, CUST_CITY, WORKING_AREA, CUST_COUNTRY, GRADE, customerCode]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.status(200).json({ message: 'Customer updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) {
            connection.end();
        }
    }
});

// PATCH request to partially update a customer's phone number
/**
 * @swagger
 * /customers/{CUST_CODE}/phone:
 *   patch:
 *     summary: Update a customer's phone number
 *     parameters:
 *       - in: path
 *         name: CUST_CODE
 *         required: true
 *         description: Customer code
 *         schema:
 *           type: string
 *       - in: body
 *         name: phone
 *         description: The phone number to update
 *         schema:
 *           type: object
 *           properties:
 *             PHONE_NO:
 *               type: string
 *     responses:
 *       200:
 *         description: Customer phone updated successfully
 *       404:
 *         description: Customer not found
 *       400:
 *         description: Invalid input
 */
app.patch('/customers/:CUST_CODE/phone', [
    param('CUST_CODE').isString().withMessage('Customer code must be a string'),
    body('PHONE_NO').isString().trim().withMessage('Phone number must be a string')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const customerCode = req.params.CUST_CODE;
    const { PHONE_NO } = req.body;
    let connection;

    try {
        connection = await pool.getConnection();
        const result = await connection.query("UPDATE customer SET PHONE_NO = ? WHERE CUST_CODE = ?", [PHONE_NO, customerCode]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.status(200).json({ message: 'Customer phone updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) {
            connection.end();
        }
    }
});

// DELETE request to remove a customer
/**
 * @swagger
 * /customers/{CUST_CODE}:
 *   delete:
 *     summary: Delete a customer
 *     parameters:
 *       - in: path
 *         name: CUST_CODE
 *         required: true
 *         description: Customer code
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 *       404:
 *         description: Customer not found
 *       400:
 *         description: Invalid input
 */

app.delete('/customers/:CUST_CODE', [
    param('CUST_CODE').isString().withMessage('Customer code must be a string')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const customerCode = req.params.CUST_CODE;
    let connection;

    try {
        connection = await pool.getConnection();
        const result = await connection.query("DELETE FROM customer WHERE CUST_CODE = ?", [customerCode]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) {
            connection.end();
        }
    }
});

// POST request to create a new customer
/**
 * @swagger
 * /customers:
 *   post:
 *     summary: Create a new customer
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Customer object that needs to be added
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             CUST_CODE:
 *               type: string
 *               example: "1"
 *             CUST_NAME:
 *               type: string
 *               example: "John Doe"
 *             CUST_CITY:
 *               type: string
 *               example: "New York"
 *             WORKING_AREA:
 *               type: string
 *               example: "Area 51"
 *             CUST_COUNTRY:
 *               type: string
 *               example: "USA"
 *             GRADE:
 *               type: number
 *               example: 5
 *             OPENING_AMT:
 *               type: number
 *               example: 1000
 *             RECEIVE_AMT:
 *               type: number
 *               example: 500
 *             PAYMENT_AMT:
 *               type: number
 *               example: 200
 *             OUTSTANDING_AMT:
 *               type: number
 *               example: 300
 *             PHONE_NO:
 *               type: string
 *               example: "12345"
 *             AGENT_CODE:
 *               type: string
 *               example: "AG1"
 *     responses:
 *       201:
 *         description: Customer created successfully
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Customer created successfully"
 *             customerId:
 *               type: number
 *               example: 1
 *       400:
 *         description: Invalid input
 */

app.post('/customers', [
    body('CUST_CODE').isString().trim().withMessage('Customer code must be a string'),
    body('CUST_NAME').isString().trim().withMessage('Name must be a string'),
    body('CUST_CITY').optional().isString().trim().withMessage('City must be a string'),
    body('WORKING_AREA').isString().trim().withMessage('Working area must be a string'),
    body('CUST_COUNTRY').isString().trim().withMessage('Country must be a string'),
    body('GRADE').optional().isFloat({ min: 0 }).withMessage('Grade must be a positive number'),
    body('OPENING_AMT').isFloat({ min: 0 }).withMessage('Opening amount must be a positive number'),
    body('RECEIVE_AMT').isFloat({ min: 0 }).withMessage('Receive amount must be a positive number'),
    body('PAYMENT_AMT').isFloat({ min: 0 }).withMessage('Payment amount must be a positive number'),
    body('OUTSTANDING_AMT').isFloat({ min: 0 }).withMessage('Outstanding amount must be a positive number'),
    body('PHONE_NO').isString().trim().withMessage('Phone number must be a string'),
    body('AGENT_CODE').optional().isString().trim().withMessage('Agent code must be a string')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        CUST_CODE, CUST_NAME, CUST_CITY, WORKING_AREA,
        CUST_COUNTRY, GRADE, OPENING_AMT, RECEIVE_AMT,
        PAYMENT_AMT, OUTSTANDING_AMT, PHONE_NO, AGENT_CODE
    } = req.body;

    let connection;
    try {
        connection = await pool.getConnection();
        const result = await connection.query(
            "INSERT INTO customer (CUST_CODE, CUST_NAME, CUST_CITY, WORKING_AREA, CUST_COUNTRY, GRADE, OPENING_AMT, RECEIVE_AMT, PAYMENT_AMT, OUTSTANDING_AMT, PHONE_NO, AGENT_CODE) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [CUST_CODE, CUST_NAME, CUST_CITY, WORKING_AREA, CUST_COUNTRY, GRADE, OPENING_AMT, RECEIVE_AMT, PAYMENT_AMT, OUTSTANDING_AMT, PHONE_NO, AGENT_CODE]
        );

        // Convert BigInt insertId to string
        res.status(201).json({ 
            message: 'Customer created successfully',
            customerId: CUST_CODE
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) {
            connection.end();
        }
    }
});

app.get('/say', async (req, res) => {
    const keyword = req.query.keyword;

    if (!keyword) {
        return res.status(400).send('Keyword query parameter is required');
    }

    try {
        const response = await axios.get('https://dd3sywx3ae.execute-api.us-east-2.amazonaws.com/say?keyword=' + keyword);
        res.send(response.data);
    } catch (error) {
        res.status(500).send('Error calling the function');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
