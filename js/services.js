/*!
 * Guang.scode.org.cn Services v1.0.0
 * https://scode.org.cn/
 *
 * Copyright 2019-2029
 * 
 * Date: 2019-01-12 00:00:00
 */

// 定义全局变量
var basepath = "http://guang.scode.org.cn/";
var serv_basepath = "http://x.scode.org.cn:81/";
// test server-----------------------
// basepath = "http://192.168.0.10/";
// serv_basepath = "http://192.168.0.10/scodelab/";
//-----------------------------------
// 定义AppCode
var base_app_code = "guang",base_app_change = false;
// 初始化页码
var page_no = 1,current_page_no = 0,loaded = true;
var wall_item_img_suffix = "_400x400.jpg";
var items_share_status = false;
// 页面执行全局变量
var param_gss,property_gss = "gss";
// 显示隐藏效果时间
var fade_time = 100;

// 页面数据初始化
$(function() {
	var protocol = window.location.protocol;
	if(protocol=="https:") {
		basepath = "https://guang.scode.org.cn/";
		serv_basepath = "https://x.scode.org.cn:444/";
	}
	// 获取全局执行变量
	param_gss = getQueryString(property_gss);
	// OLD兼容
	if(param_gss==undefined)
		param_gss = getQueryString("from");

	// 初始全局APP代码
	var tmp_app_code = getQueryString("app");
	if(tmp_app_code!=undefined && $.trim(tmp_app_code)!="" && tmp_app_code!=base_app_code) {
		base_app_code = tmp_app_code;
		base_app_change = true;
	}
	// 根据设备尺寸重设img后缀
	var win_width = $(window).width();
	if(win_width<=400)
		wall_item_img_suffix = "_200x200.jpg";
	else if(win_width<=500)
		wall_item_img_suffix = "_250x250.jpg";
	else if(win_width<=600)
		wall_item_img_suffix = "_300x300.jpg";
	else if(win_width<=700)
		wall_item_img_suffix = "_350x350.jpg";

	$("a[scl='guang']").each(function(){
		var tmp_href = $(this).attr("href");
		$(this).attr("href", guangUrl(tmp_href));
	});
	$("a[scl='x_scode']").each(function(){
		var tmp_href = $(this).attr("href");
		$(this).attr("href", serv_basepath + tmp_href);
	});

	$("#m_ui_mask").click(function() {
		resetBox();
	});
	$("#hd_search_link").click(function() {
		if($(this).attr("status")=="close") {
			resetBox();
			$(this).html("&#xe81b;");
			$("#hb_search_box").fadeIn(fade_time);
			$("#m_ui_mask").fadeIn(fade_time);
			$("#hb_search_text").focus();
			$(this).attr("status","open");
		} else if($(this).attr("status")=="open") {
			resetBox();
			$(this).attr("status","close");
		}
	});
	$("#hd_category_link").click(function() {
		if($(this).attr("show_box")!="1") {
			resetBox();
			$(this).attr("show_box","1");
			$("#hb_category_box").fadeIn(fade_time);
			$("#m_ui_mask").fadeIn(fade_time);
		} else if($(this).attr("show_box")=="1") {
			resetBox();
		}
	});
	$("#hb_search_form").submit(function() {
		var keyword = $.trim($("#hb_search_text").val());
		if(keyword=="")
			return false;
		$("#hb_search_q").val(encodeURIComponent(keyword));
		if(base_app_change)
			$("#hb_search_app").val(base_app_code);
		var action = guangUrl(); //+"?q="+encodeURI(keyword);
		$(this).attr("action",action);
		// 提交跳转后隐藏悬浮
		resetBox();
		return true;
	});
	$("#set_options_link").click(function() {
		if($(this).attr("status")=="hide") {
			$("div.item_open").fadeIn(fade_time);
			$(this).attr("status","show").html("&#xe80a;");
			items_share_status = true;
			setCookie("items_share_status","true");
		} else if($(this).attr("status")=="show") {
			$("div.item_open").fadeOut(fade_time);
			$(this).attr("status","hide").html("&#xe80b;");
			items_share_status = false;
			setCookie("items_share_status","false");
		}
	});
	// 获取cookie中记录的选项
	if(getCookie("items_share_status")=="true") {
		$("div.item_open").fadeIn(fade_time);
		$("#set_options_link").attr("status","show").html("&#xe80a;");
		items_share_status = true;
	}
	var pathname = window.location.pathname;
	// alert(pathname);
	if(pathname=="" || pathname=="/" || pathname=="/index.html") {
		// 首页加载菜单项目
		loadMenus();
		var load_index_status = false;
		if(param_gss=="article") {
			// 载入文章
			var article_id = getQueryString("id");
			loadArticle(article_id);
		} else {
			// 载入首页
			loadIndex();
			load_index_status = true;
		}
		// 滚动条加载商品数据
		$(window).scroll(function() {
			var window_top = $(window).scrollTop();
			// loadIndex after
			if(load_index_status) {
				var items_box = $("#product_walls");
				if(window_top>(items_box.offset().top+items_box.height()-1000) && loaded) {
					loadIndex();
				}
			}
			// 固定导航条
			var category_box = $("#category_box");
			if(window_top>45) {
				if(!category_box.hasClass("nav_fixed")) {
					category_box.addClass("nav_fixed");
				}
			} else {
				if(category_box.hasClass("nav_fixed")) {
					category_box.removeClass("nav_fixed");
				}
			}

		});
		//---------end--------
	}


});
// 关闭搜索、类目等弹出层，并且关闭遮罩层
function resetBox() {
	if($("#m_ui_mask").is(":hidden"))
		return;
	if(!$("#hb_search_box").is(":hidden")) {
		$("#hb_search_box").fadeOut(fade_time);
		$("#hd_search_link").html("&#xe834;");
	}
	if(!$("#hb_category_box").is(":hidden")) {
		$("#hb_category_box").fadeOut(fade_time);
		$("#hd_category_link").removeAttr("show_box");
	}
	$("#m_ui_mask").fadeOut(fade_time);
}
// 完善处理Guang.scode连接地址
function guangUrl(url) {
	if(url==undefined || $.trim(url)=="" || url=="null" || url=="undefined") {
		if(base_app_change)
			return basepath + "?app=" + base_app_code;
		else
			return basepath;
	} else {
		if(base_app_change)
			return basepath + changeURLArg(url,"app",base_app_code);
		else
			return basepath + url;
	}
}
// 完善处理x.scode连接地址
function serverUrl(url) {
	if(url==undefined || $.trim(url)=="" || url=="null" || url=="undefined") {
		return serv_basepath + "?app=" + base_app_code;
	} else {
		return serv_basepath + changeURLArg(url,"app",base_app_code);
	}
}
// Load-Menus
function loadMenus() {
	// 调用接口，获取菜单项
	$.ajax({
		url: serverUrl("guang/base/menuItems.html"),
		type: 'GET',
		dataType: "jsonp",
		success: function (data) {
			if(data!=undefined && data.menus!=undefined && data.menus.length>0) {
				var menu_html = "";
				for(var m=0;m<data.menus.length;m++) {
					var menu_item = data.menus[m];
					var mi_href = "?"+property_gss+"=material";
					if(menu_item.keyword!=undefined && $.trim(menu_item.keyword)!=""){
						mi_href = mi_href + "&q="+encodeURI(menu_item.keyword);
					}
					if(menu_item.categorys!=undefined && $.trim(menu_item.categorys)!=""){
						mi_href = mi_href + "&cate="+menu_item.categorys;
					}
					if(menu_item.materialId!=undefined && $.trim(menu_item.materialId)!=""){
						mi_href = mi_href + "&material_id="+menu_item.materialId;
					}
					if(menu_item.other!=undefined && $.trim(menu_item.other)!=""){
						mi_href = mi_href + menu_item.other;
					}
					var mi_icon_css = "";
					if(menu_item.code!=undefined && $.trim(menu_item.code)!=""){
						mi_icon_css = " class=\"ct-icon ct-i-"+menu_item.code+"\"";
					}
					menu_html = menu_html + "<li><a href=\""+guangUrl(encodeURI(mi_href))+"\"><i"+mi_icon_css+"></i>"+menu_item.title+"</a></li>";
				}
				$("#hb_menus_box").empty().append(menu_html);
			}
		}
	});
}
// index.html页面数据加载
function loadIndex() {
	if(page_no<=current_page_no)
		return;
	// 设置当前页码
	current_page_no = page_no;
	// 设置加载中
	loaded = false;
	$("#wall_loading").show();
	var load_url;
	if(param_gss!=undefined && param_gss!="") {
		if(param_gss=="search") {
			// 搜索载入
			var search_q = getQueryString("q");
			search_q = decodeURI(search_q);
			load_url = "guang/item/ajaxSearch.html?q="+ search_q +"&page="+page_no;
		} else if(param_gss=="material") {
			// 物料载入
			var search_q = getQueryString("q");
			search_q = decodeURI(search_q);
			var cate_param = "";
			var cate = getQueryString("cate");
			if(cate!=undefined)
				cate_param = "&cate="+cate;
			var material_param = "";
			var material_id = getQueryString("material_id");
			if(material_id!=undefined)
				material_param = "&material_id="+material_id;
			var sort_param = "";
			var sort = getQueryString("sort");
			if(sort!=undefined)
				sort_param = "&sort="+sort;
			
			load_url = "guang/item/ajaxMaterial.html?q="+ search_q + cate_param + material_param + sort_param +"&page="+page_no;
		}
	}
	if(load_url==undefined) {
		var categoryId = getQueryString("cate");
		load_url = "guang/item/ajaxItems.html?cate="+categoryId+"&page="+page_no;
	}
	$.ajax({
		url: serverUrl(load_url),
		type: 'GET',
		dataType: "jsonp",
		jsonpCallback: "showItems",
		success: function (data) {
			//console.info("success");
		}
	});
}

