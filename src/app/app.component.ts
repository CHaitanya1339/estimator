import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('searchInput') searchInput!: ElementRef;

  lat = 21.3069;  // Default Latitude
  lng = -157.8583;  // Default Longitude
  zoom = 15;  // Default Zoom Level
  mapType = 'satellite';  // Default Map Type
  markerLat: number | null = null;
  markerLng: number | null = null;
  markerLabel = '';
  currentPlace: any;
  buildingInsights: any = null; // Store the solar building insights

  private autocomplete: any;

  constructor(
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private http: HttpClient,
    private modalService: NgbModal
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

  handlePlaceSelection(place: google.maps.places.PlaceResult) {
    if (place.geometry && place.geometry.location) {
      this.currentPlace = place;
      this.lat = place.geometry.location.lat();
      this.lng = place.geometry.location.lng();
      this.markerLat = this.lat;
      this.markerLng = this.lng;
      this.markerLabel = place.name || '';
      this.getSolarData(this.lat, this.lng);  // Fetch solar data for selected building
      this.zoom = 17;
    }
  }

  // Fetch solar building data
  getSolarData(lat: number, lng: number) {
    const apiKey = 'AIzaSyBgBzxUb1STGGRI4gMGooODJYRVG_yUK9o';  // Replace with your actual Google API Key
    const solarApiUrl = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&requiredQuality=HIGH&key=${apiKey}`;

    // Make the HTTP GET request to the Solar API
    this.http.get(solarApiUrl).subscribe(
      (data: any) => {
        console.log('Solar API Response:', data);  // Print the result as JSON in the console
        this.buildingInsights = data;  // Store the response data in buildingInsights
      },
      (error) => {
        console.error('Error fetching solar data:', error);
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