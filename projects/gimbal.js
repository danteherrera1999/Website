const graphDiv = document.getElementById('myDiv')
var r = graphDiv.parentElement.getBoundingClientRect();
var xc = (r.right+r.left)/2;
var yc = (r.top+r.bottom)/2;
const pi = Math.PI
const config={displayModeBar:false,displaylogo:false,"modeBarButtonsToRemove": ['pan3d',"resetCameraLastSave3d","zoom3d","resetCameraDefault3d","tableRotation","orbitRotation","toImage"]}
const layout =  {
    title: {
        xanchor: 'left',
        text:'Theta: 0.000 <br>Phi: 0.000',
        font:{
            color: 'white',
            size: 30,
        },
        x: 0,
        y: .96,
    },
    legend:{
        bgcolor:'transparent',
        font:{size:20},
        x: 0,
        y:-.05,
    },
    autosize:false,
    showlegend:true,
    margin:{
        l: 0,
        r: 0,
        b: 0,
        t: 0,
        pad: 0,
        autoexpand:false,
    },
    width: 600,
    height: 600,
    plot_bgcolor:"#2b2b2b",
    paper_bgcolor:"#2b2b2b",
    scene:{
        aspectratio:{x:1.5,y:1.5,z:1.5},
        camera:{
            center:{
                x:0,
                y:0,
                z:0,
            },
            eye:{
                x:0,
                y:0,
                z:2,
            },
            up:{
                x:0,
                y:0,
                z:1,
            }
        },
        xaxis:{
            constrain:'domain',
            range:[-5,5],
            autorange:false,
            visible:false
            },
        yaxis:{
            scaleanchor:'x',
            range:[-5,5],
            autorange:false,
            visible:false
            },
        zaxis:{
            scaleanchor:'x',
            range:[-7,0],
            autorange:false,
            visible:false,
            }
        }
    };
