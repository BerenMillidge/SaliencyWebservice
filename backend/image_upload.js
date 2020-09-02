const fs = require('fs');
const config = require('./config');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

//use streamifier to convert the buffer into a stream just now
const streamifier = require('streamifier');

const allowedExtensions = ['.jpg','.png','.jpeg'];
const allowedMIMETypes= ['image/jpg', 'image/png','image/jpeg'];


const baseFilePath = config.baseImageUploadFilePath ||'./public/images/';
const baseEncoding = config.baseImageUploadEncoding || 'base64';

const hashFunc = config.crypto.fileHashFunc || 'md5';
const hashFormat = config.crypto.hashFormat || 'hex';

const bcyrptWorkFactor = config.crypto.fileHashWorkFactor || 0;

const imageByteOverrideSize = config.overrideByteSize || 1024;

const maxImageCreationAttempts = config.ImageFileMaxAttempts || 100000;

const imageValidationMagicHexNumbers = {
	'jpg': 'ffd8ffe0',
	'jpeg': 'ffd8ffe0',
	'png': '89504e47',
	'gif': '47494638'
}

const codes = require('./codes');
const NO_IMAGES_FOUND = codes.NO_IMAGES_FOUND;

function ensureExists(path, next){
	fs.mkdir(path, function(err){
		if(err){
			if(err.code=='EEXIST'){
				//if file already exists it is fine, so don't do anythign
				return next(null);
			}
			return next(err);
		}
		return next(null);
	});
}

ensureExists(baseFilePath, function(err){
	if(err){
		console.log('error in ensuring directory exists: ' + err);
		return;
	}
	console.log('file exists');
	return;
})

function createCheckFileLocation(baseFname, extension,next){
	var fname = baseFname + '.' + extension;
	// I'm going to make this asynchronous so it won't block
	console.log('in create check file locatoin function');
	fs.open(fname, 'wx', function(err, fd){
		if(err){
			const max_attempts = 10;
			console.log('err in create check file location')
			for (var i = 0; i<max_attempts; i++){
				console.log('in check file location loop');
				//attempt to open
				fname = baseFname+'_'+i.toString()+'.'+extension;
				const continue_loop = fs.open(fname, 'wx', function(err, fd){
					if(err){
						console.log('there is err in file creation loop');
						console.log(err);
						return true;

					} else {

						return false;
					}
				});
				console.log(continue_loop);
				if(continue_loop===false){
					console.log('in contiue loop is false. Should break');
					break;
					return next(null, fname);
				}
			}
			//this means the loop is over
			const error = {
				code: 999,
				message: 'Number of file attempts exceeded. There shouldnt ever be this many collisoins. Something is wrong'
			}
			console.log('returns having exceeded max attempts');
			return next(error);
		} else {
			console.log('in final return of create check file location');
			return next(null, fname);
		}
	});
}


function createCheckFileLocationRecursive(baseFname, extension, next, i){
	console.log('in create check file location recursive');
	if (i ===undefined){
		i = 0;
	}
	const fname = baseFname + '_' + i + '.' + extension;
	const maxAttempts = 10000;
	if(i >maxAttempts){
		const error = {
			code: 999,
			message: 'Number of file attempts exceeded. There should not ever be this many collisions. Something has gone wrong'
		}
		return next(error);
	}
	fs.open(fname, 'wx', function(err, fd){
		if(err){
			if(err.code ==='EEXIST'){
				return createCheckFileLocationRecursive(baseFname, extension, next, i+1);
			} else {
				return next(err);
			}
		}
		return next(null, fname);
	});
}


function uploadImage(img,uploadedImages,total_images,item_id,  next){
	console.log('in upload image function');
	//get the image information
	const name = img.name;
	const last_modified = img.last_modified;
	const size = img.size;
	const type = img.type;
	const data = img.data;
	console.log(name);
	console.log(type);
	//split on the data
	console.log(data.split(',')[0]);
	const splits = data.split(',');
	const metadata = splits[0];
	const imageFileString = splits[1];
	console.log(metadata);
	//do some analysis on the metadata and check mime match
	const result = checkGetMimeType(name, type, metadata);
	const err = result.err;
	const extension = result.type;
	if(err===false){
		//next I need to do the direct image validation
		const imageBuffer = new Buffer(imageFileString, baseEncoding);
		validateUploadedImage(imageBuffer, extension, function(err){
			if(err){
				uploadedImages.push(err);
	
				return next(err);
			}
			getImageHashNoStream(imageFileString, function(err, hash){
			console.log('got hash no stream');
		
			const baseFname = baseFilePath + hash;
			createCheckFileLocationRecursive(baseFname, extension, function(err, fname){
			
				if(err){
					uploadedImages.push(err);
			
					return next(err);
				}
				//const fname2 = "test2555.jpg";
				console.log('about to create write stream');
				// desplit the filename again to store the minumum in the database
				var writeStream = fs.createWriteStream(fname);
				console.log('created write stream');
				writeStream.on('finish', function(){
					const desplits = fname.split('/');
					fname = desplits[desplits.length-1];
					const payload = {
						item_id: item_id,
						fname: fname,
						name: name,
						last_modified: last_modified,
						size: size,
						type: type,
					}
					console.log('image uploaded. Write stream finished writing to:' + fname);

					uploadedImages.push(payload);
					
					if(uploadedImages.length >=total_images){
				
						return next(null, null);
					}
					return;
				});

				writeStream.on('error', function(err){
					console.log('error while writing to file');
					console.log(err);
					uploadedImages.push(err);
					return next(err);
				})
				writeStream.write(imageBuffer);
				writeStream.end();
				});
		
		});
	});
	} if(err===true){
		//check extension for why
		console.log('invalid img mime type');
		console.log(extension);
		const error = {
			code: 999,
			message: extension
		}
		uploadedImages.push(err);
		return next(error);
	}
}

