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
			var sql = "UPDATE users SET passwordhash= ? " +
                "WHERE userid = ?";

						conn.query(sql, [event.userid, event.passwordhash], function (err, result) {
							if (err) {
								// Check for duplicate values
								if(err.errno == 1062) {
									console.log(err.sqlMessage);
									if(err.sqlMessage.indexOf('userid') != -1) {
										// This should be a "Internal Server Error" error
										callback(formatErrorResponse('BAD_REQUEST', ["User does not exist"]));
									} else if(err.sqlMessage.indexOf('passwordhash') != -1) {
										// This should be a "Internal Server Error" error
										callback(formatErrorResponse('BAD_REQUEST', ["Incorrect password"]));
									} else {
										// This should be a "Internal Server Error" error
										callback(formatErrorResponse('BAD_REQUEST', ["Does not match"]));
									}
								} else {
									// This should be a "Internal Server Error" error
									callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));
								}
				      		} else {
								conn.query(sql, [event.userid, event.passwordhash], function (err, result) {
									if (err) {
						        		callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));
						      		} else {
							        	console.log("successfully updates user password");
						      			callback(null,"updated user password successfully");
						      			setTimeout(function(){conn.end();},3000);
					      			}
			      				}); //query userregistrations
				      		} //error users
			    			}); //query users
			  			} //good registration
					}); //good code count
			  	} //query registration codes
			}