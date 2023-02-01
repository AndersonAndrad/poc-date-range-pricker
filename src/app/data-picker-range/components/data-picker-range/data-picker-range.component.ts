import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { FormControl } from '@angular/forms';

@Component({
  selector: 'data-picker-range',
  templateUrl: './data-picker-range.component.html',
  styleUrls: ['./data-picker-range.component.scss'],
})
export class DataPickerRangeComponent implements OnInit {
  @Input() control!: FormControl;

  @Output() onCloseEmitter = new EventEmitter<boolean>();

  currentYear: number;

  currentMonth: number;

  startDate: IDay | undefined = undefined;

  endDate: IDay | undefined = undefined;

  countDaysRange: number = 0;

  MapMonths = new Map<string, IDay[]>();

  days: IDay[][] = [];

  private readonly weekday = [0, 1, 2, 3, 4, 5, 6];

  private date = new Date();

  constructor() {
    this.currentYear = this.date.getFullYear();

    this.currentMonth = this.date.getMonth();
  }

  ngOnInit(): void {
    this.patchValues();

    this.loadDays();
  }

  /* Loaders */
  loadDays() {
    const month = this.MapMonths.get(
      this.getMonthKey(this.currentMonth, this.currentYear)
    );

    if (month) {
      this.days = this.createMatrixDays(month);
      return;
    }

    const allDays = this.laodMonth(this.currentMonth, this.currentYear);

    this.days = this.createMatrixDays(allDays);
  }

  private laodMonth(month: number, year: number): IDay[] {
    const registredMonth = this.MapMonths.get(this.getMonthKey(month, year));

    if (registredMonth) return registredMonth;

    const firstDay: Date = this.getFirstDayOfMonth(year, month);

    const lastDay: Date = this.getLastDayOfMonth(year, month);

    const firstWeekDay: number = this.weekday[firstDay.getDay()];

    const allDays: IDay[] = Array(firstWeekDay).fill('');

    for (let i = 1; i < lastDay.getDate() + 1; i++) {
      allDays.push({
        id: this.base64(),
        day: String(i),
        fullDate: new Date(year, month, i, 0, 0, 0, 0),
        inRange: false,
        selected: false,
      });
    }

    this.MapMonths.set(this.getMonthKey(month, year), allDays);

    return allDays;
  }

  private patchValues() {
    const dates = this.control.value;

    if (!dates || !dates['startDate'] || !dates['endDate']) return;

    let newDate = new Date(dates['startDate']);

    let day = newDate.getDate();
    let month = newDate.getMonth();
    let year = newDate.getFullYear();

    this.laodMonth(month, year);

    let key = this.getMonthKey(month, year);
    let createdMonth = this.MapMonths.get(key);

    if (!createdMonth) return;
    createdMonth.map((item) => {
      if (item.day === String(day)) {
        item.selected = true;
        this.startDate = item;

        this.currentMonth = month;
        this.currentYear = year;
      }
    });

    newDate = new Date(dates['endDate']);

    day = newDate.getDate();
    month = newDate.getMonth();
    year = newDate.getFullYear();

    this.laodMonth(month, year);

    key = this.getMonthKey(month, year);
    createdMonth = this.MapMonths.get(key);

    if (!createdMonth) return;
    createdMonth.map((item) => {
      if (item.day === String(day)) {
        if (this.startDate!.fullDate > item.fullDate) return;
        item.selected = true;
        this.endDate = item;
      }
    });

    this.highlightRange();
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
    const key = this.getMonthKey(
      selectedDay.fullDate.getMonth(),
      this.currentYear
    );

    const month = this.MapMonths.get(key);

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
    Array.from(this.MapMonths.keys()).map((key) => {
      const month = this.MapMonths.get(key);

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

    Array.from(this.MapMonths.keys()).map((key) => {
      const month = this.MapMonths.get(key);

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
  private getMonthKey(month: number, year: number): string {
    return `${fullMonth[month]}-${year}`;
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

    const firstMonth = this.MapMonths.get(
      `${fullMonth[0]}-${this.currentYear}`
    );

    if (!firstMonth) return;

    index = firstMonth.findIndex((day) => day.id);

    firstMonth[index].selected = true;

    this.startDate = firstMonth[index];

    this.currentMonth = 11;
    this.loadDays();

    const lastMonth = this.MapMonths.get(
      `${fullMonth[11]}-${this.currentYear}`
    );

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

    const month = this.MapMonths.get(
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

    const month = this.MapMonths.get(
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
