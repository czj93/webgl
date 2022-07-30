<template>
  <div>
    <canvas />
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import GlRenderer from 'gl-renderer'

function start() {
    const canvas = document.querySelector('canvas');
    const renderer = new GlRenderer(canvas, {webgl2: true});

    const fragment = `#version 300 es
        precision highp float;
        out vec4 FragColor;
        uniform vec2 resolution;

        float stroke(float d, float d0, float w, float smth) {
            float th = 0.5 * w;
            smth = smth * w;
            float start = d0 - th;
            float end = d0 + th; 
            return smoothstep(start, start + smth, d) - smoothstep(end - smth, end, d);
        }

        void main() {
            vec2 st = gl_FragCoord.xy / resolution;
            float d = stroke(st.x, 0.5, 0.01, 0.1);
            FragColor.rgb = d * vec3(1.0);
            FragColor.a = 1.0;
        }
    `;
    const program = renderer.compileSync(fragment);
    renderer.useProgram(program);
    renderer.uniforms.resolution = [canvas.width, canvas.height];
    renderer.render();
}

onMounted(start)

</script>
<style>
canvas {
  width: 350px;
  height: 350px;
}
</style>

