/*****************************************************************************************
 * X2CRM Open Source Edition is a customer relationship management program developed by
 * X2Engine, Inc. Copyright (C) 2011-2013 X2Engine Inc.
 * 
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License version 3 as published by the
 * Free Software Foundation with the addition of the following permission added
 * to Section 15 as permitted in Section 7(a): FOR ANY PART OF THE COVERED WORK
 * IN WHICH THE COPYRIGHT IS OWNED BY X2ENGINE, X2ENGINE DISCLAIMS THE WARRANTY
 * OF NON INFRINGEMENT OF THIRD PARTY RIGHTS.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more
 * details.
 * 
 * You should have received a copy of the GNU Affero General Public License along with
 * this program; if not, see http://www.gnu.org/licenses or write to the Free
 * Software Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA
 * 02110-1301 USA.
 * 
 * You can contact X2Engine, Inc. P.O. Box 66752, Scotts Valley,
 * California 95067, USA. or at email address contact@x2engine.com.
 * 
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 * 
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "Powered by
 * X2Engine" logo. If the display of the logo is not reasonably feasible for
 * technical reasons, the Appropriate Legal Notices must display the words
 * "Powered by X2Engine".
 *****************************************************************************************/


var DEBUG = true;//thisX2Chart.DEBUG;

/*
Removes an error div created by createErrorBox ().  
Parameters:
	parentElem - a jQuery element which contains the error div
*/
function destroyErrorBox (parentElem) {
	var $errorBox = $(parentElem).find ('.error-summary-container');
	if ($errorBox.length !== 0) {
		$errorBox.remove ();
	}
}

/*
Returns a jQuery element corresponding to an error box. The error box will
contain the specified errorHeader and a bulleted list of the specified error
messages.
Parameters:
	errorHeader - a string
	errorMessages - an array of strings
*/
function createErrorBox (errorHeader, errorMessages) {
	var errorBox = $('<div>', {'class': 'error-summary-container'}).append (
		$("<div>", { 'class': "error-summary"}).append (
			$("<p>", { text: errorHeader }),
			$("<ul>")
	));
	for (var i in errorMessages) {
		var msg = errorMessages[i];
		$(errorBox).find ('.error-summary').
			find ('ul').append ($("<li> " + msg + " </li>"));
	}
	return errorBox;
}




var MSPERHOUR = 3600 * 1000;
var MSPERDAY = 86400 * 1000;
var MSPERWEEK = 7 * 86400 * 1000;


function X2Chart (argsDict) {

	this.chartType = argsDict['chartType'];
	this.chartSubtype = argsDict['chartSubtype'];
	this.actionParams = argsDict['actionParams'];
	this.actionsStartDate = argsDict['actionsStartDate'];
	this.chartData = argsDict['chartData'];
	this.getChartDataActionName = argsDict['getChartDataActionName'];
	this.hideByDefault = argsDict['hideByDefault'];
	this.suppressChartSettings = argsDict['suppressChartSettings'];
	this.translations = argsDict['translations'];


	this.eventData = null; // the ajax returned data to plot
	this.feedChart = null; // the jqplot chart object
	this.cookiePrefix = this.chartType; // used to differentiate chart settings

	var thisX2Chart = this;


	DEBUG && console.log ('set cookiePrefix to ' + this.cookiePrefix);

	if (this.chartSubtype === 'multiLine') {
		var colors;
		if (this.chartType === 'recordView') {	
	
			// color palette used for lines of action history chart
	        colors = [
				'#7EB2E6', // pale blue
				'#CEC415', // mustard
				'#BC0D2C', // pomegranate
				'#45B41D', // apple green
				'#AB074F', // dark hot pink
				//'#156A86', // dark blue
				'#1B8FB5', // dark blue
				'#3D1783', // dark purple
				//'#5A1992',// deep purple
				'#AACF7A',
				'#7BB57C', // olive green
				//'#69B10A', // dark lime green
				//'#8DEB10',
				'#C87010', // red rock
				'#1D4C8C', // dark blue-purple
				'#FFC382',
				'#FFF882',
				'#FF9CAD',
				'#BAFFA1',
				//'#CA8613', // orange brown
				//'#C6B019', // dark sand
				'#19FFF4',
				'#A4F4FC',
				'#99C9FF',
				'#FFA8CE',
				'#D099FF',
				'#E1A1FF',
			];
		} else if (this.chartType === 'eventsChart' || this.chartType === 'usersChart') {	

			// color palette used for lines of feed chart
	        colors = [
				'#7EB2E6', // pale blue
				'#FFC382', // pastel orange
				'#E8E172', // pastel yellow
				'#FF9CAD', // pastel pink
				'#BAFFA1', // pastel green
				//'#CA8613', // orange brown
				//'#C6B019', // dark sand
				'#94E3DF', // pastel light blue
				'#56D6E3', // pastel mid blue
				'#99C9FF', // pastel dark blue
				'#FFA8CE', // pastel dark pink
				'#D099FF', // pastel dark purple
				'#E1A1FF', // pastel light purple
				'#CEC415', // mustard
				'#BC0D2C', // pomegranate
				'#45B41D', // apple green
				'#AB074F', // dark hot pink
				//'#156A86', // dark blue
				'#1B8FB5', // dark blue
				'#3D1783', // dark purple
				//'#5A1992',// deep purple
				'#AACF7A',
				'#7BB57C', // olive green
				//'#69B10A', // dark lime green
				//'#8DEB10',
				'#C87010', // red rock
				'#1D4C8C', // dark blue-purple
			];
		}

		this.metricOptionsColors = {}; // used to pair colors with metrics
		$('#' + this.chartType + '-first-metric').find ('option').each (function () {
			thisX2Chart.metricOptionsColors[$(this).val ()] = colors.shift ();
		});
	}



	if (thisX2Chart.chartType === 'recordView') {
		$('#' + thisX2Chart.chartType + '-chart-container #' + thisX2Chart.chartType + 
		  '-rel-chart-data-checkbox').on ('change', function () {
		  	DEBUG && console.log ('checked rel checkbox');
			if (this.checked) {
				thisX2Chart.actionParams['showRelationships'] = 'true';
				thisX2Chart.getEventsBetweenDates (true);
				$.cookie (thisX2Chart.cookiePrefix + 'showRelationships', 'true');
			} else {
				thisX2Chart.actionParams['showRelationships'] = 'false';
				thisX2Chart.getEventsBetweenDates (true);
				$.cookie (thisX2Chart.cookiePrefix + 'showRelationships', 'false');
			}
		});													   
	}
	
	if (!this.suppressChartSettings) {
		thisX2Chart.setUpChartSettings ();
	}
	
	if (this.hideByDefault) {
		thisX2Chart.setUpHideShowButtonBehavior ();
	}
	
	thisX2Chart.setUpBinSizeSelection ();
	thisX2Chart.setUpDatepickers ();
	thisX2Chart.setUpMetricSelection ();
	
	/* 
	set up event handlers which update action history chart on action 
	creation/deletion.
	*/
	if (this.chartType === 'recordView') {
		$(document).on ('chartWidgetMaximized', function () {
			DEBUG && console.log ('max');
			thisX2Chart.feedChart.replot ({ resetAxes: false });
		});
		$(document).on ('newlyPublishedAction', function () {
			DEBUG && console.log ('new action');
			thisX2Chart.getEventsBetweenDates (true); 
		});
		$(document).on ('deletedAction', function () {
			DEBUG && console.log ('deleted action');
			thisX2Chart.getEventsBetweenDates (true); 
		});
	} else if (this.chartType === 'eventsChart') {
		// initialize dropdown checklist
		$('#' + this.chartType + '-users-chart-filter').multiselect2 ({
			'checkAllText': this.translations['Check all'],
			'uncheckAllText': this.translations['Uncheck all'],
			'selectedText': '# ' + this.translations['metric(s) selected']
		});
		$('#' + this.chartType + '-users-chart-filter').multiselect2 ('checkAll');
		$('#' + this.chartType + '-social-subtypes-chart-filter').multiselect2 ({
			'checkAllText': this.translations['Check all'],
			'uncheckAllText': this.translations['Uncheck all'],
			'selectedText': '# ' + this.translations['metric(s) selected']
		});
		$('#' + this.chartType + '-social-subtypes-chart-filter').multiselect2 ('checkAll');
		$('#' + this.chartType + '-visibility-chart-filter').multiselect2 ({
			'checkAllText': this.translations['Check all'],
			'uncheckAllText': this.translations['Uncheck all'],
			'selectedText': '# ' + this.translations['metric(s) selected']
		});
		$('#' + this.chartType + '-visibility-chart-filter').multiselect2 ('checkAll');
	
		$('#' + this.chartType + '-show-chart-filters-button').click (function () {
			DEBUG && console.log ('show-chart-filters click');
			$('#' + thisX2Chart.chartType + '-chart-container .chart-filters-container').
				slideToggle (200);
		});
	}
	
	// redraw graph on window resize
	$(window).on ('resize', function () {
		if ($('#' + thisX2Chart.chartType + '-chart-container').is (':visible') && 
			thisX2Chart.feedChart !== null)
			thisX2Chart.feedChart.replot ({ resetAxes: false });
	});
	
	thisX2Chart.setSettingsFromCookie (); // fill settings with saved settings
	
	if (this.chartType === 'eventsChart' && 
		$.cookie (thisX2Chart.cookiePrefix + 'chartIsShown') === 'true') {
			$('#' + this.chartType + '-chart-container').show ();
			$('#' + this.chartType + '-show-chart').hide ();
			$('#' + this.chartType + '-hide-chart').show ();
	}
	
	thisX2Chart.getEventsBetweenDates (false); // populate default graph

}



/************************************************************************************
Static Methods
************************************************************************************/

/*
Returns the string of the specified width padded on the left with zeroes.
Precondition: width >= str.length
*/
X2Chart.padTimeField = function (str, width) {
	if (str.length === width) return str;

	return (new Array (width - str.length + 1)).join ('0') + str;
}


/************************************************************************************
Instance Methods
************************************************************************************/

/*
Ask server for all events between user specified dates.
Replot data on server response.
Parameters:
	redraw - Boolean, determines whether thisX2Chart.plotData will clear the plot before drawing
*/
X2Chart.prototype.getEventsBetweenDates = function (redraw) {
	var thisX2Chart = this;
	var binSize = 
		$('#' + thisX2Chart.chartType + '-bin-size-button-set a.disabled-link').attr ('id').
		replace (thisX2Chart.chartType + '-', '');
	var tsDict = thisX2Chart.getStartEndTimestamp ();
	var startTimestamp = tsDict['startTimestamp'];
	var endTimestamp = tsDict['endTimestamp'] + MSPERDAY;

	DEBUG && console.log ('getting events between ' + startTimestamp + ' and ' + endTimestamp);

	var data = {
		'startTimestamp': startTimestamp / 1000,
		'endTimestamp': endTimestamp / 1000
	}

	if (this.actionParams) {
		$.extend (data, this.actionParams);
	}

	if (this.chartData) {
		thisX2Chart.eventData = this.chartData;
		thisX2Chart.plotData ({'redraw': redraw});
		this.chartData = null;
		return;
	}

	DEBUG && console.log ('calling ' + this.getChartDataActionName + ' with params ');
	DEBUG && console.debug (data);

	$.ajax ({
		'url': this.getChartDataActionName,
		'data': data,
		'success': function (data) {
			thisX2Chart.eventData = JSON.parse (data);
			DEBUG && console.log ('ajax ret, thisX2Chart.eventData = ');
			DEBUG && console.debug (thisX2Chart.eventData);

			thisX2Chart.plotData ({'redraw': redraw});
		}
	});
};

