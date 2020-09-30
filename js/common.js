/*!
 * Scode.org.cn Common v1.0.0
 * https://scode.org.cn/
 *
 * Copyright 2019-2029
 * 
 * Date: 2019-01-20 00:00:00
 */

$(function() {
	if($(window).scrollTop()<=50) {
		$(".fixed_box .back_top").hide();
		// $(".fixed_box .nav_menu").hide();
	}
	$(".fixed_box .back_top").click(function() {
		// $(window).scrollTop(0);
		$("body,html").animate({ scrollTop: 0 }, 800);
	});
	// 更多菜单
	$(".fixed_box .more_bar").click(function() {
		$(this).hide();
		$(".fixed_box .side_item_blank").show();
	});
	$(".fixed_box .side_item_box .close").click(function() {
		$(".fixed_box .more_bar").show();
		$(".fixed_box .side_item_blank").hide();
	});
	// 导航菜单
	$(".fixed_box .nav_menu").click(function() {
		var cate_box = $("#hd_category_link");
		if(cate_box.length==0)
			return false;
		if(cate_box.attr("show_box")!="1") {
			resetBox();
			cate_box.attr("show_box","1");
			$("#hb_category_box").fadeIn(fade_time,function(){
				$("#m_ui_mask").show();
			});
		} else if(cate_box.attr("show_box")=="1") {
			resetBox();
		}
	});
	// 搜索盒子
	$(".fixed_box .search_bar").click(function() {
		var search_bar = $("#hd_search_link");
		if(search_bar.length==0)
			return false;
		if(search_bar.attr("status")!="open") {
			resetBox();
			search_bar.attr("status","open");
			$("#hb_search_box").fadeIn(fade_time,function(){
				$("#m_ui_mask").show();
				$("#hb_search_text").focus();
				// $("#hb_search_text").select();
			});
		} else if(search_bar.attr("status")!="close") {
			resetBox();
		}
	});
	$(window).scroll(function() {
		var window_top = $(window).scrollTop();
		if(window_top>50) {
			if($(".fixed_box .back_top").is(":hidden")) {
				$(".fixed_box .back_top").show();
			}
			//if($(".fixed_box .nav_menu").is(":hidden")) {
			//	$(".fixed_box .nav_menu").show();
			//}
		} else {
			if(!$(".fixed_box .back_top").is(":hidden")) {
				$(".fixed_box .back_top").hide();
			}
			//if(!$(".fixed_box .nav_menu").is(":hidden")) {
			//	$(".fixed_box .nav_menu").hide();
			//}
		}
	});
	$(".fixed_box .refresh").click(function() {
		$(window).scrollTop(0);
		if(!reloadIndex()) {
			if(pageContext.url==undefined)
				window.location.reload();
			else
				window.location.href = pageContext.url;
		}
	});
	//判断是否是移动设备打开。
	if (browser.versions.mobile) {
		//获取判断用的对象
		var ua = navigator.userAgent.toLowerCase();
		if (ua.match(/MicroMessenger/i) == "micromessenger") {
			//在微信中打开
			current_browser = "WeiXin";
		} else if (ua.match(/WeiBo/i) == "weibo") {
			//在新浪微博客户端打开
			current_browser = "WeiBo";
		} else if (ua.match(/QQ/i) == "qq") {
			//在QQ空间打开
			current_browser = "QQ";
		}
		if (browser.versions.ios) {
			//是否在IOS浏览器打开
			current_browser_platform = "IOS";
		} else if(browser.versions.android) {
			//是否在安卓浏览器打开
			current_browser_platform = "Android";
		}
	} else {
		//否则就是PC浏览器打开
		current_browser = "PC";
	}
	$("#browser_version").html("Browser["+current_browser+"]");
});
// 浏览器版本
var current_browser = "PC", current_browser_platform = "PC";
var browser = {
    versions: function () {
        var u = navigator.userAgent, app = navigator.appVersion;
        return {
			//移动终端浏览器版本信息
            trident: u.indexOf('Trident') > -1, //IE内核
            presto: u.indexOf('Presto') > -1, //opera内核
            webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
            gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
            mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
            android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或uc浏览器
            iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
            iPad: u.indexOf('iPad') > -1, //是否iPad
            webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
        };
    }(),
    language: (navigator.browserLanguage || navigator.language).toLowerCase()
};

