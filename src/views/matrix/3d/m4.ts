export default {

  identity: function() {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]
  },

    // 这个矩阵还无法实现三维的透视效果
    projection: function(width: number, height: number, depth: number) {
      // Note: This matrix flips the Y axis so 0 is at the top.
      // 这个矩阵将反转Y轴，并将顶点设在左上角，同时做了归一化
      return [
         2 / width, 0, 0, 0,
         0, -2 / height, 0, 0,
         0, 0, 2 / depth, 0,
        -1, 1, 0, 1,
      ];
    },

    /**
     * 
     * @param fieldOfViewInRadians 
     * @param aspect 
     * @param near 
     * @param far 
     * @returns 
     */
    perspective: function(fieldOfViewInRadians: number, aspect: number, near: number, far: number) {
        var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
        var rangeInv = 1.0 / (near - far);
     
        return [
          f / aspect, 0, 0, 0,
          0, f, 0, 0,
          0, 0, (near + far) * rangeInv, -1,
          0, 0, near * far * rangeInv * 2, 0
        ];
      },
    
    /**
     * 4x4 矩阵乘法
     * @param a 4x4矩阵
     * @param b 4x4矩阵
     * @returns 
     */
    multiply: function(a: Array<number>, b: Array<number>) {
      var a00 = a[0 * 4 + 0];
      var a01 = a[0 * 4 + 1];
      var a02 = a[0 * 4 + 2];
      var a03 = a[0 * 4 + 3];
      var a10 = a[1 * 4 + 0];
      var a11 = a[1 * 4 + 1];
      var a12 = a[1 * 4 + 2];
      var a13 = a[1 * 4 + 3];
      var a20 = a[2 * 4 + 0];
      var a21 = a[2 * 4 + 1];
      var a22 = a[2 * 4 + 2];
      var a23 = a[2 * 4 + 3];
      var a30 = a[3 * 4 + 0];
      var a31 = a[3 * 4 + 1];
      var a32 = a[3 * 4 + 2];
      var a33 = a[3 * 4 + 3];
      var b00 = b[0 * 4 + 0];
      var b01 = b[0 * 4 + 1];
      var b02 = b[0 * 4 + 2];
      var b03 = b[0 * 4 + 3];
      var b10 = b[1 * 4 + 0];
      var b11 = b[1 * 4 + 1];
      var b12 = b[1 * 4 + 2];
      var b13 = b[1 * 4 + 3];
      var b20 = b[2 * 4 + 0];
      var b21 = b[2 * 4 + 1];
      var b22 = b[2 * 4 + 2];
      var b23 = b[2 * 4 + 3];
      var b30 = b[3 * 4 + 0];
      var b31 = b[3 * 4 + 1];
      var b32 = b[3 * 4 + 2];
      var b33 = b[3 * 4 + 3];
      return [
        b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
        b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
        b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
        b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
        b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
        b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
        b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
        b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
        b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
        b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
        b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
        b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
        b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
        b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
        b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
        b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
      ];
    },
    
    /**
     * 平移
     * @param tx x轴平移距离
     * @param ty y轴平移距离
     * @param tz z轴平移距离
     * @returns 
     */
    translation: function(tx: number, ty: number, tz: number) {
      return [
         1,  0,  0,  0,
         0,  1,  0,  0,
         0,  0,  1,  0,
         tx, ty, tz, 1,
      ];
    },
  
    xRotation: function(angleInRadians: number) {
      var c = Math.cos(angleInRadians);
      var s = Math.sin(angleInRadians);
  
      return [
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1,
      ];
    },
  
    yRotation: function(angleInRadians: number) {
      var c = Math.cos(angleInRadians);
      var s = Math.sin(angleInRadians);
  
      return [
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1,
      ];
    },
  
    zRotation: function(angleInRadians: number) {
      var c = Math.cos(angleInRadians);
      var s = Math.sin(angleInRadians);
  
      return [
         c, s, 0, 0,
        -s, c, 0, 0,
         0, 0, 1, 0,
         0, 0, 0, 1,
      ];
    },
    
    /**
     * 缩放
     * @param sx 
     * @param sy 
     * @param sz 
     * @returns 
     */
    scaling: function(sx: number, sy: number, sz: number) {
      return [
        sx, 0,  0,  0,
        0, sy,  0,  0,
        0,  0, sz,  0,
        0,  0,  0,  1,
      ];
    },
    
    /**
     * 平移
     * @param m 4x4矩阵
     * @param tx x轴平移距离
     * @param ty y轴平移距离
     * @param tz z轴平移距离
     * @returns 
     */
    translate: function(m: Array<number>, tx: number, ty: number, tz: number) {
      return this.multiply(m, this.translation(tx, ty, tz));
    },
    
    /**
     * 绕x轴旋转
     * @param m 4x4矩阵
     * @param angle 旋转角度
     * @returns 
     */
    xRotate: function(m: Array<number>, angle: number) {
      const angleInRadians: number = (360 - angle) * Math.PI / 180;
      return this.multiply(m, this.xRotation(angleInRadians));
    },
    
    /**
     * 绕y轴旋转
     * @param m 4x4矩阵
     * @param angle 旋转角度
     * @returns 
     */
    yRotate: function(m: Array<number>, angle: number) {
      const angleInRadians: number = (360 - angle) * Math.PI / 180;
      return this.multiply(m, this.yRotation(angleInRadians));
    },
    
    /**
     * 绕z轴旋转
     * @param m 4x4矩阵
     * @param angle 旋转角度
     * @returns 
     */
    zRotate: function(m: Array<number>, angle: number) {
      const angleInRadians: number = (360 - angle) * Math.PI / 180;
      return this.multiply(m, this.zRotation(angleInRadians));
    },
    
    /**
     * 缩放
     * @param m 4x4矩阵
     * @param sx x轴缩放值
     * @param sy y轴缩放值
     * @param sz z轴缩放值
     * @returns 
     */
    scale: function(m: Array<number>, sx: number, sy: number, sz: number) {
      return this.multiply(m, this.scaling(sx, sy, sz));
    },
  
  };