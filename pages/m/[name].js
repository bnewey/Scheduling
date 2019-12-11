import { useRouter } from 'next/router';
import MainLayout from '../../components/Layouts/Main';

import WithData from '../../components/Machine/WithData';
import DenseHistoryTable from '../../components/Machine/DenseHistoryTable';
import IndexHead from '../../components/UI/IndexHead';

const Machine = function({rows, endpoint, socket, settings}) {
  const router = useRouter();

  //Grab specific row object using our router query variable 
  const spec_row = rows.filter( (machine) => { return(machine.name == router.query.name ) } )[0];


  return (
    <MainLayout>
      <IndexHead image={router.query.image}>{router.query.name} </IndexHead>
      {spec_row ? <h2>Temp: {spec_row.temp} | Pressure: {spec_row.pressure}</h2> : <h2>Loading Status...</h2> } 
      <h5>Data older than 30 days will be deleted</h5>
      <DenseHistoryTable name={router.query.name} />
    </MainLayout>
  );
}
export default WithData(Machine);
