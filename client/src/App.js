import React, {useEffect,createContext,useReducer, useContext} from 'react'
import NavBar from './components/navbar'
import "./App.css"
import {BrowserRouter,Route,Switch,useHistory} from 'react-router-dom'
import Home from './components/screens/home'
import Login from './components/screens/login'
import Profile from './components/screens/profile'
import Signup from './components/screens/signup'
import CreatePost from './components/screens/createpost'
import {reducer,initialState} from './reducers/userReducer'
import UserProfile from './components/screens/UserProfile'
import SubscribedUserPosts from './components/screens/subscribedUserPosts'
import AllPosts from './components/screens/explore'
import Reset from './components/screens/reset'
import NewPassword from './components/screens/newpassword'
export const UserContext = createContext()

const Routing = () =>{
  const history = useHistory()
  const {state,dispatch} = useContext(UserContext)
  useEffect(()=>{
    const user = JSON.parse(localStorage.getItem("user"))

    if(user){
      dispatch({type:"USER",payload:user})
    } else {
      if(!history.location.pathname.startsWith('/reset')){
          history.push('/login')
      }
    }
  },[])
  return(
    <switch>
    <Route exact path="/"><Home /></Route>
    <Route path="/login"><Login /></Route>
    <Route exact path="/profile"><Profile /></Route>
    <Route path="/signup"><Signup /></Route>
    <Route path="/createpost"><CreatePost /></Route>
    <Route path="/profile/:userid"><UserProfile /></Route>
    <Route path="/feed"><SubscribedUserPosts /></Route>
    <Route path="/explore"><AllPosts /></Route>
    <Route exact path="/reset"><Reset /></Route>
    <Route path="/reset/:token"><NewPassword /></Route>
    
    </switch>
  )
}

function App() {
  const [state,dispatch] = useReducer(reducer,initialState)
  return (
    <UserContext.Provider value={{state,dispatch}}>
    <BrowserRouter>
    <NavBar />
    <Routing />

    </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
