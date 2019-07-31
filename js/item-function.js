/*!
 * Guang.scode.org.cn Item Function v1.0.0
 * https://guang.scode.org.cn/
 *
 * Copyright 2019-2029
 * 
 * Date: 2019-05-22 00:00:00
 */
// 定义全局变量
var global_item_id;
var global_platform;
var again_load = false;

$(function() {
	var pathname = window.location.pathname;
	if(pathname=="/pwd.html") {
		// 复制口令页面
		global_item_id = getQueryString("id");
		global_platform = getQueryString("platform");
		var tpwd = decodeURI(getQueryString("pwd"));
		if(tpwd!=undefined) {
			$("#tao_pwd_view").text("￥"+tpwd+"￥");
		}
		var item_pic = getQueryString("pic");
		if(item_pic!=undefined && $.trim(item_pic)!="") {
			item_pic = decodeURIComponent(item_pic);
			var pic_box = $("#item_picture").attr("src",itemImgAddSuffix(item_pic,"TB")).parent();
			// pic_box.css("height",pic_box.width()+"px");
			pic_box.show();
		} else {
			// 调用接口，获取商品图片
			$.ajax({
				url: serverUrl("guang/item/info.html?id="+global_item_id+"&platform=TB,TM"),
				type: 'GET',
				dataType: "jsonp",
				success: function (data) {
					if(data!=undefined && data.item!=undefined) {
						global_platform = data.item.platform;
						var tmp_pic = data.item.picUrl;
						if(tmp_pic!=undefined && $.trim(tmp_pic)!="") {
							var tmp_pic_box = $("#item_picture").attr("src",itemImgAddSuffix(tmp_pic,"TAOBAO")).parent();
							tmp_pic_box.show();
						}
					}
				}
			});
		}
	} else if(pathname=="/item.html") {
		if(!pageContext.isShared) {
			$("#goto_buy_view").show();
		}
		// 获取宝贝数据包
		var data = getQueryString("d");
		if(data!=undefined && $.trim(data)!="") {
			// 数据解包
			var jsonStr = new Base64().decode(data);
			var item = JSON.parse(jsonStr);
			if(item!=undefined) {
				// 全局变量：宝贝ID
				global_item_id = item.id;
				global_platform = item.platform;
				// debug...
				// console.info("Global-ItemId:"+global_item_id+";Platform:"+global_platform);
				var title_suffix = " - 逛街啦";
				// 京东平台
				if(item.platform=="JD") {
					title_suffix = " - 京东商城";
				} else if(item.platform=="PDD") {
					title_suffix = " - 拼多多";
				}
				// 设置title
				$(document).attr("title", item.title + title_suffix);
				//- 图片-box ===============================================
				var itemBlock_imgs = $("div.showcase");
				var pic_main = itemImgAddSuffix(item.picUrl,item.platform);
				var pic_list = item.picImages;
				var imgList_html = "",imgList_nav = "";
				if(item.whiteImage!=undefined && $.trim(item.whiteImage)!="") {
					var white_img = itemImgAddSuffix(item.whiteImage,item.platform);
					imgList_html = imgList_html + "<div class=\"itbox\"><a class=\"item\"><img src=\""+white_img+"\" onload=\"imgLoaded(this)\"/></a></div>";
					imgList_nav = imgList_nav + "<i></i>";
				}
				if(pic_list!=undefined && pic_list.length>0) {
					for(var i=0;i<pic_list.length;i++) {
						var tmp_pic = itemImgAddSuffix(pic_list[i],item.platform);
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
				//- 图片-box End ===============================================
				$("div.detail_title").html(item.title);
				if(item.categoryName!=undefined) {
					$("#item_category_name").text(item.categoryName);
				}
				var del_price = item.reservePrice;
				if(item.price<item.zkPrice)
					del_price = item.zkPrice;
				var del_price_html="",del_price_text="";
				if(del_price!=undefined) {
					del_price_html = "<em>¥"+del_price+"</em>";
					del_price_text = "【自己买】¥"+del_price+"元\r\n";
				}
				$("div.d_price").html("¥"+item.price+"<span id=\"item_price_icon\" class=\"font_icon\" style=\"display:none;\"></span>"+del_price_html);
				var item_share_coupon = "",is_price_title = "折扣价";
				if(item.couponAmount!=undefined && item.couponAmount>0) {
					$("div.d_coupon").html("<i>券</i>"+item.couponAmount).show();
					$("div.d_coupon_tag .ct_text").html(item.couponAmount).parent().show();
					item_share_coupon = " (优惠"+item.couponAmount+"元)";
					is_price_title = "券后价";
				}
				$("div.di_likes").html(item.volume);
				// 分享文案
				var item_share_text = "【"+item.title+"】\r\n\r\n"+del_price_text;
				// 判断商品来源平台
				if(item.platform=="JD") {
					// =============================京东平台==================================
					if(pageContext.isShared) {
						$("#coupon_info_list").show();
					}
					var itemUrl = item.itemUrl;
					// debug...
					// console.info("JD-ItemUrl:"+itemUrl);
					var couponInfos = item.coupons;
					if(couponInfos!=undefined && couponInfos.length>0) {
						// debug...
						// console.info("JD-Coupons:"+JSON.stringify(couponInfos));
						for(var i=0;i<couponInfos.length;i++) {
							var couponInfo = couponInfos[i];
							var couponUrl = couponInfo.url;
							if(couponUrl==undefined)
								couponUrl = "";
							var coupon_link_text = "优惠券【<em>¥"+couponInfo.discount+"元</em>】一键领取";
							if(couponInfo.info!=undefined && $.trim(couponInfo.info).length>0) {
								if(couponInfo.info.indexOf("拼购")!=-1) {
									coupon_link_text = "【<em>¥"+couponInfo.price+"元</em>】"+couponInfo.info;
								}
							}
							var do_jd_coupon_button_style = " style=\"display:none;\"";
							if(pageContext.isShared) {
								do_jd_coupon_button_style = "";
							}
							var coupon_link_html = "<div id=\"do_jd_coupon_button_"+global_item_id+"_c"+i+"\" class=\"d_coupon\""+do_jd_coupon_button_style+">"+coupon_link_text+"</div>";
							$("#coupon_info_list").append(coupon_link_html);
							
							var param_data = new Base64().encode(itemUrl+"@"+couponUrl);
							// 调用接口，获取链接
							$.ajax({
								url: serverUrl("guang/item/jd/clickUrl.html?coupon="+global_item_id+"_c"+i+"&d="+param_data+"&type=short"),
								type: 'GET',
								dataType: "jsonp",
								success: function (data) {
									if(data.clickUrl!=undefined) {
										// 简版
										if(couponInfo.price<=item.price) {
											$("#goto_buy_link_jd").attr("click",data.clickUrl).show();
										}
										$("#do_jd_coupon_button_"+data.coupon).attr("click",data.clickUrl);
										var tmp_ajax_share_text = $("#item_share_text").val();
										// 判断是否为领券+参团
										var coupon_pingou_text = "(优惠"+couponInfo.discount+"元)";
										if(couponInfo.info!=undefined && $.trim(couponInfo.info).length>0) {
											if(couponInfo.info.indexOf("拼购")!=-1) {
												coupon_pingou_text = "【"+couponInfo.info+"】";
											}
										}
										tmp_ajax_share_text += "¥"+couponInfo.price+"元 "+coupon_pingou_text+"\r\n";
										tmp_ajax_share_text += data.shortUrl + "\r\n";
										$("#item_share_text").val(tmp_ajax_share_text);
										$("#do_jd_coupon_button_"+data.coupon).click(function() {
											var tmp_curl = $(this).attr("click");
											if(tmp_curl!=undefined && $.trim(tmp_curl)!="") {
												// window.location.href = tmp_curl;
												openWindow(tmp_curl);
												// Android
												//if(typeof(android)!="undefined") {
												//	android.openApp(global_platform, tmp_curl);
												//} else {
												//	openWindow(tmp_curl);
												//}
											}
										});
										// 二维码
										if($(".qr_code_img").attr("already")!="true") {
											var doQrCodeUrl = data.shortUrl;
											var qr_code_url = "http://qr.topscan.com/api.php?bg=ffffff&el=l&w=100&m=5&text="+encodeURIComponent(doQrCodeUrl);
											$(".qr_code_img").attr("src",qr_code_url).attr("already","true").click(function(){
												// window.open(doQrCodeUrl);
												openWindow(doQrCodeUrl, "_blank");
											});
										}
									} else {
										$("#do_jd_coupon_button_"+data.coupon).remove();
									}
								}
							});
						}
						if($("#goto_buy_link_jd").is(":hidden")) {
							var param_data = new Base64().encode(itemUrl);
							// 调用接口，获取链接
							$.ajax({
								url: serverUrl("guang/item/jd/clickUrl.html?d="+param_data+"&type=short"),
								type: 'GET',
								dataType: "jsonp",
								success: function (data) {
									// 简版
									if(data.clickUrl!=undefined) {
										$("#goto_buy_link_jd").attr("click",data.clickUrl).show();
									}
								}
							});
						}
						is_price_title = "券后价";
					} else {
						var param_data = new Base64().encode(itemUrl);
						// 调用接口，获取链接
						$.ajax({
							url: serverUrl("guang/item/jd/clickUrl.html?d="+param_data+"&type=short"),
							type: 'GET',
							dataType: "jsonp",
							success: function (data) {
								// 简版
								if(data.clickUrl!=undefined) {
									$("#goto_buy_link_jd").attr("click",data.clickUrl).show();
								}
								var coupon_link_text = "折扣价【<em>¥"+item.price+"元</em>】去购买";
								if(item.couponInfo!=undefined && $.trim(item.couponInfo).length>0) {
									if(item.couponInfo.indexOf("拼购")!=-1) {
										coupon_link_text = "参团："+item.couponInfo;
									}
								}
								var do_jd_buy_button_style = " style=\"display:none;\"";
								if(pageContext.isShared) {
									do_jd_buy_button_style = "";
								}
								var coupon_link_html = "<div id=\"do_jd_buy_button\" click=\""+data.clickUrl+"\" class=\"d_tpwd\""+do_jd_buy_button_style+">"+coupon_link_text+"</div>";
								$("#coupon_info_list").empty().append(coupon_link_html);
								var tmp_ajax_share_text = $("#item_share_text").val();
								tmp_ajax_share_text += data.shortUrl;
								$("#item_share_text").val(tmp_ajax_share_text);
								$("#do_jd_buy_button").click(function() {
									var tmp_curl = $(this).attr("click");
									if(tmp_curl!=undefined && $.trim(tmp_curl)!="") {
										// window.location.href = tmp_curl;
										openWindow(tmp_curl);
										// Android
										//if(typeof(android)!="undefined") {
										//	android.openApp(global_platform, tmp_curl);
										//} else {
										//	openWindow(tmp_curl);
										//}
									}
								});
								// 二维码
								var doQrCodeUrl = data.shortUrl;
								var qr_code_url = "http://qr.topscan.com/api.php?bg=ffffff&el=l&w=100&m=5&text="+encodeURIComponent(doQrCodeUrl);
								$(".qr_code_img").attr("src",qr_code_url).click(function(){
									if(typeof(android)=="undefined") {
										// window.open(doQrCodeUrl);
										openWindow(doQrCodeUrl, "_blank");
									}
								});
							}
						});
						is_price_title = "折扣价";
					}
					item_share_text += "【"+is_price_title+"】¥"+item.price+"元\r\n━┉┉┉┉∞┉┉┉┉━\r\n";
					$("#item_share_text").val(item_share_text);
					adapt_sharetext_height();
					// =============================京东平台(END)==================================
				} else if(item.platform=="PDD") {
					// =============================拼多多平台==================================
					if(pageContext.isShared) {
						$("#coupon_info_list").show();
					}
					// 调用接口，获取Url
					$.ajax({
						url: serverUrl("guang/item/pdd/clickUrl.html?id="+global_item_id),
						type: 'GET',
						dataType: "jsonp",
						success: function (data) {
							// print log
							// console.info("DoPddBuy:"+JSON.stringify(data));
							if(data!=undefined && data.clickUrl!=undefined) {
								// 多平台
								var do_pdd_coupon_button_style = " style=\"display:none;\"";
								if(pageContext.isShared) {
									do_pdd_coupon_button_style = "";
								} else {
									// 简版
									var click_url = data.clickUrl.mobileUrl;
									$("#goto_buy_link_pdd").attr("click",click_url).show();
								}
								var coupon_link = "<div id=\"do_pdd_coupon_button_"+global_item_id+"\" class=\"d_coupon\" mobile_url=\""+data.clickUrl.mobileShortUrl+"\" _url=\""+data.clickUrl.url+"\""+do_pdd_coupon_button_style+">"
									+ is_price_title +"【<em>¥"+item.price+"元</em>】去拼多多购买</div>";
								$("#coupon_info_list").append(coupon_link);
								$("#do_pdd_coupon_button_"+global_item_id).click(function() {
									var mobile_url = $(this).attr("mobile_url");
									// Android
									if(typeof(android)!="undefined") {
										android.openUrl(mobile_url);
									} else {
										var url = $(this).attr("_url");
										// window.open(url);
										openWindow(url, "_blank");
									}
								});
								// 二维码
								var doQrCodeUrl = data.clickUrl.shortUrl;
								var qr_code_url = "http://qr.topscan.com/api.php?bg=ffffff&el=l&w=100&m=5&text="+encodeURIComponent(doQrCodeUrl);
								$(".qr_code_img").attr("src",qr_code_url).click(function(){
									if(typeof(android)=="undefined") {
										// window.open(doQrCodeUrl);
										openWindow(doQrCodeUrl, "_blank");
									}
								});
								// 分享文案
								var tmp_ajax_share_text = $("#item_share_text").val();
								tmp_ajax_share_text += "微信链接：\r\n";
								tmp_ajax_share_text += data.clickUrl.weAppWebViewShortUrl + "\r\n";
								tmp_ajax_share_text += "微博链接：\r\n";
								tmp_ajax_share_text += data.clickUrl.weiboAppWebViewShortUrl + "\r\n";
								tmp_ajax_share_text += "拼多多APP：\r\n";
								tmp_ajax_share_text += data.clickUrl.mobileShortUrl + "\r\n";
								tmp_ajax_share_text += "购买链接：\r\n";
								tmp_ajax_share_text += data.clickUrl.shortUrl + "\r\n";
								$("#item_share_text").val(tmp_ajax_share_text);
							}
						}
					});
					item_share_text += "【"+is_price_title+"】¥"+item.price+"元"+item_share_coupon+"\r\n━┉┉┉┉∞┉┉┉┉━\r\n";
					$("#item_share_text").val(item_share_text);
					adapt_sharetext_height();
					// =============================拼多多平台(END)==================================
				} else {
					// =============================淘宝/天猫平台==================================
					if(pageContext.isShared) {
						$("#tao_pwd_buy").show();
					}
					item_share_text += "【"+is_price_title+"】¥"+item.price+"元"+item_share_coupon+"\r\n━┉┉┉┉∞┉┉┉┉━\r\n";
					var buyUrl = encodeURIComponent(item.buyUrl);
					var picUrl = encodeURIComponent(item.picUrl);
					// 调用接口，获取口令
					$.ajax({
						url: serverUrl("guang/item/tbk/tpwd.html?id="+global_item_id+"&url="+buyUrl),
						type: 'GET',
						dataType: "jsonp",
						success: function (data) {
							if(data.tpwd!=undefined) {
								// 简版
								$("#goto_buy_link_tbk").attr("tpwd",data.tpwd).show();
								$(".gt_buy_loading").hide();
								// 多平台
								$("#tao_pwd_view").text(data.tpwd);
								var tpwd = data.tpwd.replace(/￥/g,"");
								var doQrCodeUrl = guangUrl("pwd.html?id="+global_item_id+"&pwd="+tpwd+"&gss=item"); //&pic=picUrl
								var qr_code_url = "http://qr.topscan.com/api.php?bg=ffffff&el=l&w=100&m=5&text="+encodeURIComponent(doQrCodeUrl);
								$(".qr_code_img").attr("src",qr_code_url).click(function(){
									if(typeof(android)=="undefined") {
										// window.open(doQrCodeUrl);
										openWindow(doQrCodeUrl, "_blank");
									}
								});
								$("#item_share_text").val(item_share_text+"复制本条("+tpwd+")去打开购物APP即可把我带回家。");
								adapt_sharetext_height();
							}
						}
					});
					
					// =============================淘宝/天猫平台(END)==================================
				}
				// 历史价格数据显示
				$.ajax({
					url: serverUrl("guang/item/historyPrices.html?id="+global_item_id+"&platform="+global_platform),
					type: 'GET',
					dataType: "jsonp",
					success: function (data) {
						if(data.historyPrices!=undefined) {
							if(data.price<=data.minPrice) {
								$("#item_price_icon").addClass("icon_price_min").show();
							} else if(data.price>=data.maxPrice) {
								$("#item_price_icon").addClass("icon_price_max").css("color","#3cd500").show();
							}
							historyPrices(data.historyPrices,data.price,data.maxPrice,data.minPrice);
						}
					}
				});
				//--历史价格--end--
				if(pageContext.isShared) {
					$("#item_share_text_view").show();
					$("#item_share_text_button").show();
					$("#item_again_load_button").show();
				}
			}
		}
		// textArea高度适应
		adapt_sharetext_height();
	}
	// 简版复制淘口令
	var tbk_clipboard = new ClipboardJS("#goto_buy_link_tbk", {
		text: function(content) {
			//console.log($(content).attr("tpwd"));
			return $(content).attr("tpwd");
		}
	});
	tbk_clipboard.on("success", function(e) {
		// 拷贝成功
		if(!$(e.trigger).hasClass("green")) {
			var cache_text = $(e.trigger).html();
			$(e.trigger).addClass("green").html("淘口令已复制");
			// 判断Android
			if(typeof(android)!="undefined") {
				if(global_platform!=undefined && $.trim(global_platform)!="") {
					// 通知APP打开购物APP
					android.openApp(global_platform);
				}
			}
			// 3秒后恢复
			setTimeout(function(){
				$(e.trigger).removeClass("green").html(cache_text);
			},3000);
		}
	});
	tbk_clipboard.on("error", function(e) {
		// 提示失败，手工拷贝
		// $(e.trigger).append("(失败)");
		// $(e.trigger).removeClass("green");
		// console.info("copy_error:"+e);
	});
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
			$(e.trigger).addClass("green").html("复制成功，打开购物APP购买");
			// 判断Android
			if(typeof(android)!="undefined") {
				if(global_platform!=undefined && $.trim(global_platform)!="") {
					// 通知APP打开购物APP
					android.openApp(global_platform);
				}
			}
			// 3秒后恢复
			setTimeout(function(){
				$(e.trigger).removeClass("green").html(cache_text);
			},3000);
		}
	});
	clipboard.on("error", function(e) {
		// 提示失败，手工拷贝
		// $(e.trigger).append("(失败)");
		// $(e.trigger).removeClass("green");
		// console.info("copy_error:"+e);
	});
	// 简版分享宝贝文案
	var clipboard_share_link = new ClipboardJS("#goto_share_link", {
		text: function(content) {
			return $("#item_share_text").val();
		}
	});
	clipboard_share_link.on("success", function(e) {
		// 拷贝成功
		if(!$(e.trigger).hasClass("copyed")) {
			var cache_text = $(e.trigger).html();
			$(e.trigger).addClass("copyed").html("<div class=\"font_icon gt_share_link_icon\"></div>已复制");
			// 3秒后恢复
			setTimeout(function(){
				$(e.trigger).removeClass("copyed").html(cache_text);
			},3000);
		}
	});
	clipboard_share_link.on("error", function(e) {
		// 提示失败，手工拷贝
		// $(e.trigger).append("(失败)");
		// $(e.trigger).removeClass("purple").addClass("blue");
		// console.info("copy_error:"+e);
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
			$(e.trigger).addClass("purple").html("复制成功，去粘贴分享文案");
			// 3秒后恢复
			setTimeout(function(){
				$(e.trigger).removeClass("purple").addClass("blue").html(cache_text);
			},3000);
		}
	});
	clipboard_share.on("error", function(e) {
		// 提示失败，手工拷贝
		// $(e.trigger).append("(失败)");
		// $(e.trigger).removeClass("purple").addClass("blue");
		// console.info("copy_error:"+e);
	});
	if(pathname=="/item.html") {
		// 滚动条加载商品数据
		$(window).scroll(function() {
			var items_box = $("#product_walls");
			var window_top = $(window).scrollTop();
			
			if(window_top>(items_box.offset().top+items_box.height()-1000) && pageContext.isLoaded && again_load) {
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
		var back_status = false;
		if(typeof(android)!="undefined") {
			back_status = android.itemBack();
		}
		if(!back_status) {
			// 阻止任何父类事件的执行
			event.stopPropagation();
			window.history.go(-1);
		}
	});
	$(".detail_head_bar .home_link").click(function(event){
		// 阻止任何父类事件的执行
		event.stopPropagation();
		addFavorite();
	});
	// 加载更多相似商品
	$("#goto_recoms_link").click(function() {
		$("div.detail_recoms").show();
		loadRecommends();
	});
	// 再逛一逛-加载
	$("#again_load_button").click(function() {
		$(this).parent().remove();
		$("div.detail_recoms").show();
		loadRecommends();
	});
	// 去京东购买
	$("#goto_buy_link_jd").click(function() {
		var click_url = $(this).attr("click");
		if(click_url!=undefined) {
			openWindow(click_url);
		}
	});
	// 去拼多多购买
	$("#goto_buy_link_pdd").click(function() {
		var click_url = $(this).attr("click");
		if(click_url!=undefined) {
			openWindow(click_url);
		}
	});
});
// itemShare textArea高度适应
function adapt_sharetext_height() {
	// 延时设置
	setTimeout(function(){
		var contextHeight = $("#item_share_text")[0].scrollHeight;
		$("#item_share_text").css("height",contextHeight);
	},1000);
}
// 根据设备尺寸重设img尺寸
function itemImgAddSuffix(src,platform) {
	if(src==undefined)
		return "";
	var newSrc = src;
	// 根据设备尺寸重设img后缀
	var win_width = $(window).width();
	if(platform==undefined || platform=="TB" || platform=="TM") {
		if(win_width<=400)
			newSrc += "_400x400.jpg";
		else if(win_width<=500)
			newSrc += "_500x500.jpg";
		else if(win_width<=600)
			newSrc += "_600x600.jpg";
		else
			newSrc += "_800x800.jpg";
	} else if(platform=="JD") {
		var tmp_width_str = "n12";
		if(win_width<=280)
			tmp_width_str = "n11";
		else if(win_width<=350)
			tmp_width_str = "n1";
		if(newSrc.indexOf(".com/ads/")>0) {
			newSrc = newSrc.replace(".com/ads/",".com/"+tmp_width_str+"/");
		}
	}
	return newSrc;
}
// Android页面加载完成后调用
function androidCallBack() {
	// CallBack

}
// load 相关宝贝推荐
function loadRecommends() {
	if(pageContext.pageNo<=pageContext.currentPageNo)
		return;
	var keyword = $("div.detail_title").text();
	var categoryName = $("#item_category_name").text();
	if($.trim(categoryName)!="")
		keyword = categoryName;
	// 设置加载中
	pageContext.isLoaded = false;
	$("#wall_loading").show();
	var load_url = "guang/item/recommends.html?kw="+ encodeURI(keyword) +"&page="+pageContext.pageNo; //&item_id=global_item_id
	$.ajax({
		url: serverUrl(load_url),
		type: 'GET',
		dataType: "jsonp",
		jsonpCallback: "showItems",
		success: function (data) {
			//console.info("success");
			//$("div.detail_recoms").show();
			again_load = true;
			var scroll_height = $(".detail_recoms").offset().top;
			$("body,html").animate({ scrollTop: scroll_height }, 500);
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
	var win_width = $(window).width()-15;
	// 报表
	$("#history_prices").highcharts({
		credits:{
			 enabled: false
		},
		chart : {
			type : "line",
			plotBorderColor: "#CCCCCC",
			plotBorderWidth: 1,
			//plotBackgroundColor: "#FFFFFF",
			//plotShadow: true,
			animation : Highcharts.svg,
			height : 300,
			width : win_width,
			events : {
				
			}
		},
		title : {
			text : "最高："+max_p+"元，最低："+min_p+"元，现在："+now_p+"元",
			style: {
				color: "#333333",
				fontWeight: "400",
				fontSize: "14px"
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
			gridLineColor: "#DDDDDD",
			gridLineDashStyle: "longdash",
			gridLineWidth: 1,
			type : "datetime",
			dateTimeLabelFormats: {
				millisecond: '%H:%M:%S.%L',
				second: '%H:%M:%S',
				minute: '%H:%M',
				hour: '%H:%M',
				day: '%m/%e',
				week: '%m/%e',
				month: '%Y/%m',
				year: '%Y'
			},
			tickPixelInterval : 100
		},
		yAxis : {
			gridLineColor: "#DDDDDD",
			gridLineDashStyle: "longdash",
			//minorGridLineColor: "#F0F0F0",
			//minorGridLineDashStyle: "longdash",
			//minorTickInterval: "auto",
			title : {
				text : undefined
			},
			plotLines : [ {
				value : 0,
				width : 2
			} ],
			max : y_max,
			min : y_min//,
			//tickInterval : y_tick
		},
		tooltip : {
			borderColor: "#666666",
			formatter : function() {
				return "<b>" + this.series.name + "</b><br/>"
						+ Highcharts.dateFormat("%Y-%m-%d %H:%M:%S", this.x) + "<br/>"
						+ Highcharts.numberFormat(this.y, 2) + "元";
			}
		},
		legend : {
			enabled : false,
			align: "center",
			verticalAlign: "bottom",
			x: 0,
			y: 0,
			borderColor : "#FFFFFF"
		},
		exporting : {
			enabled : false
		},
		series : [{
			name : "价格走势",
			color: "#FF6570",
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

