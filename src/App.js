import logo from './logo.svg';
import './App.css';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Login from './component/Login';
import Join from './component/Join';
import Main from './component/Main';
import Create from './component/Create';
import Preview from './component/Preview';
import Search from './component/Search';
import Edit from './component/Edit';

function App() {
  return (
    <div className="App">
      <HashRouter>
        <Routes>
          <Route exact path='/' element={<Login></Login>}></Route>
          <Route exact path='/join' element={<Join></Join>}></Route>
          <Route exact path='/main' element={<Main></Main>}></Route>
          <Route exact path='/create' element={<Create></Create>}></Route>
          <Route exact path='/preview' element={<Preview></Preview>}></Route>
          <Route exact path='/search' element={<Search></Search>}></Route>
          <Route exact path='/edit' element={<Edit></Edit>}></Route>
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
