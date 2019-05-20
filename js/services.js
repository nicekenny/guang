/*!
 * Guang.scode.org.cn Services v1.0.0
 * https://scode.org.cn/
 *
 * Copyright 2019-2029
 * 
 * Date: 2019-01-12 00:00:00
 */

// 定义全局变量
var basepath = "https://guang.scode.org.cn/";
var serv_basepath = "http://x.scode.org.cn:81/";
// serv_basepath = "http://localhost/scodelab/";
serv_basepath = "https://x.scode.org.cn:444/";
// 定义AppCode
var base_app_code = "guang";
// 初始化页码
var page_no = 1,current_page_no = 0,loaded = true;

// 页面数据初始化
$(function() {
	
	$("a[scl='guang']").each(function(){
		var tmp_href = $(this).attr("href");
		$(this).attr("href", basepath + tmp_href);
	});
	$("a[scl='x_scode']").each(function(){
		var tmp_href = $(this).attr("href");
		$(this).attr("href", serv_basepath + tmp_href);
	});

	$("#m_ui_mask").click(function() {
		resetBox();
	});
	$("#hd_search_link").click(function() {
		if($(this).attr("class")=="hd_search_link") {
			resetBox();
			$(this).text("取消");
			$(this).attr("class","hd_search_off");
			$("#hb_search_box").show();
			$("#m_ui_mask").show();
			$("#hb_search_text").focus();
		} else if($(this).attr("class")=="hd_search_off") {
			resetBox();
		}
	});
	$("#hd_category_link").click(function() {
		if($(this).attr("show_box")!="1") {
			resetBox();
			$(this).attr("show_box","1");
			$("#hb_category_box").show();
			$("#m_ui_mask").show();
		} else if($(this).attr("show_box")=="1") {
			resetBox();
		}
	});
	$("#hb_search_form").submit(function() {
		var keyword = $.trim($("#hb_search_text").val());
		if(keyword=="")
			return false;
		$("#hb_search_q").val(encodeURI(keyword));
		var action = basepath; //+"?q="+encodeURI(keyword);
		$(this).attr("action",action);
		return true;
	});
	
	var pathname = window.location.pathname;
	// alert(pathname);
	if(pathname=="" || pathname=="/" || pathname=="/index.html") {
		// 载入首页
		loadIndex();
		// 滚动条加载商品数据
		$(window).scroll(function() {
			var items_box = $("#product_walls");
			var window_top = $(window).scrollTop();
			
			if(window_top>(items_box.offset().top+items_box.height()-1000) && loaded) {
				loadIndex();
			}

			// 固定导航条
			var category_list = $("#category_list");
			if(window_top>45) {
				if(!category_list.hasClass("nav_fixed")) {
					category_list.addClass("nav_fixed");
				}
			} else {
				if(category_list.hasClass("nav_fixed")) {
					category_list.removeClass("nav_fixed");
				}
			}

		});
	}


});
function resetBox() {
	if($("#m_ui_mask").is(":hidden"))
		return;
	if(!$("#hb_search_box").is(":hidden")) {
		$("#hb_search_box").hide();
		$("#hd_search_link").attr("class","hd_search_link");
		$("#hd_search_link").text("搜索");
	}
	if(!$("#hb_category_box").is(":hidden")) {
		$("#hb_category_box").hide();
		$("#hd_category_link").removeAttr("show_box");
	}
	$("#m_ui_mask").hide();
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
	var from = getQueryString("from");
	if(from!=undefined && from!="") {
		if(from=="search") {
			var search_q = getQueryString("q");
			search_q = decodeURI(search_q);
			load_url = "taobao/item/ajaxSearch.html?q="+search_q+"&page="+page_no+"&app="+base_app_code;
		}
	}
	if(load_url==undefined) {
		var categoryId = getQueryString("cate");
		load_url = "taobao/item/ajaxItems.html?cate="+categoryId+"&page="+page_no+"&app="+base_app_code;
	}
	$.ajax({
		url: serv_basepath + load_url,
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

			var item_li = "<li class=\"wall_item\">"+"<a onclick=\"doBuy(this);\" itemId=\""+item.numIid
				+"\" buyUrl=\""+item.buyUrl+"\" tpwd=\""+item.tpwd+"\" title=\""+item.title+"\" price=\""+item.finalPriceWap
				+"\" userType=\""+item.userType+"\" coupon=\""+item.couponInfo+"\" >"
				+"<div class=\"item_img\">"+"<img src=\""+item.pictUrl+"_250x250q90.jpg\" pic=\""+item.pictUrl+"\" alt=\""+item.title+"\" />"
				+"</div><div class=\"item_title\">"+item.title+"</div>"+"<div class=\"item_info\">"
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
			pw_min.append(item_li);

		}
		// 全局页码翻页
		page_no = page_no + 1;
		loaded = true;
	} else if(page_no==1) {
		$("#warning_box").show();
	}
	if(current_page_no<=1) {
		var categorys = data.categorys;
		if(categorys!=undefined) {
			for(var i=0;i<categorys.length;i++) {
				var category = categorys[i];

				var current_li = "";
				if(category.favoritesId == data.currentCategoryId) {
					current_li = " class=\"current\"";
				}

				var category_li = "<li"+current_li+"><a href=\""+basepath+"?cate="+category.favoritesId+ "\" >"+ category.favoritesTitle+"</a></li>";

				$("#category_list").append(category_li);
			}
		} else {
			if(current_category!=undefined) {
				var category_li = "<li class=\"current\"><a>"+ current_category +"</a></li>";
				$("#category_list").append(category_li);
			}
		}
	}
	
}

