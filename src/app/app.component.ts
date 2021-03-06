import { Component, AfterViewInit, OnInit } from '@angular/core';
import * as L from 'leaflet';
import * as EsriLeaflet from 'esri-leaflet';
import 'leaflet-velocity';
import 'leaflet-timedimension';
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
  private dateObj: Date;

  constructor(private http: HttpClient, private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.dateObj = new Date();
    // const currentDate = this.dateObj.setDate(this.dateObj.getDate() - 5);
    const currentDate = this.dateObj.setDate(this.dateObj.getDate());
    const dateTransform = this.datePipe.transform(currentDate, 'yyyyMMdd');
    this.initDirectory = `init${dateTransform}00`;
    this.u10v10Directory = `u10v10_d01_${dateTransform}${this.dateObj.getHours()}`;
  }

  ngAfterViewInit(): void {
    this.apiUrl = `https://rcces.soc.cmu.ac.th/airquality_data/forecasts/Hourly/${this.initDirectory}/wind_stream/${this.u10v10Directory}.json`;
    // this.apiUrl = `https://rcces.soc.cmu.ac.th/airquality_data/forecasts/Hourly/2020-12-05/Thailand_20km/Wind_Stream/u10v10_d01_2020-12-05T00.json`;
    // this.apiUrl = `assets/data/2021-04-20.json`;

    this.initializeMap();
    // this.initializeWindStream();
  }

  private initializeWindStream(): void {
    this.http.get(this.apiUrl).subscribe((response: ResponseWindStream[]) => {
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
        velocityScale: 0.01,
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

    const initializeCurrentMonth = new Date();
    const firstDayOfMonth = this.datePipe.transform(
      new Date(
        initializeCurrentMonth.getFullYear(),
        initializeCurrentMonth.getMonth(),
        1
      ),
      'yyyy-MM-dd'
    );

    const lastDayofMonth = this.datePipe.transform(
      new Date(
        initializeCurrentMonth.getFullYear(),
        initializeCurrentMonth.getMonth() + 1,
        0
      ),
      'yyyy-MM-dd'
    );

    const currentTime = initializeCurrentMonth.getTime();

    const options = {
      layers: [EsriWorldImagery],
      timeDimension: true,
      timeDimensionOptions: {
        times: `${firstDayOfMonth}/${lastDayofMonth}/P1D`,
        // timeInterval: `${firstDayOfMonth}/${lastDayofMonth}`,
        // period: 'PT1H',
        validTimeRange: '00:01/23:59',
        currentTime,
      },
      timeDimensionControl: true,
    };

    this.map = L.map('map', options).setView([13.1643, 100.9307], 9);

    this.http.get(this.apiUrl).subscribe((response: ResponseWindStream[]) => {
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
        maxVelocity: 25,
        velocityScale: 0.1,
        opacity: 0.97,
      });

      this.velocityLayer.addTo(this.map);
    });

    this.map.timeDimension.on('timeloading', (data) => {
      const timeMinusOneDay = data.time - 24 * 60 * 60 * 1000;
      const dateloading = this.datePipe.transform(
        timeMinusOneDay,
        'yyyy-MM-dd'
      );

      this.apiUrl = `assets/data/${dateloading}.json`;

      this.http.get(this.apiUrl).subscribe(
        (response: ResponseWindStream[]) => {
          if (response) {
            this.velocityLayer.setData(response);
          }
        },
        (err) => {
          console.log(JSON.stringify(err));
        }
      );
    });

    this.layerControl = L.control.layers(baseLayers);
    this.layerControl.addTo(this.map);
  }
}
