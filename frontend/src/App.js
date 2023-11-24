import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import SwapPage from './pages/SwapPage';
import PoolPage from './pages/PoolPage';
import StakePage from './pages/StakePage';


const router = createBrowserRouter([
   {path: '/', element: <SwapPage/>},
   {path: '/swap', element: <SwapPage/>},
   {path: '/pool', element: <PoolPage/>},
   {path: '/stake', element: <StakePage/>},
]);

function App() {
    return <RouterProvider router={router}/>;
}
export default App;
