module.exports = (wo_data) => {
    const today = new Date();

    var rows = "";
    wo_data.forEach((item, i)=> {
      console.log(item);
      if(i != 0 && i%35 === 0){
        rows += `<tr></tr>
        </tbody>
        </table>
        <p>${wo_data.length} Work Order(s) CONTINUED</p>
        <table class="minimalistBlack">
          <thead>
            <tr>
              <th class="small">WO #</th>
              <th class="medium">Date</th>
              <th class="small">Type</th>
              <th>Account</th>
              <th>Description</th>
              <th class="medium">Completed</th>
              <th class="medium">Invoiced</th>
            </tr>
          </thead>
          <tbody>`;
      }

      rows +=`<tr><td class="small">${item.wo_record_id}</td><td class="medium">${item.date}</td><td class="small">${item.wo_type}</td>` +
      `<td>${item.a_name}</td><td>${item.description}</td><td class="medium">${item.completed}</td><td class="medium">${item.invoiced}</td></tr>`;
    });
    
    
return `
    <!doctype html>
    <html>
       <head>
          <style>
          table.minimalistBlack {
            margin: 25px 25px 35px 25px;
            border: 1px solid #111111;
            width: 95%;
            table-layout:fixed;
            max-width:95%;
            text-align: left;
            border-collapse: collapse;
          }
          table.minimalistBlack td, table.minimalistBlack th {
            border: 1px solid #989898;
            padding: 5px 4px;
          }
          table.minimalistBlack tbody td {
            font-size: 11px;
            overflow: hidden;
            white-space: nowrap;

          }
          table.minimalistBlack tbody tr {
            height:1em;

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
            font-size: 15px;
            font-weight: bold;
            color: #212121;
            text-align: left;
            border-left: 1px solid #D0E4F5;
          }
          table.minimalistBlack thead th:first-child {
            border-left: none;
          }

          table.minimalistBlack tfoot td {
            font-size: 14px;
          }
          .small {
            width: 70px;
          }
          .medium {
            width: 120px;
          }
        </style>
       </head>
       <body>
         <p>${wo_data.length} Work Order(s)</p>
          <table class="minimalistBlack">
            <thead>
              <tr>
                <th class="small">WO #</th>
                <th class="medium">Date</th>
                <th class="small">Type</th>
                <th>Account</th>
                <th>Description</th>
                <th class="medium">Completed</th>
                <th class="medium">Invoiced</th>
              </tr>
            </thead>
            <tbody>
            ${rows}
            </tbody>
          </table>
        </body>
    </html>
    `;
};