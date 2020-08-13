module.exports = (tl_data) => {
    const today = new Date();

    var rows = "";
    tl_data.forEach((task, i)=> {
      if(i != 0 && i%49 === 0){
        rows += `<tr></tr>
        </tbody>
        </table>
        <p>${tl_data.length} Task(s) CONTINUED</p>
        <table class="minimalistBlack">
          <thead>
            <tr>
              <th class="tiny">Order</th>
              <th class="tiny">WO #</th>
              <th class="small">Date</th>
              <th class="small">Name</th>
              <th class="small">City</th>
              <th class="tiny">State</th>
              <th class="tiny">Type</th>
              <th class="medium">SCBD</th>
              <th class="small">Sign</th>
              <th class="small">Artwork</th>
              <th class="small">Drill</th>
              <th class="small">D-Date</th>
              <th class="small">D-Crew</th>
              <th class="small">I-Date</th>
              <th class="small">I-Crew</th>
            </tr>
          </thead>
          <tbody>`;
      }

      rows +=`<tr><td class="small">${task.priority_order}</td><td class="small">${task.table_id ? task.table_id : ""}</td><td class="small">${task.wo_date ? task.wo_date : ""}</td><td class="small">${task.t_name ? task.t_name : ""}</td>` +
      `<td class="small">${task.city ? task.city : ""}</td><td class="small">${task.state ? task.state : ""}</td><td class="small">${task.type ? task.type : ""}</td><td class="medium">${task.description ? task.description : ""}</td>` +
      `<td class="small">${task.sign ? task.sign : ""}</td><td class="small">${task.artwork ? task.artwork : ""}</td><td class="small">${task.drilling ? task.drilling : ""}</td>` + 
      `<td class="small">${task.drill_date ? task.drill_date : ""}</td><td class="small">${task.drill_crew_leader ? task.drill_crew_leader : (task.drill_crew ? 'Crew '+task.drill_crew : "") }</td>` + 
      `<td class="small">${task.install_date ? task.install_date : ""}</td><td class="small">${task.install_crew_leader ? task.install_crew_leader : (task.install_crew ? 'Crew '+task.install_crew : "")}</td></tr>`;
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
            padding: 1px 2px;
          }
          table.minimalistBlack tbody td {
            font-size: 5px;
            overflow: hidden;
            white-space: nowrap;

          }
          table.minimalistBlack tbody tr {
            height:.5em;

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

          table.minimalistBlack tfoot td {
            font-size: 5px;
          }
          .tiny{
            width: 20px;
          }
          .small {
            width: 35px;
          }
          .medium {
            width: 90px;
          }
        </style>
       </head>
       <body>
         <p>${tl_data.length} Task(s)</p>
          <table class="minimalistBlack">
            <thead>
              <tr>
                <th class="tiny">Order</th>
                <th class="tiny">WO #</th>
                <th class="small">Date</th>
                <th class="small">Name</th>
                <th class="small">City</th>
                <th class="tiny">State</th>
                <th class="tiny">Type</th>
                <th class="medium">SCBD</th>
                <th class="small">Sign</th>
                <th class="small">Artwork</th>
                <th class="small">Drill</th>
                <th class="small">D-Date</th>
                <th class="small">D-Crew</th>
                <th class="small">I-Date</th>
                <th class="small">I-Crew</th>
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