/*
Returns an array of jqplot entries with y values equal to 0 and x values
between timestamp1 and timestamp2. x values increase by interval.
Parameters
	inclusiveBegin - a boolean, whether to include the entry corresponding to
		timestamp1 in the returned array
	inclusiveEnd - a boolean, whether to include the entry corresponding to
		timestamp2 in the returned array
	showMarker - if this is set to false, the returned array will have at most
		2 entries.
*/
X2Chart.prototype.getZeroEntriesBetween = function (
	timestamp1, timestamp2, interval, inclusiveBegin , inclusiveEnd , showMarker) {
	var thisX2Chart = this;

	if (timestamp2 <= timestamp1) {
		return [];
	}

	var entries = [];

	if (inclusiveBegin)
		entries.push ([timestamp1, 0]);

	switch (interval) {
		case 'hour':
			if (!showMarker) {
				var intermediateTimestamp1 = timestamp1;
				var intermediateTimestamp2 = timestamp2;
				intermediateTimestamp1 += MSPERHOUR;
				intermediateTimestamp2 -= MSPERHOUR;
				if (intermediateTimestamp1 < intermediateTimestamp2) {
					entries.push ([intermediateTimestamp1, 0]);
					entries.push ([intermediateTimestamp2, 0]);
				} else if (intermediateTimestamp1 < timestamp2) {
					entries.push ([intermediateTimestamp1, 0]);
				}
				if (inclusiveEnd) {
					entries.push ([timestamp2, 0]);
				}
			} else {
				var intermediateTimestamp = timestamp1;
				while (true) {
					intermediateTimestamp += MSPERHOUR;
					if ((intermediateTimestamp < timestamp2 && !inclusiveEnd) ||
						(intermediateTimestamp <= timestamp2 && inclusiveEnd)) {
						entries.push ([intermediateTimestamp, 0]);
					} else {
						break;
					}
				}
			}
			break;
		case 'day':
			if (!showMarker) {
				var intermediateTimestamp1 = timestamp1;
				var intermediateTimestamp2 = timestamp2;
				intermediateTimestamp1 += MSPERDAY;
				intermediateTimestamp2 -= MSPERDAY;
				if (intermediateTimestamp1 < intermediateTimestamp2) {
					entries.push ([intermediateTimestamp1, 0]);
					entries.push ([intermediateTimestamp2, 0]);
				} else if (intermediateTimestamp1 < timestamp2) {
					entries.push ([intermediateTimestamp1, 0]);
				}
				if (inclusiveEnd) {
					entries.push ([timestamp2, 0]);
				}
			} else {
				var intermediateTimestamp = timestamp1;
				while (true) {
					intermediateTimestamp += MSPERDAY;
					if ((intermediateTimestamp < timestamp2 && !inclusiveEnd) ||
						(intermediateTimestamp <= timestamp2 && inclusiveEnd)) {
						entries.push ([intermediateTimestamp, 0]);
					} else {
						break;
					}
				}
			}

			break;
		case 'week':
			if (!showMarker) {
				var intermediateTimestamp1 = 
					thisX2Chart.getRoundedTimestamp (timestamp1, 'week-bin-size', false);
				//var intermediateTimestamp1 = timestamp1;
				var intermediateTimestamp2 = timestamp2;
				intermediateTimestamp1 += MSPERWEEK;
				intermediateTimestamp2 -= MSPERWEEK;
				if (intermediateTimestamp1 < intermediateTimestamp2) {
					entries.push ([intermediateTimestamp1, 0]);
					entries.push ([intermediateTimestamp2, 0]);
				} else if (intermediateTimestamp1 < timestamp2) {
					entries.push ([intermediateTimestamp1, 0]);
				}
			} else {
				DEBUG && console.log ('thisX2Chart.fillZeroEntries: week, timestamp1 = ' +
							 timestamp1);
				DEBUG && console.log ('timestamp2 = ' + timestamp2);
				var rounded = false;
				var intermediateTimestamp = 
					thisX2Chart.getRoundedTimestamp (timestamp1, 'week-bin-size', false);
				DEBUG && console.log ('thisX2Chart.fillZeroEntries: week, intermediateTimestamp = ' +
							 intermediateTimestamp);
				if (intermediateTimestamp !== timestamp1) {
					DEBUG && console.log ('setting rounded to true');
					rounded = true;
				}
				while (true) {
					if (!rounded) {
						intermediateTimestamp += MSPERWEEK;
						DEBUG && console.log ('setting rounded to false');
					}
					rounded = false;
					if ((intermediateTimestamp < timestamp2 && !inclusiveEnd) ||
						(intermediateTimestamp <= timestamp2 && inclusiveEnd)) {
						entries.push ([intermediateTimestamp, 0]);
					} else {
						break;
					}
				}
			}

			break;
		case 'month':
			var date1 = new Date (timestamp1);
			var date2 = new Date (timestamp2);
			var M1 = date1.getMonth () + 1;
			var D1 = date1.getDate ();
			var Y1 = date1.getFullYear ();
			var M2 = date2.getMonth () + 1;
			var D2 = date2.getDate ();
			var Y2 = date2.getFullYear ();
			var endMonth = date2.getMonth ();
			var endYear = date2.getYear ();
			var beginString = (M1 + '-' + 1 + '-' + Y1);
			var endString = (M2 + '-' + 1 + '-' + Y2);
			var isFirst = true;


			var dateString, timestamp;
			while (true) {

				M1++;
				if (M1 === 13) {
					Y1++;
					M1 = 1;
				}

				beginString = M1 + '-' + 1 + '-' + Y1;
				nextMonth = M1 + 1;
				nextYear = Y1;
				if (nextMonth === 13) {
					nextYear++;
					nextMonth = 1;
				}
				nextString = nextMonth + '-' + 1 + '-' + nextYear;

				if ((inclusiveEnd) ||
					(!inclusiveEnd && beginString !== endString)) {
					timestamp = (new Date (Y1, M1 - 1, 1, 0, 0, 0, 0)).getTime ();
					if (isFirst) {
						entries.push ([timestamp, 0]);
						isFirst = false;
					} else if (showMarker ||
						nextString === endString) {
						entries.push ([timestamp, 0]);
					} else {

					}
				}
				if (beginString === endString) {
					break;
				}
			}

			break;
	}
	return entries;
};

/*
Returns an array which can be passed to jqplot. Each entry in the array corresponds
to the number of events of a given type and at a certain time (hour, day, week, or
month depending on the bin size)
Parameters:
	thisX2Chart.eventData - an array set by getEventsBetween
	binSize - a string
	type - a string. The type of event that will get plotted.
*/
X2Chart.prototype.groupChartData = function (
	eventData, binSize, type, showMarker, onlyOneBin) { 
	var thisX2Chart = this;

	var chartData = [];

	DEBUG && console.log ('thisX2Chart.eventData = ');
	DEBUG && console.log (thisX2Chart.eventData);

	// group chart data into bins and keep count of the number of entries in each bin
	switch (binSize) {
		case 'hour-bin-size':
			var hour, day, month, year, evt, dateString, timestamp, count;
			for (var i in thisX2Chart.eventData) {
				evt = thisX2Chart.eventData[i];
				count = evt['count'] === '0' ? 1 : parseInt (evt['count'], 10);
				if ((!(type === 'any' || type === '') && evt['type'] !== type) ||
					(type === '' && evt['type'] !== null)) continue;
				if (evt['year'] === year &&
					evt['month'] === month &&
					evt['day'] === day &&
					evt['hour'] === hour) {
					chartData[chartData.length - 1][1] += count;
				} else {
					year = evt['year'];
					month = evt['month'];
					day = evt['day'];
					hour = evt['hour'];

					timestamp = (new Date (
						year, month - 1, day, hour, 0, 0, 0)).getTime ();
					chartData.push ([timestamp, count]);
				}

			}
			break;
		case 'day-bin-size':
			var day, month, year, evt, dateString, timestamp, count;
			for (var i in thisX2Chart.eventData) {
				evt = thisX2Chart.eventData[i];
				count = evt['count'] === '0' ? 1 : parseInt (evt['count'], 10);
				DEBUG && console.log (count);
				if ((!(type === 'any' || type === '') && evt['type'] !== type) ||
					(type === '' && evt['type'] !== null)) continue;
				if (evt['year'] === year &&
					evt['month'] === month &&
					evt['day'] === day) {
					chartData[chartData.length - 1][1] += count;
				} else {
					year = evt['year'];
					month = evt['month'];
					day = evt['day'];

					timestamp = (new Date (
						year, month - 1, day, 0, 0, 0, 0)).getTime ();
					chartData.push ([timestamp, count]);
				}
			}
			break;
		case 'week-bin-size':
			var week, year, evt, dateString, timestamp, date, day, MSPERWEEK, count;
			for (var i in thisX2Chart.eventData) {
				evt = thisX2Chart.eventData[i];
				count = evt['count'] === '0' ? 1 : parseInt (evt['count'], 10);
				if ((!(type === 'any' || type === '') && evt['type'] !== type) ||
					(type === '' && evt['type'] !== null)) continue;
				if (evt['year'] === year &&
					evt['week'] === week) {
					chartData[chartData.length - 1][1] += count;
				} else {
					year = evt['year'];
					week = evt['week'];
					timestamp = (new Date (
						year, evt['month'] - 1, evt['day'], 0, 0, 0, 0)).getTime ();
					date = new Date (timestamp);
					day = date.getDay ();
					timestamp -= day * MSPERDAY;

					chartData.push ([timestamp, count]);
				}
			}
			break;
		case 'month-bin-size':
			var month, year, evt, dateString, timestamp, count;
			for (var i in thisX2Chart.eventData) {
				evt = thisX2Chart.eventData[i];
				count = evt['count'] === '0' ? 1 : parseInt (evt['count'], 10);
				if ((!(type === 'any' || type === '') && evt['type'] !== type) ||
					(type === '' && evt['type'] !== null)) continue;
				if (evt['year'] === year &&
					evt['month'] === month) {
					chartData[chartData.length - 1][1] += count;
				} else {
					year = evt['year'];
					month = evt['month'];

					timestamp = (new Date (
						year, month - 1, 1, 0, 0, 0, 0)).getTime ();
					chartData.push ([timestamp, count]);
				}
			}
			break;
	}

	chartData.reverse ();

	var startTimestamp = 
		($('#' + this.chartType + '-chart-datepicker-from').datepicker ('getDate').valueOf ());

	// shift position of first bin forward to starting timestamp
	if ((binSize === 'week-bin-size' || binSize === 'month-bin-size') &&
		chartData.length !== 0 && chartData[0][0] < startTimestamp) 
		chartData[0][0] = startTimestamp;

	if (onlyOneBin && chartData.length === 0)
		chartData.push ([startTimestamp, 0]);

	// insert entries with y value equal to 0 into chartData at the specified interval
	var chartDataIndex = 0;
	var timestamp1, timestamp2, arr1, arr2, intermArr;
	while (chartData.length !== 0 && chartDataIndex < chartData.length - 1) {

		timestamp1 = chartData[chartDataIndex][0];
		timestamp2 = chartData[chartDataIndex + 1][0];

		switch (binSize) {
			case 'hour-bin-size':
				arr1 = chartData.slice (0, chartDataIndex + 1);
				arr2 = chartData.slice (chartDataIndex + 1, chartData.length);
				intermArr = thisX2Chart.getZeroEntriesBetween (
					timestamp1, timestamp2, 'hour', false, false, showMarker);
				if (intermArr.length !== 0)
					chartData = arr1.concat (intermArr, arr2);
				chartDataIndex += intermArr.length + 1;
				break;
			case 'day-bin-size':
				arr1 = chartData.slice (0, chartDataIndex + 1);
				arr2 = chartData.slice (chartDataIndex + 1, chartData.length);
				intermArr = thisX2Chart.getZeroEntriesBetween (
					timestamp1, timestamp2, 'day', false, false, showMarker);
				if (intermArr.length !== 0)
					chartData = arr1.concat (intermArr, arr2);
				chartDataIndex += intermArr.length + 1;
				break;
			case 'week-bin-size':
				arr1 = chartData.slice (0, chartDataIndex + 1);
				arr2 = chartData.slice (chartDataIndex + 1, chartData.length);
				intermArr = thisX2Chart.getZeroEntriesBetween (
					timestamp1, timestamp2, 'week', false, false, showMarker);
				if (intermArr.length !== 0)
					chartData = arr1.concat (intermArr, arr2);
				chartDataIndex += intermArr.length + 1;
				break;
			case 'month-bin-size':
				arr1 = chartData.slice (0, chartDataIndex + 1);
				arr2 = chartData.slice (chartDataIndex + 1, chartData.length);
				intermArr = thisX2Chart.getZeroEntriesBetween (
					timestamp1, timestamp2, 'month', false, false, showMarker);
				if (intermArr.length !== 0)
					chartData = arr1.concat (intermArr, arr2);
				chartDataIndex += intermArr.length + 1;
				break;
		}

	}

	return {
		chartData: chartData
	};
};

