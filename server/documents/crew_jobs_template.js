const moment = require('moment');

module.exports = (crew,jobs) => {
    const today = moment().format('MMM-DD-YYYY');

    var rows = "";
    jobs.forEach((job, i)=> {
      var job_date = job.job_type == "drill" ? job.drill_date : (job.job_type == "install" ? job.sch_install_date : 'Err');
      if(i != 0 && i%28 === 0){
        rows += `<tr></tr>
        </tbody>
        </table>
        <p>${crew.crew_leader_name ? crew.crew_leader_name : `Crew ${crew.crew_id}`} - ${jobs.length} Jobs(s) CONTINUED | ${today}</p>
        <table class="minimalistBlack">
          <thead>
            <tr>
            <th class="tiny">Order</th>
            <th class="tiny">WO #</th>
            <th class="small">Job Date</th>
            <th class="tiny">Type</th>
            <th class="medium">Name</th>
            <th class="large">SCBD</th>
            <th class="medium">Address</th>
            <th class="small">City</th>
            <th class="tiny">State</th>
            <th class="tiny">Zip</th>
            <th class="small">Completed</th>
            <th class="small">Comp Date</th>
            </tr>
          </thead>
          <tbody>`;
      }

      rows +=`<tr>
      <td class="small">${job.ordernum}</td>
      <td class="small">${job.table_id ? job.table_id : ""}</td>
      <td class="small">${job_date ? job_date : ""}</td>
      <td class="small">${job.job_type ? job.job_type : ""}</td>
      <td class="small">${job.t_name ? job.t_name : ""}</td>
      <td class="medium">${job.description ? job.description : ""}</td>` +

      `<td class="small">${job.address ? job.address : ""}</td>
      <td class="small">${job.city ? job.city : ""}</td>
      <td class="small">${job.state ? job.state : ""}</td>
      <td class="small">${job.zip ? job.zip : ""}</td>` +
      `<td class="small">${job.completed == 1 ? "COMPLETED" : ""}</td>
      <td class="small">${job.completed_date ? job.completed_date : ""}</td> `;
      
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
        </style>
       </head>
       <body>
         <p>${crew.crew_leader_name ? crew.crew_leader_name : `Crew ${crew.crew_id}`} - ${jobs.length} Job(s) | ${today}</p>
          <table class="minimalistBlack">
            <thead>
              <tr>
              <th class="tiny">Order</th>
              <th class="tiny">WO #</th>
              <th class="small">Job Date</th>
              <th class="tiny">Type</th>
              <th class="medium">Name</th>
              <th class="large">SCBD</th>
              <th class="medium">Address</th>
              <th class="small">City</th>
              <th class="tiny">State</th>
              <th class="tiny">Zip</th>
              <th class="small">Completed</th>
              <th class="small">Comp Date</th>
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