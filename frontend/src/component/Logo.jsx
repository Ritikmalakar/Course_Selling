
import {
  BookOpen,
  Infinity as InfinityIcon,
  Wallet,
  Headset,
  Users
} from 'lucide-react'

function Logo() {
  return (
    <div className="w-full bg-white py-8 px-4">

      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">

        {/* Courses */}
        <div className="flex items-center gap-3 justify-center">
          <BookOpen size={30} className="text-indigo-600" />
          <div>
            <h2 className="font-bold text-lg text-slate-800">20K+</h2>
            <p className="text-sm text-slate-500">Courses</p>
          </div>
        </div>

        {/* Lifetime Access */}
        <div className="flex items-center gap-3 justify-center">
          <InfinityIcon size={30} className="text-purple-600" />
          <div>
            <h2 className="font-bold text-lg text-slate-800">Lifetime</h2>
            <p className="text-sm text-slate-500">Access</p>
          </div>
        </div>

        {/* Value for Money */}
        <div className="flex items-center gap-3 justify-center">
          <Wallet size={30} className="text-green-600" />
          <div>
            <h2 className="font-bold text-lg text-slate-800">Value</h2>
            <p className="text-sm text-slate-500">For Money</p>
          </div>
        </div>

        {/* Lifetime Support */}
        <div className="flex items-center gap-3 justify-center">
          <Headset size={30} className="text-orange-500" />
          <div>
            <h2 className="font-bold text-lg text-slate-800">Lifetime</h2>
            <p className="text-sm text-slate-500">Support</p>
          </div>
        </div>

        {/* Community Support */}
        <div className="flex items-center gap-3 justify-center">
          <Users size={30} className="text-pink-600" />
          <div>
            <h2 className="font-bold text-lg text-slate-800">Community</h2>
            <p className="text-sm text-slate-500">Support</p>
          </div>
        </div>

      </div>

    </div>
  )
}

export default Logo
