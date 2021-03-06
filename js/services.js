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
var android_app_apk = "app/guang_stable.apk";
// 显示隐藏效果时间
var fade_time = 200;
// 页面上下文数据{client:"wxapp"}
var pageContext = {appCode:"guang",client:"",gss:"category"};

// 页面数据初始化
$(function() {
	var protocol = window.location.protocol;
	if(protocol=="https:") {
		basepath = "https://guang.scode.org.cn/";
		serv_basepath = "https://x.scode.org.cn:444/";
	}

	// 初始地址栏参数
	var tmp_app_code = getQueryString("app");
	if(tmp_app_code!=undefined && $.trim(tmp_app_code)!="" && tmp_app_code!=pageContext.appCode) {
		pageContext.appCode = tmp_app_code;
	}
	var tmp_client = getQueryString("client");
	if(tmp_client!=undefined && $.trim(tmp_client)!="" && tmp_client!=pageContext.client) {
		pageContext.client = tmp_client;
	}
	var tmp_gss = getQueryString("gss");
	if(tmp_gss!=undefined && $.trim(tmp_gss)!="" && tmp_gss!=pageContext.gss) {
		pageContext.gss = tmp_gss;
	}
	pageContext.id = getQueryString("id");
	pageContext.title = getQueryString("q");
	pageContext.sort = getQueryString("sort");
	pageContext.pageNo = getQueryString("page");
	// 输出页面上下文信息
	// console.log("pageContext",pageContext);

	$("a[scl='guang']").each(function(){
		var tmp_href = $(this).attr("href");
		var guang_href = guangUrl(tmp_href);
		var app_code = $(this).attr("app");
		if(app_code!=undefined && $.trim(app_code).length>0) {
			guang_href = changeURLArg(guang_href,"app",app_code);
		}
		$(this).attr("href", guang_href);
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
			$(this).removeClass("hd_search_link").addClass("hd_search_close");
			$("#hb_search_box").fadeIn(fade_time,function(){
				$("#m_ui_mask").show();
				$("#hb_search_text").focus();
				// $("#hb_search_text").select();
			});
			$(this).attr("status","open");
		} else if($(this).attr("status")=="open") {
			resetBox();
		}
	});
	$("#hd_category_link").click(function() {
		if($(this).attr("show_box")!="1") {
			resetBox();
			$(this).attr("show_box","1");
			$("#hb_category_box").fadeIn(fade_time,function(){
				$("#m_ui_mask").show();
			});
		} else if($(this).attr("show_box")=="1") {
			resetBox();
		}
	});
	$("#hb_search_form").submit(function() {
		var keyword = $.trim($("#hb_search_text").val());
		if(keyword=="")
			return false;
		$("#hb_search_q").val(encodeURIComponent(keyword));
		$("#hb_search_app").val(pageContext.appCode);
		$(this).attr("action", guangUrl());
		// 处理所选平台数据
		var platforms = $("#hb_search_platforms").val();
		if(platforms!=undefined && platforms.indexOf(",")==0) {
			platforms = platforms.substring(1);
			$("#hb_search_platforms").val(platforms);
		}
		// 提交跳转后隐藏悬浮
		resetBox();
		return doSearch();
	});
	$("#set_options_link").click(function() {
		if($(this).attr("status")=="hide") {
			$("div.item_open").fadeIn(fade_time);
			$(this).attr("status","show").removeClass("options_eye_hide").addClass("options_eye_show");
			pageContext.isShared = true;
			setCookie("items_share_status","true");
		} else if($(this).attr("status")=="show") {
			$("div.item_open").fadeOut(fade_time);
			$(this).attr("status","hide").removeClass("options_eye_show").addClass("options_eye_hide");
			pageContext.isShared = false;
			setCookie("items_share_status","false");
		}
	});
	// 获取cookie中记录的选项
	if(getCookie("items_share_status")=="true") {
		$("div.item_open").fadeIn(fade_time);
		$("#set_options_link").attr("status","show").removeClass("options_eye_hide").addClass("options_eye_show");
		pageContext.isShared = true;
	}
	// 地点选择
	$("#hd_data_switch_link").click(function() {
		if($(this).attr("status")=="close") {
			resetBox();
			$(this).css("color","#FF6570");
			$("#hb_data_switch_box").fadeIn(fade_time);
			$(this).attr("status","open");
		} else if($(this).attr("status")=="open") {
			resetBox();
		}
	});
	var pathname = window.location.pathname;
	if(pathname=="" || pathname=="/" || pathname=="/index.html") {
		// 首页加载菜单项目
		loadMenus();
		if(pageContext.gss=="article") {
			// 载入文章
			var article_id = getQueryString("id");
			loadArticle(article_id);
		} else {
			// 载入首页
			loadIndex();
		}
		// 滚动条加载商品数据
		var items_box = $("#product_walls");
		$(window).scroll(function() {
			var scroll_top = $(window).scrollTop();
			// loadIndex after
			if(scroll_top>(items_box.offset().top+items_box.height()-1500) && pageContext.isLoaded) {
				doLoadIndex();
			}
			// 固定导航条
			var category_box = $("#category_box");
			var hb_category_box = $("#hb_category_box");
			var hb_search_box = $("#hb_search_box");
			if(scroll_top>45) {
				if(!category_box.hasClass("nav_fixed")) {
					category_box.addClass("nav_fixed");
				}
				if(!hb_category_box.hasClass("hb_box_fixed")) {
					hb_category_box.addClass("hb_box_fixed");
				}
				if(!hb_search_box.hasClass("hb_box_fixed")) {
					hb_search_box.addClass("hb_box_fixed");
				}
			} else {
				if(category_box.hasClass("nav_fixed")) {
					category_box.removeClass("nav_fixed");
				}
				if(hb_category_box.hasClass("hb_box_fixed")) {
					hb_category_box.removeClass("hb_box_fixed");
				}
				if(hb_search_box.hasClass("hb_box_fixed")) {
					hb_search_box.removeClass("hb_box_fixed");
				}
			}
		});
		//---------end--------
		// 下拉加载
		if($(window).scrollTop()==0) {
			var tmp_scroller_y = 0,tmp_start_y = 0;
			items_box.on('touchstart',function(e){
				var _touch = e.originalEvent.targetTouches[0];
				tmp_start_y= _touch.pageY;
			});
			items_box.on('touchmove',function(e){
				var _touch = e.originalEvent.targetTouches[0];
				var _y= _touch.pageY;
				tmp_scroller_y =  (_y - tmp_start_y);
			});
			items_box.on('touchend',function(e){
				if(tmp_scroller_y>200) {
					tmp_scroller_y = 0;
					// 重载数据
					reloadIndex();
				}
			});
		}
		// 搜索多平台选择
		$(".platform_item").click(function() {
			var platforms = $("#hb_search_platforms").val();
			if(platforms==undefined)
				platforms = "";
			var tag = $(this).attr("tag");
			if($(this).hasClass("selected")) {
				$(this).removeClass("selected");
				if(platforms.indexOf(tag)!=-1 || platforms.indexOf(","+tag)!=-1) {
					var replace_text = ","+tag;
					if(platforms.indexOf(","+tag)==-1)
						replace_text = tag;
					var replace_reg = new RegExp(replace_text, "gm");
					platforms = platforms.replace(replace_reg, "");
				}
			} else {
				$(this).addClass("selected");
				if(platforms.indexOf(tag)==-1) {
					platforms = platforms+","+tag;
				}
			}
			$("#hb_search_platforms").val(platforms);
			// console.info("hb_search_platforms:"+platforms);
		});
		$(".hb_search_arrow .arrow_up").click(function() {
			$(this).hide();
			$(".hb_search_platform").fadeOut(fade_time);
			$(".hb_search_arrow .arrow_down").show();
		});
		$(".hb_search_arrow .arrow_down").click(function() {
			$(this).hide();
			$(".hb_search_platform").fadeIn(fade_time);
			$(".hb_search_arrow .arrow_up").show();
		});
	}
	//============加载结束=============
	// Android-------------
	if(typeof(android)!="undefined") {
		var android_data = android.getData();
		// console.info("ANDROID-DATA:"+android_data);
		var android_jsonData = JSON.parse(android_data);
		if(android_jsonData.item_share=="close") {
			$("#set_options_link").hide();
			pageContext.isShared = false;
		}
	} else {
		// 非android客户端，提示下载APP
		if(getCookie("app_download_status")!="NO") {
			// setTimeout(function(){openDownloadApp();},5000);
		}
	}
	// Android-------------
	// 全局点击事件
	$(document).click(function(e) {
		// 点击页面其他区域关闭悬浮窗口
		if($(e.target).parents("#head_box").length>0)
			return;
		if($(e.target).parents(".dialogLayer").length>0)
			return;
		if($(e.target).parents(".fixed_box").length>0)
			return;
		// 重置弹窗(关闭所有弹窗和遮罩)
		resetBox();
	});
});
// 顶部加载box
function topLoading(bool) {
	var top_load_box = $("#top_loading");
	if(bool) {
		if(top_load_box.is(":hidden")) {
			top_load_box.fadeIn(fade_time);
		}
	} else {
		if(!top_load_box.is(":hidden")) {
			top_load_box.fadeOut(fade_time);
		}
	}
}
// 关闭搜索、类目等弹出层，并且关闭遮罩层
function resetBox() {
	if(!$("#hb_data_switch_box").is(":hidden")) {
		$("#hb_data_switch_box").fadeOut(fade_time);
		$("#hd_data_switch_link").css("color","");
		$("#hd_data_switch_link").attr("status","close");
	}
	// 带遮罩层的box，如果遮罩层不显示则默认没有box是显示状态
	if($("#m_ui_mask").is(":hidden"))
		return;
	if(!$("#hb_search_box").is(":hidden")) {
		$("#hb_search_box").fadeOut(fade_time);
		$("#hd_search_link").removeClass("hd_search_close").addClass("hd_search_link");
		$("#hd_search_link").attr("status","close");
	}
	if(!$("#hb_category_box").is(":hidden")) {
		$("#hb_category_box").fadeOut(fade_time);
		$("#hd_category_link").removeAttr("show_box");
	}
	$("#m_ui_mask").hide();
}
// 完善处理Guang.scode连接地址
function guangUrl(url) {
	if(url==undefined || $.trim(url)=="" || url=="null" || url=="undefined") {
		return basepath + "?app=" + pageContext.appCode;
	} else {
		return basepath + changeURLArg(url,"app",pageContext.appCode);
	}
}
// 完善处理x.scode连接地址
function serverUrl(url) {
	var serviceUrl = serv_basepath;
	if(url==undefined || $.trim(url)=="" || url=="null" || url=="undefined") {
		serviceUrl = serviceUrl + "?app=" + pageContext.appCode;
	} else {
		serviceUrl = serviceUrl + changeURLArg(url,"app",pageContext.appCode);
	}
	if(pageContext.client!=undefined && $.trim(pageContext.client).length>0 && getUrlParam(serviceUrl,"client")==undefined) {
		serviceUrl = changeURLArg(serviceUrl,"client",pageContext.client);
	}
	return serviceUrl;
}
// Load-Menus
function loadMenus() {
	// 调用接口，获取菜单项
	$.ajax({
		url: serverUrl("guang/base/menus.html"),
		type: 'GET',
		dataType: "jsonp",
		success: function (data) {
			if(data!=undefined) {
				// 菜单项
				if(data.menus!=undefined && data.menus.length>0) {
					var menu_html = "";
					for(var m=0;m<data.menus.length;m++) {
						var menu_item = data.menus[m];
						var mi_href = "?gss=menu&id="+menu_item.id;
						var mi_icon_css = "";
						if(menu_item.code!=undefined && $.trim(menu_item.code)!=""){
							mi_icon_css = " class=\"ct-icon ct-i-"+menu_item.code+"\"";
						}
						menu_html = menu_html + "<li><a link=\""+guangUrl(encodeURI(mi_href))+"\" onclick=\"menuClick(this);\"><i"+mi_icon_css+"></i>"+menu_item.title+"</a></li>";
					}
					$("#hb_menus_box").empty().append(menu_html);
				}
				// 站点项
				if(data.sites!=undefined && data.sites.length>0) {
					var site_html = "";
					for(var s=0;s<data.sites.length;s++) {
						var site_item = data.sites[s];
						site_html = site_html + "<div class=\"hb_data_item\"><a href=\""+site_item.url+"\">"+site_item.name+"</a></div>";
					}
					$("#hb_data_switch_box").empty().append(site_html);
				}
			}
		}
	});
}
// 菜单链接点击事件
function menuClick(a) {
	// 关闭悬浮层
	resetBox();
	var url = $(a).attr("link");
	// console.info("Menu:"+url);
	// 获取参数
	pageContext.id = getUrlParam(url,"id");
	pageContext.gss = getUrlParam(url,"gss");
	pageContext.category = undefined;
	pageContext.sort = undefined;
	// 初始页码
	pageContext.pageNo = 1;
	pageContext.currentPageNo = 0;
	pageContext.isLoaded = true;
	pageContext.isReload = false;
	// 执行载入
	doLoadIndex();
}
function doCategory(a) {
	var a_left = $(a).offset().left;
	var cates_left = $("#category_list").scrollLeft();
	var cates_width = $("#category_list").width();
	var a_margin = 100; // $(window).width()/3;
	if(a_left<a_margin) {
		var tmp_cates_left = cates_left - (a_margin-a_left);
		if(tmp_cates_left<0)
			tmp_cates_left = 0;
		$("#category_list").scrollLeft(tmp_cates_left);
	} else if(a_left>(cates_width-a_margin)) {
		var tmp_cates_left = cates_left + (a_margin);
		if(tmp_cates_left<0)
			tmp_cates_left = 0;
		$("#category_list").scrollLeft(tmp_cates_left);
	}
	var url = $(a).attr("link");
	// 获取参数
	pageContext.id = getUrlParam(url,"id");
	var url_gss = getUrlParam(url,"gss");
	if(url_gss!=undefined)
		pageContext.gss = url_gss;
	// 初始页码
	pageContext.pageNo = 1;
	pageContext.currentPageNo = 0;
	pageContext.isLoaded = true;
	pageContext.isReload = false;
	// 执行载入
	doLoadIndex();
}
function doSearch() {
	var keyword = $("#hb_search_q").val();
	var platforms = $("#hb_search_platforms").val();
	// 获取参数
	pageContext.title = keyword;
	pageContext.platforms = platforms;
	pageContext.sort = undefined;
	pageContext.gss = "search";
	// 初始页码
	pageContext.pageNo = 1;
	pageContext.currentPageNo = 0;
	pageContext.isLoaded = true;
	pageContext.isReload = false;
	// 执行载入
	doLoadIndex();
	return false;
}
// 排序跳转
function sortItems(a) {
	var link = $(a);
	var sort = link.attr("sort");
	if(sort=="default") {
		pageContext.sort = undefined;
	} else if(link.find("i.si_up").hasClass("current")) {
		pageContext.sort = sort + "_des";
	} else if(link.find("i.si_down").hasClass("current")) {
		pageContext.sort = sort + "_asc";
	} else {
		// Default sort
		var default_sort = "_des";
		if(sort=="price")
			default_sort = "_asc";
		pageContext.sort = sort + default_sort;
	}
	// 初始页码
	pageContext.pageNo = 1;
	pageContext.currentPageNo = 0;
	// 执行载入
	doLoadIndex();
}
// index.html重新加载数据
function reloadIndex() {
	if(pageContext.isReload)
		return false;
	if($(window).scrollTop()!=0)
		return false;
	topLoading(true);
	// 等待5秒后关闭加载
	setTimeout(function(){
		topLoading(false);
		pageContext.isReload = false;
	},5000);
	// 重置全局变量，加载数据
	pageContext.pageNo = 1;
	pageContext.currentPageNo = 0;
	pageContext.isReload = true;
	doLoadIndex();
	return true;
}
// index.html页面数据加载
function loadIndex() {
	// default
	pageContext.isLoaded = true;
	pageContext.isReload = false;

	if(pageContext.pageNo==undefined || pageContext.pageNo<1) {
		pageContext.pageNo = 1;
		pageContext.currentPageNo = 0;
	}
	// 执行载入
	doLoadIndex();
}
function doLoadIndex() {
	if(!pageContext.isLoaded)
		return;
	if(pageContext.pageNo<=pageContext.currentPageNo)
		return;
	// 设置加载中
	pageContext.isLoaded = false;
	if(pageContext.isReload) {
		// 页面内容重新载入
	} else {
		if(pageContext.pageNo==1) {
			$("body").css("background-color","#FFFFFF");
			$("#welcome_box").show();
			$("#warning_box").hide();
			$("#product_walls").hide();
			$("#product_walls .wall_wrap").empty();
			$("#category_box").hide();
			$("#category_list").empty();
			// 回到顶部
			$(window).scrollTop(0);
		}
		$("#wall_loading").show();
		$("#wall_loading_page").html(pageContext.currentPageNo);
		$("#article_content").hide();
	}
	var load_url = "guang/item/data.html";
	load_url = changeURLArg(load_url,"id",pageContext.id);
	load_url = changeURLArg(load_url,"platforms",pageContext.platforms);
	var search_q = pageContext.title==undefined?"":decodeURI(pageContext.title);
	load_url = changeURLArg(load_url,"q",search_q);
	load_url = changeURLArg(load_url,"sort",pageContext.sort);
	load_url = changeURLArg(load_url,"gss",pageContext.gss);
	load_url = changeURLArg(load_url,"page",pageContext.pageNo);

	pageContext.serviceUrl = load_url;
	// debug...
	// console.info("LOAD-URL:"+load_url);
	// debug...
	// console.info("CONTEXT:"+JSON.stringify(pageContext));
	$.ajax({
		url: serverUrl(load_url),
		type: 'GET',
		dataType: "jsonp",
		jsonpCallback: "showItems",
		success: function (data) {
			//console.info("success");
		}
	});
	// 设置超时后执行刷新
	setTimeout(function(){
		var last_service_url = load_url;
		// debug...
		// console.info("LOAD-TIMEOUT:"+JSON.stringify(pageContext));
		// 如果已经加载完，不执行超时
		if(pageContext.isLoaded)
			return;
		else if(last_service_url!=pageContext.serviceUrl)
			return;
		var timeout_refresh_count = 0;
		var query_refresh = getQueryString("refresh");
		if(query_refresh!=undefined && $.trim(query_refresh).length>0) {
			timeout_refresh_count = parseInt(query_refresh);
		}
		// 尝试3次刷新后报无数据
		if(timeout_refresh_count>=3) {
			$("#wall_loading").hide();
			$("#welcome_box").hide();
			$("#warning_box").show();
			return;
		}
		var param_id = pageContext.id;
		var param_q = pageContext.title;
		var param_sort = pageContext.sort;
		var param_page = pageContext.pageNo;
		var url_params = "";
		if(param_id!=undefined && param_id>0)
			url_params = url_params+"&id="+param_id;
		if(param_q!=undefined && $.trim(param_q).length>0)
			url_params = url_params+"&q="+encodeURI(param_q);
		if(param_sort!=undefined && $.trim(param_sort).length>0)
			url_params = url_params+"&sort="+param_sort;
		if(param_page!=undefined && param_page>0)
			url_params = url_params+"&page="+param_page;
		url_params = url_params+"&refresh="+(timeout_refresh_count+1);

		var refresh_timeout_url = "?gss="+pageContext.gss+url_params;

		// console.info("REFRESH-TIMEOUT-URL:"+guangUrl(refresh_timeout_url));
		// window.location.href = guangUrl(refresh_timeout_url);
		openWindow(guangUrl(refresh_timeout_url));
	}, 1000*10);// 等待加载5秒后执行超时方法
}

