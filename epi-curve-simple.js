
/* copy lines below to a SharePoint script editor

<h2>Epidemiological curves</h2>
<p>Data from <a href="https://experience.arcgis.com/experience/685d0ace521648f8a5beeeee1b9125cd" target="_blank">WHO:  Novel Coronavirus (COVID-19) Situation Dashboard</a>.</p>

<canvas id="wordwide" width="400" height="300"></canvas></br></br>
<canvas id="canada" width="400" height="300"></canvas>

<p>Note data may not display depending on the source's site traffic. <a id="refresh" href="#" >Click here to refresh the charts.</a></p>

<script src="https://code.jquery.com/jquery-3.4.1.min.js" integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossorigin="anonymous"></script> <!-- DON'T COPY if SharePoint 2016 -->

*/
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.3/Chart.min.js"></script>

<script type="text/javascript">  

    var worldData = [];
    var canadaData = [];

    // retrieve sum of global new cases for each day
    var worldSettings = {
        "async": false,
        "url": "https://services.arcgis.com/5T5nSi527N4F7luB/ArcGIS/rest/services/Historic_adm0_v3/FeatureServer/0/query",
        "method": "POST",
        "timeout": 0,
        "headers": {
        "Content-Type": "application/x-www-form-urlencoded"
        },
        "data": {
        "f": "json",
        "where": "1=1",
        "returnGeometry": "false",
        "spatialRel": "esriSpatialRelIntersects",
        "orderByFields": "DateOfDataEntry asc",
        "groupByFieldsForStatistics": "DateOfDataEntry",
        "outStatistics": "[{\"statisticType\": \"Sum\", \"onStatisticField\": \"NewCase\", \"outStatisticFieldName\": \"DailyNewCases\"}]",
        "resultOffset": "0",
        "cacheHint": "true"
        },
        success: function(response) {
            var result = JSON.parse(response);
            var entries = result.features.map(function (entry) {
                return {
                    "DateOfDataEntry" : new Date(entry.attributes.DateOfDataEntry).toLocaleDateString('en-CA'),
                    "DailyNewCase": entry.attributes.DailyNewCases                    
                };
            });
            
            worldData = entries.slice();
        }
    };

    // retrieve sum of new cases for each day for Canada only
    var canadaSettings = {
        "async": false,
        "url": "https://services.arcgis.com/5T5nSi527N4F7luB/ArcGIS/rest/services/Historic_adm0_v3/FeatureServer/0/query",
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        "data": {
            "f": "json",
            "where": "ADM0_VIZ_NAME = 'CANADA'",
            "outFields": "OBJECTID, DateOfDataEntry, cum_conf, NewCase, ADM0_VIZ_NAME",
            "returnGeometry": "false",
            "spatialRel": "esriSpatialRelIntersects",
            "orderByFields": "DateOfDataEntry asc",
            "resultOffset": "0",
            "cacheHint": "true"
        }, success: function(response) {
            var result = JSON.parse(response);
            var entries = result.features.map(function (entry) { 
                return {
                    "DateOfDataEntry" : new Date(entry.attributes.DateOfDataEntry).toLocaleDateString('en-CA'),
                    "DailyNewCase": entry.attributes.NewCase
                }; 
            })
          
            canadaData = entries.slice();

        }
    };

    function displayCharts() {
        $.ajax(worldSettings);
        $.ajax(canadaSettings);

        var canadaOffsetDate = ["2020-01-21", "2020-01-22", "2020-01-23", "2020-01-24", "2020-01-25"];
        var canadaOffsetCase = [0, 0, 0, 0, 0];

        if(worldData.length > 0) {
            var worldDateLabel = worldData.map( function (entry) { return entry.DateOfDataEntry; });
            var worldCaseData = worldData.map( function (entry) { return entry.DailyNewCase; });

            var globalChart = document.getElementById('wordwide').getContext('2d');

            var myChart  = new Chart (globalChart, {
                type: 'bar',
                data: {
                    labels: worldDateLabel,
                    datasets: [
                        {
                            data: worldCaseData,
                            label: "Cases",
                            backgroundColor: "#ff9f1c"
                        }, 
                    ]
                }, options: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        fontSize: 24,
                        text: 'Cases by Date of Report - Worldwide'
                    }
                }
            });
        }
        
        if(canadaData.length > 0) {
            var canadaDateLabels = canadaOffsetDate.concat(canadaData.map( function (entry) { return entry.DateOfDataEntry; }));
            var canadaCaseDate = canadaOffsetCase.concat(canadaData.map( function(entry) { return entry.DailyNewCase; }));      
            var canadaChart = document.getElementById('canada').getContext('2d');    
            
            var myChart  = new Chart (canadaChart, {
                type: 'bar',
                data: {
                    labels: canadaDateLabels,
                    datasets: [
                        {
                            data: canadaCaseDate,
                            label: "Cases",
                            backgroundColor: "#2471a3"
                        },
                    ]
                }, options: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        fontSize: 24,
                        text: 'Cases by Date of Report - Canada'
                    }
                }
            });
        }
    }

    $(document).ready( function() {
        displayCharts();

        $("#refresh").click(function() {
            displayCharts();
        })
    });


</script>
