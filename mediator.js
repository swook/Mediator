/* Mediator Plugin for Vanilla Forums by Seon-Wook Park | CC BY-NC-SA */

(function ($, undefined) {
	var width, height;

	$(document).ready(function() {
		setTimeout(Mediator, 0);
	});

	var urlcache = {};
	function parseURL(url) {
		if (!url) url = document.URL;
		if (url in urlcache) return urlcache[url];
		var urlo = (url == document.URL) ? document.location : $('<a href="'+url+'"/>')[0],
			urlp = {
				protocol: urlo.protocol.slice(0, urlo.protocol.length - 1),
				host: urlo.hostname,
				port: urlo.port,
				path: urlo.pathname,
				query: urlo.search,
				params: urlo.search.length ? (function() {
						var param = [], params = {};
						$.each(urlo.search.slice(1).split('&'), function(i, e) {
							if (e.length) {
								param = e.split('=');
								if (param.length > 1 && param[1].length) params[param[0]] = param[1];
							}
						});
						return params;
					}()) : {},
				file: (urlo.pathname.match(/\/([^\/?&]*)[^\/]*$/) || [,''])[1],
				hash: urlo.hash.length ? urlo.hash.slice(1) : '',
				relative: (urlo.href.match(/:\/\/[^\/]+(.*)$/) || [,''])[1],
				full: (urlo.href.match(/([^#]*)/) || [,''])[1],
				full_hash: urlo.href
			};
		if (url == urlo.href) urlcache[url] = urlp;
		if (urlo instanceof jQuery) urlo.remove();
		return urlp;
	};

	function Mediator () {
		var mlist = $('.MessageList .Message');
		if (mlist.width() < 640) {
			width = mlist.width() - 40;
			height = width * 0.5625;
		} else {
			width = 640;
			height = 360;
		}

		$('.Message a').each(Check);
		$('.MessageList').live('DOMNodeInserted', function(e) {
			if ($(e.target).hasClass('Comment')) {
				$('div.Message a', e.target).each(Check);
			}
		});

		var ytlist = $('.Message center.Youtube');
		if (ytlist.length > 0) {
			$.getScript('//www.youtube.com/iframe_api');
			ytlist.eq(0).addClass('YoutubeFocus').css('max-height', height+'px');
		}
	}

	function Check (i, elem) {
		var url = elem.href,
			$elem = $(elem);
			urlo = parseURL(url);

		if (urlo.full != parseURL($elem.html()).full) return;

		if (urlo.file.match(/\.(jpg|jpeg|png|gif)/i))
			return ReplaceImage(url, elem, $elem);

		if (urlo.host == 'imgur.com' || urlo.host == 'www.imgur.com') {
			var match = urlo.path.match(/\/a\/([\w]{5,7})$/);
			if (match) return ReplaceImgurGal(match[1], elem, $elem);

			var match = urlo.path.match(/([\w]{5,7})$/);
			if (match) return ReplaceImgur(match[1], elem, $elem);
        }
		
		if (urlo.host == 'gyazo.com' || urlo.host == 'www.gyazo.com') {
			var match = urlo.path.match(/\/a\/([\w]{32})$/);
			if (match) return ReplaceGyazoGal(match[1], elem, $elem);

			var match = urlo.path.match(/([\w]{32})$/);
			if (match) return ReplaceGyazo(match[1], elem, $elem);
        }

		if ((urlo.host == 'youtube.com' || urlo.host == 'www.youtube.com') && urlo.file == 'watch' && 'v' in urlo.params)
			return ReplaceYoutube(urlo.params.v, elem, $elem);

		if ((urlo.host == 'youtu.be' || urlo.host == 'www.youtu.be'))
			return ReplaceYoutube(urlo.file, elem, $elem);

		if (urlo.host == 'vimeo.com' || urlo.host == 'www.vimeo.com') {
			var match = urlo.file.match(/^([\d]{8})$/);
			if (match) return ReplaceVimeo(match[1], elem, $elem);
		}

		if (urlo.host == 'pastebin.com') {
			var match = urlo.file.match(/^([\w]{8})$/);
			if (match) return ReplacePastebin(match[1], elem, $elem);
			else if (urlo.file == 'raw.php' && 'i' in urlo.params) return ReplacePastebin(urlo.params.i, elem, $elem);
		}

		if (urlo.host == 'soundcloud.com') {
			var match = urlo.path.match(/^\/[^\/.]+\//);
			if (match) return ReplaceSoundcloud(url, elem, $elem);
		}

		if (urlo.host == 'snd.sc') {
			return ReplaceSoundcloud(url, elem, $elem);
		}

		if (urlo.host.match(/^bandcamp\.[^\.]+\.com$/i) || urlo.host.match(/^[^\.]+\.bandcamp\.com$/i)) {
			return ReplaceBandcamp(url, elem, $elem);
		}
	}

	function CommonSetting (newel, $elem, type) {
		newel.prop('width', width);
		newel.css('box-shadow', '0 0 2px #888');
		newel.css('-moz-box-shadow', '0 0 2px #888');
		newel.css('-webkit-box-shadow', '0 0 2px #888');
		$elem.addClass('Mediator');
		type = type ? ' '+ type : '';
		$elem.wrap('<center class="Mediator'+ type +'"/>');
		return;
	}

	function ReplaceImage (url, elem, $elem) {
		var newel = $('<img>');
		newel.prop('src', url);
		CommonSetting(newel, $elem, 'MediatorImage');
		$elem.replaceWith(newel);
		newel[0].onload = function() {
			this.removeAttribute('width');
			if (this.width > width) this.setAttribute('width', width+'px');
		};
	}
	function ReplaceImgur (hash, elem, $elem) {
		ReplaceImage('//i.imgur.com/'+ hash +'.png', elem, $elem);
		$.getJSON('//api.imgur.com/2/image/'+ hash, function (data) {
			$elem.unwrap();
			ReplaceImage(data.image.links.original, elem, $elem);
		});
	}
	function ReplaceImgurGal (hash, elem, $elem) {
		var newel = $('<iframe>');
		newel.prop('height',height);
		newel.prop('src', '//imgur.com/a/'+ hash+ '/embed')
		CommonSetting(newel, $elem, 'imgurGal');
		$elem.replaceWith(newel);
	}

	function ReplaceGyazo (hash, elem, $elem) {
		ReplaceImage('//i.gyazo.com/'+ hash +'.png', elem, $elem);
		$.getJSON('//api.gyazo.com/api/images/'+ hash, function (data) {
			$elem.unwrap();
			ReplaceImage(data.image.links.original, elem, $elem);
		});
	}
	function ReplaceGyazoGal (hash, elem, $elem) {
		var newel = $('<iframe>');
		newel.prop('height',height);
		newel.prop('src', '//i.gyazo.com/'+ hash+ '/embed')
		CommonSetting(newel, $elem, 'GyazoGal');
		$elem.replaceWith(newel);
	}
	
	function ReplaceYoutube (hash, elem, $elem) {
		var newel = $('<iframe allowfullscreen>'),
			id = 'YT_'+ hash +'_'+ (new Date).getTime();
		newel.prop('height', height);
		newel.prop('src', '//www.youtube.com/embed/'+ hash +'?rel=0&autoplay=1&theme=light&enablejsapi=1&width='+width+'&height='+height);
		newel.prop('frameborder', '0');
		newel.prop('id', id);
		newel.data('YTSetting', {
			id: id,
			videoId: hash,
			events: {
				onStateChange: YoutubePlayChange
			}
		});
		CommonSetting(newel, $elem, 'Youtube');
		$elem.height(height);
		$elem.parent().hover(function(e) {
			var $this = $(this);
			$this.css('max-height', height+'px');
			$this.addClass('YoutubeHover');
		}, function(e) {
			var $this = $(this);
			if (!$this.hasClass('YoutubeFocus')) $this.css('max-height', '80px');
			$this.removeClass('YoutubeHover');
		}).css('width', width);

		var lazyloader = $('<div class="lazyload"><div class="yt-title"/><div class="yt-button"/></div>');
		lazyloader.css('background-image', 'url(//images-focus-opensocial.googleusercontent.com/gadgets/proxy?url=http://i.ytimg.com/vi/'+ hash +'/hqdefault.jpg&container=focus&resize_w=642)');
		lazyloader.css('background-position', '0px '+(-height*0.17)+'px')
		lazyloader.css('background-size', width*1.003+'px '+width/1.33+'px')
		lazyloader.width(width);
		lazyloader.height(height);
		$('div.yt-button', lazyloader).css('top', (height-106)/2);
		lazyloader.click(function(e) {
			var $this = $(this);
			$this.parent().addClass('YoutubeFocus').css('max-height', height+'px');
			$this.replaceWith(newel);
			if (YouTubeIframeAPIReady) YoutubeRegisterPlayer(id);
		})
		$.getJSON('//gdata.youtube.com/feeds/api/videos/'+ hash +'?v=2&alt=json-in-script&callback=?', function (data) {
			var ltitle = $('div.yt-title', lazyloader);
			ltitle.html(data.entry.title.$t);
			ltitle.click(function(e) {
				window.open('//www.youtube.com/watch?v='+hash, '_blank');
				e.stopPropagation();
			});
		});
		$elem.replaceWith(lazyloader);
	}
	function YoutubeRegisterPlayer (id) {
		var $el = $('#'+ id);
			settings = $el.data('YTSetting'),
			player = new YT.Player(id, settings);
		$el.data('YTPlayer', player);
		player.setPlaybackQuality('hd720');
	}
	function YoutubePlayChange (event) {
		if (event.data == YT.PlayerState.PLAYING) {
			var par = $(event.target.a).parent();
			if (!event.target.PQ_set) {
				var qlist = event.target.getAvailableQualityLevels(), page;
				if ($.inArray('hd720', qlist) > -1) event.target.setPlaybackQuality('hd720');
				else if ($.inArray('large', qlist) > -1) event.target.setPlaybackQuality('large');
				event.target.PQ_set = true;

				if ($.browser.webkit) page = $('body');
				else page = $('html,body');
				page.stop().animate(
					{
						scrollTop: (parseInt(par.offset().top) - (parseInt($(window).height()) - height)/2)
					},
					750
				);
			}
			par.addClass('YoutubeFocus');
		}
		else if (event.data == YT.PlayerState.ENDED) {
			var ifr = $(event.target.a),
				par = ifr.parent(),
				YTList = $('center.Youtube'),
				YTidx = $.inArray(par[0], YTList);

			event.target = null;
			par.removeClass('YoutubeFocus');
			if (!par.hasClass('YoutubeHover')) {
				par.css('max-height', '80px');

				setTimeout(function() {
					ifr.unwrap();
					ReplaceYoutube(ifr.data('YTSetting').videoId, ifr[0], ifr);
				}, 500);
			}

			// Disable continuous Youtube playback for now
			// if (YTidx < YTList.length - 1) {
			// 	var newYT = YTList.eq(YTidx + 1);
			// 	if (newYT.hasClass('YoutubeFocus')) $('iframe', newYT).data('YTPlayer').playVideo();
			// 	else $('div.lazyload', newYT).click();
			// }
		}
	}
	var YouTubeIframeAPIReady;
	window.onYouTubeIframeAPIReady = function () {
		$('center.Youtube iframe').each(function(i, el) {
			YoutubeRegisterPlayer(el.getAttribute('id'));
		});
		YouTubeIframeAPIReady = true;
	}

	function ReplaceVimeo (hash, elem, $elem) {
		var newel = $('<iframe allowfullscreen>');
		newel.prop('height', height);
		newel.prop('src', '//player.vimeo.com/video/'+ hash +'?portrait=0&amp;color=ffffff');
		newel.prop('frameborder', '0');
		CommonSetting(newel, $elem, 'Vimeo');
		$elem.replaceWith(newel);
	}

	function ReplacePastebin (hash, elem, $elem) {
		var newel = $('<iframe>');
		newel.prop('height', height);
		newel.prop('src', '//pastebin.com/embed_iframe.php?i='+ hash);
		CommonSetting(newel, $elem, 'Pastebin');
		$elem.replaceWith(newel);
	}

	function ReplaceSoundcloud (url, elem, $elem) {
		$.getJSON(
			'//soundcloud.com/oembed?callback=?',
			{
				format: 'js',
				url: url,
				iframe: true
			},
			function (data) {
				var newel = $(data.html);
				CommonSetting(newel, $elem, 'Soundcloud');
				$elem.replaceWith(newel);
			}
		).error(function() {
			ReplaceSoundcloud(url, elem, $elem);
		});
	}

	function ReplaceBandcamp (url, elem, $elem) {
		$.getJSON(
			'//api.bandcamp.com/api/url/1/info?key=thrjozkaskhjastaurrtygitylpt&url='+ encodeURIComponent(url) + '&callback=?',
			function (data) {
				var mid, mclass;
				if ("track_id" in data) {
					mclass = 'BCtrack';
					mid = '/track='+ data.track_id +'/size=venti/';
				}
				else if ("album_id" in data) {
					mclass = 'BCalbum';
					mid = '/album='+ data.album_id +'/size=grande3/';
				}
				else return;
				var newel = $('<iframe src="//bandcamp.com/EmbeddedPlayer/v=2'+ mid +'bgcol=FFFFFF/linkcol=151/" allowtransparency="true" >');
				CommonSetting(newel, $elem, 'Bandcamp '+ mclass);
				$elem.replaceWith(newel);
			}
		).error(function() {
			ReplaceBandcamp(url, elem, $elem);
		});
	}
}(jQuery));