// 去购买（淘口令）
function doBuy(a) {
	var itemId = $(a).attr("itemId");
	var buyUrl = $(a).attr("buyUrl");
	var tpwd = $(a).attr("tpwd");
	var title = $(a).attr("title");
	var price = $(a).attr("price");
	var coupon = $(a).attr("coupon");
	var coupon_txt = "";
	var userType = $(a).attr("userType");
	var userType_txt = "";

	var price_name = "折扣价：";
	if(coupon!=undefined && coupon!="undefined" && coupon!="") {
		coupon_txt = "&nbsp;(券)";
		price_name = "优惠价：";
	}

	if(userType==0)
		userType_txt = "淘宝";
	else if(userType==1)
		userType_txt = "天猫/淘宝";

	var tpwd_dialog = new dialogLayer();
	var tpwd_dgContent = tpwd_dialog.open("淘口令/二维码，快速淘好货！",250,330);

	// 调用接口，获取淘口令
	$.ajax({
		url: serv_basepath + "taobao/item/ajaxItemTpwd.html?id="+itemId+"&url="+encodeURIComponent(buyUrl)+"&app="+base_app_code,
		type: 'GET',
		dataType: "jsonp",
		success: function (data) {
			$(tpwd_dgContent).find("span[info='tpwd']").html(data);
		}
	});
	
	var tpwd_html = "<div class=\"tao_pwd\">"
		+"<div class=\"tpwd_content\" clipboard=\"true\"><p class=\"ti_title\">"+title+"</p><p class=\"ti_price\">"+price_name+"<span style=\"color:#d52f37;\">¥"+price+"</span>"+coupon_txt+"</p><p style=\"color:#0099CC;\">淘口令：<span info=\"tpwd\">载入中...</span></p></div>"
		+"<div class=\"item_qrcode\" style=\"display:none;\"><img src=\"http://qr.liantu.com/api.php?bg=ffffff&el=l&w=200&m=5&text="+encodeURIComponent(buyUrl)+"\" style=\"width:160px;height:160px;\"/></div>"
		+"<div class=\"tpwd_info\">复制淘口令，打开"+userType_txt+"APP购买</div>"
		+"<div class=\"tpwd_links\">"
		+"<a href=\""+buyUrl+"\" target=\"_blank\" class=\"tpwd_buylink\">直达连接</a>"
		+"<a class=\"tpwd_qrcode\">二维码</a>"
		+"<a class=\"tpwd_close\">再逛逛</a>"
		+"</div></div>";

	$(tpwd_dgContent).html(tpwd_html);
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
			tmp_link.text("淘口令");
		} else {
			$(tpwd_dgContent).find(".item_qrcode").hide();
			$(tpwd_dgContent).find(".tpwd_content").show();
			$(tpwd_dgContent).find(".tpwd_info").show();
			tmp_link.text("二维码");
		}
	});
	
	// 微信浏览器中优先显示二维码
	if(current_browser=="WeiXin") {
		$(tpwd_dgContent).find(".tpwd_buylink").removeAttr("href");
		$(tpwd_dgContent).find(".tpwd_buylink").click(function() {
			$(tpwd_dgContent).find(".tpwd_info").html("<span style=\"color:#FF6570;\">请复制淘口令</span>，打开"+userType_txt+"APP购买");
		});
	}
	// 设置窗口背景图片
	// var pic_url = $(a).find("img:first-child").attr("pic")+"_300x300q90.jpg";
	// $(tpwd_dgContent).css("background-image","url("+pic_url+")");
	// 点击内容一键拷贝
	var clipboard = new ClipboardJS("div[clipboard='true']", {
        text: function(content) {
            return $(content).find("span[info='tpwd']").text();
        }
    });
    clipboard.on("success", function(e) {
        // 拷贝成功
		$(tpwd_dgContent).find(".tpwd_info").html("<span style=\"color:#FF6570;\">淘口令已复制</span>，打开"+userType_txt+"APP购买");
		$(tpwd_dgContent).find(".tpwd_content").css("border", "1px dashed #66CC33").css("background-color", "#f7fff1");
    });
    clipboard.on("error", function(e) {
        // 提示失败，手工拷贝
    });
}

