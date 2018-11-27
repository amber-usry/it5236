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
			callback(formatErrorResponse('INTERNAL_SERVER_ERROR0', [err]));
		} else {
			console.log("Connected!");
			var sql = "INSERT INTO things (thingid, thingname, thingcreated, thinguserid, thingattachmentid, thingregistrationcode) " +
                "VALUES (?, ?, ?, ?, ?, ?)";
			
			conn.query(sql, [event.thingid, event.thingname, event.thingcreated, event.thinguserid, event.thingattachmentid, event.thingregistrationcode], function (err, result) {
			  	if (err) {
					// This should be a "Internal Server Error" error
					callback(formatErrorResponse('INTERNAL_SERVER_ERROR1', [err]));
			  	} else {
		        	console.log("successfully added thing");
	      			callback(null,"added thing successfully");
	      			setTimeout(function(){conn.end();},3000);
	      		}
  			}); //query userregistrations
  		} //error users
		}); //query users
  //	} //good registration
} //good code count
}