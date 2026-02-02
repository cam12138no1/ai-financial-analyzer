'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Bell, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import LanguageSwitcher from '@/components/language-switcher'
import { useUser } from '@/lib/user-context'

interface HeaderProps {
  user: {
    id: string
    name: string
  }
}

export default function Header({ user }: HeaderProps) {
  const t = useTranslations()
  const router = useRouter()
  const { logout } = useUser()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {t('dashboard.welcomeBack')}, {user.name}
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        <LanguageSwitcher />
        
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5 text-gray-600" />
        </Button>

        <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">ID: {user.id.slice(-8)}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleLogout}
            title="退出"
          >
            <LogOut className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </div>
    </header>
  )
}
