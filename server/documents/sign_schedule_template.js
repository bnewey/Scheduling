const moment = require('moment');
const Util = require('../../js/Util');

module.exports = (signs, columns) => {
    const today = moment().format('MMM-DD-YYYY');
    // Get total number of signs, sum of each quantity 
    const numSigns = (signs.reduce((acc, current) => { return { quantity: acc.quantity + current.quantity } })).quantity;

    let rows = "";
    columns = columns.filter((col) => !col.dontShowInPdf);

    const checkAllLastColumns = (columns, lastRow, row, columnIndex) => {
        return (columns.slice(0, columnIndex + 1).every((column) => {
            return (lastRow && column && lastRow[column.id] == row[column.id])
        }));
    }

    const totalColumnWidth = columns.reduce((acc, col) => acc + col.minWidth, 0);
    const adjustedColumnWidths = columns.map(col => ({
        ...col,
        adjustedWidth: Math.max((col.minWidth / totalColumnWidth) * 80, 5) // Ensure minimum width of 15%
    }));

    const generateTableHeader = (pageNumber, maxPages) => {
      let header = `
      <div class="titleDiv">
          <span class="item">${today}</span>
          <span class="item">Open Job Status Sheet</span>
          <span class="item">${numSigns} Sign(s)</span>
          <span class="item">(${pageNumber} of ${maxPages})</span>
      </div>
      <table class="minimalistBlack">
          <thead><tr>`;
      adjustedColumnWidths.forEach((column) => {
          header += `<th style='text-align: ${column.align}; width: ${column.adjustedWidth}%;'>${column.label}</th>`;
      });
      header += `</tr></thead><tbody>`;
      return header;
  };

    const maxRowsPerPage = 25; // Set maximum rows per page to avoid bleeding onto the next page
    let pageNumber = 1;
    let rowCount = 0;
    let maxPages = Math.ceil(signs.length / maxRowsPerPage);

    const startNewPage = () => {
        rows += `</tbody></table>`;
        rows += `<div style="page-break-before: always;"></div>`;
        rows += generateTableHeader(pageNumber, maxPages);
    };

    rows += generateTableHeader(pageNumber, maxPages);

    signs.forEach((sign, i) => {
        if (rowCount === maxRowsPerPage) {
            pageNumber++;
            startNewPage();
            rowCount = 0;
        }

        const lastRow = i > 0 ? signs[i - 1] : null;
        rows += `<tr>`;
        adjustedColumnWidths.forEach((column, colI) => {
            const topBorder = lastRow && sign[columns[0].id] != lastRow[columns[0].id];
            let value;

            if (column.hideRepeats && checkAllLastColumns(columns, lastRow, sign, colI)) {
                value = null;
            } else {
                if ((column.id === "install_date") && sign[column.id] == null) {
                    value = "****";
                } else {
                    if (column.pdfType != "checkbox" && column.type === 'date') {
                        value = Util.convertISODateToMySqlDate(sign[column.id]);
                    } else {
                        if (column.pdfType === "checkbox" || column.type === "checkbox") {
                            value = sign[column.id] ? '[&nbsp;X&nbsp;]' : '[&nbsp;&nbsp;&nbsp;]';
                        } else {
                            value = sign[column.id];
                        }
                    }
                }
            }
            rows += `<td ${topBorder ? `style='border-top: 1px solid #aaa; text-align: ${column.align}; width: ${column.adjustedWidth}%; word-wrap: break-word;'` :
                `style='text-align: ${column.align}; width: ${column.adjustedWidth}%; word-wrap: break-word;'`}>
                    ${value != null ? value : ""}
                </td>`;
        });
        rows += `</tr>`;
        rowCount++;
    });

    rows += `</tbody></table>`;

    const returnString = `
    <!doctype html>
    <html>
       <head>
          <style>
          table.minimalistBlack {
            margin: 5px 25px 15px 25px;
            border: .8px solid #888;
            width: 78%; /* Adjusted to 80% to fit within the page */
            table-layout: fixed;
            text-align: left;
            border-collapse: collapse;
          }
          table.minimalistBlack td, table.minimalistBlack th {
            border-right: 1px solid #aaa;
            padding: 0px 1px; /* Reduced padding */
            word-wrap: break-word; /* Wrap text to fit column width */
          }

          table.minimalistBlack td:first-child {
            border-left: 1px solid #aaa;
          }
          table.minimalistBlack tbody tr:last-child {
            border-bottom: 1px solid #aaa;
          }

          table.minimalistBlack tbody td {
            font-size: 5px; /* Reduced font size */
            overflow: hidden;
          }
          table.minimalistBlack tbody tr {
            height: .6em; /* Reduced row height */
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
            font-size: 6px; /* Reduced font size */
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
            font-size: 1em;
            font-weight: bold;
          }
          .tiny {
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
          .body {
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
          ${rows}
       </body>
    </html>
    `;
    return returnString;
};