// 获取浏览器地址栏参数
function getQueryString(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	var r = window.location.search.substr(1).match(reg);
	if (r != undefined)
		return unescape(r[2]);
	return undefined;
}
// 获取url中的参数值
function getUrlParam(url,name) {
	if(url==undefined || $.trim(url)=="")
		return undefined;
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	var url_params = url.substr(url.indexOf("?"));
	var r = url_params.substr(1).match(reg);
	if (r != undefined)
		return unescape(r[2]);
	return undefined;
}
// 获取浏览器地址栏静态参数（#锚）
function getStaticParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	var r = window.location.hash.substr(1).match(reg);
	if (r != undefined)
		return unescape(r[2]);
	return undefined;
}
/* 
* url 目标url 
* arg 需要替换的参数名称 
* arg_val 替换后的参数的值 
* return url 参数替换后的url 
*/ 
function changeURLArg(url,arg,arg_val) {
    var pattern=arg+'=([^&]*)';
    var replaceText='';
	if(arg_val!=undefined && $.trim(arg_val)!="")
		replaceText=arg+'='+arg_val;
    if(url.match(pattern)) {
		if(replaceText!=''){
			var tmp='/('+ arg+'=)([^&]*)/gi';
			return url.replace(eval(tmp),replaceText);
		} else {
			var tmp='/[\?|&]('+ arg+'=)([^&]*)/gi';
			return url.replace(eval(tmp),"");
		}
    } else if(replaceText!='') {
        if(url.match('[\?]')) {
            return url+'&'+replaceText;
        } else {
            return url+'?'+replaceText;
        }
    }
    return url;
}
function changeParamReload(arg,arg_val) {
	var href = window.location.href;
	href = changeURLArg(href,arg,arg_val);
	window.location.href = href;
}
// 获取日期（月-日）
function dateMMdd(time) {
	var tmp_date = new Date(time);
	var td_mm = tmp_date.getMonth()+1;
	var td_dd = tmp_date.getDate();
	return td_mm+"-"+td_dd;
}
// 获取日期（年-月-日 时:分）
function dateYmdhm(time) {
	var tmp_date = new Date(time);
	var td_yyyy = tmp_date.getFullYear();
	var td_mm = tmp_date.getMonth()+1;
	var td_dd = tmp_date.getDate();
	var td_hh = tmp_date.getHours();
	var td_ms = tmp_date.getMinutes();
	return td_yyyy+"-"+td_mm+"-"+td_dd+" "+td_hh+":"+td_ms;
}
// 获得coolie 的值
function cookie(name) {
	// 得到分割的cookie名值对
	var cookieArray = document.cookie.split("; ");
	var cookie = new Object();
	for ( var i = 0; i < cookieArray.length; i++) {
		// 将名和值分开
		var arr = cookieArray[i].split("=");
		// 如果是指定的cookie，则返回它的值
		if (arr[0] == name)
			return unescape(arr[1]);
	}
	return "";
}

// 删除cookie
function delCookie(name) {
	document.cookie = name + "=;expires=" + (new Date(0)).toGMTString();
}

// 获取指定名称的cookie的值
function getCookie(objName) {
	var arrStr = document.cookie.split("; ");
	for ( var i = 0; i < arrStr.length; i++) {
		var temp = arrStr[i].split("=");
		if (temp[0] == objName)
			return unescape(temp[1]);
	}
}

// 添加cookie
function addCookie(objName, objValue, objHours) {
	var str = objName + "=" + escape(objValue);
	// 为时不设定过期时间，浏览器关闭时cookie自动消失
	if (objHours > 0) {
		var date = new Date();
		var ms = objHours * 3600 * 1000;
		date.setTime(date.getTime() + ms);
		str += "; expires=" + date.toGMTString();
	}
	document.cookie = str;
}

// 两个参数，一个是cookie的名子，一个是值
function setCookie(name, value) {
	// 此 cookie 将被保存 30 天
	var Days = 30;
	// new Date("December 31, 9998");
	var exp = new Date();
	exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
	document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
}

// 取cookies函数
function getCookie(name) {
	var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
	if (arr != null)
		return unescape(arr[2]);
	return null;
}

// 删除cookie
function delCookie(name) {
	var exp = new Date();
	exp.setTime(exp.getTime() - 1);
	var cval = getCookie(name);
	if (cval != null)
		document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
}

//阻止浏览器的默认行为 
function stopDefault(event) {
    event.stopPropagation();
}

// 添加浏览器收藏
function addFavorite() {
	var url = window.location;
	var title = document.title;
	var ua = navigator.userAgent.toLowerCase();
	if (ua.indexOf("360se") > -1) {
		// alert("由于360浏览器功能限制，请按 Ctrl+D 手动收藏！");
	} else if (ua.indexOf("msie 8") > -1) {
		window.external.AddToFavoritesBar(url, title); //IE8
	} else if (document.all) {//IE类浏览器
		try{
			window.external.addFavorite(url, title);
		}catch(e){
			// alert('您的浏览器不支持,请按 Ctrl+D 手动收藏!');
		}
	} else if (window.sidebar) {//firfox等浏览器；
		window.sidebar.addPanel(title, url, "");
	} else {
		// alert('您的浏览器不支持,请按 Ctrl+D 手动收藏!');
	}
}

// 打开页面
function openWindow(url, target) {
	if(target==undefined || target!="_blank") {
		window.location.href = url;
		// console.info("open:"+url);
	} else {
		window.open(url);
		// console.info("open_blank:"+url);
	}
}