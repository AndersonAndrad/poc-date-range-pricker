import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor() {
    this.makeDays(new Date(this.currentYear, this.currentMonth))
  }

  private date = new Date();

  private readonly weekday = [0, 1, 2, 3, 4, 5, 6]

  public currentYear = this.date.getFullYear()

  public currentMonth = this.date.getMonth()

  private allDays: any[] = []

  private startDate: IDay | undefined = undefined;
  private endDate: IDay | undefined = undefined;

  public days: any;

  getLastDayOfMonth(year: number, month: number) {
    return new Date(year, month + 1, 0);
  }

  getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1);
  }

  private firstSelection = false;

  public selectDay(selectedDay: IDay) {
    this.days.map((week: IDay[]) => {
      week.map(day => {
        if (day.id === selectedDay.id) {
          if (!this.startDate) {
            day.selected = true;
            this.startDate = day;
            return
          }

          if(this.startDate && day.fullDate < this.startDate.fullDate){
            day.selected = true;
            this.startDate = day;

            this.unselectAll(day.id)
            return
          }

          if (this.startDate && !this.endDate) {
            day.selected = true;
            this.endDate = day;
            this.verifyRange()
            return
          }

          if(this.startDate && this.endDate){
            day.selected = true;
            this.startDate = day;
            this.endDate = undefined;

            this.unselectAll(day.id)
            return
          }
        }
      })
    })
  }

  public verifyRange() {
    this.days.map((week: IDay[]) => {
      week.map(day => {
        if (
          this.startDate &&
          this.endDate &&
          this.startDate.fullDate < day.fullDate &&
          this.endDate.fullDate > day.fullDate
        ) day.inRange = true
      })
    })
  }

  public unselectAll(dayId: string){
    this.days.map((week: IDay[]) => {
      week.map(day => {
        if(day.id === dayId) return
        day.selected = false;
        day.inRange = false;
      })
    })
  }

  public previousMonth(){
    this.currentMonth--

    if(this.currentMonth < 0){
      this.currentMonth = 11
      this.currentYear--
    }

    const newDate = new Date(this.currentYear, this.currentMonth)

    this.makeDays(newDate)
  }

  public nextMonth(){
    this.currentMonth++

    if(this.currentMonth > 11){
      this.currentMonth = 0
      this.currentYear++
    }

    const newDate = new Date(this.currentYear, this.currentMonth)

    this.makeDays(newDate)
  }

  public makeDays(date: Date) {
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
      this.allDays.push(i)
    }

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
      matrix[k].push({
        id: this.base64(),
        day: list[i],
        fullDate: new Date(
          this.currentYear,
          this.currentMonth,
          list[i], 0, 0, 0, 0),
        inRange: false,
        selected: false
      });
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

  public isEndDate(dayId: string){
    if(!this.endDate) return false

    return this.endDate.id === dayId
  }

  public getFullMonth(){
    // if((this.currentMonth - 1) < 0){
    //   return fullMonth[0]
    // }

    return fullMonth[this.currentMonth]
  }

  public getSmallMonth(){
    // if((this.currentMonth) < 0){
    //   return smallMonth[0]
    // }

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

const fullMonth= [
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
