//visualization and properties

//construction of DCEL (doubly connected edge list)

//add diagonal 



//algorithm

function Triangulation(polygon) {

    //part 1: partitioning into y-monotone polygons using plane sweep method
    //getting rid of turn vertices (merge and split vertices) by adding diagonals 




    //part 2: triangulation of monotone parts (greedy)
    //single pass from top to bottom, invariants: top vertex convex
    //input: y-monotone polygon (monotoneP) stored in a doubly connected edge list 
    //output: triangulation of monotoneP soted in a doubly-connected edge list D
    function triangulateMontone(monotoneP) {
        this.monotoneP.sort(); //need a method that sorts the points into one sequence by decreasing y-coordinate (choose left point to break ties)

        let stack = []; //empty stack (for not yet triangulated vertices)

        stack.push(monotoneP[0]);
        stack.push(monotoneP[1]);

        for (j = 2; j = monotoneP.size - 1; j++) {
            //need method to check is point is on right or left chain
            //if on different chains
            if (monotoneP[j].isRight && stack[0].isLeft || monotone[j].isLeft && stack[0].isRight) {
                while (!stack.isEmpty) {

                    if (stack.size == 1) {
                        break;
                    }
                    monotoneP.addDiagonal(stack.pop(), monotoneP[j]); //need method for adding diagonals
                }
                stack.push(monotoneP[j - 1]);
                stack.push(monotoneP[j]);

            } else {
                stack.pop();

                //to do:
                //pop vertices in stack as long as diagonals from uj to them are inside the polygon 
                //insert these diagonals into doubly linked list 
                //push the last vertex that has been popped back onto S 
                //----------------------------------

                stack.push(monotoneP[j]);
            }
        }
        //to do:
        //add diagonals from monotone[j] to all stack vertices except the first and last one
        //---------------
    }


}

