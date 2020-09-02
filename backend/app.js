console.log('Starting saliency express server')
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

// some basic security thigns
const csrf = require('csurf');
const csrfOptions = {cookie: true};
const csrfProtection = csrf(csrfOptions);
const hemlet =require('helmet')

// get the middleware and config
const config = require('./config');
const middleware = require('./middlewares');


//set default size limits
const urlEncodedSizeLimit=config.urlSizeLimit || '64mb';
const jsonEncodedSizeLimit = config.jsonSizeLimit || '64mb';

const index = require('./routes/index');
const users = require('./routes/users');

const app = express();
console.log('express app created');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(function(req,res,next){
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
	res.setHeader('Access-Control-Allow-Credentials', true);
	next();
});
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false, limit:urlEncodedSizeLimit }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// initialise the python shell bits
const predictCommand = config.pyshell.predictCommand;
const commandSeparator = config.pyshell.commandSeparator;
const errorSeparator = config.pyshell.errorSeparator;
const pythonPath = config.pyshell.pythonPath;
const scriptPath = config.pyshell.scriptPath;
const scriptName = config.pyshell.scriptName;
const imagePath = config.imagePath;
const savePredictionsPath = config.savePredictionsPath;
const pyshellOptions = {
	mode: 'text',
	pythonPath: pythonPath,
	pythonOptions: ['-u'],
	scriptPath: scriptPath,
	args: [imagePath, savePredictionsPath]
}
const PythonShell = require('python-shell');
const pathToScript = '../deep_gaze_predict.py';
var pyshell = new PythonShell(pathToScript);

function sendCommand(command, data){
	return String(command) + commandSeparator + String(data)
}

function parseErrrorString(errString){
	const splits = errString.split(errorSeparator);
	console.log(splits)
	const err = {
		code: splits[1],
		message: splits[2],
		exception: splits[3],
	};
	return err
}
// send a message/command
pyshell.send(sendCommand('predict', 'image_path')); 

pyshell.on('message', function(message){
	console.log('Received python message response');
	console.log(message);
	// if result is a a json error parse it
	if (message[0] === errorSeparator){
		// it's an object, which means an error
		console.log('Its an error!');
		const err = parseErrrorString(message);
		console.log(err)
	}
});

// on end
pyshell.end(function(err, code, signal){
	if (err) throw err;
	console.log('The exit code was: ' + code);
  	console.log('The exit signal was: ' + signal);
  	console.log('finished');
  	console.log('finished');
});

// get the fle
const imageUpload = require('./image_upload').imageUploadFunction;

function handleImageUpload(req, next){
	image_upload(req.images, function(err, fnames){
		if (err){
			return next(err)
		}
		res_arr = []
		for (i=0; i < fnames.length; i++){
			var fname = fnames[i]
			pyshell.send(predictCommand + commandSeparator + fname)
			pyshell.on('message', function(message){
				var {code, fname} = message.split(commandSeparator);
				if (code === 'Success!'){
					res_arr.append(fname)
					if (res_arr.length >= fnames.length){
						return next(undefined, res_arr)
					}
				}
			});

		}
	});
}


// initialise the router
app.get('/', function(req, res,next){
	return
});

app.post('/image_submission', function(req,res, next){
	handleImageUpload(req, function(err, resp){
		if (err){
			return next(err)
		}
		res.send({code: SUCCESSCODE, response: JSON.stringify(resp)});
	});
});

module.exports = app;
