import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { TripDetail } from './pages/TripDetail';
import { ImportTrip } from './pages/ImportTrip';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="trip/:id" element={<TripDetail />} />
                    <Route path="i" element={<ImportTrip />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
