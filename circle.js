const graphDiv = document.getElementById('circles')
const config={displayModeBar:false,displaylogo:false,"modeBarButtonsToRemove": ['pan3d',"resetCameraLastSave3d","zoom3d","resetCameraDefault3d","tableRotation","orbitRotation","toImage"]}
const layout =  {
    autosize:false,
    showlegend:false,
    margin:{
        l: 0,
        r: 0,
        b: 0,
        t: 0,
        pad: 0,
        autoexpand:false,
    },
    width: 1300,
    height: 1300,
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
                x:1.25,
                y:1.25,
                z:1.25,
            },
            up:{
                x:0,
                y:0,
                z:1,
            }
        },
        xaxis:{
            constrain:'domain',
            range:[-.8,.8],
            autorange:false,
            visible:false
            },
        yaxis:{
            scaleanchor:'x',
            range:[-.8,.8],
            autorange:false,
            visible:false
            },
        zaxis:{
            scaleanchor:'x',
            range:[-.4,1],
            autorange:false,
            visible:false,
            }
        }
    };
const d2r = Math.PI / 180;
const hf = 180 / 1920;
const vf = 180/ 1080;
function update_circle(){
    theta += rot_inc;
    tuzd = unzip(matmul(static_rot,matmul(Tz(theta*d2r),t1)));
    tuzd2 = unzip(matmul(static_rot,matmul(Tz(-theta*d2r),t2)));
    tuzd3 = unzip(matmul(static_rot,matmul(Tz(theta*d2r),t3)));
    tuzd4 = unzip(matmul(static_rot,matmul(Tz(-theta*d2r),t4)));
    x = [tuzd[0],tuzd2[0],tuzd3[0],tuzd4[0]];
    y = [tuzd[1],tuzd2[1],tuzd3[1],tuzd4[1]];
    z = [tuzd[2],tuzd2[2],tuzd3[2],tuzd4[2]];
    Plotly.update(graphDiv,{'x':x,'y':y,'z':z});
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
    };
    return m3
}
let Tx = (theta) => [[1,0,0],[0,Math.cos(theta),Math.sin(theta)],[0,-Math.sin(theta),Math.cos(theta)]]
let Ty = (phi) => [[Math.cos(phi),0,-Math.sin(phi)],[0,1,0],[Math.sin(phi),0,Math.cos(phi)]]
let Tz = (psi) => [[Math.cos(psi),Math.sin(psi),0],[-Math.sin(psi),Math.cos(psi),0],[0,0,1]]
function gen(vec){x=vec[0];y=vec[1];z=vec[2];return{x: x,y: y,z: z,line:{color: 'white'},type: 'scatter3d',mode: 'lines'} }
function gen_points(o,r){
    let temp = []
    for (let i=o;i<(75+o);i++){
        let angle = 2*Math.PI*i/100
        temp.push([r * Math.cos(angle),r * Math.sin(angle),0])
    }
    return temp
}
let t1 = gen_points(0,.5);
let t2 = gen_points(25,.6);
let t3 = gen_points(50,.7);
let t4 = gen_points(75,.8);
const static_rot = matmul(Tx(23*d2r),Ty(6*d2r))
var trace1 = gen(unzip(matmul(static_rot,t1)))
var trace2 = gen(unzip(matmul(static_rot,t2)))
var trace3 = gen(unzip(matmul(static_rot,t3)))
var trace4 = gen(unzip(matmul(static_rot,t4)))
let traces = [trace1,trace2,trace3,trace4];
Plotly.newPlot(graphDiv, traces, layout,config);
let theta = 0;
const rot_inc = 15 * d2r;
var intervalID = window.setInterval(update_circle,10)