function getBcryptHash(buf, next){
	
	bcrypt.hash(buf, bcyrptWorkFactor, function(err, hash){
		if(err){
			console.log('error in bcrypt hashing function');
			console.log(err);
			return next(err);
		}
	
		return next(null, encodeURIComponent(hash));
	});
}

function getImageHash(buf, next){
	console.log('in image hash function creating hash');
	var hash=crypto.createHash(hashFunc);
	//use streamifier for this!
	var stream = streamifier.createReadStream(buf);
	console.log(stream);
	stream.on('error', function(err){
		console.log('error in hash function');
		console.log(err);
		return next(err);
	});
	/*
	output.once('readable', function(){
		return next(null, output.read().toString(hashFormat));
	});
	*/
	stream.on('data', function(data){
		hash.update(data, 'utf-8');
	});
	stream.on('end', function(){
		console.log('calling hash digest');
		const hash_val = hash.digest(hashFormat).toString();
		return next(null, encodeURIComponent(hash_val));
	});
	stream.on('finish', function(){
		console.log('stream finish event fired');
	})
	stream.pipe(hash);;

}
function getImageHashNoStream(buf, next){
	var hash = crypto.createHash(hashFunc);
	hash.on('error', function(err){
		console.log('error in hash function');
		console.log(err);
		return next(err);
	});
	hash.update(buf);
	const hash_val = hash.digest(hashFormat).toString();
	return next(null, encodeURIComponent(hash_val));

}

function parse_metadata(metadata){
	//console.log('in parse metadata function');
	//console.log('metadata: ' + metadata);
	const splits1 = metadata.split(':');
	//console.log(splits1);
	const data_type=splits1[0];
	const splits2 = splits1[1].split(';');
	//console.log(splits2);
	const MIME_type = splits2[0];
	const base_encoding = splits2[1];
	return {
		data_type: data_type,
		MIME_type: MIME_type,
		base_encoding: base_encoding
	};
}

function checkGetMimeType(name, type, metadata){
	//console.log('in check get mime type');
	const extension = '.' + name.split('.')[1];
	//console.log('extension: ' + extension);
	//I only care about the mime type
	const metadata_MIME = parse_metadata(metadata).MIME_type;
	////console.log('MIME: ' + metadata_MIME);
	//console.log('Type: ' + type);
	if(metadata_MIME===type){
		// success, now check extension
		if(type==="image/jpg" && extension===".jpg" || type==="image/jpeg" &&extension===".jpg"){
			//it's correct
			return {err: false, type: "jpg"};
		}
		if(type==="image/png" && extension===".png"){
			return {err: false, type: "png"};
		}
		if(type==="image/jpeg" && extension===".jpeg"){
			return {err: false, type: "jpeg"};
		}
		return {err: true, type: "Mime type not recognised"}
	} else {
		return {err: true, type: "MIME types mistmatched"};
	}
}

exports.uploadImages = function(req,res,next){

	console.log('in upload images functoin');
	//first get the images thing
	const images = req.body.files;
	console.log(typeof(images));
	console.log(images.length);
	if(images===undefined || images===null){
		//no images so return
		console.log('no images found');
		return next();
	}
	const numImages = images.length;
	if(numImages <=0 || numImages===undefined || numImages===null){
		//some failure of array here must be an array
		console.log('images not an array of requisite length');
		return next();
	}
	var uploadedImages = [];
	for (var i = 0; i<numImages; i++){
	
		const img = images[i];
		uploadImage(img,uploadedImages, numImages, function(err, ret){
			if(err){
				console.log('error in upload image function bubbled to upload images');
				console.log(err);
				return next(err);
			}
			console.log('if this is called then all the images should have been uploaded correctly');
			console.log('if I have got my async logic right');
			console.log(uploadedImages);
			req.images_uploaded = true;
			req.images= uploadedImages;
			return next();
		
		});

	}

}

exports.uploadImagesFunction = function(image_data, next){
if(image_data===undefined || image_data===null){
		//no images so return
		console.log('no images found');
		const err = {
			code: NO_IMAGES_FOUND,
			message: 'No images found'
		}
		return next(err);
	}
	const images = image_data.data;
	if(images===undefined || images ===null){
		const err = {
			code: NO_IMAGES_FOUND,
			message: 'No images found'
		};
		return next(err);
	}
	const item_id = image_data.item_id
	const numImages = images.length;
	if(numImages <=0 || numImages===undefined || numImages===null){
		//some failure of array here must be an array
		console.log('images not an array of requisite length');
		const err = {
			code: NO_IMAGES_FOUND,
			message: 'No images found'
		}
		return next(err);
	}
	var uploadedImages = [];
	for (var i = 0; i<numImages; i++){

		const img = images[i];
		console.log('times round the loop: ' + i);
		uploadImage(img,uploadedImages, numImages,item_id, function(err, ret){
			if(err){
				console.log('error in upload image function bubbled to upload images');
				console.log(err);
				return next(err);
			}
			return next(null, uploadedImages);
		});

	}

}

function validateUploadedImage(img_data, purported_extension, next){
	
	const validationHex = imageValidationMagicHexNumbers[purported_extension];
	const minValidationHexLength = 2;
	if(typeof(validationHex)==='string' && validationHex.length >minValidationHexLength){
	
		const initialHex = img_data.toString('hex', 0,validationHex.length/2);

		if(validationHex ===initialHex){
			return next(null);

		} else {
			const error = {
				code: 999,
				message: "Validation hex fails to match. Image data corrupted or invalid"
			}
			return next(error);
		}

	}
	const error = {
		code: 999,
		message: "Purported MIME type does not match. Probably incorrect"
	} 
	return next(error);
}