/*
Helper function for jqplot used to widen the date range if the user selected
begin and end dates are the same.
*/
X2Chart.prototype.shiftTimeStampOneInterval = function (timestamp, binSize, forward) {
	var thisX2Chart = this;
	var newTimestamp = timestamp;
	switch (binSize) {
		case 'hour-bin-size':
		case 'day-bin-size':
			if (forward)
				newTimestamp += MSPERDAY;
			else
				newTimestamp -= MSPERDAY;
			break;
		case 'week-bin-size':
			if (forward)
				newTimestamp += MSPERWEEK;
			else
				newTimestamp -= MSPERWEEK;
			break;
		case 'month-bin-size':
			var date = new Date (timestamp);
			var M = date.getMonth () + 1;
			var Y = date.getFullYear ();
			if (forward) {
				M++;
				if (M === 13) {
					M = 1;
					Y++;
				}
			} else {
				M--;
				if (M === 0) {
					M = 12;
					Y--;
				}
			}
			newTimestamp = (new Date (Y, M - 1, 1, 0, 0, 0, 0)).getTime ();
			break;
	}
	return newTimestamp;
};

/*
Calls thisX2Chart.getZeroEntriesBetween () to pad the left and right side of the chart data
with entries having y values equal to 0 and x values increasing by the bin size.
Parameter:
	binSize - user selected, determines x value spacing
	showMarker - if false, a maximum of two entries will be added to the left
		and right side of the chart data.
*/
X2Chart.prototype.fillZeroEntries = function (
	startTimestamp, endTimestamp, binSize, chartData, showMarker) {
	var thisX2Chart = this;

	DEBUG && console.log ('thisX2Chart.fillZeroEntries: startTimestamp, endTimestamp = ');
	DEBUG && console.log (startTimestamp, endTimestamp);

	var binType = binSize.match (/^[^-]+/)[0];

	if (chartData[0] === null) {
		DEBUG && console.log ('data is null, filling zeroes');
		//startTimestamp = thisX2Chart.getRoundedTimestamp (startTimestamp, binSize, true);
		endTimestamp = thisX2Chart.getRoundedTimestamp (endTimestamp, binSize, true);
		chartData = thisX2Chart.getZeroEntriesBetween (
			startTimestamp, endTimestamp, binType, true, true, showMarker);
		return chartData;
	}

	var chartStartTimestamp = chartData[0][0];
	var chartEndTimestamp = chartData[chartData.length - 1][0];
	if (startTimestamp < chartStartTimestamp) {
		//startTimestamp = thisX2Chart.getRoundedTimestamp (startTimestamp, binSize, true);
		var arr = thisX2Chart.getZeroEntriesBetween (
			startTimestamp, chartStartTimestamp, binType, true, false, showMarker);
		if (arr.length !== 0) {
			chartData = arr.concat (chartData);
		}
	}
	if (endTimestamp > chartEndTimestamp) {
		endTimestamp = thisX2Chart.getRoundedTimestamp (endTimestamp, binSize, true);
		var arr = thisX2Chart.getZeroEntriesBetween (
			chartEndTimestamp, endTimestamp, binType, false, true, showMarker);
		if (arr.length !== 0)
			chartData = chartData.concat (arr);
	}

	return chartData;
};


/*
Returns a dictionary containing the number of hours, days, months, and years between
the start and end timestamps.
*/
X2Chart.prototype.countBins = function (startTimestamp, endTimestamp) {
	var thisX2Chart = this;
	endTimestamp += MSPERDAY;

	var dateRange =
		endTimestamp - startTimestamp;

	// get starting and ending months and years
	var startDate = new Date (startTimestamp);
	var startMonth = startDate.getMonth () + 1;
	var startYear = startDate.getFullYear ();
	var endDate = new Date (endTimestamp);
	var endMonth = endDate.getMonth () + 1;
	var endYear = endDate.getFullYear ();


	// count hours, days, weeks, months
	var hours = dateRange / 1000 / 60 / 60;
	var days = hours / 24;
	var weeks = days / 7;
	var months;
	var yearCount = endYear - startYear;
	if (yearCount === 0) {
		months = endMonth - startMonth + 1;
	} else if (yearCount === 1) {
		months = endMonth + ((12 - startMonth) + 1) + 1;
	} else { // yearCount > 1
		months = (endMonth + ((12 - startMonth) + 1)) + (12 * (yearCount - 2)) + 1;
	}

	if (hours === 0) hours = 24;
	if (days === 0) hours = 1;
	if (weeks === 0) weeks = 1;
	if (months === 0) months = 1;

	weeks = Math.ceil (days / 7);

	return {
		'hours': hours,
		'days': days,
		'weeks': weeks,
		'months': months,
		'years': yearCount + 1
	};
};

// returns timestamp of nearest day at 12am
X2Chart.prototype.getRoundedDayTs = function (timestamp, prev) {
	var thisX2Chart = this;
	var date = new Date (timestamp);
	var M = date.getMonth () + 1;
	var Y = date.getFullYear ();
	var D = date.getDate ();
	var newTimestamp = (new Date (Y, M - 1, D, 0, 0, 0, 0)).getTime ();
	if (!prev) {
		newTimestamp += MSPERDAY;
	}
	return newTimestamp;
}

// returns timestamp of nearest Sunday at 12am
X2Chart.prototype.getRoundedWeekTs = function (timestamp, prev) {
	var thisX2Chart = this;
	var date = new Date (timestamp);
	var M = date.getMonth () + 1;
	var D = date.getDate ();
	var Y = date.getFullYear ();
	var newTimestamp = (new Date (Y, M - 1, D, 0, 0, 0, 0)).getTime ();
	var date = new Date (newTimestamp);
	var day = date.getDay ();
	newTimestamp -= day * MSPERDAY;
	if (!prev && day !== 0) {
		newTimestamp += MSPERWEEK;
	}
	return newTimestamp;
}

// returns timestamp of nearest 1st of month at 12am
X2Chart.prototype.getRoundedMonthTs = function (timestamp, prev) {
	var thisX2Chart = this;
	var date = new Date (timestamp);
	var M = date.getMonth () + 1;
	var Y = date.getFullYear ();
	if (!prev) {
		M++;
		if (M > 12) {
			M = 1;
			Y++;
		}
	}
	var newTimestamp = (new Date (Y, M - 1, 1, 0, 0, 0, 0)).getTime ();
	return newTimestamp;
}

X2Chart.prototype.getRoundedTimestamp = function (timestamp, binSize, prev) {
	var thisX2Chart = this;
	DEBUG && console.log ('thisX2Chart.getRoundedTimestamp: ');
	var roundedTimestamp;
	switch (binSize) {
		case 'hour-bin-size':
			roundedTimestamp = timestamp;
			break;
		case 'day-bin-size':
			roundedTimestamp = thisX2Chart.getRoundedDayTs (timestamp, prev);
			break;
		case 'week-bin-size':
			roundedTimestamp = thisX2Chart.getRoundedWeekTs (timestamp, prev);
			break;
		case 'month-bin-size':
			roundedTimestamp = thisX2Chart.getRoundedMonthTs (timestamp, prev);
			break;
	}
	DEBUG && console.log ('timestamp, roundedTimestamp = ');
	DEBUG && console.log (timestamp, roundedTimestamp);
	return roundedTimestamp;
}

/*
Retrieves the user selected start and end timestamps from the DOM.
Parameter:
	binSize - if set, the start and end timestamps will be rounded down to the
		nearest hour, day, week, or month, respectively
*/
X2Chart.prototype.getStartEndTimestamp = function () {
	var thisX2Chart = this;
	DEBUG && console.log ('getStartEndTimestamp: this = '); 
	DEBUG && console.debug (thisX2Chart);

	var startTimestamp =
		($('#' + thisX2Chart.chartType + '-chart-datepicker-from').datepicker ('getDate').valueOf ());
	var endTimestamp =
		($('#' + thisX2Chart.chartType + '-chart-datepicker-to').datepicker ('getDate').valueOf ());
	if (endTimestamp < startTimestamp)
		endTimestamp = startTimestamp;

	DEBUG && console.log ('thisX2Chart.getStartEndTimestamp: ');
	DEBUG && console.log (startTimestamp, endTimestamp);

	return {
		'startTimestamp': startTimestamp,
		'endTimestamp': endTimestamp
	}

}

/*
Helper function for thisX2Chart.plotData. Determines the resolution of the graph.
Returns false if the date range must be sliced into more than the set number of
intervals, true otherwise.
If this function returns false, markers should not be displayed.
*/
X2Chart.prototype.getShowMarkerSetting = function (binSize, countDict) {
	var thisX2Chart = this;
	var hours = countDict['hours'];
	var days = countDict['days'];
	var months = countDict['months'];
	var weeks = Math.floor (days / 7);
	var years = countDict['years'];

	var showMarker = true;
	switch (binSize) {
		case 'hour-bin-size':
			if (hours > 110)
				showMarker = false;
			break;
		case 'day-bin-size':
			if (days > 110)
				showMarker = false;
			break;
		case 'week-bin-size':
			if (weeks > 110)
				showMarker = false;
			break;
		case 'month-bin-size':
			if (months > 110)
				showMarker = false;
			break;
	}
	return showMarker;
}

