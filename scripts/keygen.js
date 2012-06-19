/// <reference path="/scripts/lib/jquery-1.7.2-vsdoc.js" />
/// <reference path="/scripts/lib/jquery.validate-vsdoc.js" /> 
/// <reference path="/scripts/lib/underscore.js" /> 

var allUpper = new Array('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z');
var allLower = new Array('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z');
var allNumber = new Array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9');
var allSymbol = new Array('!', '"', '#', '$', '%', '&', '`', '(', ')', '*', '+', ',', '-', '.', '/', ':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '_', '\'', '{', '|', '}', '~');

var subsetUpper = _.without(allUpper, 'I', 'O');
var subsetLower = _.without(allLower, 'l');
var subsetNumber = _.without(allNumber, '0', '1');
var subsetSymbol = _.without(allSymbol, '"', '`', ',', '.', ':', ';', '\'', '|');

var allCharacters = [];
allCharacters = allCharacters.concat(allUpper, allLower, allNumber, allSymbol);

var subsetCharacters = [];
subsetCharacters = subsetCharacters.concat(subsetUpper, subsetLower, subsetNumber, subsetSymbol);


$(function () {

	// Show/Hide custom length text box depending on selected value in dropdown list
	$('#keyLength').change(function () {
		$('#customKeyLengthSection').toggle($('#keyLength').val() === '0');
	});

	// Validation for the custom length textbox
	$("#generationForm").validate({
		highlight: function (element) {
			$(element).parents('.control-group').addClass('error');
		},

		unhighlight: function (element) {
			$(element).parents('.control-group').removeClass('error');
		},

		rules: {
			customKeyLength: { required: true, min: 10, max: 63 }
		},

		submitHandler: function () {
			var length = $('#keyLength').val() === '0' ? $('#customKeyLength').val() : $('#keyLength').val();
			var noAmbiguous = $('#noAmbiguous').attr('checked') === 'checked';
			var groupSimilar = $('#groupSimilar').attr('checked') === 'checked';
			var key = generateKey(length, noAmbiguous, groupSimilar);
			var hexKey = toHex(key);
			$('#rawKey').val(key);
			$('#hexKey').val(hexKey);
		}
	}); // .validate

});         // document.ready


function generateKey(length, noAmbiguous, groupSimilar) {
	if (groupSimilar) {
		return generateWithGroups(length, noAmbiguous);
	} else {
		var array = noAmbiguous ? subsetCharacters : allCharacters;
		return generate(length, array);
	}
}

function generateWithGroups(length, noAmbiguous) {
	// For 10 characters, set up groups of 2 characters
	// For 63 characters, groups of 6
	var charactersPerGroup = Math.floor(length / 4) - Math.floor(length / 6) + 1;
	var groupCount = Math.ceil(length / charactersPerGroup);
	var key = '';

	for (var i = 0; i < groupCount && key.length < length; ++i) {
		var array;
		switch (i % 4) {
			case 0:
				array = noAmbiguous ? subsetUpper : allUpper;
				break;
			case 1:
				array = noAmbiguous ? subsetLower: allLower;
				break;
			case 2:
				array = noAmbiguous ? subsetNumber : allNumber;
				break;
			case 3:
			default:
				array = noAmbiguous ? subsetSymbol : allSymbol;
				break;
		}

		// Request either the charactersPerGroup as length, or the number of characters we have left
		var chunkLength = key.length + charactersPerGroup <= length ? charactersPerGroup : length - key.length;
		key += generate(chunkLength, array);
	}
	
	return key;
}

function generate(length, array) {
	var key = '';

	for (var i = 0; i < length; ++i) {
		key += randomCharacter(array);
	}
	return key;
}

function randomCharacter(array) {
	return array[Math.floor(Math.random() * array.length)];
}

function toHex(str) {
	var hex = '';
	for (var i = 0; i < str.length; ++i) {
		hex += '' + str.charCodeAt(i).toString(16);
	}
	return hex;
}