// 回调：显示Items
function showItems(data) {
	if(data==undefined)
		return;
	var data_page_no = 0;
	if(data.query!=undefined && data.query.pageNumber!=undefined)
		data_page_no = data.query.pageNumber;
	pageContext.currentPageNo = data_page_no;
	if(data.title!=undefined) {
		$(document).attr("title", data.title + " - 逛街啦");
	}
	topLoading(false);
	if(!$("#wall_loading").is(":hidden"))
		$("#wall_loading").fadeOut(fade_time);
	if(data_page_no==1) {
		if(!pageContext.isReload)
			$("#head_box").show();
	}
	var items = data.items;
	if(items!=undefined && items.length>0) {
		if(data_page_no==1) {
			if(!pageContext.isReload) {
				$("#product_walls").show();
				$("#welcome_box").hide();
				$("#warning_box").hide();
				if(data.from!="recommend")
					$("body").css("background-color","#EFEFEF");
			} else {
				$("#product_walls .wall_wrap").empty();
			}
		}
		for(var i=0;i<items.length;i++) {
			var item = items[i];
			var item_id = item.numId;
			var item_platform = item.platform;
			var item_title = item.title;
			var item_price = item.price;
			var item_volume = item.volume==undefined?0:item.volume;
			var item_dataStr = item.dataString;
			var item_minPrice = item.minPrice;
			var item_maxPrice = item.maxPrice;
			var item_price_icon = "";
			if(item_minPrice!=undefined && item_maxPrice!=undefined) {
				if(item_price<=item_minPrice && item_maxPrice>item_price) {
					item_price_icon = "<span class=\"font_icon icon_price_min\" title=\"最低价\"></span>";
				} else if(item_price>=item_maxPrice && item_minPrice<item_price) {
					item_price_icon = "<span class=\"font_icon icon_price_max\" style=\"color:#3cd500;\" title=\"最高价\"></span>";
				}
			}
			var item_pic_url = item.picUrl;
			var item_pic = wallImgAddSuffix(item_pic_url, item_platform);
			var item_volume_class = "item_info_likes";
			if(item_platform!=undefined && pageContext.isShared && (item_platform=="TB"||item_platform=="TM"||item_platform=="JD")) {
				item_volume_class = "platform_icon_"+item_platform;
			}
			var item_li = "<li class=\"wall_item\">"+"<a onclick=\"doBuy(this);\" itemId=\""+item_id+"\" data=\""+item_dataStr+"\" platform=\""+item_platform+"\" >"
				+"<div class=\"item_img\">"+"<img src=\""+item_pic+"\" pic=\""+item_pic_url+"\" alt=\""+item_title+"\" onload=\"imgLoaded(this)\" onerror=\"imgReload(this)\" />"
				+"<div class=\"font_icon item_open\"></div></div><div class=\"item_title\">"+item_title+"</div>"+"<div class=\"item_info\">"
				+"<span class=\"item_info_price\"><i>¥</i>"+ item_price + item_price_icon +"</span>"
				//+"<span class=\"item_info_delprice\">¥delprice</span>"
				+"<span class=\""+item_volume_class+"\">"+item_volume+"</span>"
				//+"<span class=\"item_info_provcity\">provcity</span>"
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
			if(pageContext.isShared) {
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
		pageContext.pageNo = data_page_no + 1;
	} else if(data_page_no==1) {
		$("#welcome_box").hide();
		$("#warning_box").show();
		$("body").css("background-color","#FFFFFF");
	} else {
		pageContext.currentPageNo = pageContext.pageNo;
	}
	if(data_page_no<=1 && !pageContext.isReload) {
		// 显示类目列表
		$("#category_box").show();
		var categorys = data.categorys;
		if(categorys!=undefined && categorys.length>0) {
			var category_lis = "",category_url = "?gss=category";
			for(var i=0;i<categorys.length;i++) {
				var category = categorys[i];
				var category_type = category.type;
				var current_li = "";
				if(category.numId == data.currentId) {
					current_li = " class=\"current\"";
				}
				category_lis = category_lis + "<li"+current_li+"><a link=\""+guangUrl(category_url+"&id="+category.numId)+ "\" onclick=\"doCategory(this)\">"+ category.title+"</a></li>";
			}
			$("#category_list").empty().append(category_lis).show();
		} else if(data.query!=undefined) {
			if(data.query.title!=undefined) {
				var title_suffix = " - 逛街啦";
				if(data.from=="jd")
					title_suffix = " - 京东商城";
				else if(data.from=="pdd")
					title_suffix = " - 拼多多";
				$(document).attr("title", data.query.title + title_suffix);
			}
			var sort_vol_up = "",sort_vol_down = "",sort_price_up = "",sort_price_down = "";
			var sort = data.query.sort;
			if(sort=="total_sales_asc") {
				sort_vol_up = "current"
			} else if(sort=="total_sales_des") {
				sort_vol_down = "current"
			} else if(sort=="price_asc") {
				sort_price_up = "current"
			} else if(sort=="price_des") {
				sort_price_down = "current"
			}
			var tmp_title = data.query.title;
			if(tmp_title!=undefined) {
				if(tmp_title.length>10)
					tmp_title = tmp_title.substring(0,10)+"...";
			} else {
				tmp_title = "逛街啦";
			}
			var title_li = "<li class=\"query_title current\"><a>"+ tmp_title +"</a></li>";
			$("#category_list").empty().append(title_li).show();
			var category_option = "<li><a onclick=\"sortItems(this);\" sort=\"default\">综合排序</a></li>"
				+"<li><a onclick=\"sortItems(this);\" sort=\"total_sales\">销量<span class=\"sort_icon\"><i class=\"font_icon si_up "+sort_vol_up+"\"></i><i class=\"font_icon si_down "+sort_vol_down+"\"></i></span></a></li>"
				+"<li><a onclick=\"sortItems(this);\" sort=\"price\">价格<span class=\"sort_icon\"><i class=\"font_icon si_up "+sort_price_up+"\"></i><i class=\"font_icon si_down "+sort_price_down+"\"></i></span></a></li>";
			$("#category_options").empty().append(category_option).show();
		}
	}
	// 加载完成后重置状态
	pageContext.isReload = false;
	pageContext.isLoaded = true;
	// console.info("CALL_BACK:"+JSON.stringify(pageContext));
}
// 根据设备尺寸重设img尺寸
function wallImgAddSuffix(src,platform) {
	if(src==undefined)
		return "";
	var newSrc = src;
	// 根据设备尺寸重设img后缀
	var win_width = $(window).width();
	if(platform==undefined || platform=="TB" || platform=="TM") {
		if(win_width<=400)
			newSrc += "_200x200.jpg";
		else if(win_width<=500)
			newSrc += "_250x250.jpg";
		else if(win_width<=600)
			newSrc += "_300x300.jpg";
		else if(win_width<=700)
			newSrc += "_350x350.jpg";
	} else if(platform=="JD") {
		var tmp_width_str = "n12";
		if(win_width<=400)
			tmp_width_str = "n7";
		else if(win_width<=500)
			tmp_width_str = "n6";
		else if(win_width<=600)
			tmp_width_str = "n11";
		else if(win_width<=700)
			tmp_width_str = "n1";
		if(newSrc.indexOf(".com/ads/")>0) {
			newSrc = newSrc.replace(".com/ads/",".com/"+tmp_width_str+"/");
		}
	}
	return newSrc;
}
// 图片加载完后调用
function imgLoaded(img) {
	$(img).parent().css("background-image","none");
}
// 图片加载失败后调用
function imgReload(img) {
	var pic = $(img).attr("pic");
	if(pic!=undefined && pic!="undefined") {
		$(img).attr("src",$(img).attr("pic"));
	} else if(pic==$(img).attr("src")) {
		return;
	}
}

// 去购买（口令）
function doBuy(a) {
	var platform = $(a).attr("platform");
	if(platform=="JD")
		return doJdBuy(a);
	else if(platform=="PDD")
		return doPddBuy(a);
	// 变量定义
	var item_data = $(a).attr("data");
	var itemId,buyUrl,title,price,coupon_amount;
	if(item_data!=undefined && item_data!="null" && $.trim(item_data)!="") {
		// Android-----------------
		if(typeof(android)!="undefined") {
			return android.showItem(item_data);
		}
		// Android-----------------
		// 数据解包
		var jsonStr = new Base64().decode(item_data);
		var item = JSON.parse(jsonStr);
		if(item!=undefined) {
			itemId = item.id;
			buyUrl = item.buyUrl;
			title = item.title;
			price = item.price;
			coupon_amount = item.couponAmount;
		}
	}
	var tpwd = $(a).attr("tpwd");
	var coupon_txt = "";
	var shop_app_txt = "购物";
	var price_name = "折扣价：";
	if(coupon_amount!=undefined && coupon_amount>0) {
		coupon_txt = "<div class=\"ti_coupon_tag r3\"><div class=\"ct_text\">"+coupon_amount+"</div><div class=\"ct_left\"></div><div class=\"ct_right\"></div></div>";
		price_name = "券后价：";
	}
	var tpwd_dialog = new dialogLayer();
	var tpwd_dgContent = tpwd_dialog.open("口令/二维码，快速淘好货！",260,333);
	var tpwd_html = "<div class=\"tao_pwd\">"
		+"<div class=\"tpwd_content\" clipboard=\"true\"><div class=\"ti_title\">"+title+"</div><div class=\"ti_price\">"+price_name
		+"<span class=\"tip_block\"><i>¥</i>"+price+"</span>"+coupon_txt+"</div><div style=\"color:#0099CC;\">口令：<span info=\"tpwd\">载入中...</span></div></div>"
		+"<div class=\"item_qrcode\" style=\"display:none;\"><img src=\"http://qr.liantu.com/api.php?bg=ffffff&el=l&w=200&m=5&text="+encodeURIComponent(buyUrl)
		+"\" style=\"width:160px;height:160px;\"/></div>"
		+"<div class=\"tpwd_info\">拷贝口令，打开"+shop_app_txt+"APP购买</div>"
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
			url: serverUrl("guang/item/tbk/tpwd.html?id="+itemId+"&url="+encodeURIComponent(buyUrl)),
			type: 'GET',
			dataType: "jsonp",
			success: function (data) {
				if(data.tpwd!=undefined) {
					$(tpwd_dgContent).find("span[info='tpwd']").html(data.tpwd);
					$("a[itemId='"+itemId+"']").attr("tpwd",data.tpwd);
				}
			}
		});
	}
	$(tpwd_dialog.getDialog()).fadeIn(fade_time);
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
		// 一键拷贝
		var clipboard_buy = new ClipboardJS("a.tpwd_buylink", {
			text: function(content) {
				var tmp_content = $(tpwd_dgContent).find("span[info='tpwd']");
				return tmp_content.text();
			}
		});
		clipboard_buy.on("success", function(e) {
			// 拷贝成功
			$(tpwd_dgContent).find(".tpwd_info").html("<span style=\"color:#FF6570;\">口令已拷贝</span>，打开"+shop_app_txt+"APP购买");
			$(tpwd_dgContent).find(".tpwd_content").css("border", "1px dashed #66CC33").css("background-color", "#fcfffa");
		});
		clipboard_buy.on("error", function(e) {
			// 提示失败，手工拷贝
		});
	}
	// 点击内容一键拷贝
	var clipboard = new ClipboardJS("div[clipboard='true']", {
        text: function(content) {
            return $(content).text();
        }
    });
    clipboard.on("success", function(e) {
        // 拷贝成功
		$(tpwd_dgContent).find(".tpwd_info").html("<span style=\"color:#FF6570;\">口令已拷贝</span>，打开"+shop_app_txt+"APP购买");
		$(tpwd_dgContent).find(".tpwd_content").css("border", "1px dashed #66CC33").css("background-color", "#fcfffa");
    });
    clipboard.on("error", function(e) {
        // 提示失败，手工拷贝
    });
}

