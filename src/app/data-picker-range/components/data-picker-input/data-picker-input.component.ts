import {Component} from "@angular/core";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'data-picker',
  templateUrl: './data-picker-input.component.html',
  styleUrls: ['./data-picker-input.component.scss']
})
export class DataPickerInputComponent {
  public formControl = new FormControl()
  public opened: boolean = false;

  public onOpen(){
    this.opened = !this.opened
  }
}
