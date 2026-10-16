import { useCallback, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { GroupFormPage } from './pages/GroupFormPage'
import { GroupPage } from './pages/GroupPage'
import { GroupsPage } from './pages/GroupsPage'
import { MonthPage } from './pages/MonthPage'
import { StudentFormPage } from './pages/StudentFormPage'
import { WelcomePage } from './pages/WelcomePage'

const WELCOME_SEEN_KEY = 'lessons-welcome-seen'

function hasSeenWelcome(): boolean {
  try {
    return sessionStorage.getItem(WELCOME_SEEN_KEY) === '1'
  } catch {
    return false
  }
}

function HomeRoute() {
  const [started, setStarted] = useState(() => hasSeenWelcome())

  const handleStart = useCallback(() => {
    try {
      sessionStorage.setItem(WELCOME_SEEN_KEY, '1')
    } catch {
      // ignore storage errors
    }
    setStarted(true)
  }, [])

  if (!started) {
    return <WelcomePage onStart={handleStart} />
  }

  return <GroupsPage />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/groups/new" element={<GroupFormPage />} />
        <Route path="/groups/:groupId" element={<GroupPage />} />
        <Route path="/groups/:groupId/edit" element={<GroupFormPage />} />
        <Route
          path="/groups/:groupId/students/new"
          element={<StudentFormPage />}
        />
        <Route
          path="/groups/:groupId/students/:studentId"
          element={<StudentFormPage />}
        />
        <Route
          path="/groups/:groupId/month/:month"
          element={<MonthPage />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