// 京东弹窗
function doJdBuy(a) {
	// 为开启分享可见，点击商品跳转详情页
	if(!pageContext.isShared) {
		return openItem($(a));
	}
	// 变量定义
	var item_data = $(a).attr("data");
	var itemId,itemUrl,title,price,couponInfos;
	if(item_data!=undefined && item_data!="null" && $.trim(item_data)!="") {
		// Android-----------------
		if(typeof(android)!="undefined") {
			return android.showItem(item_data);
		}
		// Android-----------------
		// 数据解包
		var jsonStr = new Base64().decode(item_data);
		// console.info("JD-data:"+jsonStr);
		var item = JSON.parse(jsonStr);
		if(item!=undefined) {
			itemId = item.id;
			itemUrl = item.itemUrl;
			title = item.title;
			price = item.price;
			couponInfos = item.couponInfos;
		}
	} else {
		return false;
	}
	var jd_dialog_height = 130;
	var couponInfos_html = "";
	if(couponInfos!=undefined && couponInfos.length>1) {
		for(var i=0;i<couponInfos.length;i++) {
			var couponInfo = couponInfos[i];
			couponInfos_html = couponInfos_html+"<a id=\"jd_coupon_link_"+itemId+"_c"+i+"\" onclick=\"openLink(this)\"><div class=\"coupon_item\"><div class=\"ci_discount\">¥"+couponInfo.discount+"</div>"
				+"<div class=\"ci_text\">券后："+couponInfo.price+"元</div></div></a>";
			var param_data = new Base64().encode(itemUrl+"@"+couponInfo.url);
			// 调用接口，获取链接
			$.ajax({
				url: serverUrl("guang/item/jd/clickUrl.html?coupon="+itemId+"_c"+i+"&d="+param_data),
				type: 'GET',
				dataType: "jsonp",
				success: function (data) {
					$("#jd_coupon_link_"+data.coupon).attr("link",data.clickUrl);
				}
			});
		}
		jd_dialog_height += (60*couponInfos.length);
	} else {
		var couponUrl = "";
		if(couponInfos!=undefined && couponInfos.length==1){
			couponUrl = couponInfos[0].url;
		}
		var param_data = new Base64().encode(itemUrl+"@"+couponUrl);
		// 调用接口，获取链接
		$.ajax({
			url: serverUrl("guang/item/jd/clickUrl.html?d="+param_data),
			type: 'GET',
			dataType: "jsonp",
			success: function (data) {
				if(data.clickUrl!=undefined && $.trim(data.clickUrl)!="") {
					// Android
					if(typeof(android)!="undefined") {
						android.openUrl(data.clickUrl);
					} else{
						openWindow(data.clickUrl);
						// window.location.href=data.clickUrl;
						// window.open(data.clickUrl);
					}
				} else {
					alert("抱歉，无法打开此商品！");
				}
			}
		});
		return false;
	}
	var jd_dialog = new dialogLayer();
	var jd_dgContent = jd_dialog.open("京东好券，领券购物！",260,jd_dialog_height);
	var jd_html = "<div class=\"jd_coupon\">"
		//+"<div class=\"item_content\" clipboard=\"true\"><p class=\"ic_title\">"+title+"</p></div>"
		+couponInfos_html
		+"<div class=\"jd_links\">"
		+"<a class=\"jd_close\">~再逛逛~</a>"
		+"</div></div>";
	$(jd_dgContent).html(jd_html);
	$(jd_dialog.getDialog()).fadeIn(fade_time);
	$(jd_dgContent).find(".jd_close").click(function() {
		jd_dialog.close();
	});
}
// 拼多多弹窗
function doPddBuy(a) {
	// 为开启分享可见，点击商品跳转详情页
	if(!pageContext.isShared) {
		return openItem($(a));
	}
	var itemId = $(a).attr("itemid");
	if(itemId==undefined)
		return false;
	// 变量定义
	var item_data = $(a).attr("data");
	if(item_data!=undefined && item_data!="null" && $.trim(item_data)!="") {
		// Android-----------------
		if(typeof(android)!="undefined") {
			return android.showItem(item_data);
		}
		// Android-----------------
	}
	// 调用接口，获取Url
	$.ajax({
		url: serverUrl("guang/item/pdd/clickUrl.html?id="+itemId),
		type: 'GET',
		dataType: "jsonp",
		success: function (data) {
			// print log
			// console.info("DoPddBuy:"+JSON.stringify(data));
			if(data!=undefined && data.clickUrl!=undefined) {
				// Android
				if(typeof(android)!="undefined") {
					android.openUrl(data.clickUrl.url);
				} else{
					// window.location.href=data.clickUrl.url;
					openWindow(data.clickUrl.url);
				}
			}
		}
	});
}
// 打开含有link属性的url
function openLink(link) {
	var link_url = $(link).attr("link");
	if(link_url==undefined || $.trim(link_url)=="")
		return false;
	// Android
	if(typeof(android)!="undefined") {
		android.openUrl(link_url);
	} else{
		// window.location.href=link_url;
		// window.open(link_url);
		openWindow(link_url);
	}
}
// 弹出详情内容窗口
function openItem(link) {
	var data = link.attr("data");
	// window.open(guangUrl("item.html?d="+data));
	// window.location.href = guangUrl("item.html?d="+data);
	// Android--------------------
	if(typeof(android)=="undefined") {
		// window.location.href = guangUrl("item.html?d="+data);
		openWindow(guangUrl("item.html?d="+data));
	} else {
		android.showItem(data);
	}
	// Android--------------------
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
			// console.info("success");
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
		// 显示内容
		$("#category_box").show();
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
// APP下载弹窗
function openDownloadApp() {
	var app_dialog = new dialogLayer();
	var app_dgContent = app_dialog.open("下载APP，体验更流畅！",230,280);
	var app_html = "<div class=\"dialog_box\">"
		+"<div class=\"app_img\"><a href=\""+guangUrl(android_app_apk)+"\"><img src=\""+guangUrl("images/app_logo_max.png")+"\"/></a></div>"
		+"<div class=\"dbc_info\"><b>逛街啦APP</b></div>"
		+"<div class=\"dbc_info\">点击上方图标下载APP到手机。</div>"
		+"<div class=\"button_links\">"
		+"<a id=\"app_download_dialog_close\" class=\"one_center\">不了，以后再说~</a>"
		+"</div></div>";
	$(app_dgContent).html(app_html);
	$(app_dialog.getDialog()).fadeIn(fade_time);
	$(app_dgContent).find("#app_download_dialog_close").click(function() {
		app_dialog.close();
		addCookie("app_download_status","NO",72);
	});
}