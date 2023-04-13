import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import {FormControl} from '@angular/forms';
import {DateHelper} from "../../../helpers/date.helper";
import {PickerHelper} from "../../../helpers/picker.helper";
import {MacroEnum} from "../../../interfaces/picker.interface";

@Component({
  selector: 'data-picker-range',
  templateUrl: './data-picker-range.component.html',
  styleUrls: ['./data-picker-range.component.scss'],
})
export class DataPickerRangeComponent implements OnInit {
  @Input()
  control!: FormControl;

  @Output()
  onCloseEmitter = new EventEmitter<boolean>();

  protected readonly MacroEnum = MacroEnum;

  currentYear: number;

  currentMonth: number;

  startDate: IDay | undefined = undefined;

  endDate: IDay | undefined = undefined;

  countDaysRange: number = 0;

  mapMonths = new Map<string, IDay[]>();

  days: IDay[][] = [];

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
    this.removeHighlightSelected();
    this.highlightRange();

    const days = this.mapMonths.get(
      PickerHelper.makeMonthKey(this.currentMonth, this.currentYear)
    );

    if (days) {
      this.days = PickerHelper.createMatrixDays(days);
      return;
    }

    const allDays = this.loadMonth(this.currentMonth, this.currentYear);

    this.days = PickerHelper.createMatrixDays(allDays);
  }

  private loadMonth(month: number, year: number): IDay[] {
    const monthKey = PickerHelper.makeMonthKey(month, year);

    const registeredMonth = this.mapMonths.get(monthKey);

    if (registeredMonth) return registeredMonth;

    const firstDay: Date = DateHelper.getFirstDayOfMonth(year, month);

    const lastDay: Date = DateHelper.getLastDayOfMonth(year, month);

    const firstWeekDay: number = firstDay.getDay();

    const allDays: IDay[] = Array(firstWeekDay).fill('');

    for (let currentDay = 1; currentDay < lastDay.getDate() + 1; currentDay++) {
      allDays.push(PickerHelper.makeDay(currentDay, month, year));
    }

    this.mapMonths.set(monthKey, allDays);

    return allDays;
  }

  private patchValues() {
    const dates = this.control.value;

    if (!dates || !dates['startDate'] || !dates['endDate']) return;

    let newDate = new Date(dates['startDate']);

    let day = newDate.getDate();
    let month = newDate.getMonth();
    let year = newDate.getFullYear();

    this.loadMonth(month, year);

    let monthKey = PickerHelper.makeMonthKey(month, year);
    let createdMonth = this.mapMonths.get(monthKey);

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

    this.loadMonth(month, year);

    monthKey = PickerHelper.makeMonthKey(month, year);
    createdMonth = this.mapMonths.get(monthKey);

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


  /**
   * Run requested macro
   * @param macro IMacro
   */
  runMacro(macro: MacroEnum): void {
    this.startDate = undefined;
    this.endDate = undefined;

    this.removeHighlightRange();

    switch (macro) {
      case MacroEnum.CLEAR:
        this.macroClear();
        return;
      case MacroEnum.THIS_YEAR:
        this.macroThisYear();
        return;
      case MacroEnum.THIS_WEEK:
        this.macroThisWeek();
        return;
      case MacroEnum.THIS_MONTH:
        this.macroThisMonth();
        return;
      case MacroEnum.LAST_15_DAYS:
        this.macroLastFifteenDays();
        return;
      case MacroEnum.LAST_30_DAYS:
        this.macroLastThirtyDays();
        return;
      case MacroEnum.LAST_90_DAYS:
        this.macroLastNinetyDays();
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

  checkFirstDayIsEqualLastDay() {
    if (this.startDate && this.endDate) {
      return this.startDate.day === this.endDate.day
    }

    return false;
  }

  /**
   * Mark as selected requested day
   * - **Rules**
   * - When don't have start date mark as the start date
   * - When start date has selected but try select date before start date, mark as the first date
   * - When start date has selected mark as second date
   * - When all dates are selected mark as the new first date
   * @param selectedDay IDay
   * @returns void
   */
  selectDay(selectedDay: IDay): void {
    const monthKey = PickerHelper.makeMonthKey(
      selectedDay.fullDate.getMonth(),
      this.currentYear
    );

    const month = this.mapMonths.get(monthKey);

    if (!month) return;

    this.removeHighlightSelected();
    this.removeHighlightRange();

    month.map((day) => {
      if (day.id === selectedDay.id) {
        this.countDaysRange = 1;

        /* When don't have start date */
        if (!this.startDate) {
          day.selected = true;
          this.startDate = day;

          this.loadDays();
          return;
        }

        /* When start date has selected but try select day before start date */
        if (this.startDate && day.fullDate < this.startDate.fullDate) {
          day.selected = true;
          this.startDate = day;
          this.endDate = undefined;

          this.loadDays();
          return;
        }

        /* When start date has selected and don't have end date */
        if (this.startDate && !this.endDate) {
          day.selected = true;
          this.endDate = day;

          this.loadDays();
          return;
        }

        /* When start and end date has selected but try select other date */
        if (this.startDate && this.endDate) {
          day.selected = true;
          this.startDate = day;
          this.endDate = undefined;

          this.loadDays();
          return;
        }
      }
    });
  }

  /**
   * Remove highlight range
   * keep in days selected
   */
  private removeHighlightRange(): void {
    Array.from(this.mapMonths.keys()).map((key) => {
      const month = this.mapMonths.get(key);

      if (!month) return;

      month.map((day) => {
        if (!day.id) return;

        if (this.startDate && this.startDate.id === day.id) return

        if (this.endDate && this.endDate.id === day.id) return

        day.inRange = false;
        this.removeHighlightSelected();
      });
    });
  }

  private removeAllHighlight() {
    Array.from(this.mapMonths.keys()).map((key) => {
      const month = this.mapMonths.get(key);

      if (!month) return;

      month.map((day) => {
        if (!day.id) return;

        day.inRange = false;
      });
    });
  }

  /**
   * Remove highlight selected
   * keep in days selected
   */
  private removeHighlightSelected() {
    Array.from(this.mapMonths.keys()).map((key) => {
      const month = this.mapMonths.get(key);

      if (!month) return;

      month.map((day) => {
        if (!day.id) return;

        if (this.startDate && this.startDate.id === day.id) return

        if (this.endDate && this.endDate.id === day.id) return

        day.selected = false;
      });
    });
  }

  /**
   * highlight range
   */
  private highlightRange(): void {
    if (!this.startDate && !this.endDate) return;

    this.countDaysRange = 2;

    Array.from(this.mapMonths.keys()).map((key) => {
      const month = this.mapMonths.get(key);

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
  loadPreviousMonth(): void {
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
  loadNextMonth(): void {
    this.currentMonth++;

    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }

    this.loadDays();
    this.highlightRange();
  }

  /**
   * Check if is end day
   * @param dayId {string}
   * @returns boolean
   */
  checkEndDate(dayId: string): boolean {
    if (!this.endDate) return false;

    return this.endDate.id === dayId;
  }

  getFullMonth(): string {
    return DateHelper.fullMonth[this.currentMonth];
  }

  /* Macros */
  /**
   * Macro to clear highlight range
   */
  private macroClear(): void {
    this.countDaysRange = 0;
    this.startDate = undefined;
    this.endDate = undefined;
    this.removeHighlightRange();
  }

  /**
   * Macro to highlight all year
   */
  private macroThisYear(): void {
    const firstMonth = this.loadMonth(0, this.currentYear);
    const lastMonth = this.loadMonth(11, this.currentYear);

    const firstYearDay = firstMonth[0];
    const lastYearDay = lastMonth[lastMonth.length - 1];

    firstYearDay.selected = true;
    lastYearDay.selected = true;

    this.startDate = firstYearDay;
    this.endDate = lastYearDay;

    this.highlightRange();
  }

  /**
   * Macro to highlight the week
   */
  private macroThisWeek(): void {
    let monthKey = PickerHelper.makeMonthKey(this.currentMonth, this.currentYear)

    let days = this.mapMonths.get(monthKey);

    if (!days) return;

    let currentDay: number = this.currentDay.getDate();

    const dayOfWeek = this.currentDay.getDay();
    const daysAfterCurrentDay = 7 - (dayOfWeek + 1);
    const daysBeforeCurrentDay = 7 - daysAfterCurrentDay;

    const markAfterDays = (data: DaysToCheck) => {
      if(!data.days) return

      let days = data.days

      let monthKey = PickerHelper.makeMonthKey(this.currentMonth, this.currentYear);

      if (!days) return;

      if (data.countDaysCheck === 0) {
        days.map(day => {
          if (day.day === String(currentDay)) {
            day.selected = true
            this.endDate = day;
          }
        })

        return
      }

      currentDay =  currentDay + data.countDaysCheck

      while (data.countDaysCheck !== 0) {
        let count = 0
        const {day} = days[days.length - 1]

        if (currentDay + data.countDaysCheck > Number(day)) {
          this.loadNextMonth();
          monthKey = PickerHelper.makeMonthKey(this.currentMonth, this.currentYear);

          if(!this.mapMonths.has(monthKey)) break

          days = this.mapMonths.get(monthKey)!;

          currentDay = Number(days[data.countDaysCheck].day)
        }

        days.map(day => {
          if (day.day === String(currentDay)) {
            if (!this.endDate) {
              day.selected = true;
              this.endDate = day
            }

            day.inRange = true;
          }
        })

        data.countDaysCheck--
        currentDay--
        count++

        if (count > 10) break
      }
    }


    markAfterDays({days, countDaysCheck: daysAfterCurrentDay});
    this.markBeforeDays({days, countDaysCheck: daysBeforeCurrentDay});

    this.highlightRange()
  }

  private markBeforeDays(data: DaysToCheck) {
    if(!data.days) return

    let days = data.days;
    let currentDay: number = this.currentDay.getDate();

    while(data.countDaysCheck !== 0) {
      let count: number = 0;

      if(currentDay <= 0){
        this.loadPreviousMonth();
        const monthKey = PickerHelper.makeMonthKey(this.currentMonth, this.currentYear);

        if(!this.mapMonths.has(monthKey)) break

        days = this.mapMonths.get(monthKey)!;

        currentDay = days.filter(({day}) => day).length
      }


      days.map(day => {
        if (day.day === String(currentDay)) {
          day.inRange = true

          if(!this.endDate){
            day.selected = true;
            this.endDate = day
          }

          if (data.countDaysCheck === 1) {
            day.selected = true
            this.startDate = day
          }
        }
      })

      currentDay--
      data.countDaysCheck--

      if(count > 10) break
    }
  }

  /**
   * Macro to highlight the month
   */
  private macroThisMonth(): void {
    let index: number;

    const monthKey = PickerHelper.makeMonthKey(this.currentMonth, this.currentYear)

    const days = this.mapMonths.get(monthKey);

    if (!days) return;

    index = days.findIndex(({day}) => day);

    days[index].selected = true;

    this.startDate = days[index];

    days[days.length - 1].selected = true;

    this.endDate = days[days.length - 1];

    this.highlightRange();
  }

  /**
   * Macro to highlight the last thirty days
   */
  private macroLastThirtyDays(): void {
    let monthKey: string = PickerHelper.makeMonthKey(this.currentMonth, this.currentYear);

    let days = this.mapMonths.get(monthKey);

    if (!days) return;

    this.markBeforeDays({days, countDaysCheck: 30})

    this.highlightRange();
  }

  /**
   * Macro to highlight the last fifteen days
   */
  private macroLastFifteenDays(): void {
    let monthKey: string = PickerHelper.makeMonthKey(this.currentMonth, this.currentYear);

    let days = this.mapMonths.get(monthKey);

    if (!days) return;

    this.markBeforeDays({days, countDaysCheck: 15})

    this.highlightRange();
  }

  /**
   * Macro to highlight the last ninety days
   */
  private macroLastNinetyDays(): void {
    let monthKey: string = PickerHelper.makeMonthKey(this.currentMonth, this.currentYear);

    let days = this.mapMonths.get(monthKey);

    if (!days) return;

    this.markBeforeDays({days, countDaysCheck: 90})

    this.highlightRange();
  }
}

export interface IDay {
  id: string;
  day: string;
  fullDate: Date;
  inRange: boolean;
  selected: boolean;
}

interface DaysToCheck {
  days?: IDay[],
  countDaysCheck: number,
}

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
