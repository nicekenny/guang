var dialogLayer = function() {

	var title;
	var maskDiv, dialogDiv;

	this.getDialog = function() {
		return dialogDiv;
	}
	
	this.open = function(title, width, height) {
		if (!maskDiv)
			createMask();
		var content = createDialog(title, width, height);
		return content;
	}

	this.close = function() {
		remove();
	}

	var createDialog = function(title, width, height) {
		var dialogLayer = document.createElement("div");
		var dialogTitle = document.createElement("div");
		var closeDialog = document.createElement("span");
		var dialogTitleText = document.createElement("span");
		var dialogContent = document.createElement("div");
		dialogLayer.className = "dialogLayer";
		var dlr_left = (document.documentElement.clientWidth / 2) - (width / 2);
		var dlr_top = (document.documentElement.clientHeight / 2) - (height / 2);
		dlr_left = dlr_left < 0 ? 0 : dlr_left;
		dlr_top = dlr_top < 0 ? 0 : dlr_top;
		dialogLayer.style.left = dlr_left + "px";
		dialogLayer.style.top = dlr_top + "px";
		dialogLayer.style.zIndex = "1000000001";
		dialogLayer.style.width = width + "px";
		dialogLayer.style.height = height + "px";
		dialogTitle.className = "dialogTitle";
		var moveable = false, mx, my, dleft, dtop;
		dialogTitle.onmousedown = function(e) {
			moveable = true;
			mx = e.clientX;
			my = e.clientY;
			dleft = dialogLayer.offsetLeft;
			dtop = dialogLayer.offsetTop;
		};
		document.onmousemove = function(e) {
			e = e ? e : (window.event ? window.event : null);
			if (moveable) {
				var tmp_dlr_left = dleft + (e.clientX - mx);
				var tmp_dlr_top = dtop + (e.clientY - my);
				tmp_dlr_left = tmp_dlr_left < 0 ? 0 : tmp_dlr_left;
				tmp_dlr_top = tmp_dlr_top < 0 ? 0 : tmp_dlr_top;
				dialogLayer.style.left = tmp_dlr_left + "px";
				dialogLayer.style.top = tmp_dlr_top + "px";
			}
		};
		dialogTitle.onmouseup = function(e) {
			moveable = false;
		};
		closeDialog.className = "closeDialog";
		closeDialog.onclick = function() {
			remove();
		};
		dialogTitleText.className = "dialogTitleText";
		dialogTitleText.innerHTML = title;
		dialogContent.className = "dialogContent";
		dialogContent.style.height = (height - 30) + "px";
		dialogTitle.appendChild(closeDialog);
		dialogTitle.appendChild(dialogTitleText);
		dialogLayer.appendChild(dialogTitle);
		dialogLayer.appendChild(dialogContent);
		document.body.appendChild(dialogLayer);
		dialogDiv = dialogLayer;
		return dialogContent;
	}

	var createMask = function() {
		var mask = document.createElement("div");
		mask.style.margin = "0px";
		mask.style.padding = "0px";
		mask.style.border = "0px none";
		mask.style.backgroundColor = "rgb(100, 100, 100)";
		mask.style.backgroundImage = "none";
		mask.style.position = "absolute";
		mask.style.zIndex = "1000000000";
		mask.style.top = "0px";
		mask.style.left = "0px";
		mask.style.opacity = "0.7";
		mask.style.width = "100%";
		mask.style.height = document.body.scrollHeight + "px";
		document.body.appendChild(mask);
		maskDiv = mask;
	}

	var remove = function() {
		if (dialogDiv) {
			document.body.removeChild(dialogDiv);
			dialogDiv = undefined;
		}
		if (maskDiv) {
			document.body.removeChild(maskDiv);
			maskDiv = undefined;
		}
	}

}


