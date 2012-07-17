var catvas = $('div#catvas');
var cellSize = 100;
var spinner;

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

var Spinner = function () {
  this.imagesLoading = 0;
};
Spinner.prototype = {
  loadingImage: function () {
    this.imagesLoading++;
    $('#spinner').show();
    $('#loaded').hide();
  },

  loadedImage: function () {
    this.imagesLoading--;
    if (this.imagesLoading == 0) {
      $('#spinner').hide();
      $('#loaded').show();
    }
  }
};

var Cat = function () {
};
Cat.prototype = {
  place: function (row, col, rows, cols) {
    var dims = {
      position: 'absolute',
      left: col * cellSize,
      top: row * cellSize,
      width: cols * cellSize,
      height: rows * cellSize
    };
    var img = this.img = $('<img />');
    this.img.hide();
    this.img.css(dims);

    spinner.loadingImage();
    this.img.on('load', _.bind(this._loaded, this));

    // placekitten.com is too reliable! simulate a network error now and then
    if (Math.random() < 0.98) {
      this.img.attr('src', 'http://placekitten.com/' + dims.width + '/' + dims.height);
    } else {
      this.img.attr('src', 'http://placekitten.comf/' + dims.width + '/' + dims.height);
    }

    catvas.append(this.img);
    return this.img;
  },

  _loaded: function () {
    setTimeout(_.bind(this._afterLoadDelay, this), Math.random() * 1000);
  },

  _afterLoadDelay: function () {
    this.img.fadeIn(_.bind(this._fadedIn, this));
  },

  _fadedIn: function () {
    spinner.loadedImage();
  },

  expire: function () {
    this.img.fadeOut(_.bind(this._fadedOut, this));
  },

  _fadedOut: function () {
    this.img.remove();
  }
}

var CatPlanner = function () {
  this.wipeCount = 0;
};
CatPlanner.prototype = {
  init: function () {
    this.reset();
  },

  reset: function () {
    catvas.empty();
    this.gridRows = Math.floor(($(window).innerHeight() - catvas.offset().top) / cellSize),
    this.gridCols = Math.floor(catvas.innerWidth() / cellSize);
    this.grid = this._makeGrid(this.gridRows, this.gridCols);
    this._fill(0, 0, this.gridRows, this.gridCols);
  },

  _makeGrid: function (rows, cols) {
    var grid = new Array(rows);
    for (var r = 0; r < rows; r++) {
      grid[r] = new Array(cols);
    }
    return grid;
  },

  _fill: function (row, col, rows, cols) {
    var self = this;

    var occupy = function (r, c, rs, cs, val) {
      for (var i = r; i < r + rs; i++) {
        for (var j = c; j < c + cs; j++) {
          self.grid[i][j] = val;
        }
      }
    };

    var feasible = function (r, c, rs, cs) {
      if (r + rs > self.gridRows || c + cs > self.gridCols) {
        return false;
      }
      for (var i = r; i < r + rs; i++) {
        for (var j = c; j < c + cs; j++) {
          if (self.grid[i][j]) {
            return false;
          }
        }
      }
      return true;
    };

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if (!this.grid[r][c]) {
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

          var cat = new Cat;
          cat.place(r, c, rs, cs);
          occupy(r, c, rs, cs, cat);
        }
      }
    }
  },

  refresh: function () {
    var self = this;

    var removeAll = function (cat) {
      for (var r = 0; r < self.gridRows; r++) {
        for (var c = 0; c < self.gridCols; c++) {
          if (self.grid[r][c] === cat) {
            delete self.grid[r][c];
          }
        }
      }
    };

    var wipeOut = function (r, c, rs, cs) {
      for (var i = r; i < r + rs; i++) {
        for (var j = c; j < c + cs; j++) {
          var cat = self.grid[i][j];
          if (cat) {
            cat.expire();
            removeAll(cat);
          }
        }
      }
    };

    if (this.wipeCount % 5 == 4) {
      // flash(0, 0, this.gridRows, this.gridCols);
      wipeOut(0, 0, this.gridRows, this.gridCols);
    } else {
      var r1 = Math.floor(Math.random() * (this.gridRows + 1));
      var r2 = Math.floor(Math.random() * (this.gridRows + 1));
      var c1 = Math.floor(Math.random() * (this.gridCols + 1));
      var c2 = Math.floor(Math.random() * (this.gridCols + 1));
      if (r2 < r1) { var tmp = r1; r1 = r2; r2 = tmp; }
      if (c2 < c1) { var tmp = c1; c1 = c2; c2 = tmp; }
      if (r1 != r2 && c1 != c2) {
        flash(r1, c1, r2 - r1, c2 - c1);
        wipeOut(r1, c1, r2 - r1, c2 - c1);
      }
    }
    this.wipeCount++;

    spinner.loadingImage();
    setTimeout(_.bind(this._afterLoadDelay, this), 1000);
  },

  _afterLoadDelay: function () {
    this._fill(0, 0, this.gridRows, this.gridCols);
    spinner.loadedImage();
  }
};

$(function () {
  spinner = new Spinner;

  var planner = new CatPlanner;
  planner.init();
  setInterval(_.bind(planner.refresh, planner), 20000);
  $(window).resize(_.debounce(_.bind(planner.reset, planner), 500));
});
