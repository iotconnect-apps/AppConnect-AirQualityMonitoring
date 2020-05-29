import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { MatDialog } from "@angular/material";
import { DeleteDialogComponent } from "../../../components/common/delete-dialog/delete-dialog.component";
import { AppConstant, DeleteAlertDataModel } from "../../../app.constants";

import { FacilityService } from "../../../services/facility/facility.service";
import { Notification, NotificationService } from "../../../services";
@Component({
  selector: 'app-facility-list',
  templateUrl: './facility-list.component.html',
  styleUrls: ['./facility-list.component.css']
})
export class FacilityListComponent implements OnInit {

  changeStatusDeviceName: any;
  changeStatusDeviceStatus: any;
  changeDeviceStatus: any;
  facilityList = [];
  moduleName = "Facilities";
  order = true;
  isSearch = false;
  totalRecords = 5;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  reverse = false;
  orderBy = "name";
  searchParameters = {
    parentEntityGuid: '',
    pageNumber: -1,
    pageSize: -1,
    searchText: "",
    sortBy: "name asc"
  };
  deleteAlertDataModel: DeleteAlertDataModel;
  displayedColumns: string[] = ["name", "address", "city", "zipcode", "description", "isActive", "action"];
  mediaUrl: any;

  constructor(
    private spinner: NgxSpinnerService,
    private router: Router,
    public dialog: MatDialog,
    public _service: FacilityService,
    public _appConstant: AppConstant,
    private _notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.mediaUrl = this._notificationService.apiBaseUrl;
    this.getfacilityList();
  }

  clickAdd() {
    this.router.navigate(["/facility/add"]);
  }

  setOrder(sort: any) {
    console.log(sort);
    if (!sort.active || sort.direction === '') {
      return;
    }
    this.searchParameters.sortBy = sort.active + ' ' + sort.direction;
    this.getfacilityList();
  }

  deleteModel(userModel: any) {
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
        this.deletefacility(userModel.guid);
      }
    });
  }

  onPageSizeChangeCallback(pageSize) {
    this.searchParameters.pageSize = pageSize;
    this.searchParameters.pageNumber = 1;
    this.isSearch = true;
    this.getfacilityList();
  }

  activeInactivefacility(id: string, isActive: boolean, name: string) {
    var status = isActive == false ? this._appConstant.activeStatus : this._appConstant.inactiveStatus;
    var mapObj = {
      statusname: status,
      fieldname: name,
      modulename: "Facility"
    };
    this.deleteAlertDataModel = {
      title: "Status",
      message: this._appConstant.msgStatusConfirm.replace(/statusname|fieldname/gi, function (matched) {
        return mapObj[matched];
      }),
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
        this.changeFacilityStatus(id, isActive);

      }
    });

  }

  ChangePaginationAsPageChange(pagechangeresponse) {
    this.searchParameters.pageNumber = pagechangeresponse.pageIndex;
    this.searchParameters.pageSize = pagechangeresponse.pageSize;
    this.isSearch = true;
    this.getfacilityList();
  }

  searchTextCallback(filterText) {
    this.searchParameters.searchText = filterText;
    this.searchParameters.pageNumber = 0;
    this.getfacilityList();
    this.isSearch = true;
  }

  getfacilityList() {
    this.spinner.show();
    this._service.getFacility(this.searchParameters).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this.totalRecords = response.data.count;
        // this.isSearch = false;
        this.facilityList = response.data.items;
      }
      else {
        this._notificationService.add(new Notification('error', response.message));
        this.facilityList = [];
      }
    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }

  deletefacility(guid) {
    this.spinner.show();
    this._service.deleteFacility(guid).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this._notificationService.add(new Notification('success', this._appConstant.msgDeleted.replace("modulename", "Facility")));
        this.getfacilityList();

      }
      else {
        this._notificationService.add(new Notification('error', response.message));
      }

    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }

  changeFacilityStatus(id, isActive) {

    this.spinner.show();
    this._service.changeStatus(id, isActive).subscribe(response => {
      this.spinner.hide();
      if (response.isSuccess === true) {
        this._notificationService.add(new Notification('success', this._appConstant.msgStatusChange.replace("modulename", "Facility")));
        this.getfacilityList();

      }
      else {
        this._notificationService.add(new Notification('error', response.message));
      }

    }, error => {
      this.spinner.hide();
      this._notificationService.add(new Notification('error', error));
    });
  }
}
