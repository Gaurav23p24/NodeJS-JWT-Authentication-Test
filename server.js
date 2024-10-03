const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');

const { expressjwt } = require('express-jwt'); 

const bodyParser = require('body-parser');
const path = require('path');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

const PORT = 3000;

const secretKey = 'my secret key';
const jwtMiddleware = expressjwt({  
    secret: secretKey,
    algorithms: ['HS256']
});

let users = [
    {
        id: 1,
        username: 'Gaurav',
        password: '123'
    },
    {
        id: 2,
        username: 'Patel',
        password: '456'
    }
];

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    for (let user of users) {
        if (username === user.username && password === user.password) {
            let token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '3m' });
            res.json({
                success: true,
                err: null,
                token
            });
            break;
        } else {
            res.status(401).json({
                success: false,
                token: null,
                err: 'Username or password is incorrect'
            });
        }
    }
});

app.get('/api/dashboard', jwtMiddleware, (req, res) => {
    res.json({
        success: true,
        myContent: 'Secret content that only logged in people can see.!!!'
    });
});

app.get('/api/prices', jwtMiddleware, (req, res) => {
    res.json({
        success: true,
        myContent: 'This is prices $3.99'
    });
});

app.get('/api/settings', jwtMiddleware, (req, res) => {
    res.json({
        success: true,
        myContent: 'This is the settings page. Only authorized users can access this.'
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// app.use(function (err, req, res, next) {
//     if (err.name === 'UnauthorizedError') {
//         res.status(401).json({
//             success: false,
//             officialError: err,
//             err: 'Username or password incorrect 2'
//         });
//     } else {
//         next(err);
//     }
// });


app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        // This ensures a 401 status when the JWT is invalid or expired
        res.status(401).json({
            success: false,
            officialError: err,
            err: 'Unauthorized: Invalid or expired token'
        });
    } else {
        next(err);
    }
});


app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
});
