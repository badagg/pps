var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var mysql = require('mysql');
var process = require('child_process');
var filepath = '/Users/zkey/pps/';
var tabnames = ["pd","id","ui","fed"];
var connection = null;

//遍历文件夹
function walk(res,path,callback){
	fs.stat(path,function(err,stats){
		if(err){
			res.render('error');
			return false;
		}
		if(stats.isDirectory()){
			var paths = fs.readdirSync(path);
			var files = [];
			paths.forEach(function(dir){
				files.push(dir);
			})
			var nid = files.indexOf(".DS_Store");
			if(nid != -1){
				files.splice(nid,1);
			}
			var sid = files.indexOf(".svn");
			if(sid != -1){
				files.splice(sid,1);
			}
			callback(files);
		}
	})
}

//打开数据库
function openMysql(){
	connection = mysql.createConnection({
		host     : 'localhost',
		user     : 'root',
		password : 'root',
		port     : '8889',
		database : 'pps'
	});
}

//操作数据库--保存项目名称等
function saveProject(data){
	openMysql();

	connection.connect(function(err){
		if(err){
			console.log("数据库连接错误！");
			return;
		}
	});

	var $sql = 'INSERT INTO project SET ?';
	connection.query($sql,data, function(err, rows, fields) {
		//console.log(rows);
	});
	 
	connection.end();
}

//Commit文件夹到SVN
function commitSvn(res,fileName){
	//首先提交fileName目录然后进入fileName再提交fed目录
	var cmdadd = "cd "+filepath+" && svn add " + fileName + " --depth=empty && cd "+ fileName + " && svn add fed";
	var cmdcmt = "cd "+filepath+" && svn commit -m 'add "+fileName+"' ";
	process.exec(cmdadd,function(error,stdout,stderr){
		if(error) {
			res.send(error);
			return;
		}else{
			process.exec(cmdcmt,function(err,stdout,stderr){
				if(error) {
					res.send(error);
					return;
				}
				//res.json({state:1});
				res.end("success");
			})
		}
		//res.json({state:1});
		res.end("success");
	})
}

// 创建所有目录
function mackdir(_path,_name,callback){
	var newPath = _path+_name;
	if(!fs.existsSync(newPath)){
		fs.mkdir(newPath,function(err){
			if (err) return console.error(err);
			for(var i=0;i<tabnames.length;i++){
				fs.mkdir(newPath+"/"+tabnames[i]);
			}
		});
		callback(true);
	}else{
		callback(false);
	}
}

//路由控制 ---------------------------------

//首页
router.get('/', function(req, res, next) {
	res.render('index');
});

//项目列表页
router.get('/all', function(req, res, next) {
  	walk(res,filepath,function(data){
		//过滤文件 只存文件夹
		var arr = [];
		for(var i=0;i<data.length;i++){
			if(data[i].indexOf(".") == -1){
				arr.push(data[i]);
			}
		}
		res.render('all', {files:arr});
	});
});

//项目详情
router.get('/project/*', function (req, res) {
	var id = req.params[0];
	var url = filepath + id;
	var isMulti = id.indexOf("/") != -1 ? false : true; //判断是否是第一层级路由 如果是 则显示文件列表
	var pn = id.indexOf("/") != -1 ? id.split("/")[0] : id;
	
	var origin = req.headers.host;
	var json = {
		projectName:pn,
		projectPath:id,
		tabs:tabnames,
		filenames:'',
		isMulti:isMulti,
		origin:origin,
		host:origin.split(":")[0]
	}
	//请求数据库 查询该项目req.headers.host相关信息
	openMysql();
	var $sql = "select * from project where name='"+pn+"'";
	connection.query($sql,function(err, rows, fields) {
		if(err){
			res.json({"status":0});
			return;
		}
		json.involved = rows;
		walk(res,url,function(names){
			json.filenames = names;
			res.render('show', {data:json});
		});
	});
	connection.end();
});

//创建项目
router.get('/create', function(req, res, next) {
	res.render('create');
});

//添加项目 AJAX调用
router.post('/createporject',function(req, res) {
	var fileName = req.body["pn"];
	var json = {
		name:fileName,
		pd:req.body['pd'],
		uid:req.body['id'],
		ui:req.body['ui'],
		fed:req.body['fed'],
		time:new Date().toLocaleString()
	}
	mackdir(filepath,fileName,function(flag){
		if(flag){
			//返回状态 1 写入成功
			res.json({state:1});
			//保存项目信息
			saveProject(json);
			//Commit文件夹到SVN
			commitSvn(res,fileName);
		}else{
			//返回状态 0 写入失败 项目重名
			res.json({state:0});
		}
	});
	//res.end("success");
});

//查询数据库表 AJAX调用
router.post('/querytable',function(req, res) {
	var param = req.body;
	//查询users表
	if(param['type'] == "users"){
		openMysql();
		//如果连接失败返回status为0 否者返回status为1 且返回数据
		var $sql = 'select * from users';
		connection.query($sql,function(err, rows, fields) {
			if(err){
				res.json({"status":0});
				return;
			}
			res.json({"status":1,"data":rows});
		});
	}
	//查询project表
	if(param['type'] == "projects"){
		openMysql();
		var $sql = 'select name from project';
		connection.query($sql,function(err, rows, fields) {
			if(err){
				res.json({"status":0});
				return;
			}
			res.json({"status":1,"data":rows});
		});
	}

	connection.end();
});

//updata svn
router.get('/updatasvn', function(req, res, next) {
	var cmdSvnup = "cd "+filepath+" && svn up";
	process.exec(cmdSvnup,function(error,stdout,stderr){
		if(error) {
			res.json({"status":0})
			return;
		}
		res.json({"status":1,msg:stdout})
	})
	
});


module.exports = router;