// 回调：显示Items
function showItems(data) {
	var current_category = data.currentCategory;
	if(current_category!=undefined) {
		$(document).attr("title", current_category + " - 逛街啦");
	}
	$("#wall_loading").hide();
	if(page_no==1) {
		$("#head_box").show();
	}
	var items = data.items;
	if(items!=undefined && items.length>0) {
		if(page_no==1) {
			$("#product_walls").show();
			$("#welcome_box").hide();
		}
		for(var i=0;i<items.length;i++) {
			var item = items[i];
			var item_id = item.numIid;
			if(item_id==undefined)
				item_id = item.itemId;
			var item_li = "<li class=\"wall_item\">"+"<a onclick=\"doBuy(this);\" itemId=\""+item_id+"\" data=\""+item.dataString+"\" >"
				+"<div class=\"item_img\">"+"<img src=\""+item.pictUrl + wall_item_img_suffix+"\" pic=\""+item.pictUrl+"\" alt=\""+item.title+"\" onload=\"imgLoaded(this)\" />"
				+"<div class=\"item_open font_icon\">&#xf09e;</div></div><div class=\"item_title\">"+item.title+"</div>"+"<div class=\"item_info\">"
				+"<span class=\"item_info_price\"><i>¥</i>"+item.finalPriceWap+"</span>"
				//+"<span class=\"item_info_delprice\">¥"+item.reservePrice+"</span>"
				+"<span class=\"item_info_likes\">"+item.volume+"</span>"
				//+"<span class=\"item_info_provcity\">"+item.provcity+"</span>"
				+"</div></a></li>";

			var pw_h_max = $("#product_walls").height();
			var pw_min;
			$("#product_walls").find("ul.wall_wrap").each(function() {
				if($(this).height()<=pw_h_max) {
					pw_h_max = $(this).height();
					pw_min = $(this);
				}
			});
			var wall_item = $(item_li)
			pw_min.append(wall_item);
			// 分享功能是否打开
			if(items_share_status) {
				wall_item.find(".item_open").show();
			}
			// 绑定事件-打开宝贝
			wall_item.find(".item_open").click(function(event) {
				// 阻止任何父类事件的执行
				event.stopPropagation();
				var link = $(this).parent().parent();
				openItem(link);
			});
		}
		// 全局页码翻页
		page_no = page_no + 1;
		loaded = true;
	} else if(page_no==1) {
		$("#warning_box").show();
	}
	if(current_page_no<=1) {
		// 显示类目列表
		$("#category_list").show();
		var categorys = data.categorys;
		if(categorys!=undefined) {
			for(var i=0;i<categorys.length;i++) {
				var category = categorys[i];

				var current_li = "";
				if(category.favoritesId == data.currentCategoryId) {
					current_li = " class=\"current\"";
				}

				var category_li = "<li"+current_li+"><a href=\""+guangUrl("?cate="+category.favoritesId)+ "\" >"+ category.favoritesTitle+"</a></li>";

				$("#category_list").append(category_li);
			}
		} else {
			if(current_category!=undefined) {
				var tmp_category = current_category;
				if(current_category.length>10)
					tmp_category = current_category.substring(0,10)+"...";
				var category_li = "<li class=\"query_title current\"><a>"+ tmp_category +"</a></li>";
				$("#category_list").append(category_li);
			}
		}
		if(data.from=="material") {
			var query = data.query;
			if(query!=undefined) {
				$(document).attr("title", query.keyword + " - 逛街啦");
				var sort_vol_up = "",sort_vol_down = "",sort_price_up = "",sort_price_down = "";
				var sort = query.sort;
				if(sort=="total_sales_asc") {
					sort_vol_up = "current"
				} else if(sort=="total_sales_des") {
					sort_vol_down = "current"
				} else if(sort=="price_asc") {
					sort_price_up = "current"
				} else if(sort=="price_des") {
					sort_price_down = "current"
				}

				var category_option;
				var title_li = "<li class=\"query_title current\"><a>"+ query.keyword +"</a></li>";
				category_option = "<li><a onclick=\"sortItems(this);\" sort=\"default\">综合排序</a></li>"
					+"<li><a onclick=\"sortItems(this);\" sort=\"total_sales\">销量<span class=\"sort_icon\"><i class=\"font_icon si_up "+sort_vol_up+"\">&#xe813;</i><i class=\"font_icon si_down "+sort_vol_down+"\">&#xe812;</i></span></a></li>"
					+"<li><a onclick=\"sortItems(this);\" sort=\"price\">价格<span class=\"sort_icon\"><i class=\"font_icon si_up "+sort_price_up+"\">&#xe813;</i><i class=\"font_icon si_down "+sort_price_down+"\">&#xe812;</i></span></a></li>";
				$("#category_list").append(title_li);
				$("#category_options").empty().append(category_option).show();
			}
		}
	}
	
}
// 图片加载完后调用
function imgLoaded(img) {
	$(img).parent().css("background-image","none");
}
// 排序跳转
function sortItems(a) {
	var link = $(a);
	var sort = link.attr("sort");
	if(sort=="default") {
		return changeParamReload("sort","");
	}
	if(link.find("i.si_up").hasClass("current")) {
		return changeParamReload("sort",sort+"_des");
	}
	if(link.find("i.si_down").hasClass("current")) {
		return changeParamReload("sort",sort+"_asc");
	}
	// Default sort
	var default_sort = "_des";
	if(sort=="price")
		default_sort = "_asc";
	changeParamReload("sort",sort+default_sort);
}
// 去购买（口令）
function doBuy(a) {
	// 变量定义
	var itemId,buyUrl,title,price,coupon,coupon_amount,userType;

	var item_data = $(a).attr("data");
	if(item_data!=undefined && item_data!="null" && $.trim(item_data)!="") {
		// 数据解包
		var jsonStr = new Base64().decode(item_data);
		var json = Json.parse(jsonStr);
		if(json!=undefined) {
			itemId = json.itemId;
			buyUrl = json.buyUrl;
			title = json.title;
			price = json.finalPrice;
			coupon = json.couponInfo;
			coupon_amount = json.couponAmount;
			userType = json.userType;
		}
	}
	var tpwd = $(a).attr("tpwd");
	var coupon_txt = "";
	var userType_txt = "购物";

	var price_name = "折扣价：";
	if(coupon!=undefined || coupon_amount!=undefined) {
		coupon_txt = "<span class=\"ti_coupon_tag r3\">";
		if(coupon_amount!=undefined)
			coupon_txt = coupon_txt + "<i>券</i>"+coupon_amount+"</span>";
		price_name = "券后价：";
	}

	if(userType==0) {
		//userType_txt = "购物";
	} else if(userType==1) {
		//userType_txt = "购物"; 
		//tmall&taobao
	}

	var tpwd_dialog = new dialogLayer();
	var tpwd_dgContent = tpwd_dialog.open("口令/二维码，快速淘好货！",260,330);
	var tpwd_html = "<div class=\"tao_pwd\">"
		+"<div class=\"tpwd_content\" clipboard=\"true\"><p class=\"ti_title\">"+title+"</p><p class=\"ti_price\">"+price_name
		+"<span class=\"tip_block\"><i>¥</i>"+price+"</span>"+coupon_txt+"</p><p style=\"color:#0099CC;\">口令：<span info=\"tpwd\">载入中...</span></p></div>"
		+"<div class=\"item_qrcode\" style=\"display:none;\"><img src=\"http://qr.liantu.com/api.php?bg=ffffff&el=l&w=200&m=5&text="+encodeURIComponent(buyUrl)
		+"\" style=\"width:160px;height:160px;\"/></div>"
		+"<div class=\"tpwd_info\">拷贝口令，打开"+userType_txt+"APP购买</div>"
		+"<div class=\"tpwd_links\">"
		+"<a class=\"tpwd_qrcode\">二维码</a>"
		+"<a class=\"tpwd_buylink\">一键拷贝</a>"
		+"<a class=\"tpwd_close\">~再逛逛~</a>"
		+"</div></div>";

	$(tpwd_dgContent).html(tpwd_html);

	if(tpwd!=undefined && $.trim(tpwd)!="" && $.trim(tpwd)!="undefined") {
		$(tpwd_dgContent).find("span[info='tpwd']").html(tpwd);
	} else {
		// 调用接口，获取口令
		$.ajax({
			url: serverUrl("guang/item/ajaxItemTpwd.html?id="+itemId+"&url="+encodeURIComponent(buyUrl)),
			type: 'GET',
			dataType: "jsonp",
			success: function (data) {
				$(tpwd_dgContent).find("span[info='tpwd']").html(data);
				$("a[itemId='"+itemId+"']").attr("tpwd",data);
			}
		});
	}

	$(tpwd_dialog.getDialog()).fadeIn(300);

	$(tpwd_dgContent).find(".tpwd_close").click(function() {
		tpwd_dialog.close();
	});
	$(tpwd_dgContent).find(".tpwd_qrcode").click(function() {
		var tmp_link = $(this);
		if(tmp_link.text()=="二维码") {
			$(tpwd_dgContent).find(".tpwd_content").hide();
			$(tpwd_dgContent).find(".tpwd_info").hide();
			$(tpwd_dgContent).find(".item_qrcode").show();
			tmp_link.text("口令");
		} else {
			$(tpwd_dgContent).find(".item_qrcode").hide();
			$(tpwd_dgContent).find(".tpwd_content").show();
			$(tpwd_dgContent).find(".tpwd_info").show();
			tmp_link.text("二维码");
		}
	});
	
	// PC端显示直达连接按钮
	if(current_browser=="PC" && current_browser_platform=="PC") {
		$(tpwd_dgContent).find(".tpwd_buylink").attr("href",buyUrl).attr("target","_blank").text("直达连接");
	} else {
		// 提示拷贝
		//$(tpwd_dgContent).find(".tpwd_buylink").click(function() {
		//	$(tpwd_dgContent).find(".tpwd_info").html("<span style=\"color:#FF6570;\">请复制口令</span>，打开"+userType_txt+"APP购买");
		//});
		// 一键拷贝
		var clipboard_buy = new ClipboardJS("a.tpwd_buylink", {
			text: function(content) {
				var tmp_content = $(tpwd_dgContent).find("span[info='tpwd']");
				return tmp_content.text();
			}
		});
		clipboard_buy.on("success", function(e) {
			// 拷贝成功
			$(tpwd_dgContent).find(".tpwd_info").html("<span style=\"color:#FF6570;\">口令已拷贝</span>，打开"+userType_txt+"APP购买");
			$(tpwd_dgContent).find(".tpwd_content").css("border", "1px dashed #66CC33").css("background-color", "#fcfffa");
		});
		clipboard_buy.on("error", function(e) {
			// 提示失败，手工拷贝
		});
	}
	// 设置窗口背景图片
	// var pic_url = $(a).find("img:first-child").attr("pic")+"_300x300.jpg";
	// $(tpwd_dgContent).css("background-image","url("+pic_url+")");
	// 点击内容一键拷贝
	var clipboard = new ClipboardJS("div[clipboard='true']", {
        text: function(content) {
            return $(content).text();
        }
    });
    clipboard.on("success", function(e) {
        // 拷贝成功
		$(tpwd_dgContent).find(".tpwd_info").html("<span style=\"color:#FF6570;\">口令已拷贝</span>，打开"+userType_txt+"APP购买");
		$(tpwd_dgContent).find(".tpwd_content").css("border", "1px dashed #66CC33").css("background-color", "#fcfffa");
    });
    clipboard.on("error", function(e) {
        // 提示失败，手工拷贝
    });
}
// 弹出详情内容窗口
function openItem(link) {
	var data = link.attr("data");
	window.open(guangUrl("item.html?d="+data));
}
// 载入文章内容
function loadArticle(id) {
	$("#wall_loading").show();
	$.ajax({
		url: serverUrl("article/ajax/"+id+".html"),
		type: 'GET',
		dataType: "jsonp",
		jsonpCallback: "showArticle",
		success: function (data) {
			//console.info("success");
		}
	});
}
// Article回调函数
function showArticle(data) {
	var article = data.article;
	if(article!=undefined) {
		// html - title
		$(document).attr("title",article.title + " - 文章 - 逛街啦");
		$("meta[name='keywords']").eq(0).attr("content",article.keywords);
		$("meta[name='description']").eq(0).attr("content",article.description);
		// 设置文章内容
		$("#article_title_h1").empty().html(article.title).parent().show();
		//$("#article_author").html(data.author);
		//$("#article_time").html(dateYmdhm(article.createTime));
		$("#article_content").empty().html(article.content).fadeIn(300);
		// 隐藏Welcome-box
		$("#welcome_box").hide();
		$("#wall_loading").hide();
	}

}
