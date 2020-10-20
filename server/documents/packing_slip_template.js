module.exports = (data) => {
    const today = new Date();

    var rows = `
        </tbody>
        </table>
        <p>${data.record_id} Task(s) CONTINUED</p>
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
         <p>${data.record_id} Packing Slip(s)</p>
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
            </tbody>
          </table>
        </body>
    </html>
    `;
};