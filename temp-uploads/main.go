package main

import "fmt"

func main(){

	fmt.Println("Let's learn Adv functions in Go!")
	// higher order functions- those functions in which the arguments passed is also an function is called higher order function
	// First class functions: these are those functions which are passed as arguments inside the fucntions and are treated as normal variables
	// Currying: is a concept in which the return type or output of the higher order function is also an function!(used in middleware in backend dev!)
	// defer :it is an keyword used to execute something just before the function acutally return! and after the function body is executed completely or fully!
	defer fmt.Print("This happens last")
	fmt.Println("Hi")	
	fmt.Println(arithmetic(3,4,5,add))
	fmt.Println(arithmetic(5,4,3,sub))
}
func add(x,y int) int{
	return x+y
}
func sub(x,y int) int{
	return x-y
}
func arithmetic(x,y,z int,f func(int,int)int)int{  //here the arithmetic is an higher order function! and f is an first class fucntion:
	return f(x,f(y,z))
}