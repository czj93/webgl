export default {
    identity: function() {
        return [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1,
        ]
    },

    projection: function(width: number, height: number) {
        // 注意：这个矩阵翻转了 Y 轴，所以 0 在上方
        return [
            2 / width, 0, 0,
            0, -2 / height, 0,
            -1, 1, 1
        ];
    },

    /**
     * 平移操作
     * @param tx x轴平移距离 
     * @param ty y轴平移距离
     * @returns 
     */
    translation: function(tx: number, ty: number) {
        return [
            1, 0, 0,
            0, 1, 0,
            tx, ty, 1
        ]
    },

    /**
     * 旋转
     * @param angle 旋转角度 弧度数 
     * @returns 
     */
    rotation: function(angle: number) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return [
            c, -s, 0,
            s,  c, 0,
            0,  0, 1
        ]
    },

    /**
     * 缩放
     * @param sx x轴缩放
     * @param sy y轴缩放
     * @returns 
     */
    scaling: function(sx: number, sy: number) {
        return [
            sx, 0, 0,
            0, sy, 0,
            0,  0, 1
        ]
    },

    /**
     * 平移操作
     * @param m 矩阵 
     * @param tx x轴平移
     * @param ty y轴平移
     * @returns 新的变化矩阵
     */
    translate: function(m: Array<number>, tx: number, ty: number) {
        return this.multiply(m, this.translation(tx, ty));
    },

    /**
     * 旋转操作
     * @param m 矩阵 
     * @param angle 旋转角度 角度制
     * @returns 新的变化矩阵
     */
    rotate: function(m: Array<number>, angle: number) {
        const angleDegress = (360 - angle) * Math.PI / 180;
        return  this.multiply(m, this.rotation(angleDegress))
    },

    /**
     * 缩放操作
     * @param m 矩阵 
     * @param sx x轴缩放数
     * @param sy y轴缩放数
     * @returns 新的变化矩阵
     */
    scale: function(m: Array<number>, sx: number, sy: number) {
        return this.multiply(m, this.scaling(sx, sy));
    },

    /**
     * 矩阵乘法
     * @param a 矩阵a 
     * @param b 矩阵b
     * @returns 
     */
    multiply: function(a: Array<number>, b: Array<number>) {
        const len = 3
        var a00 = a[0 * len + 0];
        var a01 = a[0 * len + 1];
        var a02 = a[0 * len + 2];
        var a10 = a[1 * len + 0];
        var a11 = a[1 * len + 1];
        var a12 = a[1 * len + 2];
        var a20 = a[2 * len + 0];
        var a21 = a[2 * len + 1];
        var a22 = a[2 * len + 2];
        var b00 = b[0 * len + 0];
        var b01 = b[0 * len + 1];
        var b02 = b[0 * len + 2];
        var b10 = b[1 * len + 0];
        var b11 = b[1 * len + 1];
        var b12 = b[1 * len + 2];
        var b20 = b[2 * len + 0];
        var b21 = b[2 * len + 1];
        var b22 = b[2 * len + 2];
        return [
            b00 * a00 + b01 * a10 + b02 * a20,
            b00 * a01 + b01 * a11 + b02 * a21,
            b00 * a02 + b01 * a12 + b02 * a22,
            b10 * a00 + b11 * a10 + b12 * a20,
            b10 * a01 + b11 * a11 + b12 * a21,
            b10 * a02 + b11 * a12 + b12 * a22,
            b20 * a00 + b21 * a10 + b22 * a20,
            b20 * a01 + b21 * a11 + b22 * a21,
            b20 * a02 + b21 * a12 + b22 * a22,
        ];
  },
}