var ratingsData, speakerData;

var parseTime = d3.timeParse("%Y-%m-%d");

var selectedSeason;

Promise.all([
    d3.csv("data/ratings-per-ep.csv"),
    d3.csv("data/lines-per-episode.csv", d3.autoType),
    // d3.csv("data/bigthief-and-covers-album-data.csv"),
    // d3.csv("data/bigthief-and-covers-tracklist-data.csv"),
    // d3.csv("data/bigthief-setlist-data-final.csv"),
]).then(function(data) {

    ratingsData  = data[0];
    speakerData = data[1];

    ratingsData.forEach(function(d, i) {
        d.airdate = parseTime(d.airdate);
    })

    createVis();

}).catch(function(err) {
    console.log(err);
})

function createVis(){

    // (3) Create event handler
    var MyEventHandler = {};

    // (4) Create visualization instances
    lineVis = new LineVis("linechartvis", ratingsData, MyEventHandler);
    percentVis = new PercentVis("percentchartvis", speakerData, MyEventHandler);
    seasonChanged();

    // (5) Bind event handler
    $(MyEventHandler).bind("episodeSelected", function(event, dis, seasSelected, epSelected){

        percentVis.onEpisodeChoice(dis, seasSelected, epSelected);
        lineVis.onEpisodeChoice(dis, seasSelected, epSelected);

    });

};

function seasonChanged() {
    // Convert the dropdown user input into the corresponding value

    // selectedSeason = selectArea.options[selectArea.selectedIndex].value;
    selectedSeason = d3.select("#season-filter").property("value");

    lineVis.onSelectionChange(selectedSeason);
    percentVis.onSelectionChange(selectedSeason);

}
