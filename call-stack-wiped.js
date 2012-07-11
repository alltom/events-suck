/**
 * Problem: The call stack is wiped after an asynchronous call
 */

function fakeAjax(url, data, callback) {
	setTimeout(function () {
		callback('Error: missing event code')
	}, 1000);
}

function keyPressed(ev) {
	sendEvent({ keyboard: ev.key });
}

function mouseButtonPressed(ev) {
	sendEvent({ keyboard: ev.key }); // copy-paste error
}

function sendEvent(ev) {
	fakeAjax('http://event-reporter.com/report', JSON.stringify(ev), function (response) {
		// why is the event code missing? where did 'ev' come from?
	});
}

mouseButtonPressed({ button: 1 });
