// An object that represents a 2-d point, consisting of an
// x-coordinate and a y-coordinate. The `compareTo` function
// implements a comparison for sorting with respect to x-coordinates,
// breaking ties by y-coordinate.
function Point(x, y, id) {
  this.x = x;
  this.y = y;
  this.id = id;

  // Compare this Point to another Point p for the purposes of
  // sorting a collection of points. The comparison is according to
  // lexicographical ordering. That is, (x, y) < (x', y') if (1) x <
  // x' or (2) x == x' and y < y'.
  this.compareTo = function (p) {
    if (this.x > p.x) {
      return 1;
    }

    if (this.x < p.x) {
      return -1;
    }

    if (this.y > p.y) {
      return 1;
    }

    if (this.y < p.y) {
      return -1;
    }

    return 0;
  };

  // return a string representation of this Point
  this.toString = function () {
    return "(" + x + ", " + y + ")";
  };
}

// An object that represents a set of Points in the plane. The `sort`
// function sorts the points according to the `Point.compareTo`
// function. The `reverse` function reverses the order of the
// points. The functions getXCoords and getYCoords return arrays
// containing x-coordinates and y-coordinates (respectively) of the
// points in the PointSet.
function PointSet() {
  this.points = [];
  this.curPointID = 0;

  // create a new Point with coordintes (x, y) and add it to this
  // PointSet
  this.addNewPoint = function (x, y) {
    this.points.push(new Point(x, y, this.curPointID));
    this.curPointID++;
  };

  // add an existing point to this PointSet
  this.addPoint = function (pt) {
    this.points.push(pt);
  };

  // sort the points in this.points
  this.sort = function () {
    this.points.sort((a, b) => {
      return a.compareTo(b);
    });
  };

  // reverse the order of the points in this.points
  this.reverse = function () {
    this.points.reverse();
  };

  // return an array of the x-coordinates of points in this.points
  this.getXCoords = function () {
    let coords = [];
    for (let pt of this.points) {
      coords.push(pt.x);
    }

    return coords;
  };

  // return an array of the y-coordinates of points in this.points
  this.getYCoords = function () {
    let coords = [];
    for (pt of this.points) {
      coords.push(pt.y);
    }

    return coords;
  };

  // get the number of points
  this.size = function () {
    return this.points.length;
  };

  // return a string representation of this PointSet
  this.toString = function () {
    let str = "[";
    for (let pt of this.points) {
      str += pt + ", ";
    }
    str = str.slice(0, -2); // remove the trailing ', '
    str += "]";

    return str;
  };
}
