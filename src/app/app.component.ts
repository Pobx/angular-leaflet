import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import * as EsriLeaflet from 'esri-leaflet';
import 'leaflet-velocity';

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
export class AppComponent implements AfterViewInit {
  title = 'angular-leaflet';

  private map;

  private initializeMap(): void {
    // this.map = L.map('map', {
    //   center: [15.87, 100.9925],
    //   zoom: 6,
    // });
    this.map = L.map('map').setView([13.1643, 100.9307], 9);

    const tiles = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 18,
        minZoom: 3,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    );

    tiles.addTo(this.map);

    const marker = L.marker([13.1643, 100.9307]);
    marker.addTo(this.map);

    EsriLeaflet.basemapLayer('Topographic').addTo(this.map);
    console.log(EsriLeaflet);
    // console.log(LeafletVelocity);
    console.log(L);
    const data = [
      {
        header: {
          discipline: 0,
          disciplineName: 'Meteorological products',
          gribEdition: 2,
          gribLength: 76420,
          center: 7,
          centerName: 'US National Weather Service - NCEP(WMC)',
          subcenter: 0,
          refTime: '2016-04-30T06:00:00.000Z',
          significanceOfRT: 1,
          significanceOfRTName: 'Start of forecast',
          productStatus: 0,
          productStatusName: 'Operational products',
          productType: 1,
          productTypeName: 'Forecast products',
          productDefinitionTemplate: 0,
          productDefinitionTemplateName:
            'Analysis/forecast at horizontal level/layer at a point in time',
          parameterCategory: 2,
          parameterCategoryName: 'Momentum',
          parameterNumber: 2,
          parameterNumberName: 'U-component_of_wind',
          parameterUnit: 'm.s-1',
          genProcessType: 2,
          genProcessTypeName: 'Forecast',
          forecastTime: 0,
          surface1Type: 103,
          surface1TypeName: 'Specified height level above ground',
          surface1Value: 10.0,
          surface2Type: 255,
          surface2TypeName: 'Missing',
          surface2Value: 0.0,
          gridDefinitionTemplate: 0,
          gridDefinitionTemplateName: 'Latitude_Longitude',
          numberPoints: 65160,
          shape: 6,
          shapeName: 'Earth spherical with radius of 6,371,229.0 m',
          gridUnits: 'degrees',
          resolution: 48,
          winds: 'true',
          scanMode: 0,
          nx: 360,
          ny: 181,
          basicAngle: 0,
          subDivisions: 0,
          lo1: 0.0,
          la1: 90.0,
          lo2: 359.0,
          la2: -90.0,
          dx: 1.0,
          dy: 1.0,
        },
        data: [],
      },
    ];

    const velocityLayer = L.velocityLayer({
      displayValues: true,
      displayOptions: {
        velocityType: 'Global Wind',
        position: 'bottomleft',
        emptyString: 'No wind data',
      },
      data,
      maxVelocity: 25,
    });

    velocityLayer.addTo(this.map);
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }
}
