
/*
 * LineChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the
 */

PercentVis = function(_parentElement, _data, _myEventHandler2){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = _data;
    myEventHandler = _myEventHandler2;

    this.initVis();

    console.log(this.displayData)

}

/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

PercentVis.prototype.initVis = function(){
    var vis = this;

    vis.displayData = vis.data;
    vis.selectedBarSeason, vis.selectedBarEpisode;

    vis.margin = {top: 0, right: 0, bottom: 60, left: 30};
    vis.innerwidth = 400 - vis.margin.left - vis.margin.right;
    vis.innerheight = 2200 - vis.margin.top - vis.margin.bottom;

    vis.width = vis.innerwidth,
        vis.height = vis.innerheight;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
        .attr("class", "g-box");

    vis.stacked = d3.stack()
        .keys(vis.displayData.columns.slice(4))
        .offset(d3.stackOffsetExpand)
        .order(d3.stackOrderDescending);

    vis.svg.append("g")
        .attr("class", "y-axis axis")
        .attr("transform", "translate(" + vis.margin.left +"," + vis.margin.top +")");

    vis.y = d3.scaleBand();

    vis.y2 = d3.scaleBand()
        .domain(vis.displayData.map(function(d){
            return d.index;
        }))
        .range([vis.margin.top, vis.height - vis.margin.bottom])
        .padding(0.1);

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    /* Initialize tooltip */
    vis.tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function(d, i) {
            var thisSpeaker = d3.select(this.parentNode).datum().key;
            var thisSeason = i.data.season;
            var thisEpisode = i.data.episode;
            var thisPercent = (i[1]-i[0]) * 100;
            return capitalizeFirstLetter(thisSpeaker) + ": " + thisPercent.toFixed(1) + "% of lines<br>S" + thisSeason + "E" + thisEpisode;
        });

    vis.svg.call(vis.tip)

    vis.wrangleData();
}

PercentVis.prototype.wrangleData = function(){
    var vis = this;


    vis.stackedSeries = vis.stacked(vis.displayData);

    vis.updateVis();
}