X2Chart.prototype.getLongMonthName = function (monthNum) {
	var thisX2Chart = this;
	monthNum = + monthNum % 12;
	var monthName = "";
	switch (monthNum) {
		case 1:
			monthName = 'January';
			break;
		case 2:
			monthName = 'February';
			break;
		case 3:
			monthName = 'March';
			break;
		case 4:
			monthName = 'April';
			break;
		case 5:
			monthName = 'May';
			break;
		case 6:
			monthName = 'June';
			break;
		case 7:
			monthName = 'July';
			break;
		case 8:
			monthName = 'August';
			break;
		case 9:
			monthName = 'September';
			break;
		case 10:
			monthName = 'October';
			break;
		case 11:
			monthName = 'November';
			break;
		case 12:
			monthName = 'December';
			break;
	}
	return monthName;
}

X2Chart.prototype.getShortMonthName = function (monthNum) {
	var thisX2Chart = this;
	monthNum = + monthNum;
	var monthName = "";
	switch (monthNum) {
		case 1:
			monthName = 'Jan';
			break;
		case 2:
			monthName = 'Feb';
			break;
		case 3:
			monthName = 'Mar';
			break;
		case 4:
			monthName = 'Apr';
			break;
		case 5:
			monthName = 'May';
			break;
		case 6:
			monthName = 'Jun';
			break;
		case 7:
			monthName = 'Jul';
			break;
		case 8:
			monthName = 'Aug';
			break;
		case 9:
			monthName = 'Sep';
			break;
		case 10:
			monthName = 'Oct';
			break;
		case 11:
			monthName = 'Nov';
			break;
		case 12:
			monthName = 'Dec';
			break;
		default:
			DEBUG && console.log ('Error: thisX2Chart.getShortMonthName: default switch ' + monthNum);
	}
	return monthName;
}

/*
Given a format string and a timestamp, returns a label with information extracted
from the timestamp. Used to create tooltip text.
*/
X2Chart.prototype.getTooltipFormattedLabel = function (formatStr, timestamp, isFirstPoint, isLastPoint) {
	var thisX2Chart = this;
	DEBUG && console.log ('thisX2Chart.getTooltipFormattedLabel: params = ');
	DEBUG && console.log (formatStr, timestamp, isFirstPoint, isLastPoint);

	var fmtLabel = '';
	var tokens = formatStr.split (' ');
	var date = new Date (timestamp);

	var monthStr, D, M, hours, H, period, Y, endTimestamp, endDate ;
	for (var i in tokens) {
		switch (tokens[i]) {
			case 'shortMonth':
				M = date.getMonth () + 1;
				monthStr = thisX2Chart.translations [thisX2Chart.getShortMonthName (M)];
				fmtLabel += monthStr;
				break;
			case 'day':
				D = date.getDate ();
				fmtLabel += D;
				break;
			case 'toLastDayOfMonth':
				if (isLastPoint) {
					endTimestamp = ($('#' + thisX2Chart.chartType + '-chart-datepicker-to').datepicker ('getDate').valueOf ());
					if (endTimestamp < timestamp)
						endTimestamp = timestamp;
				} else {
					Y = date.getFullYear ();
					M = date.getMonth () + 1;
					M++;
					if (M > 12) {
						M = 0;
						Y++;
					}
					DEBUG && console.log ('Y, M = ');
					DEBUG && console.log (Y, M);
					endTimestamp = (new Date (Y, M - 1, 1, 0, 0, 0, 0)).getTime ();
					endTimestamp -= MSPERDAY;
					DEBUG && console.log (endTimestamp);
				}
					
				fmtLabel += '- ' + thisX2Chart.getTooltipFormattedLabel (
					formatStr.split ('toLastDayOfMonth')[0], endTimestamp, false, false);
				formatStr.replace (/^.*toLastDayOfMonth/, '');
				break;

			case 'plusSixDays':
				if (isFirstPoint) {
					var day = date.getDay ();
					endTimestamp = timestamp + (7 - (day + 1)) * MSPERDAY;
				} else if (isLastPoint) {
					endTimestamp = ($('#' + thisX2Chart.chartType + '-chart-datepicker-to').datepicker ('getDate').valueOf ());
					if (endTimestamp < timestamp)
						endTimestamp = timestamp;
				} else {
					endTimestamp = timestamp + 6 * MSPERDAY;
					//endTimestamp -= timestampDiff; 
				}
					
				fmtLabel += '- ' + thisX2Chart.getTooltipFormattedLabel (
					formatStr.split ('plusSixDays')[0], endTimestamp, false, false);
				formatStr.replace (/^.*plusSixDays/, '');
				break;
			case 'hours':
				hours = date.getHours (); 

				H = hours % 12 !== 0 ? hours % 12 : 12;
				period = hours >= 12 ? 'PM' : 'AM';
				fmtLabel += H + ':00 ' + period;
				break;
			case 'year':
				Y = date.getFullYear ();
				fmtLabel += Y;
				break;
			case 'longMonth':
				M = date.getMonth () + 1;
				monthStr = thisX2Chart.translations[thisX2Chart.getLongMonthName (M)];
				fmtLabel += monthStr;
				break;
			case '':
				break;
			default:
				DEBUG && console.log (tokens[i]);
				DEBUG && console.log ('Error: thisX2Chart.getTooltipFormattedLabel: switch default');
		}
		if (i !== tokens.length)
			fmtLabel += ' ';
	}
	return fmtLabel;

}


/*
Returns an array of ticks acceptable as input to jqplot. The number of ticks
and the ticks' labels depend on the user selected bin size and date range.
*/
X2Chart.prototype.getTicks = function (startTimestamp, endTimestamp, binSize, countDict) {
	var thisX2Chart = this;
	DEBUG && console.log ('thisX2Chart.getTicks:');	

	var rounded = false;
	var roundedTimestamp = thisX2Chart.getRoundedTimestamp (endTimestamp, binSize, true);
	if (roundedTimestamp !== endTimestamp)
		rounded = true;
	endTimestamp = roundedTimestamp;

	DEBUG && console.log ('startTimestamp, endTimestamp = ');
	DEBUG && console.log ([startTimestamp, endTimestamp]);

	var hours = countDict['hours'];
	var days = countDict['days'];
	var months = countDict['months'];
	var weeks = Math.floor (days / 7);
	var years = countDict['years'];


	/*
	Returns an array of tick entries which is acceptable to jqplot. Ticks will
	be labelled with the month and day from their corresponding timestamp.
	Tick entries will be between specified timestamps increasing at the
	specified interval.
	Parameters:
		interval - the number of days between each tick
	*/
	function getDayTicksBetween (startTimestamp, endTimestamp, interval) {
		var date, D, M, monthStr;

		DEBUG && console.log ('getDayTicksBetween: count by ' + interval);

		date = new Date (startTimestamp);

		var day = date.getDay ();
		// place dummy tick and find next week boundary
		if (day !== 0 && interval >= MSPERWEEK) { 
			ticks.push ([startTimestamp,'']);
			startTimestamp += (7 - day) * MSPERDAY;
			date = new Date (startTimestamp);
			D = date.getDate ();
			M = date.getMonth () + 1;
			monthStr = thisX2Chart.translations [thisX2Chart.getShortMonthName (M)];
		} else { // timestamp is at week boundary
			D = date.getDate ();
			M = date.getMonth () + 1;
			monthStr = thisX2Chart.translations [thisX2Chart.getShortMonthName (M)];
		}

		ticks.push ([startTimestamp, monthStr + ' ' + D]);

		var timestamp = startTimestamp;
		timestamp += interval;
		while (timestamp <= endTimestamp) {
			date = new Date (timestamp);
			D = date.getDate ();
			M = date.getMonth () + 1;
			monthStr = thisX2Chart.translations[thisX2Chart.getShortMonthName (M)];
			ticks.push ([timestamp, monthStr + ' ' + D]);

			timestamp += interval;

			if (timestamp > endTimestamp)// && binSize !== 'week-bin-size')
				ticks.push ([endTimestamp, '']);
		}
		return ticks;
	}

	/*
	Returns an array of tick entries which is acceptable to jqplot. Ticks will
	be labelled with the month from their corresponding timestamp.
	Tick entries will be between specified timestamps increasing at the
	specified interval. If suppressYear is true, the tick's label will not
	include the year.
	Parameters:
		interval - the number of months between each tick
		suppressYear - a boolean
	Precondition: interval <= 12
	*/
	function getMonthTicksBetween (
		startTimestamp, endTimestamp, interval, suppressYear) {

		var date1 = new Date (startTimestamp);
		var date2 = new Date (endTimestamp);
		var M1 = date1.getMonth () + 1;
		var D1 = date1.getDate ();
		var Y1 = date1.getFullYear ();
		var M2 = date2.getMonth () + 1;
		var D2 = date2.getDate ();
		var Y2 = date2.getFullYear ();
		var endMonth = date2.getMonth ();
		var endYear = date2.getYear ();
		var beginString = (M1 + '-' + 1 + '-' + Y1);
		var endString = (M2 + '-' + 1 + '-' + Y2);
		var monthStr = thisX2Chart.translations[thisX2Chart.getShortMonthName (M1)];
		if (!suppressYear) monthStr += ' ' + Y1;
		var timestamp = (new Date (Y1, M1 - 1, 1, 0, 0, 0, 0)).getTime ();
		var roundedEndTimestamp = (new Date (Y2, M2 - 1, 1, 0, 0, 0, 0)).getTime ();
		if (timestamp === startTimestamp)
			ticks.push ([startTimestamp, monthStr]);
		else
			ticks.push ([startTimestamp, '']);

		DEBUG && console.log ('getting month ticks between ' + timestamp + ' and ' + roundedEndTimestamp);
		DEBUG && console.log ('endString = ' + endString);

		while (true) {
			M1 += interval;
			if (M1 > 12) {
				Y1 = Y1 + Math.floor (M1 / 12);
				M1 = (M1 % 12);
				M1 = M1 === 0 ? 12 : M1;
			}

			beginString = M1 + '-' + 1 + '-' + Y1;

			timestamp = (new Date (Y1, M1 - 1, 1, 0, 0, 0, 0)).getTime ();
			monthStr = thisX2Chart.translations[thisX2Chart.getShortMonthName (M1)];
			if (!suppressYear) monthStr += ' ' + Y1;

			if (beginString === endString || Y1 > Y2 || (Y1 === Y2 && M1 > M2)) {
				if (timestamp <= endTimestamp)
					ticks.push ([timestamp, monthStr]);
				/*if (beginString !== endString || roundedEndTimestamp !== endTimestamp)
					ticks.push ([endTimestamp, ""]);*/
				break;
			} else {
				ticks.push ([timestamp, monthStr]);
			}
		}
		return ticks;
	}

	var ticks = [];
	var labelFormat;
	DEBUG && console.log ('binSize = ' + binSize);
	switch (binSize) {
		case 'hour-bin-size':
			if (hours < 72) {
				var date = new Date (startTimestamp);
				ticks.push ([startTimestamp, '12:00 AM']);
				var timestamp = startTimestamp;
				var interval = MSPERDAY / 2;
				var period = 'PM';
				timestamp += interval;
				while (timestamp <= endTimestamp) {
					ticks.push ([timestamp, '12:00 ' + period]);
					if (period === 'PM')
						period = 'AM';
					else
						period = 'PM';
					timestamp += interval;
				}
				labelFormat = 'longMonth day hours';
			} else if (days <= 7) {
				ticks =
					getDayTicksBetween (startTimestamp, endTimestamp, MSPERDAY);
				labelFormat = 'longMonth day hours';
			} else if (days <= 62) {
				ticks = getDayTicksBetween (
					startTimestamp, endTimestamp, Math.ceil (days / 7) * MSPERDAY);
				labelFormat = 'longMonth day hours';
			} else if (days <= 182) {
				ticks = getDayTicksBetween (
					startTimestamp, endTimestamp, Math.ceil (weeks / 7) *  7 * MSPERDAY);
				labelFormat = 'longMonth day hours';
			} else if (days < 365) {
				ticks =
					getMonthTicksBetween (startTimestamp, endTimestamp, 1, true);
				labelFormat = 'longMonth day hours';
			} else {
				ticks = getMonthTicksBetween (
					startTimestamp, endTimestamp, Math.ceil (months / 7), false);
				labelFormat = 'longMonth day year hours';
			}
			break;
		case 'day-bin-size':
			if (days <= 7) {
				ticks =
					getDayTicksBetween (startTimestamp, endTimestamp, MSPERDAY);
				labelFormat = 'longMonth day';
			} else if (days <= 49) {
				ticks = getDayTicksBetween (
					startTimestamp, endTimestamp, Math.ceil (days / 7) * MSPERDAY);
				labelFormat = 'longMonth day';
			} else if (days <= 182) {
				ticks = getDayTicksBetween (
					startTimestamp, endTimestamp, Math.ceil (weeks / 7) *  7 * MSPERDAY);
				labelFormat = 'longMonth day';
			} else if (days < 365) {
				ticks =
					getMonthTicksBetween (startTimestamp, endTimestamp, 1, true);
				labelFormat = 'longMonth day';
			} else {
				ticks = getMonthTicksBetween (
					startTimestamp, endTimestamp, Math.ceil (months / 7), false);
				labelFormat = 'longMonth day year';
			}
			break;
		case 'week-bin-size':
			if (days < 21) {
				ticks = getDayTicksBetween (
					startTimestamp, endTimestamp, Math.ceil (days / 7) * MSPERDAY);
				labelFormat = 'longMonth day plusSixDays';
			} else if (days <= 49) {
				ticks =
					getDayTicksBetween (startTimestamp, endTimestamp, 7 * MSPERDAY);
				labelFormat = 'longMonth day plusSixDays';
			} /*else if (days <= 62) {
				ticks = getDayTicksBetween (
					startTimestamp, endTimestamp, Math.ceil (days / 7) * 7 * MSPERDAY);
				labelFormat = 'longMonth day plusSixDays';
			} */else if (days <= 182) {
				ticks = getDayTicksBetween (
					startTimestamp, endTimestamp, Math.ceil (weeks / 7) * 7 * MSPERDAY);
				labelFormat = 'longMonth day plusSixDays';
			} else if (days < 365) {
				ticks =
					getMonthTicksBetween (startTimestamp, endTimestamp, 1, true);
				labelFormat = 'longMonth day plusSixDays';
			} else {
				ticks = getMonthTicksBetween (
					startTimestamp, endTimestamp, Math.ceil (months / 7), false);
				labelFormat = 'longMonth day year plusSixDays';
			}
			break;
		case 'month-bin-size':
			if (days < 365) {
				ticks = getMonthTicksBetween (
					startTimestamp, endTimestamp, Math.ceil (months / 7), true);
				if (ticks.length === 2 &&
					(ticks[0][1] === '' || ticks[1][1] === '')) {
					ticks = thisX2Chart.getTicks (
						startTimestamp, endTimestamp, 'day-bin-size', 
						countDict)['ticks'];

				}
				labelFormat = 'longMonth day toLastDayOfMonth';
			} else {
				ticks = getMonthTicksBetween (
					startTimestamp, endTimestamp, Math.ceil (months / 7), false);
				labelFormat = 'longMonth day year toLastDayOfMonth';
			}
			break;
		default: 
			DEBUG && console.log ('Error: thisX2Chart.getTicks: switch default');
	}

	DEBUG && console.log ('thisX2Chart.getTicks ret ' + labelFormat);

	return {
		'ticks': ticks,
		'labelFormat': labelFormat
	}

}

