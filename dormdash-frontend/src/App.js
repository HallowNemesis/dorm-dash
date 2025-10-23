import logo from './logo.svg';
import './App.css';
import { Login } from './components/LoginAndSignUp/Login/Login';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<div><Login/></div>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
