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
	if(pathname=="/tpwd.html" || pathname=="/pwd.html") {
		// 复制口令页面
		global_item_id = getQueryString("id");
		var tpwd = decodeURI(getQueryString("pwd"));
		if(tpwd!=undefined) {
			$("#tao_pwd_view").text("("+tpwd+")");
		}
		var item_pic = getQueryString("pic");
		if(item_pic!=undefined && $.trim(item_pic)!="") {
			item_pic = decodeURIComponent(item_pic);
			var pic_box = $("#item_picture").attr("src",item_pic + item_img_suffix).parent();
			// pic_box.css("height",pic_box.width()+"px");
			pic_box.show();
		} else {
			// 调用接口，获取商品图片
			$.ajax({
				url: serverUrl("guang/item/ajaxItemInfo.html?id="+global_item_id),
				type: 'GET',
				dataType: "jsonp",
				success: function (data) {
					if(data!=undefined && data.item!=undefined) {
						var tmp_pic = data.item.pic;
						if(tmp_pic!=undefined && $.trim(tmp_pic)!="") {
							var tmp_pic_box = $("#item_picture").attr("src",tmp_pic + item_img_suffix).parent();
							tmp_pic_box.show();
						}
					}
				}
			});
		}
	} else if(pathname=="/item.html") {
		// 获取宝贝数据包
		var data = getQueryString("d");
		if(data!=undefined && data!="null" && $.trim(data)!="") {
			// 数据解包
			var jsonStr = new Base64().decode(data);
			var item = Json.parse(jsonStr);
			if(item!=undefined) {
				// 全局变量：宝贝ID
				global_item_id = item.id;
				// 设置title
				$(document).attr("title", item.title + " - 逛街啦");

				var itemBlock_imgs = $("div.showcase");
				var pic_main = item.picUrl + item_img_suffix;
				
				var pic_list = item.picUrls;
				var imgList_html = "",imgList_nav = "";
				if(item.whiteImage!=undefined && $.trim(item.whiteImage)!="") {
					var white_img = item.whiteImage + item_img_suffix;
					imgList_html = imgList_html + "<div class=\"itbox\"><a class=\"item\"><img src=\""+white_img+"\" onload=\"imgLoaded(this)\"/></a></div>";
					imgList_nav = imgList_nav + "<i></i>";
				}
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
				$("div.detail_title").html(item.title);
				var del_price = item.reservePrice;
				if(item.price<item.zkPrice)
					del_price = item.zkPrice;
				$("div.d_price").html("¥"+item.price+"<span class=\"font_icon icon_price\" style=\"display:none;\"></span><em>¥"+del_price+"</em>");
				var item_share_coupon = "",is_price_title = "折扣价";
				if(item.couponAmount!=undefined && item.couponAmount>0) {
					$("div.d_coupon").html("<i>券</i>"+item.couponAmount).show();
					item_share_coupon = " (优惠"+item.couponAmount+"元)";
					is_price_title = "券后价"
				}
				$("div.di_likes").html(item.volume);
				
				// 分享文案
				var item_share_text = "【"+item.title+"】\r\n\r\n【自己买】¥"+del_price+"元\r\n【"+is_price_title+"】¥"+item.price+"元"+item_share_coupon+"\r\n━┉┉┉┉∞┉┉┉┉━\r\n";

				var buyUrl = encodeURIComponent(item.buyUrl);
				var picUrl = encodeURIComponent(item.picUrl);
				// 调用接口，获取口令
				$.ajax({
					url: serverUrl("guang/item/ajaxItemTpwd.html?id="+global_item_id+"&url="+buyUrl),
					type: 'GET',
					dataType: "jsonp",
					success: function (data) {
						$("#tao_pwd_view").text(data);
						var tpwd = data.replace(/￥/g,"");
						var doQrCodeUrl = guangUrl("pwd.html?id="+global_item_id+"&pwd="+tpwd+"&"+property_gss+"=item"); //&pic=picUrl
						var qr_code_url = "http://qr.topscan.com/api.php?bg=ffffff&el=l&w=100&m=5&text="+encodeURIComponent(doQrCodeUrl);
						$(".qr_code_img").attr("src",qr_code_url).click(function(){
							window.open(doQrCodeUrl);
						});
						$("#item_share_text").val(item_share_text+"复制本条("+tpwd+")去打开购物APP即可把我带回家。");
					}
				});
				
				// 历史价格数据显示
				// historyPrices(prices,now_p,max_p,min_p);
				$.ajax({
					url: serverUrl("guang/item/ajaxHistoryPrices.html?id="+global_item_id),
					type: 'GET',
					dataType: "jsonp",
					success: function (data) {
						if(data.historyPrices!=undefined) {
							if(data.price<=data.minPrice) {
								$("div.d_price .icon_price").html("&#xf149;").show();
							} else if(data.price>=data.maxPrice) {
								$("div.d_price .icon_price").html("&#xf148;").css("color","#3cd500").show();
							}
							historyPrices(data.historyPrices,data.price,data.maxPrice,data.minPrice);
						}
					}
				});
				//--历史价格--end--
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
			var cache_text = $(e.trigger).html();
			$(e.trigger).addClass("green").html("拷贝成功，打开购物APP购买");
			// 3秒后恢复
			setTimeout(function(){
				$(e.trigger).removeClass("green").html(cache_text);
			},3000);
		}
	});
	clipboard.on("error", function(e) {
		// 提示失败，手工拷贝
		// $(e.trigger).append("(失败)");
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
			var cache_text = $(e.trigger).html();
			if($(e.trigger).hasClass("blue"))
				$(e.trigger).removeClass("blue");
			$(e.trigger).addClass("purple").html("拷贝成功，去粘贴分享文案");
			// 3秒后恢复
			setTimeout(function(){
				$(e.trigger).removeClass("purple").addClass("blue").html(cache_text);
			},3000);
		}
	});
	clipboard_share.on("error", function(e) {
		// 提示失败，手工拷贝
		// $(e.trigger).append("(失败)");
	});
	if(pathname=="/item.html" || pathname=="/tpwd.html") {
		$(".detail_recoms").show();
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
	}
	// 图片滚动区域点击事件
	$(".detail_img").click(function() {
		if($(".detail_head_bar").is(":hidden")) {
			$(".detail_head_bar").fadeIn(fade_time);
			$(".nav-container").fadeIn(fade_time);
		} else {
			$(".detail_head_bar").fadeOut(fade_time);
			$(".nav-container").fadeOut(fade_time);
		}
	});
	// 详情头部工具栏事件
	$(".detail_head_bar .back_link").click(function(event){
		// 阻止任何父类事件的执行
		event.stopPropagation();
		window.history.go(-1);
	});
	$(".detail_head_bar .home_link").click(function(event){
		// 阻止任何父类事件的执行
		event.stopPropagation();
		addFavorite();
	});
	
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

