import {DateHelper} from "./date.helper";
import {IDay} from "../data-picker-range/components/data-picker-range/data-picker-range.component";
import {HashHelper} from "./hash.helper";

export class PickerHelper {

  /**
   * Make a key to access months
   * @param month {number}
   * @param year {number}
   * */
  static makeMonthKey(month: number, year: number): string {
    return `${DateHelper.fullMonth[month]}-${year}`;
  }

  /**
   * Make a day
   * @param day {number}
   * @param month {number}
   * @param year {number}
   * @return IDay
   */
  static makeDay(day: number, month: number, year: number): IDay {
    return {
      id: HashHelper.base64(),
      day: String(day),
      inRange: false,
      selected: false,
      fullDate: new Date(year, month, day, 0, 0, 0, 0)
    }
  }

  /**
   * Make a matrix with days
   * First array is month
   * each array inside month is week
   * each object inside week is a day
   * @param days {IDay[]}
   */
  static createMatrixDays(days: IDay[]): IDay[][] {
    let matrix = [],
      i,
      k;

    for (i = 0, k = -1; i < days.length; i++) {
      if (i % 7 === 0) {
        k++;
        matrix[k] = [];
      }

      // @ts-ignore
      matrix[k].push(days[i]);
    }

    return matrix;
  }
}
