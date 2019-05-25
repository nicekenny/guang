/*!
 * Guang.scode.org.cn Item Function v1.0.0
 * https://guang.scode.org.cn/
 *
 * Copyright 2019-2029
 * 
 * Date: 2019-05-22 00:00:00
 */
// 定义全局变量
var item_img_suffix = "_800x800.jpg";
var global_item_id;

$(function() {
	// 根据设备尺寸重设img后缀
	var win_width = $(window).width();
	if(win_width<=400)
		item_img_suffix = "_400x400.jpg";
	else if(win_width<=500)
		item_img_suffix = "_500x500.jpg";
	else if(win_width<=600)
		item_img_suffix = "_600x600.jpg";

	var pathname = window.location.pathname;
	// alert(pathname);
	if(pathname=="/tpwd.html") {
		// 复制口令页面
		global_item_id = getQueryString("id");
		var tpwd = decodeURI(getQueryString("pwd"));
		var from = getQueryString("from");
		if(from=="item") {
			$("#tao_pwd_view").text("("+tpwd+")");
		}
	} else if(pathname=="/item.html") {
		// 获取宝贝数据包
		var data = getQueryString("d");
		if(data!=undefined && data!="null" && $.trim(data)!="") {
			// 数据解包
			var jsonStr = new Base64().decode(data);
			var json = Json.parse(jsonStr);
			if(json!=undefined) {
				// 全局变量：宝贝ID
				global_item_id = json.itemId;
				// 设置title
				$(document).attr("title", json.title + " - 逛街啦");

				var itemBlock_imgs = $("div.showcase");
				var pic_main = json.pictUrl + item_img_suffix;
				
				var pic_list = json.smallImages;
				var imgList_html = "",imgList_nav = "";
				if(pic_list!=undefined && pic_list.length>0) {
					for(var i=0;i<pic_list.length;i++) {
						var tmp_pic = pic_list[i] + item_img_suffix;
						imgList_html = imgList_html + "<div class=\"itbox\"><a class=\"item\"><img src=\""+tmp_pic+"\" onload=\"imgLoaded(this)\"/></a></div>";
						imgList_nav = imgList_nav + "<i></i>";
					}
				}

				var imgs_html = "<div class=\"scroller\">"+"<div class=\"itbox main\"><a class=\"item\"><img src=\""+pic_main+"\" onload=\"imgLoaded(this)\"/></a></div>"+imgList_html
					+"</div><div class=\"nav-container\"><i class=\"current\"></i>"+imgList_nav+"</div>";

				itemBlock_imgs.empty().append(imgs_html);
				// 添加图片滚动事件
				var scroller = itemBlock_imgs.find(".scroller"),s_nav = itemBlock_imgs.find(".nav-container");
				var scroller_dv = 0,tmp_scroller_x,tmp_start_x,swlen = scroller.find(".itbox").length;
				scroller.on('touchstart',function(e){
					var _touch = e.originalEvent.targetTouches[0];
					tmp_start_x= _touch.pageX;
				});
				scroller.on('touchmove',function(e){
					var _touch = e.originalEvent.targetTouches[0];
					var _x= _touch.pageX;
					tmp_scroller_x =  (_x - tmp_start_x);
					scroller.css("transform","translate3d("+ (scroller_dv + tmp_scroller_x) +"px, 0px, 0px)");
				});
				scroller.on('touchend',function(e){
					scroller_touchend();
				});
				var scroller_touchend = function() {
					var sw = scroller.width();
					var tmp_len = parseInt(scroller_dv/sw);
					if(tmp_scroller_x<-50)
						tmp_len--;
					if(tmp_scroller_x>50)
						tmp_len++;
					if(tmp_len>=1)
						tmp_len = 0;
					if(tmp_len+swlen<=0)
						tmp_len = -(swlen-1);
					scroller_dv = sw * tmp_len;
					scroller.css("transform","translate3d("+ scroller_dv +"px, 0px, 0px)");
					s_nav.find("i").removeClass("current");
					$(s_nav.find("i").get(Math.abs(tmp_len))).addClass("current");
				};

				//----------------------
				$("div.detail_title").html(json.title);
				var del_price = json.reservePrice;
				if(json.finalPrice<json.zkFinalPrice)
					del_price = json.zkFinalPrice;
				$("div.d_price").html("¥"+json.finalPrice+"<em>¥"+del_price+"</em>");
				if(json.couponAmount!=undefined) {
					$("div.d_coupon").html("<i>券</i>"+json.couponAmount);
				}
				$("div.di_likes").html(json.volume);
				
				// 分享文案
				var item_share_text = "【"+json.title+"】\r\n\r\n【自己买】¥"+del_price+"元\r\n【逛着买】¥"+json.finalPrice+"元\r\n------------～逛街啦～-----------\r\n";

				var buyUrl = encodeURIComponent(json.buyUrl);
				// 调用接口，获取口令
				$.ajax({
					url: serverUrl("guang/item/ajaxItemTpwd.html?id="+global_item_id+"&url="+buyUrl),
					type: 'GET',
					dataType: "jsonp",
					success: function (data) {
						$("#tao_pwd_view").text(data);
						var tpwd = data.replace(/￥/g,"");
						var doQrCodeUrl = guangUrl("tpwd.html?id="+global_item_id+"&pwd="+tpwd+"&from=item");
						var qr_code_url = "http://qr.topscan.com/api.php?bg=ffffff&el=l&w=100&m=5&text="+encodeURIComponent(doQrCodeUrl);
						$(".qr_code_img").attr("src",qr_code_url);
						$("#item_share_text").val(item_share_text+"复制本条("+tpwd+")去打开购物APP即可把我带回家。");
					}
				});
				
			}
		}
	}
	// 一键复制口令
	var clipboard = new ClipboardJS("#copy_tpwd_button", {
		text: function(content) {
			return $("#tao_pwd_view").text();
		}
	});
	clipboard.on("success", function(e) {
		// 拷贝成功
		if(!$(e.trigger).hasClass("green")) {
			$(e.trigger).addClass("green").append("(OK)");
		}
	});
	clipboard.on("error", function(e) {
		// 提示失败，手工拷贝
		$(e.trigger).append("(失败)");
	});
	// 一键复制分享文案
	var clipboard_share = new ClipboardJS("#copy_item_share_text_button", {
		text: function(content) {
			return $("#item_share_text").val();
		}
	});
	clipboard_share.on("success", function(e) {
		// 拷贝成功
		if(!$(e.trigger).hasClass("purple")) {
			if($(e.trigger).hasClass("blue"))
				$(e.trigger).removeClass("blue");
			$(e.trigger).addClass("purple").append("(OK)");
		}
	});
	clipboard_share.on("error", function(e) {
		// 提示失败，手工拷贝
		$(e.trigger).append("(失败)");
	});
	// 加载推荐宝贝(延时加载)
	setTimeout(function(){loadRecommends();},2000);
	// 滚动条加载商品数据
	$(window).scroll(function() {
		var items_box = $("#product_walls");
		var window_top = $(window).scrollTop();
		
		if(window_top>(items_box.offset().top+items_box.height()-1000) && loaded) {
			if(page_no==1)
				setTimeout(function(){loadRecommends();},2000);
			else
				loadRecommends();
		}

	});
	// 推荐结束-----------------------
	
});

// load 相关宝贝推荐
function loadRecommends() {
	if(page_no<=current_page_no)
		return;
	// 设置当前页码
	current_page_no = page_no;
	// 设置加载中
	loaded = false;
	$("#wall_loading").show();
	var load_url = "guang/item/ajaxRecommends.html?material_id=3756&item_id="+ global_item_id +"&page="+page_no;
	$.ajax({
		url: serverUrl(load_url),
		type: 'GET',
		dataType: "jsonp",
		jsonpCallback: "showItems",
		success: function (data) {
			//console.info("success");
			$("div.detail_recoms").show();
		},
		error:function() {
			//error
        }
	});
}