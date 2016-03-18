$(function(){
	var projectNames = [];
	$(".projects a").each(function() {
		var str = $(this).text().toLowerCase();
		$(this).parent().attr("data-name",str);
		projectNames.push(str);
	});
	
	//input 输入时触发
	$(".search input").on("keyup",function(){
		var val = $(this).val();
		var nArr = [];
		var i = 0;
		for(i=0;i<projectNames.length;i++){
			if(projectNames[i].indexOf(val) != -1){
				nArr.push(projectNames[i]);
			}
		}
		$(".projects li").stop().hide();
		for(i=0;i<nArr.length;i++){
			$(".projects li[data-name="+nArr[i]+"]").stop().show();
		}
		if(nArr.length > 0){
			$(".empty").hide();
		}else{
			$(".empty span").text(val);
			$(".empty").show();
		}
	})
})