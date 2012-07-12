/**
 * Problem: Callback is never invoked due to a caught exception
 */

function fakeAjax(url, callback) {
	setTimeout(function () {
		try {
			callback('{ "puppies" : ["arf", "woof"] '); // missing closing brace
		} catch (e) {
		}
	}, 1000);
}

function downloadPuppies(callback) {
	fakeAjax('http://puppies.com/puppies.json', function (json) {
		var puppies = JSON.parse(json).puppies; // exception!
		callback(puppies);
	})
}

downloadPuppies(function (puppies) {
	// why do the puppies never get here?
	alert('There are ' + puppies.length + ' puppies!');
});
