'use client'; // ✅ Mark as Client Component

import { Button } from "@/components/ui/button";
import { CircleUserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [auth, setAuth] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data.session) {
        setAuth(true);
        setUser(data.session.user);
      } else {
        setAuth(false);
        console.log("No user is logged in", error);
      }
    };
    getSession();
  }, []);



  return (
    <div className="h-auto">
      <div className="flex justify-between m-4 items-center p-4 text-2xl bg-gradient-to-r from-gray-800 via-gray-600 to-gray-800 text-white rounded-md shadow-md">
        <div className="ml-7 ">
          <Link href="/">Analyser</Link>
        </div>

        {auth && user ? (
          <UserModelComponent user={user } setAuth={setAuth} setUser={setUser} />
        ) : (
          <div className="flex gap-4 mr-4">
            <Link href="/login"><Button>Login</Button></Link>
            <Link href="/register"><Button>Register</Button></Link>
          </div>
        )}
      </div>
    </div>
  );
}

const UserModelComponent = ({ user ,setAuth ,setUser }) => {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error);
    } else {
      setAuth(false);
      setUser(null);
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <CircleUserRound className="size-8 hover:scale-110 transition-all duration-200" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className={"text-sm font-bold"}>
          {user?.email || "Anonymous"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <Link href="/reports"><DropdownMenuItem>Reports</DropdownMenuItem></Link>
        <DropdownMenuItem>Team</DropdownMenuItem>
        <DropdownMenuItem>Subscription</DropdownMenuItem>

        <button onClick={handleLogout}><DropdownMenuItem > Log-Out</DropdownMenuItem></button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
