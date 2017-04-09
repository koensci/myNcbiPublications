var pubList = {
    citations: [],
    
    generateQuery: function(pmidlist) {
		var query = pmidlist[0];

		for (var i = 1, len = pmidlist.length; i < len; i++) {
			query += "," + pmidlist[i];
		}

		return query;
	},
    
    updateHtml: function() {
        var pubHtml = [];
		var j = 1; //publication number
        
        for (year in pubList.citations) {
            for (citIndex in pubList.citations[year]) {
                pubList.citations[year][citIndex] = "<div class=\"col-sm-1\">" + j + pubList.citations[year][citIndex];

                j++;

                if (pubHtml[year] == null) {
                    pubHtml[year] = pubList.citations[year][citIndex];
                } else {
                    pubHtml[year] = pubList.citations[year][citIndex] + "<br><br>" + pubHtml[year];
                }
            }
        }
        
        $("pubList").html("");

        for (year in pubHtml) {

            if (year == new Date().getFullYear()) {
                $("pubList").prepend("<div class=\"panel panel-default\"><a data-toggle=\"collapse\" href=\"#collapse" + year + "\"><div class=\"panel-heading\" role=\"tab\" style=\"background-color:#f5f5f5; color:black\"><h4 class=\"panel-title\">" + year + "</h4></div></a><div id=\"collapse" + year + "\" class=\"panel-collapse collapse in\"><div class=\"panel-body\">" + pubHtml[year] + "</div></div>");
            } else {
                $("pubList").prepend("<div class=\"panel panel-default\"><a data-toggle=\"collapse\" href=\"#collapse" + year + "\"><div class=\"panel-heading\" role=\"tab\" style=\"background-color:#f5f5f5; color:black\"><h4 class=\"panel-title\">" + year + "</h4></div></a><div id=\"collapse" + year + "\" class=\"panel-collapse collapse\"><div class=\"panel-body\">" + pubHtml[year] + "</div></div>");
            }
        }
	},
    
    getCitations: function(pmidlist) {
		var query = pubList.generateQuery(pmidlist);
        
		$.getJSON("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&sort=pub+date&id=" + query + "&retmode=json", function(data) {

			for (var i = 0, len = pmidlist.length; i < len - 1; i++) {

				id = parseInt(pmidlist[i]);

				year = "";
				year += data.result[id].sortpubdate;
				year = year.slice(0, 4);

				citation = ""

				for (author in data.result[id].authors) {
					citation += data.result[id].authors[author].name + ", ";
				}

				citation = citation.slice(0, -2) + "."

				citation += " " + data.result[id].title + " <i>" + data.result[id].source + ".</i> " + data.result[id].pubdate + "; " + data.result[id].volume + "(" + data.result[id].issue + "):" + data.result[id].pages + ". ";

				for (index in data.result[id].articleids) {
					if (data.result[id].articleids[index].idtype == "doi") {
						citation += "doi: " + data.result[id].articleids[index].value;
					}
				}

				citation = ". </div><div class=\"col-sm-11\" style=\"padding-bottom:10px\"><a href=\"http://www.ncbi.nlm.nih.gov/pubmed/" + data.result[id].uid + "\" target=\"_blank\">" + citation + "</a></div>";

				if (id != "uids") {
					if (pubList.citations[year] == null) {
						pubList.citations[year] = [];
						pubList.citations[year].push(citation);
					} else {
						pubList.citations[year].push(citation);
					}
				}
			}
            pubList.updateHtml();
        });
    },
    
	getBibliography: function(bibid) {
		$.ajaxSetup({
			timeout: 10000
		});

		$.getJSON("https://script.google.com/macros/s/AKfycbxFaTXkIeWhhfQmGISYoKAc1TmpijjCpuUKzXUjR1sOP-0hh1o/exec?url=https://ncbi.nlm.nih.gov/myncbi/pmidlist/?bibid=" + bibid + "&sort=date&order=ascending", function(response) {
			var pmidlist = response.results;
            pubList.getCitations(pmidlist);
		});
	},
};