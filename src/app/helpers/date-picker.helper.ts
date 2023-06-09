import { Component, EventEmitter, Input, Output } from '@angular/core';

import { FormControl } from '@angular/forms';
import { IDay } from '../data-picker-range/components/data-picker-range/data-picker-range.component';
import { DateHelper } from './date.helper';
import { PickerHelper } from './picker.helper';

@Component({ template: '' })
export class DatePickerHelper {
  @Input() control: FormControl = new FormControl();

  @Output() closeEmmiter: EventEmitter<void> = new EventEmitter<void>();

  protected mapDays = new Map<string, IDay[]>();

  days: IDay[][] = [];

  protected currentDay: Date = new Date();

  month: number = this.currentDay.getMonth();

  year: number = this.currentDay.getFullYear();

  /**
   * Load and change days from component
   */
  loadPreviousMonth() {
    this.month--;

    if (this.month < 0) {
      this.month = 11;
      this.year--;
    }

    this.setDays();
  }

  /**
   * Load and change days from component
   */
  loadNextMonth() {
    this.month++;

    if (this.month > 11) {
      this.month = 0;
      this.year++;
    }

    this.setDays();
  }

  protected close() {
    this.closeEmmiter.emit();
  }

  /**
   * Navigate to current month in current year
   */
  protected goToCurrentMonth() {
    this.setCurrentDate();
    this.setDays();
  }

  /**
   * Get all days reference the month and year
   * @param month
   * @param year
   * @return {IDay[]}
   */
  protected loadDays(month: number, year: number): IDay[] {
    const monthKey = PickerHelper.makeMonthKey(month, year);

    const days = this.mapDays.get(monthKey);

    if (days) return days;

    return this.makeDays(month, year);
  }

  /**
   * Change day, month and year to current
   */
  protected setCurrentDate() {
    this.currentDay = new Date();
    this.month = this.currentDay.getMonth();
    this.year = this.currentDay.getFullYear();
  }

  /**
   * Set days to show in component
   */
  protected setDays() {
    const month = this.month;
    const year = this.year;

    const days = this.loadDays(month, year);

    this.days = PickerHelper.createMatrixDays(days);
  }

  /**
   * @param month
   * @param year
   * @return {IDay[]}
   */
  protected makeDays(month: number, year: number): IDay[] {
    const firstDayMonth: Date = DateHelper.getFirstDayOfMonth(year, month);

    const lastDayMonth: Date = DateHelper.getLastDayOfMonth(year, month);

    const firstWeekDay: number = firstDayMonth.getDay();

    const allDays: IDay[] = Array(firstWeekDay).fill('');

    for (
      let currentDay = 1;
      currentDay < lastDayMonth.getDate() + 1;
      currentDay++
    ) {
      allDays.push(PickerHelper.makeDay(currentDay, month, year));
    }

    const monthKey: string = PickerHelper.makeMonthKey(month, year);

    this.mapDays.set(monthKey, allDays);

    return allDays;
  }

  protected getFullMonth(month: number) {
    return DateHelper.fullMonth[month];
  }

  protected submit() {}

  protected selectDay(selectedDay: IDay) {}
}
