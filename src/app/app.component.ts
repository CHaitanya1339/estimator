import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  buildingInsights: any;

  constructor() { }

  ngOnInit(): void { }

  onBuildingInsightsChange(insights: any) {
    console.log('Received building insights:', insights);
    this.buildingInsights = insights;
  }
}