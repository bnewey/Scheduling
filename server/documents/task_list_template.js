const moment = require('moment');
const Util = require('../../js/Util')

module.exports = (tasks, columns) => {
    const today = moment().format('MMM-DD-YYYY');

    var columns = columns.filter((col)=> !col.dontShowInPdf);

    var rows = "";
    tasks.forEach((task, i)=> {
      var pageNumber =  1+(Math.floor((i+1)/46));
      var maxPages = 1+(Math.floor((tasks.length)/46))
      if(i != 0 && i%46 === 0){
        rows += `<tr></tr>
        </tbody>
        </table>
        <div class="titleDiv">
        <span class="item">${today}</span>
         <span class="item">Open Job Status Sheet</span>
         <span class="item">${tasks.length} Task(s)</span>
         <span class="item">(${pageNumber} of ${maxPages})</span>
         </div>
        <table class="minimalistBlack">
          <thead><tr>`;
          columns.forEach((column, colI)=> {
           rows+=`<th style='text-align: ${column.align}; width: ${column.width}'>${column.text}</th>`
          })
            rows+= `</tr>
          </thead>
          <tbody>`;
      }

      const lastRow = i > 0 ? tasks[i-1] : null;

      rows +=`<tr>`
      columns.forEach((column, colI)=> {

        var topBorder = lastRow && task[columns[0].field] != lastRow[columns[0].field];
        
        var value;
        //This hides repeat values in table for easier viewing
        if(column.hideRepeats &&  checkAllLastColumns(columns, lastRow, task, colI) && i%46 !== 0){
          value = null;
        }else{
          if(column.pdfField){
            value = task[column.pdfField] ? task[column.pdfField] : task[column.field] ;
          }else{
            if( column.type == 'date'){
              value = Util.convertISODateToMySqlDate(task[column.field])
            }else{
              value = task[column.field];
            }
          }
        }
        rows+= `<td ${topBorder ? `style='border-top: 1px solid #aaa; text-align: ${column.align}; width: ${column.width}'` :
                     `style='text-align: ${column.align}; width: ${column.width}'`}>
                     <div class="truncate"  style='text-align: ${column.align}; width: 100%'>
                    ${value != null ? value : ""}
                    </div>
                </td>`
      
      }) 
})

var maxPages = 1+(Math.floor((tasks.length)/46))
var returnString = `
  <!doctype html>
  <html>
      <head>
        <style>
        table.minimalistBlack {
          margin: 5px 25px 15px 25px;
          border: .8px solid #888;
          width: 95%;
          table-layout:fixed;
          max-width:95%;
          text-align: left;
          border-collapse: collapse;
        }
        table.minimalistBlack td, table.minimalistBlack th {
          border-right: 1px solid #aaa;
          
          padding: 0px 2px;
        }
        
        table.minimalistBlack td:first-child{
          border-left: 1px solid #aaa;
        }
        table.minimalistBlack tbody tr:last-child {
          border-bottom: 1px solid #aaa;
        }
        
        table.minimalistBlack tbody td {
          font-size: 5px;

        }
        .truncate{
          
          display: inline-block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        table.minimalistBlack tbody tr {
          height:.7em;

        }
        table.minimalistBlack tr:nth-child(even) {
          background: #F3F3F3;
        }
        table.minimalistBlack thead {
          background: #CFCFCF;
          background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);
          background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);
          background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);
          border-bottom: 1px solid #858585;
        }
        table.minimalistBlack thead th {
          font-size: 6px;
          font-weight: bold;
          color: #212121;
          text-align: left;
          border-left: 1px solid #D0E4F5;
        }
        table.minimalistBlack thead th:first-child {
          border-left: none;
        }

        table.minimalistBlack td {
          font-family: sans-serif;
          font-size:1em;
          font-weight: bold;
        }
        .tiny{
          width: 15px;
        }
        .small {
          width: 25px;
        }
        .medium {
          width: 50px;
        }
        .large {
          width: 100px;
        }
        .body:{
          width: 1000px;

        }
        .titleDiv {
          text-align: justify;
        }
        
        .titleDiv:after {
          content: '';
          display: inline-block;
          width: 100%;
        }
        
        .item {
          display: inline-block;
        }
      </style>
      </head>
      <body class="body">
      <div class="titleDiv">
      <span class="item">${today}</span>
        <span class="item">Open Job Status Sheet</span>
        <span class="item">${tasks.length} Task(s)</span>
        <span class="item">(1 of ${maxPages})</span>
        </div>
        <table class="minimalistBlack">
        <thead><tr>` ;
        columns.forEach((column, colI)=> {
          returnString+=`<th style='text-align: ${column.align}; width: ${column.width};'>${column.text}</th>`
        })
          returnString+=`</tr>
        </thead>
          <tbody>
          ${rows}
          </tbody>
        </table>
      </body>
  </html>
  `;
  return returnString;
};
