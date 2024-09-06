import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-financial-analysis',
  templateUrl: './financial-analysis.component.html',
  styleUrls: ['./financial-analysis.component.scss']
})
export class FinancialAnalysisComponent implements OnInit {
  @Input() buildingInsights: any;

  panelsCount: number = 20;
  yearlyEnergyDcKwh: number = 12000;
  monthlyAverageEnergyBill: number = 300;
  energyCostPerKwh: number = 0.31;
  panelCapacityWatts: number = 400;
  solarIncentives: number = 7000;
  installationCostPerWatt: number = 4.0;
  installationLifeSpan: number = 20;

  dcToAcDerate: number = 0.85;
  efficiencyDepreciationFactor: number = 0.995;
  costIncreaseFactor: number = 1.022;
  discountRate: number = 1.04;

  installationSizeKw: number = 0;
  installationCostTotal: number = 0;
  monthlyKwhEnergyConsumption: number = 0;
  yearlyKwhEnergyConsumption: number = 0;
  totalCostWithSolar: number = 0;
  totalCostWithoutSolar: number = 0;
  savings: number = 0;
  energyCovered: number = 0;
  breakEvenYear: number = -1;
  breakEvenYearDisplay: string = "";

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['insights']) {
        this.buildingInsights = JSON.parse(params['insights']);
        console.log('Building insights received in FinancialAnalysisComponent:', this.buildingInsights);
        this.updateCalculations();
      }
    });
    this.calculateBreakEvenYearDisplay();
  }

  updateCalculations() {
    if (!this.buildingInsights) {
      return;
    }

    const solarPanelConfig = this.buildingInsights.solarPotential.solarPanelConfigs[0];
    this.panelsCount = solarPanelConfig.panelsCount;
    this.yearlyEnergyDcKwh = solarPanelConfig.yearlyEnergyDcKwh;

    this.installationSizeKw = (this.panelsCount * this.panelCapacityWatts) / 1000;
    this.installationCostTotal = this.installationCostPerWatt * this.installationSizeKw * 1000;
    this.monthlyKwhEnergyConsumption = this.monthlyAverageEnergyBill / this.energyCostPerKwh;
    this.yearlyKwhEnergyConsumption = this.monthlyKwhEnergyConsumption * 12;

    const initialAcKwhPerYear = this.yearlyEnergyDcKwh * this.dcToAcDerate;
    const yearlyProductionAcKwh = [...Array(this.installationLifeSpan).keys()].map(
      (year) => initialAcKwhPerYear * Math.pow(this.efficiencyDepreciationFactor, year)
    );

    const yearlyUtilityBillEstimates = yearlyProductionAcKwh.map(
      (yearlyKwhEnergyProduced, year) => {
        const billEnergyKwh = this.yearlyKwhEnergyConsumption - yearlyKwhEnergyProduced;
        const billEstimate = (billEnergyKwh * this.energyCostPerKwh * Math.pow(this.costIncreaseFactor, year)) / Math.pow(this.discountRate, year);
        return Math.max(billEstimate, 0);
      }
    );
    const remainingLifetimeUtilityBill = yearlyUtilityBillEstimates.reduce((x, y) => x + y, 0);
    this.totalCostWithSolar = this.installationCostTotal + remainingLifetimeUtilityBill - this.solarIncentives;

    const yearlyCostWithoutSolar = [...Array(this.installationLifeSpan).keys()].map(
      (year) => (this.monthlyAverageEnergyBill * 12 * Math.pow(this.costIncreaseFactor, year)) / Math.pow(this.discountRate, year)
    );
    this.totalCostWithoutSolar = yearlyCostWithoutSolar.reduce((x, y) => x + y, 0);

    this.savings = this.totalCostWithoutSolar - this.totalCostWithSolar;

    this.energyCovered = yearlyProductionAcKwh[0] / this.yearlyKwhEnergyConsumption;

    let costWithSolar = 0;
    const cumulativeCostsWithSolar = yearlyUtilityBillEstimates.map(
      (billEstimate, i) =>
        (costWithSolar += i == 0 ? billEstimate + this.installationCostTotal - this.solarIncentives : billEstimate)
    );
    let costWithoutSolar = 0;
    const cumulativeCostsWithoutSolar = yearlyCostWithoutSolar.map(
      (cost) => (costWithoutSolar += cost)
    );
    this.breakEvenYear = cumulativeCostsWithSolar.findIndex(
      (costWithSolar, i) => costWithSolar <= cumulativeCostsWithoutSolar[i]
    );
    this.calculateBreakEvenYearDisplay();
  }

  calculateBreakEvenYearDisplay() {
    const currentYear = new Date().getFullYear();
    this.breakEvenYearDisplay = this.breakEvenYear >= 0 ? (this.breakEvenYear + currentYear + 1).toString() : '--';
  }
}