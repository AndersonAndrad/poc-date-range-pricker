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

  private currentDay = new Date();

  constructor() {
    this.currentYear = this.currentDay.getFullYear();

    this.currentMonth = this.currentDay.getMonth();
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
      case 'last-15-days':
        this.runMacroLastFifteenDays();
        return;
      case 'last-30-days':
        this.runMacroLastThirtyDays();
        return;
      case 'last-90-days':
        this.runMacroLastNinetyDays();
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
    const firstMonth = this.laodMonth(0, this.currentYear);
    const lastMonth = this.laodMonth(11, this.currentYear);

    const firstYearDay = firstMonth[0];
    const lastYearDay = lastMonth[lastMonth.length - 1];

    firstYearDay.selected = true;
    lastYearDay.selected = true;

    this.startDate = firstYearDay;
    this.endDate = lastYearDay;

    this.highlightRange();
  }

  /**
   * Macro to hightlight the week
   */
  private runMacroThisWeek(): void {
    const firstWeekday = this.currentDay.getDate() - this.currentDay.getDay();
    const lastWeekDay = firstWeekday + 6;

    const days = this.MapMonths.get(
      `${fullMonth[this.currentMonth]}-${this.currentYear}`
    );

    if (!days) return;

    days.map((day) => {
      if (day.day === String(firstWeekday)) {
        day.selected = true;

        this.startDate = day;
      }

      if (this.startDate && day.day === String(lastWeekDay)) {
        day.selected = true;

        this.endDate = day;
      }
    });

    if (lastWeekDay > 31 || lastWeekDay > 30) {
      const day = days[days.length - 1];

      day.selected = true;

      this.endDate = day;
    }

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

  /**
   * Macro to hightlight the last thirty days
   */
  private runMacroLastThirtyDays(): void {
    let month = this.currentMonth;
    let year = this.currentYear;

    const key: string = this.getMonthKey(month, year);

    const days = this.MapMonths.get(key);

    if (!days) return;

    days.map((day) => {
      if (day.day !== String(this.currentDay.getDate())) return;

      day.selected = true;

      this.endDate = day;
    });

    if (!this.endDate) return;

    let currentDay: number = Number(this.endDate.day) - 30;

    if (currentDay < 0) {
      month = month - 1;

      if (month < 0) {
        year = year - 1;
        month = 11;
      }

      currentDay = Math.abs(currentDay);

      currentDay = currentDay - 30;

      currentDay = Math.abs(currentDay);

      this.laodMonth(month, year);

      const key = this.getMonthKey(month, year);

      const days = this.MapMonths.get(key);

      if (!days) return;

      days.map((day) => {
        if (day.day !== String(currentDay)) return;

        day.selected = true;

        this.startDate = day;
      });
    }

    this.highlightRange();
  }

  /**
   * Macro to hightlight the last fifteen days
   */
  private runMacroLastFifteenDays(): void {
    let month = this.currentMonth;
    let year = this.currentYear;

    let key: string = this.getMonthKey(month, year);

    let days = this.MapMonths.get(key);

    if (!days) return;

    days.map((day) => {
      if (day.day !== String(this.currentDay.getDate())) return;

      day.selected = true;

      this.endDate = day;
    });

    if (!this.endDate) return;

    let currentDay: number = Number(this.endDate.day) - 14;

    if (currentDay < 0) {
      month = month - 1;

      if (month < 0) {
        year = year - 1;
        month = 11;
      }
    }

    if (this.currentMonth !== month) {
      this.laodMonth(month, year);

      key = this.getMonthKey(month, year);

      days = this.MapMonths.get(key);

      if (!days) return;

      const lastDay = days[days.length - 1];

      currentDay = Math.abs(currentDay);

      currentDay = currentDay - Number(lastDay.day) - 1;

      currentDay = Math.abs(currentDay);
    }

    days.map((day) => {
      if (day.day !== String(currentDay)) return;

      day.selected = true;

      this.startDate = day;
    });

    this.highlightRange();
  }

  /**
   * Macro to hightlight the last ninety days
   */
  private runMacroLastNinetyDays(): void {
    let month = this.currentMonth;
    let year = this.currentYear;

    let key: string = this.getMonthKey(month, year);

    let days = this.MapMonths.get(key);

    if (!days) return;

    days.map((day) => {
      if (day.day !== String(this.currentDay.getDate())) return;

      day.selected = true;

      this.endDate = day;
    });

    if (!this.endDate) return;

    let currentDay: number = Number(this.endDate.day) - 89;

    if (currentDay < 0) {
      month = month - 1;

      if (month < 0) {
        year = year - 1;
        month = Math.abs(month) - 11;
      }

      month = Math.abs(month);
    }

    this.laodMonth(month, year);

    key = this.getMonthKey(month, year);

    days = this.MapMonths.get(key);

    if (!days) return;

    let lastDay = days[days.length - 1];

    currentDay = Math.abs(currentDay);

    currentDay = Number(lastDay.day) - currentDay;

    if (currentDay < 0) {
      month = month - 1;

      if (month < 0) {
        year = year - 1;
        month = Math.abs(month) - 11;
      }

      month = Math.abs(month);
    }

    this.laodMonth(month, year);

    key = this.getMonthKey(month, year);

    days = this.MapMonths.get(key);

    if (!days) return;

    lastDay = days[days.length - 1];

    currentDay = Math.abs(currentDay);

    currentDay = currentDay - Number(lastDay.day);

    currentDay = currentDay - Number(lastDay.day) - 1;

    currentDay = Math.abs(currentDay);

    days.map((day) => {
      if (day.day !== String(currentDay)) return;

      day.selected = true;

      this.startDate = day;
    });

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
  | 'last-30-days'
  | 'last-15-days'
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
