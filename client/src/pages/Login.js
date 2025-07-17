// pages/Login.js
import { useState } from "react";
import  Button  from "../components/ui/button";
import  Input  from "../components/ui/input";
import  Card  from "../components/ui/card";
// import   CardContent  from "../components/ui/card";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

 const handleSubmit = async (e) => {
  e.preventDefault();
  const endpoint = isSignup ? "signup" : "login";

  // Only send required fields
  const payload = isSignup
    ? { name: form.name, email: form.email, password: form.password }
    : { email: form.email, password: form.password };

  try {
    const res = await axios.post(`http://localhost:5000/api/auth/${endpoint}`, payload);

    if (!isSignup) {
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } else {
      alert("Registered successfully. Please login.");
      setIsSignup(false);
      // Reset form (optional)
      setForm({ name: "", email: "", password: "" });
    }
  } catch (error) {
    console.error("Auth Error:", error.response?.data || error.message);
    alert(error.response?.data?.error || "Something went wrong");
  }
};


  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-sm shadow-xl">
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-4">{isSignup ? "Sign Up" : "Log In"}</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignup && (
              <Input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            )}
            <Input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Button className="w-full" type="submit">
              {isSignup ? "Sign Up" : "Log In"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {isSignup ? "Already have an account?" : "New user?"}{" "}
            <span
              className="text-blue-600 cursor-pointer"
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup ? "Log In" : "Sign Up"}
            </span>
          </p>
        </div>
      </Card>
    </div>
  );
}
