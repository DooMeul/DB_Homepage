const express = require('express');
const router = express.Router();
const db = require('../config/db');


router.get('/', (req, res) => {
    const query = 'SELECT * FROM portfolios ORDER BY created_at DESC';
    db.query(query, (err, portfolios) => {
        if (err) throw err;
        res.render('index', {
            title: '홈',
            user: req.session.user,
            portfolios: portfolios
        });
    });
});


router.get('/login', (req, res) => {
    res.render('login', { user: req.session.user, title: '로그인' });
});


router.get('/signup', (req, res) => {
    res.render('signup', { user: req.session.user, title: '회원가입' });
});


router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(query, [email, password], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            const user = results[0];
            req.session.user = user;
            res.redirect('/portfolios');
        } else {
            res.render('login', { error: '이메일 또는 비밀번호가 올바르지 않습니다.', user: req.session.user, title: '로그인' });
        }
    });
});


router.post('/signup', (req, res) => {
    const { username, email, password } = req.body;
    const query = 'INSERT INTO users (user_name, email, password) VALUES (?, ?, ?)';
    db.query(query, [username, email, password], (err, results) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.render('signup', { error: '이미 등록된 이메일입니다.', user: req.session.user, title: '회원가입' });
            }
            throw err;
        }
        res.redirect('/');
    });
});


router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

module.exports = router;
