navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
// Receiving a call
peer.on('call', function(call) {
	step2();
	// Answer the call automatically (instead of prompting user) for demo purposes
	call.answer(window.localStream);
	step3(call);
});
peer.on('error', function(err) {
	alert(err.message);
	// Return to step 2 if error occurs
	step2();
});

// Click handlers setup
$(function() {
	$('#make-call').click(function() {
		step2();
		// Initiate a call!
		var call = peer.call(CONSTANTS.OTHER_ID, window.localStream);

		step3(call);
	});

	$('#end-call').click(function() {
		window.existingCall.close();
		step21();
	});

	// Retry if getUserMedia fails
	$('#step1-retry').click(function() {
		$('#step1-error').hide();
		step1();
	});

	// Get things started
	step1();
	$('#step3').hide();
	$('#step1-error').hide();
});

function step1() {
	// Get audio/video stream
	navigator.getUserMedia({
		audio: true,
		video: true
	}, function(stream) {
		// Set your video displays
		$('#my-video').prop('src', URL.createObjectURL(stream));

		window.localStream = stream;
		step2();
	}, function() {
		$('#step1-error').show();
	});
}

function step2() {
	console.log("step2");
	$('#step1, #step3').hide();
	$('#step2').show();
	$('#their-video-container').show();
}

function step21() {
	step2();
	$('#their-video-container').hide();
}

function step3(call) {
	// Hang up on an existing call if present
	if (window.existingCall) {
		window.existingCall.close();
	}

	// Wait for stream on the call, then set peer video display
	call.on('stream', function(stream) {
		$('#their-video').prop('src', URL.createObjectURL(stream));
	});

	// UI stuff
	window.existingCall = call;
	$('#their-id').text(call.peer);
	call.on('close', step21);
	$('#step1, #step2').hide();
	$('#step3').show();
}