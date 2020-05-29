import * as moment from 'moment-timezone'
import { Component, OnInit } from '@angular/core'
import { NgxSpinnerService } from 'ngx-spinner'
import { Router } from '@angular/router'
import { AppConstant, DeleteAlertDataModel } from "../../app.constants";
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material'
import { DeleteDialogComponent } from '../../components/common/delete-dialog/delete-dialog.component';
import { facilityobj } from './dashboard-model';
import { DashboardService, Notification, NotificationService, DeviceService, AlertsService } from '../../services';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})

export class DashboardComponent implements OnInit {
  facilityobj = new facilityobj();
  lat = 32.897480;
  lng = -97.040443;
  mediaUrl = "";
  //lat = '';
  //lng = '';
  facilityList: any = [];
  isShowLeftMenu = true;
  isSearch = false;
  mapview = true;
  totalAlerts: any;
  totalFacilities: any;
  totalZones: any;
  totalIndoorZones: any;
  totalOutdoorZones: any;

  deleteAlertDataModel: DeleteAlertDataModel;
  searchParameters = {
    pageNumber: 0,
    pageNo: 0,
    pageSize: 10,
    searchText: '',
    sortBy: 'uniqueId asc'
  };
  ChartHead = ['Date/Time'];
  chartData = [];
  datadevice: any = [];
  columnArray: any = [];
  headFormate: any = {
    columns: this.columnArray,
    type: 'NumberFormat'
  };
  bgColor = '#fff';
  chartHeight = 320;
  chartWidth = '100%';
  chart = {
    'generaytorBatteryStatus': {
      chartType: 'ColumnChart',
      dataTable: [],
      options: {
        height: this.chartHeight,
        width: this.chartWidth,
        interpolateNulls: true,
        backgroundColor: this.bgColor,
        hAxis: {
          title: 'Date/Time',
          gridlines: {
            count: 5
          },
        },
        vAxis: {
          title: 'Values',
          gridlines: {
            count: 1
          },
        }
      },
      formatters: this.headFormate
    }
  };
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  constructor(
    private router: Router,
    private spinner: NgxSpinnerService,
    private dashboardService: DashboardService,
    private _notificationService: NotificationService,
    public _appConstant: AppConstant,
    public dialog: MatDialog,
    private deviceService: DeviceService,
    public _service: AlertsService

  ) {
    this.mediaUrl = this._notificationService.apiBaseUrl;
  }

  ngOnInit() {
    this.getDashbourdCount();
    this.getFacilityList();
    this.getAlertList();
    // this.getGeneraytorBatteryStatusChartData();

  }

  getAlertList() {
    let parameters = {
      pageNo: 0,
      pageSize: 8,
      searchText: '',
      orderBy: 'eventDate desc',
      deviceGuid: '',
      entityGuid: '',
    };
    this.spinner.show();
    this._service.getAlerts(parameters).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        if (response.data.count) {
          this.alerts = response.data.items;
        }

      }
      else {
        this.alerts = [];
        this._notificationService.add(new Notification('error', response.message));

      }
    }, error => {
      this.alerts = [];

      this._notificationService.add(new Notification('error', error));
    });
  }

  getGeneraytorBatteryStatusChartData() {
    let obj = { companyGuid: this.currentUser.userDetail.companyId };
    let data = [
      ['generator', 'Bettery Status']
    ]
    this.deviceService.getGeneraytorBatteryStatusChartData(obj).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        response.data.forEach(element => {
          data.push([element.name, parseInt(element['value'])]);
        });
        this.createHistoryChart('generaytorBatteryStatus', data, 'Generator', '% Percentage');
      }
      else {
        this._notificationService.add(new Notification('error', response.message));
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });


  }
  createHistoryChart(key, data, hAxisTitle, vAxisTitle) {
    let height = this.chartHeight;
    this.chart[key] = {
      chartType: 'ColumnChart',
      dataTable: data,
      options: {
        height: height,
        width: this.chartWidth,
        interpolateNulls: true,
        backgroundColor: this.bgColor,
        hAxis: {
          title: hAxisTitle,
          gridlines: {
            count: 5
          },
        },
        vAxis: {
          title: vAxisTitle,
          gridlines: {
            count: 1
          },
        }
      },
      formatters: this.headFormate
    };
  }

  clickAdd() {
    this.router.navigate(['facility/add']);
  }
  clickDetail(id) {
    this.router.navigate(['facility-detail', id]);
  }
  convertToFloat(value) {
    return parseFloat(value)
  }

	/**
	 * Get count of variables for Dashboard
	 * */
  getDashbourdCount() {
    this.spinner.show();
    this.dashboardService.getDashboardoverview().subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this.totalAlerts = response.data.totalAlerts;
        this.totalFacilities = response.data.totalEntities;
        this.totalZones = response.data.totalSubEntities;
        this.totalIndoorZones = response.data.totalIndoorZones;
        this.totalOutdoorZones = response.data.totalOutdoorZones;
      }
      else {
        this._notificationService.add(new Notification('error', response.message));
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }

	/**
	 * Get Alerts for Dashboard
	 * */
  public alerts: any = [];


  search(filterText) {
    this.searchParameters.searchText = filterText;
    this.searchParameters.pageNo = 0;
    this.getFacilityList();
  }
  getFacilityList() {
    this.facilityList = [];
    this.spinner.show();
    this.dashboardService.getFacilitylist(this.searchParameters).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        //this.lat = response.data.items[0].latitude;
        // this.lng = response.data.items[0].longitude;
        this.facilityList = response.data.items

      }
      else {
        // response.message ? response.message : response.message = "No results found";
        this._notificationService.add(new Notification('error', response.message));
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }
  deleteModel(id: any) {
    this.deleteAlertDataModel = {
      title: "Delete Facility",
      message: this._appConstant.msgConfirm.replace('modulename', "Facility"),
      okButtonName: "Yes",
      cancelButtonName: "No",
    };
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '400px',
      height: 'auto',
      data: this.deleteAlertDataModel,
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deletefacility(id);
      }
    });
  }



  searchTextCallback(filterText) {
    this.searchParameters.searchText = filterText;
    this.searchParameters.pageNumber = 0;
    this.getFacilityList();
    this.isSearch = true;
  }

  deletefacility(guid) {
    this.spinner.show();
    this.dashboardService.deleteFacility(guid).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this._notificationService.add(new Notification('success', this._appConstant.msgDeleted.replace("modulename", "Facility")));
        this.getFacilityList();

      }
      else {
        this._notificationService.add(new Notification('error', response.message));
      }

    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }

  getLocalDate(lDate) {
    var utcDate = moment.utc(lDate, 'YYYY-MM-DDTHH:mm:ss.SSS');
    // Get the local version of that date
    var localDate = moment(utcDate).local();
    let res = moment(localDate).format('MMM DD, YYYY hh:mm:ss A');
    return res;

  }

}
