"use client"; // Required for interactive elements like buttons and alerts
import { use, useState } from "react"; // add state variable. its the primary way to manage data that changes over time in a React component. when the state changes, the component re-renders to reflect the new data.
import {motion} from "framer-motion"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {Eye, EyeOff, Mail} from "lucide-react";
import { em } from "framer-motion/client";
import PakInchikLogo from "@/components/PakInchikLogo";
import { login } from "../auth/actions"; //import the login function from the actions file


export default function Login() {
const[email, setEmail] = useState("");
const[password, setPassword] = useState("");
const[showPassword, setShowPassword] = useState(false);
const[passwordType, setPasswordType] = useState('password');


return (
 <div className="min-h-dvh w-full overflow-y-auto bg-radial from-[#ecb176] via-[#A67B5B] to-[#2C1810] flex items-center justify-center px-4 py-6 sm:py-10">
  <motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{duration:0.5}}
  className="w-full max-w-md"
 >
  
<div className="bg-white rounded-2xl shadow-xl p-5 sm:p-8 space-y-4 sm:space-y-6">
  
  <div className="justify-items-center">
  <PakInchikLogo className="w-28 sm:w-40 h-auto mb-3 sm:mb-4" />
  </div>

<div className="text-center space-y-2">
  <h1 className="text-2xl sm:text-3xl font-bold tracking-tighter">Welcome back</h1>
  <p className="text-muted-foreground">Login To Enjoy Our Benefits!</p>
</div>

<form className="space-y-4">
  <div className="space-y-2">
<Label htmlFor="email">Email</Label>
<Input
id="email"
name="email"
type="email"
placeholder="test@gmail.com"
value={email}
onChange={(e) => setEmail(e.target.value)}
required
/>
  </div>
<div className="space-y-2">
<Label htmlFor="password">Password</Label>
<div className="relative">
  <Input 
  id="password"
  name="password"
  type={showPassword ? "text" : "password"}
value={password}
onChange={(e) => setPassword(e.target.value)}
required
/> 
<button
type="button"
onClick={() => setShowPassword(!showPassword)}
className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
>
{showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
</button>

</div>


</div>


<div className="flex items-center justify-between">
  <div className="flex items-center space-x-2">
    <Checkbox id="remember" />
    <Label htmlFor="remember">Remember me</Label>
  </div>


</div>

<Button type="submit" formAction={login} className="w-full">Sign in</Button>

<div className=" flex justify-center ">
<a href="#" className="text-sm text-primary-500 hover:text-primary-600">Forgot your password?</a>
</div>


</form>

{/* Wording on top of the line */}
<div className="relative">
<div className="absolute inset-0 flex items-center">
  <span className="w-full border-t"></span>
</div>
<div className="relative flex justify-center text-xs uppercase">
  <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
</div>
</div>

<Button variant="outline" className="w-full">
<img className="w-4 h-4" src="https://www.svgrepo.com/show/475656/google-color.svg" loading="lazy" alt="google logo"></img>
Google
</Button>

<div className=" flex justify-center text-center text-sm text-gray-600 mt-4">
<p>Don&apos;t have an account?
<a href="/signup" className="text-primary-500 text-blue-600 hover:text-primary-600"> Sign up</a>
</p>
</div>

</div>

  </motion.div>
 </div>
  );
}