const d2r = Math.PI / 180;
var hf = 180 / window.innerWidth;
var vf = 180/ window.innerHeight;
function handleMouseMove(event){
    var pos_x = event.clientX;
    var pos_y = event.clientY;
    var theta = (xc-pos_x) * hf;
    var phi = (pos_y-yc) * vf;
    sd2 = matmul(T(theta*d2r,phi*d2r),sd);
    FP = unzip(matmul(T(theta*d2r,phi*d2r),fixpoints));
    sduz = unzip(sd2);
    FPs = fp_calc(FP);
    mags = mag(FP);
    x = sduz[0];y = sduz[1];z = sduz[2];
    layout.title.text = `Theta: ${Math.round(theta*10)/10}<br>Phi: ${Math.round(phi*10)/10}`,
    fp1.name = `L1: ${mags[0]}`;fp2.name = `L2: ${mags[1]}`;fp3.name = `L3: ${mags[2]}`;
    Plotly.update(graphDiv,{'x':[x,FPs[0][0],FPs[0][1],FPs[0][2],baseplate[0]],'y':[y,FPs[1][0],FPs[1][1],FPs[1][2],baseplate[1]],'z':[z,FPs[2][0],FPs[2][1],FPs[2][2],baseplate[2]]});
}
var zPts = []; 
var xPts = [];
var yPts = [];
function c(){
    return Math.floor(Math.random()*256)
}
function new_color(){
    return `rgb(${c()},${c()},${c()})`
}
function unzip(vector){
    let tx = [];
    let ty = [];
    let tz = [];
    for (let i=0; i<vector.length;i++) {
        let td = vector[i];
        tx.push(td[0]);
        ty.push(td[1]);
        tz.push(td[2]);
    }
    return [tx,ty,tz]
}
function matmul(m1,m2){
    let m3 = []
    for (let i=0; i<m2.length;i++){
        m3.push([m2[i][0] * m1[0][0] + m2[i][1] * m1[0][1] + m2[i][2] * m1[0][2],m2[i][0] * m1[1][0] + m2[i][1] * m1[1][1] + m2[i][2] * m1[1][2],m2[i][0] * m1[2][0] + m2[i][1] * m1[2][1] + m2[i][2] * m1[2][2]])
    }
    return m3
}
function T(a,b){
    let t1 = [[Math.cos(b),0,Math.sin(b)],[Math.sin(a)*Math.sin(b),Math.cos(a),-Math.sin(a)*Math.cos(b)],[-Math.cos(a)*Math.sin(b),Math.sin(a),Math.cos(a)*Math.cos(b)]];
    return t1
}
let sd = [];
const N = 15;
const H = -5
let X = [];
let Y = [];
let Z = [];
let baseplate = [];
for (let j = 0; j< N; j++){
    for (let i=0;i<2;i++){
        for (let jn=0;jn<2;jn++){
            sd.push([Math.cos(2*pi/(N-1)*(j+jn)),Math.sin(2*pi/(N-1)*(j+jn)),i*H])
        }
    }
    baseplate.push([2.2*Math.cos(2*pi/(N-1)*j),2.2*Math.sin(2*pi/(N-1)*j),0])
}
baseplate = unzip(baseplate);
fixpoints_base = []
fixpoints = [];
for (let i = 0; i< 3;i++){
    fixpoints.push([Math.cos(2*pi/(3)*i),Math.sin(2*pi/(3)*i),-2]);
    fixpoints_base.push([2*Math.cos(2*pi/(3)*i),2*Math.sin(2*pi/(3)*i),0]);
}
fixpoints_base = unzip(fixpoints_base);
function fp_calc(ufp){
    ta = []
    for (let i = 0; i < 3; i++){
        ta.push([[fixpoints_base[i][0],ufp[i][0]],[fixpoints_base[i][1],ufp[i][1]],[fixpoints_base[i][2],ufp[i][2]]])
    }
    return ta
}
function mag(ufp){
    mags = [];
    for (let i = 0; i <3; i++){
        tm = 0;
        for (let j=0; j < 3; j++){
            tm += (fixpoints_base[j][i]-ufp[j][i]) ** 2;
        }
        mags.push(Math.round(1000*Math.sqrt(tm))/1000);
    }
    return mags
}
sduz = unzip(sd);
let fp_init = fp_calc(unzip(fixpoints));
let mags_init = mag(unzip(fixpoints));
let data = {
    x: sduz[0],
    y: sduz[1],
    z: sduz[2],
    type: 'scatter3d',
    mode:'lines',
    hoverinfo:'none',
    name:'Mesh',
    legendrank: 1111,
}
let fp1 = {
    x: fp_init[0][0],
    y: fp_init[1][0],
    z: fp_init[2][0],
    type: 'scatter3d',
    mode:'lines',
    hoverinfo:'none',
    line: {width:20},
    name: `L1: ${mags_init[0]}`,
}
let fp2 = {
    x: fp_init[0][1],
    y: fp_init[1][1],
    z: fp_init[2][1],
    type: 'scatter3d',
    mode:'lines',
    hoverinfo:'none',
    line: {width:20},
    name: `L1: ${mags_init[1]}`,
}
let fp3 = {
    x: fp_init[0][2],
    y: fp_init[1][2],
    z: fp_init[2][2],
    type: 'scatter3d',
    mode:'lines',
    hoverinfo:'none',
    line: {width:20},
    name: `L1: ${mags_init[2]}`,
}
let plate = {
    x: baseplate[0],
    y: baseplate[1],
    z: baseplate[2],
    type: 'mesh3d',
    opacity:.1,
    hoverinfo:'none',
}
function rebox(){
    r = graphDiv.parentElement.getBoundingClientRect();
    xc = (r.right+r.left)/2;
    yc = (r.top+r.bottom)/2;
    hf = 180 / window.innerWidth;
    vf = 180/ window.innerHeight;
};
Plotly.newPlot(graphDiv, [data,fp1,fp2,fp3,plate], layout,config);
addEventListener("scroll", (event)=>{rebox()});
addEventListener("resize", (event)=>{rebox()});
document.onmousemove = handleMouseMove;