<template>
    <div>
        <canvas></canvas>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import webglUtils from '../../utils/webglUtils';
import m3 from '../../utils/m3';

onMounted(main)

const vertexShaderSource = `
    attribute vec3 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;

    uniform mat3 u_matrix;
    
    void main() {
        gl_Position = vec4((u_matrix * a_position).xy, 0, 1);
        // 将纹理坐标传给片断着色器
        // GPU会在点之间进行插值
        v_texCoord = a_texCoord;
    }
`

const fragementShaderSource = `
    precision mediump float;
    
    // 纹理
    uniform sampler2D u_image;
    
    // 从顶点着色器传入的纹理坐标
    varying vec2 v_texCoord;
    
    void main() {
        // 在纹理上寻找对应颜色值
        gl_FragColor = texture2D(u_image, v_texCoord);
       //gl_FragColor = vec4(0, 1, 0, 1);
        
    }
`

function loadImage(src: string, gl: WebGLRenderingContext) {
    const image = new Image()

    image.src = src
    image.onload = function() {
        render(image, gl);
    };
}

function setRectangle(x: number, y: number, width: number, height: number) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  return [
    x1, y1,
    x2, y1,
    x1, y2,
    x1, y2,
    x2, y1,
    x2, y2,
  ]
}


function render(image: HTMLImageElement, gl: WebGLRenderingContext) {
    const attributes = {
        texCoord: [
            0.0,  0.0,
            1.0,  0.0,
            0.0,  1.0,
            0.0,  1.0,
            1.0,  0.0,
            1.0,  1.0,
        ],
        position: {
            numComponents: 2,
            data: setRectangle(0, 0, image.width, image.height),
        }
    }

    const uniforms = {
        u_matrix: m3.identity()
    }

    const programInfo = webglUtils.createProgramInfo(gl, vertexShaderSource, fragementShaderSource)
    const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, attributes)

    webglUtils.resize(gl)
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    uniforms.u_matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);


    if (programInfo?.program) {
        gl.useProgram(programInfo.program)
        webglUtils.setBuffersAndAttributes(gl, programInfo, bufferInfo)

         // Create a texture.
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // const sampler = gl.getUniformLocation(programInfo.program, "u_image"); // 获取纹理采样器索引 
        // gl.uniform1i(sampler, 0); 

        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        // Upload the image into the texture.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        webglUtils.setUniforms(programInfo, uniforms)

        gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

}

function main() {
    const gl = webglUtils.getWebGLContext()
    if (!gl) return

    loadImage('/lena.jpeg', gl)
}
</script>