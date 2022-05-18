var progressTime = 120;
function ShowProgressAnimation(message, rebootTime) {
	progressTime = rebootTime;
	console.log("ShowProgressAnimation");
	if(message == "SYSTEM REBOOT"){
		var progressDiv = '<div id="loading-div-background" style="line-height:1.8em;width:100%; height:100%;"><div id="loading-div" class="ui-corner-all" ><h2 style="color:gray;font-weight:normal;">'+message+'<br><br>in '+ progressTime +' sec ...</h2></div></div>'
		$('body').prepend(progressDiv);
		$("#loading-div-background").css({ opacity: 0.8 });
		$("#loading-div-background").show();
		var _timer = setInterval(function(){
			if(progressTime == 0) {
				clearInterval(_timer);
				progressTime = 80;
				location.reload();
			}else{
				progressTime = progressTime-1;
				$('#loading-div h2').html('SYSTEM REBOOT<br><br>in '+ progressTime + ' sec...');
			}
		}, 1000);

	}else{
		var progressDiv = '<div id="loading-div-background" style="line-height:1.8em;width:100%; height:100%;"><div id="loading-div" class="ui-corner-all" ><img style="height:30px;margin:30px;" src="/images/loading.gif" alt="Loading.."/><h2 style="color:gray;font-weight:normal;">'+message+'</h2></div></div>'
		$('body').prepend(progressDiv);
		$("#loading-div-background").css({ opacity: 0.8 });
		$("#loading-div-background").show();
	}
}
function HideProgressAnimation(){
	console.log("HideProgressAnimation");
	$("#loading-div-background").hide();
	$('#loading-div').remove();
	$('#loading-div-background').remove();
}