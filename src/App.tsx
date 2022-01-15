import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Bar from './elements/bar/Bar';
import Bubbles from './elements/bubbles/Bubbles';
import Graph from './elements/graph/Graph';
import Header from './elements/header/Header';
import LandingPage from './elements/landing/LandingPage';
import TreeMap from './elements/treemap/TreeMap';

const App = () => (
  <Router>
    <Header />
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/bar" element={<Bar />} />
      <Route path="/bubbles" element={<Bubbles />} />
      <Route path="/graph" element={<Graph />} />
      <Route path="/treemap" element={<TreeMap />} />
    </Routes>
  </Router>
);

export default App;
