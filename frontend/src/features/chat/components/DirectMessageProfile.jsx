import React from 'react'
import { useChat } from '../useChat'

function DirectMessageProfile() {
  const { currentChat } = useChat();

  return (
    <aside
      className="w-80 flex-shrink-0 border-l border-gray-200 dark:border-white/10 bg-white dark:bg-[#111722] overflow-y-auto hidden xl:block">
      <div className="p-6 flex flex-col items-center border-b border-gray-200 dark:border-white/10">
        <div className="relative mb-4">
          <div className="bg-center bg-no-repeat bg-cover rounded-full h-24 w-24"
            data-alt="Large portrait of Sarah Miller"
            style={{ backgroundImage: `url("${currentChat?.user?.avatarUrl}")` }}>
          </div>
          <div
            className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-green-500 border-4 border-white dark:border-[#111722]">
          </div>
        </div>
        <h2 className="text-xl font-bold mb-1">{currentChat?.user?.displayName || "Unknown"}</h2>
        <p className="text-sm text-slate-500 dark:text-[#92a4c9] mb-4">{currentChat?.user?.username || "Unknown"}</p>
        <div className="flex gap-3 w-full">
          <button
            className="flex-1 flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-slate-50 dark:bg-[#232f48] hover:bg-slate-100 dark:hover:bg-[#2d3b55] transition-colors">
            <span className="material-symbols-outlined text-[20px]">person</span>
            <span className="text-xs font-medium">Profile</span>
          </button>
          <button
            className="flex-1 flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-slate-50 dark:bg-[#232f48] hover:bg-slate-100 dark:hover:bg-[#2d3b55] transition-colors">
            <span className="material-symbols-outlined text-[20px]">notifications_off</span>
            <span className="text-xs font-medium">Mute</span>
          </button>
          <button
            className="flex-1 flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-slate-50 dark:bg-[#232f48] hover:bg-slate-100 dark:hover:bg-[#2d3b55] transition-colors">
            <span className="material-symbols-outlined text-[20px]">search</span>
            <span className="text-xs font-medium">Search</span>
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3 px-2">
          <h3 className="text-sm font-bold">Shared Media</h3>
          <button className="text-xs text-primary font-medium hover:underline">View All</button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="aspect-square rounded-lg bg-cover bg-center cursor-pointer hover:opacity-80 transition-opacity"
            data-alt="Abstract gradient design"
            style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuAMrPBDmKxs3cosBWKLJlnw9fqxRzZOJp1FfvrIVGkuamec4D34W6l50oewGCdLBLEVyWnrYnQlHI_npeF4REaj_GvrAiCIiarsHQeuEx5qdPLzTqvnehrKywy6YxxGDC2wYgb5TuzZUS37l9rCPnE9E2rLYG-5nL_2I99X1SsyNy2QS8YPPqbRpBLIg3lg40phs_j19peyFUXAz7tD6zW6Ywd48_enO_Gz7XjhN18UNaCJP6IJqY4ZQdWiFoiEG9z6_3hCujW4dUw")` }}>
          </div>
          <div className="aspect-square rounded-lg bg-cover bg-center cursor-pointer hover:opacity-80 transition-opacity"
            data-alt="Minimalist architectural detail"
            style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCXrqlPZ_4K2x2Ea13hQwgJ0xb_GfjUn3RuE4CPPIqcXQeSiyJ8GTFQIJXoFMDOzuORQX8lswMWmuSmBftwxlKOFDebsBeaugG1a3y_BqpuvCn2Sb93EbqYBjm9CRJCzKFsG-p2pGFQ1vbVa5FotGPCL630bDNw8wFvB2IeVHHBX79NmA_i0IRS5Au5TrG6jSGNdey_JTNF4BLgq0eXFud4LAz2r7SU2A_nJZPhTqqMW6obmtLFcCj8EMyINE4l0df92QCVGHKaeew")` }}>
          </div>
          <div className="aspect-square rounded-lg bg-cover bg-center cursor-pointer hover:opacity-80 transition-opacity"
            data-alt="Modern workspace setup"
            style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDKrRVezsciHXFv-b_iwyHq-ezbstfZtGv79P1a9-jtow4UT_TbcjtvPv3BdWFpOoBpGqlns0n7YI5HSxzHO3c7SOTlGe5Gpv_HlMQe0NYs0dXJt10er7Rw74suR7rMMb8pecLEe18myT3c5POwQ5xTm6ndxM4OZ982mKwykyJs_38uCz4DZeduS3fmus1Nxywdj1wz2qHojg7W2ctri12DpXsbl5j3HPUNs_kBeyom4-tVwmC-WYYAR3PDbXEgOYUcNxyDj7bNBBY")` }}>
          </div>
          <div className="aspect-square rounded-lg bg-cover bg-center cursor-pointer hover:opacity-80 transition-opacity relative"
            data-alt="Blurred office background"
            style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuAVQSXwBDWwtBMPMN-K3FlI99-oq_E1qoPCGIj0Weh2CXkRqtFjxEoAY4l-2Czx_1oWcCEsG6EBL5cG8gePWqs12Y_7AYA3lDlX95DNkAwQYKZVwJiO0IKACz7MP8longtxZw_c8RPpJMSW68rtJlu758atw1KvDyOzKII80ZXhJwmlBo-_LqH5MFfZLQnwzZ5iXl6i3vmOPc68z5mdn5xZgd98zvS14iB-iooZbv_yt1lrDkw59cgAGX88TOcKYCyHcBmDyqB8L24")` }}>
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
              <span className="text-white text-xs font-bold">+12</span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-white/10">
        <h3 className="text-sm font-bold mb-3 px-2">Settings</h3>
        <div className="flex flex-col gap-1">
          <button
            className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#232f48] group transition-colors">
            <div className="flex items-center gap-3">
              <span
                className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">palette</span>
              <span className="text-sm font-medium">Theme &amp; Color</span>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-[16px]">arrow_forward_ios</span>
          </button>
          <button
            className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#232f48] group transition-colors">
            <div className="flex items-center gap-3">
              <span
                className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">lock</span>
              <span className="text-sm font-medium">Privacy &amp; Support</span>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-[16px]">arrow_forward_ios</span>
          </button>
          <button
            className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 group transition-colors mt-2">
            <div className="flex items-center gap-3">
              <span
                className="material-symbols-outlined text-red-400 group-hover:text-red-500 transition-colors">block</span>
              <span className="text-sm font-medium text-red-400 group-hover:text-red-500">Block Contact</span>
            </div>
          </button>
        </div>
      </div>
    </aside>
  )
}

export default DirectMessageProfile