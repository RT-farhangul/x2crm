(function() {
	//more button
	var total_step = 0;

	function step_1() {

		var content = "Click on the More button";
		content += "<br><br>";
		content += "<progress value='1' max='4'></progress>";
		console.log("trying step 1");
		$("#more-menu").popover({
			placement: "bottom",
			trigger: "manual",
			title: "Changing your calendar permssions",
			html: true,
			content: content
		});

		//hide popover
		$($("#more-menu").children()[0]).click(function() {
			$('#more-menu').popover("hide");
			step_2();
		});

		//check if calendar is visible..then show immediately
		//using setTimeout for now..later onclick
		$('#more-menu').popover("show");
	}
	//calendar button
	function step_2() {
		if (endsWith(window.location.pathname, "index.php/site/whatsNew")) {
			console.log("trying step 2");
			var $item, $link;
			if (total_step == 4) {
				$item = $("#more-menu").find("[data-title='calendar']");
				$link = $($item.children()[0]);
			} else {
				$link = $("[data-title='calendar']");
			}
			var linkName = $link.attr("href");
			console.log(linkName);
			if (!endsWith(linkName, "tour=true")) {
				$link.attr("href", linkName + "?tour=true");
				var content = "Click on the Calendar button";
				content += "<br><br>";
				content += "<progress value='2' max='4'></progress>";
				$item.popover({
					html: true,
					placement: "right",
					trigger: "manual",
					title: "Changing your calendar permssions",
					content: content
				});
			}
			$item.popover("show");
		}
	}

	function step_3() {
		if (getParameterByName("tour") == "true") {
			console.log("trying step 3");
			var $elem = $('#actions').find('a[href$="index.php/calendar/myCalendarPermissions"]');
			var linkName = $elem.attr("href");
			if (!endsWith(linkName, "tour=true")) {
				$elem.attr("href", linkName + "?tour=true");
				var content = "Click on the My Calendar Permissions button";
				content += "<br><br>";
				content += "<progress value='3' max='4'></progress>";
				$elem.popover({
					html: true,
					placement: "right",
					trigger: "manual",
					title: "Changing your calendar permssions",
					content: content
				});
			}
			$elem.popover("show");
		}
	}

	function step_4() {
		if (endsWith(window.location.pathname, "index.php/calendar/myCalendarPermissions")) {
			if (getParameterByName("tour") == "true") {
				console.log("trying step 4");
				var $elem = $("#save-button");
				console.log($elem);
				var content = "Click on the Save button once you are done!";
				content += "<br><br>";
				content += "<progress value='4' max='4'></progress>";
				$elem.popover({
					html: true,
					placement: "right",
					trigger: "manual",
					title: "Changing your calendar permssions",
					content: content
				});
				$elem.popover("show");
			}
		}
	}
	$(document).ready(function() {
		if (endsWith(window.location.pathname, "index.php/site/whatsNew")) {
			if (true) {
				total_step = 4;
				$('#start-tour').click(step_1);
			} else {
				total_step = 3;
				$('#start-tour').click(step_2);
			}
		}
		if (endsWith(window.location.pathname, "index.php/calendar/index")) {
			step_3();
		}
		setTimeout(step_4, 100);
	});



	//utility functions
	function getParameterByName(name) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
			results = regex.exec(location.search);
		return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}

	function endsWith(str, suffix) {
		return str.indexOf(suffix, str.length - suffix.length) !== -1;
	}

})();