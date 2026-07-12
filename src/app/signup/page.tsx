"use client"; // Required for interactive elements like buttons and alerts
import { useActionState, useEffect, useState } from "react"; // add state variable. its the primary way to manage data that changes over time in a React component. when the state changes, the component re-renders to reflect the new data.
import {motion} from "framer-motion"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {Eye, EyeOff} from "lucide-react";
import { useRouter } from "next/navigation";
import PakInchikLogo from "@/components/PakInchikLogo";
import { signup } from "../auth/actions"; // Import the signup function from the actions file


export default function Signup() {
    
const[name, setName] = useState("");
const[email, setEmail] = useState("");
const[password, setPassword] = useState("");
const[showPassword, setShowPassword] = useState(false);
const router = useRouter();
const [signupState, signupAction, isPending] = useActionState(signup, { success: false });

useEffect(() => {
  if (!signupState.success) {
    return;
  }

  alert("Please check your email and confirm your email before logging in.");
  router.push("/login");
}, [signupState.success, router]);


return (
 <div className="min-h-screen bg-radial from-[#ecb176] via-[#A67B5B] to-[#2C1810] flex items-center justify-center p-4">
  <motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{duration:0.5}}
  className="w-full max-w-md"
 >
  
<div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
  
  <div className="justify-items-center">
  <PakInchikLogo className="w-40 h-auto mb-4" />
  </div>

<div className="text-center space-y-2">
  <h1 className="text-3xl font-bold tracking-tighter">Register Now!</h1>
  <p className="text-muted-foreground">Sign up today to enjoy our benefits!</p>
</div>

<form action={signupAction} className="space-y-4">

 <div className="space-y-2">
<Label htmlFor="name">Name</Label>
<Input
id="name"
name="name"
type="text"
placeholder="...."
value={name}
onChange={(e) => setName(e.target.value)}
required
/>
  </div>

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

<Button type="submit" className="w-full" disabled={isPending}>
  {isPending ? "Signing up..." : "Sign up"}
</Button>



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
<p>Already have an account?
<a href="/login" className="text-primary-500 text-blue-600 hover:text-primary-600"> Log in</a>
</p>
</div>

</div>

  </motion.div>
 </div>
  );
}
