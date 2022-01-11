import React,{useEffect,useState,useContext} from 'react'
import {UserContext} from '../../App'
import {useParams} from 'react-router-dom'

const Profile = ()=>{
    const [userProfile,setProfile] = useState(null)
    const {state,dispatch} = useContext(UserContext)
    const {userid} = useParams()

    useEffect(()=>{
        fetch(`/user/${userid}`,{
            headers:{
                "Authorization":"Bearer "+localStorage.getItem("jwt")
            }
        }).then(res=>res.json())
        .then(result=>{
            // console.log(result)
            setProfile(result)
        })
     },[])

     const followUser = ()=>{
        fetch('/follow',{
            method:"put",
            headers:{
                "Content-Type":"application/json",
                "Authorization":"Bearer "+localStorage.getItem('jwt')
            },
            body:JSON.stringify({
                followId:userid
            })
            }).then(res=>res.json())
            .then(data=>{
                
                dispatch({type:"UPDATE", payload:{following:data.following,followers:data.followers}})
                localStorage.setItem("user",JSON.stringify(data))
                setProfile((prevState)=>{
                    return {
                        ...prevState,
                        user:{
                            ...prevState.user,
                            followers:[...prevState.user.followers,data._id]
                        }
                    }
                })
            })
     }
     const unfollowUser = ()=>{
        fetch('/unfollow',{
            method:"put",
            headers:{
                "Content-Type":"application/json",
                "Authorization":"Bearer "+localStorage.getItem('jwt')
            },
            body:JSON.stringify({
                unfollowId:userid
            })
            }).then(res=>res.json())
            .then(data=>{
                
                dispatch({type:"UPDATE", payload:{following:data.following,followers:data.followers}})
                localStorage.setItem("user",JSON.stringify(data))
                setProfile((prevState)=>{
                    const newFollower = prevState.user.followers.filter(item=>item != data._id)
                    return {
                        ...prevState,
                        user:{
                            ...prevState.user,
                            followers:newFollower
                        }
                    }
                })
            })
     }
    return (
        <>
        {userProfile ? 
        
        <div className="wrapper">
            <div className="container">
                <div className="profilepicture">
                    <img src={userProfile.user.pic}
                    />
                </div>
                <div className="profileinfobox">
                    <h4>{userProfile.user.name}</h4>
                    <div className="profilestats">
                        <h6>{userProfile.posts.length} Posts</h6>
                        <h6>{userProfile.user.followers.length} Followers</h6>
                        <h6>{userProfile.user.following.length} Following</h6>
                    </div>

                    {userProfile.user._id !== state._id
                        ?
                        <div>{userProfile.user.followers.includes(state._id)
                            ?
                        <button style={{margin:"10px"}} className="btn waves-effect waves-light #64b5f6 blue lighten-2"
                            onClick={()=>unfollowUser()}
                            >Unfollow
                        </button>
                                        :
                        <button style={{margin:"10px"}}  className="btn waves-effect waves-light #64b5f6 blue lighten-2"
                            onClick={()=>followUser()}
                            >Follow
                        </button>
                        }
                        </div>
                        :
                        <h1></h1>
                    } 
                    
                </div>
            </div>

            <div className="gallery">
                {
                    userProfile.posts.map(item=>{
                        return(
                            <img key={item._id} className="item" src={item.photo} alt={item.title}/>
                        )
                    })
                }   
            </div>
        </div>
        
        : <h2>Loading...!</h2>
        }
        </>
    )
}

export default Profile