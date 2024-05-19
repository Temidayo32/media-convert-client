import AppRoutes from './AppRoutes';
import { DataProvider } from './DataContext';

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
