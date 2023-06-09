import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DataPickerInputComponent } from './data-picker-range/components/data-picker-input/data-picker-input.component';
import { DataPickerRangeComponent } from './data-picker-range/components/data-picker-range/data-picker-range.component';
import { DatePickerCalendarComponent } from './date-picker-calendar/date-picker-calendar.component';
import { DatePickerComponent } from './date-picker/date-picker.component';

@NgModule({
  declarations: [
    AppComponent,
    DataPickerRangeComponent,
    DataPickerInputComponent,
    DatePickerCalendarComponent,
    DatePickerComponent,
  ],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
