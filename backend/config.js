const config = {
	development: {
		// to be used for link generation
		url: 'http://localhost',
	},
	production: {
	},
	crypto: {
		WorkFactor: 14,
		ResetTokenLength: 30,
		ExpirationWaitTime: 1000*60*60*24,
		enyo_token_length: 30
	},
	mail: {
	},
	redis: {
		port: 4001,
		hostName: "localhost",
		password: 'salience,',
		retry_timeout: 1000*60*60,
		max_retries: 50
	},
	ssl: {
		key: 'aaa',
		cert: 'does not exist',
		ca: 'does not exist'
	},
	pyshell: {
		pythonPath: '',
		scriptPath: '../',
		scriptName: 'deep_gaze_predict.py',

	},
	imagePath: './',
	savePredictionsPath: './'

};


module.exports = config;