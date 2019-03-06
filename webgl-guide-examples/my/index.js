const VertexShader = `
attribute vec4 a_Position;
void main(){
    gl_Position=a_Position;
    gl_PointSize=10.0;
}
`;

const FragmentShader = `
precision mediump float;
uniform vec4 u_FragColor;
void main(){
    gl_FragColor = u_FragColor;    
}
`;


function loadShader(gl, type, source) {
    let shader = gl.createShader(type);
    if (shader) {
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        let compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (compiled) {
            return shader;
        } else {
            let error = gl.getShaderInfoLog(shader);
            console.log("编译shader失败: " + error);
            gl.deleteShader(shader);
            return null;
        }
    } else {
        console.log("创建shader失败");
        return null;
    }
}

function createProgram(gl, vertex, fragment) {
    let vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertex);
    let fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragment);
    if (!vertexShader || !fragmentShader) {
        return null;
    }

    let program = gl.createProgram();
    if (!program) {
        console.log("创建GlProgram失败!");
        return null;
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    let result = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!result) {
        let error = gl.getProgramInfoLog(program);
        console.log("链接program失败: " + error);
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        return null;
    }
    return program;
}

function initShader(gl, vertex, fragment) {
    let program = createProgram(gl, vertex, fragment);
    if (!program) {
        return false;
    }
    gl.useProgram(program);
    gl.program = program;
    return true;
}

let g_points = [];
let g_colors = [];

function click(event, gl, canvas, a_Position, color) {

    let x = event.clientX;
    let y = event.clientY;
    let rect = event.target.getBoundingClientRect();

    // webgl坐标系是[-1,1]
    let webglX = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    let webglY = (canvas.height / 2 + rect.top - y) / (canvas.height / 2);


    gl.clear(gl.COLOR_BUFFER_BIT);

    g_points.push({x: webglX, y: webglY});
    g_colors.push({r: Math.random(), g: Math.random(), b: Math.random(), a: Math.random()});
    for (let i = 0; i < g_points.length; i++) {
        let itemPoint = g_points[i];
        let itemColor = g_colors[i];
        // 从js向顶点着色器中的attribute变量传递值
        gl.vertexAttrib3f(a_Position, itemPoint.x, itemPoint.y, 0.0);
        gl.uniform4f(color, itemColor.r, itemColor.g, itemColor.b, itemColor.a);
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}

function main() {

    let element = document.getElementById('game');
    if (!element) {
        console.log("未发现canvas元素!");
        return;
    }
    let gl = element.getContext('webgl');
    if (!gl) {
        console.log("不支持webgl");
        return;
    }
    let b = initShader(gl, VertexShader, FragmentShader);
    if (!b) {
        console.log("初始化shader失败!");
        return;
    }
    let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.error("未发现坐标a_Position");
    }
    let u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (u_FragColor < 0) {
        console.error("未发现坐标a_Position");
    }


    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);


    element.onmousedown = function (event) {
        click(event, gl, element, a_Position, u_FragColor);
    }

}
