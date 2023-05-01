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
  triangles[curIndex++] = indices[0];
  triangles[curIndex++] = indices[1];
  triangles[curIndex++] = indices[2];

  //   console.log(triangles);

  for (let i = 0; i < triangles.length; i++) {
    console.log(triangles[i]);
  }
}

class Triangle {
  constructor(tri1, tri2, tri3) {
    this.array = [tri1, tri2, tri3];
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

Triangulation(testVertices);

// let p = new Vector(10,10);
// let a1 = new Vector(0, 4);
// let b1 = new Vector(5, 0);
// let c1 = new Vector(0, 0);

// console.log(pointInTriangle(p, a1, b1, c1));