// 历史价格
function historyPrices(prices,now_p,max_p,min_p) {
	$("#history_prices").show();
	// 数据处理
	var y_min,y_max,y_tick;
	y_tick = parseInt(max_p/8);
	y_max = parseInt(parseFloat(max_p/8)*10);
	y_min = min_p - (y_max - max_p);
	if(y_min<0)
		y_min = 0;
	// 设置
	Highcharts.setOptions({
		global : {
			useUTC : false
		}
	});
	// 报表
	$('#history_prices').highcharts({
		credits:{
			 enabled: false
		},
		chart : {
			type : 'spline',
			animation : Highcharts.svg,
			height : 300,
			events : {
				
			}
		},
		title : {
			text : "最高："+max_p+"元，最低："+min_p+"元，现在："+now_p+"元",
			style: {
				color: "#FF6570",
				fontWeight: "bold",
				fontSize: "12px"
			}
		},
		plotOptions : {
			spline : {
				lineWidth : 1.5,
				fillOpacity : 0.2,
				marker : {
					enabled : true,
					states : {
						hover : {
							enabled : true,
							radius : 4
						}
					}
				},
				shadow : true
			}
		},
		xAxis : {
			type : 'datetime',
			tickPixelInterval : 100
		},
		yAxis : {
			title : {
				text : undefined
			},
			plotLines : [ {
				value : 0,
				width : 2,
				color : '#808080'
			} ],
			max : y_max,
			min : y_min//,
			//tickInterval : y_tick
		},
		tooltip : {
			formatter : function() {
				return '<b>' + this.series.name + '</b><br/>'
						+ Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>'
						+ Highcharts.numberFormat(this.y, 2) + "元";
			}
		},
		legend : {
			enabled : false,
			align: 'center',
			verticalAlign: 'bottom',
			x: 0,
			y: 0,
			borderColor : '#FFFFFF'
		},
		exporting : {
			enabled : false
		},
		series : [{
			name : '历史价格',
			color: '#666666',
			data : (function() {
				var data = [],time = (new Date()).getTime();
				for (var i = -1; i <= prices.length+1; i++) {
					var tmp_p_t,tmp_p_p;
					if(i<0) {
						tmp_p_t = prices[0].time;
						tmp_p_t = tmp_p_t + (6000*i);
						tmp_p_p = prices[0].price;
					} else if(i>=prices.length) {
						tmp_p_t = prices[prices.length-1].time;
						tmp_p_t = tmp_p_t + (6000*i);
						tmp_p_p = prices[prices.length-1].price;
					} else {
						tmp_p_t = prices[i].time;
						tmp_p_p = prices[i].price;
					}
					data.push({
						x : tmp_p_t,
						y : tmp_p_p
					});
				}
				return data;
			})()
		}]
	});
	//==history-prices-end==
}

