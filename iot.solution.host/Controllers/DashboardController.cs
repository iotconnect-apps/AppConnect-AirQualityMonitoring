using host.iot.solution.Filter;
using iot.solution.entity.Structs.Routes;
using iot.solution.service.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Net;
using Entity = iot.solution.entity;
using Response = iot.solution.entity.Response;

namespace host.iot.solution.Controllers
{
    [Route(DashboardRoute.Route.Global)]
    [ApiController]
    public class DashboardController : BaseController
    {
        private readonly IDashboardService _service;
        private readonly IEntityService _locationService;
        private readonly IDeviceService _deviceService;

        public DashboardController(IDashboardService dashboardService, IEntityService locationService, IDeviceService deviceService)
        {
            _service = dashboardService;
            _locationService = locationService;
            _deviceService = deviceService;
        }

        [HttpGet]
        [Route(DashboardRoute.Route.GetEntity, Name = DashboardRoute.Name.GetEntity)]
        [EnsureGuidParameterAttribute("companyId", "Company")]
        public Entity.BaseResponse<List<Entity.LookupItem>> GetEntities(string companyId)
        {
            Entity.BaseResponse<List<Entity.LookupItem>> response = new Entity.BaseResponse<List<Entity.LookupItem>>(true);
            try
            {
                response.Data = _service.GetEntityLookup(Guid.Parse(companyId));
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<List<Entity.LookupItem>>(false, ex.Message);
            }
            return response;
        }

        [HttpGet]
        [Route(DashboardRoute.Route.GetOverview, Name = DashboardRoute.Name.GetOverview)]
        [EnsureGuidParameterAttribute("companyId", "Company")]
        public Entity.BaseResponse<Entity.DashboardOverviewResponse> GetOverview(string companyId)
        {
            Entity.BaseResponse<Entity.DashboardOverviewResponse> response = new Entity.BaseResponse<Entity.DashboardOverviewResponse>(true);
            try
            {
                response = _service.GetOverview();
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<Entity.DashboardOverviewResponse>(false, ex.Message);
            }
            return response;
        }

        [HttpGet]
        [Route(DashboardRoute.Route.GetEntityDetail, Name = DashboardRoute.Name.GetEntityDetail)]
        [EnsureGuidParameterAttribute("facilityId", "Facility")]
        public Entity.BaseResponse<Response.EntityDetailResponse> GetEntityDetail(string facilityId)
        {
            if (facilityId == null || facilityId == string.Empty)
            {
                return new Entity.BaseResponse<Response.EntityDetailResponse>(false, "Invalid Request");
            }

            Entity.BaseResponse<Response.EntityDetailResponse> response = new Entity.BaseResponse<Response.EntityDetailResponse>(true);
            try
            {
                response.Data = _locationService.GetEntityDetail(Guid.Parse(facilityId));
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<Response.EntityDetailResponse>(false, ex.Message);
            }
            return response;
        }

        [HttpGet]
        [Route(DashboardRoute.Route.GetEntityDevices, Name = DashboardRoute.Name.GetEntityDevices)]
        [EnsureGuidParameterAttribute("facilityId", "Facility")]
        public Entity.BaseResponse<List<Response.EntityWiseDeviceResponse>> GetEntityDevices(string facilityId)
        {
            if (facilityId == null || facilityId == string.Empty)
            {
                return new Entity.BaseResponse<List<Response.EntityWiseDeviceResponse>>(false, "Invalid Request");
            }

            Entity.BaseResponse<List<Response.EntityWiseDeviceResponse>> response = new Entity.BaseResponse<List<Response.EntityWiseDeviceResponse>>(true);
            try
            {
                response.Data = _deviceService.GetEntityWiseDevices(Guid.Parse(facilityId));
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<List<Response.EntityWiseDeviceResponse>>(false, ex.Message);
            }
            return response;
        }

        [HttpGet]
        [Route(DashboardRoute.Route.GetEntityChildDevices, Name = DashboardRoute.Name.GetEntityChildDevices)]
        [EnsureGuidParameterAttribute("deviceId", "Device")]
        public Entity.BaseResponse<List<Response.EntityWiseDeviceResponse>> GetEntityChildDevices(string deviceId)
        {
            if (deviceId == null || deviceId == string.Empty)
            {
                return new Entity.BaseResponse<List<Response.EntityWiseDeviceResponse>>(false, "Invalid Request");
            }

            Entity.BaseResponse<List<Response.EntityWiseDeviceResponse>> response = new Entity.BaseResponse<List<Response.EntityWiseDeviceResponse>>(true);
            try
            {
                response.Data = _deviceService.GetEntityChildDevices(Guid.Parse(deviceId));
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<List<Response.EntityWiseDeviceResponse>>(false, ex.Message);
            }
            return response;
        }

        [HttpGet]
        [Route(DashboardRoute.Route.GetDeviceDetail, Name = DashboardRoute.Name.GetDeviceDetail)]
        [EnsureGuidParameterAttribute("deviceId", "Device")]
        public Entity.BaseResponse<Response.DeviceDetailResponse> GetDeviceDetail(string deviceId)
        {
            if (deviceId == null || deviceId == string.Empty)
            {
                return new Entity.BaseResponse<Response.DeviceDetailResponse>(false, "Invalid Request");
            }

            Entity.BaseResponse<Response.DeviceDetailResponse> response = new Entity.BaseResponse<Response.DeviceDetailResponse>(true);
            try
            {
                response.Data = _deviceService.GetDeviceDetail(Guid.Parse(deviceId));
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<Response.DeviceDetailResponse>(false, ex.Message);
            }
            return response;
        }
    }
}