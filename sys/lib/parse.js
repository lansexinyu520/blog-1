/**
 * @author bh-lay
 */
var querystring = require('querystring');
var formidable = require('formidable');


exports.cookie = function parseCookie(str){
	var str = str ||'';
	var cookieData = {};
	
	var list = str.split(';');
	
	for(var i = 0 , total = list.length ; i < total ; i++){
		var parseList = list[i].split('=');
		var nameStr = parseList[0]||'';
		var name = nameStr.replace(/^\s+|\s+$/g,'');
		var value = parseList[1]||'';
		
		cookieData[name] = value;
	}
	return cookieData;
}

/**
 * @param (timestamp,'{y}-{m}-{d} {h}:{m}:{s}')
 * 
 * y:year
 * m:months
 * d:date
 * h:hour
 * i:minutes
 * s:second
 * a:day
 */
exports.time = function(timestamp,format){
	if(arguments.length==0){
		return null;
	}
	var date = new Date(parseInt(timestamp));
	var format = format ||'{y}-{m}-{d} {h}:{m}:{s}';
	
	var formatObj = {
		y : date.getYear()+1900,
		m : date.getMonth()+1,
		d : date.getDate(),
		h : date.getHours(),
		i : date.getMinutes(),
		s : date.getSeconds(),
		a : date.getDay(),
	};
	
	format = format.replace(/{(y|m|d|h|i|s|a)}/g,function(){
		return formatObj[arguments[0]]||arguments[0];
	});
	return format;
}

//
exports.createID = function(){
	var date = new Date();
	var id = date.getTime().toString(16);
	return id;
}

/**
 * parse request data
 * callBack(err, fields, files);
 */
exports.request = function(req,callBack){
	if(!callBack){
		return 
	}

	var method = req['method']||'';
	
	if(method == 'POST' || method =='post'){
		var form = new formidable.IncomingForm();
		form.uploadDir = "./temporary";
		//form.keepExtensions = true;
		
		form.parse(req, function(error, fields, files) {
			// @FIXME when i upload more than one file ,the arguments files is only single file
			// but i can get all files information form form.openedFiles
			// it confused me
			//console.log(1234,arguments);
			
			files = form.openedFiles;
			
			callBack(error,fields, files);
		
		});
	}else{
		var fields = querystring.parse(req.url.split('?')[1]);
		callBack(null,fields,[]);
	}
}