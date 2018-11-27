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
			var sql = "SELECT commentid, commenttext, convert_tz(comments.commentposted,@@session.time_zone,'America/New_York') as commentposted, username, attachmentid, filename " +
                "FROM comments LEFT JOIN users ON comments.commentuserid = users.userid " +
                "LEFT JOIN attachments ON comments.commentattachmentid = attachments.attachmentid " +
                "WHERE commentthingid = ? ORDER BY commentposted ASC";
						//START TO DIFFER
						//GET						
						conn.query(sql, [event.thingid], function (err, result) {
										if (err) {
											// This should be a "Internal Server Error" error
											callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));
										} else {
											// Pull out just the codes from the "result" array (index '1')
											// Build an object for the JSON response with the userid and reg codes
											var json = [];
		  									for(var i=0; i<result.length; i++) { 
		  									json.push({	
												commentid : result[i]['commentid'],
												commenttext : result[i]['commenttext'],
												commentposted : result[i]['commentposted'],
												commentuserid: result[i]['commentuserid'],
												commentthingid : result[i]['commentthingid'],
												commentattachmentid : result[i]['commentattachmentid']
		  										
		  									});	
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