const express = require('express');
const router = express.Router();
const db = require('../config/db');


function ensureLoggedIn(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.redirect('/login');
}


router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 6;
  const offset = (page - 1) * limit;

  
  const countQuery = 'SELECT COUNT(*) AS count FROM portfolios';
  db.query(countQuery, (err, countResult) => {
    if (err) throw err;
    const total = countResult[0].count;
    const totalPages = Math.ceil(total / limit) || 1;

    
    const query = 'SELECT p.*, u.user_name FROM portfolios p LEFT JOIN users u ON p.user_id = u.user_id ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    db.query(query, [limit, offset], (err, portfolios) => {
      if (err) throw err;
      res.render('portfolios/index', {
        title: '전체 포트폴리오',
        user: req.session.user,
        portfolios: portfolios,
        currentPage: page,
        totalPages: totalPages
      });
    });
  });
});


router.get('/new', ensureLoggedIn, (req, res) => {
  res.render('portfolios/new', { title: '포트폴리오 업로드', user: req.session.user });
});


router.post('/', ensureLoggedIn, (req, res) => {
  const { title, description, github_url, demo_url, technologies, category } = req.body;
  const user_id = req.session.user.user_id;
  const query = 'INSERT INTO portfolios (user_id, title, description, github_url, demo_url, technologies, category) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [user_id, title, description, github_url, demo_url, technologies, category], (err, result) => {
    if (err) throw err;
    res.redirect(`/portfolios/${result.insertId}`);
  });
});


router.get('/:id', (req, res) => {
  const id = req.params.id;
  const query = 'SELECT p.*, u.user_name, u.email FROM portfolios p LEFT JOIN users u ON p.user_id = u.user_id WHERE p.portfolio_id = ?';
  db.query(query, [id], (err, portfolios) => {
    if (err) throw err;
    if (!portfolios || portfolios.length === 0) return res.status(404).send('Portfolio not found');
    
    const portfolio = portfolios[0];
    res.render('portfolios/show', {
      title: portfolio.title,
      user: req.session.user,
      portfolio: portfolio
    });
  });
});


router.get('/:id/edit', ensureLoggedIn, (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM portfolios WHERE portfolio_id = ?', [id], (err, rows) => {
    if (err) throw err;
    if (!rows || rows.length === 0) return res.status(404).send('Portfolio not found');
    
    const portfolio = rows[0];
    if (req.session.user.user_id !== portfolio.user_id) {
      return res.status(403).send('Forbidden: You can only edit your own portfolio');
    }
    res.render('portfolios/edit', { title: '포트폴리오 수정', user: req.session.user, portfolio });
  });
});


router.post('/:id/edit', ensureLoggedIn, (req, res) => {
  const id = req.params.id;
  const { title, description, github_url, demo_url, technologies, category } = req.body;
  
  db.query('SELECT * FROM portfolios WHERE portfolio_id = ?', [id], (err, rows) => {
    if (err) throw err;
    const portfolio = rows[0];
    if (!portfolio) return res.status(404).send('Portfolio not found');
    if (req.session.user.user_id !== portfolio.user_id) return res.status(403).send('Forbidden');
    const query = 'UPDATE portfolios SET title = ?, description = ?, github_url = ?, demo_url = ?, technologies = ?, category = ? WHERE portfolio_id = ?';
    db.query(query, [title, description, github_url, demo_url, technologies, category, id], (err) => {
      if (err) throw err;
      res.redirect(`/portfolios/${id}`);
    });
  });
});


router.post('/:id/delete', ensureLoggedIn, (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM portfolios WHERE portfolio_id = ?', [id], (err, rows) => {
    if (err) throw err;
    const portfolio = rows[0];
    if (!portfolio) return res.status(404).send('Portfolio not found');
    if (req.session.user.user_id !== portfolio.user_id) {
      return res.status(403).send('Forbidden');
    }
    db.query('DELETE FROM portfolios WHERE portfolio_id = ?', [id], (err) => {
      if (err) throw err;
      res.redirect('/portfolios');
    });
  });
});

module.exports = router;
