"use strict";
/*
 * PlaylistToText (ExportToCSV Modification)
 * Original code by Scruteur (http://blog.geted.info/index.php?post/2012/08/10/Export-de-playlist-au-format-CSV-pour-Spotify)
 * Modifications by MiiG (MjK Web Services 2013)
 * Last edit: 14. December 2013
 */
$(document).ready(function() {
	$("#select_all").hide();
	$("#select_all").click(function() {
		$("#dropArea").select();
	});
	$("#dropArea").css({'background-image': 'url(img/spotex.png)'});

	var sp = getSpotifyApi();
	var models = sp.require('$api/models');
	var views = sp.require("$api/views");
	var playerImage = new views.Player();
	
	// ---- Convert number to char
	function getChar(num) {
		var charSt = "";
		if (num != "") {
			charSt = String.fromCharCode(num);
		}
		return charSt;
	}

	// ---- Convert default Spotify URL to URI
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
	
        drop.addEventListener('dragstart', function(e){
		e.dataTransfer.setData('text/html', this.innerHTML);
		e.dataTransfer.effectAllowed = 'copy';
        }, false);

        drop.addEventListener('dragenter', function(e){
		e.preventDefault();
		e.dataTransfer.dropEffect = 'copy';
		this.style.background = '#EEE';
		this.classList.add('over');
        }, false);

        drop.addEventListener('dragover', function(e){
		e.preventDefault();
		e.dataTransfer.dropEffect = 'copy';
		return false;
        }, false);

        drop.addEventListener('dragleave', function(e){
		e.preventDefault();
		this.style.background = '#FFF';
		this.classList.remove('over');
        }, false);

        drop.addEventListener('drop', function(e) {
			e.preventDefault();
			this.classList.remove('over');
			this.style.background = '#fff';
			var url = e.dataTransfer.getData('Text');
			var uri = getPlaylistURI(url);
			var fieldSep = $('#delimiter').val();
			var escChar = $('#textQualifier').val();
			var headerLine = $('#headerLine').prop('checked');
			var infoRow = $('#infoRow').prop('checked');
			var listColumn = $('#listColumn').prop('checked');
			var linkColumn = $('#linkColumn').prop('checked');
			var albumColumn = $('#albumColumn').prop('checked');
			var numberColumn = $('#numberColumn').prop('checked');
			var yearColumn = $('#yearColumn').prop('checked');
			var durationColumn = $('#durationColumn').prop('checked');
			var starredColumn = $('#starredColumn').prop('checked');
			var uriColumn = $('#uriColumn').prop('checked');
			$('#configuration').empty();
			$('#configuration').append('Options <img src="img/icon_foldMinus.png" />');
			$('#options_area').hide();
			$("#select_all").show();
			$('#dropArea').empty();

			var pl = models.Playlist.fromURI(uri, function(playlist) {
				console.log('Playlist ' + playlist.name + ' loaded');
			});
		
			if (pl != null) {
				var tracks = pl.tracks;
				var size = tracks.length;
				var i = -1;
				var line = '';
				
				// ---- HEADER LINE ----
				var header = "";
				
				if(numberColumn == true) {
					header += getChar(escChar)+"X. "+getChar(escChar)+getChar(fieldSep);
				}
				
				header += getChar(escChar)+"TRACK"+getChar(escChar)+" "+getChar(fieldSep)+" "+getChar(escChar)+"ARTIST"+getChar(escChar);
							
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
				header += "\n";
				
				if(infoRow == true) {
					line += "--- "+pl.name+"&nbsp;("+pl.length+" tracks, "+pl.subscriberCount+" subscribers) --- \n";
				}			
				if(listColumn == true) {
					line += "&lt;ol class=\"spotify_list\"&gt;";
				}
				
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
					}
					else {
						artistsStr = artists[0];
					}
					$('#playlistName').empty();
					$('#playlistName').append("Current playlist: " + pl.name + "<span id='playlistInfos'>&nbsp;(" + pl.length + " tracks, " + pl.subscriberCount + " subscribers)</span>");
					
					// ---- LINE ----
					if(listColumn == true) {
						line += "&lt;li&gt;";
					}
					if(numberColumn == true) {
						line += getChar(escChar)+(i+1)+". "+getChar(escChar);
					}
					if(linkColumn == true) {
						line += "&lt;a href=\""+tracks[i].uri+"\"&gt;";
					}
					
					line += getChar(escChar)+escapeChar(artistsStr, escChar)+getChar(escChar)+" "+getChar(fieldSep)+" ";
					line += getChar(escChar)+escapeChar(tracks[i].name, escChar)+getChar(escChar);		
								
					if(albumColumn == true) {
						line += getChar(fieldSep);
						line += getChar(escChar)+escapeChar(tracks[i].album.name, escChar)+getChar(escChar);
					}
					if(durationColumn == true) {
						line += getChar(fieldSep);
						line += getChar(escChar)+tracks[i].duration+getChar(escChar);
					}
					if(yearColumn == true) {
						line += getChar(fieldSep);
						line += getChar(escChar)+tracks[i].album.year+getChar(escChar);
					}
					if(starredColumn == true) {
						line += getChar(fieldSep);
						line += getChar(escChar)+getStarred(tracks[i].starred)+getChar(escChar);
					}
					if(uriColumn == true) {
						line += getChar(fieldSep);
						line += getChar(escChar)+tracks[i].uri+getChar(escChar);
					}
					if(linkColumn == true) {
						line += "&lt;/a&gt;";
					}
					if(listColumn == true) {
						line += "&lt;/li&gt;";
					} else {
						line += "\n";
					}
				}
				if(listColumn == true) {
					line += "&lt;/ol&gt;";
				}
				if(headerLine == true) {
					line = header+line;
				}
				$('#dropArea').append(line);
			}
        }, false);
});
