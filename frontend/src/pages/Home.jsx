import React, { useEffect, useState } from 'react'
import RecentMessageComponent from '../components/RecentMessageComponent';
import SearchIcon from "../assets/icons/search.png";

function Home() {
  const [recentMessages, setRecentMessages] = useState([])
  const [chats, setChats] = useState([])

  useEffect(() => {
    const recentUserMessages = [
      {
        id: 1,
        userName: "User 1",
        userImage: "https://images.unsplash.com/photo-1728577740843-5f29c7586afe",
        recentMessage: "XYZ",
        recentMessageDate: new Date('2025-11-08')
      },
      {
        id: 2,
        userName: "User 2",
        userImage: 'https://images.unsplash.com/photo-1740252117013-4fb21771e7ca',
        recentMessage: "ABC",
        recentMessageDate: new Date('2025-11-04')
      },
      {
        id: 3,
        userName: "User 3",
        userImage: "https://images.unsplash.com/photo-1750535135685-7d3322ba2e36",
        recentMessage: "HY",
        recentMessageDate: new Date('2025-11-02')
      },
      {
        id: 4,
        userName: "User 4",
        userImage: "https://plus.unsplash.com/premium_photo-1739786996040-32bde1db0610",
        recentMessage: "Hello",
        recentMessageDate: new Date('2025-10-10')
      },
    ];
    setRecentMessages(recentUserMessages)

    const userChats = {
      1: [
        {
          id: Date.now(),
          By: "",
          message: "Kya Haal Hai",
          timestamp: Date.now(),
        }
      ]
    };

    setChats(chats)
  }, [])

  return (
    <div className='h-dvh flex'>
      <div className='w-1/4 min-w-80 border-r h-dvh'>
        {recentMessages.map((recentMessage) => <RecentMessageComponent
          // {...recentMessage}
          userImage={recentMessage.userImage}
          userName={recentMessage.userName}
          recentMessage={recentMessage.recentMessage}
          recentMessageDate={recentMessage.recentMessageDate}
          key={recentMessage.id}
        />)}
      </div>
      <div className='w-3/4 h-dvh'>
        <div className='flex justify-between items-center border-b'>
          <div className='flex'>
            <img src={recentMessages?.[0]?.userImage} className='w-14 h-14 object-fill rounded-full mx-2 my-1' alt="" />
            <div className='flex flex-col'>
              <span>{recentMessages?.[0]?.userName}</span>
              <span>Last Seen 5 Min Ago</span>
            </div>
          </div>
          <div className="mx-12">
            <img src={SearchIcon} alt="" />
          </div>
        </div>
        <div className='scroll-auto'>

        </div>
      </div>
    </div>
  )
}

export default Home