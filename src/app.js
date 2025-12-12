const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');

const app = express();
const port = 3000;


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'portfolio_secret_key',
    resave: false,
    saveUninitialized: true
}));


app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});


const indexRouter = require('./routes/index');
const portfoliosRouter = require('./routes/portfolios');

app.use('/', indexRouter);
app.use('/portfolios', portfoliosRouter);

app.listen(port, () => {
    console.log(`Portfolio Server is running on http://localhost:${port}`);
});