// Sc Dialog 
function ScDialog(basePath) {
	var path = basePath;
	if (path.lastIndexOf("/") != path.length - 1) {
		path = path + "/";
	}

	var dialogKey;
	var dialogUrl;
	var dialogTitle;
	var maskDiv, frameDiv, dialogDiv;

	this.openFrame = function(title, url, width, height) {
		this.open("frame", title, url, width, height);
	}

	this.openDiv = function(title, width, height) {
		this.open("div", title, null, width, height);
	}

	this.open = function(type, title, url, width, height) {
		if (frameDiv)
			return;
		dialogUrl = url;
		dialogTitle = title;
		if (!maskDiv)
			createMask();
		var key = "scdg" + Math.random();
		if(type=="div") {
			var scdg_div = createDiv(key, width, height);
		} else if(type=="frame") {
			var scdg_frame = createFrame(key, width, height);
		}
		var ditem = new Array();
		ditem[0] = key;
		ditem[1] = this;
		ScDialog.array[ScDialog.array.length] = ditem;
		dialogKey = key;
	}

	this.close = function() {
		if (frameDiv) {
			document.body.removeChild(frameDiv);
			frameDiv = undefined;
		}
		if (maskDiv) {
			document.body.removeChild(maskDiv);
			maskDiv = undefined;
		}
		for ( var i = 0; i < ScDialog.array.length; i++) {
			var ditem = ScDialog.array[i];
			if (ditem.length == 2 && ditem[0] == dialogKey) {
				ScDialog.array.remove(i);
			}
		}
	}

	this.show = function() {
		if (maskDiv) {
			maskDiv.style.display = "block";
		}
		if (frameDiv) {
			frameDiv.style.display = "block";
		}
	}

	this.hide = function() {
		if (maskDiv) {
			maskDiv.style.display = "none";
		}
		if (frameDiv) {
			frameDiv.style.display = "none";
		}
	}

	this.getUrl = function() {
		return dialogUrl;
	}

	this.getTitle = function() {
		return dialogTitle;
	}

	var createDiv = function(key, width, height) {

		var dialogLayer = document.createElement("div");
		var dialogTitle = document.createElement("div");
		var closeDialog = document.createElement("span");
		var dialogTitleText = document.createElement("span");
		var dialogContent = document.createElement("div");
		dialogLayer.className = "dialogLayer";
		var dlr_left = (document.documentElement.clientWidth / 2) - (width / 2);
		var dlr_top = (document.documentElement.clientHeight / 2) - (height / 2);
		dlr_left = dlr_left < 0 ? 0 : dlr_left;
		dlr_top = dlr_top < 0 ? 0 : dlr_top;
		dialogLayer.style.left = dlr_left + "px";
		dialogLayer.style.top = dlr_top + "px";
		dialogLayer.style.zIndex = "10001";
		dialogLayer.style.width = width + "px";
		dialogLayer.style.height = height + "px";
		dialogTitle.className = "dialogTitle";
		var moveable = false, mx, my, dleft, dtop;
		dialogTitle.onmousedown = function(e) {
			moveable = true;
			mx = e.clientX;
			my = e.clientY;
			dleft = dialogLayer.offsetLeft;
			dtop = dialogLayer.offsetTop;
		};
		document.onmousemove = function(e) {
			e = e ? e : (window.event ? window.event : null);
			if (moveable) {
				var tmp_dlr_left = dleft + (e.clientX - mx);
				var tmp_dlr_top = dtop + (e.clientY - my);
				tmp_dlr_left = tmp_dlr_left < 0 ? 0 : tmp_dlr_left;
				tmp_dlr_top = tmp_dlr_top < 0 ? 0 : tmp_dlr_top;
				dialogLayer.style.left = tmp_dlr_left + "px";
				dialogLayer.style.top = tmp_dlr_top + "px";
			}
		};
		dialogTitle.onmouseup = function(e) {
			moveable = false;
		};
		closeDialog.className = "closeDialog";
		closeDialog.onclick = function() {
			remove();
		};
		dialogTitleText.className = "dialogTitleText";
		dialogTitleText.innerHTML = title;
		dialogContent.className = "dialogContent";
		dialogContent.style.height = (height - 30) + "px";
		dialogTitle.appendChild(closeDialog);
		dialogTitle.appendChild(dialogTitleText);
		dialogLayer.appendChild(dialogTitle);
		dialogLayer.appendChild(dialogContent);
		document.body.appendChild(dialogLayer);
		dialogDiv = dialogLayer;
		return dialogContent;

	}

	var createFrame = function(key, width, height) {
		var frame = document.createElement("iframe");
		frame.src = path + "dialog.html?key=" + key;
		frame.frameborder = 0;
		frame.style.margin = "0px";
		frame.style.padding = "0px";
		frame.style.border = "0px none";
		frame.style.backgroundColor = "transparent";
		frame.style.backgroundImage = "none";
		frame.style.position = "fixed";
		frame.style.top = (document.documentElement.clientHeight / 2) - (height / 2) + "px";
		frame.style.left = (document.documentElement.clientWidth / 2) - (width / 2) + "px";
		frame.style.zIndex = "10001";
		frame.style.width = width + "px";
		frame.style.height = height + "px";
		document.body.appendChild(frame);
		frameDiv = frame;
		return frame;
	}

	var createMask = function() {
		var mask = document.createElement("div");
		// mask.id = "dialogMaskDiv";
		mask.style.margin = "0px";
		mask.style.padding = "0px";
		mask.style.border = "0px none";
		mask.style.backgroundColor = "rgb(255, 255, 255)";
		mask.style.backgroundImage = "none";
		mask.style.position = "absolute";
		mask.style.zIndex = "10000";
		mask.style.top = "0px";
		mask.style.left = "0px";
		mask.style.opacity = "0.5";
		mask.style.width = "100%";
		mask.style.height = document.body.scrollHeight + "px";
		document.body.appendChild(mask);
		maskDiv = mask;
	}

	this.callBack = function() {

	}

}
ScDialog.array = new Array();
ScDialog.get = function(key) {
	for ( var i = 0; i < ScDialog.array.length; i++) {
		var item = ScDialog.array[i];
		if (item[0] == key) {
			return item[1];
		}
	}
	return undefined;
};
Array.prototype.remove = function(index) {
	if (isNaN(index) || index > this.length) {
		return false;
	}
	for ( var i = 0, n = 0; i < this.length; i++) {
		if (this[i] != this[index]) {
			this[n++] = this[i];
		}
	}
	this.length -= 1;
}