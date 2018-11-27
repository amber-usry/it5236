var mysql = require('./node_modules/mysql');
var config = require('./include/config.json');
var validator = require('./include/validation.js');

function formatErrorResponse(code, errs) {
	return JSON.stringify({ 
		error  : code,
		errors : errs
	});
}

exports.handler = (event, context, callback) => {
	//instruct the function to return as soon as the callback is invoked
	context.callbackWaitsForEmptyEventLoop = false;

	//validate input
	var errors = new Array();
	
	 // Validate the user input
	//validator.validateUsername(event.username, errors);
	//validator.validatePasswordHash(event.passwordHash, errors);
	//validator.validateEmail(event.email, errors);
	//validator.validateRegistrationCode(event.registrationcode, errors);
	
	if(errors.length > 0) {
		// This should be a "Bad Request" error
		callback(formatErrorResponse('BAD_REQUEST', errors));
	} else {
	
	//getConnection equivalent
	var conn = mysql.createConnection({
		host 	: config.dbhost,
		user 	: config.dbuser,
		password : config.dbpassword,
		database : config.dbname
	});
	
	//prevent timeout from waiting event loop
	context.callbackWaitsForEmptyEventLoop = false;

	//attempts to connect to the database
	conn.connect(function(err) {
	  	
		if (err)  {
			// This should be a "Internal Server Error" error
			callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));
		} else {
			console.log("Connected!");
			var sql = "INSERT INTO attachments (attachmentid, filename)" + "VALUES(?, ?)  ";
			
			conn.query(sql, [event.attachmentid, event.filename], function (err, result) {
			  	if (err) {
					// This should be a "Internal Server Error" error
					callback(formatErrorResponse('INTERNAL_SERVER_ERROR1', [err]));
			  	} else {
			    	/*console.log("Registration code count is " + result[0].codecount);
			    	if (result[0].codecount == 0){
			    		errors.push("Bad registration code");
						callback(formatErrorResponse('BAD_REQUEST', errors));
			    	} else {
						var sql = "INSERT INTO comments (commentid, commenttext, commentposted, commentuserid, commentthingid, commentattachmentid) " +
                "VALUES (?, ?, ?, ?, ?, ?)";
						//START TO DIFFER
						//POST 				
						conn.query(sql, [event.commentid, event.commenttext, event.commentposted, event.commentuserid, event.commentthingid, event.commentattachmentid], function (err, result) {
							if (err) {
								 Check for duplicate values
								if(err.errno == 1062) {
									console.log(err.sqlMessage);
									if(err.sqlMessage.indexOf('username') != -1) {
										// This should be a "Internal Server Error" error
										callback(formatErrorResponse('BAD_REQUEST', ["Username already exists"]));
									} else if(err.sqlMessage.indexOf('email') != -1) {
										// This should be a "Internal Server Error" error
										callback(formatErrorResponse('BAD_REQUEST', ["Email address already registered"]));
									} else {
										// This should be a "Internal Server Error" error
										callback(formatErrorResponse('BAD_REQUEST', ["Duplicate value0"]));
									}
								} else {
									// This should be a "Internal Server Error" error
									callback(formatErrorResponse('INTERNAL_SERVER_ERROR3', [err]));
								}
				      		} else {
					      		var sql = "INSERT INTO comments (commentid, commenttext, commentposted, commentuserid, commentthingid, commentattachmentid) " +
                "VALUES (?, ?, ?, ?, ?, ?)";*/
								//conn.query(sql, [event.commentid, event.commenttext, event.commentposted, event.commentuserid, event.commentthingid, event.commentattachmentid], function (err, result) {
								/*	if (err) {
						        		callback(formatErrorResponse('INTERNAL_SERVER_ERROR4', [err]));
						      		} else {*/
							        	console.log("successfully saved attachment");
						      			callback(null,"saved attachment successfully");
						      			setTimeout(function(){conn.end();},3000);
						      		}
			      				}); //query userregistrations
				      		} //error users
			    			}); //query users
			  		//	} //good registration
					} //good code count
			  	}