import ArrayObject from "../data-structure/array";
import { TAlgorithmState } from "./algorithm";
import BubbleSortObject from "./sort/bubble";

function verifyArray<T>(states: TAlgorithmState[], gold: T[][]) {
  expect(states.length).toBe(gold.length)

  for (let i = 0; i < gold.length; i++) {
    const data = states[i].data[0] as ArrayObject<T>
    for (let j = 0; j < gold[i].length; j++) {
      expect(data.get(j)).toBe(gold[i][j])
    }
  }
}

describe('Bubble Sort', () => {
  let bubbleSort: BubbleSortObject;
  beforeEach(() => {
    bubbleSort = new BubbleSortObject('bubble-sort test');
  })

  it('bubble sort an desc array', () => {
    const array = new ArrayObject('test array', [5, 4, 3, 2, 1])
    const gold = [
      [5, 4, 3, 2, 1],  /* init     */
      [5, 4, 3, 2, 1],  /* 5 > 4?   */
      [4, 5, 3, 2, 1],  /* swap 5 4 */
      [4, 5, 3, 2, 1],  /* 5 > 3?   */
      [4, 3, 5, 2, 1],  /* swap 5 3 */
      [4, 3, 5, 2, 1],  /* 5 > 2?   */
      [4, 3, 2, 5, 1],  /* swap 5 2 */
      [4, 3, 2, 5, 1],  /* 5 > 1?   */
      [4, 3, 2, 1, 5],  /* swap 5 1 */
      [4, 3, 2, 1, 5],  /* 4 > 3?   */
      [3, 4, 2, 1, 5],  /* swap 4 3 */
      [3, 4, 2, 1, 5],  /* 4 > 2?   */
      [3, 2, 4, 1, 5],  /* swap 4 3 */
      [3, 2, 4, 1, 5],  /* 4 > 1?   */
      [3, 2, 1, 4, 5],  /* swap 4 1 */
      [3, 2, 1, 4, 5],  /* 3 > 2?   */
      [2, 3, 1, 4, 5],  /* swap 3 2 */
      [2, 3, 1, 4, 5],  /* 3 > 1?   */
      [2, 1, 3, 4, 5],  /* swap 3 1 */
      [2, 1, 3, 4, 5],  /* 2 > 1?   */
      [1, 2, 3, 4, 5],  /* swap 2 1 */
    ]
    bubbleSort.onBind((states, ...inputs) => {
      verifyArray(states, gold)
    }).bind(array)
  })

  it('bubble sort an asc array', () => {
    const array = new ArrayObject('test array', [1, 2, 3, 4, 5])
    const gold = [
      [1, 2, 3, 4, 5],  /* init     */
      [1, 2, 3, 4, 5],  /* 1 > 2?   */
      [1, 2, 3, 4, 5],  /* 2 > 3?   */
      [1, 2, 3, 4, 5],  /* 3 > 4?   */
      [1, 2, 3, 4, 5],  /* 4 > 5?   */
      [1, 2, 3, 4, 5],  /* 1 > 2?   */
      [1, 2, 3, 4, 5],  /* 2 > 3?   */
      [1, 2, 3, 4, 5],  /* 3 > 4?   */
      [1, 2, 3, 4, 5],  /* 1 > 2?   */
      [1, 2, 3, 4, 5],  /* 2 > 3?   */
      [1, 2, 3, 4, 5],  /* 1 > 2?   */
    ]
    bubbleSort.onBind((states, ...inputs) => {
      verifyArray(states, gold)
    }).bind(array)
  })

  it('bubble sort an normal array', () => {
    const array = new ArrayObject('test array', [5, 1, 3, 2, 4])
    const gold = [
      [5, 1, 3, 2, 4],  /* init     */
      [5, 1, 3, 2, 4],  /* 5 > 1?   */
      [1, 5, 3, 2, 4],  /* swap 5 1 */
      [1, 5, 3, 2, 4],  /* 5 > 3?   */
      [1, 3, 5, 2, 4],  /* swap 5 3 */
      [1, 3, 5, 2, 4],  /* 5 > 2?   */
      [1, 3, 2, 5, 4],  /* swap 5 2 */
      [1, 3, 2, 5, 4],  /* 5 > 4?   */
      [1, 3, 2, 4, 5],  /* swap 5 4 */
      [1, 3, 2, 4, 5],  /* 1 > 3?   */
      [1, 3, 2, 4, 5],  /* 3 > 2?   */
      [1, 2, 3, 4, 5],  /* swap 3 2 */
      [1, 2, 3, 4, 5],  /* 3 > 4?   */
      [1, 2, 3, 4, 5],  /* 1 > 2?   */
      [1, 2, 3, 4, 5],  /* 2 > 3?   */
      [1, 2, 3, 4, 5],  /* 1 > 2?   */
    ]
    bubbleSort.onBind((states, ...inputs) => {
      verifyArray(states, gold)
    }).bind(array)
  })
})