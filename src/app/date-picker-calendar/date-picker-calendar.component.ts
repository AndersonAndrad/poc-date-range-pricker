import { Component, OnInit } from '@angular/core';

import { IDay } from '../data-picker-range/components/data-picker-range/data-picker-range.component';
import { DatePickerHelper } from '../helpers/date-picker.helper';
import { PickerHelper } from '../helpers/picker.helper';

@Component({
  selector: 'date-picker-calendar',
  templateUrl: './date-picker-calendar.component.html',
  styleUrls: ['./date-picker-calendar.component.scss'],
})
export class DatePickerCalendarComponent
  extends DatePickerHelper
  implements OnInit
{
  date: IDay | undefined = undefined;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.pathDay();

    this.setDays();
  }

  protected override selectDay(selectedDay: IDay) {
    this.removeSelectsDays();

    const month = selectedDay.fullDate.getMonth();

    const monthKey = PickerHelper.makeMonthKey(month, this.year);

    if (!this.mapDays.has(monthKey)) this.loadDays(month, this.year);

    const days = this.mapDays.get(monthKey);

    if (!days) return;

    days.map((day) => {
      if (day.id !== selectedDay.id) return;

      day.selected = true;
      this.date = day;
    });
  }

  private removeSelectsDays() {
    Array.from(this.mapDays.keys()).map((key) => {
      const month = this.mapDays.get(key);

      if (!month) return;

      month.map((day) => {
        if (!day.id) return;

        day.selected = false;
      });
    });
  }

  private pathDay() {
    const date = this.control.value;

    if (!date) return;

    const newDate = new Date(date);
    const currentDay = newDate.getDate();

    const monthKey = PickerHelper.makeMonthKey(
      newDate.getMonth(),
      newDate.getFullYear()
    );

    const createdMonth = this.mapDays.get(monthKey);

    if (!createdMonth) return;

    createdMonth.map((day) => {
      if (day.day !== String(currentDay)) return;

      day.selected = true;
      this.date = day;

      this.month = newDate.getMonth();
      this.year = newDate.getFullYear();
    });
  }

  protected override submit(): void {
    if (!this.date) return;

    this.control.setValue(this.date.fullDate);
    this.close();
  }
}
