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
        void main() {
          vec2 st = gl_FragCoord.xy / resolution;
          vec2 center = vec2(0.5);
          float d = length(st - center);
          FragColor.rgb = smoothstep(d - 0.01, d, 0.2) * vec3(1.0);
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

