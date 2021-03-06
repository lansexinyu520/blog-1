/**
 * @author bh-lay
 */
var utils = require('../core/utils/index.js');
var mongo = require('../core/DB.js');
var showdown = require('../lib/showdown/showdown.js');

function list_page(app,param,callback){
  var method = mongo.start();
  var param = param || {};
  var skip = param.skip || 0;
  var limit = param.limit || 10;
	method.open({
    collection_name: 'opus'
  },function(err,collection){
    if(err){
      callback && callback(err);
      return
    }
    collection.count(function(err,count){
      collection.find({}, {
        limit:limit
      }).sort({
        id:-1
      }).skip(skip).toArray(function(err, docs) {
        method.close();
        for(var i = 0,total = docs.length;i<total;i++){
          docs[i]['work_range'] = docs[i]['work_range']?docs[i]['work_range'].split(/\,/):['暂未填写'];
          docs[i].cover = (docs[i].cover && docs[i].cover[0] == '/') ? app.config.frontEnd.img_domain + docs[i].cover : docs[i].cover;
        }
        callback && callback(null,docs,{
          count : count,
          skip : skip,
          limit : limit
        });
      });
    });
  });
}

function detail_page(id,callback){
	var method = mongo.start();
	method.open({
      collection_name: 'opus'
  },function(err,collection){
    if(err){
      callback && callback(err);
      return
    }
		collection.find({id:id}).toArray(function(err, docs) {
			method.close();
			if(docs.length==0){
				callback('哇塞，貌似这作品享不存在哦!');
			}else{
				var converter = new showdown.converter();
				docs[0].content = converter.makeHtml(docs[0].content);
				docs[0].opus_time_create = utils.parse.time(docs[0].opus_time_create ,'{y}-{m}-{d}');
				callback && callback(null,docs[0]);
			}
		});
	});
}

exports.list = function(connect,app){
  var data = connect.url.search;
  var page = data.page || 1;
  
  app.cache.use('opus_list_' + page,['html'],function(this_cache){
    connect.write('html',200,this_cache);
  },function(save_cache){
    list_page(app,{
      skip: (page-1) * 10,
      limit: 10
    },function(err,list,data){
      if(err){
        app.views('system/mongoFail',{},function(err,html){
          connect.write('html',500,html);
        })
        return;
      }
      
      var page_html = app.utils.pagination({
          list_count : data.count,
          page_list_num: data.limit,
          page_cur: page,
          max_page_btn: 10,
          base_url : '/opus?page={num}'
      });
      //获取视图
      app.views('opusList',{
          title : '作品_小剧客栈',
          keywords : '作品,PS,剧中人,小剧客栈,前端工程师,设计师,nodeJS',
          description : '设计曾经是剧中人的一份职业，现在最大的兴趣爱好之一，这里有小剧最得意的作品，也有小剧倒腾的摄影图片，虽难等大雅之堂，却也能给自己一份小满足！',
          list : list,
          pagination : page_html
      },function(err,html){
          save_cache(html);
      });
    });
  });
};

exports.detail = function(connect,app,id){
  app.cache.use('opus_id_' + id,['html'],function(this_cache){
    connect.write('html',200,this_cache);
  },function(save_cache){
    detail_page(id,function(err,data){
      if(err){
        app.views('system/mongoFail',{},function(err,html){
          connect.write('html',500,html);
        })
        return;
      }
      //获取视图
      app.views('opusDetail',{
        title : data.title + '_小剧客栈',
        keywords : data.tags,
        description : data.intro,
        content : data.content,
        opus_pic : data.opus_pic,
        cover : (data.cover && data.cover[0] == '/') ? app.config.frontEnd.img_domain + data.cover : data.cover,
        opus_time_create : data.opus_time_create
      },function(err,html){
          save_cache(html);
      });
    });
  });
}