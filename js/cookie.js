
//function setCookie(cname, cvalue, exdays) {
function setCookie(cname, cvalue) {
	/*var d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	var expires = "expires="+d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";*/
	document.cookie = cname + "=" + cvalue + ";" + "path=/";
	var name = getCookie("abc");
}

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i = 0; i < ca.length; i++) {
	    var c = ca[i];
	    while (c.charAt(0) == ' ') {
	        c = c.substring(1);
	    }
	    if (c.indexOf(name) == 0) {
			console.log("return "+c.substring(name.length, c.length));
	        return c.substring(name.length, c.length);
	    }
	}
	return "";
}

function checkCookie() {
	var user = getCookie("username");
	if (user != "") {
	    alert("Welcome again " + user);
	} else {
	    user = prompt("Please enter your name:", "");
	    if (user != "" && user != null) {
	        setCookie("username", user, 365);
	    }
	}
}

function closePage( event ){
	if( event.clientY < 0 ){
		setCookie("username","");
	}
 }

function logcheck(){
	//var log = getLocal();
	var log = getSession();
	if(log){
		$("body").show();
		console.log(getSession());
		console.log(isAdmin());
	}else{
		//$("body").show();
		location.replace("./loginForm.html");
	}
}
function logout(){
	//console.log("logout ! ! !");
	sessionStorage.clear();
	//setLocal("");
	// use cookie
	//setCookie("username","");
	logcheck();
}

/*function setSession(name){
	if(name == "")	sessionStorage.removeItem("username");
	else            sessionStorage.setItem("username", name);
}*/
function setSession(name,admin){
	if(name == "")	sessionStorage.removeItem("username");
	else            sessionStorage.setItem("username", name);
	sessionStorage.setItem(name, admin);
}
function getSession(){
	var result = sessionStorage.getItem("username");	
	if(result == null){
		return ""
	}
	else{
		return result;
	}
}
function isAdmin(){
	var result = sessionStorage.getItem(sessionStorage.getItem("username"));
	return result;
}
function setSessionPD(pw)
{
	sessionStorage.setItem("userpw", pw);
}
function getSessionPD()
{
	return sessionStorage.getItem("userpw");
}


function setLocal(name){
	if(name == "")	localStorage.removeItem("username");
	else            localStorage.setItem("username", name);
}
function getLocal(){
	var result = localStorage.getItem("username");	
	if(result == null){
		return ""
	}
	else{
		return result;
	}
}

function checkLog(){
	var log;
	log = getSession();
	//log = getLocal();
	console.log("checkLog()");
	console.log(log);
	if(log == ""){
		if (window.self == window.top){
			location.replace("../../loginForm.html");
		}
		else if(window.parent == window.top){
			window.parent.location.replace("../../loginForm.html");
		}
	}		
	// use cookie
	/*if(document.cookie == ""){
		console.log("no cookie");
		console.log(document.cookie);
		location.replace("../../loginForm.html");
	}*/
}

function preventHangul(event, obj){
	if (event.keyCode > 31 && (event.keyCode < 48 || event.keyCode > 57)) 
	{
		return false;
	}
}








	

