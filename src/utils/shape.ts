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

export function cubeNormals() {
    return [
        // 底部 法线
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        // 顶部
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        // 背面
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        // 正面
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        // 左
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,

        // 右
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0
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

function getPoint(u: number, v: number) {
    const p = u * 2 * Math.PI;
    const o = v * Math.PI;
    const r = 1
    const x = r * Math.sin(o) * Math.sin(p)
    const y = r * Math.cos(o)
    const z = r * Math.sin(o) * Math.cos(p)

    return {
        position: [x, y, z],
        uv: [u, v]
    }
    // return [x, y, z, u, v]
}

export function sphere(uPieces: number, vPieces: number): Record<string, Array<number>> {
    let au = 1 / uPieces
    let av = 1 / vPieces

    let positions = []
    let uvs = []

    for(let i = 0; i < vPieces; i++) {
        for(let j = 0; j < uPieces; j++) {
            let p1 = getPoint(j * au, i * av)
            let p2 = getPoint((j + 1) * au, i * av)
            let p3 = getPoint((j + 1) * au, (i + 1) * av)
            let p4 = getPoint(j * au, (i + 1) * av)

            positions.push(...p1.position, ...p2.position, ...p3.position, ...p1.position, ...p3.position, ...p4.position)
            uvs.push(...p1.uv, ...p2.uv, ...p3.uv, ...p1.uv, ...p3.uv, ...p4.uv)
        }
    }

    return {
        uvs,
        positions
    }
}
