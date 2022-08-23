export function cube(width: number, length: number, height: number) {
    return [
        // 底部
        0 , 0, 0,
        width, 0, length,
        0, 0, length,
        width, 0, length,
        0, 0, 0,
        width, 0, 0,

        // 顶部
        0 , height, 0,
        0, height, length,
        width, height, length,
        width, height, length,
        width, height, 0,
        0, height, 0,

        // 背面
        0, 0, 0,
        width, height, 0,
        width, 0, 0,
        width, height, 0,
        0, 0, 0,
        0, height, 0,

        // 正面
        0, 0, length,
        width, 0, length,
        width, height, length,
        width, height, length,
        0, height, length,
        0, 0, length,

        // 左侧面
        0, 0, 0,
        0, height, length,
        0, height, 0,
        0, height, length,
        0, 0, 0,
        0, 0, length,

        // 右侧面
        width, 0, 0,
        width, height, 0,
        width, height, length,
        width, height, length,
        width, 0, length,
        width, 0, 0,
    ]
}

export function triangle(width: number, length: number, height: number) {
    return [
        0, 0, 0,
        width / 2, 0, length,
        width, 0, 0,

        0, 0, 0,
        width / 2, height, length / 2,
        width / 2, 0, length,

        width / 2, 0, length,
        width / 2, height, length / 2,
        width, 0, 0,

        0, 0, 0,
        width, 0, 0,
        width / 2, height, length / 2,
    ]
}