import type { Point } from '../types/coupon'

export function quadraticBezierPoint(
  t: number,
  p0: Point,
  p1: Point,
  p2: Point
): Point {
  const mt = 1 - t
  return {
    x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
  }
}

export function getControlPoint(start: Point, end: Point): Point {
  const midX = (start.x + end.x) / 2
  const height = Math.abs(end.x - start.x) * 0.6 + 80
  return {
    x: midX,
    y: Math.min(start.y, end.y) - height,
  }
}
