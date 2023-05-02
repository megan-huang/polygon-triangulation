const SVG_NS = "http://www.w3.org/2000/svg"; // SVG namespace
const ROOT_ELEM = document.querySelector("#root"); // Root element
let SVG_ELEM = document.querySelector("#canvas"); // SVG element

//start of code for ear clipping

//useful functions

//cross product
function cross(v1, v2) {
  return v1.x * v2.y - v1.y * v2.x;
}

//uses the class Vector

function areaOfTriangle(a, b, c) {
  let area = Math.abs(0.5 * cross(b.subtract(a), c.subtract(a)));
  return area;
}

function pointInTriangle(p, a, b, c) {
  let outerTri = areaOfTriangle(a, b, c);
  let innerTri1 = areaOfTriangle(a, b, p);
  let innerTri2 = areaOfTriangle(a, c, p);
  let innerTri3 = areaOfTriangle(b, c, p);

  let sum = innerTri1 + innerTri2 + innerTri3;

  if (sum == outerTri) {
    return true;
  } else {
    return false;
  }

  // let ab = b.subtract(a); //a pointing to b
  // let bc = c.subtract(b); //b pointing to c
  // let ca = a.subtract(c); //c pointing to a

  // let ap = p.subtract(a);
  // let bp = p.subtract(b);
  // let cp = p.subtract(c);

  // let cross1 = cross(ab, ap);
  // let cross2 = cross(bc, bp);
  // let cross3 = cross(ca, cp);

  // //point is not in the triangle
  // if (cross1 > 0 || cross2 > 0 || cross3 > 0) {
  //     return false;
  // }

  // return true;
}

//circular array access
function accessArray(array, index) {
  if (index >= array.length) {
    return index % array.length;
  } else if (index < 0) {
    return (index % array.length) + array.length;
  } else {
    return index;
  }
}

//in: array for vertices (Vectors)
//optionally, could make it return boolean
//creates array for triangles (ints)
//the array vertices must contain instances of the Vector class!
//takes in a simple polygon
//reference: https://www.geometrictools.com/Documentation/TriangulationByEarClipping.pdf and https://www.youtube.com/watch?v=QAdfkylpYwc
function Triangulation(vertices) {
  //error
  if (vertices.length < 3) {
    console.log("Needs at least 3 vertices.");
  }
  if (vertices.length == null) {
    console.log("Vertex list is null.");
  }

  // let triangles = []; //output triangles

  let indices = [];

  for (i = 0; i < vertices.length; i++) {
    indices.push(vertices[i]); //populate indices with vertices
  }

  let totalTriCount = vertices.length - 2;

  let totalTriIndexCount = totalTriCount * 3; //length

  let triangles = []; //integer array

  let curIndex = 0;
  while (indices.length > 3) {
    //continue checking for ears
    for (i = 0; i < indices.length; i++) {
      //get cur, prev, next
      let a = i;
      let b = accessArray(indices, i - 1);
      let c = accessArray(indices, i + 1);

      //if cross product of ab and ac is positive, interior angle is convex
      //check if angle is convex (is ear)
      let va = indices[a];
      let vb = indices[b];
      let vc = indices[c];

      let va_to_vb = vb.subtract(va);
      let va_to_vc = vc.subtract(va);

      //check if cross is less than 0
      if (cross(va_to_vb, va_to_vc) > 0) {
        console.log("reflex");
        continue; //next iteration
      }

      // console.log("va", va);
      // console.log("vb", va_to_vb);
      // console.log("vc", va_to_vc);

      isEar = true; //boolean

      for (j = 0; j < indices.length; j++) {
        let va = indices[a];
        let vb = indices[b];
        let vc = indices[c];

        if (j == a || j == b || j == c) {
          console.log(j, a, b, c);
          continue;
        }
        p = indices[j]; //vector p

        if (pointInTriangle(p, vb, va, vc)) {
          //if inside the triangle, NOT an ear
          // console.log("inside");
          console.log("PIT", vb, va, vc, p);
          isEar = false;
          break;
        }
      }

      console.log(isEar);
      // console.log(va,vb,vc);

      //adding triangle vertices
      if (isEar) {
        let tri = new Triangle(va, vb, vc);
        triangles[curIndex++] = tri;
        indices.splice(a, 1); //remove found ears
        break;
      }
    }
  }

  //adding last three vertices (last triangle left)
  let tri = new Triangle(indices[0], indices[1], indices[2]);
  triangles[curIndex++] = tri;

  //   console.log(triangles);

  for (let i = 0; i < triangles.length; i++) {
    console.log(triangles[i]);
  }

  return triangles;
}

class Triangle {
  constructor(tri1, tri2, tri3) {
    this.array = [tri1, tri2, tri3];
  }

