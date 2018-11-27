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
			var sql = "SELECT email, userid FROM users WHERE username = ? OR email = ?";
			
			conn.query(sql, [event.userid, event.email], function (err, result) {
			  	if (err) {
					// This should be a "Internal Server Error" error
					callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));
			  	} else {
				    		
						//START TO DIFFER
						//POST
						var sql = "INSERT INTO passwordreset (passwordresetid, userid, email, expires) " +
                        "VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))";
						conn.query(sql, [event.passwordresetid, event.userid, event.email, event.expires], function (result) {
					        	console.log("successful password reset email request");
				      			callback(null,"password reset email request successful");
				      			setTimeout(function(){conn.end();},3000);
					      			});
					}
				});
			} //connect database
		});
	}
}