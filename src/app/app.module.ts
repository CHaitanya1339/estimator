import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AgmCoreModule } from '@agm/core';

import { AppComponent } from './app.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgbModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBgBzxUb1STGGRI4gMGooODJYRVG_yUK9o',
      libraries: ['places', 'drawing', 'visualization']
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }