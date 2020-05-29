using iot.solution.entity.Structs.Routes;
using iot.solution.service.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Net;
using Entity = iot.solution.entity;
using Response = iot.solution.entity.Response;
using Request = iot.solution.entity.Request;

namespace host.iot.solution.Controllers
{
    [Route(ChartRoute.Route.Global)]
    [ApiController]
    public class ChartController : BaseController
    {
        private readonly IChartService _chartService;
        
        public ChartController(IChartService chartService)
        {
            _chartService = chartService;
        }
        [HttpPost]
        [Route(ChartRoute.Route.GetStatisticsByEntity, Name = ChartRoute.Name.GetStatisticsByEntity)]
        public Entity.BaseResponse<List<Response.EntityStatisticsResponse>> StatisticsByEntity(Request.ChartRequest request)
        {
            Entity.BaseResponse<List<Response.EntityStatisticsResponse>> response = new Entity.BaseResponse<List<Response.EntityStatisticsResponse>>(true);
            try
            {
                response = _chartService.GetStatisticsByEntity(request);
                response.IsSuccess = true;
            }
            catch (Exception ex)
            {
                base.LogException(ex);
                return new Entity.BaseResponse<List<Response.EntityStatisticsResponse>>(false, ex.Message);
            }
            return response;
        }

        [HttpPost]
        [Route(ChartRoute.Route.EnergyUsage, Name = ChartRoute.Name.EnergyUsage)]
        public Entity.BaseResponse<List<Response.EnergyUsageResponse>> EnergyUsage(Request.ChartRequest request)
        {
            Entity.BaseResponse<List<Response.EnergyUsageResponse>> response = new Entity.BaseResponse<List<Response.EnergyUsageResponse>>(true);
            try
            {
                response.Data = _chartService.GetEnergyUsage(request);
            }
            catch (Exception ex) {
                base.LogException(ex);
            }
            return response;
        }

        [HttpPost]
        [Route(ChartRoute.Route.FuelUsage, Name = ChartRoute.Name.FuelUsage)]
        public Entity.BaseResponse<List<Response.FuelUsageResponse>> FuelUsage(Request.ChartRequest request)
        {
            Entity.BaseResponse<List<Response.FuelUsageResponse>> response = new Entity.BaseResponse<List<Response.FuelUsageResponse>>(true);
            try
            {
                response.Data = _chartService.GetFuelUsage(request);
            }
            catch (Exception ex) {
                base.LogException(ex);
            }
            return response;
        }

        [HttpPost]
        [Route(ChartRoute.Route.DeviceBatteryStatus, Name = ChartRoute.Name.DeviceBatteryStatus)]
        public Entity.BaseResponse<List<Response.DeviceBatteryStatusResponse>> DeviceBatteryStatus(Request.ChartRequest request)
        {
            Entity.BaseResponse<List<Response.DeviceBatteryStatusResponse>> response = new Entity.BaseResponse<List<Response.DeviceBatteryStatusResponse>>(true);
            try
            {
                response.Data = _chartService.GetDeviceBatteryStatus(request);
            }
            catch(Exception ex)
            {
                base.LogException(ex);
            }
            return response;
        }
    }
}