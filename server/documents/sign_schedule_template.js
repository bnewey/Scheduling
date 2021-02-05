const moment = require('moment');
const Util = require('../../js/Util')

module.exports = (signs, columns) => {
    const today = moment().format('MMM-DD-YYYY');
    //Get total number of signs, sum of each quantity 
    const numSigns = (signs.reduce((acc, current)=> { return {quantity: acc.quantity + current.quantity}} )).quantity

    var rows = "";
    var columns = columns.filter((col)=> !col.dontShowInPdf);

    const checkAllLastColumns = (columns, lastRow, row, columnIndex) =>{
      return (columns.slice(0, columnIndex+1).every((column)=> {
        return  (lastRow && column && lastRow[column.id] == row[column.id])
      }))
    }

    signs.forEach((sign, i)=> {
      var pageNumber =  1+(Math.floor((i+1)/46));
      var maxPages = 1+(Math.floor((signs.length)/46))
      if(i != 0 && i%46 === 0){
        rows += `<tr></tr>
        </tbody>
        </table>
        <div class="titleDiv">
        <span class="item">${today}</span>
         <span class="item">Open Job Status Sheet</span>
         <span class="item">${numSigns} Sign(s)</span>
         <span class="item">(${pageNumber} of ${maxPages})</span>
         </div>
        <table class="minimalistBlack">
          <thead><tr>`;
          columns.forEach((column, colI)=> {
           rows+=`<th style='text-align: ${column.align}; width: ${column.minWidth}px'>${column.label}</th>`
          })
            rows+= `</tr>
          </thead>
          <tbody>`;
      }

      const lastRow = i > 0 ? signs[i-1] : null;

      rows +=`<tr>`
      columns.forEach((column, colI)=> {

        var topBorder = lastRow && sign[columns[0].id] != lastRow[columns[0].id];
        
        var value;
        //This hides repeat values in table for easier viewing
        if(column.hideRepeats &&  checkAllLastColumns(columns, lastRow, sign, colI) && i%46 !== 0){
          value = null;
        }else{
          if((column.id === "install_date") && sign[column.id] == null){
            value = "****";
          }else{
            if(column.pdfType != "checkbox" && column.type == 'date'){
              value = Util.convertISODateToMySqlDate(sign[column.id])
            }else{
              if(column.pdfType == "checkbox" || column.type == "checkbox"){
                value = sign[column.id] ? '[&nbsp;X&nbsp;]' : '[&nbsp;&nbsp;&nbsp;]';
              }else{
                value = sign[column.id];
              }
              
            }
          }
        }
        rows+= `<td ${topBorder ? `style='border-top: 1px solid #aaa; text-align: ${column.align}; width: ${column.minWidth}px;'` :
                     `style='text-align: ${column.align}; width: ${column.minWidth}px;'`}>
                    ${value != null ? value : ""}
                </td>`
      
        }) 
    });
var maxPages = 1+(Math.floor((signs.length)/46))
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
            overflow: hidden;

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
         <span class="item">${numSigns} Sign(s)</span>
         <span class="item">(1 of ${maxPages})</span>
         </div>
          <table class="minimalistBlack">
          <thead><tr>` ;
          columns.forEach((column, colI)=> {
            returnString+=`<th style='text-align: ${column.align}; width: ${column.minWidth}px;'>${column.label}</th>`
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