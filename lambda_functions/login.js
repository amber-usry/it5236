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
	validator.validateUsername(event.username, errors);
	
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
			var sql = "SELECT userid, passwordhash, emailvalidated FROM users "+
                "WHERE username = ?";
				//START TO DIFFER
					//GET						
					conn.query(sql, [event.username], function (err, result) {
									if (err) {
										// This should be a "Internal Server Error" error
										callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));
									} else {
										// Pull out just the codes from the "result" array (index '1')
										// Build an object for the JSON response with the userid and reg codes
										var json = { 
											userid: result[0].userid,
											username : event.username,
											passwordhash: result[0].passwordhash,
											emailvalidated : result[0].emailvalidated
										};
										// Return the json object
										callback(null, json);
										setTimeout(function(){conn.end();},3000);
									}
		      				}); //query userregistrations
			      		} //error users
		    		}); //query users
	} //connect database
} // no connection errors