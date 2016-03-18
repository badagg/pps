$(function(){

	//获取dom
	var dom_pn = $("#J_pn"),
		dom_pd = $("#J_pd"),
		dom_id = $("#J_id"),
		dom_ui = $("#J_ui"),
		dom_fed = $("#J_fed"),
		dom_btn = $(".btn");
	
	//获取参与人员数据
	var users = [];
	var projects = [];

	var getTableDate = function(tableName,callback){
		//防止重复查询
		if(tableName == "projects" && projects.length > 0){
			return;
		}
		if(tableName == "users" && users.length > 0){
			return;
		}

		$.ajax({
			url: '/querytable',
			type: 'POST',
			dataType: 'json',
			data: {type:tableName}
		})
		.done(function(msg){
			if(msg.status){
				callback(msg.data);
			}else{
				console.log(tableName + "表查询失败");
			}
		})
	}

	//获取人员信息表
	getTableDate("users",function(data){
		users = data;
		rendSelect(data);
	})
	
	//获取项目信息表
	getTableDate("projects",function(data){
		projects = data;
	})

	//判断项目名是否已存在
	function isRepeat(name){
		for(var i=0;i<projects.length;i++){
			if(projects[i].name == name){
				return false;
			}
		}
		return true;
	}

	//渲染动态下拉组件
	function rendSelect(msg){
		for(var i=0;i<msg.length;i++){
			switch(msg[i].type){
				case "pd":
					dom_pd.append("<option value='"+msg[i].name+"'>"+msg[i].name+"</option>");
				break;
				case "id":
					dom_id.append("<option value='"+msg[i].name+"'>"+msg[i].name+"</option>");
				break;
				case "ui":
					dom_ui.append("<option value='"+msg[i].name+"'>"+msg[i].name+"</option>");
				break;
				case "fed":
					dom_fed.append("<option value='"+msg[i].name+"'>"+msg[i].name+"</option>");
				break;
			}
		}
	}

	//创建项目
	var createProject = function(){
		//项目重名验证
		dom_pn.on("focusout",function(){
			var value = $(this).val();
			if(!isRepeat(value)){
				$(this).val('');
				console.log('该项目已存在，请重新命名。');
			}
		})

		//提交验证
		dom_btn.on("click",function(){
			var pn_val = dom_pn.val();
			if(!pn_val){
				console.log("还没有填项目名");
				return;
			}
			var params = {
				pn:dom_pn.val(),
				pd:dom_pd.val(),
				id:dom_id.val(),
				ui:dom_ui.val(),
				fed:dom_fed.val()
			}
			$.ajax({
				url: '/createporject',
				type: 'POST',
				dataType: 'json',
				data: params
			})
			.done(function(msg) {
				if(msg['state']){
					console.log('项目创建成功！');
				}else{
					console.log('项目名称重复，请重新填写项目名称！');
				}
				//重置表单
				dom_pn.val("");
				$("select").each(function(){
					$(this).find("option").eq(0).attr("selected","selected");
				})
				//window.location.href = "./";
			})
			.fail(function() {
				console.log("error");
			})
		})
	}();


})