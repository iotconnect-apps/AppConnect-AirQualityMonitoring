import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';
//import * as Highcharts from 'highcharts';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { FacilityService, DashboardService, Notification, NotificationService, LookupService, DeviceService, AlertsService } from '../../../services';
import { MatDialog } from '@angular/material';
import { AppConstant, DeleteAlertDataModel, MessageAlertDataModel } from '../../../app.constants';

import { DeleteDialogComponent, MessageDialogComponent } from '../..';
import 'chartjs-plugin-streaming';
import { StompRService } from '@stomp/ng2-stompjs'
import { Message } from '@stomp/stompjs'
import { Subscription } from 'rxjs'
import { Observable, forkJoin } from 'rxjs';
import * as moment from 'moment-timezone'
import * as _ from 'lodash'
@Component({
  selector: 'app-facility-dashboard',
  templateUrl: './facility-dashboard.component.html',
  styleUrls: ['./facility-dashboard.component.css'],
  providers: [StompRService]
})
export class FacilityDashboardComponent implements OnInit {
  @ViewChild('myFile', { static: false }) myFile: ElementRef;
  subscription: Subscription;
  messages: Observable<Message>;
  cpId = '';
  subscribed;
  stompConfiguration = {
    url: '',
    headers: {
      login: '',
      passcode: '',
      host: ''
    },
    heartbeat_in: 0,
    heartbeat_out: 2000,
    reconnect_delay: 5000,
    debug: true
  }
  chartColors: any = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)',
    cerise: 'rgb(255,0,255)',
    popati: 'rgb(0,255,0)',
    dark: 'rgb(5, 86, 98)',
    solid: 'rgb(98, 86, 98)'
  };
  datasets: any[] = [
    {
      label: 'Dataset 1 (linear interpolation)',
      backgroundColor: 'rgb(153, 102, 255)',
      borderColor: 'rgb(153, 102, 255)',
      fill: false,
      lineTension: 0,
      borderDash: [8, 4],
      data: []
    }
  ];

  options: any = {
    type: 'line',
    scales: {

      xAxes: [{
        type: 'realtime',
        time: {
          stepSize: 10
        },
        realtime: {
          duration: 90000,
          refresh: 1000,
          delay: 2000,
          //onRefresh: '',

          // delay: 2000

        }

      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'value'
        }
      }]

    },
    tooltips: {
      mode: 'nearest',
      intersect: false
    },
    hover: {
      mode: 'nearest',
      intersect: false
    }

  };
  devicenames: any;
  fileName: any;
  fileToUpload: any;
  fileUrl: any;
  dataobj = {};
  zoneObject = {};
  facilityObj: any = {};
  handleImgInput = false;
  colors = ['bggreenlwidget',
    'bgbluewidget',
    'bgyellowwidget',
    'bgpinkwidget',
    'bgorangewidget',
    'bgwarningwidget',
    'bgdarkbluewidget',
    'bgdangerwidget']
  zoneObj: any = {};
  isEdit = false;
  zoneModuleName = "";
  buttonname = "Submit";
  zoneForm: FormGroup;
  facilityGuid: any;
  checkSubmitStatus = false;
  isConnected = false;
  zoneList: any = [];
  sensorList: any = [];
  typeList: any = [];
  facilityList: any = [];
  zoneTypeList: any = [];
  zoneDataList: any = [];
  attrdatadetail: any = [];
  zoneGuid: any;
  mediaUrl = "";
  searchParameters = {
    parentEntityGuid: '',
    pageNumber: 0,
    pageSize: -1,
    searchText: '',
    sortBy: 'name asc'
  };
  deleteAlertDataModel: DeleteAlertDataModel;
  public respondShow: boolean = false;
  devicename: any;
  datazone: any;
  faciltyId: any;
  dataType: any;
  faciltyName: any;
  zoneName: any;
  attname: any;
  public canvasWidth = 250
  public needleValue = 0
  public centralLabel = ''
  public name = 'AQI'
  public bottomLabel = ' '
  public optionsdata = {
    hasNeedle: false,
    needleColor: 'gray',
    needleUpdateSpeed: 1000,
    arcColors: ['', ''],
    arcDelimiters: [50],
    rangeLabel: ['0', '100'],
    needleStartValue: 0,
  }
  pieChartObj = {
    chartType: 'PieChart',
    options: {
      title: 'Alerts',
      width: 110,
      height: 110,
      pieHole: 0.65,
      pieSliceText: 'value',
      legend: 'none',
      chartArea: { width: '90%', height: '90%' },
      tooltip: { text: 'value', trigger: 'selection' },
      backgroundColor: { fill: 'transparent' },
      slices: {
        0: { color: '#f25450' },
        1: { color: '#000000' },
        2: { color: '#039be5' }
      },
    },
    dataTable: [
      ['Alerts', 'Count'],
      ['', 20],
      ['', 80]
    ],
    total: 0
  }
  columnChart2 = {
    chartType: "ColumnChart",
    dataTable: [],
    options: {
      title: "",
      vAxis: {
        title: "",
        titleTextStyle: {
          bold: true
        },
        viewWindow: {
          min: 0
        }
      },
      hAxis: {
        title: "",
        titleTextStyle: {
          bold: true
        },
      },
      legend: { position: "none", alignment: "start" },
      bar: { groupWidth: "25%" },
      colors: ['#5496d0'],
      height: "400",
      series: [

      ]
    }
  };
  sensid: any;
  zoneId: any;
  sensorNamedata: any;
  textlabel: any;
  ishow: boolean;
  @ViewChild('imageupload', null) imageUpload: ElementRef;
  MessageAlertDataModel: MessageAlertDataModel;
  selectedZoneType: any;
  Respond() {
    this.getZoneTypeList();
    this.currentImage = '';
    this.respondShow = !this.respondShow;
    this.fileToUpload = null;
    this.checkSubmitStatus = false;
    this.zoneForm.reset();
    this.zoneObj = {};
    this.fileName = '';
    this.refresh();
  }
  alerts = [];
  lastSyncDate = '';
  closerepond() {
    this.currentImage = '';
    this.checkSubmitStatus = false;
    this.respondShow = false;
    this.isEdit = false;
    this.fileToUpload = null;
    this.zoneForm.reset();
    this.zoneObj.image = '';
    this.fileName = '';
  }
  deviceIsConnected = false;
  constructor(
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    public _service: FacilityService,
    public dialog: MatDialog,
    public _appConstant: AppConstant,
    public dashboardService: DashboardService,
    private _notificationService: NotificationService,
    private lookupService: LookupService,
    private deviceService: DeviceService,
    private stompService: StompRService,
    public alertsService: AlertsService

  ) {
    this.createFormGroup();
    this.dataobj = { guid: '', zoneguid: '' }
    this.activatedRoute.params.subscribe(params => {
      if (params.facilityGuid) {
        this.facilityGuid = params.facilityGuid
        this.faciltyId = params.facilityGuid
      }

    })
  }

  ngOnInit() {
    this.ishow = false;
    //this.initChart();
    this.getFacilityDetails(this.facilityGuid)
    this.getZoneList(this.facilityGuid)
    this.mediaUrl = this._notificationService.apiBaseUrl;
    this.getFacilityLookup();
    this.getZoneTypeLookup();
    this.getgenraterTelemetryData();
    this.getStompConfig();
  }

  imageRemove() {
    this.myFile.nativeElement.value = "";
    if (this.zoneObj['image'] == this.currentImage) {
      this.zoneForm.get('imageFile').setValue('');
      if (!this.handleImgInput) {
        this.handleImgInput = false;
        this.deleteImgModel();
      }
      else {
        this.handleImgInput = false;
      }
    }
    else {
      if (this.currentImage) {
        this.spinner.hide();
        this.zoneObj['image'] = this.currentImage;
        this.fileToUpload = false;
        this.fileName = '';
      }
      else {
        this.spinner.hide();
        this.zoneObj['image'] = null;
        this.zoneForm.get('imageFile').setValue('');
        this.fileToUpload = false;
        this.fileName = '';
      }
    }
  }
  currentImage: any;

  deletezoneImg() {
    this.spinner.show();
    this.alertsService.removeImage(this.zoneObj.guid).subscribe(response => {
      this.spinner.hide();
      this.spinner.hide();
      if (response.isSuccess === true) {
        this.zoneObj['image'] = null;
        this.zoneForm.get('imageFile').setValue(null);
        this.fileToUpload = false;
        this.currentImage = '';
        this.fileName = '';
        this.getZoneList(this.facilityGuid);
        this._notificationService.add(new Notification('success', this._appConstant.msgDeleted.replace("modulename", "Zone Image")));
      } else {
        this._notificationService.add(new Notification('error', response.message));
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }

  deleteImgModel() {
    this.deleteAlertDataModel = {
      title: "Delete Image",
      message: this._appConstant.msgConfirm.replace('modulename', "Zone Image"),
      okButtonName: "Confirm",
      cancelButtonName: "Cancel",
    };
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '400px',
      height: 'auto',
      data: this.deleteAlertDataModel,
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deletezoneImg();
      }
    });
  }

  getAlertList(deviceGuid) {
    this.alerts = [];
    let parameters = {
      pageNo: 0,
      pageSize: 10,
      searchText: '',
      orderBy: 'eventDate desc',
      deviceGuid: deviceGuid,
      entityGuid: this.zoneId,
    };
    this.spinner.show();
    this.alertsService.getAlerts(parameters).subscribe(response => {
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

  createFormGroup() {
    this.zoneForm = new FormGroup({
      parentEntityGuid: new FormControl(null),
      name: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      type: new FormControl('', [Validators.required]),
      isactive: new FormControl(''),
      imageFile: new FormControl(''),
    });
  }

  highcharts;

  chartOptions = {};

  getFacilityDetails(facilityGuid) {
    this.spinner.show();
    this._service.getFacilityDetails(facilityGuid).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this.facilityObj = response.data;
        let facility = response.data.guid.toUpperCase();
        response.data.guid = facility;
        //this.getZone(response.data.guid)
        this.faciltyName = response.data.name;
        this.faciltyId = response.data.guid;
        //this.dataType = response.data.type;
        //this.getTypedata(this.dataType)
        this.dataobj = response.data;
      }
      else {
        if (response.message) {
          this._notificationService.add(new Notification('error', response.message));
        }
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }

  getZoneList(facilityGuid) {
    this.spinner.show();
    this.searchParameters['parentEntityGuid'] = facilityGuid;
    this._service.getFacility(this.searchParameters).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this.zoneList = response.data.items;
      }
      else {
        if (response.message) {
          this._notificationService.add(new Notification('error', response.message));
        }
        this.zoneList = [];
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }

  refresh() {
    this.createFormGroup();
    this.zoneForm.reset(this.zoneForm.value);
    this.zoneModuleName = "Add Zone";
    this.zoneId = null;
    this.buttonname = 'Add';
    this.respondShow = true;
    this.isEdit = false;
  }

  getZoneDetails(zoneGuid) {
    this.zoneModuleName = "Edit Zone";
    this.fileName = '';
    this.currentImage = '';
    this.fileToUpload = false;
    this.zoneObj.image = '';
    this.zoneGuid = zoneGuid;
    this.isEdit = true;
    this.buttonname = 'Update';
    this.respondShow = true;
    this.spinner.show();
    this._service.getFacilityDetails(zoneGuid).subscribe(response => {
      this.spinner.hide();
      this.facilityObj = response.data;
      if (response.isSuccess === true) {
        this.getZoneTypeList();
        this.zoneObj = response.data;
        if (this.zoneObj.image) {
          this.zoneObj.image = this.mediaUrl + this.zoneObj.image;
          this.currentImage = this.zoneObj.image;
        }
      }
      else {
        if (response.message) {
          this._notificationService.add(new Notification('error', response.message));
        }
        this.zoneList = [];
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }

  manageZone() {
    this.checkSubmitStatus = true;
    var data = {
      "parentEntityGuid": this.facilityGuid,
      "name": this.zoneForm.value.name,
      "description": this.zoneForm.value.description,
      "isactive": true,
      "countryGuid": this.facilityObj['countryGuid'],
      "stateGuid": this.facilityObj['stateGuid'],
      "city": this.facilityObj['city'],
      "zipcode": this.facilityObj['zipcode'],
      "address": this.facilityObj['address'],
      "latitude": this.facilityObj['latitude'],
      "longitude": this.facilityObj['longitude'],
      "type": this.zoneForm.value.type,
    }
    if (this.isEdit) {
      if (this.zoneGuid) {
        data["guid"] = this.zoneGuid;
      }
      if (this.fileToUpload) {
        data["imageFile"] = this.fileToUpload;
      }
      data.isactive = this.zoneObject['isactive']
    }
    else {
      data["imageFile"] = this.fileToUpload;

      this.zoneForm.get('isactive').setValue(true);

    }
    if (this.zoneForm.status === "VALID") {

      this.spinner.show();
      this._service.addFacility(data).subscribe(response => {
        this.spinner.hide();
        this.getZoneList(this.facilityGuid);
        this.selectedZoneType = '';
        this.datazone = '';
        this.devicenames = '';
        this.sensorList = [];
        this.zoneDataList = [];
        this.ishow = false;
        if (response.isSuccess === true) {
          this.respondShow = false;

          this.getZoneTypeLookup();
          if (this.isEdit) {
            //this.isEdit = false;
            this._notificationService.add(new Notification('success', "Zone has been updated successfully."));
            this.closerepond();
          } else {
            this._notificationService.add(new Notification('success', "Zone has been added successfully."));
            this.closerepond();
          }
          //this.getTypedata(this.selectedZoneType);
        } else {
          if (response.message) {
            this._notificationService.add(new Notification('error', response.message));
          }
        }
      })
    }
  }

  getZoneTypeList() {
    this.spinner.show();
    this._service.getZoneTypelist().subscribe(response => {
      this.spinner.hide();
      this.typeList = response.data;
    });
  }

  handleImageInput(event) {
    this.handleImgInput = true;
    let files = event.target.files;
    var that = this;
    if (files.length) {
      let fileType = files.item(0).name.split('.');
      let imagesTypes = ['jpeg', 'JPEG', 'jpg', 'JPG', 'png', 'PNG'];
      if (imagesTypes.indexOf(fileType[fileType.length - 1]) !== -1) {
        this.fileName = files.item(0).name;
        this.fileToUpload = files.item(0);
      } else {
        this.imageRemove();
        this.MessageAlertDataModel = {
          title: "Zone Image",
          message: "Invalid Image Type.",
          message2: "Upload .jpg, .jpeg, .png Image Only.",
          okButtonName: "OK",
        };
        const dialogRef = this.dialog.open(MessageDialogComponent, {
          width: '400px',
          height: 'auto',
          data: this.MessageAlertDataModel,
          disableClose: false
        });

      }
    }

    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (innerEvent: any) => {
        this.fileUrl = innerEvent.target.result;
        that.zoneObj.image = this.fileUrl;
      }
    }
  }

  deleteModel(userModel: any) {
    this.deleteAlertDataModel = {
      title: "Delete Zone",
      message: this._appConstant.msgConfirm.replace('modulename', "Zone"),
      okButtonName: "Confirm",
      cancelButtonName: "Cancel",
    };
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '400px',
      height: 'auto',
      data: this.deleteAlertDataModel,
      disableClose: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deletefacility(userModel.guid);
      }
    });
  }

  deletefacility(guid) {
    this.spinner.show();
    this._service.deleteFacility(guid).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this._notificationService.add(new Notification('success', this._appConstant.msgDeleted.replace("modulename", "Zone")));
        this.selectedZoneType = '';
        this.datazone = '';
        this.devicenames = '';
        this.sensorList = [];
        this.zoneDataList = [];
        this.ishow = false;
        this.getZoneList(this.facilityGuid);

      }
      else {
        if (response.message) {
          this._notificationService.add(new Notification('error', response.message));
        }
      }

    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }
  getFacilityLookup() {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.lookupService.getsensor(currentUser.userDetail.companyId).
      subscribe(response => {
        if (response.isSuccess === true) {
          this.facilityList = response.data;
        } else {
          if (response.message) {

            this._notificationService.add(new Notification('error', response.message));
          }
        }
      }, error => {
        this.spinner.hide();
        this._notificationService.add(new Notification('error', error));
      })

  }
  getZoneTypeLookup() {
    this.lookupService.getzonetype().
      subscribe(response => {
        if (response.isSuccess === true && response.data != '' && response.data != undefined) {
          this.zoneTypeList = response['data'];
          //this.dataType = response.data[0].value;
          //this.getTypedata(response.data[0].value)
        } else {
          if (response.message) {
            this._notificationService.add(new Notification('error', response.message));
          }
        }
      }, error => {
        this.spinner.hide();
        this._notificationService.add(new Notification('error', error));
      })

  }
  getZone(parentEntityId) {
    this.ishow = false;
    this.zoneDataList = [];
    this.sensorList = [];
    this.zoneName = '';
    this.faciltyId = parentEntityId;
    let obj = this.facilityList.find(o => o.value === this.faciltyId);
    if (obj && obj.text) {
      this.faciltyName = obj.text;
      this.getZoneTypeLookup();
    }
  }
  getDeviceName(zoneId) {
    this.devicenames = '';
    this.ishow = false;
    this.sensorList = [];
    this.zoneId = zoneId;
    let obj = this.zoneDataList.find(o => o.value === zoneId);
    this.zoneName = obj.text;
    this.lookupService.getDeviceName(zoneId).
      subscribe(response => {
        if (response.isSuccess === true && response.data != '' && response.data != null) {
          this.sensorList = response.data
          this.sensorList = this.sensorList.filter(word => word.isActive == true);
          this.devicename = response.data[0].value;
          this.getAlertList(this.devicename)
          this.getAQI(this.devicename)
          this.getgenraterTelemetryData();
          this.getSensorLatestData(this.devicename)
          this.sensorNamedata = response.data[0].text;

        } else {
          this.ishow = false;
          this.sensorList = []
        }
      }, error => {
        this.spinner.hide();
        this._notificationService.add(new Notification('error', error));
      })
  }
  getDeviceStatus(uniqueId) {
    this.spinner.show();
    this._service.getDeviceStatus(uniqueId).subscribe(response => {
      if (response.isSuccess === true) {
        this.deviceIsConnected = response.data.isConnected;
        this.spinner.hide();
      } else {
        this._notificationService.add(new Notification('error', response.message));
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }

  getSensorName(SensorId) {
    this.sensid = SensorId;
    this.ishow = true;
    this.getAlertList(SensorId)
    this.getSensorLatestData(SensorId);
    this.getAQI(SensorId)
    let obj = this.sensorList.find(o => o.value === SensorId);
    let sensorName = obj.text;
    this.getDeviceStatus(obj.text)
    this.sensorNamedata = obj.text;
    if (sensorName) {
      this.getgenraterTelemetryData();
      if (this.subscribed) {
        this.subscription.unsubscribe();
        }
      this.messages = this.stompService.subscribe('/topic/' + this.cpId + '-' + this.sensorNamedata);
      this.subscription = this.messages.subscribe(this.on_next);
      this.subscribed = true;
    }
  }
  // For get TelemetryData
  getgenraterTelemetryData() {
    this.spinner.show();
    this._service.getsensorTelemetryData().subscribe(response => {
      if (response.isSuccess === true) {
        this.spinner.hide();
        let temp = [];
        this.attname = response.data;
        let type = 'd';
        this.getStaticsGraph(type, this.attname[0].text);
        response.data.forEach((element, i) => {
          var colorNames = Object.keys(this.chartColors);
          var colorName = colorNames[i % colorNames.length];
          var newColor = this.chartColors[colorName];
          var graphLabel = {
            label: element.text,
            backgroundColor: 'rgb(153, 102, 255)',
            borderColor: newColor,
            fill: false,
            cubicInterpolationMode: 'monotone',
            data: []
          }
          temp.push(graphLabel);
        });
        // response.data.forEach(element, i) => {

        // });
        this.datasets = temp;
      } else {
        if (response.message) {

          this._notificationService.add(new Notification('error', response.message));
        }
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }
  getStompConfig() {

    this.deviceService.getStompConfig('LiveData').subscribe(response => {
      if (response.isSuccess) {
        this.stompConfiguration.url = response.data.url;
        this.stompConfiguration.headers.login = response.data.user;
        this.stompConfiguration.headers.passcode = response.data.password;
        this.stompConfiguration.headers.host = response.data.vhost;
        this.cpId = response.data.cpId;
        this.initStomp();
      }
    });
  }
  initStomp() {
    let config = this.stompConfiguration;
    this.stompService.config = config;
    this.stompService.initAndConnect();
    //this.stompSubscribe();
  }
  public stompSubscribe() {
    if (this.subscribed) {
      return;
    }

    this.messages = this.stompService.subscribe('/topic/' + this.cpId + '-' + this.sensorNamedata);
    this.subscription = this.messages.subscribe(this.on_next);
    this.subscribed = true;
  }
  getSensorDetailData(sensId) {
    this._service.getSensorDetails(sensId).subscribe(response => {
      if (response.isSuccess === true) {
        this.attrdatadetail = response.data
      }
    })
  }
  getSensorLatestData(sensId) {
    this.deviceIsConnected = false;
    this._service.getSensorLatestData(sensId).subscribe(response => {
      if (response.isSuccess === true) {
        this.attrdatadetail = response.data
      }
    })
  }
  public on_next = (message: Message) => {
    let headers = message.headers;
    let device = headers.destination.split('/')[headers.destination.split('/').length - 1];
    let deviceId = device.split('-')[device.split('-').length - 1];
    let obj: any = JSON.parse(message.body);
    let reporting_data = obj.data.data.reporting
    this.isConnected = true;

    //this.sensorData = reporting_data;



    let dates = obj.data.data.time;
    let now = moment();
    // if (obj.data.data.status == 'off') {
    //   this.getSensorLatestData(this.sensid)
    // }
    if (obj.data.data.status == undefined && obj.data.msgType == 'telemetry' && obj.data.msgType != 'device' && obj.data.msgType != 'simulator') {
      this.deviceIsConnected = true;
      this.attrdatadetail.forEach(element => {
        element.attributeValue = reporting_data[element.attributeName];
      });

      this.options = {
        type: 'line',
        scales: {

          xAxes: [{
            type: 'realtime',
            time: {
              stepSize: 10
            },
            realtime: {
              duration: 90000,
              refresh: 7000,
              delay: 2000,
              onRefresh: function (chart: any) {
                if (chart.height) {
                  if (obj.data.data.status != 'on') {
                    chart.data.datasets.forEach(function (dataset: any) {
                      dataset.data.push({

                        x: now,

                        y: reporting_data[dataset.label]

                      });

                    });
                  }

                } else {

                }

              },

              // delay: 2000

            }

          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'value'
            }
          }]

        },
        tooltips: {
          mode: 'nearest',
          intersect: false
        },
        hover: {
          mode: 'nearest',
          intersect: false
        }

      }
    } else if (obj.data.msgType == 'simulator' || obj.data.msgType == 'device') {

      if (obj.data.data.status === 'off') {
        this.deviceIsConnected = false;
      } else {
        this.deviceIsConnected = true;
      }
    }
    obj.data.data.time = now;
		/*var colorNames = Object.keys(this.chartColors);
		var colorName = colorNames[this.datasets.length % colorNames.length];
		var newColor = this.chartColors[colorName];
		var test = {
			label: 'Dataset 3 (cubic interpolation)',
			backgroundColor: 'rgb(153, 102, 255)',
			borderColor: newColor,
			fill: false,
			cubicInterpolationMode: 'monotone',
			data: []
		}*/


  }
  getTypedata(type) {
    this.lookupService.getzoneonType(type, this.faciltyId).
      subscribe(response => {
        if (response.isSuccess === true && response.data != '' && response.data != null) {
          this.zoneDataList = response.data;
          this.datazone = response.data[0].value
          this.zoneId = response.data[0].value
          this.getDeviceName(this.datazone)
          //this.zoneName = response.data[0].text
        } else {
          this.ishow = false;
          this.zoneDataList = [];
          this.sensorList = [];
          if (response.message) {

            this._notificationService.add(new Notification('error', response.message));
          }
        }
      }, error => {
        this.spinner.hide();
        this._notificationService.add(new Notification('error', error));
      })
  }
  onTabChange(event) {
    let type = 'd';
    this.textlabel = event.tab.textLabel;
    this.getStaticsGraph(type, event.tab.textLabel);
  }
  changeGraphFilter(event) {
    let type = 'd';
    if (event.value === 'Week') {
      type = 'w';
    } else if (event.value === 'Month') {
      type = 'm';
    }
    if (this.textlabel) {
      var attnamedata = this.textlabel;
    } else {
      var attnamedata = this.attname[0].text
    }
    this.getStaticsGraph(type, attnamedata);


  }

  public isChartLoaded = false;

  getStaticsGraph(type, label) {
    this.isChartLoaded = false;

    this._service.getFacilitygraph(this.zoneId, type, label).subscribe(response => {
      this.spinner.hide();
      let data = [];
      if (response.isSuccess === true) {
        this.lastSyncDate = response.lastSyncDate;
        if (response.data.length) {
          data.push(["Time", ""])
          response.data.forEach(element => {
            data.push([element.name, parseInt(element.value)])
          });
        }
        this.columnChart2 = {
          chartType: "ColumnChart",
          dataTable: data,
          options: {
            title: "",
            vAxis: {
              title: "",
              titleTextStyle: {
                bold: true
              },
              viewWindow: {
                min: 0
              }
            },
            hAxis: {
              title: "",
              titleTextStyle: {
                bold: true
              },
            },
            legend: { position: "none", alignment: "start" },
            bar: { groupWidth: "25%" },
            colors: ['#5496d0'],
            height: "400",
            series: [

            ]
          }
        };

      }
      setTimeout(() => {
        this.isChartLoaded = true;
      }, 200);
    });

  }
  getAQI(deviceGuid) {
    this._service.getwqiindexvalue(deviceGuid).subscribe(response => {
      if (response.isSuccess === true) {
        this.needleValue = response.data
        this.centralLabel = response.data.toString();
        switch (response.data > 0) {
          case (this.needleValue >= 0 && this.needleValue <= 50):
            this.bottomLabel = 'Good';
            this.optionsdata.arcColors = ['#41c363', '#343a40'];
            break;
          case (this.needleValue >= 50 && this.needleValue <= 100):
            this.bottomLabel = 'Moderate';
            this.optionsdata.arcColors = ['#80dceb', '#343a40'];
            break;
          case (this.needleValue >= 100 && this.needleValue <= 150):
            this.bottomLabel = 'Unhealthy for sensitive groups';
            this.optionsdata.arcColors = ['#919191', '#343a40'];
            break;
          case (this.needleValue >= 150 && this.needleValue <= 200):
            this.bottomLabel = 'Unhealthy';
            this.optionsdata.arcColors = ['#ffd100', '#343a40'];
            break;
          case (this.needleValue >= 200 && this.needleValue <= 300):
            this.bottomLabel = 'Very Unhealthy';
            this.optionsdata.arcColors = ['#e77800', '#343a40'];
            break;
          case (this.needleValue > 300):
            this.bottomLabel = 'Hazardous';
            break;
        }
      } else {
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
