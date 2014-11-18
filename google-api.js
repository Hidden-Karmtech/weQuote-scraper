var http = require('request'),
    googleSpreadsheet = require("google-spreadsheet"),
    config = require("./config");
    
var quoteIndex=0;

var googleSheetUrl = function(id)
{
	return "https://docs.google.com/spreadsheets/d/"+id+"/gviz/tq?gid=2";
}

module.exports = {
		getDataTable : function(id,callback)
		{
			var url = googleSheetUrl(id);
			http(url, function (error, response, body) {
				  if (!error && response.statusCode == 200) {
				    var jsonpData = body;
				    var json;
				    //if you don't know for sure that you are getting jsonp, then i'd do something like this
				    try
				    {
				       json = JSON.parse(jsonpData);
				    }
				    catch(e)
				    {
				        var startPos = jsonpData.indexOf('({');
				        var endPos = jsonpData.indexOf('})');
				        var jsonString = jsonpData.substring(startPos+1, endPos+1);
				        json = JSON.parse(jsonString);
				    }
				    callback(null, json.table);
				  } else {
				    callback(error);
				  }
				})
		},
		writeRows : function(id,rows)
		{
			var my_sheet = new googleSpreadsheet(id);
			my_sheet.setAuth(config.googleUsername,config.googlePassword, function(err){
				for (var i=0;i<rows.length;i++)
					{
						if(rows[i].quote)
							{
							console.log(quoteIndex+" push to sheet : "+rows[i].quote);
							quoteIndex++;
							my_sheet.addRow(1,rows[i]);
							}
					}
			    });
		},
		clearWorksheet : function(id)
		{
			var my_sheet = new googleSpreadsheet(id);
			my_sheet.getInfo( function( err, sheet_info ){
			        console.log( sheet_info.title + ' is loaded' );
			        // use worksheet object if you want to forget about ids
			        sheet_info.worksheets[0].getRows( function( err, rows ){
			            for(var i=0;i<rows.length;i++)
			            	{
			            		rows[i].del();
			            	};
			        })
			    });

		}
}
