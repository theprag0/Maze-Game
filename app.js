const {World,Engine,Render,Runner,Bodies,Body,Events}=Matter;

const cellsHorizontal=14;
const cellsVertical=10;
const height=window.innerHeight;
const width=window.innerWidth;
const unitLengthX=width/cellsHorizontal;
const unitLengthY=height/cellsVertical;

const engine=Engine.create();
engine.world.gravity.y=false;
const {world}=engine;
const render=Render.create({
   element:document.body,
   engine,
   options:{
       wireframes:false,
       height,
       width
   }
});
Render.run(render);
Runner.run(Runner.create(),engine)

// Canvas Walls
const walls=[
    Bodies.rectangle(width/2,0,width,2,{isStatic:true}),
    Bodies.rectangle(width,height/2,2,height,{isStatic:true}),
    Bodies.rectangle(width/2,height,width,2,{isStatic:true}),
    Bodies.rectangle(0,height/2,2,height,{isStatic:true}),
];

World.add(world,walls);

// Maze Generation
const shuffle=(arr)=>{
    let counter=arr.length;
    while(counter>0){
        const index=Math.floor(Math.random()*counter);
        
        counter--; 
        const temp=arr[counter];
        arr[counter]=arr[index];
        arr[index]=temp;
    }
    return arr;
}

const grid=Array(cellsVertical).fill(null).map(()=>Array(cellsHorizontal).fill(false))


const verticals=Array(cellsVertical).fill(null).map(()=>Array(cellsHorizontal-1).fill(false));

const horizontals=Array(cellsVertical-1).fill(null).map(()=>Array(cellsHorizontal).fill(false));


// Get a random cell to start
const startRow=Math.floor(Math.random()*cellsVertical);
const startColumn=Math.floor(Math.random()*cellsHorizontal);
const visitCell=(row,column)=>{
    // Check if the cell is visited
    if(grid[row][column]){
        return;
    }
    // Mark as true if visited
    grid[row][column]=true;
    // Get neighbours for current position
    const neighbours=shuffle([
        [row-1,column,"up"],
        [row+1,column,"down"],
        [row,column+1,"right"],
        [row,column-1,"left"]
    ]);
    for(let neighbour of neighbours){
        const [nextRow,nextColumn,direction]=neighbour;

        // Check if the neighbour is out of bounds
        if(nextRow<0 || nextRow>=cellsVertical || nextColumn<0 || nextColumn>=cellsHorizontal){
            continue;
        }
        // Check if neighbour is visited already
        if(grid[nextRow][nextColumn]){
            continue;
        }
        // Remove a wall from horizontals or verticals
        if(direction==='left'){
            verticals[row][column-1]=true;
        }else if(direction==='right'){
            verticals[row][column]=true;
        }else if(direction==='up'){
            horizontals[row-1][column]=true;
        }else if(direction==='down'){
            horizontals[row][column]=true;
        }
        // Recursion to create maze
        visitCell(nextRow,nextColumn);
    }
}
visitCell(startRow,startColumn);

horizontals.forEach((row,rowIndex)=>{
    row.forEach((column,columnIndex)=>{
        if(column){
            return;
        }
       const wall = Bodies.rectangle(
           (columnIndex*unitLengthX)+unitLengthX/2,
           (rowIndex*unitLengthY)+unitLengthY,
           unitLengthX,
           3,
           {
               isStatic:true,
               label:'wall',
               render:{
                   fillStyle:'red'
               }
           }
        );
        World.add(world,wall);
    });
});

verticals.forEach((row,rowIndex)=>{
    row.forEach((column,columnIndex)=>{
        if(column){
            return;
        }
        const wall=Bodies.rectangle(
            (columnIndex*unitLengthX)+unitLengthX,
            (rowIndex*unitLengthY)+unitLengthY/2,
            3,
            unitLengthY,
            {
                isStatic:true,
                label:'wall',
                render:{
                    fillStyle:'red'
                }
            }
        );
        World.add(world,wall);
    });
});

// Add Goal Rectangle
const winSquare=Bodies.rectangle(
    width-unitLengthX/2,
    height-unitLengthY/2,
    unitLengthX*0.7,
    unitLengthY*0.7,
    {
        isStatic:true,
        label:'goal',
        render:{
            fillStyle:'green'
        }
    }
);
World.add(world,winSquare);

// Ball
const ballRadius=Math.min(unitLengthY,unitLengthX)/4;
const ball=Bodies.circle(unitLengthX/2,unitLengthY/2,ballRadius,{label:'ball',render:{fillStyle:'blue'}});
World.add(world,ball);

document.addEventListener('keydown',(e)=>{
    const { keyCode }=e;
    const {x,y}=ball.velocity;
    const speedLimit = 5;
   if(keyCode===87 && y > -speedLimit){
     Body.setVelocity(ball,{x,y:y-2});
   }else if(keyCode===83 && y < speedLimit){
       Body.setVelocity(ball,{x,y:y+2});
   }else if(keyCode===68 && x < speedLimit){
       Body.setVelocity(ball,{x:x+2,y});
   }else if(keyCode===65 && x > -speedLimit){
       Body.setVelocity(ball,{x:x-2,y});
   }
})

// Win Condition
Events.on(engine,'collisionStart',(event)=>{
    event.pairs.forEach((collision)=>{
        const labels=['ball','goal'];
        if(labels.includes(collision.bodyA.label)&&labels.includes(collision.bodyB.label)){
            document.querySelector('.winner').classList.remove('hidden');
            world.gravity.y=1;
            world.bodies.forEach((body)=>{
              if(body.label==='wall'){
                  Body.setStatic(body,false);
              }
            })
        }
    })
});
