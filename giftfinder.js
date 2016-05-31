(function() {
  	var bApp, SETTINGS_DEFAULTS;

  	SETTINGS_DEFAULTS = {
    	js : {
    		angular : 'https://ajax.googleapis.com/ajax/libs/angularjs/1.5.5/angular.min.js'
    	},
    	css: { 
    		font_awesome: 'https://maxcdn.bootstrapcdn.com/font-awesome/4.6.2/css/font-awesome.min.css',
    		bootstrap_custom : 'http://bicanc.github.io/giftfinder/css/bootstraping.css',
    		main : 'http://bicanc.github.io/giftfinder/css/packed_css.css'
    	}
  	};

  	bApp = function() {
    	this.settings = {};
    	return this;
  	};

  	bApp.prototype.start = function(settings) {
    	this.settings = (settings) ? settings : {};

    	for (var key in SETTINGS_DEFAULTS) {
    		if(key == 'js') {
    			for(var key2 in SETTINGS_DEFAULTS[key]) {
    				var type = key;
    				var library = key2;
    				this.required(library, type);
    			}
    		}
	   		if(key == 'css') {
    			for(var key2 in SETTINGS_DEFAULTS[key]) {
    				var type = key;
    				var library = key2;
    				this.required(library, type);
    			}
    		}
    	}

	    window.onload = (function() { // we have some plans about this
	      return function() {
	        var trigger;
	        trigger = new CustomEvent("bApp.loaded", { "detail": "loaded of course xD" });
	        document.dispatchEvent(trigger);
	        //angular.bootstrap(document, ['giftFinderApp']);
	      };
	    })(this);
	    return this;
  	};

  	bApp.prototype.getScript = function(source, callback) {
	    var script = document.createElement('script');
	    var prior = document.getElementsByTagName('script')[0];
	    script.async = 1;
	    prior.parentNode.insertBefore(script, prior);
	    script.onload = script.onreadystatechange = function( _, isAbort ) {
	        if(isAbort || !script.readyState || /loaded|complete/.test(script.readyState) ) {
	            script.onload = script.onreadystatechange = null;
	            script = undefined;
	            if(!isAbort) { if(callback) callback(); }
	        }
	    };
	    script.src = source;
	}
	bApp.prototype.getCss = function(source, callback) {
	    var head  = document.getElementsByTagName('head')[0];
	    var link  = document.createElement('link');
	    link.rel  = 'stylesheet';
	    link.type = 'text/css';
	    link.media = 'all';
	    link.onload = link.onreadystatechange = function( _, isAbort ) {
	        if(isAbort || !link.readyState || /loaded|complete/.test(link.readyState) ) {
	            link.onload = link.onreadystatechange = null;
	            link = undefined;

	            if(!isAbort) { if(callback) callback(); }
	        }
	    };
	    link.href = source;
	    head.appendChild(link);
	}

	bApp.prototype.required = function(name, type) { //name: angular, type: js
		if(type == 'js') {
			var angulared = false;
			if(name == 'angular' && typeof angular == 'undefined') { //js scripti
			    this.getScript(SETTINGS_DEFAULTS[type][name], function(){
					console.log('angular added');
			    });
			}
		}
		if(type == 'css') {
			this.getCss(SETTINGS_DEFAULTS[type][name], function(){
				console.log(SETTINGS_DEFAULTS[type][name]+' added');
		    });
		}
		//console.log('name: '+name+' type: ' + type);
	}
  	bApp.Constructor = bApp;
  	window.bApp = new bApp;
}).call(this);


document.addEventListener("bApp.loaded", function(e) { //this happened
  	console.log(e.detail); // loaded of course xD 
  	console.log(bApp.settings);
  	bApp.getScript('http://bicanc.github.io/giftfinder/app_external.js', function() { 
  		/*document.getElementsByTagName('bapp')[0].setAttribute('ng-controller', 'giftFinderApp');*/
  	});
});

window.bApp.start(bAppSettings);