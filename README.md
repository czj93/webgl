## 光照

    参考资料：
        - [WebGL 三维方向光源](https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-3d-lighting-directional.html)
    
    法向量：描述面的朝向的单位向量

    平行光的计算：

        方向光的方向和面的朝向点乘就可以得到两个方向的余弦值，再将颜色值和点乘结果相乘，就得到最终的颜色
        gl_FragColor.rgb *= dot(normal, lightDirection)

    1. 平行光光源方向的判定？
        光线方向其实是入射方向的反方向，即从入射点指向光源方向
        而且这个是相对于 裁剪空间坐标系而言的， 在 basic/lighting 的demo 中， 光源 u_reverseLightDirection 是经过归一化后直接通过写入到缓冲的

    2. 光照对于缩放后的物体法线与表面并不垂直，为什么对世界矩阵求逆和转置后点乘法线就能获取正确的结果?
       求逆可以理解，转置的几何意义是什么？


    3. 法线的朝先的坐标系应该根据那个来确定？
        按照 lighting demo 的测试，应该是按照右手坐标系来确定


## 摄像机

以下是两种计算 cameraMatrix 的方式，
使用 computeCameraMatrix 可以通过变换得到cameraMatrix，呈现的效果符合预期
computeCameraMatrixByLookAt 这个旋转某个方向会出现异常，暂时不知道问题出在那里

```js
function computeCameraMatrixByLookAt() {
    // 摄像机观察目标
    var target = [0, 0, 0];
    var up = [0, 1, 0];

    var cameraMatrix = m4.xRotation(webglUtils.degToRad(rx.value));
    cameraMatrix = m4.yRotate(cameraMatrix, ry.value)
    cameraMatrix = m4.zRotate(cameraMatrix, rz.value)
    cameraMatrix = m4.translate(cameraMatrix, 0, 0, tz.value);
    var cameraPosition = [
        cameraMatrix[12],
        cameraMatrix[13],
        cameraMatrix[14],
    ]
    
    cameraMatrix = m4.lookAt(cameraPosition, target, up);
    return cameraMatrix
}

function computeCameraMatrix() {
    var cameraMatrix = m4.xRotation(webglUtils.degToRad(rx.value));
    cameraMatrix = m4.yRotate(cameraMatrix, ry.value)
    cameraMatrix = m4.zRotate(cameraMatrix, rz.value)
    cameraMatrix = m4.translate(cameraMatrix, 0, 0, tz.value);
    return cameraMatrix
}
```