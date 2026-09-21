import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import WatchMovie from "./pages/WatchMovie";
import Watchlist from "./pages/Watchlist";
import Subscription from "./pages/Subscription";
import Movies from "./pages/Movies";
import Notifications from "./pages/Notifications";

import AdminRoute from "./routes/AdminRoute";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/movies"
                    element={<Movies />}
                />

                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    }
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/watch/:id"
                    element={<WatchMovie />}
                />

                <Route
                    path="/watchlist"
                    element={<Watchlist />}
                />

                <Route
                    path="/subscription"
                    element={<Subscription />}
                />

                <Route
                    path="/notifications"
                    element={<Notifications />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;