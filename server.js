#!/bin/env node
//OpenShift sample Node application
var config = require('./config'),
googleApi = require('./google-api'),
wikiquoteApi = require('./wikiquote-api');

console.log("Start scraper...");

console.log("Clear file");
googleApi.clearWorksheet(config.scraperOutputId);

googleApi.getDataTable(config.scraperInputId,
		function(error,data){
	if (error)
		console.log(error);
	else
	{
		for(var i=0;i<data.rows.length;i++)
		{
			var title = data.rows[i].c[0].v;
			if (title)
			{
			wikiquoteApi.queryTitles(title,
					function (pageId)
					{
						wikiquoteApi.getSectionsForPage(pageId,
								function(result){
									for(var j=0;j<result.sections.length;j++)
									{
										wikiquoteApi.getQuotesForSection(pageId,result.sections[j],
												function(result){
													if (result.quotes.length>0)
														{
														console.log(result.quotes);
														var tag;
														for(var n=0;n<data.rows.length;n++)
														{
															if (data.rows[n].c[0].v===result.quotes[0].author)
																tag = data.rows[n].c[2].v;
														}
														for(var k=0;k<result.quotes.length;k++)
																{
																	result.quotes[k].tag=tag;
																}
														console.log(result.quotes);
														googleApi.writeRows(config.scraperOutputId,result.quotes);
														}
										},function(error){
											console.log(error);
										})
									}
								},function (error)
								{
									console.log(error);
								})
					},
					function (error)
					{
						console.log(error);
					});
			//console.log(row.c[0]);
			}
		}
	}
});