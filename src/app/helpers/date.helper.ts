export class DateHelper {
  static readonly fullMonth = [
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

  /**
   * Get a new date with first day of month
   * @return {Date}
   */
  static getLastDayOfMonth(year: number, month: number) : Date{
    return new Date(year, month + 1, 0);
  }

  /**
   * Get a new date with last day of month
   * @return {Date}
   */
  static getFirstDayOfMonth(year: number, month: number): Date {
    return new Date(year, month, 1);
  }
}
