import { Position as Pos, Rect as R } from "../drag/drag.service";

export type Position = Pos;

export type Rect = {
  id: string;
  type: string,
} & R

export type Slot = {
  id: string;
  rect?: Rect;
} & Position

/**
 * 可以作为连接处的端点
 * inputs: 可以作为入口的端点
 * outputs: 可以作为入口的端点
 */
export type Slots = {
  inputs: Slot[];
  outputs: Slot[];
}

/**
 * 需要绘制路径的 Component 实现这个接口
 */
export interface Refable {
  /**
   * @returns 返回可以作为连接处的端点.
   */
  getSlots(): Slots;
}