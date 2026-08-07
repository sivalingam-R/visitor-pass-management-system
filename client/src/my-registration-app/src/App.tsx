import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import './styles/main.css';

const App: React.FC = () => {
    return (
        <Router>
            <Switch>
                <Route path="/register" component={RegisterPage} />
                {/* Additional routes can be added here */}
            </Switch>
        </Router>
    );
};

export default App;