  makePolygon(id) {
    let str = "";

    for (let i = 0; i < this.array.length; i++) {
      str = str + this.array[i].x + "," + this.array[i].y + " ";
    }

    console.log("make polygon str", str);

    let newPolygon = new Polygon(str, id);
    return newPolygon;
  }

  toString() {
    return "{" + this.array[0] + this.array[1] + this.array[2] + "}";
  }
}

//implementation of needed vector operations
class Vector {
  constructor(x, y, id) {
    this.x = x;
    this.y = y;
    this.id = id;
  }

  add(other) {
    return new Vector(this.x + other.x, this.y + other.y);
  }

  subtract(other) {
    return new Vector(this.x - other.x, this.y - other.y);
  }

  // multiply(scalar) {
  //     return new Vector2(this.x * scalar, this.y * scalar);
  // }

  cross(other) {
    return this.x * other.y - this.y * other.x;
  }
}

// let a = new Vector(0, 0, 0);
// let b = new Vector(3, 1, 1);
// let c = new Vector(6, 0, 2);
// let d = new Vector(5, 2, 3);
// let e = new Vector(1, 3, 4);

let a = new Vector(100, 300, 0);
let b = new Vector(400, 200, 1);
let c = new Vector(550, 250, 2);
let d = new Vector(600, 20, 3);
let e = new Vector(700, 100, 4);
let f = new Vector(750, 350, 5);
let g = new Vector(450, 400, 6);
let testVertices = [a, b, c, d, e, f, g];

function vectorsToString(vertices) {
  let str = "";
  for (let i = 0; i < vertices.length; i++) {
    let x = vertices[i].x;
    let y = vertices[i].y;
    let id = vertices[i].id;

    str = str + x + "," + y + " ";
  }
  return str;
}

// vectorsToString(testVertices);

// Triangulation(testVertices);

// let p = new Vector(10,10);
// let a1 = new Vector(0, 4);
// let b1 = new Vector(5, 0);
// let c1 = new Vector(0, 0);

// console.log(pointInTriangle(p, a1, b1, c1));

/**
 * TODO:
 * - Fix draggable capability for newly created polygons
 * - "Scatter" method
 * - Change background to a "guide" shape
 * - Convert array of points to "polygon" points string
 * - Expand SVG to whole screen
 * - Draw own polygon
 * - Make polygons of width 0 not there
 * - Fix why it doesn't work for square?
 * - Animate step by step
 * - Rotation
 * - Don't make polygons draggable until triangulated
 */

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
  // this.compareTo = function (p) {
  //   if (this.x > p.x) {
  //     return 1;
  //   }

  //   if (this.x < p.x) {
  //     return -1;
  //   }

  //   if (this.y > p.y) {
  //     return 1;
  //   }

  //   if (this.y < p.y) {
  //     return -1;
  //   }

  //   return 0;
  // };

  // return a string representation of this Point
  this.toString = function () {
    return "(" + x + ", " + y + ")";
  };
}

function Polygon(pts, id) {
  this.pts = pts; // String representation of points
  this.id = id;

  this.stringToVectors = function () {
    let arr = pts.split(" ");
    let vectors = [];

    for (let i = 0; i < arr.length; i++) {
      let coords = arr[i].split(",");
      let vec = new Vector(coords[0], coords[1], i);
      vectors.push(vec);
    }

    return vectors;
  };

  this.triangulate = function () {
    let vectors = this.stringToVectors();
    console.log("got to triangulation with vectors", vectors);

    let triArray = Triangulation(vectors);
    let polyArray = [];

    console.log("triarray", triArray);

    for (let i = 0; i < triArray.length; i++) {
      polyArray.push(triArray[i].makePolygon(i));
    }

    return polyArray;
  };
}

function makeDraggable(evt) {
  console.log("in make draggable");
  // This code was heavily inspired by the source:
  // https://www.petercollingridge.co.uk/tutorials/svg/interactive/dragging/
  var svg = evt.target;
  var dragTarget = null;
  var offset = null;

  // Add event listeners for mouse interactions
  svg.addEventListener("mousedown", startDrag);
  svg.addEventListener("mousemove", drag);
  svg.addEventListener("mouseup", endDrag);
  svg.addEventListener("mouseleave", endDrag);

  function startDrag(evt) {
    // If the target SVG is draggable
    if (evt.target.classList.contains("draggable")) {
      dragTarget = evt.target;
      console.log("started");

      // Get the current mouse position and current transforms
      offset = getMousePosition(evt);
      var transforms = dragTarget.transform.baseVal;

      //
      if (
        transforms.length === 0 ||
        transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE
      ) {
        // Create an transform that translates by (0, 0)
        var translate = svg.createSVGTransform();
        translate.setTranslate(0, 0);
        // Add the translation to the front of the transforms list
        dragTarget.transform.baseVal.insertItemBefore(translate, 0);
      }
      // Get initial translation amount
      transform = transforms.getItem(0);
      offset.x -= transform.matrix.e;
      offset.y -= transform.matrix.f;
    }
  }
  function drag(evt) {
    if (dragTarget != null) {
      evt.preventDefault();
      var coord = getMousePosition(evt);
      transform.setTranslate(coord.x - offset.x, coord.y - offset.y);
      console.log("got to dragging");
    }
  }
  function endDrag(evt) {
    dragTarget = null;
  }

  function getMousePosition(evt) {
    var CTM = svg.getScreenCTM();
    return {
      x: (evt.clientX - CTM.e) / CTM.a,
      y: (evt.clientY - CTM.f) / CTM.d,
    };
  }
}

