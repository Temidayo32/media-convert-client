import AppRoutes from './AppRoutes';
import { DataProvider } from './DataContext';

export const BASE_URL = "http://hubkit.eba-agfyjn2m.us-east-1.elasticbeanstalk.com/"

function App() {
  return (
      <div>
      <DataProvider> 
        <AppRoutes/>
      </DataProvider>
      </div>
  );
}

export default App;
