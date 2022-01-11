import React,{useEffect,useState,useContext} from 'react'
import {UserContext} from '../../App'

const Profile = ()=>{
    const [myThumbnails,setThumbnails] = useState([])
    const {state,dispatch} = useContext(UserContext)
    const [image,setImage] = useState("")
    const [url,setUrl] = useState()

    useEffect(()=>{
        fetch('/mypost',{
            headers:{
                "Authorization":"Bearer "+localStorage.getItem("jwt")
            }
        }).then(res=>res.json())
        .then(result=>{
            setThumbnails(result.mypost)
        })
    },[])

    useEffect(()=>{
        if(image){
            const data = new FormData()
            data.append("file",image)
            data.append("upload_preset","insta-clone")
            data.append("cloud_name","cyipprogram")
    
            fetch("https://api.cloudinary.com/v1_1/cyipprogram/image/upload",{
                method:"post",
                body:data
                
            })
            .then(res=>res.json())
            .then(data=>{
                setUrl(data.url)
                fetch('/updatepic', {
                    method: "put",
                    headers:{
                        "Content-Type":"application/json",
                        "Authorization":"Bearer "+localStorage.getItem("jwt")
                    },
                    body:JSON.stringify({
                        pic:data.url
                    })
                }).then(res=>res.json())
                .then(result=>{
                    console.log(result)
                    localStorage.setItem("user",JSON.stringify({...state,pic:data.pic}))
                    dispatch({type:"UPDATEPIC",payload:result.pic})
                })
                })
            .catch(err=>{
                console.log(err)
            })
        }
    },[image])

    const updatePhoto=(file)=>{
        setImage(file)
    }

    return (
        <div className="wrapper">
            <div className="container">
                <div className="profilepicture">
                    <img src={state?state.pic:"loading..."}
                    />
                    <div className="btn #64b5f6 blue darken-1">
                        <span>Upload Photo</span>
                        <input type="file" onChange={(e)=>updatePhoto(e.target.files[0])} />
                    </div>
                </div>
                
                <div className="profileinfobox">
                    <h4>{state?state.name:"loading"}</h4>
                    <div className="profilestats">
                        <h6>{myThumbnails.length} Posts</h6>
                        <h6>{state?state.followers.length:"0"} Followers</h6>
                        <h6>{state?state.following.length:"0"} Following</h6>
                    </div>
                </div>
            </div>

            <div className="gallery">
                {
                    myThumbnails.map(item=>{
                        return(
                            <img key={item._id} className="item" src={item.photo} alt={item.title}/>
                        )
                    })
                }   
            </div>
        </div>
    )
}

export default Profile