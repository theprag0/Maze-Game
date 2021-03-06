const {World,Engine,Runner,Render,Bodies,MouseConstraint,Mouse}=Matter;

const height=600;
const width=800;
const engine=Engine.create();
const {world}=engine;
const render=Render.create({
    element:document.body,
    engine:engine,
    options:{
        wireframes:false,
        height,
        width
    }
});
Render.run(render);
Runner.run(Runner.create(),engine);

World.add(world,
    MouseConstraint.create(engine,{
        mouse:Mouse.create(render.canvas)
    })
)

// Canvas Walls
const walls=[
    Bodies.rectangle(400,0,800,40,{isStatic:true}),
    Bodies.rectangle(800,300,40,600,{isStatic:true}),
    Bodies.rectangle(400,600,800,40,{isStatic:true}),
    Bodies.rectangle(0,300,40,600,{isStatic:true}),
];

World.add(world,walls);

// Random Shapes
for(let i=0;i<50;i++){
    if(Math.random()>0.5){
        World.add(world,Bodies.rectangle(Math.random()*width,Math.random()*height,50,50));
    }else if(Math.random()>0.3){
        World.add(world,Bodies.circle(Math.random()*width,Math.random()*height,35));
    }else{
        World.add(world,Bodies.polygon(Math.random()*width,Math.random()*height,6,40));
    }
}
