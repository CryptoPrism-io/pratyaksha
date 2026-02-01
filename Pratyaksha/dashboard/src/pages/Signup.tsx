import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"

// Redirect to login - Google sign-in handles both login and signup
export function Signup() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from || "/dashboard"

  useEffect(() => {
    navigate("/login", { state: { from }, replace: true })
  }, [navigate, from])

  return null
}
