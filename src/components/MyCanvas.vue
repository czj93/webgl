<template>
  <div>
    <canvas />
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import GlRenderer from 'gl-renderer'
// defineProps({
//   msg: String
// })

// const count = ref(0)

function start() {
    const canvas = document.querySelector('canvas');
    const renderer = new GlRenderer(canvas, {webgl2: true});

    const fragment = `#version 300 es
        precision highp float;
        out vec4 FragColor;
        uniform vec2 resolution;
        void main() {
        vec2 st = gl_FragCoord.xy / resolution;
        FragColor.rgb = step(0.5, st.x) * vec3(1.0);
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

