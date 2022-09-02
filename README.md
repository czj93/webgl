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

    4. 点光源
        LightingPoint 例子中，设置点光源的位置达不到预期效果，修改点光源位置，只能轻微影响光照。
        点光源坐标没有经过各种矩阵变换，通过归一化后是直接写入到缓冲中，在ＧＰＵ中使用。
        不管光源位置如何设置，总是在原点，是3d 裁剪空间坐标系的原点

        TODO: 待实现镜面高光

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

## 纹理

    全局变量默认为 0 所以 u_image 默认使用纹理单元 0 。 纹理单元 0 默认为当前活跃纹理，所以调用 bindTexture 会将纹理绑定到单元 0 。

    参考资料：
    [webgl 纹理](https://www.jianshu.com/p/280c111321ec)

```js
const image = new Image()

// 创建贴图
var texture = gl.createTexture();
// 绑定纹理  TEXTURE_2D/二维纹理 TEXTURE_CUBE_MAP/立方体映射纹理
gl.bindTexture(gl.TEXTURE_2D, texture);

// 设置纹理参数
// Set the parameters so we can render any size image.
// texParameteri(target, pname, param)
// target/类型  pname/参数 param/参数值
// https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/texParameter
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);


// 给纹理绑定图片
// Upload the image into the texture.
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);


// 如果只有一个纹理，可以不需要以下代码
// 全局变量默认为0， 所以 u_image 默认使用纹理单元0
var u_image0Location = gl.getUniformLocation(programInfo.program, "u_image");

gl.uniform1i(u_image0Location, 0);

gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, textures[0]);

```

    1. 为什么要执行两遍 bindTexture 方法？ 入参还不同，API设计的好奇怪，太难理解了


## 绘制地球

    参考资料：
        [使用webgl 绘制一个地球3—纹理贴图](https://zhuanlan.zhihu.com/p/435839686)