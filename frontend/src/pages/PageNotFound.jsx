import React from 'react'
import { Link } from 'react-router-dom'

function PageNotFound() {
  return (
    <div className='text-white h-screen overflow-hidden flex flex-col'>
      <main
        class="w-full h-full relative overflow-hidden bg-background-light dark:bg-background-dark flex flex-col items-center justify-center">
        <div
          class="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary to-transparent opacity-50">
        </div>
        <div class="flex-1 w-full overflow-y-auto flex items-center justify-center p-6">
          <div class="max-w-xl w-full flex flex-col items-center text-center gap-8">
            <div class="relative">
              <div class="absolute -inset-4 bg-primary/20 blur-3xl rounded-full"></div>
              <div class="relative flex flex-col items-center">
                <div class="bg-center bg-no-repeat bg-cover rounded-xl w-[280px] h-[180px] shadow-2xl mb-4 grayscale opacity-80"
                  data-alt="Abstract 3D illustration of disconnected cables or floating geometric shapes representing a broken link"
                  style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDeYfV4lSxW8LGuHkfhbjsG5MqE69ud5TByr-9Zek6Aw-J5mVG8HTIq1bBT_RxxPa981segNe8gyu8Zh3j8cklU0osZ65NsHrm1a21OIhueDmApAwAAQshE2GG5KyDc73kv96LWbSp26R4bwj2omQ-enxctOd43tZQcU7TNakse7BF9bnu9FlDZzxn2mkN8TFOa640TYiHGrXgs9YoY468eQAU-g1p2a3Pmy5iNzm3C_Kufu1Mb5JOiPRuiLK6H79BRD0bc-BfeBmM')" }}>
                </div>
                <h1
                  class="text-[120px] leading-none font-black text-transparent bg-clip-text bg-linear-to-b from-slate-900 to-slate-900/10 dark:from-white dark:to-white/10 tracking-tighter select-none -mt-10 drop-shadow-lg">
                  404
                </h1>
              </div>
            </div>
            <div class="flex flex-col gap-3 max-w-md">
              <h2 class="text-2xl font-bold leading-tight">Page Not Found</h2>
              <p class="text-text-secondary text-base font-normal leading-relaxed">
                Oops! The page you are looking for might have been removed, had its name changed, or is
                temporarily unavailable.
              </p>
            </div>
            <div class="flex flex-col sm:flex-row gap-4 w-full max-w-xs justify-center">
              <Link 
              to={"/"}
              class="flex-1 flex cursor-pointer items-center justify-center rounded-lg h-11 px-6 bg-primary hover:bg-blue-600 transition-colors text-white text-sm font-bold tracking-[0.015em] shadow-lg shadow-primary/20 no-underline"
              >
                Return to Homepage
              </Link>
              {/* <a class="flex-1 flex cursor-pointer items-center justify-center rounded-lg h-11 px-6 bg-primary hover:bg-blue-600 transition-colors text-white text-sm font-bold tracking-[0.015em] shadow-lg shadow-primary/20 no-underline">
                Return to Homepage
              </a> */}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default PageNotFound