X2Chart.prototype.checkOnlyOneBin = function (binSize, countDict) {
	var thisX2Chart = this;
	var onlyOneBin = false;
	DEBUG && console.log ('thisX2Chart.checkOnlyOneBin');
	DEBUG && console.debug (countDict);
	switch (binSize) {
		case 'hour-bin-size':
			break;
		case 'day-bin-size':
			if (countDict['days'] === 1)
				onlyOneBin = true;
			break;
		case 'week-bin-size':
			if (countDict['weeks'] === 1)
				onlyOneBin = true;
			break;
		case 'month-bin-size':
			if (countDict['months'] === 1)
				onlyOneBin = true;
			break;
	}	
	return onlyOneBin;
}

/*
Sets up event functions to display tooltips on point mouse over.
Parameters:
	labelFormat - format string accepted by thisX2Chart.getTooltipFormattedLabel
	showMarker - boolean
	chartData - array of arrays
	typesText - metric names shown in tooltips
*/
X2Chart.prototype.setupTooltipBehavior = function (labelFormat, showMarker, chartData, typesText) {
	var thisX2Chart = this;

	DEBUG && console.log ('setupTooltipBehavior');

	// bypass bug in jqplot
	for (var i in thisX2Chart.feedChart.series) {
		thisX2Chart.feedChart.series[i].highlightMouseOver = true;

	}

	// remove trailing 'px'
	function rStripPx (str) {
		return str.replace (/px$/, '');
	}

	// convert css value in pixels to an int
	function pxToInt (str) {
		return parseInt (rStripPx (str), 10);

	}

	// create a data structure to optimize searching for points by x value
	var pointsDict = [];
	for (var i in chartData) {
		pointsDict.push ({});
		for (var j in chartData[i]) {
			pointsDict[i][chartData[i][j][0]] = chartData[i][j];
		}
	}

	// used to store location of highlighted point
	var pointXPrev = null;
	var pointYPrev = null;

	// display the tooltip
	$('#' + thisX2Chart.chartType + '-chart').unbind ('jqplotDataHighlight');
	$('#' + thisX2Chart.chartType + '-chart').bind ('jqplotDataHighlight', 
		function (ev, seriesIndex, pointIndex, data) {
			DEBUG && console.log ('jqthisX2Chart.plotDataHighlight');
			DEBUG && console.log ([ev, seriesIndex, pointIndex, data]);
			DEBUG && console.log ('showmarker = ' + showMarker);

			var chartLeft = $(this).offset ().left;
			var chartTop = $(this).offset ().top;
			var	pointX = thisX2Chart.feedChart.axes.xaxis.u2p (data[0]);
			var	pointY = thisX2Chart.feedChart.axes.yaxis.u2p (data[1]);
			var tooltip = $('#' + thisX2Chart.chartType + '-chart-tooltip');

			DEBUG && console.log (chartLeft, chartTop, pointX, pointY);

			// save for calculating distance between mouse and point
			pointXPrev = chartLeft + pointX;
			pointYPrev = chartTop + pointY;

			DEBUG && console.log ('data[0] = ' + data[0]);
			DEBUG && console.log ('chartData[0][0] = ' + chartData[0][0][0]);

			var isLastPoint = false;
			var isFirstPoint = false;
			if (data[0] === chartData[0][chartData[0].length - 1][0]) {
				DEBUG && console.log ('isLastPoint');
				isLastPoint = true;
			} else if (data[0] === chartData[0][0][0]) {
				DEBUG && console.log ('isFirstPoint');
				isFirstPoint = true;
			}

			// insert tooltip text
			DEBUG && console.log ('thisX2Chart.getTooltipFormattedLabel ret: ' + 
				thisX2Chart.getTooltipFormattedLabel (labelFormat, data[0], isFirstPoint, isLastPoint));
			$(tooltip).html ($('<span>', {
				class: 'chart-tooltip-date',
				text: thisX2Chart.getTooltipFormattedLabel (labelFormat, data[0], isFirstPoint, isLastPoint)
			}));
			$(tooltip).append ($('<br>'));

			DEBUG && console.log ('seriesIndex = ' + seriesIndex);

			// only show actions with 0 y values on two line chart
			if (thisX2Chart.chartSubtype === 'twoLine' || data[1] !== 0) {

				for (var i = 0; i < thisX2Chart.feedChart.series.length; ++i) {
					if (i === seriesIndex) {
						$(tooltip).append ($('<span>', {
							text: typesText[i] + ': ' + data[1]
						}));
						$(tooltip).append ($('<br>'));
					} else if (
						(pointsDict[i][data[0]] &&
						 pointsDict[i][data[0]][1] === data[1]) ||
						// overlapping point should exist
						(data[1] === 0 && !showMarker && 
						 !pointsDict[i][data[0]])) {

						$(tooltip).append ($('<span>', {
							text: typesText[i] + ': ' + data[1]
						}));
						$(tooltip).append ($('<br>'));
					}
				}
			}

			// determine where to place the tooltip
			var marginLeft, marginRight;
			marginLeft = 11;
			marginTop = 11;
			if (pointXPrev + pxToInt ($(tooltip).css ('width')) >
				chartLeft + pxToInt ($('#' + thisX2Chart.chartType + '-chart').css ('width'))) {
				DEBUG && console.log ('xoverflow');
				marginLeft = 
					- (pxToInt ($(tooltip).css ('width')) + marginLeft);
			}
			if (pointYPrev + pxToInt ($(tooltip).css ('height')) >
				chartTop + pxToInt ($('#' + thisX2Chart.chartType + '-chart').css ('height'))) {
				DEBUG && console.log ('yoverflow');
				marginTop = 
					- (pxToInt ($(tooltip).css ('height')) + marginTop);
			}

			$(tooltip).css ({
				position: 'absolute',
				left: pointXPrev,
				top: pointYPrev,
				'margin-left': marginLeft,
				'margin-top': marginTop
			});
			$(tooltip).show ();

		});

	function distance (x1, y1, x2, y2) {
		var dist = (Math.sqrt (Math.pow (x1 - x2, 2) + Math.pow (y1 - y2, 2)));
		return dist;
	}

	// hide tooltip when mouse moves away from data point
	function unhighlight (mouseX, mouseY) {
		//DEBUG && console.log ('jqthisX2Chart.plotDataUnhighlight');

		var tooltip = $('#' + thisX2Chart.chartType + '-chart-tooltip');

		if ($(tooltip).is (':visible') &&
			mouseX !== null && mouseY !== null &&
			pointXPrev !== null && pointYPrev !== null &&
			distance (
				mouseX, mouseY, pointXPrev, pointYPrev) > 12) {

			DEBUG && console.log ('hiding tooltip');

			//$('#' + thisX2Chart.chartType + '-chart-tooltip').empty ();
			$(tooltip).hide ();
		}

	}

	$('#' + thisX2Chart.chartType + '-chart').unbind ('mousemove');
	$('#' + thisX2Chart.chartType + '-chart').bind ('mousemove', function (event) {
		//DEBUG && console.log ('mouse');
		var mouseX = event.pageX;
		var mouseY = event.pageY;
		unhighlight (mouseX, mouseY);
	});

	$('#' + thisX2Chart.chartType + '-chart-tooltip').unbind ('mousemove');
	$('#' + thisX2Chart.chartType + '-chart-tooltip').bind ('mousemove', function (event) {
		//DEBUG && console.log ('chart-tooltip mouse');
		var mouseX = event.pageX;
		var mouseY = event.pageY;
		unhighlight (mouseX, mouseY);
	});

	$('#' + thisX2Chart.chartType + '-chart').unbind ('mouseout');
	$('#' + thisX2Chart.chartType + '-chart').bind ('mouseout', function (event) {
		$('#' + thisX2Chart.chartType + '-chart-tooltip').hide ();
	});

}

