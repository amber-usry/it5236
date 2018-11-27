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
			var sql = "SELECT isadmin FROM users WHERE userid = ?";
			
			conn.query(sql, [event.userid], function (err, result) {
			  	if (err) {
					// This should be a "Internal Server Error" error
					callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));
			  	} else {
			    	//console.log("Registration code count is " + result[0].codecount);
			    	if (result[0].isadmin == 0){
			    		errors.push("ACCESS_DENIED");
						callback(formatErrorResponse('ACCESS_DENIED', errors));
			    	} else {
						//START TO DIFFER
						//GET						
						conn.query(sql, [event.userid], function (err, result) {
										if (err) {
											// This should be a "Internal Server Error" error
											callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));
										} else {
											// Return the json object
											var json = { 
													  userid: event.userid
													};
											callback(null, json);
											setTimeout(function(){conn.end();},3000);
											
			      				} //query userregistrations
				      		}); //error users
			    		} //query users
					}
				});
			} //connect database
		}); // no connection errors
	} //no validation errors
}	//handler