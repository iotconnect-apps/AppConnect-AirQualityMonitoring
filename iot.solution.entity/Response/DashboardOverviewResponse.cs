﻿namespace iot.solution.entity
{
    
    public class DashboardOverviewResponse
    {
        public int TotalEntities { get; set; }
        public int TotalSubEntities { get; set; }
        public int TotalIndoorZones { get; set; }
        public int TotalOutdoorZones { get; set; }
    
        public int TotalAlerts { get; set; }
    }
}
