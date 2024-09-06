import { Component, OnInit, ViewChild, ElementRef, NgZone, Output, EventEmitter } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild('searchInput') searchInput!: ElementRef;
  @Output() buildingInsightsChange = new EventEmitter<any>();

  lat = 21.3069;  // Default Latitude
  lng = -157.8583;  // Default Longitude
  zoom = 15;  // Default Zoom Level
  mapType = 'satellite';  // Default Map Type
  markerLat: number | null = null;
  markerLng: number | null = null;
  markerLabel = '';
  currentPlace: any;
  buildingInsights: any = null; // Store the solar building insights
  dataLayers: any = null; // Store the data layers
  buildingInsightsJson: string = '';
  showNoLocationMessage: boolean = false; // Flag to show message if no location is selected

  private autocomplete: any;

  constructor(
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private http: HttpClient,
    private router: Router

  ) {}

  ngOnInit() {
    this.initializeSearchBox();
  }

  initializeSearchBox() {
    this.mapsAPILoader.load().then(() => {
      this.autocomplete = new google.maps.places.Autocomplete(this.searchInput.nativeElement, {
        types: ['geocode', 'establishment']
      });

      this.autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          const place = this.autocomplete.getPlace();
          this.handlePlaceSelection(place);
        });
      });
    });
  }

  navigateToFinancialAnalysis() {
    console.log('Navigate button clicked'); // Debug log
    if (!this.buildingInsights) {
      console.log('Building insights not available. Please select a location first.');
      this.showNoLocationMessage = true; // Set the flag to show the message
      return; // Prevent navigation
    }
    this.router.navigate(['/financial-analysis'], { queryParams: { insights: JSON.stringify(this.buildingInsights) } });
  }


  handlePlaceSelection(place: google.maps.places.PlaceResult) {
    if (place.geometry && place.geometry.location) {
      this.currentPlace = place;
      this.lat = place.geometry.location.lat();
      this.lng = place.geometry.location.lng();
      this.markerLat = this.lat;
      this.markerLng = this.lng;
      this.markerLabel = place.name || '';
      this.getBuildingInsights(this.lat, this.lng);  // Fetch solar data for selected building
      this.getDataLayers(this.lat, this.lng); 
      this.zoom = 17;
    }
  }

  // Fetch solar building data
  getBuildingInsights(lat: number, lng: number) {
    const apiKey = 'AIzaSyBgBzxUb1STGGRI4gMGooODJYRVG_yUK9o';  // Replace with your actual Google API Key
    const solarApiUrl = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&requiredQuality=HIGH&key=${apiKey}`;

    this.http.get(solarApiUrl).subscribe(
      (data: any) => {
        console.log('Solar API Response:', data);
        this.buildingInsights = data;
      },
      (error) => {
        console.error('Error fetching solar data:', error);
      }
    );
  }



// Fetch data layers for the given location
getDataLayers(lat: number, lng: number) {
  const apiKey = 'AIzaSyBgBzxUb1STGGRI4gMGooODJYRVG_yUK9o';  // Replace with your actual Google API Key
  const dataLayersUrl = `https://solar.googleapis.com/v1/dataLayers:get?location.latitude=${lat}&location.longitude=${lng}&radiusMeters=100&view=FULL_LAYERS&requiredQuality=HIGH&exactQualityRequired=true&pixelSizeMeters=0.5&key=${apiKey}`;

  // Make the HTTP GET request to the Solar API to get data layers
  this.http.get(dataLayersUrl).subscribe(
    (data: any) => {
      console.log('Data Layers API Response:', data);  // Print the result as JSON in the console
      this.dataLayers = data;  // Store the response data in  dataLayers
    },
    (error) => {
      console.error('Error fetching data layers:', error);
    }
  );
}

  // Helper function to format numbers
  showNumber(value: number): string {
    return value ? value.toFixed(2) : '-';
  }

  onMapClick(event: { coords: { lat: number; lng: number } }) {
    this.markerLat = event.coords.lat;
    this.markerLng = event.coords.lng;
    this.markerLabel = '';
    
    // Reverse geocoding to get address
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      { location: { lat: this.markerLat, lng: this.markerLng } },
      (results, status) => {
        if (status === 'OK' && results && results[0]) {
          this.ngZone.run(() => {
            this.currentPlace = results[0];
            this.searchInput.nativeElement.value = results[0].formatted_address;
          });
        }
      }
    );
  }
}
