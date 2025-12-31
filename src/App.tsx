import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { TripDetail } from './pages/TripDetail';
import { SharedTrip } from './pages/SharedTrip';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="trip/:id" element={<TripDetail />} />
                    <Route path="share/:id" element={<SharedTrip />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
