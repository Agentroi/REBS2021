var taskTable;

// Update the task list.
function fillDcrTable(status) {
    for (var row of status)
    {
        row.executed = (row.executed ? "V:" + row.lastExecuted : "");            
        row.pending = (row.pending ? "!" + (row.deadline === undefined ? "" : ":" + row.deadline) : "");            
        row.included = (row.included ? "" : "%");       
        row.name = "<button " + (row.enabled ? "" : "disabled") + " onclick=\"graph1.execute('" + row.name + "');fillDcrTable(graph1.status());\">" + row.label + "</button>";
    }
    taskTable.load(status);
    updateAccepting(graph1.isAccepting());
}

// Show if the graph is accepting or not.
function updateAccepting(status) {
    document.getElementById("accepting").innerHTML = (status ? "Accepting" : "Not accepting");
}

function relationsList(graph) {
    const list = []
    for (var evt of graph.events.values()) {
        //console.log(evt)
        evt.respones.forEach(r => list.push(JSON.stringify([evt.name,"resp",r.trg.name])));
        evt.includes.forEach(r => list.push(JSON.stringify([evt.name,"incl",r.trg.name])));
        evt.excludes.forEach(r => list.push(JSON.stringify([evt.name,"excl",r.trg.name])));
    }
    console.log(list);
    return list;
}

function compliance(l1, l2) {
    for (let i = 0; i < l2.length; i++) {
        if (!l1.includes(l2[i])) {
            return false;
        }
    }
    return true;
}

$(document).ready(function(e) {    
    taskTable = dynamicTable.config('task-table', 
    ['executed', 'included', 'pending', 'enabled', 'name'], 
    ['Executed', 'Included', 'Pending', 'Enabled', 'Name'], 
    'There are no items to list...'); 

    // update the input DCR Graph
    $('#ta-dcr').keyup(function(e) {
        var x = document.getElementById("ta-dcr");
        try{
            graph1 = parser.parse(x.value);        
            fillDcrTable(graph1.status());
            document.getElementById("parse-error").innerHTML = "";
        }
        catch(err)
        {
            document.getElementById("parse-error").innerHTML = "Box 1 Error </br>" + err.message + "</br>" + JSON.stringify(err.location);
        }
    });         


    // update the log
    $('#ta-log').keyup(function(e) {
        var x = document.getElementById("ta-log");
        try{
            
            // Load the log in CSV format
            var y = document.getElementById("ta-log");
            var rawlog = y.value;
            var log = $.csv.toArrays(rawlog, {
                delimiter: "'", // Sets a custom value delimiter character
                separator: ';', // Sets a custom field separator character
              });
            console.log(JSON.stringify(log));
            
            graph1.log = log;

            document.getElementById("log-details").innerHTML = "Log parsed </br>";

            // go through the log and show some basic statistics
            var count_events = 0;
            var cases = new Set();
            var activities = new Set();
            for (var line of log)
            {
                count_events++;
                var caseid = line[0];
                var activity = line[2];
                cases.add(caseid);
                activities.add(activity);
            }

            document.getElementById("log-details").innerHTML += "Events: " + count_events + " </br>";
            document.getElementById("log-details").innerHTML += "Cases: " + cases.size + " </br>";
            document.getElementById("log-details").innerHTML += "Activities: </br>";
            for (var a of activities)
            {
                document.getElementById("log-details").innerHTML += a + "</br>";
            }
        }
        catch(err)
        {
            document.getElementById("parse-error").innerHTML = err.message + "</br>" + JSON.stringify(err.location);
        }
    });        
    
    $('#ta-dcr2').keyup(function(e) {
        var x = document.getElementById("ta-dcr2");
        try {
            graph2 = parser.parse(x.value);
            
            l1 = relationsList(graph1)
            l2 = relationsList(graph2)
            if (compliance(l1, l2)) {
                document.getElementById("compliance-result").innerHTML = "Graphs are compliant!";
            } else {
                document.getElementById("compliance-result").innerHTML = "Graphs are NOT compliant!";
            }
            
            document.getElementById("parse-error").innerHTML = "";
        } catch (err) {
            document.getElementById("parse-error").innerHTML = "Box 2 Error </br>" + err.message + "</br>" + JSON.stringify(err.location);
        }
    });

    
    try{
        var x = document.getElementById("ta-dcr");
        graph1 = parser.parse(x.value);                
        fillDcrTable(graph1.status());
        document.getElementById("parse-error").innerHTML = "";
    }
    catch(err)
    {
        document.getElementById("parse-error").innerHTML = err.message + "</br>" + JSON.stringify(err.location);
    }

});