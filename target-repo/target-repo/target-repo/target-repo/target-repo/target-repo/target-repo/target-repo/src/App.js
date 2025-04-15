import './App.css'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import { Register } from "./Components/Register";
import { Home } from "./Components/Home";
import { Layout } from "./Components/Layout/Layout";
import Login from "./Components/Login";
import CreatePost from "./Components/CreatePost";
import ListPosts from "./Components/ListPosts";

function App() {
  return (
    <BrowserRouter>
    <div className="App">
      <Layout>
        <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/register" element={<Register/>} />
            <Route path="/login" element={<Login/>} />
            <Route path="/createpost" element={<CreatePost/>} />
            <Route path="/listposts" element={<ListPosts/>} />
            </Routes>
         </Layout>
    </div>
    </BrowserRouter>
  )
}

export default App
