import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor() {
    this.makeDays()
  }

  private date = new Date();

  private readonly weekday = [0, 1, 2, 3, 4, 5, 6]

  public currentYear = this.date.getFullYear()

  public currentMonth = this.date.getMonth()

  private allDays: any[] = []

  private startDate: IDay | undefined = undefined;
  public endDate: IDay | undefined = undefined;

  public months = new Map<string, IDay[]>();

  public days: any;

  getLastDayOfMonth(year: number, month: number) {
    return new Date(year, month + 1, 0);
  }

  getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1);
  }

  private firstSelection = false;

  public selectDay(selectedDay: IDay) {
    const monthKey = fullMonth[selectedDay.fullDate.getMonth()]
    const month = this.months.get(`${monthKey}-${this.currentYear}`);

    if (!month) return

    month.map(day => {
      if (day.id === selectedDay.id) {
        if (!this.startDate) {
          day.selected = true;
          this.startDate = day;

          this.unselectAllDays()
          this.makeDays()
          return;
        }

        if (this.startDate && day.fullDate < this.startDate.fullDate) {
          day.selected = true;
          this.startDate = day
          this.endDate = undefined;

          this.unselectAllDays()
          this.makeDays()
          return
        }

        if (this.startDate && !this.endDate) {
          day.selected = true;
          this.endDate = day;

          this.unselectAllDays()
          this.markRange()
          this.makeDays()
          return
        }

        if (this.startDate && this.endDate) {
          day.selected = true;
          this.startDate = day;
          this.endDate = undefined;

          this.unselectAllDays()
          this.makeDays()
          return
        }
      }
    })
  }

  private unselectAllDays() {
    Array.from(this.months.keys()).map(key => {
      const month = this.months.get(key)

      if (!month) return

      month.map(day => {
        if (!day.id) return

        if (this.startDate && this.startDate.id === day.id) return

        if (this.endDate && this.endDate.id === day.id) return

        day.selected = false
        day.inRange = false
      })
    })
  }

  private markRange() {
    if (!this.startDate) return
    if (!this.endDate) return

    Array.from(this.months.keys()).map(key => {
      const month = this.months.get(key)

      if (!month) return

      month.map(day => {
        if (!day.id) return

        if (
          this.startDate &&
          this.endDate &&
          this.startDate.fullDate < day.fullDate &&
          this.endDate.fullDate > day.fullDate
        ) day.inRange = true
      })
    })
  }

  public previousMonth() {
    this.currentMonth--

    if (this.currentMonth < 0) {
      this.currentMonth = 11
      this.currentYear--
    }


    this.makeDays()
  }

  public nextMonth() {
    this.currentMonth++

    if (this.currentMonth > 11) {
      this.currentMonth = 0
      this.currentYear++
    }


    this.makeDays()
  }

  public makeDays() {
    const existis = this.months.get(this.getMonthKey(this.currentMonth));

    if (existis) {
      this.days = this.makeDaysMatrix(existis)
      return
    }

    const lastDayCurrentMonth = this.getLastDayOfMonth(
      this.currentYear,
      this.currentMonth,
    );

    const firstDayCurrentMonth = this.getFirstDayOfMonth(
      this.currentYear,
      this.currentMonth,
    );

    const startWeekdays = this.weekday[firstDayCurrentMonth.getDay()]

    this.allDays = Array(startWeekdays).fill('')

    for (let i = 1; i < (lastDayCurrentMonth.getDate() + 1); i++) {
      this.allDays.push({
        id: this.base64(),
        day: i,
        fullDate: new Date(
          this.currentYear,
          this.currentMonth,
          i, 0, 0, 0, 0),
        inRange: false,
        selected: false
      })
    }

    this.months.set(this.getMonthKey(this.currentMonth), this.allDays)
    this.days = this.makeDaysMatrix(this.allDays)
  }

  private makeDaysMatrix(list: any[]) {
    let matrix = [], i, k;

    for (i = 0, k = -1; i < list.length; i++) {
      if (i % 7 === 0) {
        k++;
        matrix[k] = [];
      }

      // @ts-ignore
      matrix[k].push(list[i]);
    }

    return matrix;
  }

  public base64() {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < 65; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  private getMonthKey(month: number){
    return `${fullMonth[month]}-${this.currentYear}`
  }

  public isEndDate(dayId: string) {
    if (!this.endDate) return false

    return this.endDate.id === dayId
  }

  public getFullMonth() {
    return fullMonth[this.currentMonth]
  }

  public getSmallMonth() {
    return smallMonth[this.currentMonth]
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
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const smallMonth = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"]
