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
	
	validator.validateEmail(event.email, errors);

	
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
			var sql = "INSERT INTO emailvalidation (emailvalidationid, userid, email, emailsent) " +
                "VALUES (?, ?, ?,  NOW())";
			conn.query(sql, [event.emailvalidationid, event.userid, event.email], function (err, result) {
				if (err) {
	        		callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));
	      		} else {
		        	console.log("successfully sent email");
	      			callback(null,"email sent successfulyl");
	      			setTimeout(function(){conn.end();},3000);
	  			}
	  		}); //query userregistrations
			} //error users
		}); //query users
	} //good registration
}