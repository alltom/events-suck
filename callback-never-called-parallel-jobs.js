/**
 * Problem: Some 'threads' in a parallel job silently bail, no easy way to tell why the whole job never completes
 */

function fakeAjax(url, options) {
	setTimeout(function () {
		if (Math.random() < 0.9) {
			if (options.success) options.success();
		} else {
			if (options.error) options.error();
		}
	}, 1000);
}

function downloadAll(urls, callback) {
	var completed = 0;
	for (var i in urls) {
		var url = urls[i];
		fakeAjax(url, {
			success: function () {
				completed++;
				if (completed == urls.length) {
					callback();
				}
			}
		})
	}
}

downloadAll(['a', 'b', 'c', 'd', 'e'], function () {
	// sometimes, we never get here!
	alert('done!');
});
