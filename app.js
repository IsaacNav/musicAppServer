
const path = require('path');
const env = require('node-env-file');

if (process.env.NODE_ENV !== 'production') env(path.resolve('.env'));

const express = require('express');
const routes = require('./routes/router');
const globalErrorshandler = require('./config/globalErrorHandler');

const app = express();

app.use(logger('dev'));
app.use(compression());
app.use(helmet());
app.use(cors());
app.use(fileUpload());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.resolve('public')));


app.use('/', routes);