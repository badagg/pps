$(function(){
	//面包屑
	var crumbs = function(){
		var h3 = $(".header h3");
		var path = h3.attr("data-path");
		var paths = path.split("/");
		var arr = [];
		for(var i=0;i<paths.length;i++){
			if(paths[i]){
				arr.push(paths[i]);
			}
		}
		var urlText = "";
		for(var i=0;i<arr.length;i++){
			urlText+="/"+arr[i];
			var link = "";
			if(i>arr.length-2){
				link = arr[i];
			}else{
				link = "<a class='crumbs' href='/project"+urlText+"'>"+arr[i]+"</a><span class='gang'>/</span>";
			}
			h3.append(link);
		}
	}();

	//二维码
	var orcode = function(){
		$(".orcode").each(function(index, el) {
	      var link = $(this).attr('data-url');
	      $(this).qrcode({width: 80,height: 80,text: link});
	    });
	}();

	//copy
	var copyUrl = function(){
		new Clipboard('.copy');
	}();

	//updata svn
	var updataSvn = function(){
		var svnup = $('.updata');
		var iconFont = $(".updata .iconfont");
		var tips = $(".updata span");
		var svnMsg = $(".svn-msg");
		var svnMsgTips = svnMsg.find('p');
		var isOpen = false;
		$("#updataSvn").click(function(event) {
			tips.text("正在更新SVN...");
			iconFont.addClass('rotate');
			isOpen = false;
			$.ajax({
				url: '/updatasvn',
				type: 'GET'
			})
			.done(function(data){
				if(data.status){
					tips.text('');
					svnMsgTips.html('SVN更新成功<br />' + data.msg);
					svnMsg.addClass('updataed');
					isOpen = true;
				}else{
					tips.text('SVN更新失败');
				}
				iconFont.removeClass('rotate');
			})
		});

		//隐藏SVN更新按钮
		var path = $(".header h3").attr("data-path");
		var paths = path.split("/");
		if(paths[1] == "fed"){
			svnup.show();
		}
		//关闭日志框
		$(document).on('click', function(e) {
			if(isOpen){
				if($(e.target).parents('.svn-msg').length == 0 && !$(e.target).hasClass('svn-msg')){
					svnMsg.removeClass('updataed');
					setTimeout(function(){
						location.reload();
					},400)
				}
			}
		});
	}();
	
})
