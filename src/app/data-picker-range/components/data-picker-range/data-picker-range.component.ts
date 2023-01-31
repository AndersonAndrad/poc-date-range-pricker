import { Component, EventEmitter, Input, Output } from '@angular/core';

import { FormControl } from '@angular/forms';

@Component({
  selector: 'data-picker-range',
  templateUrl: './data-picker-range.component.html',
  styleUrls: ['./data-picker-range.component.scss'],
})
export class DataPickerRangeComponent {
  @Input() control!: FormControl;

  @Output() onCloseEmitter = new EventEmitter<boolean>();

  currentYear: number;

  currentMonth: number;

  startDate: IDay | undefined = undefined;

  endDate: IDay | undefined = undefined;

  countDaysRange: number = 0;

  months = new Map<string, IDay[]>();

  days: IDay[][] = [];

  private readonly weekday = [0, 1, 2, 3, 4, 5, 6];

  private allDays: IDay[] = [];

  private date = new Date();

  constructor() {
    this.currentYear = this.date.getFullYear();

    this.currentMonth = this.date.getMonth();

    this.loadDays();
  }

  /* Loaders */
  loadDays() {
    const month = this.months.get(this.getMonthKey(this.currentMonth));

    if (month) {
      this.days = this.createMatrixDays(month);
      return;
    }

    const lastDay = this.getLastDayOfMonth(this.currentYear, this.currentMonth);

    const firstDay = this.getFirstDayOfMonth(
      this.currentYear,
      this.currentMonth
    );

    const firstWeekDay = this.weekday[firstDay.getDay()];

    this.allDays = Array(firstWeekDay).fill('');

    for (let i = 1; i < lastDay.getDate() + 1; i++) {
      this.allDays.push({
        id: this.base64(),
        day: String(i),
        fullDate: new Date(this.currentYear, this.currentMonth, i, 0, 0, 0, 0),
        inRange: false,
        selected: false,
      });
    }

    this.months.set(this.getMonthKey(this.currentMonth), this.allDays);

    this.days = this.createMatrixDays(this.allDays);
  }

  /* Helpers */

  private getLastDayOfMonth(year: number, month: number) {
    return new Date(year, month + 1, 0);
  }

