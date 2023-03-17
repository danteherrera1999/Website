var table = document.getElementById("stats-table");
var button = document.getElementById('submit-button');

function table_value(name,val){
    var row = table.insertRow(0);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    cell1.innerHTML = name;
    cell2.innerHTML = val;
}
function onSubmit(form){
    var fgid = form.fgid.value;
    var fid = form.fid.value;
    var fkey = form.fkey.value;
    var url = `https://cors-anywhere.herokuapp.com/http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=${fgid}}&key=${fkey}&steamid=${fid}`;
    console.log(url);
    var XMLRequest = new XMLHttpRequest();
    XMLRequest.open('GET',url);
    XMLRequest.send();
    XMLRequest.onload = () => {
        if (XMLRequest.status === 200) {
            console.log('Request Successful');
            const response = JSON.parse(XMLRequest.response);
            const stats = response.playerstats.stats;
            console.log(stats);
            for (let i=0; i<stats.length; i++){
                var stat = stats[i];
                table_value(stat.name,stat.value);
            }
        }
        else{
            console.log("ERROR");
        }
    }
}

