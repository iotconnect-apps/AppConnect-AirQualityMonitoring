using component.logger;
using iot.solution.model.Repository.Interface;
using iot.solution.service.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Entity = iot.solution.entity;
using LogHandler = component.services.loghandler;
namespace iot.solution.service.Implementation
{
    public class DashboardService : IDashboardService
    {
        private readonly IDashboardRepository _dashboardrepository;
        private readonly IEntityRepository _entityRepository;
        private readonly LogHandler.Logger _logger;
        public DashboardService(IEntityRepository entityRepository, IDashboardRepository dashboardrepository, LogHandler.Logger logManager)
        {
            _entityRepository = entityRepository;
            _dashboardrepository = dashboardrepository;
            _logger = logManager;
        }

        public List<Entity.LookupItem> GetEntityLookup(Guid companyId)
        {
            List<Entity.LookupItem> lstResult = new List<Entity.LookupItem>();
            lstResult = (from g in _entityRepository.FindBy(r => r.CompanyGuid == companyId)
                         select new Entity.LookupItem()
                         {
                             Text = g.Name,
                             Value = g.Guid.ToString().ToUpper()
                         }).ToList();
            return lstResult;
        }

        public Entity.BaseResponse<Entity.DashboardOverviewResponse> GetOverview()
        {

            Entity.BaseResponse<List<Entity.DashboardOverviewResponse>> listResult = new Entity.BaseResponse<List<Entity.DashboardOverviewResponse>>();
            Entity.BaseResponse<Entity.DashboardOverviewResponse> result = new Entity.BaseResponse<Entity.DashboardOverviewResponse>(true);
            try
            {
                listResult = _dashboardrepository.GetStatistics();
                if (listResult.Data.Count > 0)
                {
                    result.IsSuccess = true;
                    result.Data = listResult.Data[0];
                    result.LastSyncDate = listResult.LastSyncDate;
                }

            }
            catch (Exception ex)
            {
                _logger.ErrorLog(ex, this.GetType().Name, MethodBase.GetCurrentMethod().Name);
            }
            return result; 
        }
    }
}
