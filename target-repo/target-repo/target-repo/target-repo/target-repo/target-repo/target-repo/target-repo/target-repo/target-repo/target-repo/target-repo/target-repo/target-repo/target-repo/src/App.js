import './App.css'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import { Register } from "./Components/Register";
import { Home } from "./Components/Home";
import { Layout } from "./Components/Layout/Layout";

function App() {
  return (
    <BrowserRouter>
    <div className="App">
      <Layout>
        <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/register" element={<Register/>} />

            </Routes>
         </Layout>
    </div>
    </BrowserRouter>
  )
}

export default App
