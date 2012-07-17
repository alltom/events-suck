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
  var occupy = function (r, c, rs, cs, val) {
    for (var i = r; i < r + rs; i++) {
      for (var j = c; j < c + cs; j++) {
        grid[i][j] = val;
      }
    }
  };

  var feasible = function (r, c, rs, cs) {
    if (r + rs > gridRows || c + cs > gridCols) {
      return false;
    }
    for (var i = r; i < r + rs; i++) {
      for (var j = c; j < c + cs; j++) {
        if (grid[i][j]) {
          return false;
        }
      }
    }
    return true;
  };

  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      if (!grid[r][c]) {
        var rs = 1, cs = 1;
        var rdone = false, cdone = false;
        while (true) {
          if (!rdone && Math.random() < 0.5) {
            if (feasible(r, c, rs + 1, cs)) {
              rs++;
            } else {
              rdone = true;
            }
          } else {
            if (feasible(r, c, rs, cs + 1)) {
              cs++;
            } else {
              cdone = true;
            }
          }
          if (rdone && cdone) {
            break;
          }
        }
        rs = Math.floor(1 + Math.random() * rs);
        cs = Math.floor(1 + Math.random() * cs);
        occupy(r, c, rs, cs, place(r, c, rs, cs));
      }
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
    var r1 = Math.floor(Math.random() * (gridRows + 1));
    var r2 = Math.floor(Math.random() * (gridRows + 1));
    var c1 = Math.floor(Math.random() * (gridCols + 1));
    var c2 = Math.floor(Math.random() * (gridCols + 1));
    if (r2 < r1) { var tmp = r1; r1 = r2; r2 = tmp; }
    if (c2 < c1) { var tmp = c1; c1 = c2; c2 = tmp; }
    if (r1 != r2 && c1 != c2) {
      flash(r1, c1, r2 - r1, c2 - c1);
      wipeOut(r1, c1, r2 - r1, c2 - c1);
    }
  }
  wipeCount++;

  loadingImage();
  setTimeout(function () {
    fill(0, 0, gridRows, gridCols);
    loadedImage();
  }, 1000);
};

var init = function () {
  catvas.empty();
  gridRows = Math.floor(($(window).innerHeight() - catvas.offset().top) / cellSize),
  gridCols = Math.floor(catvas.innerWidth() / cellSize);
  grid = makeGrid(gridRows, gridCols);
  fill(0, 0, gridRows, gridCols);
};

init();

setInterval(refresh, 5000);
$(window).resize(_.debounce(init, 300));
