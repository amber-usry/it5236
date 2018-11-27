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
	/*validator.validateUsername(event.username, errors);
	validator.validatePasswordHash(event.passwordHash, errors);
	validator.validateEmail(event.email, errors);
	validator.validateRegistrationCode(event.registrationcode, errors);*/
	
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
			callback(formatErrorResponse('INTERNAL_SERVER_ERROR0', [err]));
		} else {
			
			console.log("Connected!");
			
			var sql = "INSERT INTO auditlog (context, message, logdate, ipaddress, userid) "+
            "VALUES ( ?, ?, NOW(), ?, ?)";
			
			conn.query(sql, [event.context, event.message, event.ipaddress, event.userid], function (err, result) {
			  	if (err) {
					// This should be a "Internal Server Error" error
					callback(formatErrorResponse('INTERNAL_SERVER_ERROR1', [err]));
			  	} else {
						//START TO DIFFER
						//POST 				
						conn.query(sql, [event.context, event.message, event.logdate, event.ipaddress, event.userid], function (err, result) {
							if (err) {
								// Check for duplicate values
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
										callback(formatErrorResponse('BAD_REQUEST', ["Duplicate value"]));
									}
								} else {
									// This should be a "Internal Server Error" error
									callback(formatErrorResponse('INTERNAL_SERVER_ERROR2', [err]));
								}
				      		} else {
								conn.query(sql, [event.context, event.message, event.ipaddress, event.userid], function (err, result) {
									if (err) {
						        		callback(formatErrorResponse('INTERNAL_SERVER_ERROR3', [err]));
						      		} else {
							        	console.log("successful auditlog");
						      			callback(null,"auditlog successful");
						      			setTimeout(function(){conn.end();},3000);
						      		}
			      				}); //query userregistrations
				      		} //error users
			    			}); //query users
			  		//	} //good registration
					} //good code count
			  	}); //query registration codes
			}
		});
	}
}