import { Component, Input } from '@angular/core';

import { FormControl } from '@angular/forms';

@Component({
  selector: 'date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
})
export class DatePickerComponent {
  @Input() control: FormControl = new FormControl();

  opened: boolean = false;

  onOpen() {
    this.opened = !this.opened;
  }
}