X2Chart.prototype.buildChartLegend = function (typesText, color) {
	var thisX2Chart = this;
	$('#' + thisX2Chart.chartType + '-chart-legend tbody').empty ();
	var makeNewRow = true;
	var currRow, currCell;
	for (var i in typesText) {
		if (makeNewRow) {
			DEBUG && console.log ('make new row');
			currRow = $('<tr>');
			$('#' + thisX2Chart.chartType + '-chart-legend tbody').append (currRow);
			makeNewRow = false;
		} else if ((i + 1) % 3 === 0) {
			makeNewRow = true;
		}
		DEBUG && console.log ('currRow = ');
		DEBUG && console.log ($(currRow));
			currCell = $('<td>').append (
				$('<div>', {
					class: 'chart-color-swatch'
				}),
				$('<span>', {
					text: typesText[i],
					class: 'chart-color-label'
				})
			)
		DEBUG && console.log ('setting background-color to ' + color[i]);
		$(currCell).find ('div').css ('background-color', color[i]);
		$(currRow).append (currCell);
	}
	if (typesText.length === 2) {
		$(currRow).append ($('<td>')); // dummy cell
	}
}


/*
Plots event data retrieved by thisX2Chart.getEventsBetweenDates ().
If two metrics are selected by the user, thisX2Chart.plotData will plot two lines.
Parameter:
	args - a dictionary containing optional parameters.
		redraw - an optional parameter which can be contained in args. If set to
			true, the chart will be cleared before the plotting.
*/
X2Chart.prototype.plotData = function (args /* optional */) {
	var thisX2Chart = this;
	if (typeof args !== 'undefined') {
		redraw = typeof args['redraw'] === 'undefined' ?
			false : args['redraw'];
	} else { // defaults
		redraw = false;
	}

	// retrieve user selected values
	var binSize = 
		$('#' + thisX2Chart.chartType + '-bin-size-button-set a.disabled-link').attr ('id').
		replace (thisX2Chart.chartType + '-', '');
	var tsDict = thisX2Chart.getStartEndTimestamp ();
	var startTimestamp = tsDict['startTimestamp'];
	var endTimestamp = tsDict['endTimestamp'];

	DEBUG && console.log ('thisX2Chart.plotData: startTimestamp, endTimestamp = ');
	DEBUG && console.log ([startTimestamp, endTimestamp]);

	// default settings
	var yTickCount = 3;
	var showXTicks = true;
	var showMarker = false;
	var tickInterval = null;

	/* 
	graph at least 1 interval, hour bin size is a special case since it is the only
	case for which there are multiple bins when start and and timestamp are equal.
	*/
	if (startTimestamp === endTimestamp && binSize === 'hour-bin-size')
		endTimestamp = thisX2Chart.shiftTimeStampOneInterval (endTimestamp, binSize, true);

	var min = startTimestamp;
	var max = endTimestamp;

	var countDict = thisX2Chart.countBins (min, max);

	// single bin is a special case, isolated point should be shown
	var onlyOneBin = thisX2Chart.checkOnlyOneBin (binSize, countDict);
	if (onlyOneBin) {
		DEBUG && console.log ('onlyOneBin = true');
		min = thisX2Chart.shiftTimeStampOneInterval (min, binSize, false);
		max = thisX2Chart.shiftTimeStampOneInterval (max, binSize, true);
		countDict = thisX2Chart.countBins (min, max); // recount for new interval
	} else {
		DEBUG && console.log ('onlyOneBin = false');
	}

	// determine label format and number of ticks based on data
	var ticksDict = thisX2Chart.getTicks (
		min, max, binSize, countDict);
	var ticks = ticksDict['ticks'];
	var labelFormat = ticksDict['labelFormat'];
	DEBUG && console.log ('ticks = ');
	DEBUG && console.log (ticks);
	showMarker = thisX2Chart.getShowMarkerSetting (binSize, countDict);

	DEBUG && console.log ('min = ' + min);
	DEBUG && console.log ('max = ' + max);

	/*if (ticks[0][0] < min)
		min = ticks[0][0]
	if (ticks[ticks.length - 1][0] > max)
		max = ticks[ticks.length - 1][0];*/

	// get user selected metrics
	var types;
	if (thisX2Chart.chartSubtype === 'twoLine') {
		types = [];
		types.push ($('#' + thisX2Chart.chartType + '-first-metric').val ());
		types.push ($('#' + thisX2Chart.chartType + '-second-metric').val ());
	} else if (thisX2Chart.chartSubtype === 'multiLine') {
		types = $('#' + thisX2Chart.chartType + '-first-metric').val ();
	}

	// get chartData for each user specified type
	var color = []; 
	var chartData = [];
	if (thisX2Chart.chartSubtype === 'twoLine') { 
		color.push ('#' + thisX2Chart.chartType + '-7EB2E6'); // color of line 1
		var dataDict = thisX2Chart.groupChartData (thisX2Chart.eventData, binSize, types[0], showMarker);
		chartData.push (dataDict['chartData']);
		if (types[1] !== '') {
			color.push ('#' + thisX2Chart.chartType + '-C2597C'); // color of line 2
			dataDict = thisX2Chart.groupChartData (thisX2Chart.eventData, binSize, types[1], showMarker);
			chartData.push (dataDict['chartData']);
		}
	} else if (thisX2Chart.chartSubtype === 'multiLine') {
		DEBUG && console.log ('types = ' + types);
		if (types === null) {
			chartData.push ([]);
		} else {
			var type;
			for (var i in types) {
				type = types[i];
				DEBUG && console.log ('type = ' + type);
				color.push (thisX2Chart.metricOptionsColors[types[i]]); // color of line 
				dataDict = 
					thisX2Chart.groupChartData (thisX2Chart.eventData, binSize, type, showMarker, onlyOneBin);
				chartData.push (dataDict['chartData']);
			}
		}
		DEBUG && console.log ('metricOptionsColors = ');
		DEBUG && console.log (thisX2Chart.metricOptionsColors);
	}

	// if no chartData exists of specified type, don't plot it
	var noChartData = true;
	for (var i in chartData) {
		if (chartData[i].length === 0) {
			chartData[i] = [null];
		} else {
			noChartData = false;
		}
	}

	// pad left and right side of data with entries having y value equal to 0
	if (!onlyOneBin &&
	    (thisX2Chart.chartSubtype === 'twoLine' ||
		(thisX2Chart.chartSubtype === 'multiLine' && $('#' + thisX2Chart.chartType + '-first-metric').val () !== null))) {
		DEBUG && console.log ('filling chart data');
		for (var i in chartData) {
			chartData[i] = thisX2Chart.fillZeroEntries (
				min, max, binSize, chartData[i], showMarker);
		}
	}

	DEBUG && console.log ('filled chartData = ');
	DEBUG && console.debug (chartData.toString ());

	DEBUG && console.log ('min = ' + min);
	DEBUG && console.log ('max = ' + max);

	jqplotConfig =  {
		seriesDefaults: {
			showMarker: showMarker,
			shadow: false,
			shadowAngle: 0,
			shadowOffset: 0,
			shadowDepth: 0,
			shadowAlpha: 0,
			markerOptions: {
				shadow: false,
				shadowAngle: 0,
				shadowOffset: 0,
				shadowDepth: 0,
				shadowAlpha: 0
			}
		},
		axesDefaults: {
			x2axis: {
				show: false
			}
		},
		seriesColors: color,
		series:[{
			label: 'Events',
			}
		],
		legend: {
			show: false
		},
		grid: {
			drawGridLines: false,
			gridLineColor: '#ffffff',
			borderColor: '#999',
			borderWidth: 1,
			background: '#ffffff',
			shadow: false
		},
		axes: {
			xaxis: {
				renderer: $.jqplot.DateAxisRenderer,
				tickOptions: {
					angle: -90
				},
				showTicks: showXTicks,
				ticks: ticks,
				min: min,
				max: max,
				padMin: 150,
				padMax: 150
			},
			yaxis: {
				pad: 1.05,
				numberTicks: yTickCount,
				tickOptions: {formatString: '%d'},
				min: 0
			}
		},
		highlighter: {
			show: true,
			showTooltip: false,
			sizeAdjust: 2.5

		}
	}

	if (noChartData) {
		jqplotConfig.axes.yaxis['max'] = 1;
		jqplotConfig.axes.yaxis['numberTicks'] = 2;
	}

	// plot chartData
	thisX2Chart.feedChart = $.jqplot (thisX2Chart.chartType + '-chart', chartData, jqplotConfig);

	DEBUG && console.log ('chartData.length = ' + chartData.length);
	DEBUG && console.log ('labelFormat = ' + labelFormat);

	if (redraw) {
		thisX2Chart.feedChart.replot (); // clear previous plot and plot again
	}

	// used to display type labels in tooltips and legend
	var typesText = [];
	if (thisX2Chart.chartSubtype === 'twoLine') {
		typesText.push ($('#' + thisX2Chart.chartType + '-first-metric').find (':selected').html ());
		typesText.push ($('#' + thisX2Chart.chartType + '-second-metric').find (':selected').html ());
	} else if (thisX2Chart.chartSubtype === 'multiLine') {
		$('#' + thisX2Chart.chartType + '-first-metric').find (":selected").each (function () {
			typesText.push ($(this).html ());
		});
	}

	if (types !== null)
		thisX2Chart.setupTooltipBehavior (labelFormat, showMarker, chartData, typesText);

	if (thisX2Chart.chartSubtype === 'multiLine')
		thisX2Chart.buildChartLegend (typesText, color);

}

