import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { NotificationService, LookupService } from 'app/services';
import { NgxSpinnerService } from 'ngx-spinner'
import { AppConstant, MessageAlertDataModel } from "../../../app.constants";
import { Notification } from 'app/services/notification/notification.service';
import { MessageDialogComponent } from '../../../components/common/message-dialog/message-dialog.component';
import { MatDialog } from '@angular/material';
export interface StatusList {
  id: boolean;
  status: string;
}
@Component({
  selector: 'app-sensor-add',
  templateUrl: './sensor-add.component.html',
  styleUrls: ['./sensor-add.component.css']
})
export class SensorAddComponent implements OnInit {
  @ViewChild('myFile', { static: false }) myFile: ElementRef;
  validstatus = false;
  MessageAlertDataModel: MessageAlertDataModel;
  unique = false;
  currentUser: any;
  fileUrl: any;
  fileName = '';
  fileToUpload: any = null;
  status;
  moduleName = "Add Sensor";
  parentDeviceObject: any = {};
  deviceObject = {};
  deviceGuid = '';
  parentDeviceGuid = '';
  isEdit = false;
  sensorForm: FormGroup;
  checkSubmitStatus = false;
  templateList = [];
  tagList = [];
  zoneList = [];
  facilityList = [];
  statusList: StatusList[] = [
    {
      id: true,
      status: 'Active'
    },
    {
      id: false,
      status: 'In-active'
    }

  ];
  sensorObject: any = {};

  sensorGuid: any;
  constructor(
    private router: Router,
    private _notificationService: NotificationService,
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    //private deviceService: DeviceService,
    private lookupService: LookupService,
    public _appConstant: AppConstant,
    public dialog: MatDialog,
  ) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.activatedRoute.params.subscribe(params => {
      // set data for parent device
      if (params.sensorGuid != null) {
        //this.getgenraterDetail(params.generatorGuid);
        this.sensorGuid = params.sensorGuid;
        this.moduleName = "Edit Sensor";
        this.isEdit = true;
      } else {
        this.sensorObject = { sensorGuid: '', entityGuid: '', name: '', templateGuid: '', uniqueId: '', kitcode: '' }
      }
    });
  }

  // before view init
  ngOnInit() {
    this.createFormGroup();
    this.getFacilityLookup();
  }



  createFormGroup() {
    this.sensorForm = new FormGroup({
      imageFile: new FormControl(''),
      guid: new FormControl(''),
      companyGuid: new FormControl(null),
      name: new FormControl('', [Validators.required]),
      sensorGuid: new FormControl('', [Validators.required]),
      entityGuid: new FormControl('', [Validators.required]),
      uniqueId: new FormControl('', [Validators.required, Validators.pattern('^[A-Za-z0-9]+$')]),
      tag: new FormControl(''),
      note: new FormControl(''),
      kitcode: new FormControl('', [Validators.required, Validators.pattern('^[A-Za-z0-9 ]+$')]),
      isProvisioned: new FormControl(false),
      isActive: new FormControl(true),
      specification: new FormControl(''),
      description: new FormControl('')
    });
  }

  getFacilityLookup() {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.lookupService.getsensor(currentUser.userDetail.companyId).
      subscribe(response => {
        if (response.isSuccess === true) {
          this.facilityList = response.data;
          this.facilityList = this.facilityList.filter(word => word.isActive == true);
        } else {
          this._notificationService.add(new Notification('error', response.message));
        }
      }, error => {
        this.spinner.hide();
        this._notificationService.add(new Notification('error', error));
      })

  }
	/**
	 * Add device under gateway
	 * only gateway supported device
	 */

  addSensor() {
    this.checkSubmitStatus = true;
    this.sensorForm.get('guid').setValue(null);
    if (this.sensorForm.status === "VALID") {
      if (this.validstatus == true || !this.sensorForm.value.imageFile) {
        this.lookupService.checkkitCode(this.sensorForm.value.kitcode).subscribe(response => {
          this.spinner.hide();
          if (this.fileToUpload) {
            this.sensorForm.get('imageFile').setValue(this.fileToUpload);
          }
          if (response.isSuccess === true) {
            if (this.isEdit) {
              this.sensorForm.registerControl("guid", new FormControl(''));
              this.sensorForm.patchValue({ "guid": this.sensorGuid });
            }
            this.spinner.show();
            let currentUser = JSON.parse(localStorage.getItem('currentUser'));
            //this.sensorForm.get('parentGensetGuid').setValue(currentUser.userDetail.entityGuid);
            this.sensorForm.get('companyGuid').setValue(currentUser.userDetail.companyId);
            this.lookupService.addUpdateSensor(this.sensorForm.value).subscribe(response => {
              if (response.isSuccess === true) {
                this.spinner.hide();
                if (response.data.updatedBy != null) {
                  this._notificationService.add(new Notification('success', "Sensor has been updated successfully."));
                } else {
                  this._notificationService.add(new Notification('success', "Sensor has been added successfully."));
                }
                this.router.navigate(['sensors']);
              } else {
                this.spinner.hide();
                this._notificationService.add(new Notification('error', response.message));
              }
            })
          }
          else {
            this._notificationService.add(new Notification('error', 'Kit not found'));
          }
        }, error => {
          this.spinner.hide();
          this._notificationService.add(new Notification('error', error));
        });
      } else {
        this.imageRemove();
        this.MessageAlertDataModel = {
          title: "Sensor Image",
          message: "Invalid Image Type.",
          message2: "Upload .jpg, .jpeg, .png Image Only.",
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
  }

  getdata(val) {
    if (val) {
      return val = val.toLowerCase();
    }
  }

  getZone(parentEntityId) {
    this.lookupService.getZonelookup(parentEntityId).
      subscribe(response => {
        if (response.isSuccess === true) {
          this.zoneList = response.data;
        } else {
          this._notificationService.add(new Notification('error', response.message));
        }
      }, error => {
        this.spinner.hide();
        this._notificationService.add(new Notification('error', error));
      })
  }

  handleImageInput(event) {
    let files = event.target.files;
    if (files.length) {
      let fileType = files.item(0).name.split('.');
      let imagesTypes = ['jpeg', 'JPEG', 'jpg', 'JPG', 'png', 'PNG'];
      if (imagesTypes.indexOf(fileType[fileType.length - 1]) !== -1) {
        this.validstatus = true;
        this.fileName = files.item(0).name;
        this.fileToUpload = files.item(0);
      } else {
        this.imageRemove();
        this.MessageAlertDataModel = {
          title: "Sensor Image",
          message: "Invalid Image Type.",
          message2: "Upload .jpg, .jpeg, .png Image Only.",
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
      }
    }
  }

  /**
  * Remove image
  * */
  imageRemove() {
    this.myFile.nativeElement.value = "";
    this.fileUrl = null;
    this.sensorForm.get('imageFile').setValue('');
    this.fileToUpload = false;
    this.fileName = '';
  }
}
