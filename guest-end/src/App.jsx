import React from 'react';
import RoutePath from './RoutePath';
import axios from 'axios';
import data from './data.json'; 

const path = data.backend;
axios.defaults.baseURL = path;

function App() {
    return (
        <div>
           <RoutePath/>
        </div>
    );
}

export default App;