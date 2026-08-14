# -*- coding: utf-8 -*-
"""
将 中国_省.geojson（省界数据）转换为 data/china.js：
  1. Douglas-Peucker 简化（容差 0.025° ≈ 2.7km，远小于 1px）
  2. 过滤：南海诸岛（lat < 17.5）、微小岛屿（bbox < 0.08°）、越界环
  3. 坐标保留 3 位小数
  4. 输出紧凑数组格式：provinces: [[名称, [[[lng,lat],...]...]], ...]
"""
import json

SRC = r'C:\Users\RadiantSoul\Downloads\中国_省.geojson'
OUT = r'E:\Claude\毕业纪念馆\data\china.js'

TOL = 0.025          # DP 容差（度）
LAT_MIN = 17.5       # 低于此纬度的环丢弃（南海诸岛）
MIN_SIZE = 0.02      # 环 bbox 最大边小于此值丢弃（微小岛屿）
ROUND_D = 3


def dp_simplify(points, tol):
    """迭代版 Douglas-Peucker"""
    if len(points) < 3:
        return points[:]
    keep = [False] * len(points)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    while stack:
        i, j = stack.pop()
        if j - i < 2:
            continue
        ax, ay = points[i]
        bx, by = points[j]
        dx, dy = bx - ax, by - ay
        denom = dx * dx + dy * dy
        dmax, kmax = 0.0, -1
        if denom == 0:
            # 退化线段：取中间点
            for k in range(i + 1, j):
                d = abs(points[k][0] - ax) + abs(points[k][1] - ay)
                if d > dmax:
                    dmax, kmax = d, k
        else:
            for k in range(i + 1, j):
                px, py = points[k]
                t = ((px - ax) * dx + (py - ay) * dy) / denom
                t = max(0.0, min(1.0, t))
                cx, cy = ax + t * dx, ay + t * dy
                d = (px - cx) ** 2 + (py - cy) ** 2
                if d > dmax:
                    dmax, kmax = d, k
        if dmax > tol * tol:
            keep[kmax] = True
            stack.append((i, kmax))
            stack.append((kmax, j))
    return [p for p, k in zip(points, keep) if k]


def ring_ok(ring):
    if len(ring) < 4:
        return False
    lngs = [p[0] for p in ring]
    lats = [p[1] for p in ring]
    if min(lats) < LAT_MIN:
        return False
    if max(lngs) - min(lngs) < MIN_SIZE and max(lats) - min(lats) < MIN_SIZE:
        return False
    return True


def main():
    with open(SRC, encoding='utf-8') as f:
        gj = json.load(f)

    provinces = []
    total_in = total_out = 0
    for feat in gj['features']:
        name = feat['properties'].get('name', '?')
        geom = feat['geometry']
        if geom['type'] != 'MultiPolygon':
            continue  # 跳过境界线（九段线等在南海，超出本图范围）
        rings = []
        for poly in geom['coordinates']:
            for ring in poly:
                total_in += len(ring)
                if not ring_ok(ring):
                    continue
                # 小环（<40 点）不做简化，避免微小行政区坍缩
                simp = ring if len(ring) < 40 else dp_simplify(ring, TOL)
                if len(simp) < 4:
                    continue
                simp = [[round(p[0], ROUND_D), round(p[1], ROUND_D)] for p in simp]
                total_out += len(simp)
                rings.append(simp)
        if rings:
            provinces.append([name, rings])

    lines = []
    lines.append('/* ============================================')
    lines.append('   中国省界数据 · 来源：国家地理信息公共服务平台')
    lines.append('   （用户提供 中国_省.geojson，DP 简化容差 %.3f°）' % TOL)
    lines.append('   坐标系：WGS84 经纬度；已过滤南海诸岛与微小岛屿')
    lines.append('   格式：provinces = [[名称, [[[lng,lat],...], ...]], ...]')
    lines.append('   ============================================ */')
    lines.append('window.GM_DATA = window.GM_DATA || {};')
    lines.append('window.GM_DATA.china = {')
    lines.append('  provinces: ' + json.dumps(provinces, ensure_ascii=False, separators=(',', ':')).replace('],', '],\n    ') + '')
    lines.append('};')

    with open(OUT, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

    size = len('\n'.join(lines))
    print('provinces:', len(provinces))
    print('points: %d -> %d (%.1f%%)' % (total_in, total_out, 100.0 * total_out / total_in))
    print('output size: %.1f KB' % (size / 1024))


if __name__ == '__main__':
    main()
