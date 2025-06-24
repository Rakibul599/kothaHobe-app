import React, { useEffect, useState } from 'react'
import { getUrlimg } from '../../utils/GetUrlImg'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
function ChatNav({refresh,setRefresh}) {
  const [isadduser,setAdduser]=useState<boolean>(false);
  const [addusername,setUsername]=useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState(addusername);
  const [userData,setUserdata]=useState<Array<any>>([]);
  const navigate = useNavigate();
useEffect(()=>{
  const handler=setTimeout(()=>{
    setDebouncedQuery(addusername);
  },1200);
 
  return () => clearTimeout(handler);
},[addusername]);

useEffect(() => {
  const fetchData = async () => {
    if (!debouncedQuery.trim()) {
      setUserdata([]);
      return;
    }
    const name={
      name:debouncedQuery,
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_API}/chats/adduser`,name,{
        withCredentials: true,
      });
      setUserdata(response.data)
      console.log(typeof response.data);
      console.log(userData);


    } catch (error) {
      console.error(error); // Handle the error appropriately
    }
  };
  fetchData();
}, [debouncedQuery]);
  const adduserHandler=async (data)=>{
    console.log(data)
    try {
      const response = await axios.post(`${import.meta.env.VITE_API}/chats/chatconversion`,data,{
        withCredentials: true,
      });
      if(response.status===200)
      {
        
        setAdduser(false);
        setRefresh(!refresh);
        alert("Added success")
       
      }
      console.log(response)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400)
        {
          alert("Conversation already exists.")
        }
      console.log(error)
    }
  }
  return (
    <div className='relative'>
    <div className="h-[110px] bg-blue-600 grid grid-cols-[35%_65%] justify-items-center items-center p-2 ">
      {/* < className="h-[110px] bg-blue-600 flex place-content-between items-center p-2 "> */}
      <div>
        
        <div className="flex gap-1 ">
          <img
            src={getUrlimg("chat.png")}
            className="w-[30px] h-[30px]"
            alt=""
          />
          <p className="text-white">Kotha-Hobe!</p>
        </div>
      </div>
      <div className="w-full flex justify-end gap-2">
        <input type="text" value={addusername} onChange={(e)=>setUsername(e.target.value)} className={`bg-amber-50  ${isadduser ? '' : "hidden"} border-1 rounded-md`} />
        <img
          src={getUrlimg(`search.svg`)}
          className={`brightness-0 invert h-[30px] w-[30px] ${isadduser ? "hidden" : ""}`}
          alt="Search Icon"
        />
        <img
          src={getUrlimg(`${isadduser ? "remove.png" : "plus.png"}`)}
          className={`${isadduser ? "h-[20px] w-[20px]" : "brightness-0 invert h-[20px] w-[20px] mt-1"}`}
          alt="Search Icon"
          onClick={() => { setAdduser(!isadduser); setUsername(""); setUserdata([]); }}
        />
      </div>
      {/* <img className=" h-[20px] w-[20px]" src={getUrlimg("remove.png")} alt="" /> */}
    </div>

    {/* add user box */}
    <div className={`absolute w-full h-[80vh] overflow-y-scroll bg-[#ffffff] ${isadduser ? "" : "hidden"}`}>
      {userData.length > 0 ? (
        userData.map((data, i) => (
          <div key={i} className="bg-[#ffffff] cursor-pointer" onClick={()=>adduserHandler(data)}>
            <div className="grid grid-cols-[70px_auto] items-center p-2">
              <div className="w-20">
                <img
                  src={getUrlimg("man.png")}
                  className="h-15 w-15 rounded-[100%]"
                  alt="User Avatar"
                />
              </div>
              <div>
                <div>
                  <div className="grid grid-cols-2 content-between">
                    <h1 className="font-bold">{data.name}</h1>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))

      ):(
        <p>No user found</p>
      )}

      {/*  */}
    </div>
  </div>
  )
}

export default ChatNav
