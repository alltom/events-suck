var catvas = $('div#catvas');
var cellSize = 100;
var grid, gridRows, gridCols;
var wipeCount = 0;
var imagesLoading = 0;

var loadingImage = function () {
  imagesLoading++;
  $('#spinner').show();
  $('#loaded').hide();
};
var loadedImage = function () {
  imagesLoading--;
  if (imagesLoading == 0) {
    $('#spinner').hide();
    $('#loaded').show();
  }
};

var place = function (row, col, rows, cols) {
  var dims = {
    position: 'absolute',
    left: col * cellSize,
    top: row * cellSize,
    width: cols * cellSize,
    height: rows * cellSize
  };
  var img = $('<img />');
  img.hide();
  img.css(dims);
  loadingImage();
  img.on('load', function () {
    setTimeout(function () {
      img.fadeIn(function () {
        loadedImage();
      });
    }, Math.random() * 1000);
  });

  // placekitten.com is too reliable! simulate a network error now and then
  if (Math.random() < 0.98) {
    img.attr('src', 'http://placekitten.com/' + dims.width + '/' + dims.height);
  } else {
    img.attr('src', 'http://placekitten.comf/' + dims.width + '/' + dims.height);
  }

  catvas.append(img);
  return img;
};

var flash = function (row, col, rows, cols) {
  var dims = {
    position: 'absolute',
    left: col * cellSize,
    top: row * cellSize,
    width: cols * cellSize,
    height: rows * cellSize
  };
  var box = $('<div />');
  box.css(dims);
  box.css({ background: 'red' });
  catvas.append(box);
  box.fadeOut();
};

var makeGrid = function (rows, cols) {
  var grid = new Array(rows);
  for (var r = 0; r < rows; r++) {
    grid[r] = new Array(cols);
  }
  return grid;
};

var fill = function (row, col, rows, cols) {
  var maxWidth = function (r, c) {
    for (var i = c; i < cols; i++) {
      if (grid[r][i]) return i - c;
    }
    return cols - c;
  };

  var maxHeight = function (r, c) {
    for (var i = r; i < rows; i++) {
      if (grid[i][c]) return i - r;
    }
    return rows - r;
  };

  var occupy = function (r, c, rs, cs, val) {
    for (var i = r; i < r + rs; i++) {
      for (var j = c; j < c + cs; j++) {
        grid[i][j] = val;
      }
    }
  };

  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      var mw = maxWidth(r, c),
          mh = maxHeight(r, c);
      if (mw == 0 || mh == 0) continue;

      var w = Math.floor(1 + Math.random() * mw),
          h = Math.floor(1 + Math.random() * mh);

      occupy(r, c, h, w, place(r, c, h, w));
    }
  }
};

var refresh = function () {
  var removeAll = function (img) {
    for (var r = 0; r < gridRows; r++) {
      for (var c = 0; c < gridCols; c++) {
        if (grid[r][c] === img) {
          delete grid[r][c];
        }
      }
    }
  };

  var wipeOut = function (r, c, rs, cs) {
    var finishHim = function (img) {
      img.fadeOut(function () { img.remove(); });
    };
    for (var i = r; i < r + rs; i++) {
      for (var j = c; j < c + cs; j++) {
        var img = grid[i][j];
        if (img) {
          finishHim(img);
          removeAll(img);
        }
      }
    }
  };

  if (wipeCount % 5 == 4) {
    // flash(0, 0, gridRows, gridCols);
    wipeOut(0, 0, gridRows, gridCols);
  } else {
    var r1 = Math.floor(Math.random() * gridRows);
    var r2 = Math.floor(Math.random() * gridRows);
    var c1 = Math.floor(Math.random() * gridCols);
    var c2 = Math.floor(Math.random() * gridCols);
    if (r2 < r1) { var tmp = r1; r1 = r2; r2 = tmp; }
    if (c2 < c1) { var tmp = c1; c1 = c2; c2 = tmp; }
    flash(r1, c1, r2 - r1, c2 - c1);
    wipeOut(r1, c1, r2 - r1, c2 - c1);
  }
  wipeCount++;

  loadingImage();
  setTimeout(function () {
    fill(0, 0, gridRows, gridCols);
    loadedImage();
  }, 1000);
};

setInterval(refresh, 5000);
$(window).resize(_.debounce(init, 300));

var init = function () {
  catvas.empty();
  gridRows = Math.floor(($(window).innerHeight() - catvas.offset().top) / cellSize),
  gridCols = Math.floor(catvas.innerWidth() / cellSize);
  grid = makeGrid(gridRows, gridCols);
  fill(0, 0, gridRows, gridCols);
};

init();
