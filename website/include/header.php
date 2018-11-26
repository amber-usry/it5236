<?php

	// Assume the user is not logged in and not an admin
	$isadmin = FALSE;
	$loggedin = FALSE;
	
	// If we have a session ID cookie, we might have a session
	if (isset($_COOKIE['sessionid'])) {
		
		$user = $app->getSessionUser($errors); 
		$loggedinuserid = $user["userid"];

		// Check to see if the user really is logged in and really is an admin
		if ($loggedinuserid != NULL) {
			$loggedin = TRUE;
			$isadmin = $app->isAdmin($errors, $loggedinuserid);
		}

	} else {
		
		$loggedinuserid = NULL;

	}


?>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>Login</title>
	<meta name="description" content="Russell Thackston's personal website for IT 5233">
	<meta name="author" content="Russell Thackston">
	<link rel="stylesheet" href="css/bootstrap.min.css">
	<link rel="stylesheet" href="css/style.css">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
	<div class="nav" >
		<a href="index.php" style="font-size:25px">Home </a>
		&nbsp;&nbsp;
		<?php if (!$loggedin) { ?>
			<a href="login.php" style="font-size:25px">Login </a>
			&nbsp;&nbsp;
			<a href="register.php" style="font-size:25px">Register </a>
			&nbsp;&nbsp;
		<?php } ?>
		<?php if ($loggedin) { ?>
			<a href="list.php" style="font-size:25px">List </a>
			&nbsp;&nbsp;
			<a href="editprofile.php" style="font-size:25px">Profile </a>
			&nbsp;&nbsp;
			<?php if ($isadmin) { ?>
				<a href="admin.php" style="font-size:25px">Admin </a>
				&nbsp;&nbsp;
			<?php } ?>
			<a href="fileviewer.php?file=include/help.txt" style="font-size:25px">Help </a>
			&nbsp;&nbsp;
			<a href="logout.php" style="font-size:25px">Logout </a>
			&nbsp;&nbsp;

		<?php } ?>
	</div>

	<h1>
	<img src="css/images/diary.png" alt="diary" style="width: 66px; height: 66px;">
	Episodic Diary
	<img src="css/images/diary.png" alt="diary" style="width: 66px; height: 66px;">
	</h1>

</body>	
</html>