function PresetPolygons() {
  const rabbit = new Polygon(
    "100,150 150,50 200,150 200,200 350,200 450,120 450,200 400,300 400,400 350,350 350,300 200,300 250,250 100,150",
    1
  );
  // const square = new Polygon("100,300 300,300 300,100 100,100", 2);
  const star = new Polygon(
    "100,300 400,200 550,250 600,20 700,100 750,350 450,400",
    3
  );
  const polygons = [rabbit, star];

  let curr = 0;

  this.getNewPolygon = function () {
    curr = (curr + 1) % polygons.length;
    console.log(curr, "polygon length", polygons.length);
    return polygons[curr];
  };
}

function Visualizer(svg) {
  this.svg = svg;
  this.polygons = [];
  this.polygon_elems = [];
  this.presets = new PresetPolygons();

  this.addPolygon = function (pgn) {
    this.polygons.push(pgn);
  };

  this.changePreset = function () {
    this.polygons = [this.presets.getNewPolygon()];
    console.log(this.polygons);
  };

  this.drawPolygons = function () {
    // let polys = this.polygons[0].triangulate();
    console.log("polys", this.polygons);

    for (let i = 0; i < this.polygons.length; i++) {
      const newPolygon = document.createElementNS(SVG_NS, "polygon");
      points = this.polygons[i].pts;
      console.log("this polygon's points", this.polygons[i]);
      newPolygon.setAttributeNS(null, "points", points);
      newPolygon.classList.add("draggable");

      const hue = Math.floor(Math.random() * 255);
      newPolygon.setAttributeNS(null, "fill", "hsl(" + hue + ", 100%, 85%)");
      newPolygon.setAttributeNS(null, "stroke", "hsl(" + hue + ", 100%, 15%)");
      newPolygon.setAttributeNS(
        null,
        "transform",
        "matrix(1, 0, 0, -1, 0, 500)"
      );

      // makeDraggable(svg);
      svg.appendChild(newPolygon);
      this.polygon_elems.push(newPolygon);

      // console.log(this.polygons[i].triangulate());
    }
  };

  this.triangulate = function () {
    console.log("getting to inner triangulate", this.polygons);
    let tris = [];
    for (let i = 0; i < this.polygons.length; i++) {
      console.log("hello?");
      let triangulation = this.polygons[i].triangulate();
      for (let j = 0; j < triangulation.length; j++) {
        tris.push(triangulation[j]);
      }
      // tris.push(this.polygons[i].triangulate());
      console.log("inner", tris[i]);
    }

    console.log("tris at the end", tris);
    this.polygons = [];

    for (let i = 0; i < tris.length; i++) {
      this.polygons.push(tris[i]);
    }

    // this.polygons = tris;
  };
}

const vis = new Visualizer(SVG_ELEM);
const polygon = new Polygon(
  "100,300, 400,200 550,250 600,20 700,100 750,350, 450,400",
  1
);
vis.addPolygon(polygon);
vis.drawPolygons();

// Create a new clear SVG canvas.
let createNewSVG = function () {
  SVG_ELEM.innerHTML = "";
  // let newSVG = document.createElementNS(SVG_NS, "svg");
  // newSVG.setAttributeNS(null, "id", "canvas");
  // newSVG.setAttributeNS(null, "width", "900");
  // newSVG.setAttributeNS(null, "height", "500");
  // newSVG.setAttributeNS(null, "fill", "white");
  // newSVG.setAttributeNS(null, "onload", "makeDraggable(evt)");
  // let rect = document.createElementNS(SVG_NS, "rect");
  // rect.setAttributeNS(null, "width", "900");
  // rect.setAttributeNS(null, "height", "500");
  // rect.setAttributeNS(null, "fill", "white");
  // // rect.setAttributeNS(null, "transform", "matrix(1, 0, 0, -1, 0, 500)");
  // newSVG.appendChild(rect);
  // ROOT_ELEM.removeChild(SVG_ELEM);
  // SVG_ELEM = newSVG;
  // ROOT_ELEM.appendChild(SVG_ELEM);
  // const vis = new Visualizer(SVG_ELEM);
  // let poly = vis.presets.getNewPolygon();
  vis.changePreset();
  vis.drawPolygons();
  // vis.triangulate();
  // vis.drawPolygons();
};