/*
Changes the chart settings to match the settings specified in the parameters.
*/
X2Chart.prototype.applyChartSetting = function (
	startDate, endDate, binSize, firstMetric, secondMetric, chartSetting, 
	showRelationships, userFilter, eventSubtypeFilter, visibilityFilter) {
	var thisX2Chart = this;

	function applyMultiselectSettings (selector, settings) {
		$(selector).find ('option').each (function () {
			$(this).removeAttr ('selected');
		});
		$(selector).multiselect2 ('refresh');
		if (settings !== 'none') {
			DEBUG && console.log ('setting settings obj');
			if (typeof settings === 'string')
				settings = settings.split (',');
			DEBUG && console.log ('settings = ');
			DEBUG && console.log (settings);
			for (var i in settings) {
				$(selector).find ('option').each (function () {
					if ($(this).val () === settings[i]) {
						$(this).attr ('selected', 'selected');
					}
				});
				$(selector).multiselect2 ('refresh');
			}
		}
	}

	if (startDate !== null) {
		DEBUG && console.log ('applying start date' + startDate);
		var startDate = new Date (parseInt (startDate, 10));
		$('#' + thisX2Chart.chartType + '-chart-datepicker-from').datepicker ('setDate', startDate);
	}
	if (endDate !== null) {
		DEBUG && console.log ('applying end date');
		var endDate = new Date (parseInt (endDate, 10));
		$('#' + thisX2Chart.chartType + '-chart-datepicker-to').datepicker ('setDate', endDate);
	}
	if (binSize !== null && binSize === 'hour-bin-size' || binSize === 'day-bin-size' ||
		binSize === 'week-bin-size' || binSize === 'month-bin-size') {
		$('#' + thisX2Chart.chartType + '-chart-container a.disabled-link').removeClass ('disabled-link');
		$('#' + thisX2Chart.chartType + '-chart-container #' + thisX2Chart.chartType + '-' + binSize).
			addClass ('disabled-link');
	}
	if (firstMetric !== null) {

		DEBUG && console.log ('setting firstMetric');
		DEBUG && console.log ('typeof firstMetric = ' + typeof firstMetric);

		if (thisX2Chart.chartSubtype === 'twoLine') {
			$('#' + thisX2Chart.chartType + '-first-metric').find ('option:selected').removeAttr ('selected');
			$('#' + thisX2Chart.chartType + '-first-metric').children ().each (function () {
				if ($(this).val () === firstMetric) {
					$(this).attr ('selected', 'selected');
					return false;
				}
			});
		} else if (thisX2Chart.chartSubtype === 'multiLine') {
			applyMultiselectSettings ('#' + thisX2Chart.chartType + '-first-metric', firstMetric);
		}
	}
	if (secondMetric !== null) {
		$('#' + thisX2Chart.chartType + '-second-metric').find ('option:selected').removeAttr ('selected');
		if (secondMetric === '') {
			$('#' + thisX2Chart.chartType + '-second-metric').children ().first ().attr ('selected', 'selected');
		} else {
			$('#' + thisX2Chart.chartType + '-second-metric').children ().each (function () {
				if ($(this).val () === secondMetric) {
					$(this).attr ('selected', 'selected');
					return false;
				}
			});
		}
	} 
	if (chartSetting !== null) {
		thisX2Chart.setChartSettingName (chartSetting);
	}
	if (showRelationships !== null) {
		$('#' + thisX2Chart.chartType + '-rel-chart-data-checkbox').prop('checked', (showRelationships === 'true' ? true : false));
	}
	if (userFilter !== null) {
		applyMultiselectSettings ('#' + thisX2Chart.chartType + '-users-chart-filter', userFilter);
	}
	if (eventSubtypeFilter !== null) {
		applyMultiselectSettings ('#' + thisX2Chart.chartType + '-social-subtypes-chart-filter', eventSubtypeFilter);
	}
	if (visibilityFilter !== null) {
		applyMultiselectSettings ('#' + thisX2Chart.chartType + '-visibility-chart-filter', visibilityFilter);
	}
}

/*
Instantiate jquery datepickers and set to default values. Set up datepicker behavior.
*/
X2Chart.prototype.setUpDatepickers = function () {
	var thisX2Chart = this;

	DEBUG && console.log ('setUpDatepickers');

	// setup datepickers and initialize range to previous week
	$('#' + thisX2Chart.chartType + '-chart-datepicker-from').datepicker({
				constrainInput: false,
				showOtherMonths: true,
				selectOtherMonths: true,
				dateFormat: yii.datePickerFormat
	});
	$('#' + thisX2Chart.chartType + '-chart-datepicker-from').datepicker('setDate', new Date ());

	if (thisX2Chart.chartType === 'eventsChart' &&
		$.cookie (thisX2Chart.cookiePrefix + 'startDate') === null) {
		// default start date 
		$('#' + thisX2Chart.chartType + '-chart-datepicker-from').datepicker('setDate', '-7d'); 
		$.cookie (
			thisX2Chart.cookiePrefix + 'startDate', 
			$('#' + thisX2Chart.chartType + '-chart-datepicker-from').datepicker ('getDate').valueOf ());
	} else if (thisX2Chart.actionsStartDate) { 
		// default start date is beginning of action history
		$('#' + thisX2Chart.chartType + '-chart-datepicker-from').datepicker(
			'setDate', new Date (thisX2Chart.actionsStartDate));
	}

	$('#' + thisX2Chart.chartType + '-chart-datepicker-to').datepicker({
				constrainInput: false,
				showOtherMonths: true,
				selectOtherMonths: true,
				dateFormat: yii.datePickerFormat
	});

	DEBUG && console.log ('cookie to date eventsChart = ' + $.cookie (thisX2Chart.cookiePrefix + 'endDate'));
	if (thisX2Chart.chartType === 'eventsChart' &&
		$.cookie (thisX2Chart.cookiePrefix + 'endDate') === null) {
		DEBUG && console.log ('setting default for eventsChart to date');
		// default start date 
		$('#' + thisX2Chart.chartType + '-chart-datepicker-to').datepicker('setDate', new Date ()); // default end date
		$.cookie (
			thisX2Chart.cookiePrefix + 'endDate', 
			$('#' + thisX2Chart.chartType + '-chart-datepicker-to').datepicker ('getDate').valueOf ());
	} else if (thisX2Chart.chartType === 'recordView') {
		$('#' + thisX2Chart.chartType + '-chart-datepicker-to').datepicker('setDate', new Date ()); // default end date
	}

	/*
	Save setting in cookie and replot
	*/
	$('#' + thisX2Chart.chartType + '-chart-datepicker-from').datepicker ('option', 'onSelect', function () {
		DEBUG && console.log ('from date selected');
		thisX2Chart.getEventsBetweenDates (true);
		$.cookie (
			thisX2Chart.cookiePrefix + 'startDate', 
			$('#' + thisX2Chart.chartType + '-chart-datepicker-from').datepicker ('getDate').valueOf ());
		if (!thisX2Chart.suppressChartSettings) {
			thisX2Chart.setChartSettingName ('');  
			$('#' + thisX2Chart.chartType + '-predefined-settings').change ();
		}
	});

	/*
	Save setting in cookie and replot
	*/
	$('#' + thisX2Chart.chartType + '-chart-datepicker-to').datepicker ('option', 'onSelect', function () {
		thisX2Chart.getEventsBetweenDates (true);
		$.cookie (
			thisX2Chart.cookiePrefix + 'endDate', 
			$('#' + thisX2Chart.chartType + '-chart-datepicker-to').datepicker ('getDate').valueOf ());

		if (!thisX2Chart.suppressChartSettings) {
			thisX2Chart.setChartSettingName ('');  
			$('#' + thisX2Chart.chartType + '-predefined-settings').change ();
		}
	});

}

/*
Instantiates metric selection elements for various chart types. Sets up metric 
selection behavior.
*/
X2Chart.prototype.setUpMetricSelection = function () {
	var thisX2Chart = this;

	if (thisX2Chart.chartSubtype === 'twoLine') {
		// clear second metric and redraw graph using only first metric
		$('#' + thisX2Chart.chartType + '-clear-metric-button').click (function (evt) {
			evt.preventDefault();
			$('#' + thisX2Chart.chartType + '-second-metric-default').attr ('selected', 'selected');
			thisX2Chart.plotData ({redraw: true});
			$.cookie (thisX2Chart.cookiePrefix + 'secondMetric', '');
			if (!thisX2Chart.suppressChartSettings) {
				thisX2Chart.setChartSettingName ('');  
				$('#' + thisX2Chart.chartType + '-predefined-settings').change ();
			}
		});
		// setup metric selectors behavior
		$('#' + thisX2Chart.chartType + '-first-metric').change (function () {
			thisX2Chart.plotData ({redraw: true});
			$.cookie (thisX2Chart.cookiePrefix + 'firstMetric', $(this).val ());
			if (!thisX2Chart.suppressChartSettings) {
				thisX2Chart.setChartSettingName ('');  
				$('#' + thisX2Chart.chartType + '-predefined-settings').change ();
			}
		});
		$('#' + thisX2Chart.chartType + '-second-metric').change (function () {
			thisX2Chart.plotData ({redraw: true});
			$.cookie (thisX2Chart.cookiePrefix + 'secondMetric', $(this).val ());
			if (!thisX2Chart.suppressChartSettings) {
				thisX2Chart.setChartSettingName ('');  
				$('#' + thisX2Chart.chartType + '-predefined-settings').change ();
			}
		});
	} else if (thisX2Chart.chartSubtype === 'multiLine') {
		// initialize dropdown checklist
		$('#' + thisX2Chart.chartType + '-first-metric').multiselect2 ({
			'checkAllText': thisX2Chart.translations['Check all'],
			'uncheckAllText': thisX2Chart.translations['Uncheck all'],
			'selectedText': '# ' + thisX2Chart.translations['metric(s) selected']
		});
		// setup metric selector behavior
		$('#' + thisX2Chart.chartType + '-first-metric').bind ("multiselect2close", function (evt, ui) {
			var firstMetricVal = $(this).val ();
			firstMetricVal = firstMetricVal === null ? 'none' : firstMetricVal;
			$.cookie (thisX2Chart.cookiePrefix + 'firstMetric', firstMetricVal);
			DEBUG && console.log ('close multiselect');
			thisX2Chart.plotData ({redraw: true});
		});

		// default setting
		if (thisX2Chart.chartType === 'recordView') {
			$('#' + thisX2Chart.chartType + '-first-metric').children ().each (function () {
				$(this).attr ('selected', 'selected');
			});
		} else if (thisX2Chart.chartType === 'eventsChart') {
			$('#' + thisX2Chart.chartType + '-first-metric').children ().first ().attr ('selected', 'selected');
		}
		$('#' + thisX2Chart.chartType + '-first-metric').multiselect2 ('refresh');
	}
}


/*
Extracts saved settings from cookie and sets chart settings to them.
*/
X2Chart.prototype.setSettingsFromCookie = function () {
	var thisX2Chart = this;
	var startDate, endDate, firstMetric, secondMetric, userFilter, eventSubtypeFilter,
	    visibilityFilter;
	if (thisX2Chart.chartType === 'eventsChart') {
		startDate = $.cookie (thisX2Chart.cookiePrefix + 'startDate');
		endDate = $.cookie (thisX2Chart.cookiePrefix + 'endDate');
		firstMetric = $.cookie (thisX2Chart.cookiePrefix + 'firstMetric');
		secondMetric = $.cookie (thisX2Chart.cookiePrefix + 'secondMetric');
	} else if (thisX2Chart.chartType === 'recordView') {
		startDate = null;
		endDate = null;
		firstMetric = $.cookie (thisX2Chart.cookiePrefix + 'firstMetric');
		secondMetric = null;
	}

	if (thisX2Chart.chartType === 'eventsChart') {
		userFilter = $.cookie (thisX2Chart.cookiePrefix + 'userFilter');
		eventSubtypeFilter = $.cookie (thisX2Chart.cookiePrefix + 'userFilter');
		visibilityFilter = $.cookie (thisX2Chart.cookiePrefix + 'visibilityFilter');
	} else {
		userFilter = null;
		eventSubtypeFilter = null;
		visibilityFilter = null;
	}

	var binSize = $.cookie (thisX2Chart.cookiePrefix + 'binSize');
	var chartSetting = $.cookie (thisX2Chart.cookiePrefix + 'chartSetting');
	var showRelationships = $.cookie (thisX2Chart.cookiePrefix + 'showRelationships');

	DEBUG && console.log ('applying settings ');
	DEBUG && console.log ([
		startDate, endDate, binSize, firstMetric, secondMetric, chartSetting, 
		showRelationships, userFilter, eventSubtypeFilter, visibilityFilter]);

	thisX2Chart.applyChartSetting (
		startDate, endDate, binSize, firstMetric, secondMetric, chartSetting, 
		showRelationships, userFilter, eventSubtypeFilter, visibilityFilter);
}

