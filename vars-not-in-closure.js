/**
 * Problem: Cannot inspect non-closure variable without re-running code
 */

function fakeAjax(url, callback) {
	setTimeout(function () {
		callback('Error: no search terms');
	}, 1000);
}

function search(query) {
	var url = 'http://search.com/doit?q=' + query;
	fakeAjax(url, function (results) {
		// why didn't it find the search terms? what was the query? the URL?
	});
}

search('&fish'); // ampersand won't be escaped
