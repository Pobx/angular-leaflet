import { Component, AfterViewInit, OnInit } from '@angular/core';
import * as L from 'leaflet';
import * as EsriLeaflet from 'esri-leaflet';
import 'leaflet-velocity';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ResponseWindStream } from 'src/models/wind.stream.model';

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'angular-leaflet';

  private map;
  private layerControl;
  private apiUrl: string;
  private initDirectory: string;
  private u10v10Directory: string;
  private velocityLayer;

  constructor(private http: HttpClient, private datePipe: DatePipe) {}

  ngOnInit(): void {
    const dateObj = new Date();
    const currentDate = dateObj.setDate(dateObj.getDate() - 5);
    const dateTransform = this.datePipe.transform(currentDate, 'yyyyMMdd');
    this.initDirectory = `init${dateTransform}00`;
    this.u10v10Directory = `u10v10_d01_${dateTransform}${dateObj.getHours()}`;
  }

  ngAfterViewInit(): void {
    // this.apiUrl = `https://airvista.soc.cmu.ac.th/wrf_chem_out/d01/hourly/${this.initDirectory}/wind_stream/${this.u10v10Directory}.json`;
    // this.apiUrl = `assets/data/u10v10_d01_2021042411.json`;
    this.apiUrl = `assets/data/wind-global.json`;

    console.log(this.apiUrl);
    this.initializeMap();
    this.initializeWindStream();
  }

  private initializeWindStream(): void {
    this.http.get(this.apiUrl).subscribe((response: ResponseWindStream[]) => {
      console.log(response);
      console.log(response[0].header);
      console.log(response[0].data);
      const velocityName = response
        .map((value) => value.header.parameterNumberName)
        .join(' - ');
      this.velocityLayer = L.velocityLayer({
        displayValues: true,
        displayOptions: {
          velocityType: 'Pobx',
          position: 'bottomleft',
          emptyString: 'No water data',
        },
        data: response,
        minVelocity: 1,
        maxVelocity: 10,
        velocityScale: 0.010,
        opacity: 0.97,
      });

      this.layerControl.addOverlay(this.velocityLayer, velocityName);
    });
  }

  private initializeMap(): void {
    const EsriWorldImagery = L.tileLayer(
      'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'My attribution',
      }
    );

    const baseLayers = {
      Satellite: EsriWorldImagery,
    };

    const options = {
      layers: [EsriWorldImagery],
    };

    this.map = L.map('map', options).setView([13.1643, 100.9307], 9);

    this.layerControl = L.control.layers(baseLayers);
    this.layerControl.addTo(this.map);

    // const marker = L.marker([13.1643, 100.9307]);
    // marker.addTo(this.map);

    // EsriLeaflet.basemapLayer('Topographic').addTo(this.map);
    // console.log(EsriLeaflet);
    // console.log(LeafletVelocity);

    console.log(L);
  }
}
