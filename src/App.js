import { Route, Routes } from 'react-router-dom';
import './App.css';
import AppLayout from './layout/AppLayout/AppLayout';
import Home from './page/Home/Home';
import Login from './page/Login/Login';
import CameraDatabase from './page/CameraDatabase/CameraDatabase';
import Plugins from './page/Plugins/Plugins';
import Purchase from './page/Purchase/Purchase';
import FilenameGenerator from './page/FilenameGenerator/FilenameGenerator';
import SVGto3D from './page/SVGTo3D/SVGTo3D';
import ColorPalette from './page/ColorPalette';
// import SVGViewer from './page/SVGViewer';

function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path='login' element={<Login />} />
          <Route path='camera-database' element={<CameraDatabase />} />
          <Route path='plugins' element={<Plugins />} />
          <Route path='purchase' element={<Purchase />} />
          <Route path='filename-generator' element={<FilenameGenerator />} />
          <Route path='svg23d' element={<SVGto3D />} />
          <Route path='color-palette' element={<ColorPalette />} />
          {/* <Route path='svg-viewer' element={<SVGViewer />} /> */}
        </Route>
      </Routes>
    </div>
  );
}

export default App;