function visualizeTriangulation() {
  vis.triangulate();
  vis.drawPolygons();
}

// const vis = new Visualizer(SVG_ELEM);
// const polygon = new Polygon(
//   "100,300, 400,200 550,250 600,20 700,100 750,350, 450,400",
//   1
// );
// vis.addPolygon(polygon);
// vis.drawPolygons();

/**
 *
 * MAY OR MAY NOT NEED POINT SET IN THE FUTURE.
 *
 */

// An object that represents a set of Points in the plane. The `sort`
// function sorts the points according to the `Point.compareTo`
// function. The `reverse` function reverses the order of the
// points. The functions getXCoords and getYCoords return arrays
// containing x-coordinates and y-coordinates (respectively) of the
// points in the PointSet.
// function PointSet() {
//   this.points = [];
//   this.curPointID = 0;

//   // create a new Point with coordintes (x, y) and add it to this
//   // PointSet
//   this.addNewPoint = function (x, y) {
//     this.points.push(new Point(x, y, this.curPointID));
//     this.curPointID++;
//   };

//   // add an existing point to this PointSet
//   this.addPoint = function (pt) {
//     this.points.push(pt);
//   };

//   // sort the points in this.points
//   this.sort = function () {
//     this.points.sort((a, b) => {
//       return a.compareTo(b);
//     });
//   };

//   // reverse the order of the points in this.points
//   this.reverse = function () {
//     this.points.reverse();
//   };

//   // return an array of the x-coordinates of points in this.points
//   this.getXCoords = function () {
//     let coords = [];
//     for (let pt of this.points) {
//       coords.push(pt.x);
//     }

//     return coords;
//   };

//   // return an array of the y-coordinates of points in this.points
//   this.getYCoords = function () {
//     let coords = [];
//     for (pt of this.points) {
//       coords.push(pt.y);
//     }

//     return coords;
//   };

//   // get the number of points
//   this.size = function () {
//     return this.points.length;
//   };

//   // return a string representation of this PointSet
//   this.toString = function () {
//     let str = "[";
//     for (let pt of this.points) {
//       str += pt + ", ";
//     }
//     str = str.slice(0, -2); // remove the trailing ', '
//     str += "]";

//     return str;
//   };
// }

/**
 *
 *
 * TRIANGULATION.JS
 *
 *
 */

//visualization and properties

//construction of DCEL (doubly connected edge list)

//add diagonal

//algorithm

// function FastTriangulation(polygon) {

//     //part 1: partitioning into y-monotone polygons using plane sweep method
//     //getting rid of turn vertices (merge and split vertices) by adding diagonals

//     //part 2: triangulation of monotone parts (greedy)
//     //single pass from top to bottom, invariants: top vertex convex
//     //input: y-monotone polygon (monotoneP) stored in a doubly connected edge list
//     //output: triangulation of monotoneP soted in a doubly-connected edge list D
//     function triangulateMontone(monotoneP) {
//         this.monotoneP.sort(); //need a method that sorts the points into one sequence by decreasing y-coordinate (choose left point to break ties)

//         let stack = []; //empty stack (for not yet triangulated vertices)

//         stack.push(monotoneP[0]);
//         stack.push(monotoneP[1]);

//         for (j = 2; j = monotoneP.size - 1; j++) {
//             //need method to check is point is on right or left chain
//             //if on different chains
//             if (monotoneP[j].isRight && stack[0].isLeft || monotone[j].isLeft && stack[0].isRight) {
//                 while (!stack.isEmpty) {

//                     if (stack.size == 1) {
//                         break;
//                     }
//                     monotoneP.addDiagonal(stack.pop(), monotoneP[j]); //need method for adding diagonals
//                 }
//                 stack.push(monotoneP[j - 1]);
//                 stack.push(monotoneP[j]);

//             } else {
//                 stack.pop();

//                 //to do:
//                 //pop vertices in stack as long as diagonals from uj to them are inside the polygon
//                 //insert these diagonals into doubly linked list
//                 //push the last vertex that has been popped back onto S
//                 //----------------------------------

//                 stack.push(monotoneP[j]);
//             }
//         }
//         //to do:
//         //add diagonals from monotone[j] to all stack vertices except the first and last one
//         //---------------
//     }

// }
