"use strict";
/* Playlist To Text
 * Original code by Scruteur
 * Modifications by MiiG
 *
 */
$(document).ready(function() {

// Hide elements
	$(".selector_label input[type=checkbox], .selector_label input[type=radio]").css({'visibility':'hidden'});
	$("#number_style_group, #duration_style_group, #select_all, #update").hide();
	
// DropArea autoheight
	$("#dropArea").autosize();
	$("#dropArea").attr("readonly", true);

// Select exported content
	$("#select_all").click(function() {
		$("#dropArea").select();
	});
	
// Interactive checkbox
	$(".selector_label").mouseup(function() {
	
		var curr_status = $(this).hasClass("selector_label_checked");
		var curr_radio_delimiter = $(this).hasClass("selector_radio_delimiter");
		var curr_radio_qualifier = $(this).hasClass("selector_radio_qualifier");
		var curr_radio_numberstyle = $(this).hasClass("selector_radio_numberstyle");
		var curr_radio_durationstyle = $(this).hasClass("selector_radio_durationstyle");
		
		var remove_check = true;
		
		if(curr_radio_delimiter == true) {
			$(".selector_radio_delimiter").removeClass("selector_label_checked");
			remove_check = false;
		}
		if(curr_radio_qualifier == true) {
			$(".selector_radio_qualifier").removeClass("selector_label_checked");
			remove_check = false;
		}
		if(curr_radio_numberstyle == true) {
			$(".selector_radio_numberstyle").removeClass("selector_label_checked");
			remove_check = false;
		}
		if(curr_radio_durationstyle == true) {
			$(".selector_radio_durationstyle").removeClass("selector_label_checked");
			remove_check = false;
		}	
		
		if(remove_check == true && curr_status == true) {
			$(this).removeClass("selector_label_checked");
		} else {
			$(this).addClass("selector_label_checked");
		}
		
	});
	
	$("#numberColumn").click(function() {
		$("#number_style_group").toggle();
	});
	$("#durationColumn").click(function() {
		$("#duration_style_group").toggle();
	});
	
// Add background to drop area
	$("#dropArea").css({ 'background' : '#222 url(img/dragdrop_text.png) 40px 25px no-repeat' });

	var sp = getSpotifyApi();
	var models = sp.require('$api/models');
	var views = sp.require("$api/views");
	var playerImage = new views.Player();
	
// Convert number to char
	function getChar(num) {
		if(num=="") {
			return "";
		}
		var charSt = "";
		if (num != "") {
			charSt = String.fromCharCode(num);
		}
		
// Add space if needed
		var spacebarColumn = $('#spacebarColumn').prop('checked');
		if(spacebarColumn==false) {
			charSt = ' '+charSt+' ';
		}
		return charSt;
	}

// Convert default Spotify URL to URI
	function getPlaylistURI(url) {
		var reg = new RegExp("/", "g");
		var parts = url.split(reg);
		return 'spotify:user:'+ parts[4]+':playlist:'+parts[6];
	}

	function getStarred(starred) {
		var s = '';
		if (starred == true) {
			s = '*';
		}
		return s;
	}

	function escapeChar(text, escChar) {
		var esc = getChar(escChar);
		var tOut = (text + '');
		// Single quote
		if (esc == "'") {
			var reg1 = new RegExp("(&apos;|')", "gi");
			tOut = (text +'').replace(reg1, "''");
		}
		// Double quote
		else if (esc == '"') {
			var reg1 = new RegExp("(&quot;|\")", "gi");
			tOut = (text +'').replace(reg1, '""');
		}
		
		return tOut;
	}
	
// http://stackoverflow.com/questions/8211744/convert-milliseconds-or-seconds-into-human-readable-form
	function millisecondsToString(milliseconds, style) {
// Styles A: X:YY, B: X minutes Y seconds, C: Xm Ys, D: X,YYm, E: YYY seconds, F: ZZZms

		var seconds = milliseconds/1000;
		var numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
		var numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
		var numseconds = (((seconds % 31536000) % 86400) % 3600) % 60;

		if(style=="A") {
			return numminutes+":"+numseconds;
		} else if(style=="B") {
			return numminutes+" minutes "+numseconds+" seconds";
		} else if(style=="C") {
			return numminutes+"m "+numseconds+"s";
		} else if(style=="D") {
			return (Math.round((seconds/60)*100)/100)+"m";
		} else if(style=="E") {
			return seconds+"s";
		} else if(style=="F") {
			return milliseconds+"ms";
		}
	}
	
// Playlist main generation
	function generatePlaylistToText(url, uri) {
		var fieldSep = $('.delimiter:checked').val();
		var escChar = $('.textQualifier:checked').val();
		var headerLine = $('#headerLine').prop('checked');
		var infoRow = $('#infoRow').prop('checked');
		var artistColumn = $('#artistColumn').prop('checked');
		var trackColumn = $('#trackColumn').prop('checked');
		var listColumn = $('#listColumn').prop('checked');
		var linkColumn = $('#linkColumn').prop('checked');
		var albumColumn = $('#albumColumn').prop('checked');
		var numberColumn = $('#numberColumn').prop('checked');
		var numberStyleColumn = $('.numberStyleColumn:checked').val();
		var durationStyleColumn = $('.durationStyleColumn:checked').val();
		var yearColumn = $('#yearColumn').prop('checked');
		var durationColumn = $('#durationColumn').prop('checked');
		var starredColumn = $('#starredColumn').prop('checked');
		var uriColumn = $('#uriColumn').prop('checked');
		var weburiColumn = $("#weburiColumn").prop('checked');
		var linebreakColumn = $('#linebreakColumn').prop('checked');
// Prehide		
		$('#configuration').empty();
		$('#configuration').append('Options <img src="img/icon_foldMinus.png" />');
		$('#options_area').hide();
		$("#update").show();
		$("#select_all").show();
		$('#dropArea').empty();	
// Write playlist name to console
		var pl = models.Playlist.fromURI(uri, function(playlist) {
			console.log('Playlist ' + playlist.name + ' loaded');
		});
// If we have a playlist
		if (pl != null) {
			var tracks = pl.tracks;
			var size = tracks.length;
			var i = -1;
			var line = '';
// Header
			var header = "";
// Get number style to header
			var header_number_endfix = "";
			if(numberStyleColumn=="A") {
				header_number_endfix = " ";
			} else if(numberStyleColumn=="B") {
				header_number_endfix = ". ";
			} else if(numberStyleColumn=="C") {
				header_number_endfix = ") ";
			}
// How we show number on header
			if(numberColumn == true) {
				header += getChar(escChar)+"X"+header_number_endfix+getChar(escChar);
				if(numberStyleColumn=="Z") {
					header += getChar(fieldSep);
				}
			}
// Rest of the header		
			header += getChar(escChar)+"TRACK"+getChar(escChar)+getChar(fieldSep)+getChar(escChar)+"ARTIST"+getChar(escChar);
			
			if(albumColumn == true) {
				header += getChar(fieldSep)+getChar(escChar)+"ALBUM"+getChar(escChar);
			}
			if(durationColumn == true) {
				header += getChar(fieldSep)+getChar(escChar)+"DURATION"+getChar(escChar);
			}
			if(yearColumn == true) {
				header += getChar(fieldSep)+getChar(escChar)+"YEAR"+getChar(escChar);
			}
			if(starredColumn == true) {
				header += getChar(fieldSep)+getChar(escChar)+"STAR"+getChar(escChar);
			}
			if(uriColumn == true) {
				header += getChar(fieldSep)+getChar(escChar)+"SPOTIFY URL"+getChar(escChar);
			}
			if(weburiColumn == true) {
				header += getChar(fieldSep)+getChar(escChar)+"SPOTIFY WEB URL"+getChar(escChar);
			}
			
			header += "\n";
// Playlist information is after header and before playlist content			
			if(infoRow == true) {
				line += "--- "+pl.name+"&nbsp;("+pl.length+" tracks, "+pl.subscriberCount+" subscribers) --- \n";
			}			
			if(listColumn == true) {
				line += "&lt;ol class=\"spotify_list\"&gt;";
			}

// Go thru all tracks		
			while(++i < size) {
				var artists = tracks[i].artists;
				var aSize = artists.length;
				var artistsStr = '';
				var j = -1;
				if (aSize > 1) {
					while(++j < aSize) {
						artistsStr += artists[j] + ', ';
					}
					artistsStr = artistsStr.slice(0, -2);
				} else {
					artistsStr = artists[0];
				}
				
				$('#playlistName').empty();
				$('#playlistName').append(pl.name + "<span id='playlistInfos'>&nbsp;(" + pl.length + " tracks, " + pl.subscriberCount + " subscribers)</span>");
// Playlist fields
				if(listColumn == true) {
					line += "&lt;li&gt;";
				}
				if(numberColumn == true) {
					line += getChar(escChar)+(i+1)+header_number_endfix+getChar(escChar);
					if(numberStyleColumn=="Z" && (artistColumn == true || trackColumn == true)) {
						line += getChar(fieldSep);
					}
				}
				if(linkColumn == true) {
					line += "&lt;a href=\""+tracks[i].uri+"\"&gt;";
				}
				if(artistColumn == true) {
					line += getChar(escChar)+escapeChar(artistsStr, escChar)+getChar(escChar);
				}
				if(artistColumn == true && trackColumn == true) {
					line += getChar(fieldSep);
				}
				if(trackColumn == true) {
					line += getChar(escChar)+escapeChar(tracks[i].name, escChar)+getChar(escChar);		
				}
				if(albumColumn == true) {
					line += getChar(fieldSep);
					line += getChar(escChar)+escapeChar(tracks[i].album.name, escChar)+getChar(escChar);
				}
				if(durationColumn == true) {
					var duration = millisecondsToString(tracks[i].duration, durationStyleColumn);
					line += getChar(fieldSep);
					line += getChar(escChar)+duration+getChar(escChar);
				}
				if(yearColumn == true) {
					line += getChar(fieldSep);
					line += getChar(escChar)+tracks[i].album.year+getChar(escChar);
				}
				if(starredColumn == true) {
					line += getChar(fieldSep);
					line += getChar(escChar)+getStarred(tracks[i].starred)+getChar(escChar);
				}
// spotify:track:[ID]
				if(uriColumn == true) {
					line += getChar(fieldSep);
					line += getChar(escChar)+tracks[i].uri+getChar(escChar);
				}
// http://open.spotify.com/track/[ID]
				if(weburiColumn == true) {
					var weburl = tracks[i].uri.replace("spotify:track:", "http://open.spotify.com/track/");
					line += getChar(fieldSep);
					line += getChar(escChar)+weburl+getChar(escChar);			
				}
				if(linkColumn == true) {
					line += "&lt;/a&gt;";
				}
				if(listColumn == true) {
					line += "&lt;/li&gt;";
				} else {
				
					if(linebreakColumn == false) {
						line += "\n";
					} else {
					
						if(tracks[i+1] != null) {
							line += ", ";
						}
					}
				}
			}
			if(listColumn == true) {
				line += "&lt;/ol&gt;";
			}
			if(headerLine == true) {
				line = header+line;
			}
			
			return line;
		}
	}
	
	$("#configuration").live("click", function(){
		if($("#options_area").css("display") == "none") {
			$("#options_area").show("fast","linear");
			$('#configuration').empty();
			$('#configuration').append('Options <img src="img/icon_foldPlus.png" />');
		}
		else {
			$("#options_area").hide("fast","linear");
			$('#configuration').empty();
			$('#configuration').append('Options <img src="img/icon_foldMinus.png" />');
		}
	});
	
	var drop = document.querySelector('#dropArea');

	drop.addEventListener(
		'dragstart'
		,function(e) {
			e.dataTransfer.setData('text/html', this.innerHTML);
			e.dataTransfer.effectAllowed = 'copy';
			$("#dropArea").attr("readonly", true);
			$("#dropArea").css({ 'background' : '#333' });
		}
		,false
	);

	drop.addEventListener(
		'dragenter'
		,function(e) {
			e.preventDefault();
			e.dataTransfer.dropEffect = 'copy';
			this.classList.add('over');
			$("#dropArea").attr("readonly", true);
			$("#dropArea").css({ 'background' : '#333' });
		}
		,false
	);

	drop.addEventListener(
		'dragover'
		,function(e) {
			e.preventDefault();
			e.dataTransfer.dropEffect = 'copy';
			$("#dropArea").attr("readonly", true);
			$("#dropArea").css({ 'background' : '#333' });
			return false;
		}
		,false
	);

	drop.addEventListener(
		'dragleave'
		,function(e) {
			e.preventDefault();
			this.classList.remove('over');
		}
		,false
	);

	drop.addEventListener('drop', function(e) {
		e.preventDefault();
		
		this.classList.remove('over');
		var url = e.dataTransfer.getData('Text');
		var uri = getPlaylistURI(url);
		
		$("#current_playlist_url").val(url);
		$("#current_playlist_uri").val(uri);
		
		$('#dropArea').append(generatePlaylistToText(url, uri));
		
// Autosize DropArea
		$("#dropArea").attr("readonly", false);
		$("#dropArea").trigger('autosize.resize');
		
	}, false);
	
// Update
	$("#base").on("click", "#update", function() {
		var url = $("#current_playlist_url").val();
		var uri = $("#current_playlist_uri").val();
		$("#dropArea").append(generatePlaylistToText(url, uri));
		$("#dropArea").trigger('autosize.resize');
		$("#dropArea").attr("readonly", false);
		
	});
});