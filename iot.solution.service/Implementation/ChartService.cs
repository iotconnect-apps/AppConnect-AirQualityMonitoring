using iot.solution.data;
using iot.solution.model.Repository.Interface;
using iot.solution.service.Interface;
using System.Collections.Generic;
using Request = iot.solution.entity.Request;
using Response = iot.solution.entity.Response;
using System.Data;
using System.Data.Common;
using System.Reflection;
using component.logger;
using System;
using Entity = iot.solution.entity;
using LogHandler = component.services.loghandler;
using System.Linq;

namespace iot.solution.service.Implementation
{
    public class ChartService : IChartService
    {
        private readonly IEntityRepository _entityRepository;
        private readonly LogHandler.Logger _logger;
        public string ConnectionString = component.helper.SolutionConfiguration.Configuration.ConnectionString;
        //private readonly LogHandler.Logger _logger;
        public ChartService(IEntityRepository entityRepository, LogHandler.Logger logger)//, LogHandler.Logger logger)
        {
            _entityRepository = entityRepository;
            _logger = logger;
        }
        public Entity.ActionStatus TelemetrySummary_DayWise()
        {
            Entity.ActionStatus actionStatus = new Entity.ActionStatus(true);
            try
            {
                _logger.InfoLog(LogHandler.Constants.ACTION_ENTRY, null, "", "", this.GetType().Name, MethodBase.GetCurrentMethod().Name);
                using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                {
                    List<DbParameter> parameters = new List<DbParameter>();
                    sqlDataAccess.ExecuteNonQuery(sqlDataAccess.CreateCommand("[TelemetrySummary_DayWise_Add]", CommandType.StoredProcedure, null), parameters.ToArray());
                }
                _logger.InfoLog(LogHandler.Constants.ACTION_EXIT, null, "", "", this.GetType().Name, MethodBase.GetCurrentMethod().Name);

            }
            catch (Exception ex)
            {
                _logger.ErrorLog(ex, this.GetType().Name, MethodBase.GetCurrentMethod().Name);
                actionStatus.Success = false;
                actionStatus.Message = ex.Message;
            }
            return actionStatus;
        }
        public Entity.ActionStatus TelemetrySummary_HourWise()
        {
            Entity.ActionStatus actionStatus = new Entity.ActionStatus(true);
            try
            {
                _logger.InfoLog(LogHandler.Constants.ACTION_ENTRY, null, "", "", this.GetType().Name, MethodBase.GetCurrentMethod().Name);
                using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                {
                    List<DbParameter> parameters = new List<DbParameter>();
                    sqlDataAccess.ExecuteNonQuery(sqlDataAccess.CreateCommand("[TelemetrySummary_HourWise_Add]", CommandType.StoredProcedure, null), parameters.ToArray());
                }
                _logger.InfoLog(LogHandler.Constants.ACTION_EXIT, null, "", "", this.GetType().Name, MethodBase.GetCurrentMethod().Name);

            }
            catch (Exception ex)
            {
                _logger.ErrorLog(ex, this.GetType().Name, MethodBase.GetCurrentMethod().Name);
                actionStatus.Success = false;
                actionStatus.Message = ex.Message;
            }
            return actionStatus;
        }
        public Entity.BaseResponse<List<Response.EntityStatisticsResponse>> GetStatisticsByEntity(Request.ChartRequest request)
        {
            Entity.BaseResponse<List<Response.EntityStatisticsResponse>> result = new Entity.BaseResponse<List<Response.EntityStatisticsResponse>>();
            try
            {
                _logger.InfoLog(Constants.ACTION_ENTRY, "Chart_StatisticsByEntity.Get");
                using (var sqlDataAccess = new SqlDataAccess(ConnectionString))
                {
                    List<DbParameter> parameters = sqlDataAccess.CreateParams(component.helper.SolutionConfiguration.CurrentUserId, component.helper.SolutionConfiguration.Version);
                    parameters.Add(sqlDataAccess.CreateParameter("guid", request.EntityGuid, DbType.Guid, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("frequency", request.Frequency, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("attribute", request.Attribute, DbType.String, ParameterDirection.Input));
                    parameters.Add(sqlDataAccess.CreateParameter("syncDate", DateTime.UtcNow, DbType.DateTime, ParameterDirection.Output));
                    parameters.Add(sqlDataAccess.CreateParameter("enableDebugInfo", component.helper.SolutionConfiguration.EnableDebugInfo, DbType.String, ParameterDirection.Input));
                    DbDataReader dbDataReader = sqlDataAccess.ExecuteReader(sqlDataAccess.CreateCommand("[Chart_StatisticsByEntity]", CommandType.StoredProcedure, null), parameters.ToArray());
                    result.Data = DataUtils.DataReaderToList<Response.EntityStatisticsResponse>(dbDataReader, null);
                    if (parameters.Where(p => p.ParameterName.Equals("syncDate")).FirstOrDefault() != null)
                    {
                        result.LastSyncDate = Convert.ToString(parameters.Where(p => p.ParameterName.Equals("syncDate")).FirstOrDefault().Value);
                    }
                }
                _logger.InfoLog(Constants.ACTION_EXIT, null, "", "", this.GetType().Name, MethodBase.GetCurrentMethod().Name);
            }
            catch (Exception ex)
            {
                _logger.ErrorLog(ex, this.GetType().Name, MethodBase.GetCurrentMethod().Name);
            }
            return result;
        }
        public List<Response.EnergyUsageResponse> GetEnergyUsage(Request.ChartRequest request)
        {
            Dictionary<string,string> parameters = new Dictionary<string, string>();
            parameters.Add("companyguid", request.CompanyGuid.ToString());
            parameters.Add("entityguid", request.EntityGuid.ToString());
            parameters.Add("hardwarekitguid", request.HardwareKitGuid.ToString());
            return _entityRepository.ExecuteStoredProcedure<Response.EnergyUsageResponse>("[ChartDate]", parameters);
        }

        public List<Response.DeviceBatteryStatusResponse> GetDeviceBatteryStatus(Request.ChartRequest request)
        {
        
            Dictionary<string, string> parameters = new Dictionary<string, string>();
            parameters.Add("companyguid", request.CompanyGuid.ToString());
            parameters.Add("entityguid", request.EntityGuid.ToString());
            parameters.Add("hardwarekitguid", request.HardwareKitGuid.ToString());
            return _entityRepository.ExecuteStoredProcedure<Response.DeviceBatteryStatusResponse>("[GensetUsage_Get]", parameters);
        }

        public List<Response.FuelUsageResponse> GetFuelUsage(Request.ChartRequest request)
        {
            Dictionary<string, string> parameters = new Dictionary<string, string>();
            parameters.Add("companyguid", request.CompanyGuid.ToString());
            parameters.Add("entityguid", request.EntityGuid.ToString());
            parameters.Add("hardwarekitguid", request.HardwareKitGuid.ToString());
            return _entityRepository.ExecuteStoredProcedure<Response.FuelUsageResponse>("[ChartDate]", parameters);
        }
    }
}
