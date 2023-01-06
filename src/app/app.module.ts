import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {DataPickerRangeComponent} from "./data-picker-range/components/data-picker-range/data-picker-range.component";
import {DataPickerInputComponent} from "./data-picker-range/components/data-picker-input/data-picker-input.component";

@NgModule({
  declarations: [
    AppComponent,
    DataPickerRangeComponent,
    DataPickerInputComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