/*
Selects chart setting from drop down. If the setting is not the custom setting,
the delete button is displayed.
*/
X2Chart.prototype.setChartSettingName = function (chartSetting) {
	var thisX2Chart = this;
	$('#' + thisX2Chart.chartType + '-predefined-settings').find ('option:selected').
		removeAttr ('selected');
	$('#' + thisX2Chart.chartType + '-predefined-settings').children ().each (function () {
		if ($(this).val () === chartSetting) {
			$(this).attr ('selected', 'selected');
			return false;
		}
	});
	DEBUG && console.log ('thisX2Chart.setChartSettingName: chartSetting = ' + chartSetting);
	if (chartSetting === '') {
		$('#' + thisX2Chart.chartType + '-delete-setting-button').hide ();
	} else {
		$('#' + thisX2Chart.chartType + '-delete-setting-button').fadeIn ();
	}
}

/*
Sets up behavior of ui elements related to chart setting selection, deletion, and 
creation. 
*/
X2Chart.prototype.setUpChartSettings = function () {
	var thisX2Chart = this;

	/*
	Performs a request to save a new chart setting to the server. Also applies
	the new chart setting.
	*/
	function createChartSetting (settingName) {
		var chartSettingAttributes = {};
		chartSettingAttributes['name'] = settingName;

		chartSettingAttributes['settings'] = {
			'startDate' : ($('#' + thisX2Chart.chartType + '-chart-datepicker-from').datepicker ('getDate').valueOf ()) / 1000,
			'endDate' : ($('#' + thisX2Chart.chartType + '-chart-datepicker-to').datepicker ('getDate').valueOf ()) / 1000,
			'binSize' : $('#' + thisX2Chart.chartType + '-bin-size-button-set a.disabled-link').attr ('id')
		}

		if (thisX2Chart.chartSubtype === 'twoLine') {
			chartSettingAttributes['settings']['metric1'] = 
				[$('#' + thisX2Chart.chartType + '-first-metric').val (), $('#second-metric').val ()];
		} else if (thisX2Chart.chartSubtype === 'multiLine') {
			chartSettingAttributes['settings']['metric1'] = $('#' + thisX2Chart.chartType + '-first-metric').val ();
		}

		$.ajax ({
			url: "createChartSetting",
			data: {
				'chartSettingAttributes': JSON.stringify (chartSettingAttributes)
			},
			success: function (data) {

				if (data === '') { // successful creation
					DEBUG && console.log ('createChartSetting ajax success');
					thisX2Chart.chartSettings[settingName] = chartSettingAttributes;
					$('#' + thisX2Chart.chartType + '-create-chart-setting-dialog').dialog ("close");

					// select new chart setting from drop down
					$('#' + thisX2Chart.chartType + '-predefined-settings').children ().removeAttr ('selected');
					$('#' + thisX2Chart.chartType + '-predefined-settings').append ($('<option>', {
						'value': settingName,
						'text': settingName
					}));
					thisX2Chart.setChartSettingName (settingName);
					$('#' + thisX2Chart.chartType + '-predefined-settings').change ();

				} else { // creation failed
					DEBUG && console.log (data);
					var respObj = JSON.parse (data);
					DEBUG && console.log (respObj);
					DEBUG && console.debug (respObj);
					DEBUG && console.log ('createChartSetting ajax failure');

					// display error messages
					destroyErrorBox ($('#' + thisX2Chart.chartType + '-create-chart-setting-dialog'));

					var errMsgs = Object.keys (respObj).map (function (key) { 
							return respObj[key]; 
						});
					var errorBox = createErrorBox ('', errMsgs);
					$('.chart-setting-name-input-container').after ($(errorBox));
					$('#' + thisX2Chart.chartType + '-chart-setting-name').addClass ('error');

				}

			}
		});

	}

	function dialogSaveButtonFocus (dialog) {
		var $buttonpane = $(dialog).next ();

		if ($buttonpane.find ('.dialog-cancel-button').
			hasClass ('highlight')) {

			$buttonpane.find ('button').
				removeClass ('highlight');	
			$buttonpane.find ('.dialog-save-button').addClass ('highlight');
		}
	}

	function dialogCancelButtonFocus (dialog) {
		DEBUG && console.log ('dialogCancelButtonFocus');
		var $buttonpane = $(dialog).next ();
		DEBUG && console.log ($buttonpane);

		if ($buttonpane.find ('.dialog-save-button').
			hasClass ('highlight')) {

			DEBUG && console.log ('if');
			$buttonpane.find ('button').
				removeClass ('highlight');	
			$buttonpane.find ('.dialog-cancel-button').addClass ('highlight');
		}
	}

	/*
	Sets up behavior of chart creation dialog box.
	*/
	(function setupChartSettingCreationDialog () {
		$('#' + thisX2Chart.chartType + '-create-chart-setting-dialog').hide();

		function clickChartSettingCreateButton () {
			var settingName = $('#' + thisX2Chart.chartType + '-chart-setting-name').val ();
			if (settingName === '') {
				$('#' + thisX2Chart.chartType + '-chart-setting-name').addClass ('error');
				destroyErrorBox ($('#' + thisX2Chart.chartType + '-create-chart-setting-dialog'));
				dialogCancelButtonFocus ($('#' + thisX2Chart.chartType + '-create-chart-setting-dialog'));
			} else {
				createChartSetting (settingName); 
			}
		}

		$("#create-chart-setting-dialog").find ("input").change (function () {
			DEBUG && console.log ('change');
			var $dialog = $('#' + thisX2Chart.chartType + '-create-chart-setting-dialog');
			dialogSaveButtonFocus ($('#' + thisX2Chart.chartType + '-create-chart-setting-dialog'));
		});

		$('#' + thisX2Chart.chartType + '-create-setting-button').click (function () {
			$("#create-chart-setting-dialog").dialog ({
				title: thisX2Chart.translations['Create Chart Setting'],
				autoOpen: true,
				height: "auto",
				width: 850,
				resizable: false,
				show: 'fade',
				hide: 'fade',
				buttons: [
					{ 
						text: thisX2Chart.translations['Create'],
						click: clickChartSettingCreateButton,
						class: 'dialog-save-button'
					},
					{ 
						text: thisX2Chart.translations['Cancel'],
						click: function () {
							$('#' + thisX2Chart.chartType + '-create-chart-setting-dialog').dialog ("close");
						},
						class: 'highlight dialog-cancel-button'
					}
				],
				close: function (event, ui) {
					$('#' + thisX2Chart.chartType + '-chart-setting-name').removeClass ('error');
					$('#' + thisX2Chart.chartType + '-chart-setting-name').val ('');
					destroyErrorBox ($('#' + thisX2Chart.chartType + '-create-chart-setting-dialog'));
				}
			});
		});
	}) ();

	$('#' + thisX2Chart.chartType + '-delete-setting-button').click (function (evt) {
		evt.preventDefault();
		var settingName = $('#' + thisX2Chart.chartType + '-predefined-settings').val ();
		$.ajax ({
			url: "deleteChartSetting",
			data: {
				'chartSettingName': settingName
			},
			success: function (data) {
				DEBUG && console.log ('delete-settings-button ajax call');
				DEBUG && console.log (data);
				if (data === 'success') {
					thisX2Chart.setChartSettingName ('');  
					$('#' + thisX2Chart.chartType + '-predefined-settings').change ();
					$('#' + thisX2Chart.chartType + '-predefined-settings').find (
						'[value="' + settingName + '"]').remove ();
				} 
			}
		});
	});

	/*
	Sets up behavior for predifined chart setting selection.
	*/
	$('#' + thisX2Chart.chartType + '-predefined-settings').change (function () {
		DEBUG && console.log ('predefined-settings: change');
		if ($(this).find (':selected').attr ('id') !== 
			thisX2Chart.chartType + '-custom-settings-option') {

			$('#' + thisX2Chart.chartType + '-delete-setting-button').fadeIn ();

			// extract chart settings
			var settingName = $(this).find (':selected').val ();
			DEBUG && console.log ('predefined-setting selected, name = ' + settingName);
			var chartSetting = thisX2Chart.chartSettings[settingName]['settings'];
			DEBUG && console.debug (chartSetting);
			var startDate = chartSetting['startDate'] * 1000;
			var endDate = chartSetting['endDate'] * 1000;
			var binSize = chartSetting['binSize'];
			var metric1 = chartSetting['metric1'];
			metric1 = metric1 === null ? [] : metric1;

			DEBUG && console.log ('applying chart settings ');
			DEBUG && console.log ([
				startDate,
				endDate,
				binSize,
				metric1,
				null,
				null]);

			thisX2Chart.applyChartSetting (
				startDate,
				endDate,
				binSize,
				metric1,
				null,
				null);

			thisX2Chart.getEventsBetweenDates (true);

			// update cookies with chart settings
			$.cookie (thisX2Chart.cookiePrefix + 'startDate', startDate);
			$.cookie (thisX2Chart.cookiePrefix + 'endDate', endDate);
			$.cookie (thisX2Chart.cookiePrefix + 'binSize', binSize);
			$.cookie (thisX2Chart.cookiePrefix + 'firstMetric', metric1);
			//$.cookie (thisX2Chart.cookiePrefix + 'secondMetric', metric2);
		} else {
			$('#' + thisX2Chart.chartType + '-delete-setting-button').hide ();
		}
		$.cookie (thisX2Chart.cookiePrefix + 'chartSetting', $(this).val ());
	});
}

X2Chart.prototype.setUpHideShowButtonBehavior = function () {
	var thisX2Chart = this;
	/*
	Show the chart when the show chart button is clicked
	*/
	$('#show-chart').click (function (evt) {
		evt.preventDefault();
		$('#' + thisX2Chart.chartType + '-chart-container').slideDown (450);
		if (thisX2Chart.feedChart !== null)
			thisX2Chart.feedChart.replot ({ resetAxes: false });
		$(this).hide ();
		$('#hide-chart').show ();
		$.cookie (thisX2Chart.cookiePrefix + 'chartIsShown', true);
	});

	/*
	Hide the chart when the hide chart button is clicked
	*/
	$('#hide-chart').click (function (evt) {
		evt.preventDefault();
		$('#' + thisX2Chart.chartType + '-chart-container').slideUp (450);
		$(this).hide ();
		$('#show-chart').show ();
		$.cookie (thisX2Chart.cookiePrefix + 'chartIsShown', false);
	});
}

X2Chart.prototype.setUpBinSizeSelection = function () {
	var thisX2Chart = this;
	$('#' + thisX2Chart.chartType + '-chart-container a.x2-button').click (function (evt) {
		evt.preventDefault ();
		if (!$(this).hasClass ('disabled-link')) {
			$('#' + thisX2Chart.chartType + '-chart-container a.disabled-link').removeClass ('disabled-link');
			$(this).addClass ('disabled-link');
			if (thisX2Chart.eventData !== null) {
				thisX2Chart.plotData ({redraw: true});
			}
			var binSize = 
				$('#' + thisX2Chart.chartType + '-bin-size-button-set a.disabled-link').attr ('id').
				replace (thisX2Chart.chartType + '-', '');
			$.cookie (thisX2Chart.cookiePrefix + 'binSize', binSize);
			if (!thisX2Chart.suppressChartSettings) {
				thisX2Chart.setChartSettingName ('');  
				$('#' + thisX2Chart.chartType + '-predefined-settings').change ();
			}
		}
	});
}