PercentVis.prototype.updateVis = function() {
    var vis = this;

    vis.color = d3.scaleOrdinal()
        .domain(vis.stackedSeries.map(d => d.key))
        .range(['#dd4631', '#58e561', '#ffe21f', '#742777',  '#6243cd',
            '#3d08b2', '#9d0703', '#f95668', '#5232cb', '#9282a4', '#cc1d21', '#1ccb8a', '#1c9ee4',
            '#ef32e8', '#28dfc2', '#8ee738', '#3df1e9', '#248faa',  '#75294d', '#863cb0',
            '#3560f6', '#0cd673',  '#e02323', '#7f0246', '#282908', '#b6ea48', '#b0db88', '#6d0804', '#121a7d', '#977d93']);

    vis.x = d3.scaleLinear()
        .rangeRound([vis.margin.left, vis.width - vis.margin.right])
        .domain([0, d3.max(vis.stackedSeries, d => d3.max(d, d => d[1]))]);

    var formatLabel = function(d) {
        if (d.episode == 1) {
            return "Season " + d.season;
        } else {
            return '';
        }
    }

    vis.y.domain(vis.displayData)
        .range([vis.margin.top, vis.y2.bandwidth()*vis.displayData.length + (1.12*(vis.displayData.length))])
        .padding(.12);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y)
        .tickFormat(function(d, i) {
            if (d.episode == 1) {
                return "Season " + d.season;
            } else {
                return '';
            }
        });

    vis.stackgroup = vis.svg.selectAll("g .stackgp")
        .data(vis.stackedSeries);

    vis.stackgroup.enter()
        .append("g")
        .merge(vis.stackgroup)
        .attr("class", "stackgp")
        .attr("fill", function(d) { return vis.color(d.key); });

    // vis.bars = vis.stackgroup.selectAll("rect")
    //     .data(d => d);
    //
    // vis.bars.exit().transition()
    //     .attr("width", 0)
    //     .style("opacity", 0).remove();
    //
    // vis.bars.enter()
    //     .append("rect")
    //     .style("opacity", 0)
    //     .merge(vis.bars)
    //     .attr("height", vis.y2.bandwidth())
    //     .attr("y", function(d, i) {
    //         return vis.y2(i+1) + vis.margin.top;
    //     })
    //     .attr("x", d => vis.x(d[0]))
    //     .transition()
    //     .attr("width", d => vis.x(d[1]) - vis.x(d[0]))
    //     .attr("class", function(d){
    //         if (d.data['season']== vis.selectedBarSeason && d.data['episode'] == vis.selectedBarEpisode){
    //             console.log("there should be a bar!!")
    //             return "chosenBar";
    //         }
    //         else{
    //             return "";
    //         }
    //     })
    //     .style("opacity", function(d) {
    //         if(this.classList.contains("chosenBar")) {
    //             return 1;
    //         }
    //         else{
    //             return .6;
    //         }
    //     });

    vis.stackgroup.selectAll("rect")
        .data(d => d)
        .join(
            enter => enter.append("rect")
                .attr("height", vis.y2.bandwidth())
                .attr("y", function(d, i) {
                    return vis.y2(i) + vis.margin.top;
                })
                .attr("x", d => vis.x(d[0]))
                .attr("width", d => vis.x(d[1]) - vis.x(d[0]))
                .style('opacity', 0)
                .transition().duration(400)
                .selection()
            ,
            update => update
                .attr("y", function(d, i) {
                    return vis.y2(i) + vis.margin.top;
                })
                .transition().duration(400)
                .attr("x", d => vis.x(d[0]))
                .attr("width", d => vis.x(d[1]) - vis.x(d[0]))
                .selection()
            ,
            exit => exit
                .transition().duration(400)
                .style('opacity', 0)
                .remove()
        )
        .attr("class", function(d){
            if (d.data['season']== vis.selectedBarSeason && d.data['episode'] == vis.selectedBarEpisode){
                return "chosenBar";
            }
            else{
                return "";
            }
        })
        .style('opacity', function(d){
            if(this.classList.contains("chosenBar")) {
                return 1;
            }
        })
    ;

    vis.svg.selectAll("rect")
        .on('mouseover', vis.tip.show)
        .on('mouseout', vis.tip.hide);

    // vis.svg.append("g")
    //     .attr("class", "axis")
    //     .attr("transform", "translate(0,"+(vis.height+vis.margin.top-vis.margin.bottom) +")")
    //     .call(d3.axisBottom(vis.x).ticks(null, "s").tickFormat(d => d*100 + "%"))
    //     .append("text")
    //     .attr("y", 2)
    //     .attr("x", vis.x(vis.x.ticks().pop()) + 0.5)
    //     .attr("dy", "0.32em")
    //     .attr("fill", "#000")
    //     .attr("font-weight", "bold")
    //     .attr("text-anchor", "start")
    //     .text("Percent Lines")
    //     .attr("transform", "translate("+ (-vis.width + vis.margin.right)+"," + (vis.margin.top*2) +")");
    //

    // Call axis function with the new domain
    vis.svg.select(".y-axis")
        .transition()
        .call(vis.yAxis);

}

PercentVis.prototype.onSelectionChange = function(selectedSeason){
    var vis = this;

    if(selectedSeason == "0"){
        vis.displayData = vis.data;
    }
    else{
        vis.displayData = vis.data.filter(function(d) {
            return d.season == selectedSeason;
        });
    }

    vis.wrangleData();
}

PercentVis.prototype.onEpisodeChoice = function(dis, seasSelected, epSelected){
    var vis = this;

    d3.selectAll(".chosenBar").attr("class", null);

    console.log(seasSelected);
    if(seasSelected != null) {
        vis.selectedBar = d3.selectAll("rect").filter(function (d) {
            return (d.data['episode'] == epSelected && d.data['season'] == seasSelected);
        });

        vis.selectedBar.classed("chosenBar", "true");
        // console.log(vis.selectedBar.data()[0].data['season'])

        vis.selectedBarSeason = vis.selectedBar.data()[0].data['season']
        vis.selectedBarEpisode = vis.selectedBar.data()[0].data['episode']
    }
    else {
        vis.selectedBarSeason = null;
        vis.selectedBarEpisode = null;
    }

    vis.wrangleData();
}