  private getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1);
  }

  /**
   * Run requested macro
   * @param macro IMacro
   */
  onMacro(macro: IMacro): void {
    this.startDate = undefined;
    this.endDate = undefined;

    this.removeHightlight();

    switch (macro) {
      case 'clear':
        this.runMacroClear();
        return;
      case 'this-year':
        this.runMacroThisYear();
        return;
      case 'this-week':
        this.runMacroThisWeek();
        return;
      case 'this-month':
        this.runMacroThisMonth();
        return;
    }
  }

  onClose() {
    this.onCloseEmitter.emit(true);
  }

  onSubmit() {
    if (!this.startDate) return;
    if (!this.endDate) return;

    this.control.setValue({
      startDate: this.startDate.fullDate,
      endDate: this.endDate.fullDate,
    });

    this.onClose();
  }

  /**
   * Mark as selected requested day
   * - **Rules**
   * - When don't have start date mark as the start date
   * - When start date has selected but try select date before start date, mark as the first date
   * - When start date has selected mark as second date
   * - When all dates are selected mark as the new first date
   * @param selectedDay Iday
   * @returns void
   */
  selectDay(selectedDay: IDay): void {
    const monthKey = fullMonth[selectedDay.fullDate.getMonth()];
    const month = this.months.get(`${monthKey}-${this.currentYear}`);

    if (!month) return;

    month.map((day) => {
      if (day.id === selectedDay.id) {
        this.countDaysRange = 1;

        /* When don't have start date */
        if (!this.startDate) {
          day.selected = true;
          this.startDate = day;

          this.removeHightlight();
          this.loadDays();
          return;
        }

        /* When start date has selected but try select day before start date */
        if (this.startDate && day.fullDate < this.startDate.fullDate) {
          day.selected = true;
          this.startDate = day;
          this.endDate = undefined;

          this.removeHightlight();
          this.loadDays();
          return;
        }

        /* When start date has selected and don't have end date */
        if (this.startDate && !this.endDate) {
          day.selected = true;
          this.endDate = day;

          this.removeHightlight();
          this.highlightRange();
          this.loadDays();
          return;
        }

        /* When start and end date has selected but try select other date */
        if (this.startDate && this.endDate) {
          day.selected = true;
          this.startDate = day;
          this.endDate = undefined;

          this.removeHightlight();
          this.loadDays();
          return;
        }
      }
    });
  }

  /**
   * Remove hightlight range
   */
  private removeHightlight(): void {
    Array.from(this.months.keys()).map((key) => {
      const month = this.months.get(key);

      if (!month) return;

      month.map((day) => {
        if (!day.id) return;

        if (this.startDate && this.startDate.id === day.id) {
          return;
        }

        if (this.endDate && this.endDate.id === day.id) {
          return;
        }

        day.selected = false;
        day.inRange = false;
      });
    });
  }

  /**
   * Hightlight range
   */
  private highlightRange(): void {
    if (!this.startDate) return;
    if (!this.endDate) return;

    this.countDaysRange = 2;

    Array.from(this.months.keys()).map((key) => {
      const month = this.months.get(key);

      if (!month) return;

      month.map((day) => {
        if (!day.id) return;

        if (
          this.startDate &&
          this.endDate &&
          this.startDate.fullDate < day.fullDate &&
          this.endDate.fullDate > day.fullDate
        ) {
          day.inRange = true;
          this.countDaysRange++;
        }
      });
    });
  }

  /**
   * Pass to previous month
   */
  onPreviousMonth(): void {
    this.currentMonth--;

    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }

    this.loadDays();
    this.highlightRange();
  }

  /**
   * Pass to next month
   */
  onNextMonth(): void {
    this.currentMonth++;

    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }

    this.loadDays();
    this.highlightRange();
  }

  private createMatrixDays(days: any[]): any[][] {
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

  private base64(): string {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < 65; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  /**
   * Make a monthkey
   * @param month - number
   * @returns string
   */
  private getMonthKey(month: number): string {
    return `${fullMonth[month]}-${this.currentYear}`;
  }

  /**
   * Check if is the and day
   * @param dayId string
   * @returns boolean
   */
  checkEndDate(dayId: string): boolean {
    if (!this.endDate) return false;

    return this.endDate.id === dayId;
  }

  getFullMonth(): string {
    return fullMonth[this.currentMonth];
  }

  /* Macros */
  /**
   * Macro to clear hightlight range
   */
  private runMacroClear(): void {
    this.countDaysRange = 0;
    this.startDate = undefined;
    this.endDate = undefined;
    this.removeHightlight();
  }

  /**
   * Macro to hightlight all year
   */
  private runMacroThisYear(): void {
    let index: number;

    const tempMonth = this.currentMonth;

    const firstMonth = this.months.get(`${fullMonth[0]}-${this.currentYear}`);

    if (!firstMonth) return;

    index = firstMonth.findIndex((day) => day.id);

    firstMonth[index].selected = true;

    this.startDate = firstMonth[index];

    this.currentMonth = 11;
    this.loadDays();

    const lastMonth = this.months.get(`${fullMonth[11]}-${this.currentYear}`);

    if (!lastMonth) return;

    lastMonth[lastMonth.length - 1].selected = true;

    this.endDate = lastMonth[lastMonth.length - 1];

    this.currentMonth = tempMonth;

    this.highlightRange();
    this.loadDays();
  }

  /**
   * Macro to hightlight the week
   */
  private runMacroThisWeek(): void {
    let index: number;

    const firstWeekday = this.date.getDate() - this.date.getDay();
    const lastWeekDay = firstWeekday + 6;

    const month = this.months.get(
      `${fullMonth[this.currentMonth]}-${this.currentYear}`
    );

    if (!month) return;

    index = month.findIndex(({ day }) => day === String(firstWeekday));

    month[index].selected = true;

    this.startDate = month[index];

    index = month.findIndex(({ day }) => day === String(lastWeekDay));

    month[index].selected = true;

    this.endDate = month[index];

    this.highlightRange();
  }

  /**
   * Macro to hightlight the month
   */
  private runMacroThisMonth(): void {
    let index: number;

    const month = this.months.get(
      `${fullMonth[this.currentMonth]}-${this.currentYear}`
    );

    if (!month) return;

    index = month.findIndex(({ day }) => day);

    month[index].selected = true;

    this.startDate = month[index];

    month[month.length - 1].selected = true;

    this.endDate = month[month.length - 1];

    this.highlightRange();
  }
}

interface IDay {
  id: string;
  day: string;
  fullDate: Date;
  inRange: boolean;
  selected: boolean;
}

const fullMonth = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

type IMacro =
  | 'last-week'
  | 'this-week'
  | 'this-month'
  | 'last-90-days'
  | 'this-year'
  | 'clear'
  | 'today';

interface IDay {
  id: string;
  day: string;
  fullDate: Date;
  inRange: boolean;
  selected: boolean;
}
