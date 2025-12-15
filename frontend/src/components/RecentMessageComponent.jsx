import React, { useState } from 'react'

function RecentMessageComponent({
    userImage,
    userName,
    recentMessage,
    recentMessageDate
}) {
    const [isMouseInsideRecentMessage, setIsMouseInsideRecentMessage] = useState(false);
    const formatedDate = recentMessageDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
    })

  return (
    <div
    className={`flex border-b p-2 ${isMouseInsideRecentMessage? "bg-gray-300" : ""}`}
    onMouseEnter={()=> {
        setIsMouseInsideRecentMessage(true)
    }}
    onMouseLeave={()=>{
        setIsMouseInsideRecentMessage(false)
    }}
    >
        <img src={userImage} className='w-14 h-14 object-fill rounded-full mx-2 my-1' alt="" />
        <div className='flex flex-col w-full'>
            <div className='flex justify-between'>
                <span>{userName}</span>
                <span>{formatedDate}</span>
            </div>
            <div>
                <span className=''>{recentMessage}</span>
            </div>
        </div>
    </div>
  )
}

export default RecentMessageComponent