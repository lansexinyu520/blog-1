/**
 * @author bh-lay
 */
/*
@demo
-----------------------------------------------------------------
login: 									|		exist
	$.ajax({                      |       	$.ajax({
		'type':'GET',              |       		'type':'GET',
		'url':'/ajax/login',       |       		'url':'/ajax/login',
		'data':{                   |       		'data':{
			'user' : '',            |       			'act' : 'exist',
			'password' : '' ;       |       		},
		},                         |       	});
	});									|
-----------------------------------------------------------------
*/
var session = require('../mod/session');
var querystring = require('querystring');
var mongo = require('../conf/mongo_connect');

var powerList = {
	'admin' : [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	'editor' : [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	'test' : [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
}

function login (res_this,session_this,username,password){
	var username = username,
		password = password;
	
	if(session_this.get('user_group') == 'guest'){
		
		mongo.start(function(method){
			
			method.open({'collection_name':'user'},function(err,collection){
			
				collection.find({'username':username,'password':password}).toArray(function(err, docs) {
					if(docs.length > 0){
						session_this.set({
							'user_group' : docs[0]['user_group'],
							'usernick' : docs[0]['usernick'],
							'power' : powerList[docs[0]['user_group']]
						});
						
						console.log('i\'m ',powerList[docs[0]['user_group']]);
						
						res_this.json({
							'code':1,
							'msg':'login success!'
						});
					}else{
						res_this.json({
							'code':2,
							'msg':'二货，帐号密码输错了吧！'
						});
					}
					method.close();
				});
			});
		});
	}else{
		res_this.json({
			'code':201,
			'msg':'二货，你已经登陆过喽，要退出吗!'
		});
	}
	
}
exports.render = function (req,res_this){

	var session_this = session.start(req,res_this);
	
	var search = req.url.split('?')[1]||'';
	var data = querystring.parse(search);
//exist
	if (data['act']=='exist'){
		session_this.set({
			'user_group' : 'guest',
			'power' : []
		});
		res_this.json({
			'code':1,
			'msg':'exist success !'
		});
	}else{
//login
		var username = data['username'];
		var password = data['password'];
		if(!username||!password){
			res_this.json({
				'code':2,
				'msg':'please input username and password !'
			});
		}else{
			login(res_this,session_this,username,password)
		}
	}
}